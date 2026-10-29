---
name: copilot-memory
license: MIT
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

- repository-level facts are shared with repository collaborators; Copilot can also store
  user-level preferences that follow you across repositories (this skill covers the repository
  scope)
- validated against current code citations before reuse
- shared across Copilot CLI, Copilot cloud agent, and Copilot code review for the repository
- expire after 90 days without reinforcement by default; enterprise and organization owners can
  set the expiry for repository-level facts anywhere from 7 to 180 days, and the lower value wins
  when both set one
- the expiry resets only when Copilot upvotes a memory after using it — retrieving a memory does
  not reset it, and a downvote does not shorten it

## Workflow

### 1. Confirm memory is enabled

Copilot Memory availability depends on plan and policy:

- user-level preferences are on by default for Copilot Pro, Pro+, and Max, and off for Copilot
  Business and Enterprise until an organization or enterprise owner enables them
- repository-level facts have a separate default: allowed unless enterprise, organization, or
  repository settings restrict them
- organizations and enterprises can enable or disable it centrally

Before relying on it, verify the feature is enabled for the user or organization.

In Copilot CLI, interactive sessions follow your GitHub settings by default. Use `/memory` (or
`/memory show`) to check the local setting, `/memory off` to stop storing and retrieving memories
in the CLI, and `/memory on` to remove that local opt-out. Prompt-mode runs (`copilot -p`) have
memory off by default; add `--enable-memory` to a run that should use it. Account, repository,
and tool-permission restrictions still apply either way.

### 2. Treat memory as validated repository knowledge

Copilot does not blindly trust old memories. It checks the cited code locations against the current
codebase before using a memory.

That means:

- stable patterns are good candidates for memory reuse
- stale or contradicted patterns should not be relied on
- durable project rules should still live in repo docs and instructions

### 3. Review and curate memories on GitHub

Repository owners can review stored memories on GitHub and delete ones that are wrong, outdated, or
misleading. The repository's Memory settings page lists facts only for users with write access who
also have user-level preferences enabled for their own account. Copilot cannot delete a memory
because you ask it to forget something; delete it from the settings page instead.

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

### 5. Seed reviewed facts with `copilot memories import`

When a team already knows facts it wants Copilot to start with, import them from a JSONL file
instead of waiting for Copilot to rediscover them. Each line is one versioned memory object with
the required fields `type`, `version`, `scope`, `subject`, `fact`, `reason`, and `citations`; a
repository-level fact names the repository in its `scope`, and you need permission to write
memories for that repository.

```bash
copilot memories import memories.jsonl --dry-run   # validate the whole file; nothing is submitted
copilot memories import memories.jsonl --output json
```

- The dry run checks the file format only, not whether your account may store the memories.
- If any line fails validation, nothing is submitted. After validation, records are submitted one
  at a time, so a service failure can leave a partial import. Read the per-record results and
  retry only the failed records — repeating the whole import can create duplicate memories.
- A conflict is an error by default; `--on-conflict skip` skips repeated `externalId` values in the
  file and conflicts the memory service reports, but does not make a rerun safe.
- Running the command counts as approval for every record. Authentication, policy, repository
  permission, scope validation, and secret scanning still apply.

### 6. Keep secrets and temporary states out of memory candidates

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
| Retention | 90 days by default, reset when upvoted | Local historical session record |
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

## Team Considerations

- Admins control availability under **Repository Settings > Copilot > Memory**
- Repository-scoped memory is shared by all Copilot surfaces for the same repo; user-scoped memories stay with the user
- To seed shared patterns explicitly, keep authoritative conventions in repo docs and instructions;
  Copilot learns from those as the canonical source. Use `copilot memories import` (step 5) only
  for reviewed facts you also want available before Copilot rediscovers them

## Verification

- [ ] The team can explain the difference between Copilot Memory and local session history
- [ ] Stable conventions still live in instructions or repo docs, not only in memory
- [ ] Incorrect or stale memories are reviewed and deleted on GitHub when needed
- [ ] Sensitive or temporary information is not being treated as a memory candidate

## See Also

- [`cross-session-memory`](../cross-session-memory/SKILL.md) — recover prior CLI session context
- [`knowledge-curator`](../knowledge-curator/SKILL.md) — decide what belongs in durable project guidance
- [`context-prime`](../context-prime/SKILL.md) — load durable repository context at session start
