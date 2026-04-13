---
name: pr-multi-perspective-review
description: Review a pull request from 6 perspectives (PM, Dev, QA, Security, DevOps, UX) for comprehensive, bias-free feedback
metadata:
  category: development
  agent_type: code-review
---

# PR Multi-Perspective Review

## When to Use

- Before merging any significant PR — to catch issues a single reviewer might miss
- When the PR touches multiple concerns (UI + API + infra all at once)
- For PRs with external impact: public API changes, auth logic, billing flows
- As a pre-merge gate in high-stakes or regulated environments

**Differentiation from `code-review`**: `code-review` is a single technical pass.
This skill runs **6 distinct lenses** simultaneously, surfacing business, quality, and
operational issues that a developer reviewer alone would not flag.

## Prerequisites

- PR is open and has a diff available (via `gh` CLI or GitHub MCP)
- At minimum: PR description exists (even if brief)

## Workflow

### Option A — Single Session (Sequential, Lower Token Cost)

Suitable for smaller PRs or when fleet is not available.

```powershell
# Fetch the PR diff
$pr = 123
gh pr diff $pr

# Fetch PR description and metadata
gh pr view $pr --json title,body,labels,additions,deletions,changedFiles
```

Then work through each perspective in the same session using the prompts below.

### Option B — Fleet Parallel (6 Concurrent Agents, Faster)

Use fleet mode to run all 6 perspectives simultaneously:

```text
> /fleet Run a 6-perspective review of PR #123 in owner/repo.
> Launch 6 parallel agents, each with a different lens:
>   1. PM lens: business value, scope, requirements alignment
>   2. Dev lens: code quality, architecture, maintainability
>   3. QA lens: test coverage, edge cases, regression risk
>   4. Security lens: vulnerabilities, secrets, auth, input validation
>   5. DevOps lens: CI/CD impact, performance, observability, rollback
>   6. UX lens: user-facing changes, error messages, accessibility
> Each agent should output: [PASS/CONCERN/BLOCK] + findings as bullet list.
> Final agent: synthesize all 6 outputs into a single review comment.
```

---

### The 6 Perspectives

#### 1. 📋 PM Lens — Business & Requirements

**Questions to answer:**

- Does this PR deliver what the linked issue/ticket describes?
- Are there scope creep additions not in the original requirement?
- Is the change reversible if it needs to be rolled back?
- Are all acceptance criteria met?

```powershell
# Check linked issues
gh pr view $pr --json body | Select-String "closes|fixes|resolves" -i
gh pr view $pr --json labels
```

**Output format:**

```text
[PM] STATUS: PASS / CONCERN / BLOCK
- Finding 1
- Finding 2
```

#### 2. 🛠️ Dev Lens — Code Quality & Architecture

**Questions to answer:**

- Are there logic errors, off-by-one bugs, or null-pointer risks?
- Does the abstraction level match the rest of the codebase?
- Is there duplication that should be extracted?
- Are naming and readability consistent with conventions?

```powershell
# Review the diff
gh pr diff $pr | Select-String "^\+" | Select-Object -First 100

# Check complexity hotspots
gh pr view $pr --json files | ConvertFrom-Json | Select-Object -ExpandProperty files |
  Sort-Object additions -Descending | Select-Object -First 5
```

**Output format:**

```text
[DEV] STATUS: PASS / CONCERN / BLOCK
- Finding 1
- Finding 2
```

#### 3. 🧪 QA Lens — Test Coverage & Edge Cases

**Questions to answer:**

- Are new code paths covered by tests?
- Are happy path + error path + edge cases all represented?
- Do existing tests still cover the changed behavior?
- Is there risk of regression in adjacent functionality?

```powershell
# Check test files in the diff
gh pr view $pr --json files | ConvertFrom-Json | Select-Object -ExpandProperty files |
  Where-Object { $_.path -match 'test|spec|__tests__' }

# Count test additions vs source additions
$files = gh pr view $pr --json files | ConvertFrom-Json | Select-Object -ExpandProperty files
$testLines = ($files | Where-Object { $_.path -match 'test|spec' } | Measure-Object additions -Sum).Sum
$srcLines  = ($files | Where-Object { $_.path -notmatch 'test|spec' } | Measure-Object additions -Sum).Sum
Write-Host "Test:Source ratio = $testLines : $srcLines"
```

