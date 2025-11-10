import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { MetadataService, AppObject, Field, FieldDataType } from '../../services/metadata.service';
import { SqlParserService, StructuredQuery } from '../../services/sql-parser.service';

export interface VisualField {
  id: string;
  fieldName: string;
  alias?: string;
  aggregate: 'None' | 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  selected: boolean;
}

export interface VisualFilter {
  id: string;
  fieldName: string;
  operator: string;
  value: string;
  conjunction: 'AND' | 'OR';
}

export interface VisualSort {
  id: string;
  fieldName: string;
  direction: 'ASC' | 'DESC';
}

export interface VisualGroup {
  id: string;
  fieldName: string;
}

@Component({
  selector: 'app-visual-query-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visual-query-builder.component.html',
  styleUrl: './visual-query-builder.component.css'
})
export class VisualQueryBuilderComponent implements OnInit, OnChanges {
  @Input() sqlQuery: string = '';
  @Input() forceParse: boolean = false; // Trigger parsing when tab is switched
  @Input() isTabActive: boolean = false; // Whether the Visual Builder tab is currently active
  @Input() isExecuting: boolean = false; // Whether query is currently executing
  @Output() sqlQueryChange = new EventEmitter<string>();
  @Output() syncWarning = new EventEmitter<string>();
  @Output() executeQuery = new EventEmitter<void>(); // Emit when execute button is clicked

  // Data Source
  selectedAppObject: AppObject | null = null;
  availableFields: Field[] = [];
  selectedFields: VisualField[] = [];

  // Filters
  filters: VisualFilter[] = [];

  // Sort & Group
  sorts: VisualSort[] = [];
  groups: VisualGroup[] = [];

  // Schema data
  appObjects: AppObject[] = [];
  isLoadingSchema: boolean = false;
  parseWarning: string | null = null;

  // Operators
  operators = [
    { value: '=', label: 'Equals (=)' },
    { value: '!=', label: 'Not Equals (!=)' },
    { value: '>', label: 'Greater Than (>)' },
    { value: '>=', label: 'Greater Than or Equal (>=)' },
    { value: '<', label: 'Less Than (<)' },
    { value: '<=', label: 'Less Than or Equal (<=)' },
    { value: 'LIKE', label: 'Contains (LIKE)' },
    { value: 'IN', label: 'In (IN)' },
    { value: 'NOT IN', label: 'Not In (NOT IN)' },
    { value: 'IS NULL', label: 'Is Null' },
    { value: 'IS NOT NULL', label: 'Is Not Null' }
  ];

