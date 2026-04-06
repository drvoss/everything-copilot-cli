---
name: agentic-engineering
description: Use when designing or decomposing a task for agent execution — applies 15-minute task units, eval-first loops, and explicit input/output contracts so agents work reliably without implicit state
metadata:
  category: copilot-exclusive
  copilot_feature: "agent task decomposition, eval-first development, multi-agent context contracts"
  origin: ported from affaan-m/everything-claude-code
---

# Agentic Engineering

Design tasks so AI agents can execute them reliably. This is not about *using* Copilot features — it is about **architecting work** so agents succeed on the first attempt, fail loudly when they can't, and hand off cleanly to the next agent.

## Why This is Copilot-Exclusive

The patterns here are specific to Copilot CLI's agent execution model: `task()` dispatch, `read_agent` / `write_agent` lifecycle, SQL session state, and background agents with `mode: "background"`. They don't map directly to interactive coding sessions in other tools.

## When to Use

- Decomposing a large task before dispatching it to an agent or fleet
- Designing a multi-agent workflow where context must transfer between agents
- Debugging why an agent produced incorrect or incomplete output
- Establishing quality standards for a new agentic workflow

## When NOT to Use

| Instead of agentic-engineering | Use |
|-------------------------------|-----|
| You already have tasks and just need to plan them | `plan-mode-mastery` |
| You need to assemble a specialist agent team | `team-planner` |
| You need autonomous execution guardrails | `autopilot-patterns` |

## Core Principles

### 1. The 15-Minute Task Unit

**Rule:** Each agent dispatch should complete in roughly 15 minutes of human-equivalent focused work. In practice: 1–3 files changed, 1 clear outcome, no more than one decision required.

**Why:** Agents fail when context exceeds what fits in a single focused pass. Long tasks require the agent to hold too much state, make too many decisions, and produce outputs that are hard to verify.

**Signs a task is too large:**
- Description contains "and" more than twice
- Requires reading more than 5 files to complete
- Has more than one possible success state
- Cannot be verified by a single test or check

**Signs a task is too small:**
- It is just a file read or a lookup
- A single `edit` call handles it entirely
- No judgment is required

**Decomposition pattern:**
```
Large task: "Implement user authentication with JWT and refresh tokens"
↓ decompose
T-01: Add User schema + bcrypt password field (DB layer only)
T-02: Implement POST /auth/login endpoint (validate + sign JWT)
T-03: Implement POST /auth/refresh endpoint (validate refresh token)
T-04: Add auth middleware (extract + verify JWT on protected routes)
T-05: Integration tests for T-02, T-03, T-04
```

Each task has one clear output that can be verified independently.

### 2. Eval-First Loop

**Rule:** Define the verification criterion before dispatching the agent, not after.

**Why:** Agents optimized toward a concrete pass/fail signal produce more correct output than agents working toward a vague goal. The verification criterion *is* the specification.

```
❌ Vague:
"Implement the export function and make sure it works."

✅ Eval-first:
"Implement the export function.
 Verification: `npm test -- export.test.ts` must pass with 0 failures.
 If tests don't exist, write them first (AC: returns valid CSV for valid input,
 returns 422 for invalid date range, returns empty CSV for empty result set)."
```

**Pattern in SQL:**
```sql
INSERT INTO todos (id, title, description) VALUES
  ('impl-export', 'Implement CSV export', 
   'Write src/services/export.ts. Verified by: npm test -- export.test.ts (all pass). If tests absent, write tests first.');
```

### 3. Explicit Input/Output Contracts

**Rule:** Every agent task must have a declared input and a declared output. Never rely on implicit context from the conversation history.

**Why:** Background agents start with no conversation history. Fleet agents run in isolated contexts. Agents that assume they "remember" previous turns produce inconsistent results.

**Input contract** — what the agent needs to start:
- Exact file paths to read
- Specific values to use (not "use the same approach as before")
- SQL queries to run for current state

**Output contract** — what the agent produces:
- Files created or modified (exact paths)
- SQL rows inserted or updated
- Return value if used as a sub-agent

```
# Weak (implicit):
"Continue implementing the auth system."

# Strong (explicit contract):
Input: src/auth/schema.ts (exists), src/auth/middleware.ts (does not exist yet)
Task: Create src/auth/middleware.ts that reads JWT from Authorization header,
      verifies with the secret in process.env.JWT_SECRET, attaches user to req.user.
Output: src/auth/middleware.ts created; exports verifyToken middleware function.
Verification: npm test -- auth.middleware.test.ts
```

### 4. Fail Fast, Surface Errors Early

**Rule:** Agents should stop and surface uncertainty rather than guess and continue.

**Why:** An agent that guesses wrong halfway through a task produces partial, hard-to-revert changes. An agent that stops early saves time.

Configure via prompt:
```
If you are uncertain about the expected behavior, stop and surface the question
as a BLOCKER rather than making an assumption and continuing.
Format: BLOCKER: [question] [what you would assume if forced to continue]
```

### 5. State via SQL, Not Session Memory

**Rule:** Workflow state must live in SQL, not the agent's conversation memory.

**Why:** Agents compact, context windows expire, background agents start fresh. SQL state is persistent, queryable, and explicit.

```sql
-- Track multi-agent workflow state
CREATE TABLE IF NOT EXISTS workflow_state (
    step TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending',
    output TEXT,
    agent_id TEXT,
    completed_at TEXT
);

-- Agent reads its input from SQL, not conversation history
SELECT output FROM workflow_state WHERE step = 'schema-design' AND status = 'done';
```

## Workflow: Decompose a Task for Agent Dispatch

1. **State the outcome** — one sentence: what exists when done?
2. **Identify the smallest completable unit** — can it be done in 15 min?
3. **Define the verification criterion** — what test/check proves it?
4. **Write the input contract** — what files/values does the agent need?
5. **Write the output contract** — what does the agent produce?
6. **Insert into SQL** — description must include verification criterion

```sql
INSERT INTO todos (id, title, description) VALUES
  ('auth-middleware', 
   'Create auth middleware',
   'Input: src/auth/schema.ts (read). 
    Task: Create src/auth/middleware.ts, export verifyToken function.
    Output: src/auth/middleware.ts created.
    Verification: npm test -- auth.middleware.test.ts (all pass).');
```

## Task Decomposition Checklist

Before dispatching an agent task, confirm:

- [ ] Task completes in ~15 min (1–3 files, 1 outcome)
- [ ] Verification criterion is explicit and runnable
- [ ] Input files/values are named explicitly (no "use the context from before")
- [ ] Output artifacts are specified (exact paths or SQL rows)
- [ ] Failure mode is defined (what to do if verification fails)
- [ ] State needed across agents is in SQL, not assumed from conversation

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| "Implement feature X end to end" | Decompose into 5–7 15-minute tasks |
| Verification step is "check if it looks right" | Write a specific test, lint, or build check |
| Agent uses values from "our earlier conversation" | Put values in SQL or the task description explicitly |
| Agent silently recovers from errors | Require BLOCKER output when uncertain |
| 20-task plan dispatched at once | Batch 3–5 tasks, verify between batches |

## See Also

- [plan-mode-mastery](../plan-mode-mastery/SKILL.md) — structuring plans for Copilot execution
- [team-planner](../team-planner/SKILL.md) — dispatching multi-agent specialist teams
- [autopilot-patterns](../autopilot-patterns/SKILL.md) — safe autonomous execution patterns
- [eval-harness](../../testing/eval-harness/SKILL.md) — evaluation framework for LLM pipelines
- [product-capability](../../product/product-capability/SKILL.md) — engineering-ready capability specs with ACs
