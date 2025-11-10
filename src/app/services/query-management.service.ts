import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, map, catchError, BehaviorSubject } from 'rxjs';

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  visibility: 'private' | 'shared';
  sqlText: string;
  queryJson: any;
  parameterValues?: { [key: string]: any };
  createdBy: string;
  createdTimestamp: Date;
  updatedTimestamp: Date;
  isFavorite: boolean;
  executionCount: number;
  lastRun?: Date;
  avgExecutionTime?: number;
}

export interface QueryHistory {
  id: string;
  sqlText: string;
  queryJson?: any;
  parameterValues?: { [key: string]: any };
  executionTimestamp: Date;
  status: 'success' | 'error';
  executionTime: number;
  rowCount: number;
  errorMessage?: string;
  savedQueryId?: string; // Link to saved query if it was loaded from one
}

@Injectable({
  providedIn: 'root'
})
export class QueryManagementService {
  // API endpoints (for future use)
  private apiUrl = 'https://api.techappforce.xyz/api/v1/queries'; // Placeholder
  private useLocalStorage = true; // Toggle to switch between API and local storage

  // Local storage keys
  private readonly SAVED_QUERIES_KEY = 'sql_query_builder_saved_queries';
  private readonly QUERY_HISTORY_KEY = 'sql_query_builder_query_history';
  private readonly CURRENT_USER_KEY = 'sql_query_builder_current_user';

  // Observables for reactive updates
  private savedQueriesSubject = new BehaviorSubject<SavedQuery[]>([]);
  public savedQueries$ = this.savedQueriesSubject.asObservable();

