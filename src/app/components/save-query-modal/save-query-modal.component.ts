import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryManagementService, SavedQuery } from '../../services/query-management.service';

@Component({
  selector: 'app-save-query-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './save-query-modal.component.html',
  styleUrl: './save-query-modal.component.css'
})
export class SaveQueryModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() existingQuery: SavedQuery | null = null;
  @Input() sqlText: string = '';
  @Input() queryJson: any = null;
  @Input() parameterValues: { [key: string]: any } = {};
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<SavedQuery, 'id' | 'createdTimestamp' | 'updatedTimestamp' | 'executionCount' | 'isFavorite'>>();

  queryName: string = '';
  description: string = '';
  tags: string = '';
  visibility: 'private' | 'shared' = 'private';
  
  errors: { [key: string]: string } = {};

  constructor(private queryManagementService: QueryManagementService) {}

  ngOnInit(): void {
    if (this.existingQuery) {
      this.queryName = this.existingQuery.name;
      this.description = this.existingQuery.description || '';
      this.tags = this.existingQuery.tags.join(', ');
      this.visibility = this.existingQuery.visibility;
    }
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  onSave(): void {
    this.errors = {};
    
    // Validate
    if (!this.queryName || this.queryName.trim().length === 0) {
      this.errors['name'] = 'Query name is required';
      return;
    }
    
    if (this.queryName.length > 100) {
      this.errors['name'] = 'Query name must be 100 characters or less';
      return;
    }
    
    if (this.description && this.description.length > 500) {
      this.errors['description'] = 'Description must be 500 characters or less';
      return;
    }
    
    // Parse tags
    const tagArray = this.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    if (tagArray.length > 10) {
      this.errors['tags'] = 'Maximum 10 tags allowed';
      return;
    }
    
    if (!this.sqlText || this.sqlText.trim().length === 0) {
      this.errors['sql'] = 'SQL query is required';
      return;
    }

    const queryData: Omit<SavedQuery, 'id' | 'createdTimestamp' | 'updatedTimestamp' | 'executionCount' | 'isFavorite'> = {
      name: this.queryName.trim(),
      description: this.description.trim() || undefined,
      tags: tagArray,
      visibility: this.visibility,
      sqlText: this.sqlText,
      queryJson: this.queryJson,
      parameterValues: Object.keys(this.parameterValues).length > 0 ? this.parameterValues : undefined,
      createdBy: this.queryManagementService.getCurrentUserId()
    };

    this.save.emit(queryData);
    this.reset();
  }

  private reset(): void {
    this.queryName = '';
    this.description = '';
    this.tags = '';
    this.visibility = 'private';
    this.errors = {};
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}

