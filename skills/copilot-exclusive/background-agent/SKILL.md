---
name: background-agent
description: Use when a task is too long to block the current session or should run autonomously — delegates to a cloud background agent via & or /delegate so work can continue on GitHub while you keep moving locally.
metadata:
  category: copilot-exclusive
  copilot_feature: "Background Delegation (&, /delegate), cloud Copilot coding agent, branch/PR workflows, /resume"
---

# Background Delegation

## What It Is

**Background Delegation** hands off tasks to a cloud-based Copilot coding agent on GitHub.
Your terminal is immediately freed. The agent works on a branch in GitHub, and you review the
result there — as a branch diff or as a PR when you ask Copilot to create one.

This is distinct from async PowerShell (for local long-running processes like builds/servers),
which still uses `mode: "async"` in the powershell tool.

## When to Use

- Large refactors or multi-file migrations you don't want to block on
- Full test suite additions or comprehensive documentation generation
- Complex tasks where you want research or an implementation plan before any code is written
- Any task that benefits from running in a fresh, isolated context on GitHub
- Handing off work while you continue unrelated local development

## Cloud Agent Deep Work Mode

For complex tasks where architectural analysis matters before implementation, ask the cloud agent
to research first and present a plan before it edits files.

1. **Research**: Copilot investigates the codebase, dependencies, and current behavior
2. **Plan**: Copilot proposes an implementation approach before writing code
3. **Review**: You refine or approve the approach on GitHub
4. **Implement**: Copilot executes the approved plan on the branch

### When to use deep work vs direct delegation

| Scenario | Use |
|----------|-----|
| Large refactor across many files | Research + plan first |
| Architecture change with unclear scope | Research + plan first |
| Small, well-scoped change | Direct delegation with `&` or `/delegate` |
| Repetitive bulk operation | Direct delegation with `&` or `/delegate` |

Example:

```text
/delegate Analyze the current auth flow, propose a hardening plan, and wait for approval before changing code
```

Treat the plan as the approval surface. Iterate on the approach first, then let the agent
implement once the direction is clear.

## Workflow

### 1. Delegate with `&` or `/delegate`

Prefix any prompt with `&` to push the task to the cloud Copilot coding agent:

```text
& "Add pagination to all REST endpoints and write integration tests"
```

Equivalently, use the slash command:

```text
/delegate Add pagination to all REST endpoints and write integration tests
```

The agent commits any of your unstaged changes as a checkpoint, creates a new branch,
and begins working on GitHub.

### 2. Continue Local Work

Your terminal is free. Keep coding locally while the agent works on GitHub.

### 3. Review the Branch or PR

By default, review the resulting work on GitHub. Depending on how you prompted the task,
Copilot may leave the work on a branch for diff review or create a PR when you ask for one.

### 4. Continue the Conversation Locally (Optional)

Use `/resume` to bring a cloud agent session into your local CLI, preserving the full
accumulated context:

```text
/resume
# → Select from list of recent sessions

/resume abc123
# → Resume a specific session by ID
> Now also update the API documentation to reflect the pagination parameters
```

> **Note:** `/resume` is for continuing the conversation, not polling for results.
> The agent's output is reviewed on GitHub first.

### 5. Async PowerShell — Local Long-Running Processes

For local processes (builds, dev servers, test watchers) that don't need cloud delegation,
use async PowerShell:

```text
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

```text
# Hand off to cloud agent — terminal is immediately free
& "Migrate all class components in src/ to React hooks"
# → Review the resulting branch or PR on GitHub

# Continue local work while agent runs
> Now let's update the design system tokens...
```

### Parallel Delegations

```text
# Delegate two independent tasks simultaneously
& "Add comprehensive error handling to all API endpoints"
# → Work starts on GitHub for task 1

& "Generate JSDoc for all exported functions in src/services/"
# → Work starts on GitHub for task 2

# Both run concurrently on GitHub while you work locally
```

### Multi-Turn Refinement

```text
# Initial delegation
& "Analyze the auth system and refactor weak points"

# After reviewing the branch or PR...
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

- **`&` delegates to GitHub cloud** — review the resulting branch or PR on GitHub.
- **Ask for research first when the task is ambiguous**: tell Copilot to analyze and propose a
  plan before it edits code.
- **Async PowerShell is for local processes** — builds, servers, watchers. No PR created.
- **`/resume` for context continuity** — bring the session local to keep iterating after the GitHub review.
- **Unstaged changes are committed** — Copilot creates a checkpoint commit before branching.
- **Review on GitHub** — the canonical output is the GitHub branch or PR, not terminal polling.
