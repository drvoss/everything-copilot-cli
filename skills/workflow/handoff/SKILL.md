---
name: handoff
description: >
  Use when work is changing sessions, agents, or machines and the next pass needs a
  compact handoff document with current state, open questions, and next steps instead
  of raw chat history.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from mattpocock/skills productivity handoff
---

# Handoff

Handoff turns the current state of work into a portable markdown brief that another
session, agent, or collaborator can pick up quickly.

The goal is not "summarize everything." The goal is to capture only the information
that would otherwise be expensive to rediscover.

## When to Use

- You are ending a session but the work is not actually finished
- Another agent, model, or machine will continue the task
- The conversation contains decisions that are not yet reflected in committed files
- A reviewer or implementer needs a compact state-of-play document

## When NOT to Use

| Instead of handoff | Use |
|--------------------|-----|
| Continuing the same Copilot CLI session later | `cross-session-memory` or `/resume` |
| Recording durable project guidance for everyone | `knowledge-curator` |
| Writing a committed spec, ADR, PRD, or issue | the destination artifact itself |

## Workflow

### 1. Clarify what the next session is for

Start with one sentence:

- what the next session should accomplish
- what is already done
- what remains uncertain

If the user gave a follow-up goal, tailor the handoff around that goal instead of the
whole conversation.

### 2. Pick a portable file path

Prefer a temporary markdown file outside the repo unless the user explicitly wants a
committed file.

Examples:

```powershell
# PowerShell
$path = Join-Path $env:TEMP ("handoff-" + [System.Guid]::NewGuid().ToString("N") + ".md")
```

```bash
# POSIX shell
path="$(mktemp -t handoff-XXXXXX.md)"
```

If a path already exists, read it before overwriting.

### 3. Reference artifacts instead of duplicating them

Do not restate content that already lives in:

- a plan
- an issue
- a PR
- an ADR
- a committed file
- a benchmark result

Link to those artifacts by path, URL, or commit hash and explain only why they matter.

### 3-A. Redact sensitive data before saving

Before writing the handoff document, actively redact sensitive data in the captured
context:

- API keys, tokens, or credentials -> `[REDACTED]`
- Passwords or secrets -> `[REDACTED]`
- PII in sensitive context -> `[REDACTED]`
- Internal-only URLs or endpoints -> `[INTERNAL URL]`

Do not simply omit the fact that something existed. Replace the value with a
placeholder so the next session knows there was sensitive context without seeing the
secret itself.

### 4. Capture only the load-bearing context

Good handoffs usually include:

- current objective
- work completed
- open questions
- key files and why they matter
- relevant commands, outputs, or result files
- concrete next step

Skip long narrative unless it changes the next decision.

### 5. Recommend the next skill or workflow

If another skill would help the next session, name it explicitly and explain why.

Examples:

- `implementation-review` for "compare this delivered diff against the original ask"
- `grill-me` for "the plan still has unresolved assumptions"
- `verification-before-completion` for "prove the claim before reporting success"

### 6. Save the handoff and report the path

The handoff is only useful if the next person can find it quickly. End by giving the
exact saved path.

## Output Template

```markdown
# Handoff

## Objective
- ...

## Current State
- ...

## Key Decisions
- ...

## Important Files and Refs
- path or URL - why it matters

## Open Questions
- ...

## Risks or Gotchas
- ...

## Suggested Skills
- ...

## First Next Step
- ...
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The next session can just read the chat." | Raw chat is slow to rehydrate and easy to misread. |
| "I'll copy every detail so nothing is lost." | Bloated handoffs hide the actual next action. |
| "I'll paste the whole diff again." | Existing artifacts should be referenced, not duplicated. |

## Red Flags

- The handoff repeats existing docs word-for-word
- The next step is still vague after reading the document
- Important files are named without saying why they matter
- Secrets, tokens, or private data are copied into the handoff

## Verification

- [ ] The next objective is explicit
- [ ] Existing artifacts are referenced instead of duplicated
- [ ] Open questions and risks are called out separately
- [ ] The saved path is reported back to the user

## See Also

- [`cross-session-memory`](../../copilot-exclusive/cross-session-memory/SKILL.md) - resume or search prior Copilot sessions
- [`knowledge-curator`](../../copilot-exclusive/knowledge-curator/SKILL.md) - promote repeated lessons into durable project guidance
- [`implementation-review`](../implementation-review/SKILL.md) - compare delivered work against the original request
