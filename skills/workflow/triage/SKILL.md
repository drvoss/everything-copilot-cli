---
name: triage
description: Use when a single issue or external-contributor pull request needs structured triage — classify it, verify the claim if needed, request missing information, and leave a durable brief or close-out note in the tracker.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills triage
---

# Triage

Use this skill to move one issue or one external-contributor pull request through a small, explicit
triage workflow without losing context between sessions.

## When to Use

- A bug report or feature request needs its first serious evaluation
- An existing issue has new comments and should be re-triaged
- An external-contributor pull request should be screened before deep review or merge discussion
- You need to decide whether work is ready for an agent, a human, more info, or closure
- The next step should be a durable tracker comment, not an implementation diff

## When NOT to Use

| Instead of triage | Use |
|-------------------|-----|
| You need to bulk-process an issue backlog | [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md) |
| You need to batch-triage a PR queue or manage PR lifecycle actions | [`github-pr-workflow`](../../copilot-exclusive/github-pr-workflow/SKILL.md) |
| The feature is already approved and needs a PRD | [`create-prd`](../../product/create-prd/SKILL.md) |
| A plan or spec needs decomposition into implementation tickets | [`to-issues`](../to-issues/SKILL.md) |

## Prerequisites

- Access to the issue tracker, labels, and comment history
- A repo-specific mapping from conceptual states to actual label names, if labels already exist
- Enough codebase access to inspect related docs and attempt reproduction for bugs
- For PR triage, access to the diff, CI status, linked issues, and contributor role or
  `authorAssociation`

## Triage State Model

Use one category and one state:

- **Categories**: `bug`, `enhancement`
- **States**: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`

If the project uses different label names, map them first and keep the conceptual model in
your notes.

## Workflow

### 1. Gather the full tracker context

Read:

- the issue or PR title and body
- existing labels
- comments and dates
- linked issues, checks, and changed files when the request surface is a PR
- related docs, glossary, ADRs, or prior issues in the same area

If previous triage notes exist, treat them as state, not noise.

### 2. Recommend category and state

Explain:

- what bucket the issue belongs in
- why that state is appropriate now
- what evidence came from the codebase or reproduction attempt

Do not silently relabel a confusing issue. If labels conflict, call it out first.

### 3. Verify the claim before grilling

When the issue is a bug, try the fastest honest reproduction path before asking the
reporter for more detail. When the request surface is a PR, check whether the diff,
tests, and linked issue actually support the claim before pushing the contributor back
for more work. Verified evidence makes later implementation or review much stronger.

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
If the request duplicates an existing issue or PR, say so directly and link the earlier
thread instead of letting parallel work accumulate.

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

### External-contributor PR

Read the PR description, diff, checks, linked issue, and contributor role first. If the PR proves
the claim and is in scope, move it to `ready-for-human` or `ready-for-agent` with a durable brief.
If it duplicates existing work or solves the wrong problem, close it out with a clear `wontfix`
note that links to the authoritative issue or PR.

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
- [ ] For PR triage, contributor type and CI/check evidence were reviewed before asking for more work

## Tips

- Use the tracker as the system of record; do not keep triage state only in local notes
- For GitHub PRs, treat external-contributor work as a request surface first and a code review target
  second; the triage state still matters
- If multiple issues need work, pair this skill with
  [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md)
- Once an issue is approved, hand off to [`create-prd`](../../product/create-prd/SKILL.md)
  or [`to-issues`](../to-issues/SKILL.md) as appropriate
