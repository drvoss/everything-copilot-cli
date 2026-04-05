---
name: team-planner
description: Use when a task is too large or multi-domain for a single agent — assemble a specialist team, assign work via SQL tracking, dispatch with /fleet or task tool, and synthesize results
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
---

# Team Planner (Copilot-Native)

A Copilot CLI-native redesign of the “harness meta-skill” concept.

It does **not** assume Claude Code primitives like TeamCreate/TaskCreate exist. Instead, it uses
Copilot CLI’s actual primitives:

- `task` tool (agent types: `explore`, `task`, `general-purpose`, `code-review`)
- `/fleet` for parallel sub-agent execution
- SQL **session database** for tracking (`sql` tool)
- `read_agent` / `write_agent` for monitoring and follow-ups

## When to Use

- Task spans **3+ domains** (e.g., security + performance + architecture)
- Work can be parallelized across independent specialists
- Need structured tracking of who does what and what’s done

**NOT for:** single-domain tasks, quick one-shot requests, tasks under ~30 minutes.

## The 6 Phases (Copilot-native)

### Phase 1: Analyze — Decompose the task

Copilot CLI reads the request, identifies the domains involved, and decomposes work into parallelizable units.

Outputs to produce in this phase:
- Domain list (e.g., security / performance / architecture / docs / testing)
- Rough effort estimate
- Risks and coordination points (shared files, ordering constraints)

### Phase 2: Design the Team

Create a team roster in SQL.

**Output:** SQL `INSERT` statements into a `team` table:

```sql
CREATE TABLE IF NOT EXISTS team (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  agent_type TEXT NOT NULL,     -- explore | task | general-purpose | code-review
  focus TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready'  -- ready | running | done | blocked
);

INSERT INTO team (id, role, agent_type, focus, status) VALUES
  ('lead', 'Coordinator', 'general-purpose', 'Decompose, dispatch, synthesize', 'ready'),
  ('sec', 'Security reviewer', 'code-review', 'Auth, injection, secrets, unsafe defaults', 'ready'),
  ('perf', 'Performance scout', 'explore', 'Hot paths, expensive ops, caching opportunities', 'ready'),
  ('arch', 'Architecture analyst', 'general-purpose', 'Boundaries, API contracts, maintainability', 'ready');
```

### Phase 3: Assign Work

Track assignments in SQL so dispatch + monitoring is deterministic.

**Output:** SQL `INSERT` statements into an `assignments` table:

```sql
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  task TEXT NOT NULL,
  input_context TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | running | done | failed
  agent_run_id TEXT,                       -- returned by task tool when mode=background
  result_summary TEXT
);

INSERT INTO assignments (id, agent_id, task, input_context, status) VALUES
  ('a-sec-1', 'sec',  'Review security posture and identify critical vulnerabilities', 'Focus on auth, input validation, secrets, SSRF/XSS, unsafe deserialization', 'pending'),
  ('a-perf-1','perf', 'Scan for performance bottlenecks and high-cost code paths',       'Look for N+1, heavy loops, slow I/O, missing memoization/caching',          'pending'),
  ('a-arch-1','arch', 'Evaluate architecture risks and suggest refactors',               'Focus on boundaries, coupling, module ownership, API contracts',            'pending');
```

### Phase 4: Dispatch

Dispatch each assignment using either:

- **`task` tool calls** per assignment (best when you want explicit control over agent_type and prompts)
- **`/fleet`** (best when you have many independent tasks and want automatic fan-out)

#### Option A: Dispatch with `task` (explicit)

Run each assignment as a **background** agent so you can keep working while they run:

```
task:
  agent_type: "code-review"
  name: "security-review"
  mode: "background"
  prompt: "Review the repository for security vulnerabilities. Prioritize exploitable issues and list concrete remediations."

task:
  agent_type: "explore"
  name: "performance-scout"
  mode: "background"
  prompt: "Scan the repo for likely performance bottlenecks. Identify top 5 hotspots and where to measure."

task:
  agent_type: "general-purpose"
  name: "architecture-analyst"
  mode: "background"
  prompt: "Assess the system architecture. Identify boundary violations and propose refactors that reduce coupling."
```

#### Option B: Dispatch with `/fleet` (automatic fan-out)

