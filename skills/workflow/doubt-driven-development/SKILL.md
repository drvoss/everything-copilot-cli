---
name: doubt-driven-development
description: >
  Use when a non-trivial decision should not stand without a fresh-context challenge -
  isolate the artifact and contract, run an adversarial review before committing, and
  reconcile the findings while change is still cheap.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from addyosmani/agent-skills doubt-driven-development
---

# Doubt-Driven Development

Doubt-Driven Development is an in-flight challenge loop for non-trivial decisions.

It is not a final code review and not a broad debate between many paths. It is a
targeted attempt to disprove the current decision while the cost of changing course is
still low.

## When to Use

Apply this skill when the decision:

- changes branching logic or invariants
- crosses a module or service boundary
- asserts a property the compiler will not prove for you
- has irreversible or expensive blast radius
- depends on context that a future reader will not automatically see

Examples:

- "this caching layer is safe under concurrency"
- "this migration is reversible enough"
- "this module boundary is the right one"

## When NOT to Use

| Instead of doubt-driven-development | Use |
|-------------------------------------|-----|
| Choosing among several credible strategies | `council` |
| Getting a general second opinion before or after implementation | `outside-voice` |
| Proving a task is done with fresh command output | `verification-before-completion` |
| Mechanical edits like renames, formatting, or file moves | do the task |

## Workflow

### 1. CLAIM - state what is standing

Write the current claim in one or two lines, plus why it matters.

Example:

```text
Claim: the new retry logic is idempotent under duplicate delivery.
Why it matters: if this is wrong, users can be double-charged.
```

If you cannot state the claim clearly, you do not have a reviewable decision yet.

### 2. EXTRACT - isolate the smallest reviewable unit

Prepare only:

- the artifact under review
- the contract it must satisfy

Do **not** include your whole reasoning trail. Handing the reviewer your conclusion
biases the result.

### 3. DOUBT - run an adversarial review

Use a fresh context if possible:

- another agent
- another model
- another reviewer pass with only artifact plus contract

Frame the prompt adversarially:

```text
Find what is wrong with this artifact.
Assume the author is overconfident.
Look for hidden assumptions, broken contracts, edge cases, and failure modes.
Do not validate the decision. Surface issues.
```

### 4. Optionally offer a cross-model second opinion

If the session is interactive and another CLI or model is available, explicitly offer a
second opinion before reconciling. Do not silently skip the option.

If the context is non-interactive, say that cross-model review was skipped.

### 5. RECONCILE - classify every finding

For each finding, classify it as one of:

1. contract misread
2. valid and actionable
3. valid tradeoff
4. noise

Re-read the artifact before deciding. Reviewer output is input, not verdict.

Keep a typed evidence graph while reconciling:

- label evidence edges `supports`, `contradicts`, `qualifies`, or `missing`
- preserve contradictory evidence instead of smoothing it away in prose
- represent uncertainty with an `unknown` node that names what is missing, rather than an
  unsupported confidence percentage

`qualifies` is especially important: evidence may support a claim only under stated conditions.

### 6. STOP - keep the loop bounded

Stop when:

- only trivial or already-addressed findings remain
- three cycles have completed
- the user explicitly accepts the tradeoff and wants to ship

If major issues remain after three cycles, escalate instead of looping forever.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'm already confident." | Confidence is exactly when blind spots are easiest to miss. |
| "I'll just review it at the end." | Late review catches problems when the cost of change is highest. |
| "The reviewer disagreed, so I must be wrong." | Fresh review is signal, not automatic verdict. Reconcile it. |

## Red Flags

- Passing the claim itself to the reviewer instead of only artifact and contract
- Asking "is this good?" instead of "find what is wrong"
- Re-running the same unchanged artifact without new evidence
- Treating reviewer output as authoritative without re-reading the artifact

## Verification

- [ ] A concrete claim was stated before the review
- [ ] The reviewer received artifact plus contract, not the whole reasoning chain
- [ ] The review prompt was adversarial, not validating
- [ ] Findings were classified before acting on them
- [ ] The loop stopped because a real stop condition was met

## See Also

- [`council`](../council/SKILL.md) - multi-path adversarial deliberation
- [`outside-voice`](../outside-voice/SKILL.md) - broader second-opinion challenge, consult, or review
- [`verification-before-completion`](../verification-before-completion/SKILL.md) - prove the final claim with live evidence