  aggregates = ['None', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

  private queryChangeSubject = new Subject<void>();
  private isUpdatingFromSQL = false;

  constructor(
    private metadataService: MetadataService,
    private sqlParserService: SqlParserService
  ) {}

  ngOnInit(): void {
    this.loadSchema();
    
    // Debounce visual builder changes to SQL (300ms as per requirements)
    this.queryChangeSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      if (!this.isUpdatingFromSQL) {
        this.generateSQL();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sqlQuery']) {
      // SQL changed externally, parse and populate visual builder
      // Only parse if we have schema loaded and SQL is not empty
      if (this.appObjects.length > 0 && this.sqlQuery && this.sqlQuery.trim()) {
        this.parseSQLToVisual();
      }
    }
    
    if (changes['forceParse'] && changes['forceParse'].currentValue) {
      // Force parse when tab is switched to visual builder
      if (this.appObjects.length > 0 && this.sqlQuery && this.sqlQuery.trim()) {
        this.parseSQLToVisual();
      }
    }
    
    if (changes['isTabActive']) {
      // When tab becomes active, parse SQL and show warnings if needed
      if (changes['isTabActive'].currentValue) {
        // Tab just became active - parse SQL to check for warnings
        if (this.appObjects.length > 0 && this.sqlQuery && this.sqlQuery.trim()) {
          // Re-parse to check for warnings now that tab is active
          this.parseSQLToVisual();
        }
      } else {
        // Tab became inactive - clear warning to prevent showing on next activation
        this.parseWarning = null;
      }
    }
  }

  loadSchema(): void {
    this.isLoadingSchema = true;
    this.metadataService.getSchema().subscribe({
      next: (schema) => {
        this.appObjects = schema.appObjects;
        this.isLoadingSchema = false;
        
        // Only parse SQL if tab is active (prevents parsing on startup)
        if (this.isTabActive && this.sqlQuery && this.sqlQuery.trim()) {
          // Use setTimeout to ensure component is fully initialized
          setTimeout(() => {
            this.parseSQLToVisual();
          }, 0);
        }
      },
      error: (error) => {
        console.error('Error loading schema:', error);
        this.isLoadingSchema = false;
      }
    });
  }

  onAppObjectChange(): void {
    if (this.selectedAppObject) {
      this.availableFields = this.selectedAppObject.fields;
      
      // Clear selected fields that don't belong to this object
      this.selectedFields = this.selectedFields.filter(f => 
        this.availableFields.some(af => af.name === f.fieldName)
      );
    } else {
      this.availableFields = [];
      this.selectedFields = [];
    }
    
    this.triggerSQLUpdate();
  }

  onFieldToggle(field: Field): void {
    const existingIndex = this.selectedFields.findIndex(f => f.fieldName === field.name);
    
    if (existingIndex >= 0) {
      // Remove field
      this.selectedFields.splice(existingIndex, 1);
    } else {
      // Add field
      this.selectedFields.push({
        id: this.generateId(),
        fieldName: field.name,
        alias: '',
        aggregate: 'None',
        selected: true
      });
    }
    
    this.triggerSQLUpdate();
  }

  onFieldChange(): void {
    this.triggerSQLUpdate();
  }

  isFieldSelected(fieldName: string): boolean {
    return this.selectedFields.some(f => f.fieldName === fieldName);
  }

  getSelectedField(fieldName: string): VisualField | undefined {
    return this.selectedFields.find(f => f.fieldName === fieldName);
  }

  addFilter(): void {
    if (!this.selectedAppObject || this.availableFields.length === 0) {
      return;
    }
    
    this.filters.push({
      id: this.generateId(),
      fieldName: this.availableFields[0].name,
      operator: '=',
      value: '',
      conjunction: 'AND'
    });
    this.triggerSQLUpdate();
  }

  removeFilter(filterId: string): void {
    const index = this.filters.findIndex(f => f.id === filterId);
    if (index >= 0) {
      this.filters.splice(index, 1);
      this.triggerSQLUpdate();
    }
  }

  onFilterChange(): void {
    // Remove filters with empty field names
    this.filters = this.filters.filter(f => f.fieldName && f.fieldName.trim() !== '');
    this.triggerSQLUpdate();
  }

  onFilterOperatorChange(filter: VisualFilter): void {
    // Clear value when operator changes to IS NULL or IS NOT NULL
    if (filter.operator === 'IS NULL' || filter.operator === 'IS NOT NULL') {
      filter.value = '';
    }
    this.onFilterChange();
  }

  getFilterInputType(fieldName: string): string {
    if (!fieldName || !this.selectedAppObject) return 'text';
    
    const field = this.selectedAppObject.fields.find(f => f.name === fieldName);
    if (!field) return 'text';
    
    switch (field.dataType) {
      case FieldDataType.Number:
      case FieldDataType.Decimal:
        return 'number';
      case FieldDataType.DateTime:
      case FieldDataType.TimeStamp:
        return 'datetime-local';
      case FieldDataType.Boolean:
        return 'checkbox';
      default:
        return 'text';
    }
  }

  isFilterValueRequired(operator: string): boolean {
    return operator !== 'IS NULL' && operator !== 'IS NOT NULL';
  }

  addSort(): void {
    this.sorts.push({
      id: this.generateId(),
      fieldName: this.availableFields.length > 0 ? this.availableFields[0].name : '',
      direction: 'ASC'
    });
    this.triggerSQLUpdate();
  }

  removeSort(sortId: string): void {
    const index = this.sorts.findIndex(s => s.id === sortId);
    if (index >= 0) {
      this.sorts.splice(index, 1);
      this.triggerSQLUpdate();
    }
  }

  moveSortUp(index: number): void {
    if (index > 0) {
      const temp = this.sorts[index];
      this.sorts[index] = this.sorts[index - 1];
      this.sorts[index - 1] = temp;
      // Force change detection
      this.sorts = [...this.sorts];
      this.triggerSQLUpdate();
    }
  }

  moveSortDown(index: number): void {
    if (index < this.sorts.length - 1) {
      const temp = this.sorts[index];
      this.sorts[index] = this.sorts[index + 1];
      this.sorts[index + 1] = temp;
      // Force change detection
      this.sorts = [...this.sorts];
      this.triggerSQLUpdate();
    }
  }

  onSortChange(): void {
    // Remove sorts with empty field names
    this.sorts = this.sorts.filter(s => s.fieldName && s.fieldName.trim() !== '');
    this.triggerSQLUpdate();
  }

  addGroup(): void {
    const fieldName = this.availableFields.length > 0 ? this.availableFields[0].name : '';
    if (fieldName && !this.groups.some(g => g.fieldName === fieldName)) {
      this.groups.push({
        id: this.generateId(),
        fieldName: fieldName
      });
      this.triggerSQLUpdate();
    }
  }

  removeGroup(groupId: string): void {
    const index = this.groups.findIndex(g => g.id === groupId);
    if (index >= 0) {
      this.groups.splice(index, 1);
      this.triggerSQLUpdate();
    }
  }

  onGroupChange(): void {
    // Remove groups with empty field names
    this.groups = this.groups.filter(g => g.fieldName && g.fieldName.trim() !== '');
    // When grouping, automatically set aggregates for non-grouped fields
    this.updateAggregatesForGrouping();
    this.triggerSQLUpdate();
  }

  updateAggregatesForGrouping(): void {
    if (this.groups.length > 0) {
      // For grouped fields, remove aggregates
      this.selectedFields.forEach(field => {
        if (this.groups.some(g => g.fieldName === field.fieldName)) {
          if (field.aggregate !== 'None') {
            field.aggregate = 'None';
          }
        }
      });
    }
  }

  parseSQLToVisual(): void {
    if (!this.sqlQuery || !this.sqlQuery.trim()) {
      return;
    }

    this.isUpdatingFromSQL = true;
    // Only clear warning if we're actively parsing (not on initial load)
    if (this.isTabActive) {
      this.parseWarning = null;
    }

    try {
      const parsed = this.sqlParserService.parseQuery(this.sqlQuery);
      
      // Check for unsupported features - only set warning if tab is active
      if (parsed.Joins && parsed.Joins.length > 0) {
        // Only set and show warning if the tab is currently active
        if (this.isTabActive) {
          this.parseWarning = 'JOINs are not fully supported in Visual Builder. Some features may not be editable.';
          this.syncWarning.emit(this.parseWarning);
        }
        // Don't set parseWarning if tab is not active (prevents showing on startup)
      }

      // Set AppObject from FROM clause
      if (parsed.SelectedFields && parsed.SelectedFields.length > 0) {
        // Try to find the table from the query
        const fromMatch = this.sqlQuery.match(/FROM\s+(\w+)/i);
        if (fromMatch) {
          const tableName = fromMatch[1];
          this.selectedAppObject = this.appObjects.find(obj => 
            obj.name.toLowerCase() === tableName.toLowerCase()
          ) || null;
          
          if (this.selectedAppObject) {
            this.availableFields = this.selectedAppObject.fields;
          }
        }
      }

      // Parse selected fields
      this.selectedFields = [];
      if (parsed.SelectedFields) {
        parsed.SelectedFields.forEach(fieldExpr => {
          // Parse field expression: fieldName [AS alias] or aggregate(fieldName) [AS alias]
          const aliasMatch = fieldExpr.match(/\s+AS\s+(\w+)$/i);
          const alias = aliasMatch ? aliasMatch[1] : '';
          const fieldWithoutAlias = aliasMatch ? fieldExpr.substring(0, aliasMatch.index).trim() : fieldExpr.trim();
          
          // Check for aggregate functions
          const aggregateMatch = fieldWithoutAlias.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(/i);
          const aggregate = aggregateMatch ? aggregateMatch[1].toUpperCase() as any : 'None';
          
          // Extract field name
          let fieldName = fieldWithoutAlias;
          if (aggregate !== 'None') {
            const fieldMatch = fieldWithoutAlias.match(/\(([^)]+)\)/);
            fieldName = fieldMatch ? fieldMatch[1].trim() : fieldWithoutAlias;
          }
          
          // Remove table prefix if present
          if (fieldName.includes('.')) {
            fieldName = fieldName.split('.')[1];
          }
          
          this.selectedFields.push({
            id: this.generateId(),
            fieldName: fieldName,
            alias: alias,
            aggregate: aggregate,
            selected: true
          });
        });
      }

      // Parse filters
      this.filters = [];
      if (parsed.WhereClause && parsed.WhereClause.Filters) {
        parsed.WhereClause.Filters.forEach((filter, index) => {
          const operator = this.getOperatorFromNumber(filter.Operator);
          const conjunction = index === 0 ? 'AND' : (filter.Conjunction === 2 ? 'OR' : 'AND');
          
          this.filters.push({
            id: this.generateId(),
            fieldName: filter.FieldName.includes('.') ? filter.FieldName.split('.')[1] : filter.FieldName,
            operator: operator,
            value: filter.Value || '',
            conjunction: conjunction
          });
        });
      }

      // Parse sorts
      this.sorts = [];
      if (parsed.Sort) {
        parsed.Sort.forEach(sort => {
          const fieldName = sort.FieldName.includes('.') ? sort.FieldName.split('.')[1] : sort.FieldName;
          this.sorts.push({
            id: this.generateId(),
            fieldName: fieldName,
            direction: sort.Direction
          });
        });
      }

      // Parse groups
      this.groups = [];
      if (parsed.GroupBy) {
        parsed.GroupBy.forEach(groupField => {
          const fieldName = groupField.includes('.') ? groupField.split('.')[1] : groupField;
          this.groups.push({
            id: this.generateId(),
            fieldName: fieldName
          });
        });
      }

    } catch (error: any) {
      // Only set warning if tab is active (to avoid showing on startup)
      if (this.isTabActive) {
        this.parseWarning = `Unable to fully parse SQL query: ${error.message}. Some features may not be editable.`;
        this.syncWarning.emit(this.parseWarning);
      }
      console.warn('Error parsing SQL to visual:', error);
    } finally {
      this.isUpdatingFromSQL = false;
    }
  }

