import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface QueryExecutionResponse {
  success: boolean;
  data: any[];
  metadata: {
    rowCount: number;
    executionTime: number;
    hasMore: boolean;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QueryExecutionService {
  // TODO: Replace with actual API endpoint
  // private readonly API_ENDPOINT = '/api/query/execute';

  // constructor(private http: HttpClient) {}
  constructor() {}

  /**
   * Execute SQL query
   * @param sqlQuery The SQL query string
   * @param parameters Query parameters (key-value pairs)
   * @param sqlParserService Service to convert SQL to QueryJson
   * @returns Observable with query execution results
   */
  executeQuery(
    sqlQuery: string, 
    parameters: { [key: string]: any } = {},
    sqlParserService?: any
  ): Observable<QueryExecutionResponse> {
    // Convert SQL to QueryJson
    let queryJson: any = null;
    if (sqlParserService) {
      try {
        queryJson = sqlParserService.parseQuery(sqlQuery);
      } catch (error) {
        console.error('Failed to parse SQL to QueryJson:', error);
      }
    }

    // FOR PRODUCTION: Uncomment the code below and remove the mock data return
    /*
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // POST QueryJson to API: /api/query/execute
    const body = {
      queryJson: queryJson || { rawQuery: sqlQuery },
      parameters: parameters
    };

    return this.http.post<QueryExecutionResponse>('/api/query/execute', body, { headers });
    */

    // MOCK DATA: Return dummy data for development
    return this.getMockData(sqlQuery, parameters);
  }

  /**
   * Generate mock data based on the query
   * This simulates a real API response
   */
  private getMockData(sqlQuery: string, parameters: { [key: string]: any }): Observable<QueryExecutionResponse> {
    // Simulate API delay
    const delayMs = 200 + Math.random() * 300; // 200-500ms

    // Extract column names from SELECT clause for mock data generation
    const columnNames = this.extractColumnNames(sqlQuery);

    // Generate mock data rows
    const rowCount = 150;
    const data: any[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: any = {};
      columnNames.forEach(column => {
        row[column] = this.generateMockValue(column);
      });
      data.push(row);
    }

    const mockResponse: QueryExecutionResponse = {
      success: true,
      data: data,
      metadata: {
        rowCount: rowCount,
        executionTime: parseFloat((delayMs / 1000).toFixed(2)),
        hasMore: false
      }
    };

    return of(mockResponse).pipe(delay(delayMs));
  }

  /**
   * Extract column names from SELECT clause
   */
  private extractColumnNames(sqlQuery: string): string[] {
    const columns: string[] = [];
    const selectMatch = sqlQuery.match(/SELECT\s+(.*?)\s+FROM/is);
    
    if (!selectMatch) {
      // Default columns if parsing fails
      return ['Title', 'Description', 'ProjectName', 'Priority', 'Progress', 'TimeLogCount'];
    }

    const selectClause = selectMatch[1];
    
    // Remove comments
    const cleaned = selectClause.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Split by comma, respecting quotes and parentheses
    const parts = this.splitSelectFields(cleaned);
    
    parts.forEach(part => {
      part = part.trim();
      if (!part) return;
      
      // Handle AS alias: ... AS AliasName
      const asMatch = part.match(/.+\s+AS\s+(\w+)/i);
      if (asMatch) {
        columns.push(asMatch[1]);
        return;
      }
      
      // Handle functions with AS: COUNT(t.ID) AS TimeLogCount
      const functionAsMatch = part.match(/\w+\s*\([^)]*\)\s+AS\s+(\w+)/i);
      if (functionAsMatch) {
        columns.push(functionAsMatch[1]);
        return;
      }
      
      // Handle table.column pattern: table.ColumnName or just ColumnName
      const dotMatch = part.match(/(\w+)\.(\w+)/);
      if (dotMatch) {
        // If there's an AS, use that; otherwise use the column name after dot
        const asInPart = part.match(/AS\s+(\w+)/i);
        if (asInPart) {
          columns.push(asInPart[1]);
        } else {
          columns.push(dotMatch[2]);
        }
        return;
      }
      
      // Handle functions: COUNT(t.ID) - extract the field name inside
      const functionMatch = part.match(/\w+\s*\(\s*(?:\w+\.)?(\w+)\s*\)/i);
      if (functionMatch) {
        columns.push(functionMatch[1] + 'Count'); // Default naming for aggregates
        return;
      }
      
      // Just a column name without table prefix
      const simpleMatch = part.match(/^(\w+)/);
      if (simpleMatch) {
        columns.push(simpleMatch[1]);
      }
    });

    // Remove duplicates and empty strings
    const uniqueColumns = [...new Set(columns)].filter(c => c && c.length > 0);
    
    // If no columns extracted, return defaults
    return uniqueColumns.length > 0 ? uniqueColumns : ['Title', 'Description', 'ProjectName', 'Priority', 'Progress'];
  }

  /**
   * Split SELECT fields by comma, respecting quotes and parentheses
   */
  private splitSelectFields(fields: string): string[] {
    const result: string[] = [];
    let current = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < fields.length; i++) {
      const char = fields[i];
      
      if ((char === '"' || char === "'") && (i === 0 || fields[i - 1] !== '\\')) {
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
          result.push(current.trim());
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      result.push(current.trim());
    }
    
    return result;
  }

  /**
   * Generate mock value based on column name
   */
  private generateMockValue(columnName: string): any {
    const lowerColumn = columnName.toLowerCase();
    
    // Type detection based on column name
    if (lowerColumn.includes('id')) {
      return Math.floor(Math.random() * 1000) + 1;
    }
    if (lowerColumn.includes('date') || lowerColumn.includes('time')) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      return date.toISOString().split('T')[0];
    }
    if (lowerColumn.includes('count') || lowerColumn.includes('total') || lowerColumn.includes('amount')) {
      return Math.floor(Math.random() * 1000);
    }
    if (lowerColumn.includes('priority')) {
      return Math.floor(Math.random() * 5) + 1;
    }
    if (lowerColumn.includes('progress') || lowerColumn.includes('percentage')) {
      return Math.floor(Math.random() * 100);
    }
    if (lowerColumn.includes('boolean') || lowerColumn.includes('is') || lowerColumn.includes('has')) {
      return Math.random() > 0.5;
    }
    
    // Default: string value
    const prefixes = ['Sample', 'Test', 'Demo', 'Example', 'Item'];
    const suffixes = ['Data', 'Value', 'Record', 'Entry'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix} ${Math.floor(Math.random() * 100)}`;
  }
}

