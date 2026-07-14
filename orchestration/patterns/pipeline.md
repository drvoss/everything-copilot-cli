# Pattern 4: Pipeline Pattern

> **Complexity: Medium** | **Setup: Minimal** | **Best for: Sequential processing, composable workflows**

The Pipeline pattern follows the Unix philosophy: each AI tool does one thing well, and they chain together with pipes or intermediate files. Output from one AI becomes input to the next.

## How It Works

```text
┌──────────┐    stdout    ┌──────────┐    stdout    ┌──────────┐    stdout    ┌──────────┐
│  Claude   │ ──────────► │  Codex   │ ──────────► │Antigravity│ ──────────► │  Copilot │
│  analyze  │    pipe     │  implement│    pipe     │  review  │    pipe     │  ship    │
└──────────┘             └──────────┘             └──────────┘             └──────────┘
```

Each stage:

1. Receives input (from stdin, a file, or the previous stage)
2. Processes it with a specialist AI
3. Outputs structured results for the next stage

## Basic Pipe Chaining

### Direct Pipe (Bash)

```bash
# Analyze → Implement → Review in one pipeline
npx @anthropic-ai/claude-code --print \
  "Analyze src/api/ and output a JSON implementation plan for adding pagination" \
| codex --quiet \
  "Implement the pagination changes described in this plan: $(cat -)" \
| npx @anthropic-ai/claude-code --print \
  "Review this implementation for correctness and edge cases: $(cat -)"
```

### Direct Pipe (PowerShell)

```powershell
# Analyze with Claude → Generate with Codex → Review with Claude
$plan = npx @anthropic-ai/claude-code --print `
  "Analyze src/api/ and create a JSON plan for adding rate limiting. Output JSON only."

$code = $plan | codex --quiet `
  "Implement the changes described in this plan. Output only the code."

$review = $code | npx @anthropic-ai/claude-code --print `
  "Review this rate limiting implementation. List any issues."

Write-Output $review
```

## File-Based Pipeline

For complex workflows, intermediate files give you checkpoints and debuggability:

### PowerShell Pipeline Script

```powershell
#!/usr/bin/env pwsh
# pipeline.ps1 — Multi-AI pipeline with file-based hand-offs

param(
    [string]$Task = "Add input validation to all API endpoints",
    [string]$WorkDir = ".pipeline"
)

# Create pipeline workspace
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "🔵 Stage 1/4: Architecture Analysis (Claude Code)" -ForegroundColor Cyan

# Stage 1: Claude analyzes the codebase and creates a plan
$stage1Prompt = @"
Analyze the codebase and create a detailed implementation plan for: $Task

Output a JSON document with this structure:
{
  "analysis": "brief analysis of current state",
  "changes": [
    {
      "file": "path/to/file",
      "description": "what to change",
      "priority": "high|medium|low"
    }
  ],
  "risks": ["potential risk 1", "risk 2"],
  "testStrategy": "how to verify the changes"
}

Output ONLY the JSON, no other text.
"@

npx @anthropic-ai/claude-code --print $stage1Prompt > "$WorkDir/01-plan.json"
Write-Host "   ✅ Plan saved to $WorkDir/01-plan.json"

Write-Host "🟢 Stage 2/4: Implementation (Codex CLI)" -ForegroundColor Green

# Stage 2: Codex implements the plan
$plan = Get-Content "$WorkDir/01-plan.json" -Raw
$stage2Prompt = @"
Implement the following plan. For each file, output the complete updated content.

Plan:
$plan

Output each file with a header line: === FILE: path/to/file ===
followed by the complete file content.
"@

codex --quiet $stage2Prompt > "$WorkDir/02-implementation.txt"
Write-Host "   ✅ Implementation saved to $WorkDir/02-implementation.txt"

Write-Host "🟡 Stage 3/4: Security & Quality Review (Claude Code)" -ForegroundColor Yellow

# Stage 3: Claude reviews the implementation
$implementation = Get-Content "$WorkDir/02-implementation.txt" -Raw
$stage3Prompt = @"
Review this implementation for security vulnerabilities, bugs, and quality issues.

Original plan:
$plan

Implementation:
$implementation

