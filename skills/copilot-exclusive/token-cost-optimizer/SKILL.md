---
name: token-cost-optimizer
description: Use before a large Copilot task when model choice, context size, or parallelism could drive up billed usage — estimate cost pressure early and apply Copilot-specific reduction tactics before you run
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
  copilot_feature: "Copilot billing, model pricing, Auto model selection, /context, /compact, /fleet, autopilot"
---

# Token Cost Optimizer

Token Cost Optimizer is a proactive cost-control skill for GitHub Copilot. It helps you reduce
metered usage before and during a task by choosing the right model path, cutting unnecessary
context, and avoiding parallel work that burns credits without enough payoff.

## Why This is Copilot-Exclusive

GitHub Copilot now exposes cost-sensitive control surfaces that matter directly in the CLI:

- **Model pricing** for token-based usage across Copilot models
- **Premium request multipliers** that vary by model and feature surface

This skill focuses on Copilot-native levers such as `/model`, Auto model selection, `/compact`,
`/context`, autopilot, and `/fleet` rather than generic LLM budgeting advice.

## When to Use

- Before launching a large Copilot CLI task that may scan many files or run for a long time
- Before using `/fleet` or autonomous modes where model and context choices can multiply spend
- When you need to stay inside a budget or monthly AI credit allowance
- When you want to trade a small quality reduction for a large cost reduction on routine work

## When NOT to Use

| Instead of token-cost-optimizer | Use |
|---------------------------------|-----|
| You are auditing historical spend after the fact | `workflow/cost-audit` |
| The task is tiny and the model choice is obvious | do the task directly |
| You need to choose execution mode before cost strategy | `task-intake-router` |

## Cost Drivers

The main Copilot cost drivers are:

1. **Model selection** — more capable models generally cost more
2. **Context size** — wider scans and larger prompts increase token use
3. **Parallel agent count** — `/fleet` can multiply model interactions
4. **Autonomous depth** — long autopilot runs can continue consuming usage while you are not intervening

## Workflow

### 1. Estimate the task shape first

Ask:

- how many files must be read?
- does the work need a premium model?
- is the task truly parallelizable?
- can the context be narrowed before starting?

If the answer is unclear, reduce uncertainty first instead of paying for a large blind run.

### 2. Right-size the model

Use the cheapest path that still meets the task's quality bar.

| Task type | Preferred path |
|-----------|----------------|
| Search, routing, simple summaries | Fast / low-cost model |
| Normal implementation and planning | Standard model |
| Security, architecture, high-risk review | Premium model only when justified |
| Mixed or uncertain workload | Auto model selection |

**Auto** can still be useful here because it routes to a supported model without forcing you to
hand-pick one up front.

### 3. Cut context before you run

Use Copilot-native context controls to avoid paying for irrelevant history:

```text
/context
/compact
```

Good reduction moves:

- compact stale conversation history before a large new task
- narrow the repo surface before asking for implementation
- prefer targeted file reads over broad codebase scans
- split unrelated requests instead of bundling them into one giant prompt

### 4. Be selective with autopilot and fleet

`/fleet` and autopilot are powerful, but they can increase usage quickly when used on the wrong
task shape.

Use them when:

- the work is large enough that automation or parallelism clearly pays off
- subtasks are mostly independent
- the context is already constrained

Avoid them when:

- the task is mostly sequential
- you still need exploratory back-and-forth
- every subagent would need the same giant context

### 5. Set a cost-aware execution plan

Before a large run, write a short plan:

```text
Model path: Auto
Context strategy: compact first, then limit to docs/ and src/auth/
Execution mode: sequential until scope is clear, fleet only for independent test files
Stop rule: switch to manual review if the task expands beyond the approved surface
```

### 6. Review after the first expensive pass

After one substantial run, ask:

- did the chosen model clearly outperform a cheaper option?
- did the task need fleet, or would sequential execution have been enough?
- did context include too much unrelated history?

Use that answer to tune the next run instead of repeating the same expensive pattern.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Use the strongest model for everything." | Premium models should be reserved for tasks that truly need them. |
| "Fleet is always faster, so it is always better." | Parallelism can raise cost sharply when tasks are not independent. |
| "The full chat history might help." | Old context often adds cost faster than it adds quality. |

## Red Flags

- A premium model is being used for routing, search, or boilerplate generation
- `/fleet` is planned before the work is decomposed into mostly independent subtasks
- The current session contains a long, stale conversation and no `/compact` step
- The task brief does not explain why a premium model is necessary

## Verification

- [ ] The selected model tier matches the risk and complexity of the task
- [ ] Context was narrowed before large autonomous or parallel runs
- [ ] `/fleet` is only used where parallelism has a clear payoff
- [ ] Auto model selection is considered when the task mix is broad or uncertain

## See Also

- [`multi-model-strategy`](../multi-model-strategy/SKILL.md) — choose the right model path
- [`task-intake-router`](../task-intake-router/SKILL.md) — route to the right execution mode first
- [`fleet-parallel`](../fleet-parallel/SKILL.md) — parallelize only when dependency shape supports it
- [`cost-audit`](../../workflow/cost-audit/SKILL.md) — analyze spend after the workflow exists
