# SQL Query Builder - Code Documentation

This document provides detailed documentation for all functions in the SQL Query Builder application.

---

## Table of Contents

1. [SQL Editor Component](#sql-editor-component)
2. [Monaco SQL Provider](#monaco-sql-provider)
3. [Results Grid Component](#results-grid-component)

---

## SQL Editor Component

**File:** `src/app/sql-editor/sql-editor.component.ts`

The SQL Editor Component is the main component that provides SQL query editing, execution, and management functionality.

### Lifecycle Methods

#### `ngOnInit(): void`
**Purpose:** Initializes the component when it's created.

**What it does:**
- Sets up an initial sample SQL query
- Stores the original query
- Detects parameters in the query
- Sets up a debounced query change subscription (500ms delay) that triggers validation

**When to use:** Called automatically by Angular when the component is initialized.

---

#### `ngAfterViewInit(): void`
**Purpose:** Initializes the Monaco editor after the view is rendered.

**What it does:**
- Loads schema data for autocomplete
- Initializes the Monaco editor with multiple fallback attempts (100ms and 300ms delays) to ensure the splitter is fully rendered

**When to use:** Called automatically by Angular after the view is initialized.

---

#### `ngOnDestroy(): void`
**Purpose:** Cleans up resources when the component is destroyed.

**What it does:**
- Disconnects the ResizeObserver
- Disposes the completion provider
- Disposes the Monaco editor instance

**When to use:** Called automatically by Angular when the component is destroyed.

---

### Monaco Editor Methods

#### `initializeMonacoEditor(): void`
**Purpose:** Initializes the Monaco Editor with SQL language support and autocomplete.

**What it does:**
- Checks if the editor container exists and has dimensions
- Registers SQL language with Monaco (using monaco-sql-languages package or fallback)
- Creates Monaco editor instance with SQL syntax highlighting
- Sets up autocomplete/intellisense (SQL keywords, table names, field names)
- Configures editor settings (word wrap, auto-format, suggestions)
- Sets up event handlers for content changes
- Registers the SQL completion provider
- Sets up ResizeObserver for splitter resize events
- Configures drag-and-drop handlers for table/field insertion

**When to use:** Called automatically in `ngAfterViewInit()` or when switching to SQL tab.

**Key Features:**
- SQL syntax highlighting
- IntelliSense autocomplete
- SSMS-like behavior (suggestions on typing)
- Drag-and-drop support

---

#### `loadSchemaForAutocomplete(): void`
**Purpose:** Loads database schema data and updates the autocomplete provider.

**What it does:**
- Fetches schema data from MetadataService
- Extracts table names and field mappings
- Updates the SQL completion provider with table names and schema map
- Enables autocomplete suggestions for tables and fields

**When to use:** Called automatically in `ngAfterViewInit()`.

---

### Query Management Methods

#### `onQueryChange(): void`
**Purpose:** Handles changes to the SQL query in the editor.

**What it does:**
- Syncs Monaco editor value with component SQL query
- Maintains SQL language mode
- Updates original query tracking (if not updating from grid)
- Detects parameters in the query
- Clears validation errors
- Emits query change event for validation

**When to use:** Called automatically when the editor content changes.

---

#### `detectParameters(): void`
**Purpose:** Detects SQL parameters (e.g., `@paramName`) in the query.

**What it does:**
- Uses regex to find all `@paramName` patterns in the query
- Creates QueryParameter objects for each unique parameter
- Detects parameter types (text, number, date, lookup) based on parameter name
- Sets default values for parameters

**When to use:** Called automatically when query changes or when loading saved queries.

---

#### `getParameterValue(name: string): any`
**Purpose:** Gets the current value of a parameter by name.

**Parameters:**
- `name`: The parameter name (without @)

**Returns:** The parameter value or empty string if not found.

**When to use:** Used internally when detecting parameters to preserve existing values.

---

#### `detectParameterType(paramName: string): 'text' | 'number' | 'date' | 'lookup'`
**Purpose:** Detects the type of a parameter based on its name.

**Parameters:**
- `paramName`: The parameter name

**Returns:** Parameter type ('text', 'number', 'date', or 'lookup')

**Logic:**
- Names containing 'id' → 'lookup'
- Names containing 'date' → 'date'
- Names containing 'count', 'amount', 'priority' → 'number'
- Otherwise → 'text'

**When to use:** Called automatically when detecting parameters.

---

### Validation Methods

#### `validateQuery(query: string): void`
**Purpose:** Validates the SQL query for syntax and schema errors.

**Parameters:**
- `query`: The SQL query to validate

**What it does:**
- Validates SQL structure (SELECT, FROM, balanced parentheses/quotes)
- Validates SQL syntax using SqlParserService
- Validates against database schema (if available)
- Collects validation errors and warnings
- Sets `hasValidationErrors` flag

**When to use:** Called automatically via debounced subscription (500ms delay) when query changes.

---

#### `validateQueryOnly(): void`
**Purpose:** Manually triggers query validation and displays results.

**What it does:**
- Calls `validateQuery()` with current SQL query
- Shows validation errors panel
- Scrolls to validation errors if they exist
- Sets validation success flag if no errors

**When to use:** Called when user clicks "Validate" button.

---

#### `dismissValidationErrors(): void`
**Purpose:** Hides the validation errors panel.

**What it does:**
- Hides validation errors display
- Clears validation success flag

**When to use:** Called when user dismisses validation errors.

---

#### `validateSqlStructure(query: string): void`
**Purpose:** Validates basic SQL structure (SELECT, FROM, balanced quotes/parentheses, etc.).

**Parameters:**
- `query`: The SQL query to validate

**What it checks:**
- Presence of SELECT statement
- Presence of FROM clause
- Text after semicolon (invalid trailing text)
- Balanced parentheses
- Balanced single and double quotes
- JOIN statements have ON clauses
- GROUP BY has aggregate functions (warning)
- Table aliases are defined

**When to use:** Called internally by `validateQuery()`.

---

#### `validateTableAliases(query: string): void`
**Purpose:** Validates that all table aliases used in the query are defined.

**Parameters:**
- `query`: The SQL query to validate

**What it does:**
- Extracts table aliases from FROM and JOIN clauses
- Finds all table alias references (table.field pattern)
- Checks if referenced aliases are defined
- Adds validation errors for undefined aliases

**When to use:** Called internally by `validateSqlStructure()`.

---

#### `validateParsedQuery(originalQuery: string, parsedQuery: any): void`
**Purpose:** Validates the parsed query structure.

**Parameters:**
- `originalQuery`: The original SQL query
- `parsedQuery`: The parsed query object from SqlParserService

**What it checks:**
- SELECT fields exist
- JOIN clauses have join fields
- WHERE clause filters have field names and values
- GROUP BY fields exist when GROUP BY is used

**When to use:** Called internally by `validateQuery()`.

---

#### `validateAgainstSchema(query: string): void`
**Purpose:** Validates query against database schema.

**Parameters:**
- `query`: The SQL query to validate

**What it checks:**
- Tables in FROM and JOIN clauses exist in schema
- Fields referenced in query exist in their respective tables

**When to use:** Called internally by `validateQuery()` when schema data is available.

---

### Query Execution Methods

#### `executeQuery(): void`
**Purpose:** Executes the SQL query and displays results.

**What it does:**
- Validates query before execution
- Validates parameters are filled
- Prepares parameter values object
- Generates QueryJson for history
- Calls QueryExecutionService to execute query
- Records execution in query history
- Updates saved query stats (if from saved query)
- Displays results in grid
- Shows success/error toast messages
- Ensures completion provider and syntax highlighting remain active

**When to use:** Called when user clicks "Execute" button.

---

#### `validateParameters(): boolean`
**Purpose:** Validates that all required parameters have values.

**Returns:** `true` if all required parameters have values, `false` otherwise.

**When to use:** Called before query execution.

---

### Query Formatting Methods

#### `formatQuery(): void`
**Purpose:** Formats the SQL query for better readability.

**What it does:**
- Uses sql-formatter library to format the query
- Applies formatting rules (uppercase keywords, proper indentation)
- Updates Monaco editor with formatted query
- Triggers query change detection

**When to use:** Called when user clicks "Format" button.

---

### Grid-to-SQL Synchronization Methods

#### `onGridFilterChange(filters: GridFilter[]): void`
**Purpose:** Handles filter changes from the results grid.

**Parameters:**
- `filters`: Array of grid filters

**What it does:**
- Stores current grid filters
- Updates SQL query to include grid filters in WHERE clause

**When to use:** Called automatically when user applies filters in the grid.

---

#### `onGridSortChange(sorts: GridSort[]): void`
**Purpose:** Handles sort changes from the results grid.

**Parameters:**
- `sorts`: Array of grid sorts

**What it does:**
- Stores current grid sorts
- Updates SQL query to include grid sorts in ORDER BY clause

**When to use:** Called automatically when user sorts columns in the grid.

---

#### `onGridGroupChange(groups: GridGroup[]): void`
**Purpose:** Handles group changes from the results grid.

**Parameters:**
- `groups`: Array of grid groups

**What it does:**
- Stores current grid groups
- Updates SQL query to include grid groups in GROUP BY clause

**When to use:** Called automatically when user groups columns in the grid.

---

#### `onSQLUpdateRequested(): void`
**Purpose:** Handles SQL update requests from the grid.

**What it does:**
- Triggers SQL update from grid filters/sorts/groups

**When to use:** Called automatically when grid requests SQL update.

---

#### `updateSQLFromGrid(): void`
**Purpose:** Updates the SQL query based on grid filters, sorts, and groups.

**What it does:**
- Prevents circular updates with `isUpdatingFromGrid` flag
- Stores original query if not already stored
- Parses original SQL query
- Builds new SQL with grid modifications
- Updates Monaco editor with new SQL
- Triggers change detection
- Formats query asynchronously

**When to use:** Called internally when grid filters/sorts/groups change.

---

#### `buildSQLFromParsedQuery(parsedQuery: any, baseQuery: string): string`
**Purpose:** Builds SQL query from parsed query object and grid modifications.

**Parameters:**
- `parsedQuery`: Parsed query object
- `baseQuery`: Original SQL query string

**Returns:** New SQL query string with grid modifications

**What it does:**
- Builds SELECT clause from parsed query
- Extracts FROM and JOIN clauses from base query
- Combines original WHERE filters with grid filters (grid filters override)
- Adds GROUP BY from grid groups (grid groups override original)
- Adds ORDER BY from grid sorts (grid sorts override original)
- Preserves LIMIT clause from base query

**When to use:** Called internally by `updateSQLFromGrid()`.

---

#### `buildFilterCondition(filter: any): string`
**Purpose:** Builds SQL WHERE condition from filter object.

**Parameters:**
- `filter`: Filter object with FieldName, Operator, Value

**Returns:** SQL condition string (e.g., "fieldName = 'value'")

**What it does:**
- Maps operator numbers to SQL operators
- Handles parameter values (@paramName)
- Handles NULL checks (IS NULL, IS NOT NULL)
- Adds quotes for string values

**When to use:** Called internally by `buildSQLFromParsedQuery()`.

---

#### `buildGridFilterCondition(filter: GridFilter): string`
**Purpose:** Builds SQL WHERE condition from grid filter.

**Parameters:**
- `filter`: GridFilter object with field, operator, value

**Returns:** SQL condition string

**What it does:**
- Maps grid operators (contains, startswith, endswith, equal, etc.) to SQL operators
- Handles LIKE patterns for text matching
- Adds quotes for string values

**When to use:** Called internally by `buildSQLFromParsedQuery()`.

---

#### `getSQLOperator(operatorNumber: number): string`
**Purpose:** Maps operator number to SQL operator string.

**Parameters:**
- `operatorNumber`: Operator number (1-11)

**Returns:** SQL operator string (e.g., '=', '!=', 'LIKE', 'IS NULL')

**Operator Map:**
- 1: '='
- 2: '!='
- 3: '>'
- 4: '>='
- 5: '<'
- 6: '<='
- 7: 'LIKE'
- 8: 'IN'
- 9: 'NOT IN'
- 10: 'IS NULL'
- 11: 'IS NOT NULL'

**When to use:** Called internally by `buildFilterCondition()`.

---

### Tab Management Methods

#### `onTabChange(tab: 'sql' | 'visual' | 'json'): void`
**Purpose:** Handles tab changes in the SQL editor.

**Parameters:**
- `tab`: The tab to switch to ('sql', 'visual', or 'json')

**What it does:**
- Switches active tab
- Initializes Monaco editor if switching to SQL tab
- Triggers visual builder parsing if switching to Visual tab
- Generates JSON representation if switching to JSON tab

**When to use:** Called when user clicks on a tab.

---

#### `onVisualBuilderSQLChange(newSQL: string): void`
**Purpose:** Handles SQL changes from the visual query builder.

**Parameters:**
- `newSQL`: New SQL query from visual builder

**What it does:**
- Updates SQL query
- Updates Monaco editor
- Preserves cursor position if possible
- Triggers parameter detection
- Triggers validation

**When to use:** Called automatically when visual builder changes SQL.

---

#### `onVisualBuilderWarning(warning: string): void`
**Purpose:** Handles warnings from the visual query builder.

**Parameters:**
- `warning`: Warning message

**What it does:**
- Shows warning toast message

**When to use:** Called automatically when visual builder encounters parsing issues.

---

### JSON Conversion Methods

#### `convertJsonToSql(): void`
**Purpose:** Converts JSON query object to SQL and updates the editor.

**What it does:**
- Parses JSON input
- Converts JSON to SQL using SqlParserService
- Updates SQL query and Monaco editor
- Switches to SQL tab
- Shows success/error toast

**When to use:** Called when user clicks "Convert JSON to SQL" button.

---

#### `loadJsonFromSql(): void`
**Purpose:** Loads JSON representation from current SQL query.

**What it does:**
- Converts SQL to JSON using SqlParserService
- Updates JSON input field
- Shows success/error toast

**When to use:** Called when user clicks "Load JSON from SQL" button.

---

#### `getQueryJson(): any`
**Purpose:** Gets JSON representation of current SQL query.

**Returns:** Query JSON object or null if conversion fails

**When to use:** Used internally for query history and saved queries.

---

### Query Management Methods

#### `openSaveQueryModal(): void`
**Purpose:** Opens the save query modal.

**What it does:**
- Loads existing query if editing (if `currentQueryId` is set)
- Opens save query modal

**When to use:** Called when user clicks "Save Query" button.

---

#### `closeSaveQueryModal(): void`
**Purpose:** Closes the save query modal.

**What it does:**
- Closes modal
- Clears editing query

**When to use:** Called when user closes the modal.

---

#### `onSaveQuery(queryData: Omit<SavedQuery, 'id' | 'createdTimestamp' | 'updatedTimestamp' | 'executionCount' | 'isFavorite'>): void`
**Purpose:** Saves or updates a query.

**Parameters:**
- `queryData`: Query data to save (name, description, SQL, parameters, etc.)

**What it does:**
- Updates existing query if editing, otherwise saves new query
- Sets `currentQueryId` to saved query ID
- Shows success/error toast
- Closes modal

**When to use:** Called when user saves a query in the modal.

---

#### `openSavedQueriesSidebar(): void`
**Purpose:** Opens the saved queries sidebar.

**When to use:** Called when user clicks "Saved Queries" button.

---

#### `closeSavedQueriesSidebar(): void`
**Purpose:** Closes the saved queries sidebar.

**When to use:** Called when user closes the sidebar.

---

#### `onLoadSavedQuery(query: SavedQuery): void`
**Purpose:** Loads a saved query into the editor.

**Parameters:**
- `query`: The saved query to load

**What it does:**
- Loads SQL query into editor
- Updates original query
- Detects parameters
- Loads parameter values if available
- Sets current query ID
- Closes sidebar
- Shows success toast

**When to use:** Called when user selects a saved query.

---

#### `onEditSavedQuery(query: SavedQuery): void`
**Purpose:** Loads a saved query and opens it in edit mode.

**Parameters:**
- `query`: The saved query to edit

**What it does:**
- Loads the query
- Opens save modal in edit mode

**When to use:** Called when user clicks "Edit" on a saved query.

---

#### `openQueryHistorySidebar(): void`
**Purpose:** Opens the query history sidebar.

**When to use:** Called when user clicks "Query History" button.

---

#### `closeQueryHistorySidebar(): void`
**Purpose:** Closes the query history sidebar.

**When to use:** Called when user closes the sidebar.

---

#### `onLoadQueryFromHistory(historyItem: QueryHistory): void`
**Purpose:** Loads a query from history into the editor.

**Parameters:**
- `historyItem`: The history item to load

**What it does:**
- Loads SQL query into editor
- Updates original query
- Detects parameters
- Loads parameter values if available
- Sets current query ID if it was from a saved query
- Closes sidebar
- Shows success toast

**When to use:** Called when user selects a query from history.

---

### Utility Methods

#### `clearEditor(): void`
**Purpose:** Clears the SQL editor.

**What it does:**
- Confirms with user
- Clears SQL query
- Clears parameters
- Clears validation errors
- Clears Monaco editor

**When to use:** Called when user clicks "Clear" button.

---

#### `dismissResults(): void`
**Purpose:** Hides the query results.

**What it does:**
- Hides results grid

**When to use:** Called when user dismisses results.

---

#### `getResultColumns(): string[]`
**Purpose:** Gets column names from query results.

**Returns:** Array of column names

**When to use:** Used internally to get columns for results grid.

---

#### `getParameterValues(): { [key: string]: any }`
**Purpose:** Gets current parameter values as an object.

**Returns:** Object with parameter names as keys and values as values

**When to use:** Used internally for query execution.

---

#### `getLineAndColumn(): string`
**Purpose:** Gets current cursor position in editor (line and column).

**Returns:** String like "Ln 5, Col 10"

**When to use:** Used to display cursor position in UI.

---

### Drag and Drop Methods

#### `onDragEnter(event: DragEvent): void`
**Purpose:** Handles drag enter event on editor.

**What it does:**
- Prevents default behavior
- Stops event propagation

**When to use:** Called automatically when dragging over editor.

---

#### `onDragOver(event: DragEvent): void`
**Purpose:** Handles drag over event on editor.

**What it does:**
- Prevents default behavior
- Stops event propagation

**When to use:** Called automatically when dragging over editor.

---

#### `onDragLeave(event: DragEvent): void`
**Purpose:** Handles drag leave event on editor.

**What it does:**
- Prevents default behavior
- Stops event propagation

**When to use:** Called automatically when dragging leaves editor.

---

#### `onDrop(event: DragEvent): void`
**Purpose:** Handles drop event on editor (inserts table/field names).

**What it does:**
- Gets dropped data
- Removes TABLE: prefix if present
- Inserts text at cursor position in Monaco editor
- Moves cursor after inserted text
- Focuses editor

**When to use:** Called automatically when user drops table/field on editor.

---

#### `onParameterChange(param: QueryParameter): void`
**Purpose:** Handles parameter value changes.

**Parameters:**
- `param`: The parameter that changed

**What it does:**
- Logs parameter change (can be extended for validation)

**When to use:** Called when user changes a parameter value.

---

## Monaco SQL Provider

**File:** `src/app/sql-editor/monaco-sql-provider.ts`

The Monaco SQL Provider provides IntelliSense-style autocomplete for SQL queries in the Monaco editor.

### Constructor

#### `constructor(tableNames: string[], schemaData?: Map<string, string[]>)`
**Purpose:** Initializes the SQL completion provider.

**Parameters:**
- `tableNames`: Array of table names for autocomplete
- `schemaData`: Optional map of table names to field names

**What it does:**
- Stores table names (lowercase)
- Stores schema data (table -> fields mapping)

---

### Update Methods

#### `updateTables(tableNames: string[]): void`
**Purpose:** Updates the table names for autocomplete.

**Parameters:**
- `tableNames`: Array of table names

**What it does:**
- Updates internal table names list (lowercase)

**When to use:** Called when schema is loaded or updated.

---

#### `updateSchema(schemaData: Map<string, string[]>): void`
**Purpose:** Updates schema data (table -> fields mapping).

**Parameters:**
- `schemaData`: Map of table names to field names

**What it does:**
- Updates internal schema map

**When to use:** Called when schema is loaded or updated.

---

### Completion Provider Method

#### `provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position, context: monaco.languages.CompletionContext): monaco.languages.ProviderResult<monaco.languages.CompletionList>`
**Purpose:** Main method that provides autocomplete suggestions.

**Parameters:**
- `model`: Monaco editor text model
- `position`: Cursor position
- `context`: Completion context (trigger kind, etc.)

**Returns:** Completion list with suggestions

**What it does:**
- Extracts word being typed from current line
- Gets context text (recent text before cursor)
- Extracts table aliases from query
- Provides suggestions based on context:
  1. **After dot (table.field)**: Shows fields from that table
  2. **After FROM/JOIN/AS**: Shows table names
  3. **In WHERE/ORDER BY/GROUP BY**: Shows table aliases and fields
  4. **Always**: Shows SQL keywords with partial matching
- Returns suggestions with proper icons and documentation

**When to use:** Called automatically by Monaco editor when user types.

---

### Helper Methods

#### `extractTableAliases(text: string): void`
**Purpose:** Extracts table aliases from SQL query text.

**Parameters:**
- `text`: SQL query text

**What it does:**
- Parses FROM clauses to find table names and aliases
- Parses JOIN clauses to find table names and aliases
- Maps aliases to table names
- Stores mappings in `aliasToTableMap`

**When to use:** Called internally by `provideCompletionItems()`.

---

#### `getTableNameForAlias(aliasOrTable: string): string | null`
**Purpose:** Gets table name for a given alias.

**Parameters:**
- `aliasOrTable`: Alias or table name

**Returns:** Table name or null if not found

**When to use:** Called internally to resolve aliases to table names.

---

#### `detectSqlContext(text: string, position: monaco.Position): {...}`
**Purpose:** Detects SQL context to determine what to suggest.

**Parameters:**
- `text`: SQL query text
- `position`: Cursor position

**Returns:** Context object with flags (needsTableNames, needsFieldNames, etc.)

**What it detects:**
- After dot (table.field context)
- After FROM/JOIN keywords (needs table names)
- In WHERE/ORDER BY/GROUP BY clauses (needs fields and aliases)
- In SELECT clause (needs fields from all tables)

**When to use:** Called internally by `provideCompletionItems()` (though this method is defined but not actively used in current implementation).

---

#### `getSqlKeywords(): string[]`
**Purpose:** Gets list of SQL keywords for autocomplete.

**Returns:** Array of SQL keywords

**Keywords included:**
- SELECT, FROM, WHERE, JOIN, INNER, LEFT, RIGHT, FULL, OUTER
- ON, GROUP, BY, ORDER, HAVING, LIMIT, OFFSET
- INSERT, INTO, VALUES, UPDATE, SET, DELETE
- AS, AND, OR, NOT, IN, LIKE, BETWEEN, IS, NULL
- COUNT, SUM, AVG, MAX, MIN, DISTINCT
- ASC, DESC, CASE, WHEN, THEN, ELSE, END
- UNION, ALL, EXISTS, ANY, SOME

**When to use:** Called internally to provide keyword suggestions.

---

#### `getTableDisplayName(tableName: string): string`
**Purpose:** Gets display name for table (removes common prefixes).

**Parameters:**
- `tableName`: Table name

**Returns:** Display name without prefixes (t_, tbl_, tab_, TABD_, TABMD_)

**When to use:** Called internally to show friendly table names in suggestions.

---

## Results Grid Component

**File:** `src/app/components/results-grid/results-grid.component.ts`

The Results Grid Component displays query results in a sortable, filterable, and groupable grid.

### Lifecycle Methods

#### `ngOnInit(): void`
**Purpose:** Initializes the component.

**What it does:**
- Initializes columns
- Processes data

**When to use:** Called automatically by Angular.

---

#### `ngAfterViewInit(): void`
**Purpose:** Initializes the Syncfusion grid after view is ready.

**What it does:**
- Sets `gridInitialized` flag
- Initializes Syncfusion grid with data (100ms delay)

**When to use:** Called automatically by Angular.

---

#### `ngOnChanges(changes: SimpleChanges): void`
**Purpose:** Handles changes to input properties.

**Parameters:**
- `changes`: Angular change detection object

**What it does:**
- Detects changes to `data` or `columns` inputs
- Prevents infinite loops with `isUpdatingGrid` flag
- Updates columns and data
- Updates Syncfusion grid if initialized

**When to use:** Called automatically by Angular when inputs change.

---

### Initialization Methods

#### `initializeColumns(): void`
**Purpose:** Initializes grid columns from input columns or data.

**What it does:**
- Uses input columns if provided
- Otherwise extracts columns from data keys
- Creates GridColumn objects with type detection
- Sets column properties (sortable, filterable, groupable)

**When to use:** Called in `ngOnInit()` and `ngOnChanges()`.

---

#### `initializeSyncfusionGrid(): void`
**Purpose:** Initializes Syncfusion Grid with dynamic columns and data.

**What it does:**
- Checks if data exists
- Updates columns first
- Updates data after columns are set (50ms delay)

**When to use:** Called in `ngAfterViewInit()`.

---

#### `updateSyncfusionGridColumns(): void`
**Purpose:** Dynamically creates Syncfusion Grid columns from data structure.

**What it does:**
- Extracts all keys from first data row
- Merges with input columns if provided
- Creates Syncfusion column configs with:
  - Field name, header text, width
  - Type detection (string, number, date, boolean)
  - Formatting (currency, dates, etc.)
  - Permissions (filtering, sorting, grouping, resizing, reordering)
- Tracks columns to avoid unnecessary updates

**When to use:** Called when data or columns change.

---

#### `updateSyncfusionGridData(): void`
**Purpose:** Updates Syncfusion Grid data from input data.

**What it does:**
- Creates deep copy of data to ensure change detection works
- Verifies data structure matches columns
- Updates `syncfusionGridData` property
- Tracks data length to avoid unnecessary updates

**When to use:** Called when data changes.

---

### Column Utility Methods

#### `formatHeaderText(field: string): string`
**Purpose:** Formats field name as header text.

**Parameters:**
- `field`: Field name (camelCase or snake_case)

**Returns:** Formatted header text (Title Case)

**Example:** `firstName` → `First Name`, `user_id` → `User Id`

**When to use:** Called when creating columns.

---

#### `calculateColumnWidth(field: string, sampleValue: any): number`
**Purpose:** Calculates column width based on field name and sample value.

**Parameters:**
- `field`: Field name
- `sampleValue`: Sample value from data

**Returns:** Column width in pixels

**Logic:**
- ID/count fields: 80px
- Email: 220px
- Name/title: 180px
- Date/time: 130px
- Salary/amount/price: 120px
- Description/comment/notes: 300px
- Boolean: 100px
- Number: 120px
- Default: 150px or based on sample value length

**When to use:** Called when creating columns.

---

#### `detectSyncfusionColumnType(field: string, sampleValue: any): 'string' | 'number' | 'date' | 'boolean'`
**Purpose:** Detects Syncfusion column type from field name and sample value.

**Parameters:**
- `field`: Field name
- `sampleValue`: Sample value from data

**Returns:** Column type

**Logic:**
- Checks sample value type first
- Infers from field name if value is null
- Handles date strings, number strings, booleans

**When to use:** Called when creating columns.

---

#### `detectColumnType(field: string): 'string' | 'number' | 'date' | 'boolean'`
**Purpose:** Detects column type from field name and data.

**Parameters:**
- `field`: Field name

**Returns:** Column type

**When to use:** Called when initializing columns (legacy method).

---

### Data Processing Methods

#### `processData(): void`
**Purpose:** Processes data with filters and sorting.

**What it does:**
- Applies filters to data
- Applies sorting to data
- Updates filtered data
- Calculates total pages
- Updates displayed data

**When to use:** Called when filters or sorts change.

---

#### `updateDisplayedData(): void`
**Purpose:** Updates displayed data based on current page.

**What it does:**
- Calculates start and end indices for current page
- Slices filtered data to get page data
- Updates `displayedData` property

**When to use:** Called when page changes or data is processed.

---

### Filtering Methods

#### `onFilterChange(field: string, value: string): void`
**Purpose:** Handles filter change for a field.

**Parameters:**
- `field`: Field name
- `value`: Filter value

**What it does:**
- Adds or updates filter in filters map
- Removes filter if value is empty
- Resets to page 1
- Processes data
- Emits filter change event
- Updates SQL

**When to use:** Called when user changes a filter (legacy method, Syncfusion handles this now).

---

#### `clearFilter(field: string): void`
**Purpose:** Clears filter for a field.

**Parameters:**
- `field`: Field name

**What it does:**
- Removes filter from filters map
- Processes data
- Emits filter change event

**When to use:** Called when user clears a filter (legacy method).

---

#### `toggleFilterMenu(field: string): void`
**Purpose:** Toggles filter menu for a field.

**Parameters:**
- `field`: Field name

**What it does:**
- Closes all other filter menus
- Toggles filter menu for specified field

**When to use:** Called when user clicks filter menu (legacy method).

---

#### `emitFilterChange(): void`
**Purpose:** Emits filter change event to parent.

**What it does:**
- Converts filters map to GridFilter array
- Emits `filterChange` event
- Updates SQL

**When to use:** Called when filters change.

---

#### `handleGridFilters(): void`
**Purpose:** Handles filter changes from Syncfusion grid.

**What it does:**
- Reads filter settings from Syncfusion grid
- Converts to GridFilter array
- Emits `filterChange` event
- Updates SQL

**When to use:** Called when Syncfusion grid filtering completes.

---

### Sorting Methods

#### `onSort(field: string): void`
**Purpose:** Handles sort toggle for a field.

**Parameters:**
- `field`: Field name

**What it does:**
- Toggles sort: none → asc → desc → none
- Processes data
- Emits sort change event
- Updates SQL

**When to use:** Called when user sorts a column (legacy method, Syncfusion handles this now).

---

#### `getSortIcon(field: string): string`
**Purpose:** Gets sort icon for a field.

**Parameters:**
- `field`: Field name

**Returns:** Sort icon (↑ for asc, ↓ for desc, '' for none)

**When to use:** Called to display sort icon (legacy method).

---

#### `emitSortChange(): void`
**Purpose:** Emits sort change event to parent.

**What it does:**
- Emits `sortChange` event with current sorts
- Updates SQL

**When to use:** Called when sorts change.

---

#### `handleGridSorts(): void`
**Purpose:** Handles sort changes from Syncfusion grid.

**What it does:**
- Reads sort settings from Syncfusion grid
- Excludes sorts on grouped columns
- Converts to GridSort array
- Emits `sortChange` event
- Updates SQL

**When to use:** Called when Syncfusion grid sorting completes.

---

### Grouping Methods

#### `onGroup(field: string): void`
**Purpose:** Handles group toggle for a field.

**Parameters:**
- `field`: Field name

**What it does:**
- Toggles group: adds if not grouped, removes if grouped
- Processes data
- Emits group change event
- Updates SQL

**When to use:** Called when user groups a column (legacy method, Syncfusion handles this now).

---

#### `isGrouped(field: string): boolean`
**Purpose:** Checks if a field is grouped.

**Parameters:**
- `field`: Field name

**Returns:** `true` if field is grouped, `false` otherwise

**When to use:** Called to check if field is grouped (legacy method).

---

#### `emitGroupChange(): void`
**Purpose:** Emits group change event to parent.

**What it does:**
- Emits `groupChange` event with current groups
- Updates SQL

**When to use:** Called when groups change.

---

#### `handleGridGroups(event: any): void`
**Purpose:** Handles group changes from Syncfusion grid.

**Parameters:**
- `event`: Syncfusion grid event

**What it does:**
- Reads group settings from Syncfusion grid (multiple fallback methods)
- Converts to GridGroup array
- Tracks grouped columns
- Removes auto-added sorts on ungrouped columns
- Emits `groupChange` event
- Updates SQL

**Methods used to get groups:**
1. Direct access to `groupSettings` property
2. Access via grid element
3. `getGroupSettings()` method
4. Local `gridGroupSettings` fallback
5. `getGroupedColumns()` method
6. DOM reading from grouping bar

**When to use:** Called when Syncfusion grid grouping completes.

---

#### `updateGroupSettingsFromEvent(event: any): void`
**Purpose:** Updates local group settings from grid event.

**Parameters:**
- `event`: Syncfusion grid event

**What it does:**
- Reads group settings from grid instance
- Updates local `gridGroupSettings`

**When to use:** Called internally by `handleGridGroups()` (not actively used).

---

### Pagination Methods

#### `goToPage(page: number): void`
**Purpose:** Navigates to a specific page.

**Parameters:**
- `page`: Page number (1-based)

**What it does:**
- Validates page number
- Updates current page
- Updates displayed data

**When to use:** Called when user clicks a page number (legacy method, Syncfusion handles this now).

---

#### `nextPage(): void`
**Purpose:** Navigates to next page.

**What it does:**
- Increments current page if not on last page
- Updates displayed data

**When to use:** Called when user clicks next page (legacy method).

---

#### `previousPage(): void`
**Purpose:** Navigates to previous page.

**What it does:**
- Decrements current page if not on first page
- Updates displayed data

**When to use:** Called when user clicks previous page (legacy method).

---

### Export Methods

#### `exportCSV(): void`
**Purpose:** Exports data to CSV file.

**What it does:**
- Gets data to export (selected rows or all filtered data)
- Calls ExportService to export to CSV
- Shows success toast

**When to use:** Called when user clicks "Export CSV" button.

---

#### `exportExcel(): void`
**Purpose:** Exports data to Excel file.

**What it does:**
- Gets data to export (selected rows or all filtered data)
- Calls ExportService to export to Excel
- Shows success toast

**When to use:** Called when user clicks "Export Excel" button.

---

#### `copyToClipboard(): Promise<void>`
**Purpose:** Copies data to clipboard.

**What it does:**
- Gets data to export (selected rows or all filtered data)
- Calls ExportService to copy to clipboard
- Shows success/error toast

**When to use:** Called when user clicks "Copy to Clipboard" button.

---

### Selection Methods

#### `toggleSelectAll(): void`
**Purpose:** Toggles select all checkbox.

**What it does:**
- Selects/deselects all rows on current page
- Updates `selectedRows` set

**When to use:** Called when user clicks select all checkbox (legacy method).

---

#### `toggleRowSelection(index: number): void`
**Purpose:** Toggles selection for a row.

**Parameters:**
- `index`: Row index on current page

**What it does:**
- Adds/removes row from `selectedRows` set (uses global index)

**When to use:** Called when user clicks a row checkbox (legacy method).

---

#### `isRowSelected(index: number): boolean`
**Purpose:** Checks if a row is selected.

**Parameters:**
- `index`: Row index on current page

**Returns:** `true` if row is selected, `false` otherwise

**When to use:** Called to check if row is selected (legacy method).

---

### Utility Methods

#### `refresh(): void`
**Purpose:** Refreshes the grid (clears filters, sorts, groups, selections).

**What it does:**
- Resets to page 1
- Clears filters
- Clears sorts
- Clears groups
- Clears selections
- Processes data
- Shows info toast

**When to use:** Called when user clicks "Refresh" button.

---

#### `formatValue(value: any, type: string): string`
**Purpose:** Formats a value for display.

**Parameters:**
- `value`: Value to format
- `type`: Column type (date, number, boolean, string)

**Returns:** Formatted value string

**Formatting:**
- Dates: Locale date string
- Numbers: Locale string with commas
- Booleans: ✓ or ✗
- Strings: As-is

**When to use:** Called when displaying cell values (legacy method, Syncfusion handles this now).

---

#### `updateSQL(): void`
**Purpose:** Requests SQL update from parent component.

**What it does:**
- Emits `sqlUpdate` event

**When to use:** Called when filters, sorts, or groups change.

---

### Syncfusion Grid Event Handlers

#### `onGridActionComplete(event: any): void`
**Purpose:** Handles Syncfusion grid action completion events.

**Parameters:**
- `event`: Syncfusion grid event

**What it does:**
- Handles filtering, sorting, grouping, ungrouping, and column reordering
- Calls appropriate handler methods
- Uses `requestAnimationFrame` for grouping to ensure grid state is ready

**When to use:** Called automatically by Syncfusion grid when actions complete.

---

#### `onGridFiltering(event: any): void`
**Purpose:** Handles Syncfusion grid filtering event.

**Parameters:**
- `event`: Syncfusion grid event

**What it does:**
- Placeholder (handling done in `actionComplete`)

**When to use:** Called automatically by Syncfusion grid (not actively used).

---

#### `onGridSorted(event: any): void`
**Purpose:** Handles Syncfusion grid sorting event.

**Parameters:**
- `event`: Syncfusion grid event

**What it does:**
- Placeholder (handling done in `actionComplete`)

**When to use:** Called automatically by Syncfusion grid (not actively used).

---

#### `onGridGrouping(event: any): void`
**Purpose:** Handles Syncfusion grid grouping event.

**Parameters:**
- `event`: Syncfusion grid event

**What it does:**
- Tries to extract groups from event
- Emits group change if groups found

**When to use:** Called automatically by Syncfusion grid (backup method).

---

#### `handleColumnReorder(): void`
**Purpose:** Handles column reordering in Syncfusion grid.

**What it does:**
- Reads column order from grid instance
- Updates `syncfusionGridColumns` array to match new order
- Preserves column properties

**When to use:** Called when column reordering completes.

---

## Summary

This documentation covers all major functions in the SQL Query Builder application:

1. **SQL Editor Component**: Handles SQL query editing, validation, execution, and management
2. **Monaco SQL Provider**: Provides IntelliSense autocomplete for SQL queries
3. **Results Grid Component**: Displays query results with filtering, sorting, grouping, and export

Each function is documented with its purpose, parameters, return values, and when to use it. This should help developers understand the codebase and maintain/extend the application.

