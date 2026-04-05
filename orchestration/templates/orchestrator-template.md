---
name: "<orchestrator-name>"
type: "<pipeline|fan-out|review-chain|iterative>"
agents:
  - "<agent-1>"
  - "<agent-2>"
  - "<agent-3>"
---

# Orchestration Skill: <Name>

> Copy this template when creating a new orchestration skill. Replace all `<placeholder>` sections.
> Link to this template from: `orchestration/README.md`

## Description

<!-- One paragraph: what this orchestrator does, what trigger causes it to run, and what output it produces. -->

## When to Use

- <!-- condition 1 -->
- <!-- condition 2 -->

**NOT when:** <!-- describe when a simpler pattern (Pipeline / Fan-Out / single skill) is enough -->

## Error Handling Strategy

| Error Type | Detection | Recovery Strategy | Escalation |
|---|---|---|---|
| Timeout | Agent exceeds time budget or produces no output | Retry once with narrower scope; shorten prompt; reduce parallelism | Escalate to human if repeated |
| Empty output | Agent returns nothing or missing required fields | Re-run with explicit "must output X" checklist; provide a format example | Escalate if still empty after retry |
| Invalid format | Output fails expected schema or structure | Ask agent to reformat only (no new content); supply an example | Escalate if formatting repeatedly fails |
| Dependency failure | Upstream step fails; downstream blocked | Stop cascade; summarize blocker; attempt minimal fix with alternate agent | Escalate if fix requires human judgment |

## Test Scenarios

### Happy path

1. Input: `<describe request>`
2. Orchestrator decomposes → Agent A produces `<artifact>` → Agent B verifies/synthesizes → Output: `<final result>`

### Error flows

- **Timeout:** Agent A times out → retry with reduced scope → if still timing out, return partial result with an escalation note.
- **Cascade failure:** Agent A produces invalid output → do not run Agent B → request reformat/regeneration → only resume downstream when output is valid.

## Data Flow Diagram

```
Input
  ↓
[ Orchestrator ]
  ├─ dispatches to ─► [ Agent A ] ──→ artifact-A
  ├─ dispatches to ─► [ Agent B ] ──→ artifact-B
  └─ dispatches to ─► [ Agent C ] ──→ artifact-C
                              ↓
                      [ Synthesizer ]
                              ↓
                           Output
```

## Workflow

<!-- Replace this section: numbered steps, handoffs, and stop conditions -->

1. **Decompose** — break the request into independent sub-tasks
2. **Dispatch** — launch each sub-task via `task` tool or `/fleet`
3. **Monitor** — poll with `read_agent`; update SQL status per agent
4. **Synthesize** — merge results when all agents complete (or time out)
5. **Deliver** — return final output or escalate unresolved blockers

## Implementation

<!-- Replace this section: tool calls, prompt skeletons, and required outputs -->

```text
# Copilot CLI pseudocode
# --- task(...) and sql(...) are Copilot CLI tool calls, not PowerShell ---

# 1. Create tracking table
sql(description="init jobs", query="CREATE TABLE IF NOT EXISTS jobs (...)")

# 2. Dispatch agents (adapt agent_type and model for your use case)
task(agent_type="general-purpose", model="claude-sonnet-4.6", name="agent-a", prompt="...")
task(agent_type="code-review",     model="claude-sonnet-4.6", name="agent-b", prompt="...")

# 3. Poll completion
# read_agent / sql query to check status

# 4. Synthesize
task(agent_type="general-purpose", name="synthesizer", prompt="Merge: ...")
```

## See Also

- [Orchestration Patterns](../patterns/) — choose the right structural pattern first
- [team-planner skill](../../skills/copilot-exclusive/team-planner/SKILL.md) — if assembling a dynamic specialist team
- [skill-testing-guide](../../guides/skill-testing-guide.md) — validate trigger accuracy before shipping
