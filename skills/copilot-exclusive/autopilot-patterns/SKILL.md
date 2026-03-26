---
name: autopilot-patterns
description: Effective Autopilot mode patterns with guardrails and safety considerations
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

```
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

```
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

```
Phase 1 (Autopilot): Convert simple components (no state, no lifecycle)
Phase 2 (Interactive): Review Phase 1, then autopilot complex components
Phase 3 (Interactive): Handle edge cases manually
```

#### Pattern 4: Dry-Run First

```
You: "First, analyze all class components and list what would change.
      Don't modify any files yet."

# Review the analysis
# Then: "OK, now execute the conversions in autopilot mode"
```

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

```
exit_plan_mode:
  summary: "3 independent migration tasks + verification + cleanup"
  recommendedAction: "autopilot_fleet"
```

Fleet parallelizes `migrate-1`, `migrate-2`, `migrate-3`, then autopilot
handles `verify` and `cleanup` sequentially.

### Documentation Autopilot

Low-risk, high-volume — perfect for full autopilot:

```
You: "Add JSDoc to all exported functions in src/. Use autopilot, run
      the TypeScript compiler after each file to verify no errors."
```

## Tips

- **Plan quality determines autopilot quality**: A vague plan produces vague
  results. Invest time in a detailed plan before switching to autopilot.
- **Always branch first**: `git checkout -b autopilot/task-name` is your
  safety net. Worst case, you delete the branch.
- **Include tests in every todo**: The single best guardrail for autopilot
  is automated test verification at each step.
- **Start small**: First time using autopilot? Try it on a 3-todo task.
  Build confidence before running 20-todo autopilot sessions.
- **Know when NOT to autopilot**: Security-critical code, database migrations,
  production configs — these deserve interactive review.
- **Review the diff after**: Even successful autopilot runs deserve a
  `git diff` review before merging.
