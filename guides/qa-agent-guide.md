# QA Agent Guide

> How to design quality-assurance agents that actually catch real bugs — not just verify that files exist.

---

## The Core Principle: Boundary-Crossing Comparison

Effective QA is not about confirming that a file exists or a function was written. It is about
**comparing across boundaries** — checking that what one layer promises matches what the next layer
actually delivers.

Examples of boundary-crossing comparisons:

| Boundary | What to compare |
|----------|----------------|
| API ↔ Frontend | Does the API response shape match the TypeScript interface in the frontend hook? |
| Schema ↔ Model | Does the DB schema match the ORM model definition field-by-field? |
| Spec ↔ Implementation | Does the function signature match the spec written in the PRD? |
| Test ↔ Behaviour | Does the test assertion match the actual edge-case behaviour described in the ticket? |

```text
❌ Weak QA: "Does file src/api/users.ts exist?"   → existence check
✅ Strong QA: "Does GET /users return { id, name, email } matching the UserProfile TS interface?"  → shape comparison
```

---

## Rule 1: Always Use `general-purpose` Agent Type for QA

QA agents **must** use `agent_type: "general-purpose"`. Do **not** use `explore`.

| Agent type | Why it fails for QA |
|------------|---------------------|
| `explore` | Read-only — cannot run test scripts, cannot execute validators, cannot write result files |
| `task` | Output-only, no multi-step reasoning for comparing structures |
| `general-purpose` | ✅ Full tools: read files, run scripts, write findings, compare shapes |

```text
# ✅ Correct
task:
  agent_type: "general-purpose"
  name: "qa-boundary-check"
  prompt: "Compare the API response shape from src/api/users.ts against the UserProfile interface in src/types/user.ts. Run the test suite and report any mismatches."

# ❌ Wrong
task:
  agent_type: "explore"
  name: "qa-check"
  prompt: "Check if the API matches the interface."
```

---

## Rule 2: Incremental QA — After Each Module, Not Just at the End

Run QA **immediately after each module or phase completes**, not once at the very end.

**Why:**

- Bugs found in module 2 are 5× cheaper to fix than bugs found after module 5 completes
- Incremental QA surfaces integration issues before they compound
- Each QA run is smaller, faster, and more actionable

**Pattern:**

```text
Phase 1: Implement auth module       →  QA-1: boundary check auth ↔ session
Phase 2: Implement user API          →  QA-2: boundary check API ↔ types ↔ DB schema
Phase 3: Implement frontend hooks    →  QA-3: boundary check hooks ↔ API response
Phase 4: Integrate all modules       →  QA-final: end-to-end smoke test
```

**SQL tracking for incremental QA:**

```sql
CREATE TABLE qa_runs (
  id TEXT PRIMARY KEY,
  phase TEXT NOT NULL,
  boundary TEXT NOT NULL,         -- e.g., "api↔types"
  status TEXT DEFAULT 'pending',  -- pending | pass | fail | blocked
  findings TEXT                   -- summary of issues found
);

INSERT INTO qa_runs (id, phase, boundary) VALUES
  ('qa-1', 'auth',     'auth-module↔session-store'),
  ('qa-2', 'user-api', 'api-response↔typescript-types↔db-schema'),
  ('qa-3', 'frontend', 'react-hooks↔api-response'),
  ('qa-4', 'final',    'end-to-end-smoke-test');
```

---

## Rule 3: QA Agent Prompt Template

A QA agent prompt should always specify:

1. **Which boundaries to check** (not "check everything")
2. **What constitutes a pass** (explicit success criteria)
3. **Output format** (structured findings, not free-form prose)

```text
# QA Agent prompt template
You are a QA specialist for [PHASE_NAME].

## Boundaries to check
- [boundary 1]: Compare [left side] against [right side]
- [boundary 2]: Compare [left side] against [right side]

## Pass criteria
- All field names in [X] are present in [Y]
- All HTTP status codes in [API spec] are handled in [frontend error handler]
- Test suite passes with no failures

## Output format
Return a structured report:
{
  "overall": "pass|fail",
  "checks": [
    { "boundary": "...", "status": "pass|fail", "detail": "..." }
  ],
  "blockers": ["..."],
  "warnings": ["..."]
}
```

---

## Rule 4: A Bug Fix Is Proven by Three Runs, Not One

"The build passes" and "the new test passes" do not prove that a fix fixed anything. A test that
passes on the broken code too is not evidence. For bug fixes, ask the QA agent for **three runs of
the same test against three trees**:

| Run | Tree | Expected | What it proves |
|-----|------|----------|----------------|
| 1 | Baseline (before the fix) | **Fails** | The test actually reproduces the bug |
| 2 | Patched | **Passes** | The fix resolves it |
| 3 | Patched with the fix reverted | **Fails again** | The fix — not an unrelated change — is what made it pass |

Rules that keep the proof honest:

- Use the **same test, same command, and same input** on every tree; keep stdout, stderr, and exit
  codes from each run as receipts.
- A timeout, setup failure, or "0 tests ran" is an **evidence gap**, not a pass. Report it as a
  gap and stop; never relabel it.
- Add the project's own checks (focused tests, regression and security checks) on the patched tree,
  and list what is still unproven. An empty "unproven" list on a non-trivial fix is a warning sign.
- The QA agent reviews the patch **without** the implementer's conclusion; give it the diff and the
  bug report, not "this should fix it."

Add the result to the report:

```json
"proof": {
  "baseline": "fail",
  "patched": "pass",
  "reverted": "fail",
  "gaps": [],
  "unproven": ["concurrent requests not exercised"]
}
```

This pattern is adapted from `trailofbits/skills` (`patching-bugs/prove-patch`, October 2026); the
Copilot version keeps the three-arm check and drops the record schema and helper scripts.

---

## When to Use This Guide

- Designing a QA phase in a multi-agent team-planner workflow
- Setting up incremental QA checkpoints in a pipeline
- Choosing between `explore` (read-only research) and `general-purpose` (verification)

## See Also

- [Team Planner](../skills/copilot-exclusive/team-planner/SKILL.md) — Phase 5 monitoring uses similar boundary-check patterns
- [Pipeline Pattern](../orchestration/patterns/pipeline.md) — Phase Reconstruction for multi-phase QA
- [TDD Workflow](../skills/development/tdd-workflow/SKILL.md) — Test-first approach that pairs with incremental QA
