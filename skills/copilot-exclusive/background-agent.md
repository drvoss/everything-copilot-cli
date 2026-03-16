---
name: background-agent
description: Leverage background agents for async work with completion notifications
category: copilot-exclusive
copilot_feature: Background agents (mode="background"), async PowerShell, completion notifications
---

# Background Agent Patterns

## Why This is Copilot-Exclusive

Copilot CLI supports **true background agents** — AI-powered sub-agents that run
asynchronously while you continue working. You launch a task, keep coding, and get notified
when it completes. Combined with async PowerShell sessions that persist across turns, this
enables a workflow where multiple streams of work progress simultaneously. Claude Code is
synchronous — you wait for every operation to finish before doing anything else.

## When to Use

- Long-running builds or test suites you don't want to block on
- Research tasks (exploring codebases, reading docs) while you code
- Code generation that takes minutes (large test suites, documentation)
- Monitoring processes (dev servers, file watchers) alongside other work
- Multi-turn background conversations for complex analysis

## Workflow

### 1. Launch a Background Agent

```
Tool: task
  agent_type: "general-purpose"
  prompt: "Run the full test suite, analyze any failures, and create a report..."
  mode: "background"
  description: "Running test suite"
```

Returns an `agent_id` immediately — you're free to continue.

### 2. Continue Working

While the background agent runs, you can:
- Edit files and make code changes
- Launch additional background agents
- Ask questions and get answers
- Run quick commands

### 3. Check Status

```
Tool: list_agents
  → Shows: agent_id, status (running/completed/failed), description
```

### 4. Read Results When Notified

You'll get an automatic notification when the agent completes:

```
Tool: read_agent
  agent_id: "abc-123"
  → Returns: full results from the background agent
```

### 5. Async PowerShell Sessions

For long-running processes (not agents), use async PowerShell:

```
Tool: powershell
  command: "npm run build"
  mode: "async"
  → Returns: shellId for monitoring

# Later, check output:
Tool: read_powershell
  shellId: "shell-xyz"
  delay: 5
```

### 6. Detached Processes for Servers

```
Tool: powershell
  command: "npm run dev"
  mode: "async"
  detach: true
  → Process survives session shutdown
```

## Examples

### Build While You Code

```
You: "Run the full build in the background while I work on the auth module"

# Copilot launches background build
powershell: command="npm run build", mode="async"

# You immediately continue:
You: "Now let's refactor the auth middleware..."
# Copilot edits files while build runs

# [Notification: Build completed]
# Copilot reads the output, reports success/failure
```

### Parallel Research + Implementation

```
# Launch background research
task(agent_type="explore",
     prompt="Analyze how the payment module handles refunds...",
     mode="background")

# Immediately start implementation
You: "While that runs, let's add the new endpoint for order cancellation"
# Copilot starts coding

# When research completes, integrate findings
read_agent(agent_id="research-123")
# "The payment module uses a saga pattern for refunds. Let me update
#  the cancellation endpoint to follow the same pattern..."
```

### Dev Server + Testing Workflow

```bash
# Start dev server (persists in background)
powershell: command="npm run dev", mode="async", detach=true

# Run tests against it
powershell: command="npm test -- --watchAll", mode="async"

# Work on code while tests watch for changes
# Tests re-run automatically on save
# Read test output anytime:
read_powershell: shellId="test-session", delay=5
```

### Long Test Suite with Notification

```
# Launch the slow integration tests
task(agent_type="task",
     prompt="Run the integration test suite and report results",
     mode="background")

# Work on unrelated features for 10 minutes
# ...

# [Notification: Integration tests completed]
read_agent(agent_id="integration-tests")
# "247 tests passed, 2 failed: test_payment_timeout, test_retry_logic"
```

## Tips

- **Use `task` agent for builds/tests**: The `task` agent type is optimized for
  command execution — brief output on success, full details on failure.
- **Detach servers, don't detach tasks**: Use `detach: true` only for long-lived
  processes (servers, watchers). Regular background tasks should not be detached.
- **Check `list_agents` periodically**: See what's still running and what's done.
- **Don't poll — wait for notifications**: Copilot notifies you when background
  agents complete. No need to repeatedly call `read_agent`.
- **Chain background work**: Launch a background agent, and when it completes,
  launch another based on its results.
- **Resource awareness**: Each background agent consumes model quota. Don't
  launch dozens simultaneously unless your plan supports it.
