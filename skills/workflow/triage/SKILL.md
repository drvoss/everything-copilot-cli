---
name: triage
description: Use when a single issue needs structured triage — classify it, reproduce if needed, request missing information, and leave a durable brief or close-out note in the tracker.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills triage
---

# Triage

Use this skill to move one issue through a small, explicit triage workflow without losing
context between sessions.

## When to Use

- A bug report or feature request needs its first serious evaluation
- An existing issue has new comments and should be re-triaged
- You need to decide whether work is ready for an agent, a human, more info, or closure
- The next step should be a durable issue comment, not an implementation diff

## When NOT to Use

| Instead of triage | Use |
|-------------------|-----|
| You need to bulk-process an issue backlog | [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md) |
| The feature is already approved and needs a PRD | [`create-prd`](../../product/create-prd/SKILL.md) |
| A plan or spec needs decomposition into implementation tickets | [`to-issues`](../to-issues/SKILL.md) |

## Prerequisites

- Access to the issue tracker, labels, and comment history
- A repo-specific mapping from conceptual states to actual label names, if labels already exist
- Enough codebase access to inspect related docs and attempt reproduction for bugs

## Triage State Model

Use one category and one state:

- **Categories**: `bug`, `enhancement`
- **States**: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`

If the project uses different label names, map them first and keep the conceptual model in
your notes.

## Workflow

### 1. Gather the full issue context

Read:

- the issue body and title
- existing labels
- comments and dates
- related docs, glossary, ADRs, or prior issues in the same area

If previous triage notes exist, treat them as state, not noise.

### 2. Recommend category and state

Explain:

- what bucket the issue belongs in
- why that state is appropriate now
- what evidence came from the codebase or reproduction attempt

Do not silently relabel a confusing issue. If labels conflict, call it out first.

### 3. Reproduce bugs before grilling

When the issue is a bug, try the fastest honest reproduction path before asking the
reporter for more detail. A confirmed repro makes later implementation much stronger.

### 4. Apply the right outcome

#### Needs info

```markdown
## Triage Notes

**What we established**

- ...

**What we still need**

- ...
```

#### Ready for agent or human

```markdown
## Implementation Brief

**Summary**
- ...

**Observed behavior**
- ...

**Expected behavior**
- ...

**Relevant code/docs**
- ...

**Open risks**
- ...
```

Use the same shape for human-ready issues, but note why human judgment is still required.

#### Wontfix

Leave a polite explanation that makes the closure understandable for the next reader.

### 5. Resume without re-asking solved questions

On a later session, read the prior triage note first, check whether the reporter answered
the open questions, and continue from there.

## Examples

### Bug report

Read the report, inspect the code path, attempt reproduction, then either move it to
`ready-for-agent` with a short implementation brief or to `needs-info` with precise
missing inputs.

### Feature request

Classify it as an enhancement, compare it with adjacent issues or roadmap docs, then leave
either a durable brief for future work or a clear `wontfix` explanation.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Let's ask for more info first" | Reproduction and code reading often answer part of the question immediately. |
| "The labels look close enough" | Conflicting state labels create churn; make the state explicit. |
| "I'll remember the triage context later" | If it is not written to the issue, the next session starts from zero. |

## Red Flags

- An issue carries multiple conflicting state labels
- The triage comment asks vague questions like "please provide more info"
- Bug triage skips any reproduction attempt even though the code path is accessible
- The close-out note does not explain why the issue is being closed

## Verification

- [ ] The issue has exactly one category and one current state in the triage notes or labels
- [ ] Any recommendation cites evidence from comments, code, or reproduction
- [ ] Follow-up questions are specific and actionable
- [ ] The resulting issue comment is durable enough for another session to resume from

## Tips

- Use the tracker as the system of record; do not keep triage state only in local notes
- If multiple issues need work, pair this skill with
  [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md)
- Once an issue is approved, hand off to [`create-prd`](../../product/create-prd/SKILL.md)
  or [`to-issues`](../to-issues/SKILL.md) as appropriate
