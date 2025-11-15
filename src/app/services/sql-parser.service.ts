import { Injectable } from '@angular/core';

export interface QueryFilter {
  Id: string;
  FieldName: string;
  Operator: number;
  Value: string;
  ValueType: number;
  Conjunction: number;
  GroupId: number;
  Sequence: number;
}

export interface WhereClause {
  Filters: QueryFilter[];
  FilterLogic: string;
}

export interface SortField {
  FieldName: string;
  Direction: 'ASC' | 'DESC';
}

export interface Join {
  JoinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  RightObject: string;
  LeftField: string;
  RightField: string;
}

export interface Pager {
  PageSize: number;
  PageNumber: number;
}

export interface QueryParameter {
  FieldName: string;
  IsMandatory: boolean;
  MappingFieldName: string;
}

export interface StructuredQuery {
  QueryName: string;
  SelectedFields: string[];
  WhereClause?: WhereClause;
  GroupBy?: string[];
  Sort?: SortField[];
  Joins?: Join[];
  Pager?: Pager;
  Parameters: QueryParameter[];
}

@Injectable({
  providedIn: 'root'
})
export class SqlParserService {
  // RelationalOperator enum mapping (matches backend - all 20 operators)
  // Complete enum: GreaterThan = 1, LessThan = 2, EqualTo = 3, IN = 4, NOTIN = 5,
  // IsNULL = 6, IsNotNULL = 7, NotEqualTo = 8, GreaterThanOREqualTo = 9,
  // LessThanOREqualTo = 10, Contains = 11, NotContains = 12, StartsWith = 13,
  // NotStartsWith = 14, EndsWith = 15, NotEndsWith = 16, Between = 17,
  // NotBetween = 18, SplitContains = 19, NotSplitContains = 20
  private readonly operatorMap: { [key: string]: number } = {
    // Direct SQL operator mappings
    '>': 1,           // GreaterThan = 1
    '<': 2,           // LessThan = 2
    '=': 3,           // EqualTo = 3
    'IN': 4,          // IN = 4
    'NOT IN': 5,      // NOTIN = 5
    'IS NULL': 6,     // IsNULL = 6
    'IS NOT NULL': 7, // IsNotNULL = 7
    '!=': 8,          // NotEqualTo = 8
    '<>': 8,          // NotEqualTo = 8 (alternative syntax)
    '>=': 9,          // GreaterThanOREqualTo = 9
    '<=': 10,         // LessThanOREqualTo = 10
    'LIKE': 11,       // Contains = 11 (default LIKE pattern, parsed as '%value%' in parseCondition)
    'NOT LIKE': 12    // NotContains = 12 (default NOT LIKE pattern, parsed as '%value%' in parseCondition)
    // Note: The following operators are determined by pattern analysis in parseCondition():
    // - StartsWith = 13 (LIKE 'value%')
    // - NotStartsWith = 14 (NOT LIKE 'value%')
    // - EndsWith = 15 (LIKE '%value')
    // - NotEndsWith = 16 (NOT LIKE '%value')
    // - Between = 17 (BETWEEN value1 AND value2)
    // - NotBetween = 18 (NOT BETWEEN value1 AND value2)
    // - SplitContains = 19 (LIKE '%value%' - same as Contains, handled in parseCondition)
    // - NotSplitContains = 20 (NOT LIKE '%value%' - same as NotContains, handled in parseCondition)
  };

  // ConjunctionClause enum mapping (matches backend)
  // AND = 1, OR = 2, AND_NOT = 3, OR_NOT = 4, IN = 5
  private readonly conjunctionMap: { [key: string]: number } = {
    'AND': 1,
    'OR': 2,
    'AND NOT': 3,     // AND_NOT = 3
    'OR NOT': 4,      // OR_NOT = 4
    'IN': 5           // IN = 5 (for conjunction)
  };

  // FilterValueType enum mapping (matches backend)
  // Literal = 1, Parameter = 2, Property = 3, Global = 4
  private readonly valueTypeMap: { [key: string]: number } = {
    'literal': 1,
    'parameter': 2,
    'property': 3,
    'global': 4
  };

  /**
   * Parse SQL query string into structured format
   */
  parseQuery(sqlQuery: string, queryName: string = ''): StructuredQuery {
    // Extract query name from comment if not provided
    if (!queryName) {
      queryName = this.extractQueryName(sqlQuery);
    }
    
    // Remove comments and normalize whitespace
    const cleanedQuery = this.removeComments(sqlQuery);
    
    const selectedFields = this.parseSelectFields(cleanedQuery);
    const joins = this.parseJoins(cleanedQuery);
    const whereClause = this.parseWhereClause(cleanedQuery);
    const groupBy = this.parseGroupBy(cleanedQuery);
    const sort = this.parseOrderBy(cleanedQuery);
    const pager = this.parseLimit(cleanedQuery);
    const parameters = this.parseParameters(cleanedQuery);

    return {
      QueryName: queryName || '',
      SelectedFields: selectedFields,
      WhereClause: whereClause,
      GroupBy: groupBy.length > 0 ? groupBy : undefined,
      Sort: sort.length > 0 ? sort : undefined,
      Joins: joins.length > 0 ? joins : undefined,
      Pager: pager,
      Parameters: parameters
    };
  }

  /**
   * Extract query name from SQL comment (-- comment or /* comment )
   */
  private extractQueryName(sql: string): string {
    // Try to extract from single-line comment at the beginning
    const singleLineComment = sql.match(/^\s*--\s*(.+?)(?:\r?\n|$)/m);
    if (singleLineComment) {
      return singleLineComment[1].trim();
    }
    
    // Try to extract from multi-line comment
    const multiLineComment = sql.match(/^\s*\/\*\s*(.+?)\s*\*\//s);
    if (multiLineComment) {
      return multiLineComment[1].trim().split('\n')[0].trim();
    }
    
    return '';
  }

  /**
   * Remove SQL comments (single line and multi-line)
   */
  private removeComments(sql: string): string {
    // Remove single-line comments
    sql = sql.replace(/--.*$/gm, '');
    // Remove multi-line comments
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    return sql.trim();
  }

  /**
   * Parse SELECT fields
   */
  private parseSelectFields(sql: string): string[] {
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/is);
    if (!selectMatch) return [];

    let fieldsSection = selectMatch[1].trim();
    
    // Remove DISTINCT and TOP clauses if present at the beginning
    fieldsSection = fieldsSection.replace(/^\s*DISTINCT\s+/i, '').trim();
    fieldsSection = fieldsSection.replace(/^\s*TOP\s+\d+\s+/i, '').trim();
    // Split by comma, but respect parentheses and quotes
    const fields: string[] = [];
    let currentField = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < fieldsSection.length; i++) {
      const char = fieldsSection[i];
      
      if ((char === '"' || char === "'") && (i === 0 || fieldsSection[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
      } else if (!inQuotes) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
          fields.push(currentField.trim());
          currentField = '';
          continue;
        }
      }
      
      currentField += char;
    }
    
    if (currentField.trim()) {
      fields.push(currentField.trim());
    }

