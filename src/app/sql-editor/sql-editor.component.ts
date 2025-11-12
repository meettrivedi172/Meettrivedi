import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { MetadataService, AppObject, Field } from '../services/metadata.service';
import { SqlParserService } from '../services/sql-parser.service';
import { QueryExecutionService, QueryExecutionResponse } from '../services/query-execution.service';
import { ToastService } from '../services/toast.service';
import { QueryManagementService, SavedQuery, QueryHistory } from '../services/query-management.service';
import { ResultsGridComponent, GridFilter, GridSort, GridGroup } from '../components/results-grid/results-grid.component';
import { SaveQueryModalComponent } from '../components/save-query-modal/save-query-modal.component';
import { SavedQueriesSidebarComponent } from '../components/saved-queries-sidebar/saved-queries-sidebar.component';
import { QueryHistorySidebarComponent } from '../components/query-history-sidebar/query-history-sidebar.component';
import { VisualQueryBuilderComponent } from '../components/visual-query-builder/visual-query-builder.component';
import { MicroeditorComponent } from '../components/microeditor/microeditor.component';
import * as monaco from 'monaco-editor';
import { SqlCompletionProvider } from './monaco-sql-provider';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
// Import SQL language support
import * as monacoSqlLanguages from 'monaco-sql-languages';
import { format } from 'sql-formatter';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';


interface QueryParameter {
  name: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'lookup';
  required: boolean;
  options?: any[];
}

interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

