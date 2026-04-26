---
name: knowledge-curator
description: Use when repeated lessons, pitfalls, or decisions should move from temporary session context into durable project guidance — curate what to keep, what to discard, and where it belongs.
metadata:
  category: copilot-exclusive
  copilot_feature: "session artifacts, /resume, session_store search, .github/copilot-instructions.md"
  origin: inspired by garrytan/gstack /learn
---

# Knowledge Curator

Not every useful insight belongs in a one-off chat. Knowledge Curator turns repeated lessons from
session history into maintainable project guidance so future sessions start from better defaults.

## Why This is Copilot-Exclusive

Copilot CLI gives you three building blocks that work well together:

- **Session artifacts** for saving structured notes during a task
- **`/resume`** for continuing a past session with its artifacts and SQL state
- **`session_store` search** for finding prior discussions and patterns later

The key constraint matters: `session_store` is **read-only historical memory**, not a writable
knowledge base. This skill is about deciding what should graduate from temporary session context
into durable project docs such as `.github/copilot-instructions.md`, `CONTRIBUTING.md`, or
reference guides.

## When to Use

- The same repo-specific warning or pattern keeps appearing across sessions
- A temporary workaround has become a stable team practice
- You want to prune stale guidance instead of accumulating contradictory notes
- A sprint or migration produced lessons worth promoting into project instructions

## When NOT to Use

| Instead of knowledge-curator | Use |
|------------------------------|-----|
| You only need to find something from a past session | `copilot-exclusive/cross-session-memory` |
| You need a first-pass backlog from external ecosystem research | `copilot-exclusive/ecosystem-intake` |
| You are documenting a single hard-to-reverse technical decision | `documentation/architecture-decisions` |

## Prerequisites

- A candidate insight worth keeping
- A target destination for that insight
- Enough evidence to tell whether it is stable, repeated, or obsolete

## Knowledge Layers

| Layer | Medium | Best for |
|-------|--------|----------|
| **Session** | session artifacts, SQL notes, current plan | In-progress findings, experiments, temporary context |
| **Historical** | `session_store` search + `/resume` | Looking up what happened in earlier sessions |
| **Durable** | `.github/copilot-instructions.md`, `CONTRIBUTING.md`, reference docs | Stable project rules, patterns, and team-facing guidance |

## Workflow

### 1. Capture candidate lessons during the task

When you notice a reusable pattern or pitfall, save it in the current session workspace instead of
burying it in scrollback:

```text
Save a short session note with:
- the pattern or pitfall
- where we saw it
- whether it is provisional or stable
```

Keep these notes short and concrete.

### 2. Review historical evidence

Search prior sessions before promoting anything:

```text
Search prior sessions for notes about flaky setup, markdown lint failures, or validation order.
Summarize the repeated findings before we decide what to keep.
```

Promotion is stronger when the same lesson shows up more than once.

### 3. Promote only durable guidance

Move proven guidance into the right permanent home:

- `.github/copilot-instructions.md` for broad repo-wide defaults
- `CONTRIBUTING.md` for contributor workflow expectations
- `guides/` or `references/` for richer explanations and examples

Example prompt:

```text
Promote the validated markdown workflow lessons into CONTRIBUTING.md.
Keep the wording short, actionable, and repository-specific.
```

### 4. Prune or rewrite stale guidance

Do not only add. Review for drift:

```text
Compare the current instructions against what recent sessions actually required.
List any stale, duplicated, or contradictory guidance before editing.
```

If a note is no longer true, remove or rewrite it instead of layering on exceptions.

### 5. Export a compact handoff when needed

At the end of a sprint or migration, create a concise handoff artifact:

```text
Create a short project-knowledge summary for this sprint:
- 5 lessons to keep
- 3 pitfalls to avoid next time
- 3 items that should remain temporary
```

Use that summary as review input before changing permanent instructions.

### 6. Sync durable artifacts across machines

When work moves between personal machines or between planning and implementation sessions,
sync the **durable output**, not the session database itself:

```text
Export the artifacts worth keeping:
- project instructions updates
- architecture notes
- migration checklists
- retro summaries
- reusable implementation review reports

Store them in a private repository or internal docs location after removing secrets or
machine-local details.
```

On the receiving machine:

1. pull the durable artifacts
2. load them as context for the new session
3. use `/resume` only for local session continuity, not as a cross-machine sync mechanism

`session_store` remains a read-only local history layer. Cross-machine continuity should
come from intentionally curated docs and artifacts, not from treating session memory as a
shared database.

## Promotion Heuristics

Promote an insight when it is:

- repeated across multiple tasks or sessions
- specific to this repository or workflow
- likely to change future execution quality
- stable enough that you want it applied by default

Keep it as session-only context when it is still experimental, one-off, or weakly supported.

## Related Skills

- [`cross-session-memory`](../cross-session-memory/SKILL.md) — search and resume prior sessions
- [`context-prime`](../context-prime/SKILL.md) — load durable project guidance at session start
- [`ecosystem-intake`](../ecosystem-intake/SKILL.md) — turn outside signals into adopt/adapt/reject candidates
- [`architecture-decisions`](../../documentation/architecture-decisions/SKILL.md) — record major technical decisions explicitly
