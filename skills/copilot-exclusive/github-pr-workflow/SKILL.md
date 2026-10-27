---
name: github-pr-workflow
license: MIT
description: Use when creating, updating, or managing pull requests — reads PRs and reviews with `gh` (the default when installed) or the built-in GitHub MCP server when exposed, and opens, updates, or merges them with /pr or gh
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP server (pull_request_read, list_pull_requests, search_pull_requests)"
---

# GitHub PR Workflow Automation

## Why This is Copilot-Exclusive

GitHub access is built into Copilot CLI with no extra setup: the built-in GitHub MCP server (full
tool set when `gh` is absent, or when restored with the flags in the note below) or `gh`, which
the model is expected to use when it is installed. Either way you can list,
search, read, diff, and check CI status on pull requests in one conversation. What is exclusive is the built-in GitHub MCP server, which needs no token or extension setup; when `gh` is installed, the model mostly uses `gh`, which any agent with a shell can also run.

> **Note:** When `gh` is on PATH, Copilot CLI omits the PR read tools (`list_pull_requests`, `search_pull_requests`, `pull_request_read`) and the model is expected to use `gh`
> instead, e.g. `gh pr list`, `gh pr diff <n>`, `gh pr checks <n>`. To call the MCP tools,
> start the session with `--add-github-mcp-tool=<name>` for every GitHub MCP tool you need (it replaces the default set, so include default ones you still use), or `--enable-all-github-mcp-tools`, which also enables write tools.

## When to Use

- Creating PRs with well-structured descriptions from your commit history
- Reviewing incoming PRs without leaving your terminal
- Checking CI/CD status on a PR before merging
- Batch-triaging a queue of open pull requests
- Responding to review comments programmatically

## Workflow

### 1. List Open PRs in a Repository

See what needs attention — with `gh` on PATH (default), e.g. `gh pr list --repo my-org/my-app --state open --limit 10`.
When the MCP tools are exposed, use `list_pull_requests`:

```text
Tool: github-mcp-server-list_pull_requests
  owner: "my-org"
  repo: "my-app"
  state: "open"
  sort: "updated"
  direction: "desc"
  perPage: 10
```

### 2. Read a Specific PR's Diff

Dive into the code changes — with `gh` on PATH (default), e.g. `gh pr diff 142 --repo my-org/my-app`.
When the MCP tools are exposed, use `pull_request_read`:

```text
Tool: github-mcp-server-pull_request_read
  method: "get_diff"
  owner: "my-org"
  repo: "my-app"
  pullNumber: 142
```

### 3. Check CI Status

See if all checks are passing before you review.
With `gh` on PATH (default), e.g. `gh pr checks 142 --repo my-org/my-app`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-pull_request_read
  method: "get_check_runs"
  owner: "my-org"
  repo: "my-app"
  pullNumber: 142
```

### 4. Read Review Comments

Pull up the review conversation.
With `gh` on PATH (default), e.g. `gh api repos/my-org/my-app/pulls/142/comments`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-pull_request_read
  method: "get_review_comments"
  owner: "my-org"
  repo: "my-app"
  pullNumber: 142
```

### 5. Search PRs by Author or Label

Find PRs from a specific contributor.
With `gh` on PATH (default), e.g. `gh search prs --author octocat --repo my-org/my-app --state open`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-search_pull_requests
  query: "author:octocat is:open"
  owner: "my-org"
  repo: "my-app"
```

## Examples

### Morning PR Triage

> "List all open PRs in my-org/api-service sorted by most recently updated,
> then for each one show me the CI status and a one-line summary of changes."

Copilot runs `gh search prs --repo my-org/api-service --state open --sort updated --order desc`, then
`gh pr checks <n> --repo my-org/api-service` and `gh pr view <n> --repo my-org/api-service --json files` on each (when exposed: `list_pull_requests`,
`get_check_runs`, `get_files`), and returns a concise triage report.

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

With `gh` on PATH (default), e.g. `gh search prs "database migration in:title" --owner my-org --state open`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-search_pull_requests
  query: "database migration in:title is:open org:my-org"
```

## Tips

- **Batch parallel reads**: Copilot can call `get_diff`, `get_check_runs`, and
  `get_review_comments` in parallel for the same PR when the MCP tools are exposed; with `gh` on PATH the
  model is expected to use `gh pr diff`, `gh pr checks`, and `gh api` instead.
