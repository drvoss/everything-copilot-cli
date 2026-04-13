---
name: <agent-name>
description: <one-line description of the specialist's focus>
agent_type: general-purpose   # explore | task | general-purpose | code-review
model: claude-sonnet-4.6      # see model selection guide below
tools:
  - grep
  - glob
  - view
  - edit         # remove if this agent is read-only
  - create       # remove if this agent should not create files
  - powershell   # remove if this agent should not run commands
escalation: <what triggers escalation — e.g., "security finding with CVSS > 7">
---

# <Agent Name>

> One-sentence description of what this agent does and when to use it.

## Purpose

Describe the agent's specific responsibility in 2–4 sentences. Be explicit about:

- What domain or sub-problem it owns
- What it **does not** handle (scope boundaries)
- What it produces (its output artifact)

## Input

What this agent expects to receive:

- Files or paths to read
- SQL table rows from the parent orchestrator
- Context variables (e.g., `$TARGET_DIR`, `$SCOPE`)

## Output

What this agent produces:

- Files written (path and format)
- SQL updates (`UPDATE assignments SET result_summary = '...' WHERE id = '...'`)
- Structured report / JSON / Markdown

## Behaviour

### Step 1: [Action name]

Describe what the agent does in this step. Include tool calls if applicable.

```text
# Example tool call (Copilot CLI tool invocation, not shell syntax)
task:
  agent_type: "explore"
  name: "sub-scanner"
  prompt: "Scan src/ for X and list findings as JSON."
```

### Step 2: [Action name]

...

### Step 3: Produce output

Write findings to the designated output location and update SQL.

```sql
UPDATE assignments
SET status = 'done',
    result_summary = '<summary of findings>'
WHERE id = '<assignment-id>';
```

## Model Selection

| Recommended model | Reason |
|-------------------|--------|
| `claude-sonnet-4.6` | Default — strong reasoning, good for analysis and multi-step tasks |
| `gpt-5-mini` | Fast iteration — good for boilerplate generation and simple transforms |
| `claude-haiku-4.5` | Cheapest — good for large-scale scanning with simple output |
| `claude-opus-4.6` | Deep analysis — use for security audits, architecture decisions |

## Escalation

- **Escalate to orchestrator** when: [condition]
- **Block and wait** when: [condition]
- **Auto-resolve** when: [condition]

## Example Usage in Team Planner

```sql
-- Add this agent to the team roster
INSERT INTO team (id, role, agent_type, focus, status) VALUES
  ('<agent-id>', '<role-name>', 'general-purpose', '<focus-area>', 'ready');

-- Assign work
INSERT INTO assignments (id, agent_id, task, input_context, status) VALUES
  ('<assignment-id>', '<agent-id>', '<task description>', '<input context>', 'pending');
```

Then dispatch with:

```text
task:
  agent_type: "general-purpose"
  name: "<agent-name>"
  mode: "background"
  prompt: "<task description>. Input context: <input context>. Write findings to <output path>."
```

---

> **See also:**
>
> - [Orchestrator Template](orchestrator-template.md) — the parent orchestrator that coordinates agents like this one
> - [Team Planner](../../skills/copilot-exclusive/team-planner/SKILL.md) — full workflow for multi-agent teams
> - [QA Agent Guide](../../guides/qa-agent-guide.md) — if this agent performs quality verification
