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

```
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

```
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

```
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

```
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

## When to Use This Guide

- Designing a QA phase in a multi-agent team-planner workflow
- Setting up incremental QA checkpoints in a pipeline
- Choosing between `explore` (read-only research) and `general-purpose` (verification)

## See Also

- [Team Planner](../skills/copilot-exclusive/team-planner/SKILL.md) — Phase 5 monitoring uses similar boundary-check patterns
- [Pipeline Pattern](../orchestration/patterns/pipeline.md) — Phase Reconstruction for multi-phase QA
- [TDD Workflow](../skills/development/tdd-workflow/SKILL.md) — Test-first approach that pairs with incremental QA
