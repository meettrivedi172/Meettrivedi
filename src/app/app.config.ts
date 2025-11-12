import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { setupLanguageFeatures, LanguageIdEnum } from 'monaco-sql-languages';
// Import MySQL language contribution for syntax highlighting and features
import 'monaco-sql-languages/esm/languages/mysql/mysql.contribution';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch()
    ),
    provideMonacoEditor({
      onMonacoLoad: () => {
        // Configure Monaco SQL languages when Monaco is loaded
        setupLanguageFeatures(LanguageIdEnum.MYSQL, {
          completionItems: true,
          diagnostics: true
        });
      }
    })
  ]
};
