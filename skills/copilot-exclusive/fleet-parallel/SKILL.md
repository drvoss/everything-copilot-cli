---
name: fleet-parallel
description: Use when you need to run the same task across many files, components, or contexts in parallel — triggers /fleet mode for batch refactoring, mass testing, or bulk review. NOT when sequential order matters.
metadata:
  category: copilot-exclusive
  copilot_feature: "/fleet slash command, autopilot_fleet, parallel sub-agent orchestration"
---

# Fleet Mode Parallel Execution

## Why This is Copilot-Exclusive

Copilot CLI's **Fleet mode** launches multiple autonomous agents in parallel, each working
on an independent subtask in its own context window. This is a fundamentally different
execution model — not just "run commands in parallel" but full AI agents running concurrently
with their own tool access.

## When to Use

- Refactoring the same pattern across many files simultaneously
- Reviewing multiple PRs or issues in parallel
- Running independent code generation tasks (tests, docs, migrations)
- Batch-processing items where each item needs AI reasoning, not just scripting
- Any task that decomposes into 3+ independent units of work

## When NOT to Use

| Instead of fleet-parallel | Use |
|---------------------------|-----|
| A single-file or single-function change | Work directly in the current session |
| A task with ordered dependencies between steps | Plan the sequence and run it serially |
| Subtasks that would edit the same file, lockfile, or generated artifact | Split ownership first or avoid fleet mode |
| A tiny batch of 2-3 trivial items | Handle them sequentially unless agent overhead is clearly worth it |

### Write-Scope Conflict Guard

Before launching any fleet batch, validate that no two agents share write scope:

```text
Rule: Same file = sequential. Different files = parallel.
```

- List all files each subtask will modify
- If two tasks name the same file, one **must** wait — do not launch them in the same batch
- Lockfiles, generated files, and shared config are treated the same as source files
- If scope overlap is discovered mid-run, stop the later agent, let the earlier one finish, then requeue

## Workflow

### 1. Use the `/fleet` Slash Command (Recommended)

The simplest way to trigger fleet mode is the `/fleet` command:

```text
/fleet Generate unit tests for all 8 utility files in src/utils/
```

Copilot automatically decomposes the task and spawns parallel sub-agents.

### 2. Fleet via Plan Mode (for complex decomposition)

For tasks requiring explicit decomposition, enter Plan Mode (Shift+Tab), define the plan,
then select `autopilot_fleet`:

```text
exit_plan_mode:
  summary: "Migrate 4 component files from class to hooks pattern"
  actions: ["autopilot_fleet", "autopilot", "exit_only"]
  recommendedAction: "autopilot_fleet"
```

Fleet mode assigns each todo to a separate agent that works autonomously.

### 3. Plan with SQL Todos

Use the session SQL database to track fleet tasks:

```sql
INSERT INTO todos (id, title, description, status) VALUES
  ('migrate-users', 'Migrate users.ts', 'Convert class components to hooks in src/users.ts', 'pending'),
  ('migrate-orders', 'Migrate orders.ts', 'Convert class components to hooks in src/orders.ts', 'pending'),
  ('migrate-products', 'Migrate products.ts', 'Convert class components to hooks in src/products.ts', 'pending'),
  ('migrate-cart', 'Migrate cart.ts', 'Convert class components to hooks in src/cart.ts', 'pending');
```

### 4. Package Context per Agent

Before launching the fleet, give each agent a compact brief:

```markdown
## Agent Brief: [Subtask]

**Goal**: [one-sentence outcome]
**Owned files or directories**: [exact paths]
**Inputs**: [spec, issue, examples, or files]
**Output**: [expected file or summary shape]
**Do not touch**: [out-of-scope files or concerns]
**Done when**: [clear completion criteria]
```

Context packaging rules:

- Give each agent only the files and background it actually needs
- Assign file ownership explicitly so two agents do not edit the same files
- Specify the output shape up front (patch, summary, tests, docs, etc.)
- If two subtasks need the same files, they do **not** belong in the same fleet batch

## How Fleet Handles Dependencies

Fleet is not just a flat batch runner. Copilot first analyzes whether the work can be broken into
independent subtasks, then orchestrates dependencies between them.

```text
Task A (no deps)  ──┐
Task B (no deps)  ──┤──► may run in parallel
Task C (no deps)  ──┘

Task D (depends on A) ──► waits for A
Task E (depends on A, B) ──► waits for A and B
```

Where possible, Copilot parallelizes the independent work and keeps dependent follow-up tasks
behind the orchestrator.

### Writing dependency-aware fleet briefs

```text
/fleet "
1. Add TypeScript types to user.ts — no dependencies
2. Add TypeScript types to product.ts — no dependencies
3. Add TypeScript types to order.ts — no dependencies
4. Update the API layer to use the new types from 1, 2, and 3
5. Update tests after the API layer changes
"
```

The clearer the dependency edges are in your prompt, the easier it is for Copilot to parallelize
the safe parts and serialize the rest.

### When Fleet serializes unexpectedly

If work runs sequentially when you expected parallel execution, assume there is shared state or an
implicit dependency. Split overlapping writes into separate batches, or move the follow-up phase
into a later fleet invocation.

### 5. Use Worktrees for Branch Isolation (Optional)

If agents need separate long-lived branches or may touch overlapping tooling state, create one
git worktree per task and include that path in the prompt. See
[`using-git-worktrees`](../../workflow/using-git-worktrees/SKILL.md).