Output a JSON review:
{
  "approved": true/false,
  "issues": [
    {"severity": "critical|high|medium|low", "file": "path", "issue": "description", "fix": "suggestion"}
  ],
  "summary": "overall assessment"
}
"@

npx @anthropic-ai/claude-code --print $stage3Prompt > "$WorkDir/03-review.json"
Write-Host "   ✅ Review saved to $WorkDir/03-review.json"

Write-Host "🔴 Stage 4/4: Ship via GitHub (Copilot CLI)" -ForegroundColor Red

# Stage 4: Create a branch, commit, and open a PR
$review = Get-Content "$WorkDir/03-review.json" -Raw | ConvertFrom-Json

if ($review.approved) {
    Write-Host "   ✅ Review passed — ready to create PR"
    Write-Host ""
    Write-Host "   Next steps (from Copilot CLI):"
    Write-Host "   1. Apply the implementation changes"
    Write-Host "   2. git checkout -b feat/$timestamp"
    Write-Host "   3. git add -A && git commit"
    Write-Host "   4. gh pr create"
} else {
    Write-Host "   ❌ Review found issues:" -ForegroundColor Red
    foreach ($issue in $review.issues) {
        Write-Host "     [$($issue.severity)] $($issue.file): $($issue.issue)"
    }
    Write-Host ""
    Write-Host "   Run the pipeline again after fixing issues, or iterate:"
    Write-Host "   codex 'Fix these issues in the implementation: $($review.issues | ConvertTo-Json -Compress)'"
}

Write-Host ""
Write-Host "📁 Pipeline artifacts in $WorkDir/"
```

### Bash Pipeline Script

```bash
#!/bin/bash
# pipeline.sh — Multi-AI pipeline with file-based hand-offs

TASK="${1:-Add input validation to all API endpoints}"
WORKDIR=".pipeline/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$WORKDIR"

echo "🔵 Stage 1: Analysis (Claude Code)"
npx @anthropic-ai/claude-code --print \
  "Analyze the codebase and create an implementation plan for: $TASK. Output JSON." \
  > "$WORKDIR/01-plan.json"

echo "🟢 Stage 2: Implementation (Codex CLI)"
codex --quiet \
  "Implement this plan: $(cat "$WORKDIR/01-plan.json")" \
  > "$WORKDIR/02-implementation.txt"

echo "🟡 Stage 3: Review (Claude Code)"
npx @anthropic-ai/claude-code --print \
  "Review this implementation for bugs and security issues: $(cat "$WORKDIR/02-implementation.txt")" \
  > "$WORKDIR/03-review.json"

echo "🔴 Stage 4: Summary"
cat "$WORKDIR/03-review.json"

echo ""
echo "📁 Artifacts: $WORKDIR/"
```

## Specialized Pipeline Variants

### Test Generation Pipeline

```powershell
# Claude identifies test gaps → Codex generates tests → Claude reviews coverage
npx @anthropic-ai/claude-code --print `
  "Analyze src/ and list functions that lack test coverage. Output as JSON array." `
  > .pipeline/gaps.json

codex --quiet `
  "Generate unit tests for these untested functions: $(Get-Content .pipeline/gaps.json)" `
  > .pipeline/tests.txt

npx @anthropic-ai/claude-code --print `
  "Review these generated tests for completeness and edge cases: $(Get-Content .pipeline/tests.txt)" `
  > .pipeline/test-review.json
```

### Documentation Pipeline

```powershell
# Codex generates docs → Claude refines → Antigravity CLI checks for accuracy
codex --quiet "Generate API documentation for all endpoints in src/routes/" `
  > .pipeline/raw-docs.md

npx @anthropic-ai/claude-code --print `
  "Refine this API documentation for clarity and completeness: $(Get-Content .pipeline/raw-docs.md)" `
  > .pipeline/refined-docs.md

agy -p `
  "Verify this documentation matches the actual code in src/routes/: $(Get-Content .pipeline/refined-docs.md)" `
  > .pipeline/doc-review.md
```

### Refactoring Pipeline

