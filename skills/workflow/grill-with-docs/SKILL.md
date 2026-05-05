---
name: grill-with-docs
description: Use when a plan must be stress-tested against the codebase's existing language and decisions — grill it against current docs, glossary terms, and ADRs before implementation begins
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills grill-with-docs
---

# Grill With Docs

Grill With Docs is a documentation-grounded grilling session. It does the same branch-by-branch
interrogation as `grill-me`, but every challenge is anchored in the project's current language,
design records, and observable implementation.

## When to Use

- A plan must align with existing docs, glossary terms, ADRs, or architecture notes
- The same concept is described differently across code, docs, and the current proposal
- You need to challenge a plan without drifting away from the repo's existing vocabulary
- A durable decision may need to be recorded while the conversation is still active

## When NOT to Use

| Instead of grill-with-docs | Use |
|----------------------------|-----|
| You only need plan interrogation, not documentation grounding | `grill-me` |
| You are writing or updating docs after implementation changed | `doc-update` |
| You need a broad codebase walkthrough or onboarding tour | `code-tour` |

## Workflow

### 1. Gather the current sources of truth

Before questioning the plan, inspect the best available durable references:

- root docs such as `README.md` or architecture notes
- glossary or context files if they exist
- ADRs or decision logs
- the current code path if the docs are stale or incomplete

If the repo does not maintain dedicated glossary or ADR files, use the nearest durable project docs
instead of inventing new ceremony.

### 2. Challenge the plan against documented language

When the plan uses a term that conflicts with current project language, call it out directly.

Examples:

- "The docs call this a workspace, but the plan says project. Which term is canonical?"
- "The ADR says we prefer thin adapters here. Why does this proposal add a new orchestration layer?"

### 3. Use one question at a time

Like `grill-me`, walk the tree branch by branch. Each question should either:

- confirm the plan fits the existing docs
- expose a contradiction
- force a new durable decision

### 4. Check code when the docs and proposal disagree

If the docs say one thing and the current code does another, surface the mismatch instead of assuming
the docs win automatically.

```markdown
**Documented:** feature flags gate this flow.
**Observed in code:** the path is unconditional in production.
**Question:** Which source should the new plan follow?
```

### 5. Record only durable decisions

If the session produces a decision worth preserving, update the relevant docs during the session.
Only create or propose an ADR when all three are true:

1. it is hard to reverse
2. it would be surprising without context
3. it resulted from a real tradeoff

If one of those is missing, leave it out of the ADR layer.

## Output Template

```markdown
## Doc-Grounded Grill Summary

### Confirmed by Existing Docs
- ...

### Conflicts Found
- ...

### Decisions Made
- ...

### Docs To Update
- ...
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The docs are probably stale, so ignore them." | Maybe — but you still need to surface the contradiction explicitly. |
| "We'll rename the terms later." | Vocabulary drift makes design reviews and follow-up work harder immediately. |
| "Let's write an ADR for everything." | ADRs are for durable, surprising, hard-to-reverse tradeoffs, not routine notes. |

## Red Flags

- The plan uses new terminology without checking whether the repo already has a term
- Code, docs, and proposal disagree, but the session never resolves which one is authoritative
- ADRs are proposed for obvious or low-cost decisions
- The grilling session turns into doc rewriting before the core plan is settled

## Verification

- [ ] The plan was checked against current docs or code, not memory alone
- [ ] Terminology conflicts were surfaced explicitly
- [ ] Questions were asked one at a time
- [ ] Only durable decisions were promoted into doc updates or ADR candidates

## See Also

- [`grill-me`](../grill-me/SKILL.md) — one-question-at-a-time grilling without the doc-grounding requirement
- [`doc-update`](../../documentation/doc-update/SKILL.md) — sync docs after implementation changes
- [`architecture-decisions`](../../documentation/architecture-decisions/SKILL.md) — capture hard-to-reverse technical decisions deliberately
