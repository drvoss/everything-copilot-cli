---
name: grill-me
description: Use when a plan still has hidden assumptions — default to one question at a time for dependent branches, batch only truly independent questions when it saves real round-trips, and keep stress-testing the plan until dependencies, risks, and decisions are explicit before implementation starts
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills grill-me
---

# Grill Me

Grill Me is a focused pre-implementation interrogation loop. Instead of brainstorming broadly, it
forces the plan through one concrete question at a time when branches are dependent, or through a
numbered batch when the open questions are independent, until the unknowns, dependencies, and
tradeoffs are visible.

Unlike `interview-me`, which is for gathering missing intent and can switch into an async
questionnaire, Grill Me is for pressure-testing a plan that already exists through decision-focused
dialogue.

## When to Use

- A plan sounds reasonable, but key assumptions have not been made explicit yet
- The user wants to stress-test a design, approach, rollout, or scope boundary before building
- You need to expose hidden dependencies and unresolved branches in the decision tree
- The next useful step is sharper questioning, not more implementation detail

## When NOT to Use

| Instead of grill-me | Use |
|---------------------|-----|
| You need multiple competing viewpoints on a decision | `council` |
| The plan must be checked against existing docs, glossary terms, or ADRs | `grill-with-docs` |
| The implementation already landed and now needs review against the original spec | `implementation-review` |

## Workflow

### 1. Pick the exact artifact to grill

Choose one target:

- a proposal
- a plan
- a spec
- a rollout idea

Do not grill an entire vague conversation. First compress the target into the thing that needs
pressure-testing.

### 2. Default to linear questioning; batch only independent branches

Choose the mode before each round:

- **Linear mode (default):** use when one answer changes what you should ask next. Ask one question
  at a time and fully resolve that branch before moving on.
- **Batch mode:** use only when several questions are mutually independent and the extra round-trip
  cost is high enough that asking them together will materially save time. Present the whole ready
  set in one numbered round, with one decision per question and a recommended answer attached to
  each.

Each question should force a concrete decision or expose a real gap:

- What assumption is this plan making?
- What happens if that assumption is false?
- What must be decided before the next step can start?

Do not batch dependent questions. When a frontier of independent questions is ready, ask that
frontier together; return to linear mode as soon as later questions depend on the answers.

### 3. Answer from evidence when possible

If the codebase, tests, docs, or current repo structure can answer a question, inspect them instead
of asking the user to guess.

If validating several independent questions needs repo or doc checks, do that fact-finding in
parallel when possible. Show the user the resulting decisions and recommendations, not the
investigation legwork.

Examples:

- existing config or schema already defines the boundary
- current tests already show the supported behavior
- another module already solves the same dependency

### 4. Recommend an answer with every question

Grill Me is not passive interviewing. Every question should include the recommended answer or the
most likely direction so the user can react to something concrete.

```markdown
## Question 4

**Question:** Should this stay a single issue or be split into a first thin slice plus follow-up hardening?
**Recommended answer:** Split it. The thin slice gives us a verifiable path and keeps the first change reviewable.
**Why:** The current scope crosses implementation, rollout, and docs at once.
```

### 5. Stop only when the decision tree is usable

A grilling session is done when:

- major branches have a chosen path
- blockers are explicit
- dependencies are visible
- the next implementation step is unambiguous

## Output Template

```markdown
## Grill Summary

### Resolved
- ...

### Open Questions
- ...

### Risky Assumptions
- ...

### Recommended Next Step
- ...
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "We can figure that out while building." | Hidden decisions get more expensive once code starts landing. |
| "The plan is simple enough already." | Simple plans still fail when scope, ownership, or rollout edges stay implicit. |
| "I just need validation." | Grill Me is for pressure, not reassurance. |

## Red Flags

- Questions keep circling because the target artifact is still vague
- Each answer creates two new unknowns with no narrowing
- The user keeps changing the goal instead of resolving the branch
- The session ends with "we'll decide later" on a core dependency

## Verification

- [ ] Each major branch was resolved or clearly marked as open
- [ ] Linear mode was used for dependent branches, and batch mode only for truly independent
      questions
- [ ] Evidence from the repo was used where available
- [ ] The output names the next implementation step or blocker

## See Also

- [`grill-with-docs`](../grill-with-docs/SKILL.md) — pressure-test the plan against existing documentation and ADRs
- [`outside-voice`](../outside-voice/SKILL.md) — get a blunt second opinion on the current framing
- [`council`](../council/SKILL.md) — use adversarial multi-voice deliberation when several credible paths remain
