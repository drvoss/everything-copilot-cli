---
name: virtual-team
description: Use when a task requires multiple engineering specializations — assembles a virtual team of specialized agents (PM, architect, developer, reviewer) to collaborate like a real engineering team
agents:
  - copilot
  - claude
  - codex
---

# Example: Virtual Engineering Team

A coordinated multi-agent workflow that mirrors how a real engineering team works.
Each agent has a defined role, produces a specific artifact, and hands off to the next.
Inspired by the gstack pattern (garrytan) for running Claude Code as a virtual team.

## Team Composition

| Role | Agent | Responsibility | Output |
|------|-------|---------------|--------|
| **Product Manager** | claude (sonnet) | Requirements, acceptance criteria | PRD + user stories |
| **Architect** | claude (opus) | System design, interface contracts | Architecture doc |
| **Developer** | codex | Implementation | Code + tests |
| **Code Reviewer** | claude (sonnet) | Quality, security, correctness | Review comments |
| **Doc Writer** | claude (haiku) | Update documentation | Updated README/docs |

## When to Use

- A feature request that requires both design decisions and implementation
- You want structured output at each stage before proceeding
- Working on a non-trivial feature where skipping design leads to rework
- Demonstrating a full engineering workflow for a new contributor

## Full Workflow

### Step 1 — PM: Define Requirements

```powershell
# PM agent: produce a structured PRD and acceptance criteria
$prd = npx @anthropic-ai/claude-code --print @"
You are the Product Manager for this project.

Feature request: [FEATURE DESCRIPTION]

Produce:
1. A one-paragraph problem statement
2. User stories (as a <user>, I want <action>, so that <benefit>) — at least 3
3. Acceptance criteria — specific, testable conditions
4. Out of scope — what this feature does NOT do
5. Open questions that need technical input

Format as Markdown.
"@

$prd | Set-Content ".team/prd.md"
Write-Host "✅ PRD written to .team/prd.md"
```

### Step 2 — Architect: Design the System

```powershell
# Architect agent: design based on PRD
$prd = Get-Content ".team/prd.md" -Raw

$architecture = npx @anthropic-ai/claude-code --print @"
You are the Software Architect. Review this PRD and produce a technical design.

PRD:
$prd

Current codebase structure:
$(git --no-pager ls-files src/ | head -50)

Produce:
1. Component diagram (ASCII or Mermaid)
2. New files/modules to create (with responsibility)
3. Interfaces and data contracts (TypeScript types or OpenAPI)
4. Database schema changes (if any)
5. Technical risks and mitigations

Do NOT write implementation code. Design only.
"@

$architecture | Set-Content ".team/architecture.md"
Write-Host "✅ Architecture written to .team/architecture.md"
```

### Step 3 — Developer: Implement

```powershell
# Developer agent: implement based on architecture
$prd = Get-Content ".team/prd.md" -Raw
$arch = Get-Content ".team/architecture.md" -Raw

# Implementation (using codex for speed, or claude for complex logic)
codex --quiet @"
You are a Senior Developer. Implement the feature described below.

PRD:
$prd

Architecture:
$arch

Implementation rules:
- Follow the file structure defined in the architecture
- Write tests alongside the implementation (TDD)
- Use existing conventions from the codebase (check existing files for patterns)
- Do not modify files outside the scope defined in the architecture
- Commit each logical unit separately with descriptive commit messages
"@

Write-Host "✅ Implementation complete"
```

### Step 4 — Code Reviewer: Review

```powershell
# Reviewer agent: review the implementation
$diff = git --no-pager diff main...HEAD

$review = npx @anthropic-ai/claude-code --print @"
You are a Senior Code Reviewer. Review this diff against the requirements.

PRD acceptance criteria:
$(Get-Content ".team/prd.md" -Raw | Select-String "Acceptance criteria" -Context 0,20)

Diff:
$diff

Review for:
1. Does the implementation meet the acceptance criteria?
2. Logic errors, edge cases, null handling
3. Missing tests (check that all acceptance criteria have tests)
4. Security issues (injection, auth, secrets)
5. Code quality (naming, complexity, duplication)

Output findings grouped by: BLOCK (must fix before merge) / SUGGEST (optional improvement)
"@

$review | Set-Content ".team/review.md"
Write-Host "✅ Code review in .team/review.md"
Write-Host ""
Write-Host "=== Review Summary ==="
$review | Select-String "BLOCK|SUGGEST" | Write-Host
```

