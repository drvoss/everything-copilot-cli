---
name: task-intake-router
description: Use when a request arrives and the right execution path is unclear — routes the work to the correct mode, agent type, model tier, and delegation pattern before implementation starts.
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
  copilot_feature: "Plan Mode, Autopilot, task tool, /fleet, background agents, per-agent model override"
---

# Task Intake Router

Copilot CLI gives you multiple execution paths: interactive mode, Plan Mode, Autopilot,
`task` agents, `/fleet`, background delegation, and per-agent model selection.
This skill turns an incoming request into an explicit routing decision so you do not
default to the wrong mode out of habit.

## Why This is Copilot-Exclusive

The value is not generic triage. The value is mapping work onto **Copilot CLI primitives**
that can be combined in one session:

- **Plan Mode** for structured decomposition
- **Autopilot** for execution after approval
- **`task` agents** for typed delegation (`explore`, `task`, `general-purpose`, `code-review`)
- **`/fleet`** for parallel fan-out
- **Background delegation** for cloud execution and draft PR creation
- **Per-agent model overrides** for cost/quality optimization

## When to Use

- A new request arrives and it is unclear whether to answer, plan, implement, review, or delegate
- The task could be handled in several ways and you want the highest-leverage path
- You need to decide between local execution, `/fleet`, or cloud background delegation
- You want an explicit model plan before spending premium tokens on the wrong step

## When NOT to Use

| Instead of task-intake-router | Use |
|-------------------------------|-----|
| A tiny request with an obvious next step | Do the work directly |
| Deep implementation after routing is already agreed | The routed skill or workflow |
| Technology detection for repository onboarding | `stack-detector` |

## Routing Dimensions

Every request should be classified on five dimensions:

1. **Intent** — explain, investigate, implement, review, or operate
2. **Scope** — one file, many files, or cross-cutting
3. **Dependency shape** — sequential or parallelizable
4. **Risk** — low, medium, or high consequence if wrong
5. **Runtime fit** — local-only, GitHub-native, or cloud-friendly

## Core Routing Matrix

| Situation | Route | Why |
|-----------|-------|-----|
| User is asking for understanding only | Interactive answer or `explore` agent | No file changes needed |
| Multi-file feature with unknown scope | Plan Mode → Autopilot | Clarify before editing |
| Many independent subtasks | `/fleet` or multiple background agents | Parallelism pays off |
| Build/test/lint failure | `task` agent of type `task` | Fast execution, low-context output |
| Security-sensitive review | `code-review` agent + premium model | Higher reasoning quality for high-risk analysis |
| Long-running implementation you do not need locally | Background delegation (`&` or `/delegate`) | GitHub draft PR becomes the output |
| Runtime rollout / post-ship observation | `deployment-canary` | Shipping is not the end of the workflow |

## Workflow

### 1. Classify the Request

Use a short intake prompt:

```text
> Route this request before acting:
> - Goal
> - Scope
> - Risk
> - Parallelizable? yes/no
> - Best Copilot CLI mode
> - Best agent type
> - Recommended model
```

Aim for a routing output like:

```text
Mode: Plan Mode
Agent type: general-purpose
Model: gpt-5.3-codex
Parallelism: none until scope is confirmed
Reason: multi-file implementation with ambiguous boundaries
```

### 2. Pick the Execution Mode

| If the work looks like... | Use |
|---------------------------|-----|
| open-ended analysis | interactive mode or `explore` |
| multi-step implementation with ambiguity | Plan Mode |
| well-bounded execution after plan approval | Autopilot |
| independent batch work | `/fleet` |
| heavy local command execution | `task` or PowerShell |
| work best reviewed on GitHub | background delegation |

### 3. Pick the Agent Type

| Goal | Agent type |
|------|------------|
| Search, inspect, understand | `explore` |
| Run builds, tests, installers | `task` |
| Implement or refactor | `general-purpose` |
| Review correctness or security | `code-review` |

If one task needs multiple types, split it:

1. `explore` for discovery
2. `general-purpose` for implementation
3. `code-review` for a quality gate

### 4. Pick the Model Tier

Use `multi-model-strategy` for detailed guidance, but the default routing rule is:

| Task profile | Model suggestion |
|-------------|------------------|
| broad exploration, low stakes | `claude-haiku-4.5` or `gpt-5-mini` |
| implementation, code transformation | `gpt-5.3-codex` |
| balanced planning or synthesis | `gpt-5.4` or `claude-sonnet-4.6` |
| security, architecture, high-risk review | `claude-opus-4.7` or `gpt-5.4` |

