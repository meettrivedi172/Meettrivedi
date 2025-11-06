import * as monaco from 'monaco-editor';

/**
 * SQL Completion Provider for Monaco Editor
 * Provides IntelliSense-style autocomplete for SQL table names and fields
 */
export class SqlCompletionProvider implements monaco.languages.CompletionItemProvider {
  private tableNames: string[] = [];
  private schemaData: Map<string, string[]> = new Map(); // tableName -> fieldNames[]
  private aliasToTableMap: Map<string, string> = new Map(); // alias -> tableName

  constructor(
    tableNames: string[],
    schemaData?: Map<string, string[]>
  ) {
    this.tableNames = tableNames.map(name => name.toLowerCase());
    if (schemaData) {
      this.schemaData = schemaData;
    }
  }

  /**
   * Update the table names for autocomplete
   */
  updateTables(tableNames: string[]): void {
    this.tableNames = tableNames.map(name => name.toLowerCase());
  }

  /**
   * Update schema data (table -> fields mapping)
   */
  updateSchema(schemaData: Map<string, string[]>): void {
    this.schemaData = schemaData;
  }

  /**
   * Trigger characters for autocomplete - SSMS-like behavior
   * CRITICAL: Include space to trigger after JOIN keywords
   */
  triggerCharacters = ['.', ' ', '\n', '\t', ',', '(', ')', '=', '<', '>', '!'];
  
  // Note: triggerKind is not a valid property, removed

  /**
   * Main completion provider method
   */
  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    // Get the word at cursor position - this is what user is currently typing
    // CRITICAL: Use getWordAtPosition to get the full word including partial typing (like "wh")
    const wordAtPosition = model.getWordAtPosition(position);
    const word = wordAtPosition || model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    // Get the text before the cursor position
    const textBeforeCursor = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    // Extract table aliases from the query (pass full text up to cursor)
    // CRITICAL: This must extract ALL aliases from ALL JOINs
    this.extractTableAliases(textBeforeCursor);
    
    // DEBUG: Log aliases extracted
    if (this.aliasToTableMap.size > 0) {
      console.log('Extracted aliases:', Array.from(this.aliasToTableMap.entries()));
    }

    // Detect SQL context first - let it do its job
    const contextInfo = this.detectSqlContext(textBeforeCursor, position);
    
    // CRITICAL FIX: Check recent text for context detection
    const recentText = textBeforeCursor.substring(Math.max(0, textBeforeCursor.length - 300));
    const recentTextTrimmed = recentText.trim();
    const textUpper = textBeforeCursor.toUpperCase();
    
    // Check clause positions to determine context
    // CRITICAL: Must check all clauses to handle WHERE, GROUP BY, ORDER BY after multiple JOINs
    const lastWhereIndex = textUpper.lastIndexOf('WHERE');
    const lastGroupByIndex = textUpper.lastIndexOf('GROUP BY');
    const lastOrderByIndex = textUpper.lastIndexOf('ORDER BY');
    const lastHavingIndex = textUpper.lastIndexOf('HAVING');
    const lastOnIndex = textUpper.lastIndexOf('ON');
    const lastJoinIndex = Math.max(
      textUpper.lastIndexOf('INNER JOIN'),
      textUpper.lastIndexOf('LEFT JOIN'),
      textUpper.lastIndexOf('RIGHT JOIN'),
      textUpper.lastIndexOf('FULL JOIN'),
      textUpper.lastIndexOf('JOIN')
    );
    
    // CRITICAL: Check if we're typing WHERE clause - this takes highest priority
    // Check multiple patterns to catch WHERE in different contexts
    // Also check for partial WHERE (like "whe", "wher", "where")
    const isTypingWhere = /\bWHERE\s*$/i.test(recentTextTrimmed) || 
                          /\bWHERE\s+\w*\s*$/i.test(recentTextTrimmed) ||
                          /\bWHE\w*\s*$/i.test(recentTextTrimmed) ||  // Partial WHERE like "whe", "wher"
                          (lastWhereIndex > -1 && lastWhereIndex > lastJoinIndex);
    
    // Check if user is typing partial WHERE keyword (like "whe", "wher")
    // Match: "whe", "wher", "wher" at the end of recent text (but not complete WHERE)
    const isTypingPartialWhere = /\b(whe|wher)\w*\s*$/i.test(recentTextTrimmed) && 
                                  !/\bWHERE\s/i.test(recentTextTrimmed.toUpperCase());
    
    // If we're in WHERE, GROUP BY, ORDER BY, HAVING, or ON clause, prioritize that over JOIN detection
    // CRITICAL: Check if cursor is after these keywords (within reasonable distance)
    // OR if user is typing partial WHERE keyword
    // BUT: Don't set isInWhereClause to true if just typing partial WHERE - let keywords show first
    const isInWhereClause = lastWhereIndex > -1 && 
                           (textBeforeCursor.length - lastWhereIndex) <= 500 &&
                           (lastWhereIndex > lastJoinIndex || isTypingWhere) &&
                           !isTypingPartialWhere; // Don't treat partial WHERE as complete WHERE clause
    const isInGroupByClause = lastGroupByIndex > -1 && 
                             (textBeforeCursor.length - lastGroupByIndex) <= 500 &&
                             lastGroupByIndex > lastJoinIndex;
    const isInOrderByClause = lastOrderByIndex > -1 && 
                              (textBeforeCursor.length - lastOrderByIndex) <= 500 &&
                              lastOrderByIndex > lastJoinIndex;
    const isInHavingClause = lastHavingIndex > -1 && 
                            (textBeforeCursor.length - lastHavingIndex) <= 500 &&
                            lastHavingIndex > lastJoinIndex;
    const isInOnClause = lastOnIndex > -1 && lastOnIndex > lastJoinIndex;
    
