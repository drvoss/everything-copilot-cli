---
name: background-agent
description: Delegate long-running tasks to a cloud Copilot coding agent using & or /delegate. The agent works on GitHub and opens a draft PR. Use /resume to bring a cloud session into the local CLI.
metadata:
  category: copilot-exclusive
  copilot_feature: "Background Delegation (&, /delegate), cloud Copilot coding agent, draft PR, /resume"
---

# Background Delegation

## What It Is

**Background Delegation** hands off tasks to a cloud-based Copilot coding agent on GitHub.
Your terminal is immediately freed. The agent works on a new branch, makes changes, and
opens a **draft PR** — results are reviewed on GitHub, not polled from the terminal.

This is distinct from async PowerShell (for local long-running processes like builds/servers),
which still uses `mode: "async"` in the powershell tool.

## When to Use

- Large refactors or multi-file migrations you don't want to block on
- Full test suite additions or comprehensive documentation generation
- Any task that benefits from running in a fresh, isolated context on GitHub
- Handing off work while you continue unrelated local development

## Workflow

### 1. Delegate with `&` or `/delegate`

Prefix any prompt with `&` to push the task to the cloud Copilot coding agent:

```
& "Add pagination to all REST endpoints and write integration tests"
```

Equivalently, use the slash command:

```
/delegate Add pagination to all REST endpoints and write integration tests
```

The agent commits any of your unstaged changes as a checkpoint, creates a new branch,
and begins working. You receive a link to the draft PR immediately.

### 2. Continue Local Work

Your terminal is free. Keep coding locally while the agent works on GitHub.

### 3. Review the Draft PR

When the agent completes, it opens a **draft PR** on GitHub. Review the changes there —
request review, iterate, or merge as usual.

### 4. Continue the Conversation Locally (Optional)

Use `/resume` to bring a cloud agent session into your local CLI, preserving the full
accumulated context:

```
/resume
# → Select from list of recent sessions

/resume abc123
# → Resume a specific session by ID
> Now also update the API documentation to reflect the pagination parameters
```

> **Note:** `/resume` is for continuing the conversation, not polling for results.
> The agent's output is the draft PR on GitHub.

### 5. Async PowerShell — Local Long-Running Processes

For local processes (builds, dev servers, test watchers) that don't need cloud delegation,
use async PowerShell:

```
# Start dev server (persists in background)
Tool: powershell
  command: "npm run dev"
  mode: "async"
  detach: true

# Run tests in async mode
Tool: powershell
  command: "npm test -- --watchAll"
  mode: "async"
  → Returns: shellId

# Read output later
Tool: read_powershell
  shellId: "test-session"
  delay: 5
```

## Examples

### Delegate a Large Migration

```
# Hand off to cloud agent — terminal is immediately free
& "Migrate all class components in src/ to React hooks"
# → Draft PR opens when done

# Continue local work while agent runs
> Now let's update the design system tokens...
```

### Parallel Delegations

```
# Delegate two independent tasks simultaneously
& "Add comprehensive error handling to all API endpoints"
# → Draft PR #1 will open

& "Generate JSDoc for all exported functions in src/services/"
# → Draft PR #2 will open

# Both run concurrently on GitHub while you work locally
```

### Multi-Turn Refinement

```
# Initial delegation
& "Analyze the auth system and refactor weak points"

# After reviewing the draft PR...
/resume abc123
> The token refresh logic still has a race condition — fix it too
# → Agent continues with full context from the original session
```

### Local Build + Test (Not Delegation)

```bash
# These stay local — use async PowerShell, not &
powershell mode="async": npm run build
powershell mode="async": npm test -- --watchAll
powershell mode="async" detach=true: npm run dev
```

## Tips

- **`&` delegates to GitHub cloud** — creates a draft PR. Use for work that belongs in a PR.
- **Async PowerShell is for local processes** — builds, servers, watchers. No PR created.
- **`/resume` for context continuity** — bring the session local to keep iterating after the PR.
- **Unstaged changes are committed** — Copilot creates a checkpoint commit before branching.
- **Review on GitHub** — the draft PR is the canonical output of background delegation.