@Component({
  selector: 'app-sql-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ResultsGridComponent,
    SplitterModule,
    SaveQueryModalComponent,
    SavedQueriesSidebarComponent,
    QueryHistorySidebarComponent,
    VisualQueryBuilderComponent,
    MicroeditorComponent,
    MonacoEditorModule
  ],
  templateUrl: './sql-editor.component.html',
  styleUrl: './sql-editor.component.css'
})
export class SqlEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef<HTMLDivElement>;
  editorOptions = {theme: 'vs-dark', language: 'mysql', automaticLayout: true};
  code: string= 'function x() {\nconsole.log("Hello world!");\n}';
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private completionProvider: SqlCompletionProvider | null = null;
  private completionProviderDisposable: monaco.IDisposable | null = null;
  private resizeObserver?: ResizeObserver;
  private editorInitialized: boolean = false;

  activeTab: 'sql' | 'visual' | 'json' | 'microeditor' | 'mysql'= 'sql';
  sqlQuery: string = '';
  forceVisualParse: boolean = false;
  formattedQuery: string = '';
  jsonInput: string = '';
  parameters: QueryParameter[] = [];
  isExecuting: boolean = false;
  hasValidationErrors: boolean = false;
  validationErrors: ValidationError[] = [];
  showValidationErrors: boolean = false;
  validationSuccess: boolean = false;
  
  // Query execution results
  queryResults: QueryExecutionResponse | null = null;
  showResults: boolean = false;
  
  // Query Management
  showSaveQueryModal: boolean = false;
  showSavedQueriesSidebar: boolean = false;
  showQueryHistorySidebar: boolean = false;
  editingQuery: SavedQuery | null = null;
  currentQueryId: string | null = null; // Track if current query is from a saved query
  
  private queryChangeSubject = new Subject<string>();
  private schemaData: { appObjects: AppObject[] } | null = null;
  
  constructor(
    private metadataService: MetadataService,
    private sqlParserService: SqlParserService,
    private queryExecutionService: QueryExecutionService,
    private toastService: ToastService,
    private queryManagementService: QueryManagementService
  ) {}

  ngOnInit(): void {
    // Initialize with sample query
    this.sqlQuery = `-- Active Work Items Dashboard Query





    `;

    // Initialize original query
    this.originalQuery = this.sqlQuery;

    this.detectParameters();
    this.queryChangeSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      this.validateQuery(query);
    });
  }

  ngAfterViewInit(): void {
    // Load schema first
    this.loadSchemaForAutocomplete();
    
    // Initialize editor after splitter is ready
    // Use multiple checks to ensure splitter is fully rendered
    setTimeout(() => {
      this.initializeMonacoEditor();
    }, 100);
    
    // Also initialize when splitter is ready (if it takes longer)
    setTimeout(() => {
      if (!this.editorInitialized && this.editorContainer) {
        this.initializeMonacoEditor();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.completionProviderDisposable) {
      this.completionProviderDisposable.dispose();
    }
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }

  /**
   * Initialize Monaco Editor with SQL language support
   */
  private initializeMonacoEditor(): void {
    if (!this.editorContainer) {
      console.error('Editor container not found');
      return;
    }

    // Check if container has dimensions
    const containerElement = this.editorContainer.nativeElement;
    const containerRect = containerElement.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
      // Container not ready yet, try again later
      setTimeout(() => {
        this.initializeMonacoEditor();
      }, 100);
      return;
    }

    // Check if editor is already initialized
    if (this.editor) {
      // Editor already exists, just update the value and trigger layout
      // CRITICAL: Ensure language mode is maintained
      const model = this.editor.getModel();
      if (model && model.getLanguageId() !== 'sql') {
        monaco.editor.setModelLanguage(model, 'sql');
      }
      this.editor.setValue(this.sqlQuery);
      // Use setTimeout to ensure the container is rendered
      setTimeout(() => {
        this.editor?.layout();
      }, 0);
      this.editorInitialized = true;
      return;
    }

    // Register SQL language with proper support using monaco-sql-languages
    // This package provides syntax highlighting and SQL dialect support
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'sql')) {
      let sqlLanguageRegistered = false;
      
      try {
        // Check all possible exports from monaco-sql-languages
        const exports = monacoSqlLanguages as any;
        
        // Log available exports for debugging
        const exportKeys = Object.keys(exports);
        console.log('monaco-sql-languages exports:', exportKeys);
        
        // Try common export patterns
        if (typeof exports.registerSQLLanguage === 'function') {
          exports.registerSQLLanguage(monaco);
          sqlLanguageRegistered = true;
          console.log('✓ SQL language registered with registerSQLLanguage');
        } else if (typeof exports.registerLanguage === 'function') {
          exports.registerLanguage(monaco);
          sqlLanguageRegistered = true;
          console.log('✓ SQL language registered with registerLanguage');
        } else if (typeof exports.default === 'function') {
          exports.default(monaco);
          sqlLanguageRegistered = true;
          console.log('✓ SQL language registered with default export');
        } else if (typeof exports === 'function') {
          exports(monaco);
          sqlLanguageRegistered = true;
          console.log('✓ SQL language registered as function');
        } else {
          // Try accessing specific SQL language registrations
          const sqlKeys = exportKeys.filter(k => k.toLowerCase().includes('sql'));
          const registerKeys = exportKeys.filter(k => k.toLowerCase().includes('register'));
          
          console.log('SQL-related exports:', sqlKeys);
          console.log('Register-related exports:', registerKeys);
          
          // Try register functions first
          for (const key of registerKeys) {
            if (typeof exports[key] === 'function') {
              try {
                exports[key](monaco);
                sqlLanguageRegistered = true;
                console.log(`✓ SQL language registered with ${key}`);
                break;
              } catch (e) {
                console.warn(`Failed to register with ${key}:`, e);
              }
            }
          }
          
          // If still not registered, try SQL-related functions
          if (!sqlLanguageRegistered) {
            for (const key of sqlKeys) {
              if (typeof exports[key] === 'function') {
                try {
                  exports[key](monaco);
                  sqlLanguageRegistered = true;
                  console.log(`✓ SQL language registered with ${key}`);
                  break;
                } catch (e) {
                  console.warn(`Failed to register with ${key}:`, e);
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to register SQL language with monaco-sql-languages:', error);
      }
      
      // Fallback to basic registration if nothing worked
      if (!sqlLanguageRegistered) {
        monaco.languages.register({ id: 'sql' });
        
        // CRITICAL: Add basic SQL syntax highlighting manually
        monaco.languages.setMonarchTokensProvider('sql', {
          tokenizer: {
            root: [
              // SQL Keywords
              [/\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END|ASC|DESC|EXISTS|ANY|SOME)\b/i, 'keyword'],
              // Comments
              [/--.*$/, 'comment'],
              [/\/\*[\s\S]*?\*\//, 'comment'],
              // Strings
              [/'([^'\\]|\\.)*'/, 'string'],
              [/"/, 'string', '@doubleString'],
              // Numbers
              [/\d+\.?\d*/, 'number'],
              // Operators
              [/[=<>!]+/, 'operator'],
              // Identifiers (table/column names)
              [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier']
            ],
            doubleString: [
              [/[^\\"]+/, 'string'],
              [/"/, 'string', '@pop']
            ]
          }
        });
        
        // Set SQL theme colors
        monaco.editor.defineTheme('sql-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'operator', foreground: 'D4D4D4' },
            { token: 'identifier', foreground: 'D4D4D4' }
          ],
          colors: {}
        });
        
        monaco.editor.setTheme('sql-dark');
        console.log('✓ SQL language registered with basic syntax highlighting');
      }
    }
    
    // CRITICAL: Always ensure SQL language is set on the model
    // This must be done AFTER editor creation
    setTimeout(() => {
      if (this.editor) {
        const model = this.editor.getModel();
        if (model) {
          if (model.getLanguageId() !== 'sql') {
            monaco.editor.setModelLanguage(model, 'sql');
            console.log('[SQL Editor] Language set to SQL');
          }
        }
      }
    }, 0);

    // Create Monaco Editor instance
    this.editor = monaco.editor.create(containerElement, {
      value: this.sqlQuery,
      language: 'sql',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      cursorStyle: 'line',
      wordWrap: 'on',
      formatOnPaste: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,  // SSMS-like: Show suggestions as you type
        comments: false,
        strings: false
      },
      // CRITICAL: Enable suggestions on all characters, not just trigger characters
      suggest: {
        showKeywords: true,
        showSnippets: true
      },
      quickSuggestionsDelay: 0,  // Instant suggestions - show immediately on typing
      suggestSelection: 'first',
      wordBasedSuggestions: 'allDocuments',
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      snippetSuggestions: 'inline',
      tabSize: 2,
      insertSpaces: true
    });

    // CRITICAL: Trigger suggestions on every keystroke (including after backspace)
    // This ensures suggestions appear immediately when typing
    this.editor.onKeyDown((e) => {
      // Trigger suggestions on any character key or backspace
      const isCharacterKey = e.keyCode >= 48 && e.keyCode <= 90; // A-Z, 0-9
      const isBackspace = e.keyCode === monaco.KeyCode.Backspace;
      const isDelete = e.keyCode === monaco.KeyCode.Delete;
      
      if (isCharacterKey || isBackspace || isDelete) {
        // Small delay to let the character be inserted/deleted first
        setTimeout(() => {
          if (this.editor) {
            // Only trigger if user is typing (not if suggestions are already showing)
            const position = this.editor.getPosition();
            if (position) {
              const currentLine = this.editor.getModel()?.getLineContent(position.lineNumber) || '';
              const lineBeforeCursor = currentLine.substring(0, position.column - 1);
              const hasWord = /(\w+)$/.test(lineBeforeCursor);
              
              // Trigger suggestions if there's a word being typed (1+ chars)
              // This ensures suggestions appear immediately, even for single characters
              const wordMatch = lineBeforeCursor.match(/(\w+)$/);
              if (wordMatch && wordMatch[1] && wordMatch[1].length >= 1) {
                this.editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
              }
            }
          }
        }, 10);
      }
    });

    // Listen to editor content changes
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor?.getValue() || '';
      this.sqlQuery = value;
      this.onQueryChange();
    });

    // Initialize completion provider - ALWAYS register to ensure it's active
    // CRITICAL: Dispose old provider if exists to avoid duplicates
    if (this.completionProviderDisposable) {
      this.completionProviderDisposable.dispose();
    }
    
    // Always create new provider to ensure it's fresh
    this.completionProvider = new SqlCompletionProvider([]);
    this.completionProviderDisposable = monaco.languages.registerCompletionItemProvider('sql', this.completionProvider);
    console.log('[SQL Editor] Completion provider registered');

    // Set up ResizeObserver to handle splitter resize events
    this.resizeObserver = new ResizeObserver(() => {
      if (this.editor) {
        setTimeout(() => {
          this.editor?.layout();
        }, 0);
      }
    });
    this.resizeObserver.observe(containerElement);

    // Set up drag and drop handlers
    if (containerElement) {
      containerElement.addEventListener('dragenter', this.onDragEnter.bind(this));
      containerElement.addEventListener('dragover', this.onDragOver.bind(this));
      containerElement.addEventListener('drop', this.onDrop.bind(this));
      containerElement.addEventListener('dragleave', this.onDragLeave.bind(this));
    }

    this.editorInitialized = true;
    
    // Force layout after a short delay to ensure splitter is fully rendered
    setTimeout(() => {
      if (this.editor) {
        this.editor.layout();
      }
    }, 50);
  }

  /**
   * Load schema data and update autocomplete provider
   */
  private loadSchemaForAutocomplete(): void {
    this.metadataService.getSchema().subscribe({
      next: (schema) => {
        this.schemaData = schema;
        const tableNames = schema.appObjects.map(obj => obj.name);
        const schemaMap = new Map<string, string[]>();

        // Build table -> fields mapping
        schema.appObjects.forEach(appObject => {
          const fieldNames = appObject.fields.map(field => field.name);
          schemaMap.set(appObject.name.toLowerCase(), fieldNames);
        });

        // Update completion provider
        if (this.completionProvider) {
          this.completionProvider.updateTables(tableNames);
          this.completionProvider.updateSchema(schemaMap);
        }
      },
      error: (error) => {
        console.error('Error loading schema for autocomplete:', error);
      }
    });
  }

  onQueryChange(): void {
    // Sync Monaco editor value if it changed externally (but not from visual builder)
    // Visual builder updates are handled separately to avoid conflicts
    if (this.editor && this.activeTab === 'sql') {
      const editorValue = this.editor.getValue();
      if (editorValue !== this.sqlQuery) {
        // Only update if the change came from SQL editor itself, not from visual builder
        // Check if we're currently on SQL tab to avoid updating when visual builder changes SQL
        // CRITICAL: Ensure language mode is maintained when updating
        const model = this.editor.getModel();
        if (model && model.getLanguageId() !== 'sql') {
          monaco.editor.setModelLanguage(model, 'sql');
        }
        this.editor.setValue(this.sqlQuery);
      }
    }
    
    // If query is manually changed (not from grid update), update original query
    if (!this.isUpdatingFromGrid) {
      // Check if this is a significant change (not just grid filter update)
      // We'll update original query when user manually edits
      const currentValue = this.editor?.getValue() || this.sqlQuery;
      if (currentValue !== this.originalQuery && !this.isUpdatingFromGrid) {
        // Only update if it's a substantial change (not just grid modifications)
        // This helps distinguish between user edits and grid updates
        const hasGridFilters = this.currentGridFilters.length > 0 || 
                               this.currentGridSorts.length > 0 || 
                               this.currentGridGroups.length > 0;
        
        // If no grid modifications, update original query
        if (!hasGridFilters) {
          this.originalQuery = currentValue;
        }
      }
    }
    
    this.detectParameters();
    this.hasValidationErrors = false;
    this.validationErrors = [];
    this.showValidationErrors = false;
    this.validationSuccess = false;
    this.queryChangeSubject.next(this.sqlQuery);
  }

  detectParameters(): void {
    const paramRegex = /@(\w+)/g;
    const matches = Array.from(this.sqlQuery.matchAll(paramRegex));
    const uniqueParams = [...new Set(matches.map(m => m[1]))];
    
    this.parameters = uniqueParams.map(paramName => ({
      name: paramName,
      value: this.getParameterValue(paramName),
      type: this.detectParameterType(paramName),
      required: true,
      options: []
    }));
  }

  getParameterValue(name: string): any {
    const existing = this.parameters.find(p => p.name === name);
    return existing?.value || '';
  }

  detectParameterType(paramName: string): 'text' | 'number' | 'date' | 'lookup' {
    const lowerName = paramName.toLowerCase();
    
    if (lowerName.includes('id')) return 'lookup';
    if (lowerName.includes('date')) return 'date';
    if (lowerName.includes('count') || lowerName.includes('amount') || lowerName.includes('priority')) return 'number';
    
    return 'text';
  }

  validateQuery(query: string): void {
    this.validationErrors = [];
    
    // Basic validation
    if (!query.trim()) {
      this.hasValidationErrors = false;
      this.validationErrors = [];
      return;
    }

    try {
      // Validate SQL syntax structure
      this.validateSqlStructure(query);
      
      // Validate using parser service
      try {
        const parsedQuery = this.sqlParserService.parseQuery(query);
        this.validateParsedQuery(query, parsedQuery);
      } catch (parseError: any) {
        this.validationErrors.push({
          message: `SQL Parse Error: ${parseError.message || 'Failed to parse query'}`,
          severity: 'error'
        });
      }
      
      // Validate against schema if available
      if (this.schemaData) {
        this.validateAgainstSchema(query);
      }
    } catch (error: any) {
      this.validationErrors.push({
        message: `Validation Error: ${error.message || 'Unknown validation error'}`,
        severity: 'error'
      });
    }
    
    this.hasValidationErrors = this.validationErrors.length > 0;
  }

  private validateSqlStructure(query: string): void {
    const upperQuery = query.toUpperCase();
    
    // Check for SELECT statement
    if (!upperQuery.includes('SELECT')) {
      this.validationErrors.push({
        message: 'Missing SELECT statement',
        severity: 'error'
      });
      return;
    }
    
    // Check for FROM clause
    if (!upperQuery.includes('FROM')) {
      this.validationErrors.push({
        message: 'Missing FROM clause',
        severity: 'error'
      });
    }
    
    // Check for text after semicolon (invalid trailing text)
    const semicolonIndex = query.lastIndexOf(';');
    if (semicolonIndex !== -1 && semicolonIndex < query.length - 1) {
      const textAfterSemicolon = query.substring(semicolonIndex + 1).trim();
      // Check if text after semicolon is not a comment or whitespace
      if (textAfterSemicolon && !textAfterSemicolon.startsWith('--') && !textAfterSemicolon.startsWith('/*')) {
        // Remove comments to check for actual invalid text
        const cleanedText = textAfterSemicolon
          .replace(/--.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .trim();
        
        if (cleanedText) {
          this.validationErrors.push({
            message: `Invalid text after semicolon: "${cleanedText.substring(0, 20)}${cleanedText.length > 20 ? '...' : ''}"`,
            severity: 'error'
          });
        }
      }
    }
    
    // Check for balanced parentheses
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      this.validationErrors.push({
        message: `Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`,
        severity: 'error'
      });
    }
    
    // Check for balanced quotes
    const singleQuotes = (query.match(/'/g) || []).length;
    const doubleQuotes = (query.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      this.validationErrors.push({
        message: 'Unbalanced single quotes',
        severity: 'error'
      });
    }
    if (doubleQuotes % 2 !== 0) {
      this.validationErrors.push({
        message: 'Unbalanced double quotes',
        severity: 'error'
      });
    }
    
    // Check for JOIN without ON
    const joinMatches = query.match(/(INNER|LEFT|RIGHT|FULL)?\s+JOIN/gi);
    if (joinMatches) {
      const onMatches = query.match(/\bON\b/gi);
      if (!onMatches || onMatches.length < joinMatches.length) {
        this.validationErrors.push({
          message: 'JOIN statement(s) missing ON clause',
          severity: 'error'
        });
      }
    }
    
    // Check for GROUP BY without aggregate functions (warning)
    if (upperQuery.includes('GROUP BY')) {
      const aggregateFunctions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'GROUP_CONCAT'];
      const hasAggregate = aggregateFunctions.some(func => upperQuery.includes(func));
      if (!hasAggregate) {
        this.validationErrors.push({
          message: 'GROUP BY used without aggregate functions (COUNT, SUM, AVG, etc.)',
          severity: 'warning'
        });
      }
    }
    
    // Validate table aliases - check if all referenced table aliases exist
    this.validateTableAliases(query);
  }
  
  private validateTableAliases(query: string): void {
    // Extract defined table aliases from FROM and JOIN clauses
    const definedAliases = new Set<string>();
    
    // Extract FROM table and alias: FROM table [AS] alias or FROM table
    // Pattern: FROM tableName [AS] alias or FROM tableName
    // Handle: FROM table alias, FROM table AS alias, or FROM table
    const fromMatch = query.match(/FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i);
    if (fromMatch) {
      const tableName = fromMatch[1];
      const alias = fromMatch[2];
      if (alias) {
        definedAliases.add(alias.toLowerCase());
        // Also allow table name to be used
        definedAliases.add(tableName.toLowerCase());
      } else {
        // If no alias specified, table name itself can be used
        definedAliases.add(tableName.toLowerCase());
      }
    }
    
    // Extract JOIN tables and aliases: JOIN table [AS] alias or JOIN table
    const joinPattern = /(?:INNER|LEFT|RIGHT|FULL)?\s+JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    let joinMatch;
    while ((joinMatch = joinPattern.exec(query)) !== null) {
      const tableName = joinMatch[1];
      const alias = joinMatch[2];
      if (alias) {
        definedAliases.add(alias.toLowerCase());
        definedAliases.add(tableName.toLowerCase());
      } else {
        definedAliases.add(tableName.toLowerCase());
      }
    }
    
    // Extract all table aliases used in the query (table.field pattern)
    // But exclude from SELECT clause parsing - focus on field references
    const aliasPattern = /\b(\w+)\.(\w+)\b/gi;
    const usedAliases = new Set<string>();
    let aliasMatch;
    while ((aliasMatch = aliasPattern.exec(query)) !== null) {
      const tableAlias = aliasMatch[1].toLowerCase();
      const fieldName = aliasMatch[2].toLowerCase();
      
      // Skip SQL keywords that might match the pattern
      const sqlKeywords = ['select', 'from', 'where', 'join', 'inner', 'left', 'right', 'full', 
                           'on', 'group', 'order', 'by', 'having', 'limit', 'and', 'or', 'as'];
      if (!sqlKeywords.includes(tableAlias)) {
        // Also skip if it's clearly not a table.field pattern (e.g., in SELECT COUNT(x.id))
        usedAliases.add(tableAlias);
      }
    }
    
    // Check if all used aliases are defined
    usedAliases.forEach(alias => {
      if (!definedAliases.has(alias)) {
        this.validationErrors.push({
          message: `Table alias '${alias}' is referenced but not defined in FROM or JOIN clause`,
          severity: 'error'
        });
      }
    });
  }

  private validateParsedQuery(originalQuery: string, parsedQuery: any): void {
    // Validate SELECT fields
    if (!parsedQuery.SelectedFields || parsedQuery.SelectedFields.length === 0) {
      this.validationErrors.push({
        message: 'No fields selected in SELECT statement',
        severity: 'error'
      });
    }
    
    // Validate JOINs if present
    if (parsedQuery.Joins && parsedQuery.Joins.length > 0) {
      parsedQuery.Joins.forEach((join: any, index: number) => {
        if (!join.LeftField || !join.RightField) {
          this.validationErrors.push({
            message: `JOIN ${index + 1}: Missing join fields`,
            severity: 'error'
          });
        }
      });
    }
    
    // Validate WHERE clause filters if present
    if (parsedQuery.WhereClause && parsedQuery.WhereClause.Filters) {
      parsedQuery.WhereClause.Filters.forEach((filter: any, index: number) => {
        if (!filter.FieldName) {
          this.validationErrors.push({
            message: `Filter ${index + 1} in WHERE clause: Missing field name`,
            severity: 'error'
          });
        }
        if (filter.Operator && !filter.Value && filter.Operator !== 10 && filter.Operator !== 11) {
          // IS NULL (10) and IS NOT NULL (11) don't need values
          this.validationErrors.push({
            message: `Filter ${index + 1}: Operator requires a value but none provided`,
            severity: 'error'
          });
        }
      });
    }
    
    // Validate GROUP BY fields
    if (parsedQuery.GroupBy && parsedQuery.GroupBy.length > 0) {
      if (!parsedQuery.SelectedFields || parsedQuery.SelectedFields.length === 0) {
        this.validationErrors.push({
          message: 'GROUP BY cannot be used without SELECT fields',
          severity: 'error'
        });
      }
    }
  }

  private validateAgainstSchema(query: string): void {
    if (!this.schemaData) return;
    
    const tableMap = new Map<string, AppObject>();
    this.schemaData.appObjects.forEach(obj => {
      tableMap.set(obj.name.toLowerCase(), obj);
    });
    
    // Extract table names from FROM and JOIN clauses
    const fromMatch = query.match(/FROM\s+(\w+)/i);
    const joinMatches = Array.from(query.matchAll(/(?:INNER|LEFT|RIGHT|FULL)?\s+JOIN\s+(\w+)/gi));
    
    // Validate FROM table
    if (fromMatch) {
      const tableName = fromMatch[1].toLowerCase();
      if (!tableMap.has(tableName)) {
        this.validationErrors.push({
          message: `Table '${fromMatch[1]}' not found in database schema`,
          severity: 'error'
        });
      }
    }
    
    // Validate JOIN tables
    joinMatches.forEach(match => {
      const tableName = match[1].toLowerCase();
      if (!tableMap.has(tableName)) {
        this.validationErrors.push({
          message: `Table '${match[1]}' in JOIN clause not found in database schema`,
          severity: 'error'
        });
      }
    });
    
    // Extract and validate field names (basic check)
    const fieldMatches = Array.from(query.matchAll(/\b(\w+)\.(\w+)\b/gi));
    fieldMatches.forEach(match => {
      const tableName = match[1].toLowerCase();
      const fieldName = match[2].toLowerCase();
      
      const table = tableMap.get(tableName);
      if (table) {
        const fieldExists = table.fields.some(f => f.name.toLowerCase() === fieldName);
        if (!fieldExists) {
          this.validationErrors.push({
            message: `Field '${match[2]}' not found in table '${match[1]}'`,
            severity: 'error'
          });
        }
      }
    });
    
    // Validate fields without table prefix (check in main FROM table)
    if (fromMatch) {
      const mainTable = tableMap.get(fromMatch[1].toLowerCase());
      if (mainTable) {
        // Extract simple field names (not table.field)
        const simpleFieldMatches = Array.from(query.matchAll(/\b(?<!\.)(\w+)\b/gi));
        // This is a basic check - might have false positives
        // Could be enhanced to be more accurate
      }
    }
  }

  formatQuery(): void {
    try {
      // Use sql-formatter library for professional SQL formatting
      const formatted = format(this.sqlQuery, {
        language: 'sql',
        tabWidth: 4, // Number of spaces for indentation
        keywordCase: 'upper', // Uppercase SQL keywords
        linesBetweenQueries: 2 // Number of line breaks between queries
      });
      
      this.sqlQuery = formatted;
      // Update Monaco editor
      if (this.editor) {
        this.editor.setValue(formatted);
      }
      this.onQueryChange();
    } catch (error) {
      console.error('Error formatting SQL query:', error);
      // Fallback to original query if formatting fails
      this.toastService.error('Failed to format SQL query. Please check your SQL syntax.');
    }
  }

  executeQuery(): void {
    // Validate query before execution
    if (this.hasValidationErrors) {
      this.toastService.error('Please fix validation errors before executing', 'Validation Error');
      return;
    }

    if (!this.validateParameters()) {
      this.toastService.error('Please fill in all required parameters', 'Parameter Error');
      return;
    }

    if (!this.sqlQuery.trim()) {
      this.toastService.warning('Please enter a SQL query to execute', 'Empty Query');
      return;
    }

    // Update original query when executing (to capture user's base query)
    this.originalQuery = this.sqlQuery;
    
    this.isExecuting = true;
    this.queryResults = null;
    this.showResults = false;
    
    // Prepare parameters object
    const paramsObj: { [key: string]: any } = {};
    this.parameters.forEach(param => {
      if (param.value !== null && param.value !== undefined && param.value !== '') {
        paramsObj[param.name] = param.value;
      }
    });

    // Get QueryJson for history
    let queryJson: any = null;
    try {
      queryJson = this.sqlParserService.sqlToJson(this.sqlQuery);
    } catch (error) {
      console.warn('Failed to generate QueryJson for history:', error);
    }

    const startTime = Date.now();

    // Call query execution service with SQL parser for QueryJson conversion
    // FOR PRODUCTION: The API call code is in QueryExecutionService
    // Currently using mock data for development
    this.queryExecutionService.executeQuery(this.sqlQuery, paramsObj, this.sqlParserService).subscribe({
      next: (response: QueryExecutionResponse) => {
        this.isExecuting = false;
        this.queryResults = response;
        this.showResults = true;
        
        const executionTime = (Date.now() - startTime) / 1000;
        
        // Record in query history
        this.queryManagementService.addToHistory({
          sqlText: this.sqlQuery,
          queryJson: queryJson,
          parameterValues: Object.keys(paramsObj).length > 0 ? paramsObj : undefined,
          status: response.success ? 'success' : 'error',
          executionTime: response.metadata.executionTime || executionTime,
          rowCount: response.metadata.rowCount || 0,
          errorMessage: response.error,
          savedQueryId: this.currentQueryId || undefined
        }).subscribe();

        // Update saved query stats if this was from a saved query
        if (this.currentQueryId && response.success) {
          this.queryManagementService.recordQueryExecution(
            this.currentQueryId,
            response.metadata.executionTime || executionTime,
            true
          );
        }
        
        // CRITICAL: After query execution, ensure completion provider and syntax highlighting are active
        if (this.editor) {
          setTimeout(() => {
            // Ensure model language is SQL (for syntax highlighting)
            const model = this.editor?.getModel();
            if (model) {
              const currentLanguage = model.getLanguageId();
              if (currentLanguage !== 'sql') {
                monaco.editor.setModelLanguage(model, 'sql');
                console.log('[SQL Editor] Language reset to SQL after query execution');
              }
              
              // Syntax highlighting will refresh automatically when language is set
              // No need to force refresh - Monaco handles it
            }
            
            // Update completion provider with latest schema
            if (this.completionProvider && this.schemaData) {
              const tableNames = this.schemaData.appObjects.map(obj => obj.name);
              const schemaMap = new Map<string, string[]>();
              this.schemaData.appObjects.forEach(appObject => {
                const fieldNames = appObject.fields.map(field => field.name);
                schemaMap.set(appObject.name.toLowerCase(), fieldNames);
              });
              this.completionProvider.updateTables(tableNames);
              this.completionProvider.updateSchema(schemaMap);
              console.log('[SQL Editor] Completion provider refreshed after query execution');
            }
          }, 100);
        }
        
        if (response.success) {
          this.toastService.success(
            `Query executed successfully: ${response.metadata.rowCount} rows in ${response.metadata.executionTime}s`,
            'Success'
          );
          console.log('Query executed successfully:', response);
        } else {
          this.toastService.error(
            response.error || 'Query execution failed',
            'Execution Error'
          );
        }
      },
      error: (error) => {
        this.isExecuting = false;
        const errorMessage = error.message || 'Unknown error occurred';
        const executionTime = (Date.now() - startTime) / 1000;
        
        // Record failed execution in history
        this.queryManagementService.addToHistory({
          sqlText: this.sqlQuery,
          queryJson: queryJson,
          parameterValues: Object.keys(paramsObj).length > 0 ? paramsObj : undefined,
          status: 'error',
          executionTime: executionTime,
          rowCount: 0,
          errorMessage: errorMessage,
          savedQueryId: this.currentQueryId || undefined
        }).subscribe();
        
        this.toastService.error(
          `Error executing query: ${errorMessage}`,
          'Network Error'
        );
        this.queryResults = {
          success: false,
          data: [],
          metadata: {
            rowCount: 0,
            executionTime: 0,
            hasMore: false
          },
          error: errorMessage
        };
        this.showResults = true;
      }
    });
  }

  validateQueryOnly(): void {
    this.validateQuery(this.sqlQuery);
    this.showValidationErrors = true;
    this.validationSuccess = !this.hasValidationErrors && this.validationErrors.length === 0;
    
    // Scroll to validation errors if they exist
    if (this.hasValidationErrors && this.validationErrors.length > 0) {
      setTimeout(() => {
        const errorPanel = document.querySelector('.validation-errors-panel');
        if (errorPanel) {
          errorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  dismissValidationErrors(): void {
    this.showValidationErrors = false;
    this.validationSuccess = false;
  }

  dismissResults(): void {
    this.showResults = false;
  }

  getResultColumns(): string[] {
    if (!this.queryResults || !this.queryResults.data || this.queryResults.data.length === 0) {
      return [];
    }
    return Object.keys(this.queryResults.data[0]);
  }

  // Grid-to-SQL Synchronization
  private currentGridFilters: GridFilter[] = [];
  private currentGridSorts: GridSort[] = [];
  private currentGridGroups: GridGroup[] = [];
  private isUpdatingFromGrid: boolean = false; // Prevent circular updates
  private originalQuery: string = ''; // Store original query without grid modifications
  private parsedOriginalQuery: any = null; // Cache parsed original query structure
  private parsedOriginalQueryBase: string = ''; // Track base query string used for cache

  onGridFilterChange(filters: GridFilter[]): void {
    debugger
    this.currentGridFilters = filters;
    this.updateSQLFromGrid();
  }

  onGridSortChange(sorts: GridSort[]): void {
    this.currentGridSorts = sorts;
    this.updateSQLFromGrid();
  }

  onGridGroupChange(groups: GridGroup[]): void {
    console.log('Grid group change received:', groups);
    console.log('Group fields:', groups.map(g => g.field).join(', '));
    console.log('Groups array length:', groups.length);
    this.currentGridGroups = groups;
    console.log('Current grid groups set to:', this.currentGridGroups);
    this.updateSQLFromGrid();
  }

  onSQLUpdateRequested(): void {
    debugger
    this.updateSQLFromGrid();
  }

  private updateSQLFromGrid(): void {
    if (this.isUpdatingFromGrid || !this.sqlQuery.trim()) {
      return;
    }

    // Execute immediately for instant updates
    this.isUpdatingFromGrid = true;
    
    try {
      // Store original query if not already stored
      // This should be the base query without any grid modifications
      if (!this.originalQuery || this.originalQuery === '') {
        this.originalQuery = this.sqlQuery;
      }
      
      // If originalQuery is still empty, use current query
      const baseQuery = this.originalQuery || this.sqlQuery;
      if (!baseQuery.trim()) {
        return;
      }
      
      // Parse original SQL (without grid modifications) with caching to avoid repeated parsing
      let parsedQuery: any;
      if (this.parsedOriginalQuery && this.parsedOriginalQueryBase === baseQuery) {
        parsedQuery = this.parsedOriginalQuery;
      } else {
        parsedQuery = this.sqlParserService.parseQuery(baseQuery);
        this.parsedOriginalQuery = parsedQuery;
        this.parsedOriginalQueryBase = baseQuery;
      }
      
      // Build new SQL query with grid filters/sorts/groups
      let newQuery = this.buildSQLFromParsedQuery(parsedQuery, baseQuery);
      
      // Update the query if it changed
      if (newQuery !== this.sqlQuery) {
        this.sqlQuery = newQuery;
        
        // Update Monaco editor immediately
        if (this.editor) {
          // CRITICAL: Ensure language mode is maintained
          const model = this.editor.getModel();
          if (model && model.getLanguageId() !== 'sql') {
            monaco.editor.setModelLanguage(model, 'sql');
          }
          this.editor.setValue(newQuery);
        }
        
        // Trigger change detection (but don't update originalQuery here)
        // Skip the onQueryChange logic that might update originalQuery
        this.detectParameters();
        this.queryChangeSubject.next(this.sqlQuery);
        
        // Format query asynchronously to avoid blocking immediate update
        setTimeout(() => {
          this.formatQuery();
        }, 0);
        
        console.log('SQL updated from grid filters/sorts/groups');
      }
    } catch (error) {
      console.error('Error updating SQL from grid:', error);
    } finally {
      this.isUpdatingFromGrid = false;
    }
  }

  private buildSQLFromParsedQuery(parsedQuery: any, baseQuery: string): string {
    let sql = '';
    
    // Query name comment
    if (parsedQuery.QueryName) {
      sql += `-- ${parsedQuery.QueryName}\n`;
    }
    
    // SELECT clause
    sql += 'SELECT\n';
    if (parsedQuery.SelectedFields && parsedQuery.SelectedFields.length > 0) {
      sql += '    ' + parsedQuery.SelectedFields.join(',\n    ') + '\n';
    } else {
      sql += '    *\n';
    }
    
    // FROM clause (extract from base query)
    const fromMatch = baseQuery.match(/FROM\s+([^\s]+(?:\s+(?:AS\s+)?\w+)?)/i);
    if (fromMatch) {
      sql += 'FROM ' + fromMatch[1] + '\n';
    }
    
    // JOIN clauses (preserve from base query)
    const joinMatches = baseQuery.match(/((?:INNER|LEFT|RIGHT|FULL)?\s+JOIN\s+[^\s]+(?:\s+(?:AS\s+)?\w+)?\s+ON\s+[^\s]+\s*=\s*[^\s]+)/gi);
    if (joinMatches) {
      joinMatches.forEach(join => {
        sql += join + '\n';
      });
    }
    
    // WHERE clause - combine original filters with grid filters (avoid duplicates)
    const whereConditions: string[] = [];
    const addedFields = new Map<string, string>(); // Track fields and their conditions to avoid duplicates
    
    // First, add original WHERE filters (from base query, not grid-applied)
    // Only add fields that are NOT in grid filters (grid filters will override)
    if (parsedQuery.WhereClause && parsedQuery.WhereClause.Filters) {
      parsedQuery.WhereClause.Filters.forEach((filter: any) => {
        const fieldName = filter.FieldName?.toLowerCase().trim();
        if (fieldName) {
          // Check if this field has a grid filter - if yes, skip original filter
          const hasGridFilter = this.currentGridFilters.some(gf => 
            gf.field?.toLowerCase().trim() === fieldName
          );
          
          if (!hasGridFilter) {
            const condition = this.buildFilterCondition(filter);
            if (condition) {
              // Normalize field name for comparison
              const normalizedField = fieldName;
              if (!addedFields.has(normalizedField)) {
                whereConditions.push(condition);
                addedFields.set(normalizedField, condition);
              }
            }
          }
        }
      });
    }
    
    // Then add grid filters (one per field, latest value wins)
    // Use a Map to ensure only one filter per field
    const gridFiltersByField = new Map<string, GridFilter>();
    this.currentGridFilters.forEach(filter => {
      if (filter.field) {
        const normalizedField = filter.field.toLowerCase().trim();
        gridFiltersByField.set(normalizedField, filter);
      }
    });
    
    // Add grid filter conditions
    gridFiltersByField.forEach(filter => {
      const condition = this.buildGridFilterCondition(filter);
      if (condition) {
        const normalizedField = filter.field.toLowerCase().trim();
        // Remove any existing condition for this field
        const existingIndex = whereConditions.findIndex(cond => 
          cond.toLowerCase().startsWith(normalizedField + ' ')
        );
        if (existingIndex >= 0) {
          whereConditions.splice(existingIndex, 1);
        }
        whereConditions.push(condition);
        addedFields.set(normalizedField, condition);
      }
    });
    
    // Only add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      sql += 'WHERE ' + whereConditions.join(' AND ') + '\n';
    }
    
    // GROUP BY clause - use only grid groups (grid grouping overrides original query GROUP BY)
    const groupByFields: string[] = [];
    const addedGroupFields = new Set<string>();
    
    // Only add GROUP BY if there are grid groups
    // Grid groups override any original GROUP BY from the query
    console.log('Processing currentGridGroups:', this.currentGridGroups);
    console.log('currentGridGroups length:', this.currentGridGroups.length);
    
    if (this.currentGridGroups && this.currentGridGroups.length > 0) {
      // Add grid groups only
      this.currentGridGroups.forEach(group => {
        console.log('Processing group:', group);
        if (group && group.field) {
          const normalized = group.field.trim().toLowerCase();
          if (!addedGroupFields.has(normalized)) {
            groupByFields.push(group.field.trim());
            addedGroupFields.add(normalized);
            console.log('Added to groupByFields:', group.field.trim());
          }
        }
      });
    } else {
      // No grid groups - check if we should include original query GROUP BY
      // For now, we'll only use grid groups, so if grid groups are empty, no GROUP BY
      console.log('No grid groups - GROUP BY will be omitted');
    }
    
    console.log('Final groupByFields:', groupByFields);
    
    // Only add GROUP BY clause if there are fields to group by
    if (groupByFields.length > 0) {
      sql += 'GROUP BY ' + groupByFields.join(', ') + '\n';
      console.log('GROUP BY clause added to SQL:', groupByFields.join(', '));
      console.log('SQL so far:', sql);
    } else {
      console.log('No GROUP BY fields - GROUP BY clause omitted');
    }
    
    // ORDER BY clause - use grid sorts if available, otherwise use existing
    const orderByFields: string[] = [];
    const addedSortFields = new Set<string>();
    
    if (this.currentGridSorts.length > 0) {
      this.currentGridSorts.forEach(sort => {
        const normalized = sort.field.trim().toLowerCase();
        if (!addedSortFields.has(normalized)) {
          orderByFields.push(sort.field + ' ' + (sort.direction === 'desc' ? 'DESC' : 'ASC'));
          addedSortFields.add(normalized);
        }
      });
    } else if (parsedQuery.Sort && parsedQuery.Sort.length > 0) {
      parsedQuery.Sort.forEach((sort: any) => {
        const normalized = sort.FieldName.trim().toLowerCase();
        if (!addedSortFields.has(normalized)) {
          orderByFields.push(sort.FieldName + ' ' + sort.Direction);
          addedSortFields.add(normalized);
        }
      });
    }
    
    if (orderByFields.length > 0) {
      sql += 'ORDER BY ' + orderByFields.join(', ') + '\n';
    }
    
    // LIMIT clause (preserve from base query)
    const limitMatch = baseQuery.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      sql += 'LIMIT ' + limitMatch[1] + '\n';
    }
    
    return sql.trim();
  }

  private buildFilterCondition(filter: any): string {
    if (!filter.FieldName) return '';
    
    const fieldName = filter.FieldName;
    const operator = this.getSQLOperator(filter.Operator);
    let value = filter.Value;
    
    // Handle parameter values
    if (filter.ValueType === 2 && value.startsWith('@')) {
      return `${fieldName} ${operator} ${value}`;
    }
    
    // Handle NULL checks
    if (filter.Operator === 10) {
      return `${fieldName} IS NULL`;
    }
    if (filter.Operator === 11) {
      return `${fieldName} IS NOT NULL`;
    }
    
    // Handle string values - add quotes if needed
    if (typeof value === 'string' && !value.startsWith("'") && !value.startsWith('"') && !value.startsWith('@')) {
      value = `'${value}'`;
    }
    
    return `${fieldName} ${operator} ${value}`;
  }

  private buildGridFilterCondition(filter: GridFilter): string {
    if (!filter.field || !filter.value) return '';
    
    const fieldName = filter.field;
    const operator = filter.operator || 'contains';
    let value = filter.value;
    
    // Map grid operators to SQL operators
    let sqlOperator = '=';
    switch (operator.toLowerCase()) {
      case 'contains':
      case 'startswith':
      case 'endswith':
        sqlOperator = 'LIKE';
        if (operator === 'contains') {
          value = `'%${value}%'`;
        } else if (operator === 'startswith') {
          value = `'${value}%'`;
        } else if (operator === 'endswith') {
          value = `'%${value}'`;
        }
        break;
      case 'equal':
        sqlOperator = '=';
        value = typeof value === 'string' ? `'${value}'` : value;
        break;
      case 'notequal':
        sqlOperator = '!=';
        value = typeof value === 'string' ? `'${value}'` : value;
        break;
      case 'greaterthan':
        sqlOperator = '>';
        break;
      case 'lessthan':
        sqlOperator = '<';
        break;
      case 'greaterthanorequal':
        sqlOperator = '>=';
        break;
      case 'lessthanorequal':
        sqlOperator = '<=';
        break;
      default:
        sqlOperator = 'LIKE';
        value = `'%${value}%'`;
    }
    
    return `${fieldName} ${sqlOperator} ${value}`;
  }

  private getSQLOperator(operatorNumber: number): string {
    const operatorMap: { [key: number]: string } = {
      1: '=',
      2: '!=',
      3: '>',
      4: '>=',
      5: '<',
      6: '<=',
      7: 'LIKE',
      8: 'IN',
      9: 'NOT IN',
      10: 'IS NULL',
      11: 'IS NOT NULL'
    };
    return operatorMap[operatorNumber] || '=';
  }

  validateParameters(): boolean {
    return this.parameters.every(p => {
      if (!p.required) return true;
      return p.value !== null && p.value !== undefined && p.value !== '';
    });
  }

  clearEditor(): void {
    if (confirm('Are you sure you want to clear the editor?')) {
      this.sqlQuery = '';
      this.parameters = [];
      this.hasValidationErrors = false;
      if (this.editor) {
        this.editor.setValue('');
      }
    }
  }

  onTabChange(tab: 'sql' | 'visual' | 'json' | 'microeditor'): void {
    this.activeTab = tab;
    
    if (tab === 'sql') {
      // When switching back to SQL tab, ensure Monaco Editor is initialized and shows current SQL
      setTimeout(() => {
        if (!this.editorInitialized || !this.editor) {
          this.initializeMonacoEditor();
        } else {
          // Editor exists - update with current SQL and layout
          if (this.editor) {
            const currentValue = this.editor.getValue();
            // Only update if SQL query has changed (to avoid losing cursor position unnecessarily)
            if (currentValue !== this.sqlQuery) {
              this.editor.setValue(this.sqlQuery);
              // Move cursor to end of query for better UX
              const lineCount = this.editor.getModel()?.getLineCount() || 1;
              this.editor.setPosition({ lineNumber: lineCount, column: 1 });
            }
            // Always refresh layout when switching tabs
            setTimeout(() => {
              this.editor?.layout();
            }, 0);
          }
        }
      }, 50);
    }
    
    if (tab === 'visual') {
      // When switching to Visual Builder, trigger parsing
      // Toggle forceParse to trigger ngOnChanges in the visual builder
      this.forceVisualParse = !this.forceVisualParse;
    }
    
    if (tab === 'json') {
      // Generate JSON representation in the format: QueryObjectID, ResultField_AppfieldIds, WhereClause, etc.
      try {
        const jsonQuery = this.sqlParserService.sqlToJson(this.sqlQuery);
        this.jsonInput = JSON.stringify(jsonQuery, null, 2);
        this.formattedQuery = '';
      } catch (error: any) {
        this.jsonInput = '';
        this.formattedQuery = `Error converting SQL to JSON: ${error.message}`;
      }
    }
    
    // microeditor tab doesn't need special handling - it's a standalone component
  }

  onVisualBuilderSQLChange(newSQL: string): void {
    // Update SQL query from visual builder (debounced by 300ms in the component)
    if (newSQL !== this.sqlQuery) {
      this.sqlQuery = newSQL;
      
      // Update Monaco editor if it exists
      if (this.editor) {
        // Only update if value is different to avoid cursor position loss
        const currentValue = this.editor.getValue();
        if (currentValue !== newSQL) {
          // Save cursor position
          const position = this.editor.getPosition();
          this.editor.setValue(newSQL);
          // Restore cursor position if possible, otherwise move to end
          if (position) {
            const lineCount = this.editor.getModel()?.getLineCount() || 1;
            if (position.lineNumber <= lineCount) {
              this.editor.setPosition(position);
            } else {
              this.editor.setPosition({ lineNumber: lineCount, column: 1 });
            }
          }
          // Refresh layout
          setTimeout(() => {
            this.editor?.layout();
          }, 0);
        }
      }
      
      // Trigger change detection (but don't update editor again to avoid loop)
      this.detectParameters();
      // Don't call onQueryChange() here as it might trigger editor update again
      // Just update the query change subject for validation
      this.queryChangeSubject.next(this.sqlQuery);
    }
  }

  onVisualBuilderWarning(warning: string): void {
    // Show warning toast when visual builder encounters parsing issues
    if (warning) {
      this.toastService.warning(warning, 'Visual Builder Warning');
    }
  }

  // Drag and Drop handlers
  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const data = event.dataTransfer?.getData('text/plain');
    if (data && this.editor) {
      const position = this.editor.getPosition();
      if (position) {
        // Handle table drops (TABLE: prefix) and field drops
        const insertText = data.startsWith('TABLE:') 
          ? data.substring(6) // Remove TABLE: prefix
          : data;
        
        // Insert text at cursor position
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );
        
        const op = { range, text: insertText + ' ' };
        this.editor.executeEdits('drop-insert', [op]);
        
        // Move cursor after inserted text
        const newPosition = new monaco.Position(
          position.lineNumber,
          position.column + insertText.length + 1
        );
        this.editor.setPosition(newPosition);
        this.editor.focus();
      }
    }
  }

  onParameterChange(param: QueryParameter): void {
    // Handle parameter value changes
    console.log('Parameter changed:', param);
  }

  getLineAndColumn(): string {
    if (!this.editor) return '';
    
    const position = this.editor.getPosition();
    if (!position) return '';
    
    return `Ln ${position.lineNumber}, Col ${position.column}`;
  }

  /**
   * Convert JSON query object to SQL and update the SQL editor
   */
  convertJsonToSql(): void {
    if (!this.jsonInput || this.jsonInput.trim() === '') {
      this.toastService.warning('Please paste a JSON query object', 'No JSON Input');
      return;
    }

    try {
      const jsonQuery = JSON.parse(this.jsonInput);
      const sqlQuery = this.sqlParserService.jsonToSql(jsonQuery);
      
      // Update SQL query
      this.sqlQuery = sqlQuery;
      
      // Update Monaco editor
      if (this.editor) {
        // CRITICAL: Ensure language mode is maintained
        const model = this.editor.getModel();
        if (model && model.getLanguageId() !== 'sql') {
          monaco.editor.setModelLanguage(model, 'sql');
        }
        this.editor.setValue(sqlQuery);
      }
      
      // Update formatted query display
      this.formattedQuery = sqlQuery;
      
      // Trigger change detection
      this.onQueryChange();
      
      // Switch to SQL tab to show the converted query
      this.activeTab = 'sql';
      
      this.toastService.success('JSON converted to SQL successfully', 'Conversion Success');
    } catch (error: any) {
      this.toastService.error(`Error converting JSON to SQL: ${error.message}`, 'Conversion Error');
      this.formattedQuery = `Error: ${error.message}`;
    }
  }

  /**
   * Load JSON representation from current SQL query
   */
  loadJsonFromSql(): void {
    try {
      const jsonQuery = this.sqlParserService.sqlToJson(this.sqlQuery);
      this.jsonInput = JSON.stringify(jsonQuery, null, 2);
      this.formattedQuery = '';
      this.toastService.success('JSON loaded from SQL successfully', 'Load Success');
    } catch (error: any) {
      this.toastService.error(`Error loading JSON from SQL: ${error.message}`, 'Load Error');
      this.jsonInput = '';
      this.formattedQuery = `Error: ${error.message}`;
    }
  }

  // ==================== QUERY MANAGEMENT METHODS ====================

  openSaveQueryModal(): void {
    // Check if we're editing an existing query
    if (this.currentQueryId) {
      this.queryManagementService.getSavedQuery(this.currentQueryId).subscribe(query => {
        if (query) {
          this.editingQuery = query;
        }
        this.showSaveQueryModal = true;
      });
    } else {
      this.editingQuery = null;
      this.showSaveQueryModal = true;
    }
  }

  closeSaveQueryModal(): void {
    this.showSaveQueryModal = false;
    this.editingQuery = null;
  }

  onSaveQuery(queryData: Omit<SavedQuery, 'id' | 'createdTimestamp' | 'updatedTimestamp' | 'executionCount' | 'isFavorite'>): void {
    if (this.editingQuery) {
      // Update existing query
      this.queryManagementService.updateQuery(this.editingQuery.id, queryData).subscribe({
        next: (updatedQuery) => {
          this.toastService.success(`Query "${updatedQuery.name}" updated successfully`, 'Success');
          this.currentQueryId = updatedQuery.id;
          this.closeSaveQueryModal();
        },
        error: (error) => {
          this.toastService.error('Failed to update query', 'Error');
          console.error('Error updating query:', error);
        }
      });
    } else {
      // Save new query
      this.queryManagementService.saveQuery(queryData).subscribe({
        next: (savedQuery) => {
          this.toastService.success(`Query "${savedQuery.name}" saved successfully`, 'Success');
          this.currentQueryId = savedQuery.id;
          this.closeSaveQueryModal();
        },
        error: (error) => {
          this.toastService.error('Failed to save query', 'Error');
          console.error('Error saving query:', error);
        }
      });
    }
  }

  openSavedQueriesSidebar(): void {
    this.showSavedQueriesSidebar = true;
  }

  closeSavedQueriesSidebar(): void {
    this.showSavedQueriesSidebar = false;
  }

  onLoadSavedQuery(query: SavedQuery): void {
    // Load SQL
    this.sqlQuery = query.sqlText;
    if (this.editor) {
      // CRITICAL: Ensure language mode is maintained
      const model = this.editor.getModel();
      if (model && model.getLanguageId() !== 'sql') {
        monaco.editor.setModelLanguage(model, 'sql');
      }
      this.editor.setValue(query.sqlText);
    }

    // Update original query
    this.originalQuery = query.sqlText;

    // Trigger change detection (this will detect parameters)
    this.onQueryChange();

    // Load parameters if available (after detection)
    if (query.parameterValues) {
      setTimeout(() => {
        this.parameters.forEach(param => {
          if (query.parameterValues && query.parameterValues[param.name] !== undefined) {
            param.value = query.parameterValues[param.name];
          }
        });
      }, 0);
    }

    // Set current query ID
    this.currentQueryId = query.id;

    // Close sidebar
    this.closeSavedQueriesSidebar();

    // Show toast
    this.toastService.success(`Query loaded: ${query.name}`, 'Query Loaded');
  }

  onEditSavedQuery(query: SavedQuery): void {
    // Load the query first
    this.onLoadSavedQuery(query);
    // Then open the save modal in edit mode
    this.editingQuery = query;
    this.showSaveQueryModal = true;
  }

  openQueryHistorySidebar(): void {
    this.showQueryHistorySidebar = true;
  }

  closeQueryHistorySidebar(): void {
    this.showQueryHistorySidebar = false;
  }

  onLoadQueryFromHistory(historyItem: QueryHistory): void {
    // Load SQL
    this.sqlQuery = historyItem.sqlText;
    if (this.editor) {
      // CRITICAL: Ensure language mode is maintained
      const model = this.editor.getModel();
      if (model && model.getLanguageId() !== 'sql') {
        monaco.editor.setModelLanguage(model, 'sql');
      }
      this.editor.setValue(historyItem.sqlText);
    }

    // Update original query
    this.originalQuery = historyItem.sqlText;

    // Trigger change detection (this will detect parameters)
    this.onQueryChange();

    // Load parameters if available (after detection)
    if (historyItem.parameterValues) {
      setTimeout(() => {
        this.parameters.forEach(param => {
          if (historyItem.parameterValues && historyItem.parameterValues[param.name] !== undefined) {
            param.value = historyItem.parameterValues[param.name];
          }
        });
      }, 0);
    }

    // Set current query ID if it was from a saved query
    this.currentQueryId = historyItem.savedQueryId || null;

    // Close sidebar
    this.closeQueryHistorySidebar();

    // Show toast
    this.toastService.success('Query loaded from history', 'Query Loaded');
  }

  getQueryJson(): any {
    try {
      return this.sqlParserService.sqlToJson(this.sqlQuery);
    } catch (error) {
      return null;
    }
  }

  getParameterValues(): { [key: string]: any } {
    const paramsObj: { [key: string]: any } = {};
    this.parameters.forEach(param => {
      if (param.value !== null && param.value !== undefined && param.value !== '') {
        paramsObj[param.name] = param.value;
      }
    });
    return paramsObj;
  }
}
