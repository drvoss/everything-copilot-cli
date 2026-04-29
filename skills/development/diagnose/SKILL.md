---
name: diagnose
description: Use when a bug or performance issue is still fuzzy — build the fastest feedback loop first, rank the leading hypotheses, and instrument only what narrows the search
metadata:
  category: development
  agent_type: general-purpose
  origin: adapted from mattpocock/skills diagnose
---

# Diagnose

Diagnose is for problems that are still poorly shaped. Before deep debugging, build the smallest
feedback loop that proves whether each change helps or hurts. A fast loop usually does more for bug
finding than another round of guesswork.

## When to Use

- The symptom is real, but the shortest reliable repro is still unclear
- A bug, regression, or performance issue needs a faster test loop before fixing
- Multiple causes seem plausible and you need to rank them instead of chasing all of them
- The system is large enough that targeted instrumentation beats broad logging

## When NOT to Use

| Instead of diagnose | Use |
|---------------------|-----|
| You already have a stable repro and need root-cause discipline | `systematic-debugging` |
| The failure is a compiler, type, or dependency error | `fix-build-errors` |
| The issue is security-sensitive | `security-scan` or `pr-security-review` |

## The 6-Step Loop

### 1. Build the feedback loop first

Create the fastest signal that tells you whether you are closer to the answer:

- a narrow failing test
- a single command that reproduces the symptom
- a benchmark or script with stable inputs

If a proposed fix does not improve that loop, it is too early to trust it.

### 2. Reproduce

Capture the exact symptom, input, and environment. Shrink it until it is cheap to rerun.

### 3. Rank 3-5 hypotheses

Do not hold one vague hunch in your head. Write a short ranked list:

1. most likely
2. plausible alternative
3. annoying edge case

Then test them in order, demoting the ones the evidence weakens.

### 4. Instrument narrowly

Add only the probes needed to separate the top hypotheses. Prefer:

- one focused log or metric
- one temporary assertion
- one small trace around the suspect boundary

Avoid "log everything" unless you have no tighter cut.

### 5. Fix and add the regression check

Once one hypothesis is confirmed, make the smallest durable fix and lock it in with the same
feedback loop that exposed it.

### 6. Clean up and record the root cause

Remove temporary probes and write down:

- what the real failure was
- which signal exposed it
- what regression check now protects it

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll know the bug when I see it." | Without a loop, every change feels equally plausible. |
| "I need more logs everywhere." | Untargeted logs create noise faster than clarity. |
| "I only have one theory." | Rank multiple hypotheses so the next test actually rules something out. |

## Red Flags

- The repro still depends on manual luck
- You are editing code before defining the loop that will prove the fix
- Logs keep growing, but no hypothesis gets ruled out
- You cannot explain why hypothesis #1 beats hypothesis #2

## Verification

- [ ] The feedback loop is fast enough to run repeatedly
- [ ] 3-5 concrete hypotheses were ranked
- [ ] Instrumentation was targeted, not broad and permanent
- [ ] The final fix is covered by a regression check

## See Also

- [`systematic-debugging`](../systematic-debugging/SKILL.md) — deeper 4-phase root-cause workflow once the loop exists
- [`performance-optimization`](../performance-optimization/SKILL.md) — measurement-driven performance work
- [`tdd-workflow`](../tdd-workflow/SKILL.md) — turn the repro into a durable failing test
