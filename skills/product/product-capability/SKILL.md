---
name: product-capability
description: Use when engineering needs testable, implementable technical requirements — not a PRD but a capability spec with acceptance criteria, task breakdown, and traceability from requirement to implementation ticket
metadata:
  category: product
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# Product Capability

Transform a product requirement or feature request into a **capability specification**: a structured technical document that bridges product intent and engineering implementation.

> **Distinct from [`create-prd`](../create-prd/SKILL.md):**
>
> - `create-prd` → *what* and *why* (Jobs-to-be-Done, personas, scope). Audience: PMs, stakeholders.
> - `product-capability` → *what + how* (acceptance criteria, task breakdown, traceability). Audience: engineers building it.

## When to Use

- Engineering needs a clear, testable spec to implement from — not a narrative PRD
- Acceptance criteria must be explicit and verifiable before a ticket is created
- Traceability is required: feature request → capability → AC → implementation tasks
- A PRD exists but lacks the implementation detail engineers need to estimate or build

## When NOT to Use

| Instead of product-capability | Use |
|------------------------------|-----|
| Exploring the problem space and options | `opportunity-solution-tree` |
| Writing the product story for stakeholders | `create-prd` |
| Prioritizing what to build next | `feature-prioritization` |
| Planning launch readiness | `launch-strategy` |

## Structure

A capability spec consists of five parts:

### 1. Capability Statement

One sentence: what the system must be able to do.

```text
The system must allow authenticated users to export their activity history
as a CSV file filtered by date range.
```

Write as **system capability**, not user story. Avoid "As a user, I want…" — that belongs in the PRD.

### 2. Context

- Source requirement (link to PRD, issue, or ticket)
- Affected components (which services, modules, APIs)
- Dependencies (what must exist before this can be built)

### 3. Acceptance Criteria

Each criterion must be:

- **Testable**: a QA engineer can write a test case for it without ambiguity
- **Specific**: names exact behavior, not intent
- **Binary**: pass or fail — no "should generally work"

```markdown
**AC-01**: Given a user with `EXPORT_HISTORY` permission, when they request
  an export for date range [start, end], the system returns a valid CSV within
  5 seconds containing all activity records in that range.

**AC-02**: Given an empty result set, the system returns an empty CSV with
  only the header row, not an error.

**AC-03**: Given a date range exceeding 1 year, the system rejects the request
  with HTTP 422 and error code `DATE_RANGE_TOO_LARGE`.

**AC-04**: Exported CSV rows include: timestamp (ISO 8601), action_type,
  resource_id, user_id, ip_address.
```

### 4. Implementation Task Breakdown

Decompose into discrete, estimable engineering tasks. Each task:

- Belongs to one team/component boundary
- Is completable in ≤ 1 day
- Has a clear definition of done

```markdown
| Task ID | Task | Component | Estimate | Depends on |
|---------|------|-----------|----------|------------|
| T-01 | Add `EXPORT_HISTORY` permission to auth schema | Auth | 2h | — |
| T-02 | Implement date-range validation (max 365d, ISO 8601 parse) | API | 2h | — |
| T-03 | Implement CSV generation service (streaming for large sets) | API | 4h | T-01 |
| T-04 | Add `/api/activity/export` endpoint with pagination | API | 3h | T-02, T-03 |
| T-05 | Frontend: date range picker + export trigger + download | UI | 4h | T-04 |
| T-06 | Integration tests (AC-01 through AC-04) | QA | 3h | T-04 |
```

Track tasks in SQL:

```sql
CREATE TABLE IF NOT EXISTS capability_tasks (
    id TEXT PRIMARY KEY,
    capability TEXT,
    task TEXT,
    component TEXT,
    estimate_hours REAL,
    status TEXT DEFAULT 'pending',  -- pending | in_progress | done | blocked
    depends_on TEXT
);
```

### 5. Traceability Matrix

Links requirement → capability → ACs → tasks:

```markdown
| Requirement | Capability | ACs | Tasks |
|-------------|-----------|-----|-------|
| PRD §3.2: Data export | CSV activity export | AC-01, AC-02, AC-03, AC-04 | T-01–T-06 |
```

## Quality Gate

Before handing off to engineering, verify:

- [ ] Capability statement is one sentence and testable
- [ ] Every AC is binary (pass/fail) with no ambiguous "should"
- [ ] Every AC has a corresponding task that implements and verifies it
- [ ] No task exceeds 1 day estimate (split if larger)
- [ ] All dependencies identified (APIs, permissions, schemas)
- [ ] Traceability matrix complete

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| AC that says "the UI should be intuitive" | Replace with specific interaction criterion |
| Task that says "implement the feature" | Break into component-level subtasks |
| No dependency map | Add `depends_on` to every task that has a prerequisite |
| Mixing AC (behavior) with implementation detail | AC describes *what*, tasks describe *how* |

## See Also

- [create-prd](../create-prd/SKILL.md) — JTBD-driven product requirements document
- [feature-prioritization](../feature-prioritization/SKILL.md) — MoSCoW/RICE scoring before spec
- [tdd-workflow](../../development/tdd-workflow/SKILL.md) — write tests from ACs
- [agentic-engineering](../../copilot-exclusive/agentic-engineering/SKILL.md) — agent-friendly task decomposition
