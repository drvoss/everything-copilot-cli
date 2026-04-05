---
name: iterative-refinement
type: iterative
agents:
  - copilot
  - claude
  - codex
---

# Pattern: Iterative Refinement

> **Complexity: Low-Medium** | **Setup: Minimal** | **Best for: Quality-sensitive generation with measurable exit criteria**

Iterative Refinement is a **quality-criteria-driven loop** where the *same* agent repeatedly improves its own output until an objective threshold is met. Unlike [Producer-Reviewer](producer-reviewer.md), there is **no separate reviewer agent**; instead, the agent self-corrects using concrete feedback from tools (tests, type-checking, linters), metrics, and/or structured scoring prompts.

## How It Works

```
Generate → Measure → ┌───────────────┐
                    │ Pass?          │
                    ├───────┬───────┤
                    │ Yes   │ No    │
                    ▼       ▼
                  Ship   Refine with feedback
                          │
                          └────────────→ Generate
```

## Implementation

Use a bounded loop with explicit exit criteria. Each round:
1) generate an updated artifact, 2) measure it with a tool/metric, 3) feed back failures to the same agent.

```powershell
# Iterative refinement loop (Copilot CLI orchestration pseudocode)
# - One agent iterates on the same artifact
# - Measurement is objective (tests / typecheck / lint)

$maxRounds = 5
$passed = $false

$goal = "Implement the change described in ISSUE-123 and keep the build green."
$artifact = ""      # the current candidate output (code/text/patch)
$feedback = ""      # measurement output (failing tests, type errors, lint output)

for ($round = 1; $round -le $maxRounds; $round++) {
    Write-Host "`n=== Refinement Round $round / $maxRounds ===" -ForegroundColor Cyan

    $prompt = @"
You are iteratively refining a single artifact.

Goal:
$goal

Current artifact (if any):
$artifact

Latest measurement feedback (if any):
$feedback

Instructions:
- Apply ONLY changes necessary to satisfy the measurement feedback.
- Preserve existing correct behavior.
- Output ONLY the updated artifact (no commentary).
"@

    $artifact = task(
        agent_type: "general-purpose",
        model: "gpt-5.3-codex",
        name: "refiner",
        description: "Refine artifact (round $round)",
        prompt: $prompt
    )

    # Measure: choose an objective gate (examples: npm test, tsc, eslint)
    # Example shown: npm test. Capture output for feedback.
    $raw = (npm test 2>&1 | Out-String)

    # Convert tool result to a machine-parseable PASS/FAIL signal
    $gateLine = if ($LASTEXITCODE -eq 0) { "PASS" } else { "FAIL" }
    $measurement = "$gateLine`n$raw"

    # Parse PASS/FAIL from measurement output
    if ($measurement -match "(?m)^PASS\s*$") {
        Write-Host "✅ PASS — exiting loop" -ForegroundColor Green
        $passed = $true
        break
    }

    Write-Host "✳️  FAIL — feeding back measurement output" -ForegroundColor Yellow
    $feedback = $measurement
}

if (-not $passed) {
    Write-Warning "Max refinement rounds reached — manual review recommended"
}

# Final candidate artifact is in $artifact
$artifact
```

## Exit Criteria Design

Write exit criteria that are **measurable, stable, and hard to game**:

- **Tests pass**: `npm test` (exit code 0)
- **Type errors = 0**: `npx tsc --noEmit`
- **Coverage ≥ 80%**: `npm test -- --coverage` (parse the summary)
- **Linter clean**: `npm run lint` (no errors/warnings, depending on policy)

Tips:
- Prefer *binary* gates (PASS/FAIL) when possible.
- Keep criteria small (1–3 checks) to avoid slow churn.
- Ensure the measurement output is captured and fed back verbatim (or truncated to the relevant section).

## When to Use

- **Test-driven generation**: iterate until the full test suite is green.
- **Doc accuracy**: iterate until link checks/build checks succeed and examples match actual behavior.
- **Type-safe code generation**: iterate until type-checking is clean (0 errors).

## When NOT to Use

- **Open-ended creative tasks** with no objective metric (you may loop without converging).
- When a **separate critic** is more reliable (use [Producer-Reviewer](producer-reviewer.md) if you need an independent rubric enforcer).

## See Also

- [Pattern: Producer-Reviewer](producer-reviewer.md)
- [Pattern: Pipeline](pipeline.md)
- [Pattern: Fan-Out Parallel](fan-out-parallel.md)
