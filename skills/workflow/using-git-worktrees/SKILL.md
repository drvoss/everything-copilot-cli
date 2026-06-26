---
name: using-git-worktrees
description: Use when you need multiple branches checked out at once — create isolated working directories for parallel development without cloning the repository repeatedly
metadata:
  category: workflow
  agent_type: general-purpose
  origin: ported and adapted from obra/superpowers
---

# Using Git Worktrees

Git worktrees let one repository have multiple active working directories. Use them when parallel
tasks should not compete for the same checkout.

## When to Use

- Parallel agent or human work on separate branches
- Reviewing or hotfixing another branch without stashing current work
- Waiting on CI or review for one branch while continuing on another
- Running long-lived experiments that should stay isolated from the main checkout

## When NOT to Use

| Instead of using-git-worktrees | Use |
|--------------------------------|-----|
| A single quick change on the current branch | stay in the current checkout |
| Two subtasks that must edit the same files together | one branch, one worktree |
| Disposable experimentation with no branch history needed | a temporary local branch may be enough |

## Workflow

### 1. Pick a directory layout

**Option A — Sibling folders (traditional)**: each worktree is a sibling of the main repo:

```text
C:\work\repo-main
C:\work\repo-feature-api
C:\work\repo-feature-docs
```

**Option B — Project-internal `.worktrees/` directory (recommended for Copilot CLI agent workflows)**:
Keep all worktrees inside the project root for easier discovery and cleaner orchestration briefs:

```text
C:\work\repo-main
C:\work\repo-main\.worktrees\feature-api
C:\work\repo-main\.worktrees\feature-docs
```

Advantages of project-internal layout:

- All active worktrees visible from one root path — no guessing sibling names
- Agents receive a relative path (`.\\.worktrees\\feature-api`) instead of an absolute sibling path
- Easier to clean up: removing the project removes all its worktrees
- Git-ignore `.worktrees/` to prevent accidental tracking of worktree state files

```powershell
# Create a project-internal worktree
git worktree add .worktrees\feature-api feature/api-contract

# Or from the project root
git worktree add .\.worktrees\perf-audit -b feature/perf-audit

# List
git worktree list
```

Add `.worktrees/` to `.gitignore` to prevent worktree bookkeeping files from being committed:

```text
# .gitignore
.worktrees/
```

Name the folder after the branch or task.

### 2. Create the worktree

```powershell
# Existing branch (sibling layout)
git worktree add ..\repo-feature-api feature/api-contract

# Existing branch (project-internal layout)
git worktree add .worktrees\feature-api feature/api-contract

# New branch created from the current HEAD
git worktree add -b feature/perf-audit .worktrees\perf-audit

# Inspect active worktrees
git worktree list
```

Each worktree gets its own working directory while sharing the same repository object database.

### 3. Assign one worktree per task

Use a dedicated branch and directory for each independent task:

- Agent A -> `.worktrees\feature-api`
- Agent B -> `.worktrees\perf-audit`
- Agent C -> `.worktrees\docs-sync`

Do not send two independent agents into the same worktree. That defeats the isolation.

### 4. Keep branch ownership clear

- One worktree per checked-out branch
- One main task per worktree
- Clear branch names (`feature/*`, `fix/*`, `docs/*`)
- Keep a short note on what each worktree is for

If the task also uses fleet or background agents, pass the exact worktree path in the brief.

### 5. Merge and clean up

After the branch is merged or no longer needed:

```powershell
# Sibling layout
git worktree remove ..\repo-feature-api

# Project-internal layout
git worktree remove .worktrees\feature-api

git worktree prune
```

If uncommitted changes remain and removal is intentional:

```powershell
git worktree remove --force .worktrees\feature-api
git worktree prune
```

Before any forced cleanup, verify that the target path is a real worktree path from
`git worktree list`. Do not pass an unchecked or hand-typed path straight into force removal.

```powershell
$target = Resolve-Path ..\repo-feature-api
$known = git worktree list --porcelain |
  Select-String '^worktree ' |
  ForEach-Object { $_.ToString().Substring(9) }

if ($target.Path -notin $known) {
    throw "Refusing cleanup: path is not a registered git worktree"
}
```

