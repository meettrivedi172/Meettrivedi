import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { Subject, debounceTime } from 'rxjs';
import * as monaco from 'monaco-editor';
import { SqlCompletionProvider } from '../../sql-editor/monaco-sql-provider';
import { MetadataService, AppObject, Field } from '../../services/metadata.service';
import { SqlParserService } from '../../services/sql-parser.service';
import { QueryExecutionService, QueryExecutionResponse } from '../../services/query-execution.service';
import { ToastService } from '../../services/toast.service';
import { ResultsGridComponent, GridFilter, GridSort, GridGroup } from '../results-grid/results-grid.component';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';
import { format } from 'sql-formatter';

interface QueryParameter {
  name: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'lookup';
  required: boolean;
}

interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

@Component({
  selector: 'app-microeditor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MonacoEditorModule,
    ResultsGridComponent,
    SplitterModule
  ],
  templateUrl: './microeditor.component.html',
  styleUrl: './microeditor.component.css'
})
export class MicroeditorComponent implements OnInit, OnDestroy {
  code: string = '';
  enableSuggestions: boolean = true; // Enable suggestions by default (like SQL editor)
  
  editorOptions: any = {
    theme: 'sql-dark',
    language: 'sql', // Use 'sql' to match SQL editor (which works)
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    fontFamily: 'Monaco, Consolas, monospace',
    wordWrap: 'on',
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    cursorStyle: 'line',
    autoIndent: 'full',
    formatOnPaste: true,
    suggestOnTriggerCharacters: true, // Enable by default
    quickSuggestions: {
      other: true,  // SSMS-like: Show suggestions as you type
      comments: false,
      strings: false
    },
    quickSuggestionsDelay: 0,  // Instant suggestions
    suggestSelection: 'first',
    wordBasedSuggestions: 'allDocuments',
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    snippetSuggestions: 'inline',
    tabCompletion: 'on',
    suggest: {
      showKeywords: true,
      showSnippets: true
    }
  };

  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private completionProvider: SqlCompletionProvider | null = null;
  private completionProviderDisposable: monaco.IDisposable | null = null;
  private validationDisposable: monaco.IDisposable | null = null;
  private parameterDecorationIds: string[] = [];
  private resizeObserver?: ResizeObserver;
  
  parameters: QueryParameter[] = [];
  validationErrors: ValidationError[] = [];
  showValidationErrors: boolean = false;
  validationSuccess: boolean = false;
  showParameters: boolean = false;
  
  // Query execution results
  queryResults: QueryExecutionResponse | null = null;
  showResults: boolean = false;
  isExecuting: boolean = false;
  
  // Grid synchronization
  private currentGridFilters: GridFilter[] = [];
  private currentGridSorts: GridSort[] = [];
  private currentGridGroups: GridGroup[] = [];
  private isUpdatingFromGrid: boolean = false;
  private originalQuery: string = '';
  
  // Manual suggestions dropdown
  showSuggestionsDropdown: boolean = false;
  suggestions: Array<{label: string, kind: string, description?: string}> = [];
  selectedSuggestionIndex: number = 0;
  suggestionPosition: {top: number, left: number} = {top: 0, left: 0};
  currentWord: string = '';
  currentWordStart: {line: number, column: number} = {line: 1, column: 1};
  
  private codeChangeSubject = new Subject<string>();
  private schemaData: { appObjects: AppObject[] } | null = null;
  private suggestionOverlay?: HTMLElement;
  private aliasToTableMap: Map<string, string> = new Map(); // alias -> tableName (lowercase)
  private tabPressCount: number = 0;
  private tabPressTimer: any = null;

  constructor(
    private metadataService: MetadataService,
    private sqlParserService: SqlParserService,
    private queryExecutionService: QueryExecutionService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    // Debounce code changes for validation
    this.codeChangeSubject.pipe(debounceTime(500)).subscribe(() => {
      this.validateCode();
      this.detectParameters();
    });
  }

  ngOnInit(): void {
    // Register custom theme
    this.registerCustomTheme();
    // Schema will be loaded in onEditorInit or after editor is ready
  }

  ngOnDestroy(): void {
    if (this.completionProviderDisposable) {
      this.completionProviderDisposable.dispose();
    }
    if (this.validationDisposable) {
      this.validationDisposable.dispose();
    }
    if (this.editor && this.parameterDecorationIds.length > 0) {
      this.editor.deltaDecorations(this.parameterDecorationIds, []);
      this.parameterDecorationIds = [];
    }
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.codeChangeSubject.complete();
  }

  private loadSchemaData(): void {
    // Use subscribe like SQL editor does (not async/await)
    this.metadataService.getSchema().subscribe({
      next: (schema) => {
        this.schemaData = schema;
        console.log('[Microeditor] Schema data loaded:', schema.appObjects?.length || 0, 'tables');
        
        // Build table -> fields mapping (EXACTLY like SQL editor)
        const tableNames = schema.appObjects.map(obj => obj.name);
        const schemaMap = new Map<string, string[]>();
        
        schema.appObjects.forEach(appObject => {
          const fieldNames = appObject.fields.map(field => field.name);
          schemaMap.set(appObject.name.toLowerCase(), fieldNames);
        });
        
        console.log('[Microeditor] Table names:', tableNames.slice(0, 5));
        console.log('[Microeditor] Schema map size:', schemaMap.size);
        
        // Update completion provider (EXACTLY like SQL editor)
        if (this.completionProvider) {
          this.completionProvider.updateTables(tableNames);
          this.completionProvider.updateSchema(schemaMap);
          console.log('[Microeditor] ✓ Completion provider updated with schema data');
        } else {
          console.warn('[Microeditor] Completion provider not ready yet, will update when ready');
        }
      },
      error: (error) => {
        console.error('[Microeditor] Error loading schema data:', error);
      }
    });
  }