    // CRITICAL: Check if we're right after a JOIN keyword (before WHERE/ON)
    // This must work for ALL JOINs including second, third, etc.
    // Check if cursor is immediately after JOIN keyword (within last 100 chars)
    const veryRecentText = textBeforeCursor.substring(Math.max(0, textBeforeCursor.length - 100));
    const veryRecentTextTrimmed = veryRecentText.trim();
    
    // More aggressive JOIN detection - check if JOIN appears at the end of recent text
    // This catches: "INNER JOIN", "INNER JOIN ", "INNER JOIN tabd_", etc.
    const isRightAfterJoin = 
      /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*\w*\s*$/i.test(veryRecentTextTrimmed) ||
      /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*$/i.test(veryRecentTextTrimmed) ||
      /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*\w*\s*$/i.test(veryRecentText) ||
      /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*$/i.test(veryRecentText);
    
    // Only override with JOIN detection if we're NOT in WHERE/GROUP BY/ORDER BY/HAVING/ON clause
    // CRITICAL: This ensures suggestions work after multiple JOINs and in all clauses
    if (!isInWhereClause && !isInGroupByClause && !isInOrderByClause && !isInHavingClause && !isInOnClause) {
      // CRITICAL: Check if we're right after JOIN - this takes priority
      if (isRightAfterJoin) {
        contextInfo.needsTableNames = true;
        contextInfo.needsFieldNames = false;
        contextInfo.needsTableAliases = false;
        // CRITICAL: Log for debugging
        console.log('JOIN detected right after JOIN keyword - setting needsTableNames = true');
        console.log('Recent text:', veryRecentTextTrimmed);
      } else {
        // Fallback: Check broader recent text for JOIN patterns
        // This catches cases where user typed partial table name after JOIN
        const hasJoinInRecentText = 
          /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*\w*\s*$/i.test(recentTextTrimmed) ||
          /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*\w*\s*$/i.test(recentText) ||
          /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*$/i.test(recentTextTrimmed) ||
          /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*$/i.test(recentText);
        
        if (hasJoinInRecentText) {
          contextInfo.needsTableNames = true;
          contextInfo.needsFieldNames = false;
          contextInfo.needsTableAliases = false;
          console.log('JOIN detected in recent text - setting needsTableNames = true');
        }
      }
    } else if (isInWhereClause) {
      // CRITICAL: In WHERE clause, we need fields and aliases, NOT table names
      // Only set this if WHERE is complete (not partial)
      contextInfo.needsTableNames = false;
      contextInfo.needsFieldNames = true;
      contextInfo.needsTableAliases = true;
      // CRITICAL: Log for debugging
      console.log('WHERE clause detected - setting needsFieldNames = true, needsTableAliases = true');
      console.log('Aliases available:', Array.from(this.aliasToTableMap.keys()));
    } else if (isInGroupByClause) {
      // CRITICAL: In GROUP BY clause, we need fields and aliases, NOT table names
      contextInfo.needsTableNames = false;
      contextInfo.needsFieldNames = true;
      contextInfo.needsTableAliases = true;
      console.log('GROUP BY clause detected - setting needsFieldNames = true, needsTableAliases = true');
    } else if (isInOrderByClause) {
      // CRITICAL: In ORDER BY clause, we need fields and aliases, NOT table names
      contextInfo.needsTableNames = false;
      contextInfo.needsFieldNames = true;
      contextInfo.needsTableAliases = true;
      console.log('ORDER BY clause detected - setting needsFieldNames = true, needsTableAliases = true');
    } else if (isInHavingClause) {
      // CRITICAL: In HAVING clause, we need fields and aliases, NOT table names
      contextInfo.needsTableNames = false;
      contextInfo.needsFieldNames = true;
      contextInfo.needsTableAliases = true;
      console.log('HAVING clause detected - setting needsFieldNames = true, needsTableAliases = true');
    } else if (isTypingPartialWhere) {
      // User is typing partial WHERE keyword (like "whe", "wher")
      // Don't override context - let keywords show first
      // After WHERE is complete, the WHERE clause detection will kick in
      console.log('Typing partial WHERE keyword - showing WHERE keyword suggestion');
      // Don't override contextInfo - let keyword suggestions show
    }
    
    // Store clause positions for later use (for SSMS-like suggestions)
    // Note: textUpper and lastJoinIndex already declared above
    const lastFromIndex = textUpper.lastIndexOf('FROM');

    const suggestions: monaco.languages.CompletionItem[] = [];

    // Check if we're after a dot (table alias.field context)
    // CRITICAL: This must work in WHERE clause too!
    if (contextInfo.isAfterDot && contextInfo.aliasOrTable) {
      // Get the table name for this alias
      const tableName = this.getTableNameForAlias(contextInfo.aliasOrTable);
      if (tableName) {
        // Suggest field names for the table (filtered by what user is typing)
        const fields = this.schemaData.get(tableName.toLowerCase()) || [];
        const wordLower = word.word.toLowerCase();
        
        fields.forEach(fieldName => {
          const fieldNameLower = fieldName.toLowerCase();
          // Show suggestion if it matches what user is typing (contains, starts with, or empty)
          const shouldShow = 
            word.word === '' ||  // Show all if nothing typed
            fieldNameLower.includes(wordLower) || 
            fieldNameLower.startsWith(wordLower);
          
          if (shouldShow) {
            suggestions.push({
              label: fieldName,
              kind: monaco.languages.CompletionItemKind.Field,
              documentation: `Field from ${contextInfo.aliasOrTable} (${tableName})`,
              insertText: fieldName,
              range: range,
              sortText: '1' + fieldName.toLowerCase(), // High priority for fields
              preselect: fieldNameLower === wordLower
            });
          }
        });
      }
      
      // CRITICAL: Return early if we have field suggestions from dot
      // This ensures field suggestions appear even in WHERE clause
      if (suggestions.length > 0) {
        return {
          suggestions: suggestions,
          incomplete: false
        };
      }
    }