  generateSQL(): void {
    if (!this.selectedAppObject || this.selectedFields.length === 0) {
      // Empty query
      this.sqlQueryChange.emit('');
      return;
    }

    let sql = '';

    // SELECT clause
    sql += 'SELECT\n';
    const selectFields: string[] = [];
    this.selectedFields.forEach(field => {
      let fieldExpr = field.fieldName;
      
      // Add aggregate if specified
      if (field.aggregate !== 'None') {
        fieldExpr = `${field.aggregate}(${fieldExpr})`;
      }
      
      // Add alias if specified
      if (field.alias && field.alias.trim()) {
        fieldExpr += ` AS ${field.alias}`;
      }
      
      selectFields.push(`    ${fieldExpr}`);
    });
    sql += selectFields.join(',\n') + '\n';

    // FROM clause
    sql += `FROM ${this.selectedAppObject.name}\n`;

    // WHERE clause - only add valid filters
    const validFilters = this.filters.filter(f => 
      f.fieldName && 
      f.fieldName.trim() !== '' && 
      (f.operator === 'IS NULL' || f.operator === 'IS NOT NULL' || (f.value && f.value.trim() !== ''))
    );
    
    if (validFilters.length > 0) {
      sql += 'WHERE ';
      const conditions: string[] = [];
      
      validFilters.forEach((filter, index) => {
        if (index > 0) {
          conditions.push(filter.conjunction);
        }
        
        let condition = filter.fieldName;
        
        if (filter.operator === 'IS NULL' || filter.operator === 'IS NOT NULL') {
          condition += ` ${filter.operator}`;
        } else {
          let value = filter.value?.trim() || '';
          
          // Skip empty values
          if (!value) {
            return;
          }
          
          // Format value based on operator
          if (filter.operator === 'LIKE') {
            value = `'%${value}%'`;
          } else if (filter.operator === 'IN' || filter.operator === 'NOT IN') {
            // Assume comma-separated values
            const values = value.split(',').map(v => {
              const trimmed = v.trim();
              if (!trimmed) return null;
              return isNaN(Number(trimmed)) ? `'${trimmed}'` : trimmed;
            }).filter(v => v !== null);
            
            if (values.length === 0) {
              return; // Skip if no valid values
            }
            value = `(${values.join(', ')})`;
          } else {
            // Handle date/datetime values
            if (this.getFilterInputType(filter.fieldName) === 'datetime-local' || 
                this.getFilterInputType(filter.fieldName) === 'date') {
              value = `'${value}'`;
            } else if (typeof value === 'string' && !value.startsWith("'") && !value.startsWith('@')) {
              // Check if it's a number
              if (isNaN(Number(value))) {
                value = `'${value}'`;
              }
            }
          }
          
          condition += ` ${filter.operator} ${value}`;
        }
        
        conditions.push(condition);
      });
      
      if (conditions.length > 0) {
        sql += conditions.join(' ') + '\n';
      }
    }

    // GROUP BY clause - only add valid groups
    const validGroups = this.groups.filter(g => g.fieldName && g.fieldName.trim() !== '');
    if (validGroups.length > 0) {
      sql += 'GROUP BY ' + validGroups.map(g => g.fieldName).join(', ') + '\n';
    }

    // ORDER BY clause - only add valid sorts
    const validSorts = this.sorts.filter(s => s.fieldName && s.fieldName.trim() !== '');
    if (validSorts.length > 0) {
      sql += 'ORDER BY ' + validSorts.map(s => `${s.fieldName} ${s.direction}`).join(', ') + '\n';
    }

    const finalSQL = sql.trim();
    this.sqlQueryChange.emit(finalSQL);
  }

