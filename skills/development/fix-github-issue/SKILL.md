---
name: fix-github-issue
description: Use when you have a GitHub Issue number or link and want it resolved end-to-end — reads the issue, locates the bug, applies a fix, writes tests, and opens a PR from the terminal.
metadata:
  category: development
  agent_type: general-purpose
---

# Fix GitHub Issue

## When to Use

- You have a GitHub Issue number and want to resolve it from scratch
- Debugging a reported bug with a clear reproduction case
- Picking up an issue from the backlog and implementing the fix
- Fast-track for "good first issue" or well-scoped bug reports

**Differentiation from `github-issue-triage`**: This skill *fixes* issues (code changes, tests,
PR). `github-issue-triage` is for *organizing and classifying* issues in bulk.

## Prerequisites

- GitHub MCP server available (built-in to Copilot CLI)
- Write access to the repository for creating a branch and PR
- `gh` CLI installed (for branch creation and PR fallback)

## Workflow

### 1. Read the Issue

```powershell
# Via Copilot MCP (structured data, no token needed):
# Tool: github-mcp-server-issue_read
#   method: "get"
#   owner: "my-org"
#   repo: "my-app"
#   issue_number: 123

# Also read any existing comments for additional context:
# Tool: github-mcp-server-issue_read
#   method: "get_comments"
#   owner: "my-org"
#   repo: "my-app"
#   issue_number: 123
```

Extract:
- **Expected behavior** vs **actual behavior**
- **Reproduction steps**
- **Stack trace or error message** (if present)
- **Labels** (bug/enhancement/docs)

### 2. Search for the Root Cause

```powershell
# Search for the symbol, function, or error message mentioned in the issue
git --no-pager grep -n "functionNameFromIssue" -- "*.ts" "*.js"

# If it's an error message, search for where it's generated
git --no-pager grep -rn "the exact error string"

# Recent changes to the affected file
git --no-pager log --oneline -10 -- path/to/file.ts
```

### 3. Create a Dedicated Branch

```powershell
$issueNumber = 123
$shortDesc = "fix-null-check-users-api"
git checkout -b "fix/issue-$issueNumber-$shortDesc"
```

### 4. Reproduce the Issue (Write a Failing Test First)

If the project has tests, write the test before fixing:

```powershell
# Run existing tests to confirm baseline
npm test -- --testPathPattern="users"

# Write a failing test that demonstrates the bug
# (Edit the appropriate test file)

# Confirm test fails
npm test -- --testPathPattern="users" 2>&1 | Select-Object -Last 20
```

### 5. Implement the Fix

Make the minimal change to fix the root cause. Avoid unrelated cleanup in this commit.

```powershell
# Verify tests pass after fix
npm test -- --testPathPattern="users"

# Run broader test suite
npm test
```

### 6. Commit with Issue Reference

```powershell
git add -A
git commit -m "🐛 fix(users): handle null response when user not found

Fixes #123. The /api/users/:id endpoint was throwing a 500 error when the
user ID did not exist instead of returning 404. Added null check before
accessing user.profile."
```

### 7. Push and Open a PR

```powershell
git push -u origin HEAD

# Open PR via gh CLI
gh pr create `
  --title "fix: handle null user in /api/users/:id (closes #123)" `
  --body "## Summary
Fixes #123

## Root Cause
The handler called \`user.profile.name\` without checking if \`user\` existed.

## Fix
Added early return with 404 response when user is not found.

## Testing
- Added unit test \`should return 404 when user not found\`
- All existing tests pass" `
  --base main
```

## Examples

### Bug: API Returns 500 Instead of 404

```
Issue #89: GET /api/posts/999 returns 500 Internal Server Error
Expected: 404 Not Found
Actual: TypeError: Cannot read property 'title' of null
```

**Copilot workflow:**
1. `issue_read` → get full issue context
2. `grep -n "Cannot read property"` → find where null is accessed
3. Create branch `fix/issue-89-null-post`
4. Write test: `expect(response.status).toBe(404)`
5. Fix: add `if (!post) return res.status(404).json({ error: 'Post not found' })`
6. Commit with `Fixes #89`
7. Open PR

### Enhancement: Add Missing Field to API Response

```
Issue #102: Missing 'updatedAt' field in /api/users response
Expected: response includes updatedAt timestamp
Actual: field not present
```

**Copilot workflow:**
1. `issue_read` + `get_comments` → clarify which endpoint and format
2. Search for the serializer/transformer function
3. Add `updatedAt` field
4. Update API docs/types
5. Commit with `Fixes #102`

## Tips

- **Always read comments** — the reporter or maintainers often add crucial context after filing
- **Label check**: if issue is labeled `needs-repro`, ask for reproduction steps before fixing
- **Small PRs fix faster**: keep fix PRs minimal — reference the issue for full context
- **Use `Fixes #N` in commit**: GitHub will auto-close the issue on merge
- **Check for duplicates**: search for related issues before starting — `search_issues` with the error message

## See Also

- [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md) — organize/classify issues in bulk
- [`commit-workflow`](../../workflow/commit-workflow/SKILL.md) — craft the commit message
- [`github-pr-workflow`](../../copilot-exclusive/github-pr-workflow/SKILL.md) — manage the resulting PR
- *Inspired by: [awesome-claude-code/resources/slash-commands/fix-github-issue](https://github.com/hesreallyhim/awesome-claude-code)*