- **Use search over list**: `search_pull_requests` (with `gh`: `gh search prs`) supports GitHub's full search syntax
  including labels, milestones, review status, and date ranges.
- **Combine with fleet mode**: Launch fleet agents to review multiple PRs simultaneously,
  each agent handling one PR and producing a summary.
- **CI-aware reviews**: Always check `get_check_runs` (with `gh`: `gh pr checks <n>`) before diving into a diff review.
  If CI is red, focus on the failure first.
- **Paginate large results**: Use `page` and `perPage` parameters (with `gh`: `--limit`) to handle repositories
  with hundreds of open PRs without overwhelming your context window.

## Automated Review-Loop (copilot-pr-autopilot)

Automate the full Copilot Code Review cycle: request → monitor → triage → fix → resolve → re-trigger.
Inspired by the `copilot-pr-autopilot` pattern from [github/awesome-copilot PR #1944](https://github.com/github/awesome-copilot/pull/1944).

### Loop Overview

```text
1. Request Copilot Code Review on the PR
2. Poll until review is complete (status: "completed" or "action_required")
3. Triage open review threads:
   - Actionable → fix in code
   - Outdated / resolved by other changes → reply + resolve
4. Commit fixes with a targeted message
5. Re-trigger Copilot Code Review
6. Repeat until no actionable threads remain
```

### When to Use This Loop

- You want to resolve all Copilot review comments without manual thread triage
- You are working as an external contributor (single-iteration mode recommended)
- You need to clear a review queue before merge

### Implementation Pattern

Use `gh api graphql` for thread-level operations that the REST API does not expose:

```bash
# List unresolved review threads on a PR
gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 50) {
          nodes { id isResolved isOutdated comments(first: 1) { nodes { body } } }
        }
      }
    }
  }
' -f owner=MY-ORG -f repo=MY-REPO -F pr=142
```

```bash
# Resolve a specific thread after fixing
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: {threadId: $threadId}) { thread { id isResolved } }
  }
' -f threadId=THREAD_ID
```

### Triage Strategy

| Thread state | Action |
|---|---|
| Actionable, code not fixed | Fix in source, then resolve |
| Outdated (code changed since comment) | Reply "Addressed by [commit]", then resolve |
| Duplicate of a resolved thread | Resolve without reply |
| Requires discussion | Leave open, note for human reviewer |

### Single-Iteration Mode (External Contributor Friendly)

For repositories where you lack Triage/Write permissions, run one iteration only:

1. Fix all actionable threads in a single commit
2. Reply to each thread explaining the fix
3. Leave resolution to the PR author or maintainer

### Safety Guards

- **Require Triage permission** before calling `resolveReviewThread` — check `viewerCanResolveThread` in the GraphQL query
- **Never auto-resolve threads marked as security-blocking** — check the thread body for "BLOCK" or severity markers
- **Cap iterations at 5** to prevent runaway loops on PRs with continuously regenerated review comments
- **Do not delete stale comments automatically** — reply and resolve instead; git blame and PR history should remain intact

## Staged Writes: Let the Agent Propose, Not Publish

An agent that reads untrusted text (issue bodies, review comments, fetched pages) and can also write
to GitHub in the same step is one prompt injection away from posting or merging something nobody
reviewed. GitHub Agentic Workflows (`github/gh-aw`) reduces this risk by default: agent jobs run
read-only and sandboxed, and GitHub writes are sanitized and applied by separate `safe-outputs` jobs
with scoped permissions. That isolates the write permission; it is not human review — writes still
run automatically unless an environment approval rule requires a reviewer, and workflow authors can
grant direct write permissions or add custom jobs. The same split works in an interactive session:

1. **Generate read-only** — the agent drafts the PR body, review reply, or label change as a file or
   as text in the session. It does not call `gh pr create`, `gh pr merge`, or a GraphQL mutation yet.
2. **Inspect the draft** — check it for secrets, unexpected links or mentions, and a patch that touches
   files outside the stated scope.
3. **Apply in a separate step** — run the write command only after the inspection, ideally after a
   human confirms. Merges and anything addressed to people outside the repository should always wait
   for that confirmation.

Use this split whenever the agent's input came from someone other than you.