  onEditorInit(event: any): void {
    console.log('[Microeditor] Editor init event received:', event);
    
    // The onInit event from ngx-monaco-editor-v2 emits the editor instance
    // Check if event is the editor directly or if it has an editor property
    this.editor = (event && typeof event.getValue === 'function') ? event : (event?.editor || event);
    
    if (!this.editor) {
      console.error('[Microeditor] Editor instance not available');
      return;
    }
    
    console.log('[Microeditor] Editor instance obtained:', !!this.editor);
    
    // CRITICAL: Ensure language mode is 'sql' (like SQL editor uses)
    const model = this.editor.getModel();
    if (model) {
      const currentLang = model.getLanguageId();
      console.log('[Microeditor] Current language:', currentLang);
      // Use 'sql' language to match SQL editor (which works)
      if (currentLang !== 'sql') {
        monaco.editor.setModelLanguage(model, 'sql');
        console.log('[Microeditor] Language changed to SQL');
      }
    } else {
      console.warn('[Microeditor] Model not available yet');
    }
    
    // Setup completion provider FIRST (EXACTLY like SQL editor)
    this.setupCompletionProvider();
    
    // Load schema data and update provider (EXACTLY like SQL editor)
    this.loadSchemaData();

    // Setup validation
    this.setupValidation();

    // Setup parameter highlighting
    this.setupParameterHighlighting();

    // Setup keyboard triggers for suggestions (always active, like SQL editor)
    this.setupSuggestionTriggers();

    // Listen to code changes
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor?.getValue() || '';
      this.code = value;
      this.codeChangeSubject.next(value);
      
      // Check for suggestions on every change (with small delay to let character be inserted)
      if (this.enableSuggestions) {
        setTimeout(() => {
          this.checkForSuggestions();
        }, 50);
      }
    });
    
    // Listen to cursor position changes
    this.editor.onDidChangeCursorPosition(() => {
      if (this.enableSuggestions) {
        this.checkForSuggestions();
      }
    });
    
    // Listen to keyboard events for manual suggestion control
    this.editor.onKeyDown((e) => {
      if (this.showSuggestionsDropdown && this.suggestions.length > 0) {
        // Check for arrow keys - try multiple possible key codes
        const isDownArrow = e.keyCode === monaco.KeyCode.DownArrow || 
                           e.keyCode === 40 || 
                           e.browserEvent?.key === 'ArrowDown' ||
                           e.browserEvent?.keyCode === 40;
        const isUpArrow = e.keyCode === monaco.KeyCode.UpArrow || 
                         e.keyCode === 38 || 
                         e.browserEvent?.key === 'ArrowUp' ||
                         e.browserEvent?.keyCode === 38;
        
        if (isDownArrow) {
          e.preventDefault();
          e.stopPropagation();
          const newIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1);
          this.selectedSuggestionIndex = newIndex;
          this.updateSuggestionPosition();
          console.log('[Microeditor] Arrow Down - Selected index:', this.selectedSuggestionIndex);
          return;
        } else if (isUpArrow) {
          e.preventDefault();
          e.stopPropagation();
          const newIndex = Math.max(this.selectedSuggestionIndex - 1, 0);
          this.selectedSuggestionIndex = newIndex;
          this.updateSuggestionPosition();
          console.log('[Microeditor] Arrow Up - Selected index:', this.selectedSuggestionIndex);
          return;
        } else if (e.keyCode === monaco.KeyCode.Enter) {
          // Shift+Enter always creates new line (even when suggestions are showing)
          if (e.browserEvent?.shiftKey) {
            // Allow normal Enter behavior - create new line
            this.hideSuggestions();
            return; // Don't prevent default, let Monaco handle it
          }
          
          // Normal Enter - insert selected suggestion if available
          if (this.suggestions[this.selectedSuggestionIndex]) {
            e.preventDefault();
            e.stopPropagation();
            this.insertSuggestion(this.suggestions[this.selectedSuggestionIndex]);
          } else {
            // No suggestion selected, hide dropdown and create new line
            this.hideSuggestions();
            // Don't prevent default - let Enter create new line
          }
          return;
        } else if (e.keyCode === monaco.KeyCode.Tab) {
          // Tab when suggestions are showing
          e.preventDefault();
          e.stopPropagation();
          
          // Track Tab presses
          this.tabPressCount++;
          
          // Clear previous timer
          if (this.tabPressTimer) {
            clearTimeout(this.tabPressTimer);
          }
          
          // If Tab pressed 2+ times, close suggestions immediately
          if (this.tabPressCount >= 2) {
            this.tabPressCount = 0;
            if (this.tabPressTimer) {
              clearTimeout(this.tabPressTimer);
              this.tabPressTimer = null;
            }
            this.hideSuggestions();
            console.log('[Microeditor] Tab pressed 2+ times - closing suggestions immediately');
            return;
          }
          
          // First Tab press - insert selected suggestion
          if (this.suggestions[this.selectedSuggestionIndex]) {
            this.insertSuggestion(this.suggestions[this.selectedSuggestionIndex]);
          } else {
            // No suggestion selected, just hide
            this.hideSuggestions();
          }
          
          // Reset counter after 300ms (shorter delay for immediate response)
          this.tabPressTimer = setTimeout(() => {
            this.tabPressCount = 0;
          }, 300);
          
          return;
        } else if (e.keyCode === monaco.KeyCode.Escape) {
          e.preventDefault();
          e.stopPropagation();
          this.hideSuggestions();
          return;
        }
      } else if (e.keyCode === monaco.KeyCode.Space && e.ctrlKey) {
        // Ctrl+Space to show suggestions
        e.preventDefault();
        e.stopPropagation();
        this.checkForSuggestions();
        return;
      }
    });
    
    console.log('[Microeditor] Editor initialization complete');
  }

  private setupSuggestionTriggers(): void {
    if (!this.editor) return;

    // CRITICAL: Trigger suggestions on every keystroke
    // This ensures suggestions appear immediately when typing
    this.editor.onKeyDown((e) => {
      if (!this.enableSuggestions) return;
      
      // Trigger suggestions on any character key, backspace, delete, or space
      const isCharacterKey = e.keyCode >= 48 && e.keyCode <= 90; // A-Z, 0-9
      const isBackspace = e.keyCode === monaco.KeyCode.Backspace;
      const isDelete = e.keyCode === monaco.KeyCode.Delete;
      const isSpace = e.keyCode === monaco.KeyCode.Space;
      const isDot = e.browserEvent?.key === '.' || e.browserEvent?.keyCode === 190;
      
      // Don't trigger if arrow keys (handled separately) or Enter/Escape (for insertion/navigation)
      // Tab is handled separately above
      const isNavigationKey = e.keyCode === monaco.KeyCode.UpArrow || 
                             e.keyCode === monaco.KeyCode.DownArrow ||
                             e.keyCode === monaco.KeyCode.Enter ||
                             e.keyCode === monaco.KeyCode.Escape;
      
      // Trigger suggestions on ANY character key, space, dot, backspace, delete
      // This ensures suggestions appear immediately when typing
      if ((isCharacterKey || isBackspace || isDelete || isSpace || isDot) && !isNavigationKey) {
        // Small delay to let the character be inserted/deleted first
        setTimeout(() => {
          if (this.editor && this.enableSuggestions) {
            // Always check for suggestions when typing ANY character
            this.checkForSuggestions();
          }
        }, 50);
      }
    });
  }

  toggleSuggestions(): void {
    this.enableSuggestions = !this.enableSuggestions;
    
    // Update editorOptions object
    this.editorOptions.suggestOnTriggerCharacters = this.enableSuggestions;
    this.editorOptions.quickSuggestions = this.enableSuggestions ? {
      other: true,
      comments: true,
      strings: false
    } : false;
    this.editorOptions.wordBasedSuggestions = this.enableSuggestions ? 'allDocuments' : 'off';
    this.editorOptions.acceptSuggestionOnCommitCharacter = this.enableSuggestions;
    this.editorOptions.acceptSuggestionOnEnter = this.enableSuggestions ? 'on' : 'off';
    this.editorOptions.snippetSuggestions = this.enableSuggestions ? 'inline' : 'none';
    this.editorOptions.tabCompletion = this.enableSuggestions ? 'on' : 'off';
    
    if (this.editor) {
      // Update editor options
      this.editor.updateOptions({
        suggestOnTriggerCharacters: this.enableSuggestions,
        quickSuggestions: this.enableSuggestions ? {
          other: true,
          comments: true,
          strings: false
        } : false,
        wordBasedSuggestions: this.enableSuggestions ? 'allDocuments' : 'off',
        acceptSuggestionOnCommitCharacter: this.enableSuggestions,
        acceptSuggestionOnEnter: this.enableSuggestions ? 'on' : 'off',
        snippetSuggestions: this.enableSuggestions ? 'inline' : 'none',
        tabCompletion: this.enableSuggestions ? 'on' : 'off'
      });
    }
  }

  private registerCustomTheme(): void {
    // Define custom SQL theme with specified colors
    try {
      monaco.editor.defineTheme('sql-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' }, // Purple/Blue for keywords
        { token: 'function', foreground: 'fbbf24' }, // Yellow for functions
        { token: 'parameter', foreground: 'fb923c' }, // Orange for parameters
        { token: 'string', foreground: '10b981' }, // Green for strings
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' }, // Gray for comments
        { token: 'number', foreground: 'b5cea8' },
        { token: 'operator', foreground: 'd4d4d4' },
        { token: 'identifier', foreground: 'd4d4d4' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#2a2d2e'
      }
      });
    } catch (error) {
      // Theme might already be defined, that's okay
      console.log('Theme sql-dark already defined or error:', error);
    }
  }

  private setupCompletionProvider(): void {
    console.log('[Microeditor] Setting up completion provider...');
    
    // Dispose old provider if exists (EXACTLY like SQL editor)
    if (this.completionProviderDisposable) {
      this.completionProviderDisposable.dispose();
      this.completionProviderDisposable = null;
    }
    
    // CRITICAL: Create provider with empty tables first (like SQL editor does)
    // Schema will be updated later via updateCompletionProvider()
    this.completionProvider = new SqlCompletionProvider([], new Map());
    console.log('[Microeditor] Completion provider created (empty, will be updated with schema)');
    
    // Register for 'sql' language FIRST (like SQL editor)
    this.completionProviderDisposable = monaco.languages.registerCompletionItemProvider('sql', this.completionProvider);
    console.log('[Microeditor] ✓ Completion provider registered for SQL language');
    
    // Also register for 'mysql' language as backup
    try {
      const mysqlDisposable = monaco.languages.registerCompletionItemProvider('mysql', this.completionProvider);
      // Store both disposables
      const sqlDisposable = this.completionProviderDisposable;
      this.completionProviderDisposable = {
        dispose: () => {
          sqlDisposable.dispose();
          mysqlDisposable.dispose();
        }
      };
      console.log('[Microeditor] ✓ Also registered for MySQL language');
    } catch (error) {
      console.warn('[Microeditor] MySQL registration failed (SQL should still work):', error);
    }
    
    console.log('[Microeditor] Completion provider setup complete');
  }


  private setupValidation(): void {
    if (!this.editor) return;

    this.validationDisposable = this.editor.onDidChangeModelContent(() => {
      // Validation is triggered by codeChangeSubject debounce
    });
  }

  private validateCode(): void {
    if (!this.editor || !this.code.trim()) {
      this.validationErrors = [];
      this.clearValidationMarkers();
      return;
    }

    const errors: ValidationError[] = [];
    const model = this.editor.getModel();
    if (!model) return;

    try {
      // Basic syntax validation using sql-parser
      try {
        const parsed = this.sqlParserService.parseQuery(this.code);
      } catch (parseError: any) {
        // If parsing fails, it's a syntax error
        errors.push({
          message: `SQL Syntax Error: ${parseError.message || 'Invalid SQL syntax'}`,
          severity: 'error'
        });
      }
      
      // Check for SELECT * warning
      if (this.code.toUpperCase().includes('SELECT *')) {
        const selectStarMatch = this.code.match(/SELECT\s+\*/i);
        if (selectStarMatch) {
          const lineNumber = model.getLineCount();
          errors.push({
            message: 'Warning: Using SELECT * is not recommended. Specify column names explicitly.',
            line: lineNumber,
            severity: 'warning'
          });
        }
      }

      // Validate against schema if available
      if (this.schemaData && this.schemaData.appObjects) {
        // Extract table names from query
        const tableNameRegex = /\bFROM\s+(\w+)/gi;
        const matches = Array.from(this.code.matchAll(tableNameRegex));
        
        matches.forEach(match => {
          const tableName = match[1].toLowerCase();
          const exists = this.schemaData!.appObjects.some(
            obj => obj.name.toLowerCase() === tableName
          );
          
          if (!exists) {
            try {
              const lineNumber = model.getPositionAt(match.index || 0).lineNumber;
              errors.push({
                message: `Table '${match[1]}' does not exist in schema`,
                line: lineNumber,
                severity: 'error'
              });
            } catch (posError) {
              // If we can't get position, just add error without line number
              errors.push({
                message: `Table '${match[1]}' does not exist in schema`,
                severity: 'error'
              });
            }
          }
        });
      }
    } catch (error: any) {
      // General error
      errors.push({
        message: `Validation Error: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    }

    this.validationErrors = errors;
    this.updateValidationMarkers(errors);
  }

  private clearValidationMarkers(): void {
    if (!this.editor) return;
    const model = this.editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, 'validation', []);
    }
  }

  private updateValidationMarkers(errors: ValidationError[]): void {
    if (!this.editor) return;
    const model = this.editor.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = errors.map(error => ({
      severity: error.severity === 'error' 
        ? monaco.MarkerSeverity.Error 
        : monaco.MarkerSeverity.Warning,
      message: error.message,
      startLineNumber: error.line || 1,
      startColumn: error.column || 1,
      endLineNumber: error.line || 1,
      endColumn: error.column || model.getLineMaxColumn(error.line || 1)
    }));

    monaco.editor.setModelMarkers(model, 'validation', markers);
  }

  private setupParameterHighlighting(): void {
    if (!this.editor) return;

    const updateParameterMarkers = () => {
      if (!this.editor) return;
      const model = this.editor.getModel();
      if (!model) return;

      const paramRegex = /@(\w+)/g;
      const text = model.getValue();
      const matches = Array.from(text.matchAll(paramRegex));
      
      const decorations: monaco.editor.IModelDeltaDecoration[] = matches.map(match => {
        const position = model.getPositionAt(match.index || 0);
        const endPosition = model.getPositionAt((match.index || 0) + match[0].length);
        
        return {
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            endPosition.lineNumber,
            endPosition.column
          ),
          options: {
            inlineClassName: 'parameter-highlight',
            hoverMessage: { value: `Parameter: ${match[1]}` }
          }
        };
      });

      this.parameterDecorationIds = this.editor.deltaDecorations(this.parameterDecorationIds, decorations);
    };

    this.editor.onDidChangeModelContent(() => {
      updateParameterMarkers();
    });

    updateParameterMarkers();
  }

  private detectParameters(): void {
    const paramRegex = /@(\w+)/g;
    const matches = Array.from(this.code.matchAll(paramRegex));
    const uniqueParams = [...new Set(matches.map(m => m[1]))];
    
    this.parameters = uniqueParams.map(paramName => ({
      name: paramName,
      value: null,
      type: 'text' as const,
      required: true
    }));

    this.showParameters = this.parameters.length > 0;
  }

  formatQuery(): void {
    if (!this.editor || !this.code.trim()) {
      return;
    }

    try {
      const formatted = format(this.code, {
        language: 'mysql', // Use 'mysql' to match language mode
        keywordCase: 'upper',
        tabWidth: 4 // 4 spaces for indentation
      });

      this.editor.setValue(formatted);
      this.code = formatted;
      
      // Move cursor to end
      const lineCount = this.editor.getModel()?.getLineCount() || 1;
      this.editor.setPosition({ lineNumber: lineCount, column: 1 });
    } catch (error: any) {
      console.error('Formatting error:', error);
      this.toastService.error('Failed to format SQL query. Please check your SQL syntax.', 'Format Error');
    }
  }

  validateQueryOnly(): void {
    this.validateCode();
    this.showValidationErrors = true;
    this.validationSuccess = !this.hasErrors() && this.validationErrors.length === 0;
    
    // Scroll to validation errors if they exist
    if (this.hasErrors() && this.validationErrors.length > 0) {
      setTimeout(() => {
        const errorPanel = document.querySelector('.validation-errors-panel');
        if (errorPanel) {
          errorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  executeQuery(): void {
    // Validate query before execution
    if (this.hasErrors()) {
      this.toastService.error('Please fix validation errors before executing', 'Validation Error');
      return;
    }

    if (!this.validateParameters()) {
      this.toastService.error('Please fill in all required parameters', 'Parameter Error');
      return;
    }

    if (!this.code.trim()) {
      this.toastService.warning('Please enter a SQL query to execute', 'Empty Query');
      return;
    }

    // Update original query when executing (to capture user's base query)
    this.originalQuery = this.code;
    
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
      queryJson = this.sqlParserService.sqlToJson(this.code);
    } catch (error) {
      console.warn('Failed to generate QueryJson for history:', error);
    }

    const startTime = Date.now();

    // Call query execution service with SQL parser for QueryJson conversion
    this.queryExecutionService.executeQuery(this.code, paramsObj, this.sqlParserService).subscribe({
      next: (response: QueryExecutionResponse) => {
        this.isExecuting = false;
        this.queryResults = response;
        this.showResults = true;
        
        const executionTime = (Date.now() - startTime) / 1000;
        
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

  validateParameters(): boolean {
    return this.parameters.every(p => {
      if (!p.required) return true;
      return p.value !== null && p.value !== undefined && p.value !== '';
    });
  }

  getResultColumns(): string[] {
    if (!this.queryResults || !this.queryResults.data || this.queryResults.data.length === 0) {
      return [];
    }
    return Object.keys(this.queryResults.data[0]);
  }

  // Grid-to-SQL Synchronization
  onGridFilterChange(filters: GridFilter[]): void {
    this.currentGridFilters = filters;
    this.updateSQLFromGrid();
  }

  onGridSortChange(sorts: GridSort[]): void {
    this.currentGridSorts = sorts;
    this.updateSQLFromGrid();
  }

  onGridGroupChange(groups: GridGroup[]): void {
    this.currentGridGroups = groups;
    this.updateSQLFromGrid();
  }

  onSQLUpdateRequested(): void {
    this.updateSQLFromGrid();
  }

  private updateSQLFromGrid(): void {
    if (this.isUpdatingFromGrid || !this.code.trim()) {
      return;
    }

    this.isUpdatingFromGrid = true;
    
    try {
      // Store original query if not already stored
      if (!this.originalQuery || this.originalQuery === '') {
        this.originalQuery = this.code;
      }
      
      const baseQuery = this.originalQuery || this.code;
      if (!baseQuery.trim()) {
        return;
      }
      
      // Parse original SQL
      const parsedQuery = this.sqlParserService.parseQuery(baseQuery);
      
      // Build new SQL query with grid filters/sorts/groups
      const newQuery = this.buildSQLFromParsedQuery(parsedQuery, baseQuery);
      
      // Update the query if it changed
      if (newQuery !== this.code) {
        this.code = newQuery;
        
        // Update Monaco editor immediately
        if (this.editor) {
          const model = this.editor.getModel();
          if (model && model.getLanguageId() !== 'sql') {
            monaco.editor.setModelLanguage(model, 'sql');
          }
          this.editor.setValue(newQuery);
        }
        
        // Trigger change detection
        this.detectParameters();
        this.codeChangeSubject.next(this.code);
        
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
    
    // WHERE clause - combine original filters with grid filters
    const whereConditions: string[] = [];
    const addedFields = new Map<string, string>();
    
    // Add original WHERE filters (not in grid filters)
    if (parsedQuery.WhereClause && parsedQuery.WhereClause.Filters) {
      parsedQuery.WhereClause.Filters.forEach((filter: any) => {
        const fieldName = filter.FieldName?.toLowerCase().trim();
        if (fieldName) {
          const hasGridFilter = this.currentGridFilters.some(gf => 
            gf.field?.toLowerCase().trim() === fieldName
          );
          
          if (!hasGridFilter) {
            const condition = this.buildFilterCondition(filter);
            if (condition) {
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
    
    // Add grid filters
    const gridFiltersByField = new Map<string, GridFilter>();
    this.currentGridFilters.forEach(filter => {
      if (filter.field) {
        const normalizedField = filter.field.toLowerCase().trim();
        gridFiltersByField.set(normalizedField, filter);
      }
    });
    
    gridFiltersByField.forEach(filter => {
      const condition = this.buildGridFilterCondition(filter);
      if (condition) {
        const normalizedField = filter.field.toLowerCase().trim();
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
    
    if (whereConditions.length > 0) {
      sql += 'WHERE ' + whereConditions.join(' AND ') + '\n';
    }
    
    // GROUP BY clause - use grid groups
    const groupByFields: string[] = [];
    const addedGroupFields = new Set<string>();
    
    if (this.currentGridGroups && this.currentGridGroups.length > 0) {
      this.currentGridGroups.forEach(group => {
        if (group && group.field) {
          const normalized = group.field.trim().toLowerCase();
          if (!addedGroupFields.has(normalized)) {
            groupByFields.push(group.field.trim());
            addedGroupFields.add(normalized);
          }
        }
      });
    }
    
    if (groupByFields.length > 0) {
      sql += 'GROUP BY ' + groupByFields.join(', ') + '\n';
    }
    
    // ORDER BY clause - use grid sorts
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
    
    if (filter.ValueType === 2 && value.startsWith('@')) {
      return `${fieldName} ${operator} ${value}`;
    }
    
    if (filter.Operator === 10) {
      return `${fieldName} IS NULL`;
    }
    if (filter.Operator === 11) {
      return `${fieldName} IS NOT NULL`;
    }
    
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

  onCodeChange(value: string): void {
    this.code = value;
    this.codeChangeSubject.next(value);
  }

  toggleValidationErrors(): void {
    this.showValidationErrors = !this.showValidationErrors;
  }

  dismissValidationErrors(): void {
    this.showValidationErrors = false;
  }

  getErrorLocation(error: ValidationError): string {
    if (!error.line) {
      return '';
    }
    if (error.column) {
      return `Line ${error.line}, Column ${error.column}`;
    }
    return `Line ${error.line}`;
  }

  hasErrors(): boolean {
    return this.validationErrors.some(e => e.severity === 'error');
  }

  hasOnlyWarnings(): boolean {
    return this.validationErrors.length > 0 && this.validationErrors.every(e => e.severity === 'warning');
  }

  triggerSuggestions(): void {
    if (this.editor && this.enableSuggestions) {
      // Force show suggestions even if no word is typed
      // This ensures suggestions appear when clicking "Show Now" button
      const position = this.editor.getPosition();
      if (position) {
        // Get current word or use empty string to show all suggestions
        const model = this.editor.getModel();
        if (model) {
          const currentLine = model.getLineContent(position.lineNumber);
          const lineBeforeCursor = currentLine.substring(0, position.column - 1);
          const wordMatch = lineBeforeCursor.match(/(\w+)$/);
          const currentWord = wordMatch ? wordMatch[1] : '';
          
          // If no word, show all SQL keywords and tables
          if (!currentWord) {
            this.currentWord = '';
            this.currentWordStart = { line: position.lineNumber, column: position.column };
            
            // Generate all suggestions
            const suggestions: Array<{label: string, kind: string, description?: string}> = [];
            
            // Add all tables
            if (this.schemaData && this.schemaData.appObjects) {
              this.schemaData.appObjects.forEach(obj => {
                suggestions.push({
                  label: obj.name,
                  kind: 'table',
                  description: `Table: ${obj.name}`
                });
              });
            }
            
            // Add all SQL keywords
            const sqlKeywords = [
              'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS',
              'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
              'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
              'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
              'ASC', 'DESC', 'EXISTS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'
            ];
            
            sqlKeywords.forEach(keyword => {
              suggestions.push({
                label: keyword,
                kind: 'keyword',
                description: `SQL keyword: ${keyword}`
              });
            });
            
            // Sort and limit
            suggestions.sort((a, b) => {
              const order = { 'table': 0, 'field': 1, 'keyword': 2 };
              const aOrder = order[a.kind as keyof typeof order] ?? 3;
              const bOrder = order[b.kind as keyof typeof order] ?? 3;
              if (aOrder !== bOrder) return aOrder - bOrder;
              return a.label.localeCompare(b.label);
            });
            
            this.suggestions = suggestions.slice(0, 30);
            this.selectedSuggestionIndex = 0;
            
            if (this.suggestions.length > 0) {
              this.showSuggestions();
              console.log('[Microeditor] Showing all suggestions on trigger');
            }
          } else {
            // If there's a word, use normal checkForSuggestions
            this.checkForSuggestions();
          }
        }
      }
    }
  }

  // MANUAL SUGGESTION SYSTEM
  private checkForSuggestions(): void {
    if (!this.editor || !this.enableSuggestions) {
      this.hideSuggestions();
      return;
    }

    const position = this.editor.getPosition();
    if (!position) {
      this.hideSuggestions();
      return;
    }

    const model = this.editor.getModel();
    if (!model) {
      this.hideSuggestions();
      return;
    }

    const currentLine = model.getLineContent(position.lineNumber);
    const lineBeforeCursor = currentLine.substring(0, position.column - 1);
    
    // Extract current word being typed
    const wordMatch = lineBeforeCursor.match(/(\w+)$/);
    const currentWord = wordMatch ? wordMatch[1] : '';
    
    // Get context (last 200 chars before cursor)
    const textBeforeCursor = model.getValueInRange({
      startLineNumber: Math.max(1, position.lineNumber - 5),
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });
    
    const recentText = textBeforeCursor.substring(Math.max(0, textBeforeCursor.length - 200));
    const recentTextUpper = recentText.toUpperCase();
    
    // Find word start position
    const wordStartColumn = wordMatch ? position.column - currentWord.length : position.column;
    this.currentWordStart = { line: position.lineNumber, column: wordStartColumn };
    this.currentWord = currentWord.toLowerCase();
    
    // Generate suggestions based on context
    const suggestions: Array<{label: string, kind: string, description?: string}> = [];
    
    // Check if after FROM or JOIN - show tables
    const isAfterFrom = /\bFROM\s+\w*\s*$/i.test(recentText.trim()) || 
                       /\bFROM\s*$/i.test(recentText.trim());
    const isAfterJoin = /\b(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+\w*\s*$/i.test(recentText.trim()) ||
                       /\b(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s*$/i.test(recentText.trim());
    
    if (isAfterFrom || isAfterJoin) {
      // Show table names
      if (this.schemaData && this.schemaData.appObjects) {
        this.schemaData.appObjects.forEach(obj => {
          const tableName = obj.name;
          const tableNameLower = tableName.toLowerCase();
          if (!currentWord || tableNameLower.startsWith(this.currentWord) || tableNameLower.includes(this.currentWord)) {
            suggestions.push({
              label: tableName,
              kind: 'table',
              description: `Table: ${tableName}`
            });
          }
        });
      }
    }
    
    // Extract table aliases from the full query text FIRST
    const fullQueryText = model.getValue();
    this.extractTableAliases(fullQueryText);
    
    // Check if after dot (table.field or alias.field) - show fields
    const lastDotIndex = recentText.lastIndexOf('.');
    if (lastDotIndex > 0 && lastDotIndex >= recentText.length - 20) {
      const textAfterDot = recentText.substring(lastDotIndex + 1).trim();
      if (textAfterDot.length <= 10) {
        const textBeforeDot = recentText.substring(Math.max(0, lastDotIndex - 50), lastDotIndex);
        const aliasOrTableMatch = textBeforeDot.match(/(\w+)\s*$/);
        if (aliasOrTableMatch && this.schemaData) {
          const aliasOrTable = aliasOrTableMatch[1].toLowerCase();
          
          // Check if it's an alias first, then check if it's a table name
          let actualTableName = this.aliasToTableMap.get(aliasOrTable);
          
          // If not found as alias, check if it's a table name directly
          if (!actualTableName) {
            const directTable = this.schemaData.appObjects.find(obj => 
              obj.name.toLowerCase() === aliasOrTable
            );
            if (directTable) {
              actualTableName = aliasOrTable;
            }
          }
          
          // If we found the table (via alias or direct name), show its fields
          if (actualTableName) {
            const appObject = this.schemaData.appObjects.find(obj => 
              obj.name.toLowerCase() === actualTableName
            );
            if (appObject) {
              appObject.fields.forEach(field => {
                const fieldName = field.name;
                const fieldNameLower = fieldName.toLowerCase();
                if (!currentWord || fieldNameLower.startsWith(this.currentWord) || fieldNameLower.includes(this.currentWord)) {
                  suggestions.push({
                    label: fieldName,
                    kind: 'field',
                    description: `Field from ${actualTableName} (${aliasOrTable})`
                  });
                }
              });
            }
          }
        }
      }
    }
    
    // ALWAYS show SQL keywords (if no other suggestions or if typing matches)
    const sqlKeywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS',
      'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
      'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
      'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'ASC', 'DESC', 'EXISTS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'
    ];
    
    sqlKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (!currentWord || keywordLower.startsWith(this.currentWord) || keywordLower.includes(this.currentWord)) {
        // Don't add if already in suggestions
        if (!suggestions.find(s => s.label === keyword)) {
          suggestions.push({
            label: keyword,
            kind: 'keyword',
            description: `SQL keyword: ${keyword}`
          });
        }
      }
    });
    
    // Sort suggestions: tables first, then fields, then keywords
    suggestions.sort((a, b) => {
      const order = { 'table': 0, 'field': 1, 'keyword': 2 };
      const aOrder = order[a.kind as keyof typeof order] ?? 3;
      const bOrder = order[b.kind as keyof typeof order] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.label.localeCompare(b.label);
    });
    
    // Limit to 20 suggestions
    this.suggestions = suggestions.slice(0, 20);
    this.selectedSuggestionIndex = 0;
    
    // ALWAYS show suggestions if we have any, even with 0 characters typed
    // This ensures suggestions appear immediately when typing
    if (this.suggestions.length > 0) {
      this.showSuggestions();
      console.log('[Microeditor] Showing', this.suggestions.length, 'suggestions for word:', currentWord || '(empty)');
    } else {
      // If no suggestions found, still try to show keywords if user is typing
      if (currentWord.length >= 1) {
        // User is typing but got no suggestions - show keywords anyway
        const sqlKeywords = [
          'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS',
          'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
          'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
          'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
          'ASC', 'DESC', 'EXISTS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'
        ];
        
        sqlKeywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          if (keywordLower.startsWith(this.currentWord) || keywordLower.includes(this.currentWord)) {
            this.suggestions.push({
              label: keyword,
              kind: 'keyword',
              description: `SQL keyword: ${keyword}`
            });
          }
        });
        
        if (this.suggestions.length > 0) {
          this.suggestions = this.suggestions.slice(0, 20);
          this.showSuggestions();
          console.log('[Microeditor] Showing fallback keywords:', this.suggestions.length);
        } else {
          this.hideSuggestions();
        }
      } else {
        this.hideSuggestions();
      }
    }
  }

  private showSuggestions(): void {
    if (!this.editor || this.suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    const position = this.editor.getPosition();
    if (!position) {
      this.hideSuggestions();
      return;
    }

    // Get pixel position of cursor
    const coords = this.editor.getScrolledVisiblePosition(position);
    if (!coords) {
      this.hideSuggestions();
      return;
    }

    const editorDom = this.editor.getDomNode();
    if (!editorDom) {
      this.hideSuggestions();
      return;
    }

    const editorRect = editorDom.getBoundingClientRect();
    const lineHeight = this.editor.getOption(monaco.editor.EditorOption.lineHeight);
    
    this.suggestionPosition = {
      top: editorRect.top + coords.top + lineHeight,
      left: editorRect.left + coords.left
    };
    
    this.showSuggestionsDropdown = true;
  }

  private hideSuggestions(): void {
    this.showSuggestionsDropdown = false;
    this.suggestions = [];
    this.selectedSuggestionIndex = 0;
  }

  private updateSuggestionPosition(): void {
    // Force change detection when selection changes via arrow keys
    this.cdr.detectChanges();
    
    // Scroll selected item into view if needed
    setTimeout(() => {
      const dropdown = document.querySelector('.suggestions-dropdown');
      const selectedItem = dropdown?.querySelector(`.suggestion-item[data-index="${this.selectedSuggestionIndex}"]`) as HTMLElement;
      if (selectedItem && dropdown) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 0);
  }

  insertSuggestion(suggestion: {label: string, kind: string}): void {
    if (!this.editor || !suggestion) {
      console.warn('[Microeditor] Cannot insert suggestion - missing editor or suggestion');
      return;
    }

    const position = this.editor.getPosition();
    if (!position) {
      console.warn('[Microeditor] Cannot insert suggestion - no position');
      return;
    }

    const model = this.editor.getModel();
    if (!model) {
      console.warn('[Microeditor] Cannot insert suggestion - no model');
      return;
    }

    // Calculate range to replace
    const startColumn = this.currentWordStart.column;
    const endColumn = position.column;
    
    const range = new monaco.Range(
      this.currentWordStart.line,
      startColumn,
      position.lineNumber,
      endColumn
    );

    // Insert the suggestion
    const op = { range, text: suggestion.label };
    this.editor.executeEdits('suggestion-insert', [op]);
    
    // Move cursor after inserted text and add a space if needed
    const newPosition = new monaco.Position(
      this.currentWordStart.line,
      startColumn + suggestion.label.length
    );
    this.editor.setPosition(newPosition);
    
    // Hide suggestions
    this.hideSuggestions();
    
    // Re-focus editor
    this.editor.focus();
    
    console.log('[Microeditor] Suggestion inserted:', suggestion.label);
  }

  onSuggestionClick(suggestion: {label: string, kind: string}, index: number, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('[Microeditor] Suggestion clicked:', index, suggestion.label);
    
    // Force update the selected index IMMEDIATELY
    this.selectedSuggestionIndex = index;
    
    // Force Angular change detection to update the UI
    this.cdr.detectChanges();
    
    // Re-focus editor so Enter key works
    setTimeout(() => {
      if (this.editor) {
        this.editor.focus();
      }
      console.log('[Microeditor] Selected index set to:', this.selectedSuggestionIndex);
    }, 10);
  }
  
  onSuggestionDoubleClick(suggestion: {label: string, kind: string}, index: number, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Double-click inserts immediately
    this.selectedSuggestionIndex = index;
    this.insertSuggestion(suggestion);
  }
  
  onSuggestionMouseEnter(index: number): void {
    // Update selected index when hovering (so user can see which one is selected)
    this.selectedSuggestionIndex = index;
    // Force change detection for immediate visual feedback
    this.cdr.detectChanges();
  }

  // Extract table aliases from query text (like SQL editor does)
  private extractTableAliases(text: string): void {
    this.aliasToTableMap.clear();
    
    // SQL keywords that shouldn't be treated as aliases
    const sqlKeywords = new Set(['as', 'on', 'inner', 'left', 'right', 'full', 'outer', 'join', 'where', 'group', 'order', 'having', 'limit', 'offset', 'union', 'select', 'from', 'insert', 'update', 'delete', 'by', 'and', 'or', 'not', 'in', 'like', 'between', 'is', 'null']);
    
    // Extract FROM table and alias
    // Patterns: FROM table, FROM table alias, FROM table AS alias
    const fromPattern = /FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    let fromMatch;
    while ((fromMatch = fromPattern.exec(text)) !== null) {
      const tableName = fromMatch[1].toLowerCase();
      let alias = fromMatch[2]?.toLowerCase();
      
      // Get the full match text and what comes after
      const matchEnd = fromMatch.index + fromMatch[0].length;
      const afterMatch = text.substring(matchEnd).trim();
      
      // If no alias was captured by regex, check if next word is an alias
      if (!alias && afterMatch) {
        const nextWordMatch = afterMatch.match(/^(\w+)/);
        if (nextWordMatch) {
          const nextWord = nextWordMatch[1].toLowerCase();
          // If next word is not a SQL keyword, treat it as alias
          if (!sqlKeywords.has(nextWord)) {
            alias = nextWord;
          }
        }
      }
      
      // Map alias to table if alias exists and is not a keyword
      if (alias && !sqlKeywords.has(alias)) {
        this.aliasToTableMap.set(alias, tableName);
        console.log('[Microeditor] Found alias:', alias, '->', tableName);
      }
      // Always map table name to itself (can use table name as alias)
      this.aliasToTableMap.set(tableName, tableName);
    }
    
    // Extract JOIN tables and aliases
    // Patterns: JOIN table, JOIN table alias, JOIN table AS alias
    // Handle: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, CROSS JOIN
    const joinPattern = /(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s+JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    let joinMatch;
    while ((joinMatch = joinPattern.exec(text)) !== null) {
      const tableName = joinMatch[1].toLowerCase();
      let alias = joinMatch[2]?.toLowerCase();
      
      // If no alias was captured, check next word
      if (!alias) {
        const afterMatch = text.substring(joinMatch.index + joinMatch[0].length).trim();
        const nextWordMatch = afterMatch.match(/^(\w+)/);
        if (nextWordMatch) {
          const nextWord = nextWordMatch[1].toLowerCase();
          // Next word should not be 'ON' or any SQL keyword
          if (nextWord !== 'on' && !sqlKeywords.has(nextWord)) {
            alias = nextWord;
          }
        }
      }
      
      // Map alias to table if alias exists and is not a keyword
      if (alias && !sqlKeywords.has(alias)) {
        this.aliasToTableMap.set(alias, tableName);
        console.log('[Microeditor] Found JOIN alias:', alias, '->', tableName);
      }
      // Always map table name to itself
      this.aliasToTableMap.set(tableName, tableName);
    }
  }
}