### 5-A. Fresh Context Per Task, With a Dual Review Gate (Sequential Variant)

Fleet mode above parallelizes independent tasks. When tasks are mostly independent but you want
to stay in the *current* session (no separate `/fleet` batch, no context switch), apply the same
isolation discipline **sequentially**: dispatch one fresh sub-agent per task, gate each with a
review before moving on, and do the final review only once at the end.

- **Fresh subagent per task** — never let a sub-agent inherit this session's full history.
  Construct its brief from scratch: only the plan step, the files it owns, and any prior-task
  output it genuinely depends on. This keeps the sub-agent focused and preserves your own context
  for coordination.
- **Dual review per task** — after each task's sub-agent reports done, dispatch a separate
  reviewer (read-only, per `sub-agent-sandboxing`'s read-only reviewer constraint) that checks two
  things: does the result match the task's spec, and is the quality acceptable. Only mark the task
  complete in the SQL `todos` table after both pass; otherwise dispatch a fix pass and re-review.
- **One broad review at the end** — after every task is complete, run a single whole-branch review
  across the full diff, separate from the per-task reviews. Per-task review catches local defects;
  the final pass catches integration and cross-task consistency issues neither task saw in
  isolation.
- **Continuous execution** — once dispatched, do not pause between tasks to ask "should I
  continue?". Keep executing the remaining tasks. The only valid reasons to stop are: a task
  reports BLOCKED and you cannot resolve it, a genuine ambiguity prevents progress, or all tasks
  are done.

This differs from full `/fleet` batches in one way: tasks run one after another in the same
session rather than as concurrent agents, which is the right trade when task N's brief needs
output from task N-1 but you still want isolation and review discipline per step.

### 6. Monitor and Collect Results

While fleet agents run, you can:

- Check progress via `list_agents`
- Read individual agent results via `read_agent`
- Continue working on other tasks yourself

### 7. Observe Fleet Runs with OTel (Optional)

If Copilot CLI OpenTelemetry is enabled, subagent invocations are linked into the same trace via
context propagation. That makes it easier to attribute latency, token usage, and failures across a
fleet run without inventing your own correlation IDs.

### 8. Heartbeat Monitoring for Long-Running Fleets

For batches expected to run longer than a few minutes, schedule periodic progress checks:

```text
Every N minutes: check each active agent for DONE / ERROR / STUCK
```

**Status patterns to watch:**

| Signal | State | Action |
|--------|-------|--------|
| Completion indicator or clean exit | DONE | Mark task complete, unlock dependents |
| Error/failure output | ERROR | Capture logs, retry with error context, bounded retries |
| Prompt waiting for input | STUCK | Send the expected response or surface to human |
| No progress for threshold time | STALLED | Nudge or restart with context from prior attempt |

**Bounded retry rule**: Do not retry indefinitely. After the configured retry limit, stop the task and surface the blocker — guessing at a fix compounds errors. Human review is the correct escalation.

**Progress logging**: Write task state to the SQL `todos` table (or a manifest file) so a crash or session restart does not lose orchestration state:

```sql
UPDATE todos SET status = 'done' WHERE id = 'task-id';
-- or 'blocked' with a blocker note in description
UPDATE todos SET status = 'blocked', description = 'Retry limit reached: <error summary>' WHERE id = 'task-id';
```

## Examples

### Multi-File Test Generation

```text
/fleet Generate unit tests for all 8 utility files in src/utils/
```

Fleet assigns one agent per file. Each agent:

1. Reads the source file
2. Identifies exported functions
3. Generates comprehensive tests
4. Writes the test file
5. Runs the tests to verify they pass

8 files × ~2 minutes each = ~2 minutes total (vs ~16 minutes sequential).

### Parallel PR Review

```text
/fleet Review open PRs #101, #102, #103, #104, #105 and summarize each
```

### Codebase-Wide Documentation

```text
/fleet Add JSDoc comments to all exported functions in src/services/
```

## Tips

- **Start with `/fleet`**: For most tasks, the slash command is the easiest entry point.
- **Right-size your tasks**: Each fleet agent gets its own context window. Tasks
  should be substantial enough to justify an agent but small enough to complete
  independently.
- **Use explore agents for read-only tasks**: They're faster and cheaper. Reserve
  `general-purpose` agents for tasks that modify files.
- **Avoid conflicts**: Don't assign two agents to edit the same file. Split by
  file boundaries.
- **Set clear prompts**: Fleet agents are stateless — include ALL context they
  need in the prompt. Don't assume they know what you discussed earlier.
- **Combine with SQL tracking**: Use the session database to track which fleet
  tasks completed and which need retry.
- **Use OTel when the batch is opaque**: with monitoring enabled, fleet subagents stay connected
  to the same trace tree, which helps you debug slow or expensive runs.
- **Right-size the batch**: 2-3 subtasks may be easier to do sequentially. Fleet is usually
  most valuable once you have 4+ truly independent tasks.
- **Cost awareness**: Fleet mode uses more API calls. Use it when parallelism
  provides clear value, not for trivially sequential tasks.
- **Sequential isolation is still isolation**: when tasks are dependent and must stay in one
  session, the 5-A fresh-context + dual-review discipline gets you most of fleet's quality
  benefit without the concurrency (concept adapted from obra/superpowers
  `subagent-driven-development`).
