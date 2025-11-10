import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() savedQueriesClick = new EventEmitter<void>();
  @Output() historyClick = new EventEmitter<void>();
  @Output() saveQueryClick = new EventEmitter<void>();

  onSavedQueriesClick(): void {
    this.savedQueriesClick.emit();
  }

  onHistoryClick(): void {
    this.historyClick.emit();
  }

  onSaveQueryClick(): void {
    this.saveQueryClick.emit();
  }
}