Use model **pairs** when that reduces risk:

- **Implementer**: `gpt-5.3-codex`
- **Reviewer**: `claude-sonnet-4.6` or `gpt-5.4`

### 5. Decide Whether to Fan Out

Ask two questions:

1. Can subtasks be assigned clear file or domain ownership?
2. Would two agents need to edit the same files?

If the answer to the second question is yes, do **not** fan out yet.

Good fleet candidates:

- one test file per module
- one review lens per concern
- one migration unit per directory

Bad fleet candidates:

- a tightly coupled refactor in the same files
- a debugging task with unknown blast radius
- anything waiting on a still-unclear design choice

### 6. Store the Decision in SQL

For larger sessions, make the route explicit:

```sql
CREATE TABLE IF NOT EXISTS intake_routes (
  id TEXT PRIMARY KEY,
  request_summary TEXT NOT NULL,
  mode TEXT NOT NULL,
  agent_type TEXT,
  model TEXT,
  parallelism TEXT,
  next_skill TEXT,
  rationale TEXT
);

INSERT INTO intake_routes (
  id, request_summary, mode, agent_type, model, parallelism, next_skill, rationale
) VALUES (
  'route-auth-refactor',
  'Refactor auth flows across API, tests, and docs',
  'plan-mode',
  'general-purpose',
  'gpt-5.3-codex',
  'sequential-then-fleet',
  'sprint-workflow',
  'Multi-file change with early ambiguity, then parallelizable test/doc work'
);
```

### 7. Hand Off Cleanly

A routing decision is only useful if it hands off to a concrete next move:

- **Plan Mode** → create or approve the plan
- **Autopilot** → execute the approved plan
- **`task` agent** → launch the right typed agent
- **`/fleet`** → define task boundaries and ownership
- **Background delegation** → prepare the prompt for a draft PR workflow

## Examples

### Example 1: Ambiguous Feature Request

```text
Request: "Add rate limiting to our API"

Route:
- Mode: Plan Mode
- Agent type: general-purpose
- Model: gpt-5.3-codex
- Next skill: sprint-workflow
- Why: cross-cutting change with design choices and test requirements
```

### Example 2: Large Batch of Independent Docs

```text
Request: "Add JSDoc to all exports in src/utils/"

Route:
- Mode: /fleet
- Agent type: general-purpose
- Model: gpt-5-mini
- Next skill: fleet-parallel
- Why: many independent files with low coupling
```

### Example 3: Security Review of a Risky PR

```text
Request: "Review this auth PR before merge"

Route:
- Mode: task delegation
- Agent type: code-review
- Model: claude-opus-4.7
- Next skill: pr-multi-perspective-review
- Why: high-risk review deserves a specialized pass
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll just start coding and figure it out later" | That is routing by impulse. Ambiguous multi-file work gets cheaper once you classify it first. |
| "Everything should go through autopilot" | Autopilot is an execution mode, not a substitute for scoping. |
| "Fleet is always faster" | Parallelism only helps when the tasks are truly independent. |
| "Use the biggest model for everything" | High-cost models are wasted on simple exploration and command execution. |

## Red Flags

- The request changes multiple systems but has no explicit route
- A high-risk task is being handled with the cheapest possible model by default
- `/fleet` is chosen before ownership boundaries are defined
- A cloud delegation is started even though local context or uncommitted state matters
- Routing output says "we'll decide as we go"

## Verification

- [ ] The request has an explicit mode, agent type, and model choice
- [ ] The chosen route matches the task's dependency shape
- [ ] High-risk work includes a stronger review path than low-risk work
- [ ] Any fan-out plan names file or domain boundaries
- [ ] The route points to a concrete next skill or action

## Tips

- **Route before you execute**: 30 seconds of intake can save hours of rework
- **Split hybrid work**: one route for discovery, another for implementation, another for review
- **Prefer clear handoffs**: every route should name the next skill, mode, or agent
- **Re-route if the facts change**: new complexity means the original route may no longer fit

## See Also

- [`multi-model-strategy`](../multi-model-strategy/SKILL.md) — choose the right model once the route is known
- [`team-planner`](../team-planner/SKILL.md) — design specialist teams for large multi-domain work
- [`background-agent`](../background-agent/SKILL.md) — delegate long-running GitHub-side work
- [`fleet-parallel`](../fleet-parallel/SKILL.md) — parallel execution once ownership is clear
- [`sprint-workflow`](../../workflow/sprint-workflow/SKILL.md) — end-to-end feature delivery after routing
