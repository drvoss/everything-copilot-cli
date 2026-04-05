---
name: code-review
description: Use when reviewing code changes for quality, correctness, and security — runs a structured checklist with severity-rated findings
metadata:
  category: development
  agent_type: code-review
---

# Code Review

## When to Use
- Reviewing pull requests before merge
- Auditing code changes after a feature branch is complete
- Self-reviewing your own changes before committing
- Investigating code quality concerns raised by teammates

## Prerequisites
- Changes are committed or staged in git
- Access to the repository and its test suite
- Understanding of the project's coding standards

## Workflow

### 1. Understand the Scope
```powershell
# See what files changed
git --no-pager diff --stat main...HEAD

# Get a summary of the diff
git --no-pager diff main...HEAD --shortstat
```

For PR reviews, use the `code-review` agent type which is purpose-built for this:
```
task agent_type: "code-review"
prompt: "Review the staged changes in this repository"
```

### 2. Review Checklist
Evaluate each changed file against these categories:

| Priority | Category | What to Check |
|----------|----------|---------------|
| 🔴 Critical | **Correctness** | Logic errors, off-by-one, null handling, race conditions |
| 🔴 Critical | **Security** | Injection, auth bypass, secret exposure, unsafe deserialization |
| 🟡 Important | **Error handling** | Missing try/catch, unhandled promise rejections, error propagation |
| 🟡 Important | **Edge cases** | Empty inputs, large inputs, unicode, concurrent access |
| 🟢 Minor | **Performance** | N+1 queries, unnecessary re-renders, missing indexes |
| 🟢 Minor | **Maintainability** | Dead code, unclear naming, missing types |

### 3. Investigate Suspicious Patterns
```powershell
# Find TODO/FIXME/HACK left in changed files
git --no-pager diff main...HEAD | Select-String "TODO|FIXME|HACK"

# Check for console.log or debug statements
git --no-pager diff main...HEAD | Select-String "console\.log|debugger|print\("
```

### 4. Verify Tests
```powershell
# Ensure tests exist for changed source files
git --no-pager diff --name-only main...HEAD | Select-String "\.(ts|js|py|go)$"

# Run the test suite
npm test 2>&1 | Select-Object -Last 20
```

### 5. Severity Levels for Findings
- **🔴 Blocker** — Must fix before merge (bugs, security issues, data loss)
- **🟡 Warning** — Should fix, but not a merge blocker (error handling gaps, missing tests)
- **🟢 Suggestion** — Nice to have (naming, style, minor optimization)
- **💡 Nitpick** — Optional, low priority (formatting, comment wording)

### 6. Check for Breaking Changes
```powershell
# Look for changed function signatures or removed exports
git --no-pager diff main...HEAD -- "*.ts" | Select-String "^[-+].*(export|public|function)"

# Check for changed API routes or database schemas
grep -rn "router\.\|app\.\|migration" --include="*.ts" src/
```

## Examples

### Quick Self-Review Before Commit
```powershell
# Stage changes and review
git add -A
git --no-pager diff --cached --stat
git --no-pager diff --cached
```

### PR Review with code-review Agent
The `code-review` agent provides high signal-to-noise analysis — it only surfaces
issues that genuinely matter (bugs, security, logic errors), never style or formatting.

```
task agent_type: "code-review"
prompt: "Review changes between main and the current branch. Focus on correctness and security."
```

## Tips
- Review tests first — they document the intended behavior
- Read the PR description/issue before the code to understand intent
- Check the **boundaries** between changed and unchanged code
- For large PRs, review file-by-file using `view` tool rather than reading raw diffs
- Use `explore` agent to understand unfamiliar code paths before commenting
- If a change is too large to review effectively, that itself is feedback worth giving
