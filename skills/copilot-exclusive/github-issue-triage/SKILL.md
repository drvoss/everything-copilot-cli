---
name: github-issue-triage
description: Use when you have a backlog of unorganized GitHub Issues — bulk-reads, labels, prioritizes, and assigns issues at scale using Copilot's built-in GitHub MCP tools.
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP server (list_issues, search_issues, issue_read)"
---

# GitHub Issue Triage & Management

## Why This is Copilot-Exclusive

Copilot CLI has **native GitHub Issue tools** baked into its MCP server — `list_issues`,
`search_issues`, `issue_read` with sub-methods for comments, labels, and sub-issues. These
structured tool calls return rich, typed data that Copilot can reason over directly. Claude Code
has no built-in GitHub integration and must rely on `gh issue list` with fragile text parsing.

## When to Use

- Triaging a backlog of open issues across one or more repositories
- Auto-categorizing issues by content (bug, feature, docs, etc.)
- Finding duplicate or related issues before filing new ones
- Linking issues to pull requests for traceability
- Generating weekly issue reports or burndown summaries

## Workflow

### 1. List Open Issues with Filters

```
Tool: github-mcp-server-list_issues
  owner: "my-org"
  repo: "my-app"
  state: "OPEN"
  labels: ["bug"]
  orderBy: "UPDATED_AT"
  direction: "DESC"
  perPage: 25
```

### 2. Search Across Repositories

Find issues matching a keyword across your entire org:

```
Tool: github-mcp-server-search_issues
  query: "memory leak is:open"
  owner: "my-org"
```

### 3. Read Issue Details and Comments

```
Tool: github-mcp-server-issue_read
  method: "get"
  owner: "my-org"
  repo: "my-app"
  issue_number: 87

Tool: github-mcp-server-issue_read
  method: "get_comments"
  owner: "my-org"
  repo: "my-app"
  issue_number: 87
```

### 4. Check Sub-Issues

For tracking epics and parent/child relationships:

```
Tool: github-mcp-server-issue_read
  method: "get_sub_issues"
  owner: "my-org"
  repo: "my-app"
  issue_number: 42
```

### 5. Get Labels for Classification

```
Tool: github-mcp-server-issue_read
  method: "get_labels"
  owner: "my-org"
  repo: "my-app"
  issue_number: 87
```

## Examples

### Weekly Issue Triage Session

> "Show me all open issues in my-org/api-service created in the last 7 days,
>  grouped by label. For unlabeled issues, suggest a category based on the title
>  and body."

Copilot calls `list_issues` with a `since` filter, reads each issue's labels,
groups them, and uses the issue body to suggest labels for uncategorized ones.

### Duplicate Detection

> "Before I file a bug about 'WebSocket disconnects on idle timeout', check
>  if there's already an issue about this."

```
Tool: github-mcp-server-search_issues
  query: "WebSocket disconnect idle timeout"
  owner: "my-org"
  repo: "my-app"
```

Copilot searches, reads the top matches, and tells you whether to file new or
comment on an existing issue.

### Sprint Planning Report

> "List all issues labeled 'sprint-12' in my-org/frontend, show their status,
>  assignee, and whether they have linked PRs."

Copilot lists the issues, checks each for linked PRs via comments and cross-references,
and produces a sprint board summary right in the terminal.

### Batch Categorization with SQL Tracking

```sql
-- Track triage progress in session database
CREATE TABLE IF NOT EXISTS triage_items (
  issue_number INTEGER, repo TEXT, title TEXT,
  suggested_label TEXT, status TEXT DEFAULT 'pending'
);
```

Load issues into the session database, then work through them systematically.

## Tips

- **Parallel issue reads**: Call `issue_read` on multiple issues simultaneously
  to build a triage report fast.
- **Use `search_issues` for cross-repo queries**: The search syntax supports
  `org:`, `repo:`, `label:`, `assignee:`, `milestone:`, and date ranges.
- **Combine with session SQL**: Store triage results in the session database
  to track which issues you've reviewed and what actions you took.
- **Sub-issues for epic tracking**: Use `get_sub_issues` to check progress on
  large features broken into subtasks.
- **Link to PRs**: After identifying an issue, ask Copilot to search for PRs
  that reference it — closing the loop between issues and code changes.
