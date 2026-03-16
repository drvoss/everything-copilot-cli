---
name: fleet-parallel
description: Use Fleet mode for massively parallel task execution across multiple agents
category: copilot-exclusive
copilot_feature: Fleet mode (autopilot_fleet) with parallel sub-agent orchestration
---

# Fleet Mode Parallel Execution

## Why This is Copilot-Exclusive

Copilot CLI's **Fleet mode** launches multiple autonomous agents in parallel, each working
on an independent subtask in its own context window. This is a fundamentally different
execution model — not just "run commands in parallel" but full AI agents running concurrently
with their own tool access. Claude Code has no equivalent; it's strictly single-threaded
with one agent processing one task at a time.

## When to Use

- Refactoring the same pattern across many files simultaneously
- Reviewing multiple PRs or issues in parallel
- Running independent code generation tasks (tests, docs, migrations)
- Batch-processing items where each item needs AI reasoning, not just scripting
- Any task that decomposes into 3+ independent units of work

## Workflow

### 1. Decompose the Task

Break your work into independent, parallelizable units. Each unit should be:
- Self-contained (no dependencies on other units)
- Clearly scoped (one file, one module, one PR)
- Completable by a single agent

### 2. Plan with Todos

Use the session SQL database to track fleet tasks:

```sql
INSERT INTO todos (id, title, description, status) VALUES
  ('migrate-users', 'Migrate users.ts', 'Convert class components to hooks in src/users.ts', 'pending'),
  ('migrate-orders', 'Migrate orders.ts', 'Convert class components to hooks in src/orders.ts', 'pending'),
  ('migrate-products', 'Migrate products.ts', 'Convert class components to hooks in src/products.ts', 'pending'),
  ('migrate-cart', 'Migrate cart.ts', 'Convert class components to hooks in src/cart.ts', 'pending');
```

### 3. Launch Fleet via Plan Mode

Enter Plan Mode (Shift+Tab), define the plan, then select `autopilot_fleet`:

```
exit_plan_mode:
  summary: "Migrate 4 component files from class to hooks pattern"
  actions: ["autopilot_fleet", "autopilot", "exit_only"]
  recommendedAction: "autopilot_fleet"
```

Fleet mode assigns each todo to a separate agent that works autonomously.

### 4. Monitor and Collect Results

While fleet agents run, you can:
- Check progress via `list_agents`
- Read individual agent results via `read_agent`
- Continue working on other tasks yourself

### 5. Using Task Tool for Manual Fleet

Launch parallel agents directly with the `task` tool:

```
# Launch 3 agents simultaneously
task(agent_type: "general-purpose", prompt: "Migrate src/users.ts from class to hooks...", mode: "background")
task(agent_type: "general-purpose", prompt: "Migrate src/orders.ts from class to hooks...", mode: "background")
task(agent_type: "general-purpose", prompt: "Migrate src/products.ts from class to hooks...", mode: "background")
```

## Examples

### Multi-File Test Generation

> "Generate unit tests for all 8 utility files in src/utils/"

Fleet assigns one agent per file. Each agent:
1. Reads the source file
2. Identifies exported functions
3. Generates comprehensive tests
4. Writes the test file
5. Runs the tests to verify they pass

8 files × ~2 minutes each = ~2 minutes total (vs ~16 minutes sequential).

### Parallel PR Review

> "Review these 5 open PRs and give me a summary of each"

```
# 5 explore agents launched in parallel
task(agent_type: "explore", prompt: "Review PR #101 in my-org/app...", mode: "sync")
task(agent_type: "explore", prompt: "Review PR #102 in my-org/app...", mode: "sync")
task(agent_type: "explore", prompt: "Review PR #103 in my-org/app...", mode: "sync")
# ... all running simultaneously
```

### Codebase-Wide Documentation

> "Add JSDoc comments to all exported functions in src/services/"

Each agent handles one service file, reads the function signatures and
implementations, and adds meaningful documentation.

## Tips

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