```
/fleet Audit our API for security, performance, and architecture issues. Split the work into parallel specialists and report back with prioritized findings.
```

#### PowerShell example (dispatcher pattern for 3 agents)

Copilot CLI tool calls aren’t executed *from* PowerShell, but you can use PowerShell as a lightweight
**dispatcher template**: paste SQL results into variables, then generate the 3 `task` blocks you will run.

```powershell
# 1) (In Copilot) SELECT your pending assignments:
# SELECT id, agent_id, task, input_context FROM assignments WHERE status='pending';

# 2) Paste the rows into a PS structure (example):
$assignments = @(
  @{ id = 'a-sec-1';  agent_type = 'code-review';      name='security-review';      prompt = 'Review repo security. Focus on auth, injection, secrets. Provide fixes.' },
  @{ id = 'a-perf-1'; agent_type = 'explore';          name='performance-scout';    prompt = 'Find perf hotspots. List top 5 and how to measure.' },
  @{ id = 'a-arch-1'; agent_type = 'general-purpose';  name='architecture-analyst'; prompt = 'Assess architecture. Identify coupling and propose refactors.' }
)

# 3) Generate the tool-call blocks to run in Copilot CLI:
$assignments | ForEach-Object {
@"
 task:
   agent_type: \"$($_.agent_type)\"
   name: \"$($_.name)\"
   mode: \"background\"
   prompt: \"$($_.prompt)\"
"@
}
```

> Tip: after each `task` call returns an `agent_id` (run id), store it back into `assignments.agent_run_id`.

### Phase 5: Monitor

Monitor running background agents with `read_agent` and update SQL as they finish.

Suggested loop:

1. Mark assignment `running` when dispatched
2. Poll/await completion with `read_agent`
3. Write a follow-up question with `write_agent` if the output is incomplete
4. Store a short `result_summary` in SQL and mark `done` (or `failed`)

Example monitoring updates:

```sql
-- When dispatching
UPDATE assignments SET status='running', agent_run_id='AGENT_ID_HERE' WHERE id='a-sec-1';

-- When complete
UPDATE assignments
SET status='done', result_summary='Found 2 critical injection paths; recommend parameterization + validation'
WHERE id='a-sec-1';
```

### Phase 6: Synthesize

Use a `general-purpose` agent as the “editor-in-chief”:

- Reads `team` + `assignments` tables (plus any referenced files/PR diffs)
- Resolves conflicts between findings
- Produces one consolidated deliverable: prioritized issues, owners, and next actions

```
task:
  agent_type: "general-purpose"
  name: "synthesizer"
  prompt: "Read the SQL tables team + assignments (and any referenced artifacts) and produce a consolidated report: top risks, recommended fixes, sequencing, and quick wins."
```

## Tool Mapping (why this is a redesign, not a port)

| Harness primitive | Copilot CLI equivalent |
|---|---|
| TeamCreate | SQL `team` table |
| TaskCreate | SQL `assignments` table |
| Agent (typed) | `task` tool with `agent_type` param |
| SendMessage | file/SQL message bus (and `write_agent` for follow-ups) |
| Persistent agent state | SQL session database |

## Example: Full-Stack Security Audit

Goal: **“Audit our API for security, performance, and architecture issues.”**

1. **Analyze**: identify domains → security, performance, architecture; decide parallelizable workstreams.
2. **Design the Team**: create `team` rows (`sec`, `perf`, `arch`, `lead`).
3. **Assign Work**: create `assignments` rows with clear prompts + input_context.
4. **Dispatch**:
   - Use 3 background `task` calls (explicit) **or** `/fleet` (automatic fan-out).
5. **Monitor**:
   - `read_agent` until complete; `write_agent` to request missing evidence (file paths, repro steps).
   - Update `assignments.status` and store `result_summary`.
6. **Synthesize**:
   - A `general-purpose` synthesizer merges findings into a single prioritized remediation plan.

Deliverable format (recommended):
- 🔴 Critical (must fix)
- 🟡 Important (should fix)
- 🟢 Opportunistic (nice-to-have)
Each item includes: evidence (paths), impact, and a concrete fix.

## See Also

- `orchestration/patterns/hierarchical-delegation.md`
- `orchestration/patterns/fan-out-parallel.md`
- `orchestration/skills/multi-ai-handoff.md`
