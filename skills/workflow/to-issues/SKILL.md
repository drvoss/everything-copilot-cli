---
name: to-issues
description: Use when a plan, spec, or PRD must become an actionable backlog — break it into thin dependency-aware issues that each deliver a verifiable vertical slice
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills to-issues
---

# To Issues

To Issues turns a plan into independently executable backlog items. The goal is not to split work by
layer, but to create thin vertical slices that are reviewable, testable, and dependency-aware.

## When to Use

- A plan, spec, or PRD is approved and now needs implementation tickets
- A broad initiative must be broken into thin, demoable slices
- The current backlog is too coarse to delegate safely
- You need to separate work that can proceed independently from work that is blocked

## When NOT to Use

| Instead of to-issues | Use |
|----------------------|-----|
| You are still defining the feature itself | `create-prd` or planning first |
| You need to triage an existing issue backlog | `github-issue-triage` |
| The work is already small enough to execute directly | do the task |

## Workflow

### 1. Start from an approved source

Use a real input artifact:

- plan
- PRD
- spec
- parent issue

Do not create issue slices from an unresolved conversation.

### 2. Extract vertical slices

Each issue should represent a thin end-to-end path, not a horizontal layer split.

Good slices usually:

- have one clear outcome
- can be tested or demonstrated on their own
- expose their dependency relationship to other slices

Bad slices are things like "database changes only" or "UI updates only" if they cannot be verified
in isolation.

### 3. Mark blockers explicitly

For each proposed issue, identify:

- what it delivers
- what blocks it
- whether it can start immediately

Publish blockers first so later issues can reference them cleanly.

### 4. Review the breakdown before publishing

Show the user the proposed issue set and ask whether:

- the slices are too coarse or too fine
- any issue should be merged or split
- the dependency order is correct

Only publish after the breakdown is approved.

### 5. Publish to the active issue tracker

Support the tracker the project already uses.

- **GitHub**: use `gh issue create` (or equivalent GitHub CLI workflow) when publishing approved issues
- **GitLab**: use the GitLab issue workflow or CLI available in the environment

Do not assume one provider if the project uses another.

## Output Template

```markdown
## Proposed Issue Breakdown

1. **Title:** ...
   **Blocked by:** None / #123
   **Delivers:** ...
   **Acceptance signal:** ...

2. ...
```

## Issue Body Template

```markdown
## Parent

[Reference to the source plan, PRD, or parent issue]

## What to build

[One thin vertical slice with end-to-end value]

## Acceptance criteria

- [ ] ...
- [ ] ...
- [ ] ...

## Blocked by

None - can start immediately
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Let's make one big implementation issue first." | Huge tickets hide sequencing mistakes and block delegation. |
| "We can split the layers now and connect them later." | Horizontal slices are harder to demo and easier to strand. |
| "Dependencies are obvious." | If they are not written down, the backlog will drift. |

## Red Flags

- Several issues depend on work that has no explicit parent blocker
- A slice only changes one layer and cannot be verified on its own
- The user has not approved the breakdown before publication
- The issue titles use implementation jargon instead of domain language from the source artifact

## Verification

- [ ] Every issue represents a thin vertical slice
- [ ] Dependencies are explicit
- [ ] The user approved the granularity before publishing
- [ ] The tracker-specific publish path matches the project actually in use

## See Also

- [`create-prd`](../../product/create-prd/SKILL.md) — define the feature before turning it into backlog items
- [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md) — organize and review an existing GitHub issue backlog
- [`team-planner`](../../copilot-exclusive/team-planner/SKILL.md) — assign the resulting slices across specialist agents
