---
name: producer-reviewer
type: iterative
agents:
  - copilot
  - claude
  - codex
---

# Pattern: Producer-Reviewer

> **Complexity: Medium** | **Setup: Minimal** | **Best for: Iterative refinement with explicit quality gates**

The Producer-Reviewer pattern is an **iterative feedback loop**: one agent produces an artifact, another evaluates it against clearly-defined criteria, and feedback is applied until it passes.

This is distinct from:
- [Fan-Out Parallel](fan-out-parallel.md): parallel subtasks, **no refinement loop**
- [Pipeline](pipeline.md): sequential stages, **linear (no feedback)**
- [Agent Council](agent-council.md): routing/consensus, **not artifact refinement**

## How It Works

```
  ┌──────────────────────────────┐
  │        Copilot CLI            │
  │   (Orchestrator / Gate)       │
  └──────────────┬───────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Producer Agent  │
        │  (build artifact)│
        └────────┬────────┘
                 │  artifact
                 ▼
        ┌─────────────────┐
        │  Reviewer Agent  │
        │ (grade vs rubric)│
        └────────┬────────┘
                 │  PASS / REVISE + feedback
                 ├───────────────┐
                 │               │
                 ▼               │
        (stop / ship)            │
                                 │
                                 └──► back to Producer (iterate)
```

## Implementation

The key to making this pattern reliable is an explicit **quality gate signal** (PASS/REVISE) and a bounded loop.

> **Syntax note:** Lines containing `task(...)` and `sql(...)` are **Copilot CLI tool invocations** — they are not valid PowerShell. All other `$var`, `while`, `if`, and `Write-Host` lines are standard PowerShell.

```text
# Producer-Reviewer loop (Copilot CLI pseudocode)
# --- task(...) and sql(...) are Copilot CLI tool calls, not PowerShell ---
# - Producer: general-purpose (often Codex model)
# - Reviewer: code-review (often Claude model)

$maxIterations = 3
$iteration = 1

# Example input: what we want produced
$goal = "Write a short architecture note describing the Producer-Reviewer pattern."

# Optional: create a todo record to track the gate outcome (SQL tool)
# sql(description: "Create gate todo", query: "INSERT INTO todos (id, title, status) VALUES ('producer-reviewer-gate', 'Producer-Reviewer gate', 'pending')")

$artifact = ""
$lastReview = ""

while ($iteration -le $maxIterations) {
    Write-Host "\n=== Iteration $iteration / $maxIterations ===" -ForegroundColor Cyan

    $producerPrompt = @"
You are the PRODUCER.

Goal:
$goal

If a previous review exists, apply it as required changes.

Previous review (if any):
$lastReview

Output ONLY the artifact (no commentary).
"@

    $artifact = task(
        agent_type: "general-purpose",
        model: "gpt-5.3-codex",
        name: "producer",
        description: "Produce artifact (iteration $iteration)",
        prompt: $producerPrompt
    )

    $reviewerPrompt = @"
You are the REVIEWER.

Evaluate the artifact against these criteria:
1) Correctness and completeness vs the goal
2) Internal consistency (no contradictions)
3) Actionable specificity (no vague claims)
4) Follows repo conventions (Markdown headings, concise prose)

Return a STRICT, machine-parseable verdict:

VERDICT: PASS|REVISE
REASONS:
- <bullet>
CHANGES_REQUESTED:
- <bullet>

Artifact:
$artifact
"@

    $lastReview = task(
        agent_type: "code-review",
        model: "claude-sonnet-4.6",
        name: "reviewer",
        description: "Review artifact (iteration $iteration)",
        prompt: $reviewerPrompt
    )

    # Parse verdict (first matching line wins)
    $verdict = "REVISE"
    if ($lastReview -match "(?m)^VERDICT:\s*(PASS|REVISE)\s*$") {
        $verdict = $Matches[1]
    }

    # Optional: persist verdict to SQL todos table (SQL tool)
    # $status = if ($verdict -eq 'PASS') { 'done' } else { 'in_progress' }
    # sql(description: "Update gate todo", query: "UPDATE todos SET status = '$status' WHERE id = 'producer-reviewer-gate'")

    if ($verdict -eq "PASS") {
        Write-Host "✅ Reviewer PASS — exiting loop" -ForegroundColor Green
        break
    }

    Write-Host "✳️  Reviewer requested revisions — looping" -ForegroundColor Yellow
    $iteration++
}

if ($iteration -gt $maxIterations) {
    Write-Warning "Max iterations reached ($maxIterations). Ship with caution or tighten criteria."
}

# The final artifact is in $artifact
$artifact
```

## When to Use

- **Code generation + review loop**: generate a module, then have a reviewer enforce linting/error-handling/security criteria before you apply the patch.
- **Docs writing + accuracy check**: draft a README section, then have a reviewer verify it matches the actual behavior/config keys.
- **Test writing + coverage check**: generate tests, then have a reviewer confirm they hit required branches/edge cases and fail for the right reasons.
- **Planning + feasibility gate**: create an implementation plan, then review for missing steps, risky assumptions, and validation strategy.

## When NOT to Use

- Use [Fan-Out Parallel](fan-out-parallel.md) when you can split work into **independent subtasks** and don’t need convergence.
- Use [Pipeline](pipeline.md) when work is **strictly sequential** and you just want a clean handoff (analyze → implement → review).
- Avoid Producer-Reviewer when the “quality criteria” are subjective and you’ll churn; prefer human decision points or a single strong model.

## Quality Criteria Design

A Producer-Reviewer loop only works if the reviewer is predictable.

Design reviewer prompts to:

1. **Be explicit about the rubric**
   - List 3–7 criteria max
   - Phrase as checkable statements ("Includes X", "Does not do Y")

2. **Return a structured gate signal**
   - Require an exact PASS/REVISE token (or PASS/FAIL)
   - Put it on its own line near the top for easy parsing

3. **Make feedback actionable**
   - Prefer “CHANGES_REQUESTED” bullets over long prose
   - Ask for file/section references when possible

4. **Avoid moving goalposts**
   - Tell the reviewer: “Do not introduce new criteria; only evaluate against the rubric above.”

Example reviewer instruction block:

```text
Return ONLY:
VERDICT: PASS|REVISE
CHANGES_REQUESTED:
- ...

Do not include any other headers or commentary.
```

## See Also

- [Pattern: Pipeline](pipeline.md)
- [Pattern: Fan-Out Parallel](fan-out-parallel.md)
- [Pattern: Review Trio](review-trio.md) — **superseded**
