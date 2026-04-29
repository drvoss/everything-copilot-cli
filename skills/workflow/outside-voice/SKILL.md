---
name: outside-voice
description: Use when you need an independent second opinion before, during, or after implementation — run challenge, consult, or review mode in a direct builder-to-builder voice
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from garrytan/gstack outside-voice workflow
---

# Outside Voice

Outside Voice creates deliberate distance from your current momentum. Instead of continuing to
push the same plan, it asks a second opinion to challenge the framing, pressure-test the approach,
or review the result in a blunt, useful voice:

> Direct, concrete, builder-to-builder. No filler.

## When to Use

- A plan feels plausible, but you want a strong preflight challenge before implementation
- You are in the middle of debugging or design work and need an outside perspective on the blocker
- A change is "done" but you want an independent review before calling it complete
- The conversation has become anchored on one approach and you want a fresh take

## When NOT to Use

| Instead of outside-voice | Use |
|--------------------------|-----|
| Broad multi-path decision-making with multiple roles | `council` |
| Formal code/security review against a concrete diff | `code-review` or `pr-security-review` |
| Choosing the cheapest or strongest model for a task | `multi-model-strategy` |

## Modes

| Mode | Trigger | Output |
|------|---------|--------|
| `challenge` | Before implementation starts | A critique of the plan, missing constraints, safer alternatives |
| `consult` | During active work | A narrow outside view on the blocker, assumption, or stuck point |
| `review` | After implementation | A verdict on correctness, risk, and what still needs work |

## Workflow

### 1. Pick the mode explicitly

State the exact role up front:

```text
Use outside-voice in challenge mode.
We have not started implementation yet.
Critique the approach before we commit to it.
```

### 2. Pass only the artifact that needs judgment

Do not dump the whole session. Give the outside voice a compact target:

- `challenge` -> proposed plan, acceptance criteria, constraints
- `consult` -> blocker, current hypothesis, relevant files or logs
- `review` -> diff summary, test status, known risks

The smaller the artifact, the easier it is to stay independent from your original framing.

### 3. Keep the opinion independent

If possible, use a different model or agent than the builder so the second opinion is not merely an
echo of the same reasoning lane. See [`multi-model-strategy`](../../copilot-exclusive/multi-model-strategy/SKILL.md)
for concrete pairing patterns.

### 4. Ask for a sharp answer, not a polite summary

Use prompts that force a useful verdict:

```text
Mode: challenge
Voice: direct, concrete, builder-to-builder. No filler.

Question:
Will this plan fail? If yes, where?

Return:
1. Verdict
2. Top 3 objections
3. What to change before implementation
4. What would convince you the plan is now sound
```

### 5. Apply the output mode-by-mode

#### Challenge mode

Use this before starting work:

```markdown
## Outside Voice — Challenge

**Verdict:** [sound / risky / wrong framing]

### Top Objections
1. ...
2. ...
3. ...

### Required Changes Before Build
- ...

### Confidence Gate
- What evidence or prototype would de-risk this?
```

#### Consult mode

Use this when progress stalls:

```markdown
## Outside Voice — Consult

**Likely Mistake:** ...
**What You're Assuming:** ...
**What To Check Next:** ...
**If That Fails:** ...
```

#### Review mode

Use this after implementation:

```markdown
## Outside Voice — Review

**Verdict:** pass / concerns / block

### Findings
- ...

### Highest-Risk Gap
- ...

### Next Required Action
- ...
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I already thought this through." | That is exactly when anchoring risk is highest. |
| "A second opinion will slow me down." | It is cheaper than building on a bad premise or shipping a hidden flaw. |
| "I only need encouragement." | Outside Voice is for challenge, not reassurance. |

## Red Flags

- The brief contains the answer you want instead of the question you need checked
- The outside opinion agrees instantly without naming concrete risks
- You keep asking until one reviewer blesses the original plan
- Review mode is used without showing the actual changed surface

## Tips

- Ask one narrow question per pass
- Prefer a different model family for the second opinion when practical
- Treat a strong dissent as input to resolve, not tone to ignore
- If the problem is really "which path should we choose?", move to `council`

## See Also

- [`council`](../council/SKILL.md) — multi-voice deliberation for ambiguous decisions
- [`implementation-review`](../implementation-review/SKILL.md) — compare delivered work against the original spec
- [`multi-model-strategy`](../../copilot-exclusive/multi-model-strategy/SKILL.md) — diversify builder and reviewer lanes