### Step 5 — Resolve Review Feedback

```powershell
# Check if there are blocking issues
$blockCount = (Get-Content ".team/review.md" | Select-String "^### BLOCK|^\*\*BLOCK\*\*").Count

if ($blockCount -gt 0) {
    Write-Warning "⚠️  $blockCount blocking issue(s) found. Resolving before merge."
    
    $review = Get-Content ".team/review.md" -Raw
    
    # Developer fixes blocking issues
    npx @anthropic-ai/claude-code --print @"
Fix all BLOCK-level issues identified in this code review.
For each fix, explain why the change resolves the concern.

Review:
$review
"@
    
    # Re-run reviewer
    $diff = git --no-pager diff main...HEAD
    $finalReview = npx @anthropic-ai/claude-code --print @"
Re-review this updated diff. Only check if the previous BLOCK issues are resolved.
State RESOLVED or STILL-OPEN for each prior BLOCK item.

$diff
"@
    Write-Host $finalReview
}
```

### Step 6 — Doc Writer: Update Documentation

```powershell
# Doc writer agent: update README and docs
$arch = Get-Content ".team/architecture.md" -Raw
$diff = git --no-pager diff main...HEAD --name-only

$docUpdate = npx @anthropic-ai/claude-code --print @"
You are a Technical Writer. Update the project documentation to reflect this new feature.

Changed files: $diff

Architecture summary:
$arch

Update:
1. README.md: add feature description and usage example
2. Any API documentation files that reference changed endpoints
3. Do not change code files

Output only the changes to documentation files.
"@

Write-Host "=== Documentation changes ==="
$docUpdate | Write-Host
```

### Step 7 — Merge

```powershell
# Final checks before merge
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Tests failing — cannot merge"
    exit 1
}

# Clean up team artifacts (optional — keep for audit trail)
# Remove-Item ".team" -Recurse

git checkout main
git merge --no-ff HEAD -m "feat: [FEATURE NAME]

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

Write-Host "✅ Feature merged to main"
```

## Shortcut: Two-Agent Version

For smaller tasks, use just PM + Developer:

```powershell
# 1. PM
$prd = npx @anthropic-ai/claude-code --print "Define acceptance criteria for: [TASK]"

# 2. Developer  
codex --quiet "Implement: [TASK]. Acceptance criteria: $prd"

# 3. Verify
npm test
```

## Customizing the Team

Add or remove roles based on task complexity:

```powershell
# For a security-sensitive feature, add a Security Reviewer after Code Review:
$secReview = npx @anthropic-ai/claude-code --print @"
You are a Security Engineer. Review this diff for security vulnerabilities only.
Focus: injection, auth bypass, secrets, insecure crypto.
Diff: $(git --no-pager diff main...HEAD)
"@
```

## Tips

- **Keep team artifacts**: `.team/prd.md`, `.team/architecture.md`, `.team/review.md`
  provide a paper trail for future engineers explaining _why_ a feature was built this way.
- **Use the right model per role**: PM and Reviewer → claude-sonnet (reasoning),
  Developer → codex (speed), Doc Writer → claude-haiku (fast writing).
- **Gate on blocking reviews**: the workflow is designed to stop at Step 5 if blocking
  issues exist. Don't skip this.
- **Adapt to your workflow**: remove the PM step for pure tech tasks, skip the doc
  writer for internal-only features.

## See Also

- [Pattern: Pipeline](pipeline.md) — Sequential agent chaining
- [Pattern: Producer-Reviewer](producer-reviewer.md) — Simpler two-role pattern
- [Skill: team-planner](../../skills/copilot-exclusive/team-planner/SKILL.md) — Copilot-specific team assembly
- [Agent: planner](../../agents/planner.md) — Structured task decomposition