**Output format:**

```text
[QA] STATUS: PASS / CONCERN / BLOCK
- Finding 1
- Finding 2
```

#### 4. 🔒 Security Lens — Vulnerabilities & Trust Boundaries

**Questions to answer:**

- Is user input validated before use?
- Are auth/authorization checks present on new endpoints?
- Could any change leak secrets, PII, or internal details?
- Are new dependencies free of known CVEs?

```powershell
# Scan diff for security patterns
gh pr diff $pr | Select-String "password|secret|token|api.key|eval\(|exec\(" -i

# Check new dependencies
gh pr view $pr --json files | ConvertFrom-Json | Select-Object -ExpandProperty files |
  Where-Object { $_.path -match 'package.json|requirements|go.mod|Cargo.toml' }
```

**Output format:**

```text
[SECURITY] STATUS: PASS / CONCERN / BLOCK
- Finding 1
- Finding 2
```

#### 5. 🚀 DevOps Lens — Operations & Reliability

**Questions to answer:**

- Will CI pass? Are there environment-specific assumptions?
- Are there performance implications (N+1 queries, large allocations)?
- Is the change observable? Are new log lines / metrics / traces added?
- Is rollback safe? Does this require a migration or feature flag?

```powershell
# Check CI status on the PR
# Tool: github-mcp-server-pull_request_read
#   method: "get_check_runs"
#   owner: "my-org"  repo: "my-app"  pullNumber: 123

# Look for migration files
gh pr view $pr --json files | ConvertFrom-Json | Select-Object -ExpandProperty files |
  Where-Object { $_.path -match 'migration|migrate|schema' }
```

**Output format:**

```text
[DEVOPS] STATUS: PASS / CONCERN / BLOCK
- Finding 1
- Finding 2
```

#### 6. 🎨 UX Lens — User-Facing Impact

*Only relevant when the PR touches UI, API responses, error messages, or CLI output.*

**Questions to answer:**

- Are error messages clear and actionable for end users?
- Are breaking changes to public APIs or CLI flags documented?
- Is accessibility considered for UI changes?
- Are loading/empty states handled?

```powershell
# Check for user-facing files
gh pr view $pr --json files | ConvertFrom-Json | Select-Object -ExpandProperty files |
  Where-Object { $_.path -match '\.tsx?$|\.vue$|\.svelte$|\.css$|messages\.|i18n\.' }
```

**Output format:**

```text
[UX] STATUS: PASS / CONCERN / BLOCK
- Finding 1 (or "N/A — no user-facing changes")
```

---

### Final Synthesis

After all 6 lenses complete, compile the summary:

```markdown
## Multi-Perspective Review: PR #123

| Lens | Status | Key Finding |
|------|--------|-------------|
| PM | ✅ PASS | Scope matches issue #89 |
| Dev | ⚠️ CONCERN | null check missing in getUserById |
| QA | ✅ PASS | Test added for 404 case |
| Security | 🚫 BLOCK | User ID not validated before DB query |
| DevOps | ✅ PASS | No migration required |
| UX | ✅ PASS | 404 error message is user-friendly |

**Overall: 🚫 BLOCK — Security issue must be resolved before merge.**

### Required Before Merge
- [ ] Add input validation for userId parameter (Security)

### Suggested Improvements
- [ ] Add null check in getUserById helper (Dev)
```

## Tips

- **BLOCK is a hard stop** — any single BLOCK means the PR should not merge until resolved
- **CONCERN is advisory** — capture it as a follow-up issue if not fixing now
- **Skip irrelevant lenses** — if the PR has no UI changes, mark UX as N/A upfront
- **Fleet version scales better** — for large PRs (>500 lines), fleet runs 6x faster than sequential
- **Post as PR comment**: use `gh pr comment $pr --body-file review.md` to submit the synthesis

## See Also

- [`code-review`](../code-review/SKILL.md) — single-lens technical review (faster for small PRs)
- [`github-pr-workflow`](../../copilot-exclusive/github-pr-workflow/SKILL.md) — PR lifecycle management
- [`fleet-parallel`](../../copilot-exclusive/fleet-parallel/SKILL.md) — run Option B with /fleet
- *Inspired by: [awesome-claude-code/resources/slash-commands/pr-review](https://github.com/hesreallyhim/awesome-claude-code)*