  triggerSQLUpdate(): void {
    this.queryChangeSubject.next();
  }

  getOperatorFromNumber(opNum: number): string {
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
    return operatorMap[opNum] || '=';
  }

  getPreviewSelect(): string {
    if (this.selectedFields.length === 0) return 'No fields selected';
    
    return this.selectedFields.map(f => {
      let expr = f.fieldName;
      if (f.aggregate !== 'None') {
        expr = `${f.aggregate}(${expr})`;
      }
      if (f.alias) {
        expr += ` AS ${f.alias}`;
      }
      return expr;
    }).join(', ');
  }

  getPreviewWhere(): string {
    if (this.filters.length === 0) return 'No filters';
    
    return this.filters.map((f, i) => {
      let condition = f.fieldName;
      if (f.operator === 'IS NULL' || f.operator === 'IS NOT NULL') {
        condition += ` ${f.operator}`;
      } else {
        condition += ` ${f.operator} ${f.value || '?'}`;
      }
      if (i > 0) {
        condition = `${f.conjunction} ${condition}`;
      }
      return condition;
    }).join(' ');
  }

  getPreviewOrderBy(): string {
    if (this.sorts.length === 0) return 'No sorting';
    return this.sorts.map(s => `${s.fieldName} ${s.direction}`).join(', ');
  }

  getPreviewGroupBy(): string {
    if (this.groups.length === 0) return 'No grouping';
    return this.groups.map(g => g.fieldName).join(', ');
  }

  clearBuilder(): void {
    if (confirm('Are you sure you want to clear the visual builder? This will reset all selections.')) {
      this.selectedAppObject = null;
      this.availableFields = [];
      this.selectedFields = [];
      this.filters = [];
      this.sorts = [];
      this.groups = [];
      this.parseWarning = null;
      this.sqlQueryChange.emit('');
    }
  }

  onExecuteQuery(): void {
    // First, ensure SQL is up to date
    this.generateSQL();
    // Emit event to parent to execute query
    this.executeQuery.emit();
  }

  generateId(): string {
    return 'vb_' + Math.random().toString(36).substr(2, 9);
  }
}