    // Suggest table names (after FROM, JOIN, etc.)
    // CRITICAL: This must always show suggestions when needsTableNames is true
    // This works for ALL JOINs including second, third, etc.
    if (contextInfo.needsTableNames) {
      console.log('Showing table suggestions - needsTableNames is true');
      const wordLower = word.word.toLowerCase();
      
      // Filter out "as" keyword if user typed it
      const filterWord = wordLower === 'as' ? '' : wordLower;
      
      // SSMS-like: Always show all tables when needsTableNames is true
      // Filter by what user is typing if they've typed something
      // CRITICAL: Show suggestions even if word is empty (immediately after JOIN)
      let tableSuggestionsCount = 0;
      this.tableNames.forEach(tableName => {
        const tableNameLower = tableName.toLowerCase();
        // Show table if:
        // 1. User hasn't typed anything (show all tables) - CRITICAL for immediate suggestions
        // 2. User typed "as" (show all tables)
        // 3. Table name matches what user is typing (starts with or contains)
        const shouldShow = 
            filterWord === '' ||  // Show all if nothing typed (immediately after JOIN)
            tableNameLower.startsWith(filterWord) ||  // Starts with (for partial matches like "tabd_e" -> "tabd_environment")
            tableNameLower.includes(filterWord);  // Contains (fuzzy matching)
        
        if (shouldShow) {
          tableSuggestionsCount++;
          const displayName = this.getTableDisplayName(tableName);
          suggestions.push({
            label: tableName,
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: `Table: ${displayName}`,
            insertText: tableName,
            range: range,
            sortText: '1' + tableName.toLowerCase(),
            preselect: tableNameLower === filterWord
          });
        }
      });
      
      console.log(`Added ${tableSuggestionsCount} table suggestions`);
      
      // CRITICAL: Return immediately if we have table suggestions
      // This ensures suggestions appear even if other logic tries to interfere
      // This works for ALL JOINs including second, third, etc.
      if (suggestions.length > 0) {
        console.log('Returning table suggestions immediately');
        return {
          suggestions: suggestions,
          incomplete: false
        };
      } else {
        console.warn('needsTableNames is true but no table suggestions were generated!');
      }
    }

    // Suggest table aliases (in SELECT, WHERE, ON clauses after FROM)
    // CRITICAL: This must work in WHERE clause!
    // Allow aliases and field names to both show in SELECT clause
    if (contextInfo.needsTableAliases && !contextInfo.isAfterDot && !contextInfo.needsTableNames) {
      const wordLower = word.word.toLowerCase();
      
      // Show ALL aliases if we have any
      this.aliasToTableMap.forEach((tableName, alias) => {
        // Suggest ALL aliases (including ones that match table name)
        // In WHERE clause, we want to show all aliases for easy selection
        const shouldShow = 
          word.word === '' ||  // Show all if nothing typed
          alias.includes(wordLower) || 
          alias.startsWith(wordLower) ||
          // Also show if table name matches (for self-referencing aliases)
          (alias === tableName.toLowerCase() && (word.word === '' || tableName.toLowerCase().includes(wordLower)));
        
        if (shouldShow) {
          suggestions.push({
            label: alias,
            kind: monaco.languages.CompletionItemKind.Variable,
            documentation: `Table alias for ${tableName}`,
            insertText: alias,
            range: range,
            sortText: '0' + alias.toLowerCase()
          });
        }
      });
    }

    // Suggest field names (in SELECT clause, WHERE clause, or after table.field)
    // CRITICAL: This must work in WHERE clause!
    if (contextInfo.needsFieldNames && !contextInfo.isAfterDot) {
      // DEBUG: Log if we're trying to show field names
      console.log(`Trying to show field names - needsFieldNames: ${contextInfo.needsFieldNames}, aliasCount: ${this.aliasToTableMap.size}, schemaCount: ${this.schemaData.size}`);
      // If we have a current table, suggest its fields
      if (contextInfo.currentTable) {
        const tableName = this.getTableNameForAlias(contextInfo.currentTable) || contextInfo.currentTable;
        const fields = this.schemaData.get(tableName.toLowerCase()) || [];
        const wordLower = word.word.toLowerCase();
        
        fields.forEach(fieldName => {
          const fieldNameLower = fieldName.toLowerCase();
          // Show field if it matches what user is typing (contains, starts with, or empty)
          const shouldShow = 
            word.word === '' ||  // Show all if nothing typed
            fieldNameLower.includes(wordLower) || 
            fieldNameLower.startsWith(wordLower);
          
          if (shouldShow) {
            suggestions.push({
              label: fieldName,
              kind: monaco.languages.CompletionItemKind.Field,
              documentation: `Field from ${contextInfo.currentTable} (${tableName})`,
              insertText: fieldName,
              range: range,
              sortText: '2' + fieldName.toLowerCase(),
              preselect: fieldNameLower === wordLower
            });
          }
        });
      } else if (contextInfo.needsFieldNames && this.aliasToTableMap.size > 0) {
        // If no specific table but we need field names, suggest from all tables
        // CRITICAL: This is important for WHERE clause - show all fields from all tables
        const wordLower = word.word.toLowerCase();
        this.aliasToTableMap.forEach((tableName, alias) => {
          const fields = this.schemaData.get(tableName.toLowerCase()) || [];
          fields.forEach(fieldName => {
            const fieldNameLower = fieldName.toLowerCase();
            const shouldShow = 
              word.word === '' ||  // Show all if nothing typed
              fieldNameLower.includes(wordLower) || 
              fieldNameLower.startsWith(wordLower);
            
            if (shouldShow) {
              // Show field with table alias prefix (e.g., "r.Id", "ar.Name")
              suggestions.push({
                label: `${alias}.${fieldName}`,
                kind: monaco.languages.CompletionItemKind.Field,
                documentation: `Field ${fieldName} from ${alias} (${tableName})`,
                insertText: `${alias}.${fieldName}`,
                range: range,
                sortText: '2' + alias.toLowerCase() + fieldName.toLowerCase(),
                preselect: fieldNameLower === wordLower
              });
            }
          });
        });
      }
    }