```powershell
# Claude designs refactor → Codex executes → Claude validates → Copilot ships
npx @anthropic-ai/claude-code --print `
  "Design a refactoring plan to extract shared logic from src/services/ into reusable utilities" `
  > .pipeline/refactor-plan.json

codex --quiet --approval-mode full-auto `
  "Execute this refactoring plan: $(Get-Content .pipeline/refactor-plan.json)" `
  > .pipeline/refactor-result.txt

npx @anthropic-ai/claude-code --print `
  "Validate this refactoring preserves behavior. Check for broken imports and missing logic: $(Get-Content .pipeline/refactor-result.txt)" `
  > .pipeline/validation.json
```

## Pipeline Composition

Build complex workflows by composing simple pipelines:

```powershell
# Define reusable pipeline stages as functions
function Invoke-ClaudeAnalysis($prompt) {
    npx @anthropic-ai/claude-code --print $prompt
}

function Invoke-CodexGeneration($prompt) {
    codex --quiet $prompt
}

function Invoke-ClaudeReview($code) {
    npx @anthropic-ai/claude-code --print "Review for bugs and security: $code"
}

# Compose pipelines
$plan = Invoke-ClaudeAnalysis "Create implementation plan for user auth"
$code = Invoke-CodexGeneration "Implement: $plan"
$review = Invoke-ClaudeReview $code

if ($review -match '"approved":\s*true') {
    Write-Host "✅ Pipeline succeeded"
} else {
    Write-Host "❌ Review failed — iterating"
    $fixedCode = Invoke-CodexGeneration "Fix issues in: $code based on: $review"
    $secondReview = Invoke-ClaudeReview $fixedCode
}
```

## Phase Reconstruction Pattern

A powerful pipeline variant where the **team composition changes between phases**. Each phase uses a different set of specialists; their output is saved to an intermediate file before the team is released and a new one assembled.

Use this when different phases require fundamentally different expertise (e.g., analysis vs. implementation vs. polish).

**Example — Technical Report Writing:**

| Phase | Specialist team | Output file |
|-------|----------------|-------------|
| 1: Research | `{analyst, researcher}` | `phase1-findings.md` |
| 2: Architecture | `{architect, security-reviewer}` | `phase2-design.md` |
| 3: Implementation | `{developer, tester}` | `phase3-code/` |
| 4: Documentation | `{doc-writer, editor}` | `phase4-docs.md` |

**PowerShell skeleton:**

```powershell
# Phase 1: Research team
# task: agent_type="general-purpose", name="analyst", prompt="Analyze requirements and output findings to phase1-findings.md"
# task: agent_type="explore",          name="researcher", prompt="Research prior art and append to phase1-findings.md"

# → Wait for Phase 1 to complete, review phase1-findings.md

# Phase 2: Architecture team (different agents, same session SQL for continuity)
# task: agent_type="general-purpose", name="architect", prompt="Design solution based on phase1-findings.md. Save to phase2-design.md"
# task: agent_type="code-review",     name="security",  prompt="Review design in phase2-design.md for security risks."
```

> **Key difference from hierarchical-delegation:** In Phase Reconstruction, teams are **sequential** (one phase completes before the next starts) and the team composition **changes** each time. In hierarchical-delegation, all sub-agents run in **parallel** under one orchestrator.

---

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Composable and modular | ❌ Serial execution (no parallelism) |
| ✅ Familiar Unix philosophy | ❌ Latency compounds across stages |
| ✅ Checkpoint/resume via files | ❌ Large outputs bloat pipes |
| ✅ Easy to debug (inspect intermediates) | ❌ Context lost between stages |
| ✅ Works with any CLI tool | ❌ Error propagation can be tricky |
| ✅ Version-controllable scripts | |

## When to Use

- **Well-defined sequential workflows** — analyze → implement → review → ship
- **Batch processing** — process multiple files through the same pipeline
- **Reproducible workflows** — same pipeline produces consistent results
- **CI/CD integration** — pipeline scripts run in GitHub Actions

## See Also

- [Pattern 1: Shell Invocation](shell-invocation.md) — Single-stage delegation
- [Pattern 5: Agent Council](agent-council.md) — Parallel multi-agent processing
- [Agent Review Chain](../skills/agent-review-chain.md) — Multi-agent review pipeline
- [agentpipe](https://github.com/agentpipe/agentpipe) — Unix-pipe-style agent chaining
- [Full Workflow Example](../examples/full-workflow.md) — Complete pipeline in action