## For Copilot Orchestrators: Direct Agents into the Right Worktree

Copilot CLI does not expose a dedicated `EnterWorktree` tool. The safe equivalent is to put
the agent in the correct checkout up front and restate that boundary in the brief.

Use a prompt that names the exact worktree path and forbids edits in the main checkout:

```text
Work only in C:\work\repo-feature-api.
Treat that worktree as your writable surface.
Read the main checkout for reference if needed, but do not edit, create, or delete files there.
```

Operational rules:

- Launch each background or delegated agent from the intended worktree, or give it commands that
  explicitly `Set-Location` into that path before it edits anything.
- Keep one active branch and one primary owner per worktree.
- If multiple agents need different branches, create multiple worktrees rather than sharing one.
- Pair this with a narrow file brief when the worktree still contains too much writable surface.
- Verify the branch and path pairing before destructive cleanup or recreation.

## Windows Tips

- Prefer relative sibling paths like `..\repo-feature-api`
- Keep names short enough to avoid deep path problems
- If tooling caches absolute paths, run setup once per worktree
- Each worktree needs its own untracked build artifacts and environment state
- If a worktree stores shared notes or copied logs, scrub secrets and tokens before committing them

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Reusing the same branch in multiple worktrees | Create a second branch or remove the first worktree |
| Forgetting which directory maps to which task | Name folders after the branch or task |
| Leaving stale worktree references behind | Run `git worktree prune` regularly |
| Treating worktrees like fully separate repositories | Remember git history and object storage are shared |
| Forcing cleanup on the wrong path | Check `git worktree list` and resolve the path before removal |

## Verification

- [ ] Each parallel task has its own directory and branch
- [ ] No two active tasks are editing through the same worktree
- [ ] `git worktree list` shows the expected layout
- [ ] Finished worktrees are removed and pruned
- [ ] Any forced cleanup path was verified against the registered worktree list

## Runtime Notes

### Claude Code: Enter an Existing Worktree

Claude Code v2.1.105+ exposes `EnterWorktree(path)` for switching into an
existing worktree of the current repository.

Use it after the orchestrator or human has already created the worktree with
`git worktree add`. Keep worktree creation and cleanup Git-native; use
`EnterWorktree` only to place a Claude subagent inside the correct checkout.

```text
EnterWorktree(path: "/path/to/existing-worktree")
```

Pattern:

1. Create the worktree with `git worktree add`
2. Pass the exact worktree path to the subagent
3. Enter that checkout with `EnterWorktree`
4. Keep one subagent per worktree

### Claude Code only: `worktree.baseRef` when Claude creates the worktree

Claude Code v2.1.133+ also supports a `worktree.baseRef` setting that affects
**Claude-created** worktrees. This setting matters only when Claude is creating
the worktree for a subagent; it does **not** change the recommended flow in this
skill, where you create the worktree yourself with `git worktree add` and then
enter it explicitly.

```json
{
  "worktree": {
    "baseRef": "fresh"
  }
}
```

| Value | Effect |
|-------|--------|
| `"fresh"` (default) | Start from the remote default branch baseline, so unpublished local commits are not carried into the new worktree |
| `"head"` | Start from the current local HEAD, so unpublished local commits are carried into the new worktree |

Use `"head"` only when the subagent must inherit local, unpushed commits.
For the Git-native workflow in this skill (`git worktree add` first), this
setting is usually not needed.

## See Also

- [`fleet-parallel`](../../copilot-exclusive/fleet-parallel/SKILL.md) — distribute independent work in parallel
- [`scope-guard`](../../copilot-exclusive/scope-guard/SKILL.md) — narrow writable scope inside a checkout or worktree
- [`github-pr-workflow`](../../copilot-exclusive/github-pr-workflow/SKILL.md) — move isolated branch work into PR flow
- [`commit-workflow`](../commit-workflow/SKILL.md) — keep each branch's commits clean and atomic
