---
name: github-pr-workflow
description: Use when creating, updating, or managing pull requests — automates the full PR lifecycle (open, review requests, labels, merge) via GitHub MCP
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP server (pull_request_read, list_pull_requests, search_pull_requests)"
---

# GitHub PR Workflow Automation

## Why This is Copilot-Exclusive

Copilot CLI ships with a **built-in GitHub MCP server** that provides native, authenticated access
to the GitHub API — no tokens to configure, no extensions to install. You can list, search, read,
diff, and check CI status on pull requests using structured tool calls. Claude Code has no
equivalent built-in integration; it must shell out to `gh` CLI or raw `curl` commands with
manual token management.

## When to Use

- Creating PRs with well-structured descriptions from your commit history
- Reviewing incoming PRs without leaving your terminal
- Checking CI/CD status on a PR before merging
- Batch-triaging a queue of open pull requests
- Responding to review comments programmatically

## Workflow

### 1. List Open PRs in a Repository

Use `list_pull_requests` to see what needs attention:

```
Tool: github-mcp-server-list_pull_requests
  owner: "my-org"
  repo: "my-app"
  state: "open"
  sort: "updated"
  direction: "desc"
  perPage: 10
```

### 2. Read a Specific PR's Diff

Dive into the code changes with `pull_request_read`:

```
Tool: github-mcp-server-pull_request_read
  method: "get_diff"
  owner: "my-org"
  repo: "my-app"
  pullNumber: 142
```

### 3. Check CI Status

See if all checks are passing before you review:

```
Tool: github-mcp-server-pull_request_read
  method: "get_check_runs"
  owner: "my-org"
  repo: "my-app"
  pullNumber: 142
```

### 4. Read Review Comments

Pull up the review conversation:

```
Tool: github-mcp-server-pull_request_read
  method: "get_review_comments"
  owner: "my-org"
  repo: "my-app"
  pullNumber: 142
```

### 5. Search PRs by Author or Label

Find PRs from a specific contributor:

```
Tool: github-mcp-server-search_pull_requests
  query: "author:octocat is:open"
  owner: "my-org"
  repo: "my-app"
```

## Examples

### Morning PR Triage

> "List all open PRs in my-org/api-service sorted by most recently updated,
>  then for each one show me the CI status and a one-line summary of changes."

Copilot calls `list_pull_requests`, iterates results, calls `get_check_runs` and
`get_files` on each, and returns a concise triage report.

### Create a PR from Current Branch

```bash
# Stage and commit your changes first
git add -A && git commit -m "feat: add caching layer"

# Then ask Copilot:
# "Create a PR for my current branch targeting main. Generate the description
#  from my commit messages and include a testing checklist."
```

Copilot reads your git log, drafts a structured PR body, and uses `gh pr create`
to open it — all without you writing a single line of markdown.

### Cross-Repo PR Search

> "Find all open PRs across my-org that mention 'database migration' in the title"

```
Tool: github-mcp-server-search_pull_requests
  query: "database migration in:title is:open org:my-org"
```

## Tips

- **Batch parallel reads**: Copilot can call `get_diff`, `get_check_runs`, and
  `get_review_comments` in parallel for the same PR — much faster than sequential `gh` calls.
- **Use search over list**: `search_pull_requests` supports GitHub's full search syntax
  including labels, milestones, review status, and date ranges.
- **Combine with fleet mode**: Launch fleet agents to review multiple PRs simultaneously,
  each agent handling one PR and producing a summary.
- **CI-aware reviews**: Always check `get_check_runs` before diving into a diff review.
  If CI is red, focus on the failure first.
- **Paginate large results**: Use `page` and `perPage` parameters to handle repositories
  with hundreds of open PRs without overwhelming your context window.
