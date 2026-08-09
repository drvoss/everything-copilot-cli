---
name: session-management
description: Use when a task spans multiple steps or sessions and needs structured state tracking — leverages the built-in SQLite session database for todos, dependencies, and batch operation progress.
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in SQLite session database (sql tool), pre-built todos/todo_deps tables"
---

# Session SQL Database Management

## Why This is Copilot-Exclusive

Copilot CLI includes a **built-in SQLite database per session** accessible via a native `sql`
tool. It comes with pre-built `todos` and `todo_deps` tables and supports creating any custom
tables you need. This structured data layer enables proper task tracking, batch processing, and
state management — all queryable with SQL. Claude Code has no database; state management is
limited to reading/writing files or keeping everything in the conversation context.

## When to Use

- Tracking progress on multi-step tasks with dependencies
- Batch-processing items (issues, files, test cases) with status tracking
- Storing intermediate results from analysis or exploration
- Managing key-value state across a complex workflow
- Building reports from structured data (test results, PR reviews, audit findings)

## Workflow

### 1. Pre-Built Todo Tracking

The `todos` table is ready to use immediately:

```sql
-- Create todos for your task
INSERT INTO todos (id, title, description, status) VALUES
  ('setup-db', 'Set up database', 'Initialize Prisma schema with User and Post models', 'pending'),
  ('seed-data', 'Create seed data', 'Add development seed script with 10 users', 'pending'),
  ('api-routes', 'Build API routes', 'REST endpoints for User CRUD operations', 'pending');

-- Define dependencies
INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('seed-data', 'setup-db'),
  ('api-routes', 'setup-db');
```

### 2. Track Progress as You Work

```sql
-- Start working on a todo
UPDATE todos SET status = 'in_progress', updated_at = datetime('now') WHERE id = 'setup-db';

-- Complete it
UPDATE todos SET status = 'done', updated_at = datetime('now') WHERE id = 'setup-db';

-- Check what's ready to start next
SELECT t.id, t.title FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos dep ON td.depends_on = dep.id
  WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

### 3. Custom Tables for Any Purpose

#### Test Case Tracking

```sql
CREATE TABLE test_cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'not_written',
  notes TEXT
);

INSERT INTO test_cases (id, name, file_path) VALUES
  ('tc-login', 'User login flow', 'tests/auth/login.test.ts'),
  ('tc-register', 'User registration', 'tests/auth/register.test.ts'),
  ('tc-logout', 'User logout', 'tests/auth/logout.test.ts');

-- Track TDD progress
UPDATE test_cases SET status = 'written' WHERE id = 'tc-login';
SELECT * FROM test_cases WHERE status = 'not_written';
```

#### Batch Processing

```sql
CREATE TABLE files_to_process (
  path TEXT PRIMARY KEY,
  action TEXT,
  status TEXT DEFAULT 'pending',
  result TEXT
);

-- Load files to process
INSERT INTO files_to_process (path, action) VALUES
  ('src/utils/string.ts', 'add-jsdoc'),
  ('src/utils/array.ts', 'add-jsdoc'),
  ('src/utils/date.ts', 'add-jsdoc');

-- Process one at a time
SELECT path, action FROM files_to_process WHERE status = 'pending' LIMIT 1;
UPDATE files_to_process SET status = 'done', result = 'Added 5 JSDoc comments' WHERE path = 'src/utils/string.ts';
```

#### Key-Value State

```sql
CREATE TABLE session_state (key TEXT PRIMARY KEY, value TEXT);

INSERT OR REPLACE INTO session_state (key, value) VALUES
  ('current_phase', 'testing'),
  ('target_branch', 'feature/auth'),
  ('last_test_run', '2024-01-15T10:30:00Z');

SELECT value FROM session_state WHERE key = 'current_phase';
```

## Examples

### Code Review Tracker

```sql
CREATE TABLE review_items (
  id TEXT PRIMARY KEY,
  file_path TEXT,
  line_number INTEGER,
  severity TEXT,  -- 'critical', 'warning', 'suggestion'
  comment TEXT,
  status TEXT DEFAULT 'pending'
);

-- Copilot populates this during code review
INSERT INTO review_items (id, file_path, line_number, severity, comment) VALUES
  ('r1', 'src/auth.ts', 42, 'critical', 'SQL injection vulnerability in query'),
  ('r2', 'src/api.ts', 15, 'warning', 'Missing error handling for null case'),
  ('r3', 'src/utils.ts', 88, 'suggestion', 'Could use optional chaining here');

-- Work through issues by severity
SELECT * FROM review_items WHERE severity = 'critical' AND status = 'pending';
UPDATE review_items SET status = 'fixed' WHERE id = 'r1';

-- Progress dashboard
SELECT severity, status, COUNT(*) as count
FROM review_items
GROUP BY severity, status;
```

### Migration Tracking

```sql
CREATE TABLE migration_files (
  source_path TEXT PRIMARY KEY,
  target_path TEXT,
  migration_type TEXT,
  status TEXT DEFAULT 'pending',
  errors TEXT
);

-- Track a JS → TS migration
INSERT INTO migration_files (source_path, target_path, migration_type) VALUES
  ('src/users.js', 'src/users.ts', 'js-to-ts'),
  ('src/orders.js', 'src/orders.ts', 'js-to-ts');

-- Summary
SELECT status, COUNT(*) FROM migration_files GROUP BY status;
```

## Tips

- **Use the pre-built tables**: `todos` and `todo_deps` are ready immediately —
  no setup needed for basic task tracking.
- **Descriptive IDs**: Use kebab-case IDs like `setup-db` instead of `t1` —
  they're self-documenting in query results.
- **Query for dashboards**: `GROUP BY status` gives instant progress summaries.
- **Cross-reference tables**: Join your custom tables with `todos` for rich
  tracking (e.g., link test cases to feature todos).
- **The database resets per session**: Data doesn't persist across sessions.
  For persistent data, write results to files before ending your session.
- **SQL is your reporting engine**: Generate summaries, find outliers, and
  track patterns that would be impossible to manage in plain text.
