---
name: sub-agent-sandboxing
type: pipeline
agents:
  - copilot
  - claude
  - codex
---

# Pattern: Sub-Agent Sandboxing

> **Complexity: High** | **Setup: Moderate** | **Best for: Safe execution of untrusted or risky agent tasks**

The Sub-Agent Sandboxing pattern runs potentially dangerous or unpredictable agent tasks
in an isolated subprocess with constrained permissions — preventing runaway agents from
modifying files they shouldn't, consuming excessive tokens, or producing side effects
that contaminate the main workflow.

Inspired by production multi-agent architectures (deer-flow, ByteDance) that need to
safely orchestrate sub-agents at scale.

## How It Works

```text
┌────────────────────────────────────────────────┐
│              Orchestrator (Copilot CLI)          │
│  1. Define task + constraints                    │
│  2. Spawn sandboxed sub-agent                    │
│  3. Validate output before accepting             │
│  4. Rollback or reject if constraints violated   │
└──────────────────┬──────────────────────────────┘
                   │ constrained task
                   ▼
         ┌─────────────────────┐
         │    Sandboxed Agent  │
         │  - read-only paths  │
         │  - output captured  │
         │  - no side effects  │
         │  - timeout enforced │
         └─────────────────────┘
                   │ candidate output
                   ▼
         ┌─────────────────────┐
         │  Validator          │
         │  - schema check     │
         │  - constraint check │
         │  - diff review      │
         └─────────────────────┘
                   │ approved / rejected
                   ▼
         ┌─────────────────────┐
         │  Apply or Rollback  │
         └─────────────────────┘
```

## When to Use

- Delegating tasks to an agent that might modify files outside its scope
- Running an exploratory agent that could produce large or unexpected outputs
- Multi-stage pipelines where a failing sub-agent should not corrupt the main state
- Executing auto-generated code before trusting it
- Any task where "undo" must be straightforward

**Do NOT use when:**

- All agent actions are read-only (use [Fan-Out Parallel](fan-out-parallel.md) instead)
- The task is simple and well-understood (overhead not worth it)

## Sandboxing Levels

Choose the appropriate level for your use case:

| Level | Mechanism | Use For |
|-------|-----------|---------|
| **L1: Output capture** | Agent writes to temp dir, human reviews diff | Low-risk tasks where human spot-check is sufficient |
| **L2: Constraint validation** | Automated schema/constraint check before applying | Structured outputs (JSON, config files) |
| **L3: Git staging** | All changes staged, not committed, pending review | Code changes to the working tree |
| **L4: Full isolation** | Separate git worktree or temp branch | Potentially destructive refactors |

## Workflow

### L1: Output Capture (Simplest)

```powershell
# 1. Run agent with output redirected to temp directory
$sandboxDir = "$env:TEMP\copilot-sandbox-$(Get-Random)"
New-Item -ItemType Directory -Path $sandboxDir | Out-Null

# Agent writes candidate files here, not to the real project
$agentOutput = npx @anthropic-ai/claude-code --print @"
Task: Generate migration SQL for adding indexes to the users table.
Output: Write a single SQL file to $sandboxDir/migration.sql
Constraints:
- Only generate SQL, no other file types
- Only ALTER TABLE and CREATE INDEX statements allowed
- Target table: users
"@

# 2. Review the output before applying
Write-Host "=== Candidate output ==="
Get-Content "$sandboxDir/migration.sql" | Write-Host

# 3. Decide: apply or discard
$apply = Read-Host "Apply this migration? (y/N)"
if ($apply -eq 'y') {
    Copy-Item "$sandboxDir/migration.sql" "db/migrations/$(Get-Date -Format 'yyyyMMdd')_add_indexes.sql"
    Write-Host "✅ Applied"
} else {
    Write-Host "❌ Discarded"
}

# 4. Cleanup
Remove-Item $sandboxDir -Recurse
```

### L2: Constraint Validation

```powershell
# Agent generates a config file — validate before applying
$candidateConfig = npx @anthropic-ai/claude-code --print @"
Generate a GitHub Actions workflow for running Jest tests on push.
Output: Valid YAML only. Maximum 50 lines. No secrets or environment variables.
"@

# Validate constraints programmatically
$lines = ($candidateConfig -split "`n").Count
$hasSecrets = $candidateConfig -match "secrets\.|env:.*TOKEN|env:.*KEY"

if ($lines -gt 50) {
    Write-Error "❌ Constraint violated: output is $lines lines (max 50)"
    exit 1
}
if ($hasSecrets) {
    Write-Error "❌ Constraint violated: output contains secret references"
    exit 1
}

# If all constraints pass, apply
$candidateConfig | Set-Content ".github/workflows/test.yml"
Write-Host "✅ Config validated and applied"
```

### L3: Git Staging (Recommended for Code Changes)

```powershell
# 1. Confirm working tree is clean before sandboxing
$gitStatus = git --no-pager status --porcelain
if ($gitStatus) {
    Write-Error "Working tree must be clean before running sandboxed agent"
    exit 1
}

# 2. Run the agent (it modifies files normally)
npx @anthropic-ai/claude-code --print @"
Refactor src/utils/date.ts to use date-fns instead of moment.
Constraints:
- Only modify src/utils/date.ts and its test file
- Do not add new dependencies
- All existing tests must continue to pass
"@

# 3. Stage all changes for inspection (do not commit)
git add -A

# 4. Show a constrained diff for review
$diff = git --no-pager diff --staged --stat
$touchedFiles = git --no-pager diff --staged --name-only

