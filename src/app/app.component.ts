import { Component } from '@angular/core';
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
export class AppComponent {
  title = 'Sql_Query_Builder';
}
