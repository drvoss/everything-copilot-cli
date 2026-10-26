---
name: github-issue-triage
description: Use when you have a backlog of unorganized GitHub Issues — bulk-reads, prioritizes, and labels issues at scale using `gh` (the default when installed) or Copilot's built-in GitHub MCP tools when exposed, and proposes assignees
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP server (list_issues, search_issues, issue_read)"
---

# GitHub Issue Triage & Management

## Why This is Copilot-Exclusive

GitHub access is built into Copilot CLI with no extra setup: the built-in GitHub MCP server (full
tool set when `gh` is absent, or when restored with the flags in the note below) or `gh`, which
the model is expected to use when it is installed. When exposed, the MCP issue tools add sub-methods for comments,
labels, and sub-issues. Either way Copilot reasons over the results directly. What is exclusive is the built-in GitHub MCP server, which needs no token or extension setup; when `gh` is installed, the model mostly uses `gh`, which any agent with a shell can also run.

> **Note:** When `gh` is on PATH, Copilot CLI omits these issue tools (`list_issues`, `search_issues`, `issue_read`) and the model is expected to use `gh` instead,
> e.g. `gh issue list --state open --label <label>`, `gh issue view <n> --comments`, `gh search issues "<query>"`. To call the MCP tools,
> start the session with `--add-github-mcp-tool=<name>` for every GitHub MCP tool you need (it replaces the default set, so include default ones you still use), or `--enable-all-github-mcp-tools`, which also enables write tools.

## When to Use

- Triaging a backlog of open issues across one or more repositories
- Auto-categorizing issues by content (bug, feature, docs, etc.)
- Finding duplicate or related issues before filing new ones
- Building one queue from both issues and external-contributor PRs
- Linking issues to pull requests for traceability
- Generating weekly issue reports or burndown summaries

## Workflow

### 1. List Open Issues with Filters

With `gh` on PATH (default), e.g. `gh issue list --repo my-org/my-app --state open --label bug --limit 25`. When the MCP tools are exposed:

```text
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

Find issues matching a keyword across your entire org.
With `gh` on PATH (default), e.g. `gh search issues "memory leak" --owner my-org --state open`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-search_issues
  query: "memory leak is:open"
  owner: "my-org"
```

### 3. Read Issue Details and Comments

With `gh` on PATH (default), e.g. `gh issue view 87 --repo my-org/my-app --comments`. When the MCP tools are exposed:

```text
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

For tracking epics and parent/child relationships.
With `gh` on PATH (default), e.g. `gh api repos/my-org/my-app/issues/42/sub_issues`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-issue_read
  method: "get_sub_issues"
  owner: "my-org"
  repo: "my-app"
  issue_number: 42
```

### 5. Get Labels for Classification

With `gh` on PATH (default), e.g. `gh issue view 87 --repo my-org/my-app --json labels`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-issue_read
  method: "get_labels"
  owner: "my-org"
  repo: "my-app"
  issue_number: 87
```

### 6. Pull External-Contributor PRs into the Queue

If the inbox includes PRs as well as issues, filter for outside contributors first and then route
those PRs through the same triage state model you use for issues.

```powershell
gh pr list --limit 100 --json number,title,authorAssociation,isDraft,url |
  ConvertFrom-Json |
  Where-Object {
    $_.authorAssociation -in @('CONTRIBUTOR', 'FIRST_TIME_CONTRIBUTOR', 'NONE') -and
    -not $_.isDraft
  }
```

Treat `OWNER`, `MEMBER`, and `COLLABORATOR` PRs as normal maintainer review unless your project has
a stronger triage requirement. If a bare reference such as `#42` could point to either a PR or an
issue, check the PR first and fall back to the issue only if no PR exists.

When an external PR duplicates existing work, close the loop explicitly: mark it `wontfix`, link
the authoritative issue or PR, and avoid creating a second parallel thread for the same request.

## Examples

### Weekly Issue Triage Session

> "Show me all open issues in my-org/api-service created in the last 7 days,
> grouped by label. For unlabeled issues, suggest a category based on the title
> and body."

