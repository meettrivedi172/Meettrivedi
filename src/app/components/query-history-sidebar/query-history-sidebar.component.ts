import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryManagementService, QueryHistory } from '../../services/query-management.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-query-history-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './query-history-sidebar.component.html',
  styleUrl: './query-history-sidebar.component.css'
})
export class QueryHistorySidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() loadQuery = new EventEmitter<QueryHistory>();

  history: QueryHistory[] = [];
  private subscriptions = new Subscription();
  private expandedItems = new Set<string>(); // Track expanded items by ID
  private relativeTimeCache = new Map<string, string>(); // Cache relative time strings
  private timeUpdateInterval: any = null; // Timer for updating relative times

  constructor(
    private queryManagementService: QueryManagementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    
    // Subscribe to history updates
    this.subscriptions.add(
      this.queryManagementService.queryHistory$.subscribe(history => {
        this.history = history;
        this.updateRelativeTimes();
      })
    );
    
    // Update relative times every minute to keep them current
    this.timeUpdateInterval = setInterval(() => {
      this.updateRelativeTimes();
      // Use setTimeout to update after change detection cycle
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }, 60000); // Update every minute
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    this.relativeTimeCache.clear();
  }

  loadHistory(): void {
    this.queryManagementService.getQueryHistory(50).subscribe(history => {
      this.history = history;
      this.updateRelativeTimes();
    });
  }

  private updateRelativeTimes(): void {
    // Clear cache and recalculate all relative times
    this.relativeTimeCache.clear();
    this.history.forEach(item => {
      const timeStr = this.calculateRelativeTime(item.executionTimestamp);
      this.relativeTimeCache.set(item.id, timeStr);
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onLoadQuery(historyItem: QueryHistory): void {
    this.loadQuery.emit(historyItem);
  }

  onClearHistory(): void {
    if (confirm('Are you sure you want to clear all query history? This action cannot be undone.')) {
      this.queryManagementService.clearHistory().subscribe({
        next: () => {
          // History cleared, list will update automatically via subscription
        },
        error: (error) => {
          console.error('Error clearing history:', error);
        }
      });
    }
  }

  getRelativeTime(date: Date, historyItemId?: string): string {
    // Use cached value if available to prevent ExpressionChangedAfterItHasBeenCheckedError
    // The cache is updated periodically via updateRelativeTimes()
    if (historyItemId && this.relativeTimeCache.has(historyItemId)) {
      return this.relativeTimeCache.get(historyItemId)!;
    }
    
    // Fallback: calculate if not in cache (shouldn't happen normally)
    return this.calculateRelativeTime(date);
  }

  private calculateRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }

  truncateSql(sql: string, maxLength: number = 100): string {
    if (sql.length <= maxLength) return sql;
    return sql.substring(0, maxLength) + '...';
  }

  expandSql(historyItem: QueryHistory): void {
    if (this.expandedItems.has(historyItem.id)) {
      this.expandedItems.delete(historyItem.id);
    } else {
      this.expandedItems.add(historyItem.id);
    }
  }

  isExpanded(historyItem: QueryHistory): boolean {
    return this.expandedItems.has(historyItem.id);
  }
}

