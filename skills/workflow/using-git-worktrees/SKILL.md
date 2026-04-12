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

Use sibling folders so each worktree is obvious:

```text
C:\work\repo-main
C:\work\repo-feature-api
C:\work\repo-feature-docs
```

Name the folder after the branch or task.

### 2. Create the worktree

```powershell
# Existing branch
git worktree add ..\repo-feature-api feature/api-contract

# New branch created from the current HEAD
git worktree add -b feature/perf-audit ..\repo-perf-audit

# Inspect active worktrees
git worktree list
```

Each worktree gets its own working directory while sharing the same repository object database.

### 3. Assign one worktree per task

Use a dedicated branch and directory for each independent task:

- Agent A -> `..\repo-feature-api`
- Agent B -> `..\repo-perf-audit`
- Agent C -> `..\repo-docs-sync`

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
git worktree remove ..\repo-feature-api
git worktree prune
```

If uncommitted changes remain and removal is intentional:

```powershell
git worktree remove --force ..\repo-feature-api
git worktree prune
```

## Windows Tips

- Prefer relative sibling paths like `..\repo-feature-api`
- Keep names short enough to avoid deep path problems
- If tooling caches absolute paths, run setup once per worktree
- Each worktree needs its own untracked build artifacts and environment state

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Reusing the same branch in multiple worktrees | Create a second branch or remove the first worktree |
| Forgetting which directory maps to which task | Name folders after the branch or task |
| Leaving stale worktree references behind | Run `git worktree prune` regularly |
| Treating worktrees like fully separate repositories | Remember git history and object storage are shared |

## Verification

- [ ] Each parallel task has its own directory and branch
- [ ] No two active tasks are editing through the same worktree
- [ ] `git worktree list` shows the expected layout
- [ ] Finished worktrees are removed and pruned

## See Also

- [`fleet-parallel`](../../copilot-exclusive/fleet-parallel/SKILL.md) — distribute independent work in parallel
- [`github-pr-workflow`](../../copilot-exclusive/github-pr-workflow/SKILL.md) — move isolated branch work into PR flow
- [`commit-workflow`](../commit-workflow/SKILL.md) — keep each branch's commits clean and atomic
