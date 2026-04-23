---
name: implementation-review
description: Use after an implementation pass lands — compare the original task spec or handoff against the delivered diff, classify each requested item, and produce an actionable follow-up report.
metadata:
  category: workflow
  agent_type: general-purpose
---

# Implementation Review

Implementation review is not ordinary code review. The goal is to verify whether the
delivered change actually matches the original task spec, handoff, or review report —
and to turn any gaps into a precise follow-up the implementation machine can execute.

## When to Use

- A delegated implementation task already landed and you need to check it against the original spec
- Another machine or session reported "done" and shared a commit, branch, or PR
- A task file contained multiple required items and you need item-by-item status
- You want to separate **approved**, **needs correction**, **missing**, and **validly excluded**

## When NOT to Use

| Instead of implementation-review | Use |
|----------------------------------|-----|
| Reviewing code quality or correctness without a prior task spec | `code-review` |
| Proving that a fix works by rerunning commands | `verification-before-completion` |
| Turning upstream ecosystem changes into backlog candidates | `ecosystem-intake` |
| Security-specific review of a change | `pr-security-review` or `agent-owasp-check` |

## Prerequisites

- You have the original task spec, handoff doc, issue, or review report
- You have the delivered commit hash, branch, PR, or diff range
- You know the intended scope well enough to judge exclusions

## Workflow

### 1. Gather the canonical inputs

Before reviewing the implementation, pin down:

- the original request or task file
- the success criteria or required items
- the delivered commit, branch, or PR
- any stated exclusions or tradeoffs from the implementation pass

If there is no explicit spec, stop and say the review can only assess general quality,
not compliance.

### 2. Inspect the delivered change

Use a stable diff view rather than memory or a narrative summary:

```text
git --no-pager show <commit-hash> --stat
git --no-pager show <commit-hash> --unified=3

# or compare a range
git --no-pager diff <base>...<head>
```

If the implementation arrived as a PR, review the changed files list first, then inspect
the substantive diff.

### 3. Compare the implementation item by item

For each requested item, assign exactly one status:

| Status | Meaning |
|--------|---------|
| ✅ **Approved** | Implemented correctly and matches intent |
| ⚠️ **Needs correction** | Implemented, but scope, wording, or behavior is off |
| ❌ **Missing** | Requested in the spec but not implemented |
| 🔄 **Validly excluded** | Not implemented, but the exclusion is justified |

Do not collapse multiple items into one verdict if the spec separated them.

### 4. Check stated constraints and repository philosophy

Review the delivered change against the constraints that mattered in the original task:

- platform-neutral vs platform-specific placement
- repository conventions and category fit
- stated safety or validation requirements
- multi-model or provider-agnostic language, if the repository claims that as part of its philosophy

Example checks:

- a generic workflow was not placed under `copilot-exclusive/` without a real Copilot-only dependency
- a requested multi-model pattern was not rewritten back into a single-provider assumption
- a task that required actionable output did not stop at vague observations

### 5. Assess exclusions explicitly

An exclusion can be valid. It still needs to be reviewed.

Typical valid exclusions:

- the requested concept already exists locally
- the proposed change conflicts with current repository structure or conventions
- the task spec depended on an unavailable or unverified platform primitive

Weak exclusions:

- "didn't seem necessary"
- "felt redundant" without a cited local path
- "too much work" when the requested item was core scope

### 6. Produce an actionable review report

Every non-approved item should tell the implementation side exactly what to do next.

```markdown
## Implementation Review — <commit / PR / branch>

### Approved ✅
- [item ID]: [what was implemented correctly]

### Needs Correction ⚠️
- [item ID]: [specific problem] → [exact fix required]
  File: path/to/file.md
  Current: [what it says now]
  Should be: [what it should say or do]

### Missing ❌
- [item ID]: [why it matters] → [implement or justify exclusion]

### Exclusions Assessed 🔄
- [item ID]: [valid / should be reconsidered] — [reasoning]
```

### 7. Hand the result back cleanly

The implementation side should be able to act on the report without follow-up questions.

Bad:

```text
Some parts look off. Please review.
```

Good:

```text
N-2 is missing from the workflow catalog table.
Add a row for `implementation-review` under README.md and localized README workflow sections,
then update the total skill count from 75 to 76.
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The diff looks mostly right" | Implementation review is item-by-item, not vibe-based. |
| "It was pushed, so it must be done" | A pushed diff can still miss scope or misclassify files. |
| "I already reviewed the code quality" | Quality review and spec-compliance review are different jobs. |
| "The exclusion sounds reasonable" | Reasonable claims still need evidence from the repo or spec. |

## Red Flags

- The original task file had multiple items, but the review gives one overall verdict
- "Needs correction" entries describe a problem but not the required fix
- Exclusions are accepted without checking the local repo
- The review drifts into generic style commentary instead of scope compliance
- Repository philosophy was explicit, but the review never checked whether the change preserved it

## Verification

- [ ] The original task spec or handoff was read before inspecting the implementation
- [ ] The review used a real diff, commit, branch, or PR range
- [ ] Every requested item received an explicit status
- [ ] Every correction or missing item includes an actionable next step
- [ ] Exclusions were evaluated, not merely repeated

## Tips

- Pair this with `verification-before-completion` when the implementation side must rerun commands after corrections
- Pair this with `code-review` when a spec-compliant change still needs a logic review
- If the original task grouped work into item IDs (`A-1`, `N-2`, etc.), preserve those IDs in the review report
- If the repository has a published philosophy section, quote it when a correction depends on that philosophy

## See Also

- [`verification-before-completion`](../verification-before-completion/SKILL.md) — prove the corrected change is actually done
- [`ecosystem-intake`](../../copilot-exclusive/ecosystem-intake/SKILL.md) — create adopt/adapt/reject task inputs before implementation
- [`code-review`](../../development/code-review/SKILL.md) — substantive quality and correctness review
