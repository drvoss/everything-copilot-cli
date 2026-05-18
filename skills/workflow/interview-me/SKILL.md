---
name: interview-me
description: >
  Use when a request is underspecified and you need to discover what the user actually
  wants before writing a plan, spec, or code - ask one question at a time, attach your
  current hypothesis, and stop only after the intent is explicitly confirmed.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from addyosmani/agent-skills interview-me
---

# Interview Me

Interview Me is for intent discovery before work starts. It is the step before a spec,
plan, or implementation, when the user's first ask may still be a proxy for the real
goal.

## When to Use

- The request is missing who, why, success criteria, constraints, or non-goals
- The user asked for a conventional artifact ("build a dashboard", "make it faster")
  without saying what problem that artifact solves
- You notice yourself filling in assumptions before any plan exists
- The user explicitly asks to be interviewed, challenged, or stress-tested before starting

## When NOT to Use

| Instead of interview-me | Use |
|-------------------------|-----|
| The request is already clear and self-contained | do the task |
| A plan exists and now needs its assumptions pressure-tested | `grill-me` |
| The work is really about routing to the right Copilot execution mode | `task-intake-router` |
| The user asked a factual or explanatory question | answer directly |

## Loading Constraint

This skill needs a live user. Do not invoke it in non-interactive contexts where no one
can answer the questions.

## Workflow

### 1. State your hypothesis and confidence

Before asking anything, write down:

- your best current read of what the user wants
- a confidence number from 0 to 100

If the number feels high but you cannot predict the next few answers, the number is too high.

### 2. Ask one question at a time

Every question should include:

- one focused question
- your current guess for the answer
- the reasoning behind that guess

Do not batch several questions. The later questions depend on the earlier answers.

### 3. Listen for "want" vs "should want"

Probe when the user answers with:

- best-practice slogans
- vague quality words like "scalable" or "robust"
- conventional artifacts instead of outcomes

Useful probe:

> If you did not have to justify this to anyone, what would you actually want?

### 4. Restate the intent in a structured form

When confidence is high enough, write back:

- Outcome
- User
- Why now
- Success
- Constraint
- Out of scope

Out of scope is required. Many mismatches hide there.

### 5. Get an explicit yes

These do **not** count as confirmation:

- "whatever you think"
- "sounds good"
- silence followed by "let's start"

Keep refining until the user explicitly confirms the restated intent.

### 6. Stop when the intent is predictable

You are done when you can reasonably predict the user's reaction to the next few
questions you would ask.

Then hand off to the next skill:

- `create-prd` if the intent needs a product spec
- `grill-me` if a plan now exists but needs stress-testing
- direct implementation if the ask is now clear and bounded

## Output Template

```markdown
## Confirmed Intent

- Outcome: ...
- User: ...
- Why now: ...
- Success: ...
- Constraint: ...
- Out of scope: ...

Confirmed by user: Yes
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The ask is clear enough." | If you still need to guess the outcome, it is not clear enough. |
| "Questions will slow things down." | Building the wrong thing costs far more than 3 to 6 targeted questions. |
| "I'll discover the real goal while implementing." | That turns cheap clarification into expensive rework. |

## Red Flags

- Three or more questions in one message
- Questions without your current guess attached
- Producing a plan or spec before confirmation
- Skipping the out-of-scope line in the restatement

## Verification

- [ ] The first turn included a hypothesis and confidence number
- [ ] Questions were asked one at a time
- [ ] At least one probe tested for "want" vs "should want" when needed
- [ ] The restated intent included outcome, user, why now, success, constraint, and out of scope
- [ ] The user explicitly confirmed the restatement

## See Also

- [`grill-me`](../grill-me/SKILL.md) - pressure-test a plan that already exists
- [`task-intake-router`](../../copilot-exclusive/task-intake-router/SKILL.md) - route work to the right Copilot execution mode
- [`create-prd`](../../product/create-prd/SKILL.md) - turn confirmed intent into a product requirements document
