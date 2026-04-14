---
name: autopilot-patterns
description: Use when you're ready to let Copilot execute a multi-step plan autonomously — configures appropriate guardrails, handles plan-to-autopilot transitions, and sets safety boundaries.
metadata:
  category: copilot-exclusive
  copilot_feature: "Autopilot mode, autonomous execution, plan-to-autopilot transitions"
---

# Autopilot Mode Patterns

## Why This is Copilot-Exclusive

Copilot CLI's **Autopilot mode** lets the agent work autonomously through a plan without
stopping for approval at each step. Combined with Plan Mode's structured todos and Fleet's
parallelism, this creates a spectrum of autonomy levels — from fully interactive to fully
autonomous — that you can dial in per task. Claude Code always requires you to approve
every tool call (or use a limited "auto-accept" that lacks structured planning).

## When to Use

- Well-defined tasks with clear acceptance criteria
- Repetitive operations across many files (migrations, formatting, refactors)
- After you've reviewed and approved a plan in Plan Mode
- When the cost of review per step exceeds the risk of autonomous execution
- Overnight or long-running tasks you want to fire-and-forget

## Workflow

### 1. Start with a Plan

Always begin in Plan Mode for autopilot tasks:

```text
[Shift+Tab to enter Plan Mode]
You: "Convert all React class components to functional components with hooks"
```

### 2. Review the Plan Carefully

This is your guardrail moment. The plan should include:

- Clear scope (which files, which patterns)
- Defined completion criteria
- Test verification steps
- Rollback approach (e.g., git branch)

### 3. Select Autopilot Execution

When presented with the approval menu, choose **Autopilot**:

```text
exit_plan_mode:
  summary: "Convert 12 class components to functional components..."
  recommendedAction: "autopilot"
```

### 4. Monitor Progress

Even in autopilot, you can:

- Watch the output stream in real-time
- Check todo status via SQL queries
- Interrupt if something goes wrong (Ctrl+C)

### Safety Patterns

#### Pattern 1: Branch-First Autopilot

```bash
# Create a safety branch before autopilot
git checkout -b autopilot/class-to-hooks

# Run autopilot on the branch
# If results are bad: git checkout main && git branch -D autopilot/class-to-hooks
# If results are good: create a PR for review
```

#### Pattern 2: Test-Gated Autopilot

Include test verification in every todo:

```sql
INSERT INTO todos (id, title, description) VALUES
  ('convert-user', 'Convert UserComponent',
   'Convert to hooks AND run npm test -- UserComponent.test to verify');
```

Autopilot runs tests after each conversion — if tests fail, it stops and fixes.

#### Pattern 3: Incremental Autopilot

Don't autopilot everything at once. Batch into phases:

```text
Phase 1 (Autopilot): Convert simple components (no state, no lifecycle)
Phase 2 (Interactive): Review Phase 1, then autopilot complex components
Phase 3 (Interactive): Handle edge cases manually
```

#### Pattern 4: Dry-Run First

```text
You: "First, analyze all class components and list what would change.
      Don't modify any files yet."

# Review the analysis
# Then: "OK, now execute the conversions in autopilot mode"
```

#### Pattern 5: Careful Scope Lock

When a task is safe to automate but the blast radius must stay narrow, tell Copilot exactly
what is frozen:

```text
You: "Use autopilot, but be careful:
      - Only touch files under src/auth/
      - Do not change config, CI, or lockfiles
      - Stop and report if the plan requires out-of-scope edits"
```

This is the practical equivalent of a **careful** mode: autonomous execution with hard scope
boundaries and an explicit stop condition.

#### Pattern 6: Freeze Approved Files

After review, keep the approved surface stable while autopilot finishes the remaining work:

```text
You: "Freeze these files unless a blocker forces a change:
      - src/contracts/*
      - docs/api.md
      Continue autopilot only on the implementation files."
```

Use this when some outputs are already reviewed, signed off, or shared with another team.

## Examples

### Safe Autopilot for Code Migration

```sql
-- Plan with built-in verification
INSERT INTO todos (id, title, description) VALUES
  ('backup', 'Create backup branch', 'git checkout -b backup/pre-migration'),
  ('migrate-1', 'Migrate users module', 'Convert + test src/users/'),
  ('migrate-2', 'Migrate orders module', 'Convert + test src/orders/'),
  ('migrate-3', 'Migrate products module', 'Convert + test src/products/'),
  ('verify', 'Full test suite', 'npm test -- --coverage'),
  ('cleanup', 'Clean up', 'Remove unused imports, run linter');

INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('migrate-1', 'backup'),
  ('migrate-2', 'backup'),
  ('migrate-3', 'backup'),
  ('verify', 'migrate-1'), ('verify', 'migrate-2'), ('verify', 'migrate-3'),
  ('cleanup', 'verify');
```

### Autopilot + Fleet Hybrid

For independent todos, combine autopilot with fleet:

```text
exit_plan_mode:
  summary: "3 independent migration tasks + verification + cleanup"
  recommendedAction: "autopilot_fleet"
```

Fleet parallelizes `migrate-1`, `migrate-2`, `migrate-3`, then autopilot
handles `verify` and `cleanup` sequentially.

### Documentation Autopilot

Low-risk, high-volume — perfect for full autopilot:

```text
You: "Add JSDoc to all exported functions in src/. Use autopilot, run
      the TypeScript compiler after each file to verify no errors."
```

#### Pattern 7: Ralph Wiggum Autonomous Loop

An autonomous improvement cycle that repeats until an exit condition is met. Use for iterative quality improvement tasks where the number of passes is unknown upfront.

```text
[Loop start]
1. Execute task (run tests / lint / analyze)
2. Collect failures or gaps
3. Apply fixes
4. Re-run verification
5. If all pass → exit. Else → repeat from step 1.

[Loop exit condition: all tests pass OR max 5 iterations reached]
```

**Implementation with SQL state:**

```sql
CREATE TABLE IF NOT EXISTS loop_state (
    iteration INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running',  -- running | done | max_reached
    failures_last_run INTEGER DEFAULT 0
);
INSERT INTO loop_state VALUES (0, 'running', -1);
```

Each iteration:

```sql
-- Before iteration
UPDATE loop_state SET iteration = iteration + 1;

-- After verification
UPDATE loop_state SET
    failures_last_run = :count,
    status = CASE
        WHEN :count = 0 THEN 'done'
        WHEN iteration >= 5 THEN 'max_reached'
        ELSE 'running'
    END;
```

**Best for:** Auto-fix lint cycles, test-fix-retest loops, retry-until-passing scenarios.

**Guard rails:**

- Always set a hard max iterations (5 is a good default)
- Log each iteration's result before continuing
- If `max_reached`: surface remaining failures for human review — do not silently skip them

## Tips

- **Plan quality determines autopilot quality**: A vague plan produces vague
  results. Invest time in a detailed plan before switching to autopilot.
- **Always branch first**: `git checkout -b autopilot/task-name` is your
  safety net. Worst case, you delete the branch.
- **Include tests in every todo**: The single best guardrail for autopilot
  is automated test verification at each step.
- **Use careful/freeze language explicitly**: if scope must stay narrow, say what is
  locked and when autopilot must stop rather than assuming it will infer the boundary.
- **Start small**: First time using autopilot? Try it on a 3-todo task.
  Build confidence before running 20-todo autopilot sessions.
- **Know when NOT to autopilot**: Security-critical code, database migrations,
  production configs — these deserve interactive review.
- **Review the diff after**: Even successful autopilot runs deserve a
  `git diff` review before merging.