Write-Host "=== Files changed by sub-agent ==="
$touchedFiles | Write-Host

# 5. Validate: agent should only have touched allowed files
$allowedPattern = "src/utils/date"
$violations = $touchedFiles | Where-Object { $_ -notmatch $allowedPattern }
if ($violations) {
    Write-Warning "⚠️  Sub-agent touched files outside allowed scope:"
    $violations | Write-Host
    git reset HEAD  # Unstage everything
    git checkout -- .  # Restore working tree
    Write-Error "❌ Sandbox violation — changes discarded"
    exit 1
}

# 6. Run tests on staged changes
$testResult = npm test -- --testPathPattern="date" 2>&1
if ($LASTEXITCODE -ne 0) {
    git reset HEAD
    git checkout -- .
    Write-Error "❌ Tests failed — changes discarded"
    exit 1
}

# 7. Approved — commit
git commit -m "refactor: migrate date.ts from moment to date-fns

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
Write-Host "✅ Sandboxed change approved and committed"
```

### L4: Full Isolation (Separate Worktree)

```powershell
# Use a separate git worktree to fully isolate the agent's work

# 1. Create isolated worktree on a new branch
$branch = "sandbox/agent-$(Get-Date -Format 'yyyyMMddHHmmss')"
git worktree add .worktrees/sandbox -b $branch

# 2. Run agent in the isolated worktree
Push-Location .worktrees/sandbox
npx @anthropic-ai/claude-code --print @"
Perform the following large-scale refactor:
[large refactor description]
"@
Pop-Location

# 3. Review the diff between main and sandbox branch
git --no-pager diff main...$branch --stat

# 4. If satisfied, merge — otherwise discard
$merge = Read-Host "Merge sandbox branch? (y/N)"
if ($merge -eq 'y') {
    git merge $branch --no-ff -m "feat: apply sandboxed refactor from $branch

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
} else {
    Write-Host "Discarding sandbox branch"
}

# 5. Cleanup worktree
git worktree remove .worktrees/sandbox
git branch -D $branch
```

## Validation Checklist

Before accepting sandboxed agent output, verify:

- [ ] Agent only modified files within the allowed scope (check git diff --name-only)
- [ ] No unexpected dependencies added (`package.json`, `requirements.txt` unchanged)
- [ ] No secrets or environment variable access patterns added
- [ ] All existing tests pass
- [ ] Output matches the expected format/schema
- [ ] File count and line count are within expected bounds

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Prevents runaway agent side effects | ❌ Adds latency and setup overhead |
| ✅ Easy rollback when agent exceeds scope | ❌ Requires a validation step |
| ✅ Auditable: all changes visible before applying | ❌ More complex than direct agent invocation |
| ✅ Composable: chain multiple sandboxed stages | ❌ Worktree approach requires disk space |

## Loop Detection

Sandboxed sub-agents can still get stuck in useless retry loops. Detect repetition at
the orchestrator boundary rather than inside the agent itself.

**Detection rules:**

| Condition | Action |
|-----------|--------|
| Same tool + same arguments appears 3 times in the last 10 calls | Emit a warning |
| Same tool + same arguments appears 5 times in the last 10 calls | Stop the sub-agent and escalate |
| A single tool appears more than 20 times in one session | Treat as suspicious even if args vary |

```powershell
$callHistory = [System.Collections.Generic.Queue[string]]::new()

function Add-TrackedCall {
    param($toolName, $toolArgs)
    $key = "$toolName|$(ConvertTo-Json $toolArgs -Compress)"
    $callHistory.Enqueue($key)
    if ($callHistory.Count -gt 10) { $callHistory.Dequeue() | Out-Null }

    $duplicates = ($callHistory | Where-Object { $_ -eq $key }).Count
    if ($duplicates -ge 5) {
        throw "Loop detected: $toolName repeated $duplicates times with identical arguments"
    }
    if ($duplicates -ge 3) {
        Write-Warning "Potential loop: $toolName repeated $duplicates times"
    }
}
```

## LLM Circuit Breaker

When a sub-agent repeatedly fails with timeouts, empty results, or validation errors,
pause calls instead of hammering the same path.

**State machine:**

```text
CLOSED (normal)
  -> repeated failures
OPEN (calls blocked)
  -> wait expires, allow one probe
HALF-OPEN (single trial)
  -> success => CLOSED
  -> failure => OPEN
```

**Backoff schedule:**

| Failure count | Wait before retry |
|---------------|-------------------|
| 1st open | 30 s |
| 2nd open | 60 s |
| 3rd open | 120 s |
| 4th open+ | 120 s + human escalation |

**Optional reroute policy:**

- If an approved alternate provider or model family exists in a different failure domain,
  the orchestrator may attempt **one** bounded reroute for the same sub-task
- Only reroute when data-classification policy allows it and the retry is idempotent
- If no safe alternate lane exists, keep the failing lane OPEN and let it cool down

Use the circuit breaker in the orchestrator layer so failures are visible and other
subtasks can continue while one lane cools down.

## See Also

- [Pattern: Fan-Out Parallel](fan-out-parallel.md) — Parallel sub-agents for read-only tasks
- [Pattern: Pipeline](pipeline.md) — Sequential agent stages with handoffs
- [Pattern: Producer-Reviewer](producer-reviewer.md) — Agent produces, agent reviews
- [Rules: Security](../../rules/common/security.md) — Agent governance principles