Copilot runs `gh issue list --repo my-org/api-service --search "created:>=<date>"` (when exposed: `list_issues` with a `since` filter), reads each issue's labels,
groups them, and uses the issue body to suggest labels for uncategorized ones.

### Duplicate Detection

> "Before I file a bug about 'WebSocket disconnects on idle timeout', check
> if there's already an issue about this."

With `gh` on PATH (default), e.g. `gh search issues "WebSocket disconnect idle timeout" --repo my-org/my-app`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-search_issues
  query: "WebSocket disconnect idle timeout"
  owner: "my-org"
  repo: "my-app"
```

Copilot searches, reads the top matches, and tells you whether to file new or
comment on an existing issue.

### Sprint Planning Report

> "List all issues labeled 'sprint-12' in my-org/frontend, show their status,
> assignee, and whether they have linked PRs."

Copilot lists the issues, checks each for linked PRs via comments and cross-references,
and produces a sprint board summary right in the terminal.

### Shared Issue + PR Intake

> "Show me new outside-contributor PRs and new unlabeled issues from the last week, then tell me
> which ones need triage first."

Copilot lists issues with `gh issue list` (or the MCP issue tools when exposed), pulls in external PRs with `gh pr list`, then routes
the highest-signal items into the same triage queue instead of treating PRs as a separate inbox.

### Batch Categorization with SQL Tracking

```sql
-- Track triage progress in session database
CREATE TABLE IF NOT EXISTS triage_items (
  issue_number INTEGER, repo TEXT, title TEXT,
  suggested_label TEXT, status TEXT DEFAULT 'pending'
);
```

Load issues into the session database, then work through them systematically.

## When the Report Is a Vulnerability

A security report must not be triaged in public. If someone opens an issue describing a
vulnerability, do not discuss the details in the thread — point the reporter to the repository's
private vulnerability reporting (Security → Advisories), then close and lock the public issue.
Neither makes its content private: if it contains exploit or other sensitive details, ask a
repository admin to delete it — in an organization, an owner may first have to allow issue deletion.

For the advisory itself, the agent prepares evidence and fixes; a maintainer accepts, merges,
releases, and publishes:

| Step | Who |
|------|-----|
| Verify the claim: who owns the code path, and which release lines are affected | agent, then a maintainer confirms |
| Accept the advisory (the reporter sees this) | **human only** |
| Fix in the advisory's temporary private fork and review there, not in a public PR | agent may prepare the fix |
| Merge to **every** affected release line and release each one | agent lists the lines; a maintainer merges and releases |
| Publish the advisory — there is no unpublish | **human only** |

After publication, follow-up issues, labels, and board cards fall under the repository's normal
triage rules.

Do not copy the reproduction or proof of concept onto a project board or a tracking issue: people
with project access are not necessarily advisory collaborators. Link to the advisory instead.
Before publishing, check the credits and decide on a CVE. For reports that came in through private
vulnerability reporting, GitHub adds the reporter as a credited user automatically; for an advisory a
maintainer opened, add the credits explicitly. This mirrors the maintainer flow
`modelcontextprotocol/inspector` keeps in its repository (documentation under CC-BY-4.0).

## Tips

- **Parallel issue reads**: Call `issue_read` (with `gh`: `gh issue view`) on multiple issues simultaneously
  to build a triage report fast.
- **Use `search_issues` (with `gh`: `gh search issues`) for cross-repo queries**: The search syntax supports
  `org:`, `repo:`, `label:`, `assignee:`, `milestone:`, and date ranges.
- **Combine with session SQL**: Store triage results in the session database
  to track which issues you've reviewed and what actions you took.
- **Sub-issues for epic tracking**: Use `get_sub_issues` (with `gh`: `gh api .../issues/<n>/sub_issues`) to check progress on
  large features broken into subtasks.
- **Link to PRs**: After identifying an issue, ask Copilot to search for PRs
  that reference it — closing the loop between issues and code changes.
- **Pair with `triage` for per-item state**: Use
  [`workflow/triage`](../../workflow/triage/SKILL.md) when one issue or one external PR needs a
  durable `needs-info` / `ready-for-agent` / `wontfix` decision.
