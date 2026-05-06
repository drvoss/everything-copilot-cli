---
name: copilot-memory
description: Use when you need to understand, review, or curate GitHub Copilot's repository-level memory — the persistent facts Copilot reuses across CLI, cloud agent, and code review for the same repository
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
  copilot_feature: "Copilot Memory, repository-scoped memory, cloud agent, code review, Copilot CLI"
---

# Copilot Memory

Copilot Memory is GitHub Copilot's repository-level memory layer. It lets Copilot learn durable
facts about a codebase over time and reuse them across Copilot CLI, Copilot cloud agent, and
Copilot code review.

## Why This is Copilot-Exclusive

This is not the same thing as session history:

- **`cross-session-memory`** is your local CLI session history and artifacts
- **Copilot Memory** is repository-scoped memory that Copilot validates and reuses across products

Copilot Memory is unique because it spans multiple Copilot surfaces for the same repository and is
managed through GitHub's Copilot settings and repository controls.

## When to Use

- When Copilot keeps rediscovering the same repository conventions from scratch
- When you want to review or delete stale memories for a repository
- When a stable project pattern should be reinforced through durable, validated repository context
- When you need to distinguish repository memory from local session history

## When NOT to Use

| Instead of copilot-memory | Use |
|---------------------------|-----|
| You need to recover what happened in earlier CLI sessions | `cross-session-memory` |
| You want to promote a lesson into repo docs or instructions manually | `knowledge-curator` |
| You need one-session scratch state or todos | `session-management` |

## What Copilot Memory Does

Copilot Memory stores repository-specific facts that Copilot infers while working in the repo.

Important properties:

- repository-scoped, not personal chat memory
- validated against current code citations before reuse
- shared across Copilot CLI, Copilot cloud agent, and Copilot code review for the repository
- automatically deleted after 28 days unless refreshed by later validated use

## Workflow

### 1. Confirm memory is enabled

Copilot Memory availability depends on plan and policy:

- Copilot Pro / Pro+ users have it enabled by default
- organizations and enterprises can enable or disable it centrally

Before relying on it, verify the feature is enabled for the user or organization.

### 2. Treat memory as validated repository knowledge

Copilot does not blindly trust old memories. It checks the cited code locations against the current
codebase before using a memory.

That means:

- stable patterns are good candidates for memory reuse
- stale or contradicted patterns should not be relied on
- durable project rules should still live in repo docs and instructions

### 3. Review and curate memories on GitHub

Repository owners can review stored memories on GitHub and delete ones that are wrong, outdated, or
misleading.

Use this when:

- Copilot keeps repeating a bad assumption
- a repository convention changed
- a temporary migration pattern should not keep influencing future work

### 4. Reinforce good memory with stable source material

If you want Copilot to keep learning the right things:

- keep repository instructions accurate
- keep ADRs and reference docs current
- let Copilot work against canonical code paths, not temporary experiments

Copilot Memory works best when the repository already has reliable evidence to cite.

### 5. Keep secrets and temporary states out of memory candidates

Do not rely on Copilot Memory for:

- secrets, tokens, or credentials
- temporary migration states
- experiments that are not meant to become standard practice

Those belong in secure systems, ephemeral notes, or not in Copilot context at all.

## Copilot Memory vs Local Session History

| Concern | Copilot Memory | Cross-session session history |
|---------|----------------|-------------------------------|
| Scope | Repository-wide Copilot memory | Local CLI session history |
| Shared by | CLI, cloud agent, code review | Your local Copilot CLI sessions |
| Storage model | GitHub-managed repository memory | Local session data and `session_store` |
| Retention | 28 days unless refreshed | Local historical session record |
| Best use | Stable repository patterns | Recovering past work and artifacts |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "If Copilot learned it once, the docs no longer matter." | Durable repo docs still matter because memory is validated against the codebase and can expire. |
| "Memory and session history are basically the same." | They solve different problems and live at different layers. |
| "Any repeated pattern should become memory." | Temporary or incorrect patterns should be reviewed or deleted, not reinforced. |

## Red Flags

- Copilot repeats a repository rule that no longer matches the current codebase
- Team members assume session history and repository memory are interchangeable
- Temporary migration artifacts are being treated as durable project conventions
- Owners never review memories even after major refactors or policy changes

## Verification

- [ ] The team can explain the difference between Copilot Memory and local session history
- [ ] Stable conventions still live in instructions or repo docs, not only in memory
- [ ] Incorrect or stale memories are reviewed and deleted on GitHub when needed
- [ ] Sensitive or temporary information is not being treated as a memory candidate

## See Also

- [`cross-session-memory`](../cross-session-memory/SKILL.md) — recover prior CLI session context
- [`knowledge-curator`](../knowledge-curator/SKILL.md) — decide what belongs in durable project guidance
- [`context-prime`](../context-prime/SKILL.md) — load durable repository context at session start
