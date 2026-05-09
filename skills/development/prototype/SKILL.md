---
name: prototype
description: Use when a design question is still fuzzy — build a throwaway logic or UI prototype that answers one question fast, stays easy to run, and is meant to be deleted or absorbed.
metadata:
  category: development
  agent_type: general-purpose
  origin: adapted from mattpocock/skills prototype
---

# Prototype

A prototype is disposable code that answers a question faster than debate. Keep it close
to the real area, make it easy to run, and optimize for learning rather than polish.

## When to Use

- The user says "prototype this", "try a few designs", or "let me play with it"
- A state model or workflow is hard to reason about on paper
- You need several UI directions before picking one
- The fastest way to answer the question is to build a small runnable artifact

## When NOT to Use

| Instead of prototype | Use |
|----------------------|-----|
| You are building production-ready functionality | [`spec-driven-development`](../spec-driven-development/SKILL.md) |
| The main problem is root-cause analysis of broken code | [`diagnose`](../diagnose/SKILL.md) |
| You already know the design and need safe cleanup | [`refactor-clean`](../refactor-clean/SKILL.md) |

## Prerequisites

- A concrete question the prototype should answer
- A place near the target code where throwaway work can live temporarily
- One obvious command the user can run locally

## Workflow

### 1. Choose the branch

Decide which question you are answering:

- **Logic / state question** — build a tiny runnable terminal or script-based prototype
  that pushes the state machine through the tricky cases
- **UI question** — build several clearly different visual variants that can be switched
  from one route, page, or entry point

If the question is ambiguous and the user is unavailable, match the surrounding code and
state the assumption clearly at the top.

### 2. Mark it as throwaway from day one

Put the prototype near the feature it informs, but name it so nobody confuses it with
production code. Follow the project's existing routing or directory conventions instead
of inventing a brand-new top-level structure.

### 3. Make it runnable with one command

Use the project's existing runtime:

- `npm run prototype:checkout`
- `python src\feature\prototype.py`
- `go run .\cmd\prototype`

The user should not need a multi-step setup just to learn from the prototype.

### 4. Strip everything non-essential

Default rules:

- no persistence unless persistence itself is the question
- no tests unless the prototype is proving a test technique
- no extra abstractions
- only enough error handling to keep it runnable

### 5. Surface the state

After each action or branch change, print or render the relevant state so the user can
see what changed and why.

### 6. Capture the answer, then delete or absorb

The lasting artifact is the decision, not the prototype. When the question is answered:

1. capture the takeaway in an issue, ADR, commit note, or nearby `NOTES.md`
2. either delete the prototype or fold the validated idea into real code

## Examples

### Logic prototype

Create a tiny checkout state-machine runner that lets the user toggle events like
`apply-coupon`, `expire-session`, and `submit-order`, then prints the full state after
each step.

### UI prototype

Build three layout variants for the same page and expose a simple variant switcher so the
user can compare them quickly without branching the whole app.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Let's make the prototype production-ready just in case" | That turns learning code into premature product code. |
| "We should hide the ugly internal state" | The whole point is to make the decision surface obvious. |
| "We'll remember what we learned later" | If the answer is not captured, the same question returns next session. |

## Red Flags

- The prototype grows tests, persistence, and abstractions unrelated to the question
- Nobody can tell how to run it in one command
- The artifact stays in the repo after the decision is made, with no cleanup plan
- The prototype answers multiple unrelated questions at once

## Verification

- [ ] The prototype names the question it is answering
- [ ] One command runs it locally
- [ ] The relevant state or variant is visible after each interaction
- [ ] The resulting decision is captured somewhere durable before the prototype is kept or removed

## Tips

- Prototype the smallest slice that can disprove a bad design quickly
- Put a short "throwaway prototype" note in the file header or surrounding docs
- Follow with [`refactor-clean`](../refactor-clean/SKILL.md) if a successful prototype
  is later absorbed into production code
