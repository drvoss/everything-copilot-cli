---
name: context-engineering
description: Use when designing prompts or agent tasks to optimize information delivery — minimize noise, maximize signal for AI agents
metadata:
  category: development
  agent_type: general-purpose
---

# Context Engineering

## When to Use

- Delegating a complex task to an AI agent
- An agent keeps repeating the wrong approach
- Agent quality drops as the context grows longer
- Designing a pipeline where multiple agents collaborate

> Difference from `context-prime` (Copilot-specific):
>
> - `context-prime`: loads live project context at session start
> - `context-engineering`: structures the best possible information for a specific task

## Prerequisites

- The delegated task has a clear goal and scope
- You know the relevant files or domain area

## Workflow

### 1. Analyze signal vs. noise

Classify the information you plan to give the agent:

| Information type | Include? | Why |
|------------------|----------|-----|
| Directly relevant code files | ✅ Yes | The agent must edit or reason about them |
| Interface/type definitions | ✅ Yes | Essential for understanding contracts |
| Unrelated files | ❌ No | Waste tokens and reduce focus |
| Entire README | ❌ No (summarize instead) | Low information density for the size |
| Information the agent already has | ❌ No | Duplicate token cost |

### 2. Progressive Disclosure

Do not provide everything at once. Reveal only what each phase needs:

```text
Phase 1: Task definition + interface contract
Phase 2: Implementation starts -> add relevant files
Phase 3: Testing -> add test patterns and references
```

### 3. Use a structured context template

Use this shape when instructing an agent:

```text
## Task
[one clear objective]

## Given (what is already known)
- [file path]: [role]
- [interface contract]

## Constraints (what must not happen)
- [prohibited action]
- [files that must not be changed]

## Done When
- [ ] [specific, testable criterion]
```

### 4. Manage the context-window budget

Use context size intentionally. For exact model choice, see `multi-model-strategy`:

| Task complexity | Context size | Example |
|-----------------|-------------|---------|
| Short task (fast response first) | 2-3 files, clear goal | small bug fix, type addition |
| Medium task (balanced) | 5-10 files, interface contract | new API endpoint, component addition |
| Long task (deep reasoning first) | 10-20 files, module-level context | architecture refactor, complex bug |

### 5. Run a result-verification loop

If the agent output is off-target:

1. Find ambiguity in the supplied context
2. Add explicit constraints
3. Make the "Done When" criteria more concrete
4. Repeat and rerun the agent

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "More context is always better" | Irrelevant information distracts the agent. Signal-to-noise ratio matters more than volume. |
| "I'll just give the whole codebase" | That wastes tokens and often lowers agent quality. Include only the files that matter. |
| "Natural language is enough; the agent will figure it out" | Without explicit completion criteria, the agent does not know where to stop. |

## Red Flags

- The agent repeats the same mistake
- The response drifts far from the actual request
- The task prompt has no "Done When" criteria
- You pasted the entire README or whole directories into context

## Verification

- [ ] The task prompt contains one clear objective
- [ ] Unrelated files were excluded from context
- [ ] Completion criteria are explicit and testable
- [ ] The agent output satisfies the stated completion criteria

## Examples

### Before (bad)

```text
"Look through the project, find a bug, and fix it."
```

### After (good)

```text
## Task
Fix the JWT expiry-validation bug in `src/auth/token.ts`.

## Given
- `src/auth/token.ts`: target file to change
- `src/auth/token.test.ts`: existing tests
- Bug: the `exp` claim is a Unix timestamp, but the code compares it as milliseconds

## Constraints
- Do not modify files outside `src/auth/`
- Do not change existing function signatures

## Done When
- [ ] All existing tests pass
- [ ] The `exp` comparison uses seconds
- [ ] New edge-case tests cover just-before and just-after expiry
```

## Tips

- Pair this with `spec-driven-development`: a good spec becomes a reusable context template
- Use `multi-model-strategy` to pick a model that matches task complexity
- If the agent misses twice in a row, revisit the context structure instead of only rewording the ask

## Advanced Techniques

### Full-Repo Context Loading with rendergit

[rendergit](https://github.com/karpathy/rendergit) renders an entire Git repository
into a browser-based HTML view with an LLM-friendly text export. Useful when you need
the AI to understand the whole codebase at once (e.g., cross-cutting refactors, architecture analysis).

```powershell
# Install (Python required)
pip install git+https://github.com/karpathy/rendergit

# Open browser view of the entire repo
rendergit .
# In the browser, switch to "LLM View" to copy the CXML-formatted codebase text.
# Paste into your session context or save to a file to attach as context.
```

**When to use rendergit:**

- Architecture analysis requiring understanding of all modules
- Finding all usages of a pattern across the entire codebase
- Onboarding a new AI agent to a large, unfamiliar project

**When NOT to use:**

- Single-file tasks (wasteful — just include the relevant files)
- Repos > 200k tokens (exceeds most model limits; use selective inclusion instead)

### KV-Cache Optimization

LLMs recompute the KV-cache for every token in context. For repeated agent invocations
on the same context (e.g., analyzing multiple files with the same system prompt),
cache-aware context structuring reduces cost significantly.

**Principle:** Place stable content (system prompt, shared context) **before** variable
content (the specific task or file). This enables KV-cache reuse.

```text
✅ Cache-friendly structure (stable content first):
[System prompt + project rules]           ← cached across requests
[Shared context: types, interfaces]       ← cached if unchanged
[Variable: specific file to analyze]      ← changes per request

❌ Cache-unfriendly structure (variable content first):
[Variable: today's date, run ID]          ← busts cache on every call
[System prompt]
[Context]
```

**Practical application in agent instructions:**

```text
## Context (stable — appears in every call)
Project: everything-copilot-cli
Rules: follow existing SKILL.md conventions
Output format: Markdown with frontmatter

## Task (variable — changes per call)
Analyze: skills/development/tdd-workflow/SKILL.md
Find: missing edge cases in the Verification checklist
```

**Token budget estimation:**

| Context type | Typical size | Cache reuse potential |
|-------------|-------------|----------------------|
| System prompt | 500-2000 tokens | High (same across session) |
| Project conventions | 1000-5000 tokens | High |
| Specific file to analyze | 500-3000 tokens | Low (changes per task) |
| Task instruction | 100-500 tokens | Low |

For multi-model pipelines with the same shared context, pass context by reference
(file path + MCP `view` tool) rather than inline copy-pasting.

### Latent Briefing

When work spans multiple agent turns or session boundaries, preserve only the durable
state the next agent actually needs. Treat the handoff as a compact briefing, not a
full transcript dump.

**Pattern:**

1. Capture findings, decisions, and open questions at the end of an agent step
2. Store them in a durable medium the next step can actually read (`sql`, task notes,
   or a checked-in doc when appropriate)
3. Inject only that briefing into the next agent's context, then add fresh task-specific
   files or constraints

**When to use:**

| Scenario | Use latent briefing? |
|----------|----------------------|
| Parallel agents analyze different subsystems, then a synthesizer combines the results | ✅ Yes |
| A later session resumes a partially completed task | ✅ Yes |
| One agent keeps iterating inside the same short-lived context window | ❌ No — keep the live context focused instead |

**Briefing shape (minimal):**

```text
Task: [current objective]
Done so far:
- [finding]
- [decision]

Open questions:
- [question]

Next constraints:
- [what must not change]
```

For Copilot CLI specifically, pair this with
[`cross-session-memory`](../../copilot-exclusive/cross-session-memory/SKILL.md) when
the handoff must survive across sessions rather than just across turns.
