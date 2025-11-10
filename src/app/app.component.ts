import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { DatabaseSchemaComponent } from './database-schema/database-schema.component';
import { SqlEditorComponent } from './sql-editor/sql-editor.component';
import { ToastComponent } from './components/toast/toast.component';
import { SplitterModule } from '@syncfusion/ej2-angular-layouts';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, DatabaseSchemaComponent, SqlEditorComponent, ToastComponent, SplitterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'Sql_Query_Builder';
  
  @ViewChild(SqlEditorComponent) sqlEditor!: SqlEditorComponent;

  ngAfterViewInit(): void {
    // ViewChild is now available
  }

  onSavedQueriesClick(): void {
    if (this.sqlEditor) {
      this.sqlEditor.openSavedQueriesSidebar();
    }
  }

  onHistoryClick(): void {
    if (this.sqlEditor) {
      this.sqlEditor.openQueryHistorySidebar();
    }
  }

  onSaveQueryClick(): void {
    if (this.sqlEditor) {
      this.sqlEditor.openSaveQueryModal();
    }
  }
}
