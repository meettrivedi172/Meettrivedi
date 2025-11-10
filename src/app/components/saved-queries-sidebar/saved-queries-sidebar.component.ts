import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryManagementService, SavedQuery } from '../../services/query-management.service';
import { Subscription } from 'rxjs';

export type QueryFilter = 'all' | 'favorites' | 'my' | 'shared';
export type QuerySort = 'recent' | 'name' | 'mostUsed';

@Component({
  selector: 'app-saved-queries-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saved-queries-sidebar.component.html',
  styleUrl: './saved-queries-sidebar.component.css'
})
export class SavedQueriesSidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() loadQuery = new EventEmitter<SavedQuery>();
  @Output() editQuery = new EventEmitter<SavedQuery>();

  queries: SavedQuery[] = [];
  filteredQueries: SavedQuery[] = [];
  searchTerm: string = '';
  filter: QueryFilter = 'all';
  sort: QuerySort = 'recent';
  
  private subscriptions = new Subscription();

  constructor(private queryManagementService: QueryManagementService) {}

  ngOnInit(): void {
    this.loadQueries();
    
    // Subscribe to query updates
    this.subscriptions.add(
      this.queryManagementService.savedQueries$.subscribe(queries => {
        this.queries = queries;
        this.applyFiltersAndSort();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadQueries(): void {
    this.queryManagementService.getSavedQueries().subscribe(queries => {
      this.queries = queries;
      this.applyFiltersAndSort();
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  onFilterChange(filter: QueryFilter): void {
    this.filter = filter;
    this.applyFiltersAndSort();
  }

  onSortChange(sort: QuerySort): void {
    this.sort = sort;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.queries];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.name.toLowerCase().includes(search) ||
        (q.description && q.description.toLowerCase().includes(search)) ||
        q.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply visibility filter
    switch (this.filter) {
      case 'favorites':
        filtered = filtered.filter(q => q.isFavorite);
        break;
      case 'my':
        filtered = filtered.filter(q => q.visibility === 'private');
        break;
      case 'shared':
        filtered = filtered.filter(q => q.visibility === 'shared');
        break;
      case 'all':
      default:
        // No filter
        break;
    }

    // Apply sort
    switch (this.sort) {
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.updatedTimestamp).getTime() - new Date(a.updatedTimestamp).getTime()
        );
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'mostUsed':
        filtered.sort((a, b) => (b.executionCount || 0) - (a.executionCount || 0));
        break;
    }

    this.filteredQueries = filtered;
  }

  onQueryClick(query: SavedQuery): void {
    this.loadQuery.emit(query);
  }

  onToggleFavorite(event: Event, query: SavedQuery): void {
    event.stopPropagation();
    this.queryManagementService.toggleFavorite(query.id).subscribe();
  }

  onActionMenuClick(event: Event): void {
    event.stopPropagation();
  }

  onEdit(query: SavedQuery): void {
    // Emit edit event - parent component will handle opening save modal
    this.editQuery.emit(query);
  }

  onDuplicate(query: SavedQuery): void {
    const newName = `${query.name} (Copy)`;
    this.queryManagementService.duplicateQuery(query.id, newName).subscribe({
      next: () => {
        // Query duplicated, list will update automatically via subscription
      },
      error: (error) => {
        console.error('Error duplicating query:', error);
      }
    });
  }

  onShare(query: SavedQuery): void {
    // Generate shareable link (mock for now)
    const shareUrl = `${window.location.origin}/query/${query.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Show toast notification (would use toast service)
      alert('Shareable link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  }

  onDelete(query: SavedQuery): void {
    if (confirm(`Are you sure you want to delete "${query.name}"? This action cannot be undone.`)) {
      this.queryManagementService.deleteQuery(query.id).subscribe({
        next: () => {
          // Query deleted, list will update automatically via subscription
        },
        error: (error) => {
          console.error('Error deleting query:', error);
        }
      });
    }
  }

  getRelativeTime(date: Date): string {
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

  formatExecutionTime(time?: number): string {
    if (!time) return 'N/A';
    return `⚡ ${time.toFixed(2)}s`;
  }
}