    return fields.map(f => f.trim());
  }

  /**
   * Parse aggregate functions from SELECT clause
   * Returns array of objects with Data (SQL expression) and DisplayName (alias)
   */
  private parseAggregateFunctions(sql: string): Array<{ Data: string; DisplayName: string }> {
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/is);
    if (!selectMatch) return [];

    const fieldsSection = selectMatch[1].trim();
    if (fieldsSection === '*') return [];

    // SQL aggregate functions to detect
    const aggregateFunctions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'GROUP_CONCAT', 'STRING_AGG', 'ARRAY_AGG'];
    const rawSqlFields: Array<{ Data: string; DisplayName: string }> = [];

    // Split fields by comma, respecting parentheses and quotes
    const fields: string[] = [];
    let currentField = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < fieldsSection.length; i++) {
      const char = fieldsSection[i];
      
      if ((char === '"' || char === "'") && (i === 0 || fieldsSection[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
      } else if (!inQuotes) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
          fields.push(currentField.trim());
          currentField = '';
          continue;
        }
      }
      
      currentField += char;
    }
    
    if (currentField.trim()) {
      fields.push(currentField.trim());
    }

    // Process each field
    fields.forEach(field => {
      const trimmedField = field.trim();
      if (!trimmedField) return;

      // Check if field contains aggregate function
      const aggregatePattern = new RegExp(`^\\s*(${aggregateFunctions.join('|')})\\s*\\(`, 'i');
      const isAggregate = aggregatePattern.test(trimmedField);

      if (isAggregate) {
        // Extract the full SQL expression (before AS)
        let sqlExpression = trimmedField;
        let displayName = '';

        // Check for AS alias
        const asMatch = trimmedField.match(/\s+AS\s+(\w+)/i);
        if (asMatch && asMatch.index !== undefined) {
          displayName = asMatch[1];
          // Remove AS alias from SQL expression
          sqlExpression = trimmedField.substring(0, asMatch.index).trim();
        } else {
          // Check for implicit alias (space-separated)
          // Pattern: COUNT(field) alias
          const implicitAliasMatch = trimmedField.match(/\)\s+(\w+)(?:\s|$)/);
          if (implicitAliasMatch && implicitAliasMatch.index !== undefined) {
            displayName = implicitAliasMatch[1];
            sqlExpression = trimmedField.substring(0, implicitAliasMatch.index + 1).trim();
          } else {
            // No alias found - generate one from the function name and field
            const functionMatch = trimmedField.match(/^(\w+)\s*\(([^)]+)\)/i);
            if (functionMatch) {
              const funcName = functionMatch[1].toUpperCase();
              const innerField = functionMatch[2].trim().replace(/[\s.]+/g, '');
              displayName = `${funcName}_${innerField}`.toLowerCase();
            } else {
              displayName = 'aggregate_field';
            }
          }
        }

        // Add to RawSQL_AppfieldIds
        rawSqlFields.push({
          Data: sqlExpression,
          DisplayName: displayName
        });
      }
    });

    return rawSqlFields;
  }

  /**
   * Parse SELECT fields, excluding aggregate functions
   * Returns array of field names (for ResultField_AppfieldIds)
   */
  private parseSelectFieldsExcludingAggregates(sql: string): string[] {
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/is);
    if (!selectMatch) return [];

    let fieldsSection = selectMatch[1].trim();
    
    // Remove DISTINCT clause if present
    fieldsSection = fieldsSection.replace(/^\s*DISTINCT\s+/i, '').trim();
    
    // Remove TOP clause if present (e.g., "TOP 10" -> "")
    // Pattern: TOP followed by optional number
    fieldsSection = fieldsSection.replace(/^\s*TOP\s+\d+\s+/i, '').trim();
    
    if (fieldsSection === '*') return ['*'];

    // SQL aggregate functions to detect
    const aggregateFunctions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'GROUP_CONCAT', 'STRING_AGG', 'ARRAY_AGG'];
    const regularFields: string[] = [];

    // Split fields by comma, respecting parentheses and quotes
    const fields: string[] = [];
    let currentField = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < fieldsSection.length; i++) {
      const char = fieldsSection[i];
      
      if ((char === '"' || char === "'") && (i === 0 || fieldsSection[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
      } else if (!inQuotes) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
          fields.push(currentField.trim());
          currentField = '';
          continue;
        }
      }
      
      currentField += char;
    }
    
    if (currentField.trim()) {
      fields.push(currentField.trim());
    }

    // Process each field
    fields.forEach(field => {
      const trimmedField = field.trim();
      if (!trimmedField) return;
      
      // Skip "TOP" keyword if it appears as a field (shouldn't happen after regex, but safety check)
      if (trimmedField.toUpperCase() === 'TOP') return;

      // Check if field contains aggregate function
      const aggregatePattern = new RegExp(`^\\s*(${aggregateFunctions.join('|')})\\s*\\(`, 'i');
      const isAggregate = aggregatePattern.test(trimmedField);

      if (!isAggregate) {
        // Regular field - extract field name
        let fieldName = trimmedField;

        // Remove AS alias if present
        const asMatch = trimmedField.match(/(.+?)\s+AS\s+(\w+)/i);
        if (asMatch) {
          fieldName = asMatch[1].trim();
        } else {
          // Check for implicit alias (space-separated)
          const implicitAliasMatch = trimmedField.match(/^(.+?)\s+(\w+)(?:\s|$)/);
          if (implicitAliasMatch && !implicitAliasMatch[1].includes('(')) {
            // Not a function call, might be an implicit alias
            fieldName = implicitAliasMatch[1].trim();
          }
        }

        regularFields.push(fieldName.trim());
      }
    });

    return regularFields;
  }

  /**
   * Parse JOIN clauses
   */
  private parseJoins(sql: string): Join[] {
    const joins: Join[] = [];
    // Match: JOIN type, table name, optional alias (with or without AS), ON condition
    // Improved regex to handle: JOIN table alias ON, JOIN table AS alias ON, JOIN table ON
    const joinRegex = /(INNER|LEFT|RIGHT|FULL)?\s+JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+([\w.]+)\s*=\s*([\w.]+)/gi;
    let match;

    while ((match = joinRegex.exec(sql)) !== null) {
      const joinType = (match[1] || 'INNER').toUpperCase().trim() as 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
      const rightObject = match[2];
      const alias = match[3] || '';
      
      let leftField = match[4].trim();
      let rightField = match[5].trim();
      
      // Determine which field belongs to the left table (main table) and which to the right (joined table)
      // The left field should reference the main table or previous tables
      // The right field should reference the joined table or its alias
      const rightFieldUsesTable = rightField.startsWith(rightObject + '.') || 
                                  (alias && rightField.startsWith(alias + '.'));
      
      // If right field references the joined table, we might need to swap
      // But typically the condition is: mainTable.field = joinedTable.field
      // So if left field doesn't reference a table, keep as is
      
      // For now, keep the fields as parsed - the order should be:
      // LeftField from main table, RightField from joined table
      // If the join condition is reversed (joinedTable.field = mainTable.field), we should swap
      if (rightFieldUsesTable && !leftField.includes('.')) {
        // Likely need to swap
        [leftField, rightField] = [rightField, leftField];
      } else if (leftField.startsWith(rightObject + '.') || (alias && leftField.startsWith(alias + '.'))) {
        // Left field references the joined table, so swap
        [leftField, rightField] = [rightField, leftField];
      }

      joins.push({
        JoinType: joinType,
        RightObject: rightObject,
        LeftField: leftField,
        RightField: rightField
      });
    }

    return joins;
  }

  /**
   * Parse WHERE clause into structured filters
   */
  private parseWhereClause(sql: string): WhereClause | undefined {
    const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/is);
    if (!whereMatch) return undefined;

    let whereSection = whereMatch[1].trim();
    // Remove trailing semicolon if present (SQL statement terminator)
    whereSection = whereSection.replace(/;+\s*$/, '').trim();
    if (!whereSection) return undefined;

    const filters: QueryFilter[] = [];
    const filterLogicParts: string[] = [];
    let sequence = 1;
    let groupId = 1;

    // Split WHERE clause by AND/OR while respecting parentheses
    const conditions = this.splitConditions(whereSection);
    
    for (let i = 0; i < conditions.length; i++) {
      const conditionData = conditions[i];
      const condition = conditionData.condition.trim();
      if (!condition) continue;

      const filter = this.parseCondition(condition, sequence, groupId);
      if (filter) {
        // Determine conjunction - how this filter connects to the previous one
        if (i === 0) {
          // First filter defaults to AND
          filter.Conjunction = 1;
        } else {
          // Use the conjunction from the previous condition
          const conjunction = conditions[i - 1].conjunction || 'AND';
          filter.Conjunction = conjunction === 'OR' ? 2 : 1;
          filterLogicParts.push(conjunction);
        }
        
        filters.push(filter);
        filterLogicParts.push(sequence.toString());
        
        sequence++;
      }
    }

    if (filters.length === 0) return undefined;

    return {
      Filters: filters,
      FilterLogic: filterLogicParts.join(' ')
    };
  }

  /**
   * Parse HAVING clause into structured filters
   * Similar to WHERE clause but used with aggregate functions
   */
  private parseHavingClause(sql: string): WhereClause | undefined {
    // Use a more robust pattern that handles newlines and whitespace
    // Stop at ORDER BY, LIMIT, or end of string (including semicolon)
    const havingMatch = sql.match(/HAVING\s+([\s\S]*?)(?:\s+ORDER\s+BY\b|\s+LIMIT\b|;|$)/i);
    if (!havingMatch) return undefined;

    let havingSection = havingMatch[1].trim();
    // Remove trailing semicolon and any trailing whitespace/newlines
    havingSection = havingSection.replace(/[;\s\n\r]*$/, '').trim();
    if (!havingSection) return undefined;

    const filters: QueryFilter[] = [];
    const filterLogicParts: string[] = [];
    let sequence = 1;
    let groupId = 1;

    // Split HAVING clause by AND/OR while respecting parentheses
    const conditions = this.splitConditions(havingSection);
    
    for (let i = 0; i < conditions.length; i++) {
      const conditionData = conditions[i];
      const condition = conditionData.condition.trim();
      if (!condition) continue;

      const filter = this.parseHavingCondition(condition, sequence, groupId);
      if (filter) {
        // Determine conjunction - how this filter connects to the previous one
        if (i === 0) {
          // First filter defaults to AND
          filter.Conjunction = 1;
        } else {
          // Use the conjunction from the previous condition
          const conjunction = conditions[i - 1].conjunction || 'AND';
          filter.Conjunction = conjunction === 'OR' ? 2 : 1;
          filterLogicParts.push(conjunction);
        }
        
        filters.push(filter);
        filterLogicParts.push(sequence.toString());
        
        sequence++;
      }
    }

    if (filters.length === 0) return undefined;

    return {
      Filters: filters,
      FilterLogic: filterLogicParts.join(' ')
    };
  }

  /**
   * Parse a single HAVING condition into a filter
   * Handles aggregate functions like SUM(LoggedHours) > 12
   */
  private parseHavingCondition(condition: string, sequence: number, groupId: number): QueryFilter | null {
    // Remove trailing AND/OR if present
    condition = condition.replace(/\s+(AND|OR)$/i, '').trim();
    
    // Handle aggregate functions: SUM(LoggedHours) > 12, COUNT(*) > 10, etc.
    // Pattern: AGGREGATE_FUNCTION(field) operator value
    
    // Handle IS NULL / IS NOT NULL with aggregate functions
    const isNullMatch = condition.match(/(\w+\s*\([^)]+\))\s+(IS\s+(NOT\s+)?NULL)/i);
    if (isNullMatch) {
      return {
        Id: this.generateGuid(),
        FieldName: isNullMatch[1], // Keep the aggregate function as field name
        Operator: isNullMatch[2].toUpperCase().includes('NOT') ? 11 : 10, // IS NOT NULL : IS NULL
        Value: '',
        ValueType: 1,
        Sequence: sequence,
        GroupId: groupId,
        Conjunction: 1
      };
    }

    // Handle IN / NOT IN with aggregate functions
    const inMatch = condition.match(/(\w+\s*\([^)]+\))\s+(NOT\s+)?IN\s*\(([^)]+)\)/i);
    if (inMatch) {
      const isNot = !!inMatch[2];
      let values = inMatch[3].trim();
      // Remove trailing semicolon if present
      values = values.replace(/;+\s*$/, '').trim();
      const isParameter = values.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: inMatch[1], // Keep aggregate function as field name
        Operator: isNot ? 9 : 8,
        Value: values,
        ValueType: isParameter ? 2 : 1,
        Sequence: sequence,
        GroupId: groupId,
        Conjunction: 1
      };
    }

    // Handle LIKE with aggregate functions
    const likeMatch = condition.match(/(\w+\s*\([^)]+\))\s+LIKE\s+(.+)/i);
    if (likeMatch) {
      let value = likeMatch[2].trim();
      // Remove trailing semicolon if present
      value = value.replace(/;+\s*$/, '').trim();
      // Remove quotes from value if present
      value = value.replace(/^['"]|['"]$/g, '');
      const isParameter = value.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: likeMatch[1], // Keep aggregate function as field name
        Operator: 11, // Contains = 11 (LIKE operator)
        // Store value without quotes (quotes are SQL syntax, not data)
        Value: value,
        ValueType: isParameter ? 2 : 1,
        Sequence: sequence,
        GroupId: groupId,
        Conjunction: 1
      };
    }

    // Handle comparison operators with aggregate functions
    // Pattern: SUM(LoggedHours) > 12, COUNT(*) = 10, etc.
    const comparisonPattern = /(\w+\s*\([^)]+\))\s*([=<>!]+|>=|<=|<>|!=)\s*(.+)/i;
    const comparisonMatch = condition.match(comparisonPattern);
    
    if (comparisonMatch) {
      const fieldExpression = comparisonMatch[1].trim(); // e.g., SUM(LoggedHours)
      const operator = comparisonMatch[2].trim();
      let value = comparisonMatch[3].trim();

      // Remove trailing semicolon if present
      value = value.replace(/;+\s*$/, '').trim();
      
      // Remove quotes from value if present (quotes are SQL syntax, not part of the value)
      const isQuoted = /^['"](.*)['"]$/.test(value);
      if (isQuoted) {
        value = value.replace(/^['"]|['"]$/g, '');
      }
      
      const isParameter = value.startsWith('@');

      // Convert operator to number using operatorMap
      const operatorNumber = this.operatorMap[operator] || 1;

      return {
        Id: this.generateGuid(),
        FieldName: fieldExpression, // Keep aggregate function as field name
        Operator: operatorNumber,
        // Store value without quotes (quotes are SQL syntax, not data)
        Value: value,
        ValueType: isParameter ? 2 : 1, // 2 = parameter, 1 = literal
        Sequence: sequence,
        GroupId: groupId,
        Conjunction: 1
      };
    }

    // If pattern doesn't match, try to parse as regular condition
    return this.parseCondition(condition, sequence, groupId);
  }

  /**
   * Split WHERE conditions respecting parentheses and AND/OR
   * Important: Does NOT split on AND when it's part of a BETWEEN clause
   */
  private splitConditions(whereSection: string): Array<{condition: string, conjunction?: string}> {
    const result: Array<{condition: string, conjunction?: string}> = [];
    
    let current = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < whereSection.length; i++) {
      const char = whereSection[i];
      const nextChars = whereSection.substring(i, i + 5).toUpperCase();
      const prevChars = i >= 5 ? whereSection.substring(i - 5, i).toUpperCase() : '';
      
      // Handle quotes
      if ((char === '"' || char === "'") && (i === 0 || whereSection[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
        }
      }
      
      if (!inQuotes) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (depth === 0) {
          // Check for AND - but NOT if it's part of a BETWEEN clause
          if (nextChars.startsWith(' AND ')) {
            // Check if this AND is part of a BETWEEN clause
            // If current text contains "BETWEEN" and we haven't seen an AND after it yet,
            // then this AND is part of the BETWEEN syntax, not a conjunction
            const textBeforeAnd = current.trim().toUpperCase();
            const hasBetween = textBeforeAnd.includes('BETWEEN');
            const betweenIndex = hasBetween ? textBeforeAnd.lastIndexOf('BETWEEN') : -1;
            const hasAndAfterBetween = betweenIndex >= 0 && textBeforeAnd.substring(betweenIndex).includes(' AND ');
            
            // Only split if this is NOT a BETWEEN ... AND clause
            // (i.e., if we don't have BETWEEN, or if we already have AND after BETWEEN)
            if (!hasBetween || hasAndAfterBetween) {
              if (current.trim()) {
                result.push({ condition: current.trim() });
              }
              current = '';
              i += 4; // Skip ' AND '
              if (i < whereSection.length) {
                result[result.length - 1].conjunction = 'AND';
              }
              continue;
            }
            // If we have BETWEEN but no AND after it yet, this AND is part of BETWEEN syntax
            // Don't split, just continue accumulating
          }
          // Check for OR
          else if (nextChars.startsWith(' OR ')) {
            if (current.trim()) {
              result.push({ condition: current.trim() });
            }
            current = '';
            i += 3; // Skip ' OR '
            if (i < whereSection.length) {
              result[result.length - 1].conjunction = 'OR';
            }
            continue;
          }
        }
      }
      
      current += char;
    }
    
    // Add the last condition
    if (current.trim()) {
      result.push({ condition: current.trim() });
    }

    // If no conditions found, return the whole section
    return result.length > 0 ? result : [{ condition: whereSection }];
  }

  /**
   * Parse a single condition into a filter
   */
  private parseCondition(condition: string, sequence: number, groupId: number): QueryFilter | null {
    // Remove trailing AND/OR if present
    condition = condition.replace(/\s+(AND|OR)$/i, '').trim();
    
    // Pattern: field operator value
    // Operators: =, !=, <>, >, >=, <, <=, LIKE, IN, IS NULL, IS NOT NULL
    
    // Handle IS NULL / IS NOT NULL (RelationalOperator: IsNULL = 6, IsNotNULL = 7)
    const isNullMatch = condition.match(/([\w.]+)\s+(IS\s+(NOT\s+)?NULL)/i);
    if (isNullMatch) {
      return {
        Id: this.generateGuid(),
        FieldName: isNullMatch[1],
        Operator: isNullMatch[2].toUpperCase().includes('NOT') ? 7 : 6,
        Value: '',
        ValueType: 1, // literal
        Conjunction: 1, // AND
        GroupId: groupId,
        Sequence: sequence
      };
    }

    // Handle IN / NOT IN (RelationalOperator: IN = 4, NOTIN = 5)
    const inMatch = condition.match(/([\w.]+)\s+(NOT\s+)?IN\s*\(([^)]+)\)/i);
    if (inMatch) {
      const isNot = !!inMatch[2];
      let values = inMatch[3].trim();
      
      // Remove trailing semicolon if present (SQL statement terminator, not part of value)
      values = values.replace(/;+\s*$/, '').trim();
      
      const isParameter = values.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: inMatch[1],
        Operator: isNot ? 5 : 4,
        Value: values,
        ValueType: isParameter ? 2 : 1,
        Conjunction: 1,
        GroupId: groupId,
        Sequence: sequence
      };
    }

    // Handle BETWEEN / NOT BETWEEN (RelationalOperator: Between = 17, NotBetween = 18)
    // Pattern: field [NOT] BETWEEN value1 AND value2
    // Use a more flexible pattern that handles quoted strings and various spacing
    const betweenPattern = /([\w.]+)\s+(NOT\s+)?BETWEEN\s+(.+?)\s+AND\s+(.+)/i;
    const betweenMatch = condition.match(betweenPattern);
    if (betweenMatch) {
      const fieldName = betweenMatch[1];
      const isNot = !!betweenMatch[2];
      let value1 = betweenMatch[3].trim();
      let value2 = betweenMatch[4].trim();
      
      // Remove trailing semicolon if present (SQL statement terminator, not part of value)
      value2 = value2.replace(/;+\s*$/, '').trim();
      value1 = value1.replace(/;+\s*$/, '').trim();
      
      // Remove quotes from both values (quotes are SQL syntax, not part of the value)
      value1 = value1.replace(/^['"]|['"]$/g, '');
      value2 = value2.replace(/^['"]|['"]$/g, '');
      
      // Store two values separated by | (pipe character)
      const combinedValue = `${value1}|${value2}`;
      
      return {
        Id: this.generateGuid(),
        FieldName: fieldName,
        Operator: isNot ? 18 : 17, // NotBetween = 18, Between = 17
        Value: combinedValue,
        ValueType: 1, // literal
        Conjunction: 1,
        GroupId: groupId,
        Sequence: sequence
      };
    }

    // Handle LIKE / NOT LIKE - determine operator based on pattern
    // Supports: Contains (11), NotContains (12), StartsWith (13), NotStartsWith (14),
    // EndsWith (15), NotEndsWith (16), SplitContains (19), NotSplitContains (20)
    const likeMatch = condition.match(/([\w.]+)\s+(NOT\s+)?LIKE\s+(.+)/i);
    if (likeMatch) {
      const fieldName = likeMatch[1];
      const isNot = !!likeMatch[2];
      let value = likeMatch[3].trim();
      
      // Remove trailing semicolon if present (SQL statement terminator, not part of value)
      value = value.replace(/;+\s*$/, '').trim();
      
      // Remove quotes from value if present
      value = value.replace(/^['"]|['"]$/g, '');
      
      const isParameter = value.startsWith('@');
      
      // Determine operator based on LIKE pattern and NOT modifier
      // RelationalOperator: Contains = 11, NotContains = 12, StartsWith = 13,
      // NotStartsWith = 14, EndsWith = 15, NotEndsWith = 16,
      // SplitContains = 19, NotSplitContains = 20
      let operator = 11; // Default to Contains
      if (value.startsWith('%') && value.endsWith('%')) {
        // Pattern: '%value%' - Contains or SplitContains
        operator = isNot ? 12 : 11; // NotContains = 12, Contains = 11
        // Note: SplitContains (19) and NotSplitContains (20) are same pattern,
        // defaulting to Contains/NotContains. Can be differentiated if needed.
      } else if (value.endsWith('%')) {
        // Pattern: 'value%' - StartsWith
        operator = isNot ? 14 : 13; // NotStartsWith = 14, StartsWith = 13
      } else if (value.startsWith('%')) {
        // Pattern: '%value' - EndsWith
        operator = isNot ? 16 : 15; // NotEndsWith = 16, EndsWith = 15
      } else {
        // No wildcards - treat as Contains pattern
        operator = isNot ? 12 : 11; // NotContains = 12, Contains = 11
      }
      
      return {
        Id: this.generateGuid(),
        FieldName: fieldName,
        Operator: operator,
        // Store value without quotes (quotes are SQL syntax, not data)
        // The % wildcards are part of the pattern value
        Value: value,
        ValueType: isParameter ? 2 : 1,
        Conjunction: 1,
        GroupId: groupId,
        Sequence: sequence
      };
    }

    // Handle comparison operators: =, !=, <>, >, >=, <, <=
    const comparisonMatch = condition.match(/([\w.]+)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)/i);
    if (comparisonMatch) {
      const fieldName = comparisonMatch[1];
      const operator = comparisonMatch[2];
      let value = comparisonMatch[3].trim();
      
      // Remove trailing semicolon if present (SQL statement terminator, not part of value)
      value = value.replace(/;+\s*$/, '').trim();
      
      // Remove quotes but keep the value (quotes are SQL syntax, not part of the value)
      const isQuoted = /^['"](.*)['"]$/.test(value);
      if (isQuoted) {
        value = value.replace(/^['"]|['"]$/g, '');
      }
      
      const isParameter = value.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: fieldName,
        Operator: this.operatorMap[operator] || 1,
        // Store value without quotes (quotes are SQL syntax, not data)
        Value: value,
        ValueType: isParameter ? 2 : 1,
        Conjunction: 1,
        GroupId: groupId,
        Sequence: sequence
      };
    }

    return null;
  }

  /**
   * Parse GROUP BY clause
   */
  private parseGroupBy(sql: string): string[] {
    // Find GROUP BY clause and stop at HAVING, ORDER BY, or LIMIT
    // Handle newlines and whitespace properly
    // Match GROUP BY and capture until HAVING, ORDER BY, LIMIT, or end
    const groupByRegex = /\bGROUP\s+BY\s+([\s\S]*?)(?=\s+HAVING\b|\s+ORDER\s+BY\b|\s+LIMIT\b|[;\s]*$)/i;
    const groupByMatch = sql.match(groupByRegex);
    
    if (!groupByMatch || !groupByMatch[1]) {
      // Try alternative pattern without lookahead - find GROUP BY and manually find stop point
      const groupByIndex = sql.search(/\bGROUP\s+BY\s+/i);
      if (groupByIndex === -1) return [];
      
      // Find content start after "GROUP BY"
      const match = sql.substring(groupByIndex).match(/GROUP\s+BY\s+/i);
      if (!match) return [];
      
      const contentStart = groupByIndex + match[0].length;
      const remaining = sql.substring(contentStart);
      
      // Find the earliest of HAVING, ORDER BY, LIMIT, or semicolon
      const havingPos = remaining.search(/\bHAVING\b/i);
      const orderByPos = remaining.search(/\bORDER\s+BY\b/i);
      const limitPos = remaining.search(/\bLIMIT\b/i);
      const semicolonPos = remaining.indexOf(';');
      
      const stopPositions = [havingPos, orderByPos, limitPos, semicolonPos]
        .filter(pos => pos !== -1);
      const stopPos = stopPositions.length > 0 ? Math.min(...stopPositions) : remaining.length;
      
      let groupBySection = remaining.substring(0, stopPos).trim();
      groupBySection = groupBySection.replace(/[;\s\n\r]*$/, '').trim();
      
      if (!groupBySection) return [];
      
      return groupBySection.split(',').map(f => f.trim().replace(/[\s\n\r]+/g, ' ')).filter(f => f);
    }

    // Extract GROUP BY section from match
    let groupBySection = groupByMatch[1].trim();
    
    // Remove trailing semicolon and any trailing whitespace/newlines
    groupBySection = groupBySection.replace(/[;\s\n\r]*$/, '').trim();
    if (!groupBySection) return [];
    
    // Split by comma and clean up each field
    return groupBySection.split(',').map(f => f.trim().replace(/[\s\n\r]+/g, ' ')).filter(f => f);
  }

  /**
   * Parse ORDER BY clause
   */
  private parseOrderBy(sql: string): SortField[] {
    const orderByMatch = sql.match(/ORDER\s+BY\s+(.*?)(?:\s+LIMIT|$)/is);
    if (!orderByMatch) return [];

    const orderBySection = orderByMatch[1].trim();
    const sortFields: SortField[] = [];
    
    const fieldParts = orderBySection.split(',');
    for (const part of fieldParts) {
      const trimmed = part.trim();
      const descMatch = trimmed.match(/(.+?)\s+(ASC|DESC)/i);
      
      if (descMatch) {
        sortFields.push({
          FieldName: descMatch[1].trim(),
          Direction: descMatch[2].toUpperCase() as 'ASC' | 'DESC'
        });
      } else {
        sortFields.push({
          FieldName: trimmed,
          Direction: 'ASC'
        });
      }
    }

    return sortFields;
  }

  /**
   * Parse LIMIT clause into pager
   * Supports: LIMIT count or LIMIT offset, count or LIMIT count OFFSET offset
   */
  private parseLimit(sql: string): Pager | undefined {
    // Try LIMIT count OFFSET offset first
    let limitMatch = sql.match(/LIMIT\s+(\d+)\s+OFFSET\s+(\d+)/i);
    if (limitMatch) {
      const pageSize = parseInt(limitMatch[1], 10);
      const offset = parseInt(limitMatch[2], 10);
      return {
        PageSize: pageSize,
        PageNumber: Math.floor(offset / pageSize) + 1
      };
    }
    
    // Try LIMIT offset, count (MySQL style)
    limitMatch = sql.match(/LIMIT\s+(\d+)\s*,\s*(\d+)/i);
    if (limitMatch) {
      const offset = parseInt(limitMatch[1], 10);
      const pageSize = parseInt(limitMatch[2], 10);
      return {
        PageSize: pageSize,
        PageNumber: Math.floor(offset / pageSize) + 1
      };
    }
    
    // Try LIMIT count only
    limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const pageSize = parseInt(limitMatch[1], 10);
      return {
        PageSize: pageSize,
        PageNumber: 1
      };
    }
    
    return undefined;
  }

  /**
   * Parse parameters from query
   */
  private parseParameters(sql: string): QueryParameter[] {
    const paramRegex = /@(\w+)/g;
    const matches = Array.from(sql.matchAll(paramRegex));
    const uniqueParams = [...new Set(matches.map(m => m[1]))];

    return uniqueParams.map(paramName => ({
      FieldName: paramName,
      IsMandatory: true,
      MappingFieldName: paramName
    }));
  }

  /**
   * Generate a GUID-like ID
   */
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Convert JSON query object to SQL query string
   * @param jsonQuery JSON query object with QueryObjectID, ResultField_AppfieldIds, WhereClause, etc.
   * @returns SQL query string
   */
  jsonToSql(jsonQuery: any): string {
    let sql = '';

    // SELECT clause
    sql += 'SELECT\n';
    if (jsonQuery.ResultField_AppfieldIds && jsonQuery.ResultField_AppfieldIds.length > 0) {
      sql += '    ' + jsonQuery.ResultField_AppfieldIds.join(',\n    ') + '\n';
    } else {
      sql += '    *\n';
    }

    // FROM clause
    if (jsonQuery.QueryObjectID) {
      sql += 'FROM ' + jsonQuery.QueryObjectID + '\n';
    } else {
      throw new Error('QueryObjectID is required');
    }

    // JOIN clauses - handle both old format (RightObject, LeftField, RightField) and new format (Relationship)
    if (jsonQuery.Joins && jsonQuery.Joins.length > 0) {
      jsonQuery.Joins.forEach((join: any) => {
        // Convert JoinType number to string (1 = INNER, 2 = LEFT, 3 = RIGHT, 4 = FULL)
        const joinTypeMap: { [key: number]: string } = {
          1: 'INNER',
          2: 'LEFT',
          3: 'RIGHT',
          4: 'FULL'
        };
        const joinType = joinTypeMap[join.JoinType] || 'INNER';
        
        // Handle new format with Relationship object
        if (join.Relationship) {
          // For Relationship format, we need to use the table names from the relationship
          // Since we don't have the actual table names in the Relationship object,
          // we'll try to use RightObject if available, or generate a placeholder
          const rightObject = join.RightObject || 'JoinedTable';
          sql += `${joinType} JOIN ${rightObject}`;
          if (join.RightObjectAlias) {
            sql += ` ${join.RightObjectAlias}`;
          }
          // For Relationship format, we can't determine the exact field names from SQL alone
          // So we'll use placeholder field names
          sql += ` ON ${join.LeftField || 'SourceField'} = ${join.RightField || 'TargetField'}\n`;
        } else {
          // Handle old format with direct field references
          const rightObject = join.RightObject || 'JoinedTable';
          sql += `${joinType} JOIN ${rightObject}`;
          if (join.RightObjectAlias) {
            sql += ` ${join.RightObjectAlias}`;
          }
          sql += ` ON ${join.LeftField} = ${join.RightField}\n`;
        }
      });
    }

    // WHERE clause
    if (jsonQuery.WhereClause && jsonQuery.WhereClause.Filters && jsonQuery.WhereClause.Filters.length > 0) {
      sql += 'WHERE ';
      const conditions: string[] = [];
      
      jsonQuery.WhereClause.Filters.forEach((filter: any, index: number) => {
        const condition = this.buildFilterConditionFromJson(filter);
        if (condition) {
          // Add conjunction (AND/OR/AND NOT/OR NOT) if not the first filter
          // ConjunctionClause: AND = 1, OR = 2, AND_NOT = 3, OR_NOT = 4, IN = 5
          if (index > 0) {
            let conjunction = 'AND';
            if (filter.ConjuctionClause === 2) {
              conjunction = 'OR';
            } else if (filter.ConjuctionClause === 3) {
              conjunction = 'AND NOT';
            } else if (filter.ConjuctionClause === 4) {
              conjunction = 'OR NOT';
            } else if (filter.ConjuctionClause === 5) {
              conjunction = 'IN';
            }
            conditions.push(conjunction + ' ' + condition);
          } else {
            conditions.push(condition);
          }
        }
      });
      
      sql += conditions.join(' ') + '\n';
    }

    // GROUP BY clause
    if (jsonQuery.GroupByFields && jsonQuery.GroupByFields.length > 0) {
      sql += 'GROUP BY ' + jsonQuery.GroupByFields.join(', ') + '\n';
    }

    // HAVING clause
    if (jsonQuery.HavingClause && jsonQuery.HavingClause.Filters && jsonQuery.HavingClause.Filters.length > 0) {
      sql += 'HAVING ';
      const conditions: string[] = [];
      
      jsonQuery.HavingClause.Filters.forEach((filter: any, index: number) => {
        const condition = this.buildFilterConditionFromJson(filter);
        if (condition) {
          // Add conjunction (AND/OR/AND NOT/OR NOT) if not the first filter
          // ConjunctionClause: AND = 1, OR = 2, AND_NOT = 3, OR_NOT = 4, IN = 5
          if (index > 0) {
            let conjunction = 'AND';
            if (filter.ConjuctionClause === 2) {
              conjunction = 'OR';
            } else if (filter.ConjuctionClause === 3) {
              conjunction = 'AND NOT';
            } else if (filter.ConjuctionClause === 4) {
              conjunction = 'OR NOT';
            } else if (filter.ConjuctionClause === 5) {
              conjunction = 'IN';
            }
            conditions.push(conjunction + ' ' + condition);
          } else {
            conditions.push(condition);
          }
        }
      });
      
      sql += conditions.join(' ') + '\n';
    }

    // ORDER BY clause
    if (jsonQuery.Sort && jsonQuery.Sort.length > 0) {
      sql += 'ORDER BY ';
      const sortFields: string[] = [];
      
      // Sort by SortSequence first, then by Sequence
      const sortedSorts = [...jsonQuery.Sort].sort((a: any, b: any) => {
        if (a.SortSequence !== b.SortSequence) {
          return (a.SortSequence || 0) - (b.SortSequence || 0);
        }
        return (a.Sequence || 0) - (b.Sequence || 0);
      });
      
      sortedSorts.forEach((sort: any) => {
        const fieldName = sort.FieldID || sort.FieldName;
        // SortSequence enum: Asc = 1, Desc = 2 (matches backend)
        let direction = 'ASC';
        if (sort.Direction) {
          direction = sort.Direction.toUpperCase();
        } else if (sort.SortSequence !== undefined) {
          // SortSequence: 1 = ASC, 2 = DESC
          direction = sort.SortSequence === 2 ? 'DESC' : 'ASC';
        }
        sortFields.push(fieldName + ' ' + direction);
      });
      
      sql += sortFields.join(', ') + '\n';
    }

    return sql.trim() + ';';
  }

  /**
   * Build a filter condition from JSON filter object
   */
  private buildFilterConditionFromJson(filter: any): string {
    if (!filter.FieldName) return '';

    const fieldName = filter.FieldName;
    const operator = this.getSQLOperatorFromNumber(filter.RelationalOperator || filter.Operator);
    let value = filter.Value;

    // Handle NULL checks (RelationalOperator: IsNULL = 6, IsNotNULL = 7)
    if (filter.RelationalOperator === 6 || filter.Operator === 6) {
      return `${fieldName} IS NULL`;
    }
    if (filter.RelationalOperator === 7 || filter.Operator === 7) {
      return `${fieldName} IS NOT NULL`;
    }

    // Handle BETWEEN / NOT BETWEEN (RelationalOperator: Between = 17, NotBetween = 18)
    // Value format: "value1|value2" (pipe-separated)
    if (filter.RelationalOperator === 17 || filter.RelationalOperator === 18 || 
        filter.Operator === 17 || filter.Operator === 18) {
      if (typeof value === 'string' && value.includes('|')) {
        const [value1, value2] = value.split('|').map(v => v.trim());
        // Add quotes to both values if they're not parameters
        const formattedValue1 = value1.startsWith('@') ? value1 : `'${value1}'`;
        const formattedValue2 = value2.startsWith('@') ? value2 : `'${value2}'`;
        return `${fieldName} ${operator} ${formattedValue1} AND ${formattedValue2}`;
      }
    }

    // Handle parameter values (ValueType 2)
    if (filter.ValueType === 2 && value && value.startsWith('@')) {
      return `${fieldName} ${operator} ${value}`;
    }

    // Handle string values - add quotes if needed
    if (typeof value === 'string' && !value.startsWith("'") && !value.startsWith('"') && !value.startsWith('@')) {
      // Remove existing quotes if present
      value = value.replace(/^['"]|['"]$/g, '');
      value = `'${value}'`;
    }

    return `${fieldName} ${operator} ${value}`;
  }

  /**
   * Get SQL operator from RelationalOperator enum number (matches backend)
   * RelationalOperator: GreaterThan = 1, LessThan = 2, EqualTo = 3, etc.
   */
  private getSQLOperatorFromNumber(operatorNumber: number): string {
    const operatorMap: { [key: number]: string } = {
      1: '>',              // GreaterThan = 1
      2: '<',              // LessThan = 2
      3: '=',              // EqualTo = 3
      4: 'IN',             // IN = 4
      5: 'NOT IN',         // NOTIN = 5
      6: 'IS NULL',        // IsNULL = 6
      7: 'IS NOT NULL',    // IsNotNULL = 7
      8: '!=',             // NotEqualTo = 8
      9: '>=',             // GreaterThanOREqualTo = 9
      10: '<=',            // LessThanOREqualTo = 10
      11: 'LIKE',          // Contains = 11 (LIKE '%value%')
      12: 'NOT LIKE',      // NotContains = 12 (NOT LIKE '%value%')
      13: 'LIKE',          // StartsWith = 13 (LIKE 'value%')
      14: 'NOT LIKE',      // NotStartsWith = 14 (NOT LIKE 'value%')
      15: 'LIKE',          // EndsWith = 15 (LIKE '%value')
      16: 'NOT LIKE',      // NotEndsWith = 16 (NOT LIKE '%value')
      17: 'BETWEEN',       // Between = 17
      18: 'NOT BETWEEN',   // NotBetween = 18
      19: 'LIKE',          // SplitContains = 19 (LIKE '%value%')
      20: 'NOT LIKE'       // NotSplitContains = 20 (NOT LIKE '%value%')
    };
    return operatorMap[operatorNumber] || '=';
  }

  /**
   * Convert SQL operator number to RelationalOperator number
   * Based on user's JSON format where RelationalOperator: 3 maps to =
   */
  /**
   * Convert SQL operator number to RelationalOperator enum number
   * Since we're now using the correct RelationalOperator enum values directly,
   * this method should return the operator number as-is for values 1-20
   * RelationalOperator enum: GreaterThan=1, LessThan=2, EqualTo=3, IN=4, NOTIN=5,
   * IsNULL=6, IsNotNULL=7, NotEqualTo=8, GreaterThanOREqualTo=9, LessThanOREqualTo=10,
   * Contains=11, NotContains=12, StartsWith=13, NotStartsWith=14, EndsWith=15,
   * NotEndsWith=16, Between=17, NotBetween=18, SplitContains=19, NotSplitContains=20
   */
  private getRelationalOperatorFromSQLOperator(operatorNumber: number): number {
    // If operator is already in the correct RelationalOperator enum range (1-20), return as-is
    if (operatorNumber >= 1 && operatorNumber <= 20) {
      return operatorNumber;
    }
    
    // Legacy mapping for old operator numbers (if any exist)
    // This should not be needed anymore since we use correct enum values directly
    const relationalOperatorMap: { [key: number]: number } = {
      1: 3,  // Legacy: = -> 3 (EqualTo)
      2: 8,  // Legacy: != -> 8 (NotEqualTo)
      3: 1,  // Legacy: > -> 1 (GreaterThan)
      4: 9,  // Legacy: >= -> 9 (GreaterThanOREqualTo)
      5: 2,  // Legacy: < -> 2 (LessThan)
      6: 10, // Legacy: <= -> 10 (LessThanOREqualTo)
      7: 11, // Legacy: LIKE -> 11 (Contains)
      8: 4,  // Legacy: IN -> 4 (IN)
      9: 5,  // Legacy: NOT IN -> 5 (NOTIN)
      10: 6, // Legacy: IS NULL -> 6 (IsNULL)
      11: 7  // Legacy: IS NOT NULL -> 7 (IsNotNULL)
    };
    
    // Return mapped value or default to 3 (EqualTo) if not found
    return relationalOperatorMap[operatorNumber] || operatorNumber || 3;
  }

  /**
   * Look up Table ID from schema data based on table name
   * @param schemaData Schema data containing appObjects with fields
   * @param tableName Table name (case-insensitive)
   * @returns Table ID if found, null otherwise
   */
  private getTableIdFromSchema(schemaData: any, tableName: string): string | null {
    if (!schemaData || !schemaData.appObjects || !tableName) {
      return null;
    }

    // Find the table/object in schema
    const table = schemaData.appObjects.find((obj: any) => {
      const objName = (obj.name || obj.ObjectName || obj.SystemDBTableName || '').toLowerCase();
      const searchName = tableName.toLowerCase();
      return objName === searchName;
    });

    return table ? (table.ID || table.id) : null;
  }

  /**
   * Look up Field ID from schema data based on table name and field name
   * @param schemaData Schema data containing appObjects with fields
   * @param tableName Table name (case-insensitive)
   * @param fieldName Field name (case-insensitive)
   * @returns Field ID if found, null otherwise
   */
  private getFieldIdFromSchema(schemaData: any, tableName: string, fieldName: string): string | null {
    if (!schemaData || !schemaData.appObjects || !tableName || !fieldName) {
      return null;
    }

    // Find the table/object in schema
    const table = schemaData.appObjects.find((obj: any) => {
      const objName = (obj.name || obj.ObjectName || obj.SystemDBTableName || '').toLowerCase();
      const searchName = tableName.toLowerCase();
      return objName === searchName;
    });

    if (!table || !table.fields) {
      return null;
    }

    // Find the field in the table
    const field = table.fields.find((f: any) => {
      const fName = (f.FieldName || f.name || f.SystemDBFieldName || '').toLowerCase();
      const searchName = fieldName.toLowerCase();
      return fName === searchName;
    });

    return field ? (field.ID || field.id) : null;
  }

  /**
   * Convert SQL query string to JSON query object
   * @param sqlQuery SQL query string
   * @param schemaData Optional schema data to look up Field IDs
   * @returns JSON query object with QueryObjectID, ResultField_AppfieldIds, WhereClause, etc.
   */
  sqlToJson(sqlQuery: string, schemaData?: any): any {
    // Remove comments and normalize whitespace
    const cleanedQuery = this.removeComments(sqlQuery);
    
    // Detect DISTINCT clause
    const hasDistinct = /^\s*SELECT\s+DISTINCT\b/i.test(cleanedQuery);
    
    // Extract TOP count if present (e.g., "SELECT TOP 10" -> TopCount = 10)
    let topCount: number | undefined = undefined;
    const topMatch = cleanedQuery.match(/SELECT\s+TOP\s+(\d+)/i);
    if (topMatch) {
      topCount = parseInt(topMatch[1], 10);
    }
    
    // Extract table name from FROM clause
    const fromMatch = cleanedQuery.match(/FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i);
    const queryObjectID = fromMatch ? fromMatch[1] : '';
    const tableAlias = fromMatch ? fromMatch[2] : null;

    // Build alias to table name mapping
    const aliasToTable = new Map<string, string>();
    if (tableAlias) {
      aliasToTable.set(tableAlias.toLowerCase(), queryObjectID.toLowerCase());
    }
    aliasToTable.set(queryObjectID.toLowerCase(), queryObjectID.toLowerCase());

    // Parse SELECT fields - separate regular fields from aggregate functions
    const resultField_AppfieldIds = this.parseSelectFieldsExcludingAggregates(cleanedQuery);
    const rawSQL_AppfieldIds = this.parseAggregateFunctions(cleanedQuery);

    // Parse WHERE clause
    const whereClause: any = { Filters: [] };
    const parsedWhere = this.parseWhereClause(cleanedQuery);
    if (parsedWhere && parsedWhere.Filters) {
      whereClause.Filters = parsedWhere.Filters.map((filter: QueryFilter) => {
        // Extract table and field name from FieldName (could be "table.field" or just "field")
        let tableName = queryObjectID;
        let fieldName = filter.FieldName;
        
        if (filter.FieldName.includes('.')) {
          const parts = filter.FieldName.split('.');
          const tableRef = parts[0].toLowerCase();
          fieldName = parts[1];
          tableName = aliasToTable.get(tableRef) || tableRef;
        }

        // Look up Field ID from schema
        let fieldId = this.getFieldIdFromSchema(schemaData, tableName, fieldName);
        if (!fieldId) {
          // Fallback to GUID if not found in schema
          fieldId = this.generateGuid();
        }

        return {
          ConjuctionClause: filter.Conjunction || 1,
          FieldID: fieldId,
          RelationalOperator: this.getRelationalOperatorFromSQLOperator(filter.Operator),
          Value: filter.Value,
          ValueType: filter.ValueType,
          GroupID: filter.GroupId || 1,
          Sequence: filter.Sequence || 1,
          FieldType: 1, // Default field type
          FieldName: filter.FieldName,
          LookUpDetail: null,
          ID: filter.Id || this.generateGuid()
        };
      });
    }

    // Parse GROUP BY
    const groupByFields = this.parseGroupBy(cleanedQuery);

    // Parse HAVING clause
    const havingClause: any = { Filters: [] };
    const parsedHaving = this.parseHavingClause(cleanedQuery);
    if (parsedHaving && parsedHaving.Filters) {
      havingClause.Filters = parsedHaving.Filters.map((filter: QueryFilter) => {
        // Extract field name from aggregate function (e.g., SUM(LoggedHours) -> LoggedHours)
        let fieldName = filter.FieldName;
        let isAggregate = false;
        let aggregateFunction = '';

        // Check if field name contains aggregate function (e.g., SUM(LoggedHours))
        const aggregateMatch = fieldName.match(/^(\w+)\s*\(\s*([\w.]+)\s*\)$/i);
        if (aggregateMatch) {
          const functionName = aggregateMatch[1].toUpperCase();
          const aggregateFunctions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'GROUP_CONCAT', 'STRING_AGG', 'ARRAY_AGG'];
          
          if (aggregateFunctions.includes(functionName)) {
            isAggregate = true;
            aggregateFunction = functionName;
            fieldName = aggregateMatch[2]; // Extract field name from inside function
          }
        }

        // Extract table and field name from FieldName (could be "table.field" or just "field")
        let tableName = queryObjectID;
        if (fieldName.includes('.')) {
          const parts = fieldName.split('.');
          const tableRef = parts[0].toLowerCase();
          fieldName = parts[1];
          tableName = aliasToTable.get(tableRef) || tableRef;
        }

        // Look up Field ID from schema
        let fieldId = this.getFieldIdFromSchema(schemaData, tableName, fieldName);
        if (!fieldId) {
          // Fallback to GUID if not found in schema
          fieldId = this.generateGuid();
        }

        return {
          ConjuctionClause: filter.Conjunction || 1,
          FieldID: fieldId,
          RelationalOperator: this.getRelationalOperatorFromSQLOperator(filter.Operator),
          Value: filter.Value,
          ValueType: filter.ValueType || 1, // 1 = literal
          GroupID: filter.GroupId || 1,
          Sequence: filter.Sequence || 1,
          FieldType: isAggregate ? 4 : 1, // 4 = aggregate function, 1 = regular field
          FieldName: fieldName, // Use the extracted field name (not the aggregate function)
          LookUpDetail: null,
          ID: filter.Id || this.generateGuid()
        };
      });
    }

    // Parse ORDER BY
    const sort: any[] = [];
    const parsedSort = this.parseOrderBy(cleanedQuery);
    if (parsedSort && parsedSort.length > 0) {
      parsedSort.forEach((sortField: SortField, index: number) => {
        sort.push({
          FieldID: sortField.FieldName,
          SortSequence: sortField.Direction === 'DESC' ? 2 : 1, // SortSequence: Asc = 1, Desc = 2
          Sequence: index + 1
        });
      });
    }

    // Parse JOINs - API expects JoinType as number and Relationship object
    const joins: any[] = [];
    const parsedJoins = this.parseJoins(cleanedQuery);
    if (parsedJoins && parsedJoins.length > 0) {
      // Build alias to table name mapping for JOIN tables
      // Extract JOIN table aliases from the SQL query
      // Use a better regex pattern to find JOIN clauses and their aliases
      const joinPattern = /(?:INNER|LEFT|RIGHT|FULL)?\s+JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON/gi;
      let joinMatch;
      const joinAliasMap = new Map<string, string>();
      
      while ((joinMatch = joinPattern.exec(cleanedQuery)) !== null) {
        const joinTableName = joinMatch[1];
        const joinAlias = joinMatch[2];
        
        if (joinAlias) {
          joinAliasMap.set(joinAlias.toLowerCase(), joinTableName.toLowerCase());
          aliasToTable.set(joinAlias.toLowerCase(), joinTableName.toLowerCase());
        }
        // Also add the table name itself (without alias)
        aliasToTable.set(joinTableName.toLowerCase(), joinTableName.toLowerCase());
      }

      parsedJoins.forEach((join: Join) => {
        // Convert JoinType string to number (0 = LEFT, 1 = INNER, 2 = RIGHT, 3 = FULL)
        const joinTypeMap: { [key: string]: number } = {
          'LEFT': 0,
          'INNER': 1,
          'RIGHT': 2,
          'FULL': 3
        };
        const joinTypeNumber = joinTypeMap[join.JoinType] ?? 1; // Default to INNER (1) if not specified
        
        // Extract table names from LeftField and RightField
        // Source table is the table that contains LeftField (typically the FROM table)
        // Target table is the JOIN table (RightObject)
        const leftTableMatch = join.LeftField.match(/^(\w+)\./);
        const rightTableMatch = join.RightField.match(/^(\w+)\./);
        
        // Determine source table and field
        let sourceTableName = queryObjectID;
        let sourceFieldName = join.LeftField;
        if (leftTableMatch) {
          const leftTableRef = leftTableMatch[1].toLowerCase();
          sourceTableName = aliasToTable.get(leftTableRef) || leftTableRef;
          sourceFieldName = join.LeftField.split('.')[1];
        }
        
        // Determine target table and field
        let targetTableName = join.RightObject;
        let targetFieldName = join.RightField;
        if (rightTableMatch) {
          const rightTableRef = rightTableMatch[1].toLowerCase();
          targetTableName = aliasToTable.get(rightTableRef) || rightTableRef;
          targetFieldName = join.RightField.split('.')[1];
        }
        
        // Look up table IDs from schema
        const sourceTableId = schemaData 
          ? (this.getTableIdFromSchema(schemaData, sourceTableName) || this.generateGuid())
          : this.generateGuid();
        const targetTableId = schemaData 
          ? (this.getTableIdFromSchema(schemaData, targetTableName) || this.generateGuid())
          : this.generateGuid();
        
        // Look up field IDs from schema
        const sourceFieldId = schemaData 
          ? (this.getFieldIdFromSchema(schemaData, sourceTableName, sourceFieldName) || this.generateGuid())
          : this.generateGuid();
        const targetFieldId = schemaData 
          ? (this.getFieldIdFromSchema(schemaData, targetTableName, targetFieldName) || this.generateGuid())
          : this.generateGuid();
        
        joins.push({
          JoinType: joinTypeNumber,
          Relationship: {
            RelSourceObjectID: sourceTableId,
            RelSourceFieldID: sourceFieldId,
            RelTargetObjectID: targetTableId,
            RelTargetFieldID: targetFieldId
          }
        });
      });
    }

    // Format WhereClause - should have Filters array when filters exist, empty object when no filters
    // Note: FilterLogic is not included in the output format
    const formattedWhereClause: any = whereClause.Filters.length > 0 
      ? { Filters: whereClause.Filters } 
      : {};

    // Format HavingClause - should have Filters array when filters exist, empty object when no filters
    const formattedHavingClause: any = havingClause.Filters.length > 0 
      ? { Filters: havingClause.Filters } 
      : {};

    const result: any = {
      QueryObjectID: queryObjectID,
      ResultField_AppfieldIds: resultField_AppfieldIds,
      RawSQL_AppfieldIds: rawSQL_AppfieldIds,
      GroupByFields: groupByFields || [],
      WhereClause: formattedWhereClause,
      HavingClause: formattedHavingClause,
      Joins: joins,
      Sort: sort
    };
    
    // Add TopCount if TOP clause was found
    if (topCount !== undefined) {
      result.TopCount = topCount;
    }
    
    if (hasDistinct) {
      result.Distinct = true;
    }
    
    return result;
  }
}