  private queryHistorySubject = new BehaviorSubject<QueryHistory[]>([]);
  public queryHistory$ = this.queryHistorySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSavedQueries();
    this.loadQueryHistory();
  }

  /**
   * Get current user ID (mock for now)
   */
  getCurrentUserId(): string {
    if (this.useLocalStorage) {
      let userId = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(this.CURRENT_USER_KEY, userId);
      }
      return userId;
    }
    // In real API, this would come from auth service
    return 'system.user@techextensor.com';
  }

  /**
   * Get current user name (mock for now)
   */
  getCurrentUserName(): string {
    if (this.useLocalStorage) {
      return 'Current User'; // Mock user name
    }
    return 'System User';
  }

  // ==================== SAVED QUERIES ====================

  /**
   * Save a query
   */
  saveQuery(query: Omit<SavedQuery, 'id' | 'createdTimestamp' | 'updatedTimestamp' | 'executionCount' | 'isFavorite'>): Observable<SavedQuery> {
    const savedQuery: SavedQuery = {
      ...query,
      id: this.generateId(),
      createdTimestamp: new Date(),
      updatedTimestamp: new Date(),
      executionCount: 0,
      isFavorite: false
    };

    if (this.useLocalStorage) {
      return this.saveQueryToLocalStorage(savedQuery);
    } else {
      return this.saveQueryToApi(savedQuery);
    }
  }

  /**
   * Update an existing query
   */
  updateQuery(id: string, updates: Partial<SavedQuery>): Observable<SavedQuery> {
    if (this.useLocalStorage) {
      return this.updateQueryInLocalStorage(id, updates);
    } else {
      return this.updateQueryInApi(id, updates);
    }
  }

  /**
   * Delete a query
   */
  deleteQuery(id: string): Observable<boolean> {
    if (this.useLocalStorage) {
      return this.deleteQueryFromLocalStorage(id);
    } else {
      return this.deleteQueryFromApi(id);
    }
  }

  /**
   * Get all saved queries
   */
  getSavedQueries(): Observable<SavedQuery[]> {
    if (this.useLocalStorage) {
      return of(this.loadSavedQueries());
    } else {
      return this.getSavedQueriesFromApi();
    }
  }

  /**
   * Get a single saved query by ID
   */
  getSavedQuery(id: string): Observable<SavedQuery | null> {
    if (this.useLocalStorage) {
      const queries = this.loadSavedQueries();
      const query = queries.find(q => q.id === id);
      return of(query || null);
    } else {
      return this.getSavedQueryFromApi(id);
    }
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): Observable<boolean> {
    if (this.useLocalStorage) {
      return this.toggleFavoriteInLocalStorage(id);
    } else {
      return this.toggleFavoriteInApi(id);
    }
  }

  /**
   * Duplicate a query
   */
  duplicateQuery(id: string, newName: string): Observable<SavedQuery> {
    if (this.useLocalStorage) {
      return this.duplicateQueryInLocalStorage(id, newName);
    } else {
      return this.duplicateQueryInApi(id, newName);
    }
  }

  // ==================== QUERY HISTORY ====================

  /**
   * Add query execution to history
   */
  addToHistory(history: Omit<QueryHistory, 'id' | 'executionTimestamp'>): Observable<QueryHistory> {
    const queryHistory: QueryHistory = {
      ...history,
      id: this.generateId(),
      executionTimestamp: new Date()
    };

    if (this.useLocalStorage) {
      return this.addToHistoryLocalStorage(queryHistory);
    } else {
      return this.addToHistoryApi(queryHistory);
    }
  }

  /**
   * Get query history
   */
  getQueryHistory(limit: number = 50): Observable<QueryHistory[]> {
    if (this.useLocalStorage) {
      return of(this.loadQueryHistory().slice(0, limit));
    } else {
      return this.getQueryHistoryFromApi(limit);
    }
  }

  /**
   * Clear query history
   */
  clearHistory(): Observable<boolean> {
    if (this.useLocalStorage) {
      return this.clearHistoryLocalStorage();
    } else {
      return this.clearHistoryApi();
    }
  }

  /**
   * Load query from history
   */
  loadQueryFromHistory(historyId: string): Observable<QueryHistory | null> {
    if (this.useLocalStorage) {
      const history = this.loadQueryHistory();
      const item = history.find(h => h.id === historyId);
      return of(item || null);
    } else {
      return this.getQueryHistoryItemFromApi(historyId);
    }
  }

  // ==================== LOCAL STORAGE IMPLEMENTATIONS ====================

  private saveQueryToLocalStorage(query: SavedQuery): Observable<SavedQuery> {
    const queries = this.loadSavedQueries();
    queries.push(query);
    this.saveSavedQueriesToStorage(queries);
    this.savedQueriesSubject.next(queries);
    return of(query).pipe(delay(100)); // Simulate API delay
  }

  private updateQueryInLocalStorage(id: string, updates: Partial<SavedQuery>): Observable<SavedQuery> {
    const queries = this.loadSavedQueries();
    const index = queries.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Query not found');
    }
    queries[index] = {
      ...queries[index],
      ...updates,
      updatedTimestamp: new Date()
    };
    this.saveSavedQueriesToStorage(queries);
    this.savedQueriesSubject.next(queries);
    return of(queries[index]).pipe(delay(100));
  }

  private deleteQueryFromLocalStorage(id: string): Observable<boolean> {
    const queries = this.loadSavedQueries();
    const filtered = queries.filter(q => q.id !== id);
    this.saveSavedQueriesToStorage(filtered);
    this.savedQueriesSubject.next(filtered);
    return of(true).pipe(delay(100));
  }

  private toggleFavoriteInLocalStorage(id: string): Observable<boolean> {
    const queries = this.loadSavedQueries();
    const index = queries.findIndex(q => q.id === id);
    if (index === -1) {
      return of(false);
    }
    queries[index].isFavorite = !queries[index].isFavorite;
    this.saveSavedQueriesToStorage(queries);
    this.savedQueriesSubject.next(queries);
    return of(queries[index].isFavorite).pipe(delay(100));
  }

  private duplicateQueryInLocalStorage(id: string, newName: string): Observable<SavedQuery> {
    const queries = this.loadSavedQueries();
    const original = queries.find(q => q.id === id);
    if (!original) {
      throw new Error('Query not found');
    }
    const duplicate: SavedQuery = {
      ...original,
      id: this.generateId(),
      name: newName,
      createdTimestamp: new Date(),
      updatedTimestamp: new Date(),
      executionCount: 0,
      isFavorite: false
    };
    queries.push(duplicate);
    this.saveSavedQueriesToStorage(queries);
    this.savedQueriesSubject.next(queries);
    return of(duplicate).pipe(delay(100));
  }

  private addToHistoryLocalStorage(history: QueryHistory): Observable<QueryHistory> {
    const historyList = this.loadQueryHistory();
    historyList.unshift(history); // Add to beginning
    // Keep only last 50
    if (historyList.length > 50) {
      historyList.splice(50);
    }
    this.saveQueryHistoryToStorage(historyList);
    this.queryHistorySubject.next(historyList);
    return of(history).pipe(delay(50));
  }

  private clearHistoryLocalStorage(): Observable<boolean> {
    this.saveQueryHistoryToStorage([]);
    this.queryHistorySubject.next([]);
    return of(true).pipe(delay(100));
  }

  private loadSavedQueries(): SavedQuery[] {
    try {
      const stored = localStorage.getItem(this.SAVED_QUERIES_KEY);
      if (!stored) {
        return [];
      }
      const queries = JSON.parse(stored);
      // Convert date strings back to Date objects
      return queries.map((q: any) => ({
        ...q,
        createdTimestamp: new Date(q.createdTimestamp),
        updatedTimestamp: new Date(q.updatedTimestamp),
        lastRun: q.lastRun ? new Date(q.lastRun) : undefined
      }));
    } catch (error) {
      console.error('Error loading saved queries:', error);
      return [];
    }
  }

  private loadQueryHistory(): QueryHistory[] {
    try {
      const stored = localStorage.getItem(this.QUERY_HISTORY_KEY);
      if (!stored) {
        return [];
      }
      const history = JSON.parse(stored);
      // Convert date strings back to Date objects
      return history.map((h: any) => ({
        ...h,
        executionTimestamp: new Date(h.executionTimestamp)
      }));
    } catch (error) {
      console.error('Error loading query history:', error);
      return [];
    }
  }

  private saveSavedQueriesToStorage(queries: SavedQuery[]): void {
    try {
      localStorage.setItem(this.SAVED_QUERIES_KEY, JSON.stringify(queries));
    } catch (error) {
      console.error('Error saving queries to storage:', error);
    }
  }

  private saveQueryHistoryToStorage(history: QueryHistory[]): void {
    try {
      localStorage.setItem(this.QUERY_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to storage:', error);
    }
  }

  // ==================== API IMPLEMENTATIONS (Placeholder) ====================

  private saveQueryToApi(query: SavedQuery): Observable<SavedQuery> {
    const headers = this.getApiHeaders();
    return this.http.post<SavedQuery>(`${this.apiUrl}/save`, query, { headers }).pipe(
      map(response => {
        const queries = this.loadSavedQueries();
        queries.push(response);
        this.savedQueriesSubject.next(queries);
        return response;
      }),
      catchError(error => {
        console.error('Error saving query to API:', error);
        return this.handleError<SavedQuery>(error);
      })
    );
  }

  private updateQueryInApi(id: string, updates: Partial<SavedQuery>): Observable<SavedQuery> {
    const headers = this.getApiHeaders();
    return this.http.put<SavedQuery>(`${this.apiUrl}/${id}`, updates, { headers }).pipe(
      map(response => {
        const queries = this.loadSavedQueries();
        const index = queries.findIndex(q => q.id === id);
        if (index !== -1) {
          queries[index] = response;
          this.savedQueriesSubject.next(queries);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error updating query in API:', error);
        return this.handleError<SavedQuery>(error);
      })
    );
  }

  private deleteQueryFromApi(id: string): Observable<boolean> {
    const headers = this.getApiHeaders();
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`, { headers }).pipe(
      map(() => {
        const queries = this.loadSavedQueries();
        const filtered = queries.filter(q => q.id !== id);
        this.savedQueriesSubject.next(filtered);
        return true;
      }),
      catchError(error => {
        console.error('Error deleting query from API:', error);
        return this.handleError<boolean>(error);
      })
    );
  }

  private getSavedQueriesFromApi(): Observable<SavedQuery[]> {
    const headers = this.getApiHeaders();
    return this.http.get<SavedQuery[]>(this.apiUrl, { headers }).pipe(
      map(queries => {
        this.savedQueriesSubject.next(queries);
        return queries;
      }),
      catchError(error => {
        console.error('Error fetching queries from API:', error);
        return this.handleError<SavedQuery[]>(error);
      })
    );
  }

  private getSavedQueryFromApi(id: string): Observable<SavedQuery | null> {
    const headers = this.getApiHeaders();
    return this.http.get<SavedQuery>(`${this.apiUrl}/${id}`, { headers }).pipe(
      map(query => query || null),
      catchError(error => {
        console.error('Error fetching query from API:', error);
        return this.handleError<SavedQuery | null>(error);
      })
    );
  }

  private toggleFavoriteInApi(id: string): Observable<boolean> {
    const headers = this.getApiHeaders();
    return this.http.post<{ isFavorite: boolean }>(`${this.apiUrl}/${id}/favorite`, {}, { headers }).pipe(
      map(response => {
        const queries = this.loadSavedQueries();
        const index = queries.findIndex(q => q.id === id);
        if (index !== -1) {
          queries[index].isFavorite = response.isFavorite;
          this.savedQueriesSubject.next(queries);
        }
        return response.isFavorite;
      }),
      catchError(error => {
        console.error('Error toggling favorite in API:', error);
        return this.handleError<boolean>(error);
      })
    );
  }

  private duplicateQueryInApi(id: string, newName: string): Observable<SavedQuery> {
    const headers = this.getApiHeaders();
    return this.http.post<SavedQuery>(`${this.apiUrl}/${id}/duplicate`, { name: newName }, { headers }).pipe(
      map(response => {
        const queries = this.loadSavedQueries();
        queries.push(response);
        this.savedQueriesSubject.next(queries);
        return response;
      }),
      catchError(error => {
        console.error('Error duplicating query in API:', error);
        return this.handleError<SavedQuery>(error);
      })
    );
  }

  private addToHistoryApi(history: QueryHistory): Observable<QueryHistory> {
    const headers = this.getApiHeaders();
    return this.http.post<QueryHistory>(`${this.apiUrl}/history`, history, { headers }).pipe(
      map(response => {
        const historyList = this.loadQueryHistory();
        historyList.unshift(response);
        if (historyList.length > 50) {
          historyList.splice(50);
        }
        this.queryHistorySubject.next(historyList);
        return response;
      }),
      catchError(error => {
        console.error('Error adding to history in API:', error);
        return this.handleError<QueryHistory>(error);
      })
    );
  }

  private getQueryHistoryFromApi(limit: number): Observable<QueryHistory[]> {
    const headers = this.getApiHeaders();
    return this.http.get<QueryHistory[]>(`${this.apiUrl}/history?limit=${limit}`, { headers }).pipe(
      map(history => {
        this.queryHistorySubject.next(history);
        return history;
      }),
      catchError(error => {
        console.error('Error fetching history from API:', error);
        return this.handleError<QueryHistory[]>(error);
      })
    );
  }

  private clearHistoryApi(): Observable<boolean> {
    const headers = this.getApiHeaders();
    return this.http.delete<boolean>(`${this.apiUrl}/history`, { headers }).pipe(
      map(() => {
        this.queryHistorySubject.next([]);
        return true;
      }),
      catchError(error => {
        console.error('Error clearing history in API:', error);
        return this.handleError<boolean>(error);
      })
    );
  }

  private getQueryHistoryItemFromApi(id: string): Observable<QueryHistory | null> {
    const headers = this.getApiHeaders();
    return this.http.get<QueryHistory>(`${this.apiUrl}/history/${id}`, { headers }).pipe(
      map(history => history || null),
      catchError(error => {
        console.error('Error fetching history item from API:', error);
        return this.handleError<QueryHistory | null>(error);
      })
    );
  }

  // ==================== HELPER METHODS ====================

  private generateId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getApiHeaders(): HttpHeaders {
    return new HttpHeaders({
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': 'Bearer [TOKEN]' // Would come from auth service
    });
  }

  private handleError<T>(error: any): Observable<T> {
    console.error('API Error:', error);
    return of(null as any);
  }

  /**
   * Update query execution stats when a query is executed
   */
  recordQueryExecution(queryId: string, executionTime: number, success: boolean): void {
    if (this.useLocalStorage) {
      const queries = this.loadSavedQueries();
      const index = queries.findIndex(q => q.id === queryId);
      if (index !== -1) {
        queries[index].executionCount = (queries[index].executionCount || 0) + 1;
        queries[index].lastRun = new Date();
        
        // Update average execution time
        const currentAvg = queries[index].avgExecutionTime || 0;
        const count = queries[index].executionCount;
        queries[index].avgExecutionTime = ((currentAvg * (count - 1)) + executionTime) / count;
        
        this.saveSavedQueriesToStorage(queries);
        this.savedQueriesSubject.next(queries);
      }
    }
  }
}

