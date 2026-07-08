---
name: receiving-code-review
description: Use when you have just received code review feedback (human or agent) and are about to act on it — verify each item against the codebase before implementing, and push back with technical reasoning instead of performative agreement
metadata:
  category: development
  agent_type: general-purpose
  origin: adapted from obra/superpowers receiving-code-review
---

# Receiving Code Review

Receiving code review requires technical evaluation, not emotional performance. This skill governs
what happens **between** getting feedback and typing the first edit — not how to produce a review.

**Core principle:** Verify before implementing. Ask before assuming. Technical correctness over
social comfort.

## When to Use

- You just received review comments (from a human, `code-review`, `review`, or
  `pr-multi-perspective-review`) and are about to act on them
- Feedback includes multiple items and some are unclear or only partially understood
- A suggestion seems plausible but you have not yet checked it against this codebase
- You pushed back earlier and now have evidence the reviewer was actually right

## When NOT to Use

| Instead of receiving-code-review | Use |
|-----------------------------------|-----|
| You are producing the review, not receiving it | `code-review`, `review`, or `pr-multi-perspective-review` |
| You are checking a delegated implementation against a task spec after it landed | `implementation-review` |
| Feedback is already fully verified and unambiguous | Just implement it — this skill governs the reception gap, not every edit |

## The Response Pattern

```text
1. READ: read the complete feedback without reacting or starting to type a fix
2. UNDERSTAND: restate each requirement in your own words, or ask
3. VERIFY: check the claim against the actual codebase (grep, view, run tests)
4. EVALUATE: is this technically sound for THIS codebase, not codebases in general?
5. RESPOND: technical acknowledgment or reasoned pushback — never gratitude theater
6. IMPLEMENT: one item at a time, testing each before moving to the next
```

## Forbidden Responses

**Never open with:**

- "You're absolutely right!"
- "Great point!" / "Excellent feedback!"
- Any gratitude expression ("Thanks for catching that")
- "Let me implement that now" — before verification has actually happened

**Instead:**

- Restate the technical requirement
- Ask a specific clarifying question
- Push back with technical reasoning if the suggestion is wrong for this codebase
- Just do the work — the diff is the acknowledgment

If you catch yourself about to write "Thanks" or "You're right" before checking anything,
delete it and state the verified fix instead.

## Handling Unclear or Partial Feedback

```text
IF any item in a multi-item review is unclear:
    STOP — do not implement any of the items yet
    ASK for clarification on the unclear items specifically
```

Items in a review batch are often related. Implementing the clear items while silently guessing
at the unclear ones produces a partially-wrong result that looks complete.

**Example:**

> Reviewer: "Fix items 1–6."
> You understand 1, 2, 3, 6. Items 4 and 5 are ambiguous.

| Wrong | Right |
|-------|-------|
| Implement 1, 2, 3, 6 now; ask about 4, 5 later | "I understand items 1, 2, 3, and 6. I need clarification on 4 and 5 before proceeding — [specific question]." |

## Verification Before Implementation

Before implementing any single suggestion, check:

1. Is this technically correct for **this** codebase (not codebases in general)?
2. Does it break existing, tested functionality?
3. Is there a reason the current implementation looks the way it does (check git blame / commit
   message / adjacent comments before assuming it's a mistake)?
4. Does it hold across the platforms, runtimes, or versions this repo actually targets?
5. Does the reviewer appear to have the full context (or is a detail likely missing on their side)?

```text
IF the suggestion seems wrong:
    push back with technical reasoning, cite the codebase evidence

IF you cannot verify it without more information:
    say so explicitly — "I can't verify this without X. Should I investigate, ask, or proceed?"

IF it conflicts with a prior architectural decision by the project owner:
    stop and raise that conflict before implementing either side
```

### YAGNI Check for "Do It Properly" Suggestions

When a reviewer suggests generalizing or "implementing properly":

```text
grep the codebase for actual current usage of the affected code path

IF unused: propose removing it (YAGNI) instead of hardening it
IF used: implement the suggested generalization properly
```

## Implementation Order

```text
1. Resolve all unclear items first (ask before touching code)
2. Then implement in this order:
   a. Blocking issues (breaks, security)
   b. Simple fixes (typos, imports, naming)
   c. Complex fixes (refactoring, logic changes)
3. Test each fix individually before moving to the next
4. Re-run the full suite once at the end to catch cross-item regressions
```

## When to Push Back

Push back — with technical reasoning, not defensiveness — when the suggestion:

- Would break existing, tested functionality
- Reflects a reviewer who is missing repository-specific context
- Violates YAGNI (adds unused generality)
- Is technically incorrect for this stack, runtime, or platform
- Exists for a documented legacy/compatibility reason
- Conflicts with a prior architectural decision that needs a human, not a silent override

Reference working tests or code when pushing back. If you are uncomfortable disagreeing out loud,
name that tension explicitly rather than silently complying.

## Correcting Your Own Pushback

If you pushed back and it turns out you were wrong:

```text
✅ "Verified — you're correct. I initially missed [X]. Fixing now."
❌ A long apology
❌ Defending why you pushed back in the first place
❌ Over-explaining
```

State the correction factually and move on to the fix.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The reviewer is senior/the tool is confident, so it's probably right." | Confidence is not verification. Check the codebase before agreeing or disagreeing. |
| "Agreeing quickly shows I'm responsive." | Performative agreement without verification produces wrong fixes dressed as fast ones. |
| "I'll implement the clear items and figure out the rest as I go." | Ambiguous items are often coupled to the clear ones; guessing compounds the error. |
| "Pushing back looks defensive." | Reasoned, evidence-based pushback is a technical contribution, not an excuse. |

## Red Flags

- The first line of your response is gratitude or agreement before you have opened a single file
- You are implementing item 4 while still unsure what item 3 actually meant
- All feedback items are being applied in review order rather than blocking-issues-first
- You cannot point to a specific grep, test run, or file read that verified a suggestion
- A pushback response has no cited codebase evidence — it is just a preference

## Verification

- [ ] Every unclear item was clarified before any implementation began
- [ ] Each suggestion was checked against this codebase, not just accepted on reviewer authority
- [ ] No response opens with unearned gratitude or agreement
- [ ] Pushback (if any) cites specific code, tests, or history
- [ ] Blocking issues were implemented before cosmetic ones
- [ ] Each fix was tested individually, then the full suite re-run at the end

## See Also

- [`code-review`](../code-review/SKILL.md) — producing a single-pass technical review
- [`review`](../review/SKILL.md) — producing a two-axis (Standards/Spec) review
- [`pr-multi-perspective-review`](../pr-multi-perspective-review/SKILL.md) — producing a six-lens PR review
- [`implementation-review`](../../workflow/implementation-review/SKILL.md) — verifying a delegated implementation against its task spec after it lands
