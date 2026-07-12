---
name: wayfinder
description: Use when a task is too large or ambiguous to finish in one session — build a destination-centric plan with a breadth-first triage pass, an explicit Deferred/out-of-scope section, and a confirmation gate before implementation starts
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills wayfinder
---

# Wayfinder

Wayfinder turns a vague, multi-session task into a plan organized around the **destination** —
the end state you are navigating toward — rather than a flat list of steps. It exists for work
that cannot be scoped and finished inside a single session: large migrations, cross-cutting
features, or ambiguous initiatives where the first hour is spent figuring out what "done" even
means.

## When to Use

- The task is too large, ambiguous, or long-running to complete in one session
- You need a shared map that multiple sessions, agents, or people can navigate from
- Early exploration keeps surfacing tangents that are real but not part of this pass
- You need a plan that survives a context reset without losing track of what was deliberately
  skipped

## When NOT to Use

| Instead of wayfinder | Use |
|-----------------------|-----|
| A plan, spec, or PRD already exists and just needs to become tickets | `to-issues` |
| The work fits in Plan Mode's single-pass plan.md and one session | `plan-mode-mastery` |
| You need multi-source evidence gathering before deciding anything | `deep-research` |
| The task is already small enough to execute directly | do the task |

Wayfinder produces the destination-centric map; `to-issues` slices an approved plan into
dependency-aware tickets; `deep-research` gathers evidence to inform a decision. Chain them in that
order when a large initiative needs all three.

## Workflow

### 1. Name the destination

Write the end state in outcome language, not task language:

```text
Destination: [what the world looks like when this is done]
Not the destination: [adjacent goals this pass explicitly does not include]
```

A destination is a state, not a checklist. "Auth is fully migrated to the new session store" is a
destination. "Update 12 files" is not.

### 2. Breadth-first triage

Before going deep on any single area, sweep the whole territory once:

1. List every area that plausibly touches the destination
2. For each area, spend just enough time to classify it — do not solve anything yet
3. Sort each area into one of three buckets:
   - **In scope** — required to reach the destination this pass
   - **Fog** — unknown enough that it needs its own investigation before it can be scoped
   - **Deferred / out of scope** — real, but explicitly not part of this destination

Only after the full breadth-first pass is complete should any area get depth-first investigation.
Going deep on the first area you find is how large plans quietly narrow to whatever was
convenient to start with.

### 3. Write the Deferred section explicitly

Do not let out-of-scope discoveries disappear. Record them so a future pass — or a different
session — can pick them up without rediscovering them:

```markdown
## Deferred

- [item] — why it's out of scope for this destination, and what would trigger picking it up
```

An item that is merely unaddressed is not the same as an item that was deliberately deferred.
Only the second kind belongs here.

### 4. Confirmation gate

Before any implementation starts, present the destination, the in-scope/fog/deferred split, and
ask for explicit confirmation. Do not begin execution on an unconfirmed map — fog items in
particular need a decision (investigate now vs. defer) before they can be scoped into or out of
the plan.

### 5. Self-grill the plan

Before treating the plan as final, challenge it once from an adversarial angle:

- What would make this destination wrong or premature?
- Which "in scope" item is actually fog wearing a confident label?
- What Deferred item is likely to block the destination anyway?

Fold the answers back into the plan rather than leaving them as a detached appendix.

## Output Template

```markdown
## Wayfinder Plan: [Destination Name]

**Destination**: [end state, in outcome language]
**Not the destination**: [adjacent goals excluded from this pass]

### In Scope
- [area] — [why it's required for the destination]

### Fog
- [area] — [what's unknown, what investigation would resolve it]

### Deferred
- [item] — [why excluded now, what would trigger revisiting it]

### Confirmation
- [ ] Destination confirmed
- [ ] Fog items have an investigate-now-vs-defer decision
- [ ] Ready to move to ticketing (`to-issues`) or direct execution
```

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "I'll just start with the area I understand best." | Depth-first-first narrows the plan to whatever was convenient, hiding fog elsewhere. |
| "This tangent is small, I'll just fix it now." | Undocumented scope creep is how a destination-centric plan turns into an unbounded one. |
| "The destination is obvious, no need to write it down." | If it's not written as an outcome, it will silently drift toward a task list. |

## Red Flags

- No explicit Deferred section — tangents were either done anyway or silently dropped
- Implementation started before the destination and fog/in-scope split were confirmed
- "Fog" areas that were never actually investigated before being called in-scope
- The plan reads as a flat task list instead of being organized around the destination

## Verification

- [ ] The destination is written as an outcome, not a task list
- [ ] Every area went through breadth-first triage before any depth-first work began
- [ ] Deferred items are recorded with a reason and a trigger for revisiting
- [ ] The user confirmed the plan before implementation started

## See Also

- [`to-issues`](../to-issues/SKILL.md) — slice an approved plan into dependency-aware tickets
- [`deep-research`](../deep-research/SKILL.md) — gather evidence to resolve fog before scoping it
- [`plan-mode-mastery`](../../copilot-exclusive/plan-mode-mastery/SKILL.md) — single-session plan.md workflow for smaller-scoped work
