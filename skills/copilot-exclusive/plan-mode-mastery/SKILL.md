---
name: plan-mode-mastery
description: Master Plan Mode for structured planning with approval workflows and SQL-backed todos
metadata:
  category: copilot-exclusive
  copilot_feature: "Plan Mode (Shift+Tab), exit_plan_mode tool, SQL todo tracking, approval UI"
---

# Plan Mode Mastery

## Why This is Copilot-Exclusive

Copilot CLI has a **dedicated Plan Mode** activated by Shift+Tab that fundamentally changes
how you interact with the agent. Instead of executing immediately, Copilot creates a structured
plan with SQL-backed todo tracking, presents it in the terminal for review, and lets you choose
between interactive execution, autopilot, or fleet mode. Claude Code has no dedicated planning mode — it
either executes immediately or you manually structure your requests.

## When to Use

- Complex multi-step tasks that benefit from upfront planning
- Tasks where you want to review the approach before execution begins
- Work that should be tracked with status updates (pending → in_progress → done)
- When you need to choose between interactive, autopilot, or fleet execution
- Team-visible task breakdowns for collaborative work

## Workflow

### 1. Enter Plan Mode

Press **Shift+Tab** to toggle Plan Mode on. The mode indicator appears in your prompt.

### 2. Describe Your Task

```
You: "Refactor the authentication system to use JWT tokens instead of sessions"
```

### 3. Copilot Creates a Structured Plan

Copilot analyzes the codebase, creates SQL todos, and presents a plan:

```sql
INSERT INTO todos (id, title, description, status) VALUES
  ('jwt-lib', 'Add JWT library', 'Install jsonwebtoken, add to package.json', 'pending'),
  ('token-service', 'Create token service', 'Build JWT sign/verify in src/auth/tokens.ts', 'pending'),
  ('auth-middleware', 'Update middleware', 'Replace session checks with JWT validation', 'pending'),
  ('login-endpoint', 'Update login', 'Return JWT instead of setting session cookie', 'pending'),
  ('logout-endpoint', 'Update logout', 'Implement token blacklist for logout', 'pending'),
  ('update-tests', 'Update tests', 'Fix all auth tests for JWT flow', 'pending');

INSERT INTO todo_deps (todo_id, depends_on) VALUES
  ('token-service', 'jwt-lib'),
  ('auth-middleware', 'token-service'),
  ('login-endpoint', 'token-service'),
  ('logout-endpoint', 'token-service'),
  ('update-tests', 'auth-middleware');
```

### 4. Review Plan in Terminal

Copilot calls `exit_plan_mode` to present the plan:

```
exit_plan_mode:
  summary: |
    - Install jsonwebtoken and create token service
    - Update auth middleware for JWT validation
    - Modify login/logout endpoints
    - Update all auth tests
    - 6 todos with dependency chain
  actions: ["autopilot_fleet", "autopilot", "interactive", "exit_only"]
  recommendedAction: "autopilot"
```

You see a clean menu:
- **Autopilot** (recommended) — Copilot executes all todos autonomously
- **Fleet** — Parallel agents for independent todos
- **Interactive** — Step through each todo with your approval
- **Exit** — Leave plan mode without executing

### 5. Execution with Status Tracking

As Copilot works, it updates todo status:

```sql
UPDATE todos SET status = 'in_progress' WHERE id = 'jwt-lib';
-- ... does the work ...
UPDATE todos SET status = 'done' WHERE id = 'jwt-lib';
```

Query progress anytime:

```sql
SELECT id, title, status FROM todos ORDER BY created_at;
```

## Examples

### Dependency-Aware Execution

```sql
-- Find todos ready to execute (no pending dependencies)
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos dep ON td.depends_on = dep.id
  WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

This query drives execution order — Copilot only starts a todo when its
dependencies are complete.

### Plan Refinement

If the plan doesn't look right, provide feedback:

```
You: "Split the 'update-tests' todo into unit tests and integration tests,
      and add a todo for updating the API documentation."
```

Copilot updates the plan and re-presents it for approval.

### Mode Transitions

```
Interactive → "This is taking too long, switch to autopilot"
Autopilot → "Stop, I want to review the middleware changes"
Plan Mode → "Actually, use fleet for the independent test files"
```

Seamlessly transition between modes as your needs change.

## Tips

- **Plan Mode for big tasks, direct mode for small ones**: Don't over-plan
  a one-file edit. Reserve Plan Mode for tasks with 3+ steps.
- **Use dependencies**: The `todo_deps` table ensures correct execution order.
  Always model dependencies when they exist.
- **Fleet for parallelizable plans**: If your todos are independent (e.g., "add
  tests to 8 files"), recommend `autopilot_fleet` for parallel execution.
- **Query your progress**: `SELECT status, COUNT(*) FROM todos GROUP BY status`
  gives you an instant progress dashboard.
- **Iterate the plan**: Plan Mode is collaborative. Give feedback, refine, and
  approve only when you're confident in the approach.
- **Blocked status**: Mark todos as `blocked` with a reason when external
  dependencies prevent progress.
