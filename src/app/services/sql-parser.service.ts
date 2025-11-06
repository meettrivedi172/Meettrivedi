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
}

