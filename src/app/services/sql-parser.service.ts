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
  private readonly operatorMap: { [key: string]: number } = {
    '=': 1,
    '!=': 2,
    '<>': 2,
    '>': 3,
    '>=': 4,
    '<': 5,
    '<=': 6,
    'LIKE': 7,
    'IN': 8,
    'NOT IN': 9,
    'IS NULL': 10,
    'IS NOT NULL': 11
  };

  private readonly conjunctionMap: { [key: string]: number } = {
    'AND': 1,
    'OR': 2
  };

  private readonly valueTypeMap: { [key: string]: number } = {
    'parameter': 2,
    'literal': 1
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

    const fieldsSection = selectMatch[1].trim();
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
   * Parse JOIN clauses
   */
  private parseJoins(sql: string): Join[] {
    const joins: Join[] = [];
    // Match: JOIN type, table name, optional alias, ON condition
    const joinRegex = /(INNER|LEFT|RIGHT|FULL)?\s+JOIN\s+(\w+)\s+(\w+)?\s+ON\s+([\w.]+)\s*=\s*([\w.]+)/gi;
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

    const whereSection = whereMatch[1].trim();
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
   * Split WHERE conditions respecting parentheses and AND/OR
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
          // Check for AND
          if (nextChars.startsWith(' AND ')) {
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
    
    // Handle IS NULL / IS NOT NULL
    const isNullMatch = condition.match(/([\w.]+)\s+(IS\s+(NOT\s+)?NULL)/i);
    if (isNullMatch) {
      return {
        Id: this.generateGuid(),
        FieldName: isNullMatch[1],
        Operator: isNullMatch[2].toUpperCase().includes('NOT') ? 11 : 10,
        Value: '',
        ValueType: 1, // literal
        Conjunction: 1, // AND
        GroupId: groupId,
        Sequence: sequence
      };
    }

    // Handle IN / NOT IN
    const inMatch = condition.match(/([\w.]+)\s+(NOT\s+)?IN\s*\(([^)]+)\)/i);
    if (inMatch) {
      const isNot = !!inMatch[2];
      const values = inMatch[3].trim();
      const isParameter = values.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: inMatch[1],
        Operator: isNot ? 9 : 8,
        Value: values,
        ValueType: isParameter ? 2 : 1,
        Conjunction: 1,
        GroupId: groupId,
        Sequence: sequence
      };
    }

    // Handle LIKE
    const likeMatch = condition.match(/([\w.]+)\s+LIKE\s+(.+)/i);
    if (likeMatch) {
      const value = likeMatch[2].trim().replace(/^['"]|['"]$/g, '');
      const isParameter = value.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: likeMatch[1],
        Operator: 7,
        Value: isParameter ? value : `'${value}'`,
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
      
      // Remove quotes but keep the value
      const isQuoted = /^['"](.*)['"]$/.test(value);
      if (isQuoted) {
        value = value.replace(/^['"]|['"]$/g, '');
      }
      
      const isParameter = value.startsWith('@');
      
      return {
        Id: this.generateGuid(),
        FieldName: fieldName,
        Operator: this.operatorMap[operator] || 1,
        Value: isParameter ? value : (isQuoted ? `'${value}'` : value),
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
    const groupByMatch = sql.match(/GROUP\s+BY\s+(.*?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/is);
    if (!groupByMatch) return [];

    const groupBySection = groupByMatch[1].trim();
    return groupBySection.split(',').map(f => f.trim()).filter(f => f);
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
          // Add conjunction (AND/OR) if not the first filter
          if (index > 0) {
            const conjunction = filter.ConjuctionClause === 2 ? 'OR' : 'AND';
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
          if (index > 0) {
            const conjunction = filter.ConjuctionClause === 2 ? 'OR' : 'AND';
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
        // SortSequence: 1 = ASC, -1 = DESC (or use Direction if available)
        let direction = 'ASC';
        if (sort.Direction) {
          direction = sort.Direction.toUpperCase();
        } else if (sort.SortSequence !== undefined) {
          direction = sort.SortSequence === -1 ? 'DESC' : 'ASC';
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

    // Handle NULL checks
    if (filter.RelationalOperator === 10 || filter.Operator === 10) {
      return `${fieldName} IS NULL`;
    }
    if (filter.RelationalOperator === 11 || filter.Operator === 11) {
      return `${fieldName} IS NOT NULL`;
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
   * Get SQL operator from operator number
   * Note: This uses the RelationalOperator numbering system where:
   * Based on user's JSON format where RelationalOperator: 3 maps to =
   */
  private getSQLOperatorFromNumber(operatorNumber: number): string {
    // Based on user's example: RelationalOperator: 3 should be =
    // The user's system appears to use: 3 = =, so we'll map accordingly
    const operatorMap: { [key: number]: string } = {
      1: '=',
      2: '!=',
      3: '=',  // Based on user's example, 3 = = (not >)
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

  /**
   * Convert SQL operator number to RelationalOperator number
   * Based on user's JSON format where RelationalOperator: 3 maps to =
   */
  private getRelationalOperatorFromSQLOperator(operatorNumber: number): number {
    // The existing system uses: 1 = =, 2 = !=, 3 = >, etc.
    // The user's system uses: 3 = = (based on example)
    // We'll create a mapping that converts to the user's format
    // For now, we'll use a simple mapping where = maps to 3
    const relationalOperatorMap: { [key: number]: number } = {
      1: 3,  // = -> 3 (based on user's example)
      2: 2,  // != -> 2
      3: 4,  // > -> 4 (or keep as 3 if user wants >)
      4: 4,  // >= -> 4
      5: 5,  // < -> 5
      6: 6,  // <= -> 6
      7: 7,  // LIKE -> 7
      8: 8,  // IN -> 8
      9: 9,  // NOT IN -> 9
      10: 10, // IS NULL -> 10
      11: 11  // IS NOT NULL -> 11
    };
    return relationalOperatorMap[operatorNumber] || 3; // Default to 3 (=)
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
    const table = schemaData.appObjects.find((obj: any) => 
      (obj.name || obj.ObjectName || '').toLowerCase() === tableName.toLowerCase()
    );

    if (!table || !table.fields) {
      return null;
    }

    // Find the field in the table
    const field = table.fields.find((f: any) => {
      const fName = (f.FieldName || f.name || '').toLowerCase();
      const fSystemName = (f.SystemDBFieldName || '').toLowerCase();
      const searchName = fieldName.toLowerCase();
      return fName === searchName || fSystemName === searchName;
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

    // Parse SELECT fields
    const resultField_AppfieldIds = this.parseSelectFields(cleanedQuery);

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

    // Parse ORDER BY
    const sort: any[] = [];
    const parsedSort = this.parseOrderBy(cleanedQuery);
    if (parsedSort && parsedSort.length > 0) {
      parsedSort.forEach((sortField: SortField, index: number) => {
        sort.push({
          FieldID: sortField.FieldName,
          SortSequence: sortField.Direction === 'DESC' ? -1 : 1,
          Sequence: index + 1
        });
      });
    }

    // Parse JOINs - API expects JoinType as number and Relationship object
    const joins: any[] = [];
    const parsedJoins = this.parseJoins(cleanedQuery);
    if (parsedJoins && parsedJoins.length > 0) {
      parsedJoins.forEach((join: Join) => {
        // Convert JoinType string to number (1 = INNER, 2 = LEFT, 3 = RIGHT, 4 = FULL)
        const joinTypeMap: { [key: string]: number } = {
          'INNER': 1,
          'LEFT': 2,
          'RIGHT': 3,
          'FULL': 4
        };
        const joinTypeNumber = joinTypeMap[join.JoinType] || 1;
        
        // Extract table name from LeftField and RightField if they contain table.field format
        const leftTableMatch = join.LeftField.match(/^(\w+)\./);
        const rightTableMatch = join.RightField.match(/^(\w+)\./);
        const leftTable = leftTableMatch ? leftTableMatch[1] : queryObjectID;
        const rightTable = rightTableMatch ? rightTableMatch[1] : join.RightObject;
        
        // Extract field names
        const leftFieldName = join.LeftField.includes('.') ? join.LeftField.split('.')[1] : join.LeftField;
        const rightFieldName = join.RightField.includes('.') ? join.RightField.split('.')[1] : join.RightField;
        
        joins.push({
          JoinType: joinTypeNumber,
          Relationship: {
            RelSourceObjectID: this.generateGuid(), // Placeholder - should be actual object ID
            RelSourceFieldID: this.generateGuid(), // Placeholder - should be actual field ID
            RelTargetObjectID: this.generateGuid(), // Placeholder - should be actual object ID
            RelTargetFieldID: this.generateGuid() // Placeholder - should be actual field ID
          }
        });
      });
    }

    // Format WhereClause - should have Filters array when filters exist, empty object when no filters
    // Note: FilterLogic is not included in the output format
    const formattedWhereClause: any = whereClause.Filters.length > 0 
      ? { Filters: whereClause.Filters } 
      : {};

    return {
      QueryObjectID: queryObjectID,
      ResultField_AppfieldIds: resultField_AppfieldIds,
      RawSQL_AppfieldIds: [],
      GroupByFields: groupByFields || [],
      WhereClause: formattedWhereClause,
      HavingClause: {},
      Joins: joins,
      Sort: sort
    };
  }
}

