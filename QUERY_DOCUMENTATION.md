# SQL Query Builder - Query Documentation

## Unsupported Features

The following features are **not supported** by the API and require updates or backend implementation:

1. **JOIN Operations**: When using JOIN in the query, the API does not return the correct data — **needs API update**.

2. **HAVING Clause**: When using HAVING in the query, the API does not return the correct data — **needs API update**.

3. **GETDATE() Function**: Using `GETDATE()` in the WHERE condition is not supported by the API; **needs backend implementation**.

4. **CASE WHEN Statements**: Using `CASE WHEN` in the query is not supported by the API; **requires backend implementation**.

5. **UNION Operations**: Using `UNION` in the query is not supported by the API; **requires backend implementation**.

---

## Working Queries

The following queries are **working correctly** with the API:

### 1. Select All Columns
```sql
SELECT * FROM WorkItems;
```

### 2. Select Specific Columns
```sql
SELECT 
    ID,
    Title,
    Progress,
    Estimate,
    LoggedHours,
    RemainingHours,
    Priority
FROM WorkItems;
```

### 3. Filter by Date (Exact Match)
```sql
SELECT * FROM workitems
WHERE EndDate = '2025-09-29';
```

### 4. Filter by Date Range (BETWEEN)
```sql
SELECT * FROM workitems
WHERE EndDate BETWEEN '2025-08-22' AND '2025-09-29';
```

### 5. Filter by NULL Value
```sql
SELECT * FROM WorkItems WHERE EndDate IS NULL;
```

### 6. Filter by NULL Value (Alternative)
```sql
SELECT * FROM WorkItems WHERE EndDate IS NULL;
```

### 7. Filter by Comparison Operator
```sql
SELECT * FROM WorkItems WHERE Progress >= 90;
```

### 8. Filter by Range (BETWEEN with Numbers)
```sql
SELECT * FROM WorkItems WHERE Progress BETWEEN 10 AND 40;
```

### 9. Group By with Count
```sql
SELECT 
    ProjectID, 
    COUNT(*) AS TotalWorkItems 
FROM WorkItems
GROUP BY ProjectID;
```

### 10. Select Distinct with NULL Check
```sql
SELECT DISTINCT 
    Assignee
FROM WorkItems
WHERE Assignee IS NOT NULL;
```

### 11. Group By with Average
```sql
SELECT 
    ProjectID,
    AVG(Estimate) AS AvgEstimate 
FROM WorkItems 
GROUP BY ProjectID;
```

### 12. Group By with Sum
```sql
SELECT 
    ProjectID,
    SUM(Cost) AS TotalCost 
FROM WorkItems
GROUP BY ProjectID;
```

### 13. Top N with Multiple Order By
```sql
SELECT TOP 10 
    ID, 
    Title, 
    Priority, 
    Progress
FROM WorkItems
ORDER BY Priority DESC, Progress ASC;
```

### 14. Multiple Aggregations
```sql
SELECT 
    Assignee,
    COUNT(*) AS WorkItemCount,
    SUM(Estimate) AS TotalEstimate,
    SUM(LoggedHours) AS TotalLogged
FROM WorkItems
GROUP BY Assignee;
```

### 15. Filter by NOT NULL
```sql
SELECT *
FROM WorkItems
WHERE EpicId IS NOT NULL;
```

### 16. Filter with LIKE Pattern
```sql
SELECT *
FROM WorkItems
WHERE Title LIKE '%Test%';
```

### 17. Group By with NULL Check
```sql
SELECT 
    ParentID,
    COUNT(*) AS SubItemCount
FROM WorkItems
WHERE ParentID IS NOT NULL
GROUP BY ParentID;
```

### 18. Filter by Boolean Value
```sql
SELECT *
FROM WorkItems
WHERE CanAcceptTimeLog = 1;
```

### 19. Complex Group By with Multiple Aggregations
```sql
SELECT 
    SprintID,
    COUNT(*) AS TotalItems,
    SUM(Estimate) AS TotalEstimate,
    SUM(LoggedHours) AS TotalLogged,
    SUM(RemainingHours) AS TotalRemaining
FROM WorkItems
GROUP BY SprintID;
```

---

## Not Working Queries

The following queries are **not working** due to unsupported features or API limitations:

### 20. Group By with Sum (Issue)
```sql
SELECT 
    SprintID,
    SUM(LoggedHours) AS TotalLoggedHours
FROM WorkItems
GROUP BY SprintID;
```
**Note**: This query appears similar to working query #19, but may have a specific issue.

### 21. Date Range with GETDATE() - NOT SUPPORTED
```sql
SELECT *
FROM WorkItems
WHERE EndDate BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE());
```
**Issue**: `GETDATE()` function is not supported by the API.

### 22. Date Comparison with GETDATE() - NOT SUPPORTED
```sql
SELECT *
FROM WorkItems
WHERE CloseDate >= DATEADD(DAY, -30, GETDATE());
```
**Issue**: `GETDATE()` and `DATEADD()` functions are not supported by the API.

### 23. Multiple Conditions with GETDATE() - NOT SUPPORTED
```sql
SELECT *
FROM WorkItems
WHERE EndDate < GETDATE() AND CloseDate IS NULL;
```
**Issue**: `GETDATE()` function is not supported by the API.

### 24. Window Functions (RANK, DENSE_RANK) - NOT SUPPORTED
```sql
SELECT 
    ProjectID,
    ID,
    Title,
    LoggedHours,
    RANK() OVER (PARTITION BY ProjectID ORDER BY LoggedHours DESC) AS RankInProject,
    DENSE_RANK() OVER (PARTITION BY ProjectID ORDER BY Progress DESC) AS ProgressRank
FROM WorkItems
WHERE LoggedHours IS NOT NULL;
```
**Issue**: Window functions (`RANK()`, `DENSE_RANK()`, `OVER()`) are not supported by the API.

### 25. CASE WHEN Statement - NOT SUPPORTED
```sql
SELECT 
    ID,
    Title,
    Estimate,
    LoggedHours,
    CASE 
        WHEN LoggedHours > Estimate THEN 'Overestimated'
        WHEN LoggedHours < Estimate THEN 'Underestimated'
        ELSE 'On Target'
    END AS EstimationStatus,
    ROUND((LoggedHours / NULLIF(Estimate, 0)) * 100, 2) AS EfficiencyPercent
FROM WorkItems
WHERE Estimate IS NOT NULL;
```
**Issue**: `CASE WHEN` statements are not supported by the API.

### 26. UNION Operation - NOT SUPPORTED
```sql
SELECT 
    ID, 
    Title, 
    'High Priority' AS Category
FROM dbo.WorkItems
WHERE Priority >= 8
UNION
SELECT 
    ID, 
    Title, 
    'Low Priority' AS Category
FROM dbo.WorkItems
WHERE Priority <= 3;
```
**Issue**: `UNION` operations are not supported by the API.

---

## Summary

- **Total Working Queries**: 19
- **Total Not Working Queries**: 7
- **Main Limitations**: 
  - No support for `GETDATE()` and date functions
  - No support for `CASE WHEN` statements
  - No support for `UNION` operations
  - No support for window functions (`RANK()`, `DENSE_RANK()`, etc.)
  - Issues with `JOIN` operations
  - Issues with `HAVING` clause

---

**Document Version**: 1.0  
**Last Updated**: 2025

