---
name: fleet-parallel
description: Use /fleet or Fleet mode to execute tasks across multiple parallel sub-agents simultaneously. Ideal for batch operations like testing, refactoring, or reviewing across many files.
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

## Workflow

### 1. Use the `/fleet` Slash Command (Recommended)

The simplest way to trigger fleet mode is the `/fleet` command:

```
/fleet Generate unit tests for all 8 utility files in src/utils/
```

Copilot automatically decomposes the task and spawns parallel sub-agents.

### 2. Fleet via Plan Mode (for complex decomposition)

For tasks requiring explicit decomposition, enter Plan Mode (Shift+Tab), define the plan,
then select `autopilot_fleet`:

```
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

### 4. Monitor and Collect Results

While fleet agents run, you can:
- Check progress via `list_agents`
- Read individual agent results via `read_agent`
- Continue working on other tasks yourself

## Examples

### Multi-File Test Generation

```
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

```
/fleet Review open PRs #101, #102, #103, #104, #105 and summarize each
```

### Codebase-Wide Documentation

```
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
- **Cost awareness**: Fleet mode uses more API calls. Use it when parallelism
  provides clear value, not for trivially sequential tasks.