    // SSMS-like behavior: Always suggest SQL keywords (unless we're specifically in a field context after dot)
    // Show keywords even when typing to provide full SQL intelligence - like SSMS
    // CRITICAL: This must work when typing partial WHERE (like "whe")
    // CRITICAL: Always show keywords when typing partial WHERE, even if isAfterDot is true
    // This ensures WHERE keyword appears even if dot detection incorrectly triggered
    const sqlKeywords = this.getSqlKeywords();
    const wordLower = word.word.toLowerCase();
    
    // CRITICAL: Check if user is typing partial WHERE - if so, always show keywords
    const isTypingPartialWhereKeyword = wordLower.length >= 2 && wordLower.startsWith('wh');
    
    // Allow keywords if:
    // 1. Not after dot (normal case)
    // 2. After dot BUT typing partial WHERE (override dot detection for WHERE)
    const shouldShowKeywords = !contextInfo.isAfterDot || isTypingPartialWhereKeyword;
    
    if (shouldShowKeywords) {
      
      // CRITICAL: Check if user is typing partial WHERE (like "wh", "whe", "wher")
      const veryRecentTextForKeyword = textBeforeCursor.substring(Math.max(0, textBeforeCursor.length - 50));
      const isTypingPartialWhere = /\b(wh|whe|wher)\w*\s*$/i.test(veryRecentTextForKeyword.trim()) && 
                                  !/\bWHERE\s/i.test(veryRecentTextForKeyword.toUpperCase());
      
      // DEBUG: Log for WHERE keyword detection
      console.log('Keyword suggestions - word:', word.word, 'wordLower:', wordLower);
      console.log('isTypingPartialWhere:', isTypingPartialWhere);
      console.log('Very recent text:', veryRecentTextForKeyword.trim());
      
      // SSMS shows keywords even when user hasn't typed anything yet (on space, newline, etc.)
      // Show keywords more aggressively
      sqlKeywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // CRITICAL: If typing partial WHERE, prioritize WHERE keyword
        const isWhereKeyword = keywordLower === 'where';
        
        // CRITICAL: Check if user typed "wh", "whe", "wher", "where" - match partial WHERE
        const matchesPartialWhere = isTypingPartialWhere && isWhereKeyword;
        // CRITICAL: Check if word starts with "wh" (partial WHERE) - this catches "wh", "whe", "wher", "where"
        const matchesPartialWhereByWord = wordLower.length >= 2 && wordLower.startsWith('wh') && isWhereKeyword;
        
        // CRITICAL: Check if keyword starts with what user typed (e.g., "wh" -> "where")
        const keywordStartsWithWord = keywordLower.startsWith(wordLower);
        
        // Show keyword if:
        // 1. CRITICAL: If typing partial WHERE (like "wh", "whe", "wher"), show WHERE keyword
        // 2. CRITICAL: If word starts with "wh" and keyword is WHERE, show it
        // 3. CRITICAL: Keyword starts with what user typed (e.g., "wh" -> "where")
        // 4. It matches what user is typing (starts with, contains, or exact match)
        // 5. User just typed a space or trigger character (always show relevant keywords)
        // 6. User hasn't typed anything yet (show all keywords)
        const shouldShow = 
          matchesPartialWhere ||  // CRITICAL: Show WHERE when typing "wh"/"whe" in recent text
          matchesPartialWhereByWord ||  // CRITICAL: Show WHERE when word starts with "wh"
          keywordStartsWithWord ||  // CRITICAL: Show WHERE when typing "wh" (keyword starts with "wh")
          wordLower.length === 0 || 
          keywordLower.includes(wordLower) ||
          (word.word.length === 0 && context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerCharacter);
        
        if (shouldShow) {
          console.log('Adding keyword suggestion:', keyword, 'wordLower:', wordLower, 'keywordLower:', keywordLower, 'keywordStartsWithWord:', keywordStartsWithWord);
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            documentation: `SQL keyword: ${keyword}`,
            insertText: keyword,
            range: range,
            sortText: (isWhereKeyword && (matchesPartialWhere || matchesPartialWhereByWord || keywordStartsWithWord)) ? '0' + keyword.toLowerCase() : '9' + keyword.toLowerCase(), // Higher priority for WHERE when typing partial
            preselect: keywordLower === wordLower || matchesPartialWhere || matchesPartialWhereByWord || keywordStartsWithWord // Preselect if exact match or matching partial WHERE
          });
        }
      });
      
      console.log('Total keyword suggestions:', suggestions.filter(s => s.kind === monaco.languages.CompletionItemKind.Keyword).length);
    }

    // CRITICAL: If we're in WHERE, GROUP BY, ORDER BY, or HAVING clause and have no suggestions yet, show aliases and fields
    // This is a fallback to ensure clause suggestions always appear after multiple JOINs
    if (suggestions.length === 0 && contextInfo.needsFieldNames && contextInfo.needsTableAliases) {
      console.log('Clause (WHERE/GROUP BY/ORDER BY/HAVING): No suggestions yet, showing aliases and fields as fallback');
      
      // Show table aliases
      if (this.aliasToTableMap.size > 0 && !contextInfo.isAfterDot) {
        this.aliasToTableMap.forEach((tableName, alias) => {
          suggestions.push({
            label: alias,
            kind: monaco.languages.CompletionItemKind.Variable,
            documentation: `Table alias for ${tableName}`,
            insertText: alias,
            range: range,
            sortText: '0' + alias.toLowerCase()
          });
        });
      }
      
      // Show fields from all tables
      if (this.aliasToTableMap.size > 0 && !contextInfo.isAfterDot) {
        this.aliasToTableMap.forEach((tableName, alias) => {
          const fields = this.schemaData.get(tableName.toLowerCase()) || [];
          fields.forEach(fieldName => {
            suggestions.push({
              label: `${alias}.${fieldName}`,
              kind: monaco.languages.CompletionItemKind.Field,
              documentation: `Field ${fieldName} from ${alias} (${tableName})`,
              insertText: `${alias}.${fieldName}`,
              range: range,
              sortText: '2' + alias.toLowerCase() + fieldName.toLowerCase()
            });
          });
        });
      }
    }
    
    // SSMS-like: If no suggestions yet and user just typed a space or trigger character,
    // show all relevant suggestions (tables, aliases, fields, keywords)
    if (suggestions.length === 0 && (word.word.length === 0 || context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerCharacter)) {
      // Show table aliases if available
      if (this.aliasToTableMap.size > 0 && !contextInfo.isAfterDot) {
        this.aliasToTableMap.forEach((tableName, alias) => {
          if (alias !== tableName.toLowerCase()) {
            suggestions.push({
              label: alias,
              kind: monaco.languages.CompletionItemKind.Variable,
              documentation: `Table alias for ${tableName}`,
              insertText: alias,
              range: range,
              sortText: '0' + alias.toLowerCase()
            });
          }
        });
      }
      
      // Show table names if we're in a context where tables make sense
      if (!contextInfo.isAfterDot && !contextInfo.needsFieldNames && (lastFromIndex > -1 || lastJoinIndex > -1)) {
        this.tableNames.forEach(tableName => {
          const tableNameLower = tableName.toLowerCase();
          const displayName = this.getTableDisplayName(tableName);
          suggestions.push({
            label: tableName,
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: `Table: ${displayName}`,
            insertText: tableName,
            range: range,
            sortText: '1' + tableName.toLowerCase()
          });
        });
      }
    }

    // DEBUG: Log final suggestions before returning
    console.log('Final suggestions count:', suggestions.length, 'Context:', {
      needsTableNames: contextInfo.needsTableNames,
      needsFieldNames: contextInfo.needsFieldNames,
      needsTableAliases: contextInfo.needsTableAliases,
      isAfterDot: contextInfo.isAfterDot,
      aliasCount: this.aliasToTableMap.size,
      tableCount: this.tableNames.length,
      schemaCount: this.schemaData.size
    });
    
    // CRITICAL: If WHERE, GROUP BY, ORDER BY, or HAVING clause detected but no suggestions, force show them
    // This ensures suggestions work after multiple JOINs
    const textUpperForClause = textBeforeCursor.toUpperCase();
    const lastWhereIndexForForce = textUpperForClause.lastIndexOf('WHERE');
    const lastGroupByIndexForForce = textUpperForClause.lastIndexOf('GROUP BY');
    const lastOrderByIndexForForce = textUpperForClause.lastIndexOf('ORDER BY');
    const lastHavingIndexForForce = textUpperForClause.lastIndexOf('HAVING');
    const isInClause = (lastWhereIndexForForce > -1 || lastGroupByIndexForForce > -1 || 
                       lastOrderByIndexForForce > -1 || lastHavingIndexForForce > -1) && 
                       suggestions.length === 0 && !contextInfo.needsTableNames;
    
    if (isInClause) {
      const clauseName = lastWhereIndexForForce > -1 ? 'WHERE' : 
                        lastGroupByIndexForForce > -1 ? 'GROUP BY' :
                        lastOrderByIndexForForce > -1 ? 'ORDER BY' : 'HAVING';
      console.log(`${clauseName} clause detected but no suggestions - forcing suggestions`);
      // Force show aliases and fields
      if (this.aliasToTableMap.size > 0) {
        this.aliasToTableMap.forEach((tableName, alias) => {
          // Show alias
          suggestions.push({
            label: alias,
            kind: monaco.languages.CompletionItemKind.Variable,
            documentation: `Table alias for ${tableName}`,
            insertText: alias,
            range: range,
            sortText: '0' + alias.toLowerCase()
          });
          
          // Show fields from this table
          const fields = this.schemaData.get(tableName.toLowerCase()) || [];
          fields.forEach(fieldName => {
            suggestions.push({
              label: `${alias}.${fieldName}`,
              kind: monaco.languages.CompletionItemKind.Field,
              documentation: `Field ${fieldName} from ${alias} (${tableName})`,
              insertText: `${alias}.${fieldName}`,
              range: range,
              sortText: '2' + alias.toLowerCase() + fieldName.toLowerCase()
            });
          });
        });
      }
      console.log(`After forcing ${clauseName} suggestions, count:`, suggestions.length);
    }
    
    return {
      suggestions: suggestions,
      incomplete: false
    };
  }

  /**
   * Extract table aliases from the query text
   * Improved to handle long queries with multiple JOINs
   */
  private extractTableAliases(text: string): void {
    this.aliasToTableMap.clear();
    
    // SQL keywords that shouldn't be treated as aliases
    const sqlKeywords = new Set(['as', 'on', 'inner', 'left', 'right', 'full', 'outer', 'join', 'where', 'group', 'order', 'having', 'limit', 'offset', 'union', 'select', 'from', 'insert', 'update', 'delete', 'by', 'and', 'or', 'not', 'in', 'like', 'between', 'is', 'null']);
    
    // Extract FROM table and alias
    // Patterns: FROM table, FROM table alias, FROM table AS alias
    // Match table names with underscores: \w+ matches [a-zA-Z0-9_]
    const fromPattern = /FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    let fromMatch;
    while ((fromMatch = fromPattern.exec(text)) !== null) {
      const tableName = fromMatch[1].toLowerCase();
      let alias = fromMatch[2]?.toLowerCase();
      
      // Get the full match text and what comes after
      const matchEnd = fromMatch.index + fromMatch[0].length;
      const afterMatch = text.substring(matchEnd).trim();
      
      // If no alias was captured by regex, check if next word is an alias
      if (!alias && afterMatch) {
        const nextWordMatch = afterMatch.match(/^(\w+)/);
        if (nextWordMatch) {
          const nextWord = nextWordMatch[1].toLowerCase();
          // If next word is not a SQL keyword, treat it as alias
          if (!sqlKeywords.has(nextWord)) {
            alias = nextWord;
          }
        }
      }
      
      // Map alias to table if alias exists and is not a keyword
      if (alias && !sqlKeywords.has(alias)) {
        this.aliasToTableMap.set(alias, tableName);
      }
      // Always map table name to itself (can use table name as alias)
      this.aliasToTableMap.set(tableName, tableName);
    }
    
    // Extract JOIN tables and aliases
    // Patterns: JOIN table, JOIN table alias, JOIN table AS alias
    // Handle: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, CROSS JOIN
    const joinPattern = /(?:INNER|LEFT|RIGHT|FULL|CROSS)?\s+JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    let joinMatch;
    while ((joinMatch = joinPattern.exec(text)) !== null) {
      const tableName = joinMatch[1].toLowerCase();
      let alias = joinMatch[2]?.toLowerCase();
      
      // If no alias was captured, check next word
      if (!alias) {
        const afterMatch = text.substring(joinMatch.index + joinMatch[0].length).trim();
        const nextWordMatch = afterMatch.match(/^(\w+)/);
        if (nextWordMatch) {
          const nextWord = nextWordMatch[1].toLowerCase();
          // Next word should not be 'ON' or any SQL keyword
          if (nextWord !== 'on' && !sqlKeywords.has(nextWord)) {
            alias = nextWord;
          }
        }
      }
      
      // Map alias to table if alias exists and is not a keyword
      if (alias && !sqlKeywords.has(alias)) {
        this.aliasToTableMap.set(alias, tableName);
      }
      // Always map table name to itself
      this.aliasToTableMap.set(tableName, tableName);
    }
  }

  /**
   * Get table name for a given alias
   */
  private getTableNameForAlias(aliasOrTable: string): string | null {
    return this.aliasToTableMap.get(aliasOrTable.toLowerCase()) || null;
  }

  /**
   * Detect the SQL context to determine what to suggest
   * Improved for long queries - analyzes full query context
   */
  private detectSqlContext(text: string, position: monaco.Position): {
    needsTableNames: boolean;
    needsFieldNames: boolean;
    needsTableAliases: boolean;
    currentTable: string | null;
    aliasOrTable: string | null;
    isAfterDot: boolean;
  } {
    const textUpper = text.toUpperCase();
    
    let needsTableNames = false;
    let needsFieldNames = false;
    let needsTableAliases = false;
    let currentTable: string | null = null;
    let aliasOrTable: string | null = null;
    let isAfterDot = false;

    // Get the last 500 characters for better context analysis (increased for complex queries)
    // This ensures we capture context even in very long queries with multiple JOINs
    const recentText = text.substring(Math.max(0, text.length - 500));
    const recentTextUpper = recentText.toUpperCase().trim();
    
    // Check if cursor is immediately after a dot (table.field context)
    // CRITICAL: This must work in WHERE clause too!
    // CRITICAL: Only detect dot if it's VERY close to cursor (within last 20 chars)
    // This prevents false positives from dots in JOIN clauses
    const lastDotIndex = text.lastIndexOf('.');
    // Check if dot is VERY close to the cursor (within last 20 characters)
    // This ensures we only detect dots that are actually relevant to current typing
    if (lastDotIndex > 0 && lastDotIndex >= text.length - 20) {
      // Get text after the dot to see if cursor is right after it
      const textAfterDot = text.substring(lastDotIndex + 1).trim();
      // Only set isAfterDot if there's very little text after the dot (cursor is right after dot)
      // This prevents false detection from dots in JOIN clauses like "a.Id = u.Id"
      if (textAfterDot.length <= 5) {
        // Extract table name/alias before the dot
        // Get more context before the dot to find the alias
        const textBeforeDot = text.substring(Math.max(0, lastDotIndex - 50), lastDotIndex).trim();
        // Match word characters (alias/table name) right before the dot
        // This handles "WHERE r." - should find "r" as the alias
        const tableMatch = textBeforeDot.match(/(\w+)\s*$/);
        if (tableMatch) {
          aliasOrTable = tableMatch[1];
          isAfterDot = true;
          needsFieldNames = true;
          needsTableNames = false;
          needsTableAliases = false;
          // CRITICAL: Return early - dot detection takes priority over everything
          // This ensures "r." in WHERE clause shows fields from table "r"
          return {
            needsTableNames: false,
            needsFieldNames: true,
            needsTableAliases: false,
            currentTable: null,
            aliasOrTable: aliasOrTable,
            isAfterDot: true
          };
        }
      }
    }
    
    // Find all clause positions in the full query
    const lastSelectIndex = textUpper.lastIndexOf('SELECT');
    const lastFromIndex = textUpper.lastIndexOf('FROM');
    const lastWhereIndex = textUpper.lastIndexOf('WHERE');
    const lastGroupByIndex = textUpper.lastIndexOf('GROUP BY');
    const lastOrderByIndex = textUpper.lastIndexOf('ORDER BY');
    const lastHavingIndex = textUpper.lastIndexOf('HAVING');
    const lastOnIndex = textUpper.lastIndexOf('ON');
    const lastJoinIndex = Math.max(
      textUpper.lastIndexOf('INNER JOIN'),
      textUpper.lastIndexOf('LEFT JOIN'),
      textUpper.lastIndexOf('RIGHT JOIN'),
      textUpper.lastIndexOf('FULL JOIN'),
      textUpper.lastIndexOf('JOIN')
    );
    
    // Determine which clause we're currently in
    const clausePositions = [
      { name: 'SELECT', pos: lastSelectIndex },
      { name: 'FROM', pos: lastFromIndex },
      { name: 'WHERE', pos: lastWhereIndex },
      { name: 'GROUP BY', pos: lastGroupByIndex },
      { name: 'ORDER BY', pos: lastOrderByIndex },
      { name: 'HAVING', pos: lastHavingIndex },
      { name: 'ON', pos: lastOnIndex }
    ].filter(c => c.pos > -1).sort((a, b) => b.pos - a.pos);
    
    // Get the current clause (the one we're in based on position)
    const currentClause = clausePositions.length > 0 ? clausePositions[0].name : null;
    
    // SSMS-like detection: Check if we're after FROM, JOIN keywords (needs table names)
    // Improved pattern to detect JOIN contexts better - more aggressive like SSMS
    const recentTextTrimmed = recentText.trim();
    const lastWord = recentTextTrimmed.match(/(\w+)\s*$/)?.[1]?.toLowerCase() || '';
    
    // SIMPLIFIED and RELIABLE detection - check if we're after JOIN keywords
    // This simple approach works for ALL cases including second JOIN
    const recentTextRaw = recentText;
    
    // Simple, reliable pattern: Match "INNER JOIN" (or any JOIN) followed by optional word at end
    // This catches: "INNER JOIN", "INNER JOIN ", "INNER JOIN tabd_e"
    const needsTableAfterKeyword = 
      // After FROM keyword
      /FROM\s+\w*\s*$/i.test(recentTextTrimmed) ||
      // After any JOIN keyword - SIMPLE and RELIABLE pattern
      // Matches: "JOIN", "JOIN ", "JOIN tabd_e", "INNER JOIN", "INNER JOIN ", "INNER JOIN tabd_e"
      /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*\w*\s*$/i.test(recentTextTrimmed) ||
      /\b(INNER|LEFT|RIGHT|FULL|OUTER|CROSS)?\s*JOIN\s*\w*\s*$/i.test(recentTextRaw) ||
      // Match "JOIN AS" cases
      /\bJOIN\s+AS\s*$/i.test(recentTextTrimmed) ||
      /FROM\s+AS\s*$/i.test(recentTextTrimmed);
    
    if (needsTableAfterKeyword) {
      needsTableNames = true;
      // Clear other flags when we need table names
      needsFieldNames = false;
      needsTableAliases = false;
    }
    
    // CRITICAL FIX: Check ALL JOINs in the query, not just the last one
    // This handles multiple JOINs - find the JOIN we're currently typing after
    // Only check if recent text detection didn't already find it
    if (!needsTableNames) {
      // Find all JOIN positions and check if cursor is right after any of them
      // Use a more comprehensive pattern to find all JOIN types
      const allJoinPatterns = [
        /(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|CROSS\s+JOIN|OUTER\s+JOIN|JOIN)/gi
      ];
      
      // Find all JOIN keywords in the query
      const joinMatches: Array<{ index: number; match: string; length: number }> = [];
      for (const pattern of allJoinPatterns) {
        // Reset regex lastIndex to ensure we search from the beginning
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(textUpper)) !== null) {
          joinMatches.push({ 
            index: match.index, 
            match: match[0],
            length: match[0].length
          });
        }
      }
      
      // Sort by position (most recent/closest to cursor first)
      joinMatches.sort((a, b) => b.index - a.index);
      
      // Check if we're right after any JOIN keyword
      // For each JOIN, check if cursor is right after it (within reasonable distance)
      for (const joinMatch of joinMatches) {
        const joinIndex = joinMatch.index;
        const joinEndIndex = joinIndex + joinMatch.length;
        // Get text after JOIN without trimming first (to check for whitespace)
        const textAfterJoinRaw = text.substring(joinEndIndex);
        const textAfterJoinTrimmed = textAfterJoinRaw.trim();
        const cursorDistance = text.length - joinEndIndex;
        
        // Only check JOINs that are close to the cursor (within 500 chars)
        // CRITICAL: Check if cursor is RIGHT AFTER the JOIN keyword
        if (cursorDistance <= 500 && cursorDistance >= 0) {
          // Check if we're typing right after this JOIN (with or without table name)
          // More precise patterns to match exactly what we need
          // We need to detect: "INNER JOIN " (with space), "INNER JOIN" (no space), "INNER JOIN AS"
          // Also allow partial table names (user might be typing)
          
          const needsTable = 
            // "INNER JOIN" (no text after JOIN at all - cursor is right after JOIN)
            textAfterJoinRaw.length === 0 ||
            // "INNER JOIN " (just whitespace, no table name yet) - CRITICAL for immediate suggestions
            (textAfterJoinTrimmed === '' && textAfterJoinRaw.length > 0) ||
            // "INNER JOIN " (trailing space(s), cursor right after space)
            /^\s+$/i.test(textAfterJoinRaw) ||
            // "INNER JOIN AS" (needs table before AS)
            /^\s+AS\s*$/i.test(textAfterJoinRaw) ||
            // CRITICAL: Allow partial table names - if user is typing a table name, still show suggestions
            // This helps with autocomplete even when partial text is typed (like "tabd_e")
            // Match any word characters after JOIN (partial or complete table name)
            // This is KEY - if user is typing "tabd_e" after JOIN, we still need suggestions
            (textAfterJoinTrimmed.length > 0 && textAfterJoinTrimmed.length < 50 && /^\w+$/i.test(textAfterJoinTrimmed)) ||
            // Also match if there's whitespace followed by word characters (for cases like "INNER JOIN tabd_e")
            /^\s+\w+$/i.test(textAfterJoinRaw) ||
            // CRITICAL FIX: If cursor is within 50 chars after JOIN and there's any word being typed, show suggestions
            // This handles "INNER JOIN tabd_e" where user is actively typing
            (cursorDistance <= 50 && textAfterJoinTrimmed.length > 0 && /^\w+$/i.test(textAfterJoinTrimmed));
          
          if (needsTable) {
            needsTableNames = true;
            needsFieldNames = false;
            needsTableAliases = false;
            break; // Found the JOIN we're typing after, no need to check others
          }
        }
      }
    }
    
    // If we're in SELECT clause (after FROM) - SSMS-like: show all fields from all tables
    if (currentClause === 'SELECT' && lastFromIndex > lastSelectIndex && !isAfterDot && !needsTableNames) {
      // After FROM, suggest table aliases and field names from ALL tables
      if (this.aliasToTableMap.size > 0) {
        needsTableAliases = true;
      }
      // Always show field names in SELECT clause (from all tables)
      needsFieldNames = true;
      
      // Try to detect which table we're working with (for context)
      const fromMatch = textUpper.match(/FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/);
      if (fromMatch) {
        currentTable = (fromMatch[2] || fromMatch[1]).toLowerCase();
      }
    }
    
    // If we're in WHERE clause - SSMS-like: show all table aliases and fields
    // CRITICAL: This must work even after multiple JOINs
    // Check both currentClause and position relative to WHERE keyword
    if ((currentClause === 'WHERE' || lastWhereIndex > -1) && !isAfterDot) {
      // CRITICAL: If WHERE comes after any JOIN, we're definitely in WHERE clause
      // Also check if cursor is after WHERE keyword
      const cursorAfterWhere = lastWhereIndex > -1 && 
                              (text.length - lastWhereIndex) <= 500;
      
      if (cursorAfterWhere || currentClause === 'WHERE') {
        // In WHERE clause, we should NOT need table names (we need fields and aliases)
        // CRITICAL: Always override needsTableNames for WHERE clause
        needsTableNames = false;
        
        // In WHERE clause, suggest table aliases and their fields
        if (this.aliasToTableMap.size > 0) {
          needsTableAliases = true;
        }
        
        // Always show field names in WHERE clause (from all tables)
        needsFieldNames = true;
        
        // Check if there's a table alias before the dot or current word
        const lastWord = recentText.match(/(\w+)\s*$/);
        if (lastWord && this.aliasToTableMap.has(lastWord[1].toLowerCase())) {
          currentTable = lastWord[1].toLowerCase();
        }
      }
    }
    
    // If we're in ON clause (for JOINs) - show fields and aliases
    if (currentClause === 'ON' && lastOnIndex > -1 && !isAfterDot && !needsTableNames) {
      // In ON clause, we need fields and aliases, not table names
      needsTableNames = false;
      
      if (this.aliasToTableMap.size > 0) {
        needsTableAliases = true;
      }
      
      // Always show field names in ON clause (from all tables)
      needsFieldNames = true;
    }
    
    // If we're in GROUP BY clause
    if (currentClause === 'GROUP BY' && lastGroupByIndex > -1 && !isAfterDot && !needsTableNames) {
      if (this.aliasToTableMap.size > 0) {
        needsTableAliases = true;
      }
      needsFieldNames = true;
    }
    
    // If we're in ORDER BY clause
    if (currentClause === 'ORDER BY' && lastOrderByIndex > -1 && !isAfterDot && !needsTableNames) {
      if (this.aliasToTableMap.size > 0) {
        needsTableAliases = true;
      }
      needsFieldNames = true;
    }
    
    // If we're in ON clause (for JOINs)
    if (currentClause === 'ON' && lastOnIndex > -1 && !isAfterDot && !needsTableNames) {
      if (this.aliasToTableMap.size > 0) {
        needsTableAliases = true;
      }
      needsFieldNames = true;
    }
    
    // If we're in HAVING clause
    if (currentClause === 'HAVING' && lastHavingIndex > -1 && !isAfterDot && !needsTableNames) {
      if (this.aliasToTableMap.size > 0) {
        needsTableAliases = true;
      }
      needsFieldNames = true;
    }

    return {
      needsTableNames,
      needsFieldNames,
      needsTableAliases,
      currentTable,
      aliasOrTable,
      isAfterDot
    };
  }

  /**
   * Get SQL keywords for autocomplete
   */
  private getSqlKeywords(): string[] {
    return [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
      'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
      'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT',
      'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'UNION', 'ALL', 'EXISTS', 'ANY', 'SOME'
    ];
  }

  /**
   * Get display name for table (can be enhanced to show friendly names)
   */
  private getTableDisplayName(tableName: string): string {
    // Remove common prefixes like 't_', 'tbl_', 'tab_'
    return tableName
      .replace(/^t_/i, '')
      .replace(/^tbl_/i, '')
      .replace(/^tab_/i, '')
      .replace(/^TABD_/i, '')
      .replace(/^TABMD_/i, '');
  }
}

