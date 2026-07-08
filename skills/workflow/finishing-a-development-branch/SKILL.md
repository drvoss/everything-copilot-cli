---
name: finishing-a-development-branch
description: Use when implementation is complete and tests pass but the branch itself is not yet resolved — verify tests, detect worktree vs. normal checkout, then present merge/PR/keep/discard options and execute the chosen cleanup
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from obra/superpowers finishing-a-development-branch
---

# Finishing a Development Branch

`commit-workflow` gets changes into commits, `release` ships a version, and `github-pr-workflow`
manages PRs that already exist. None of them answer the question that comes right after
implementation finishes: **what happens to this branch now?** This skill closes that gap.

**Core principle:** Verify tests → detect environment → present options → execute the choice →
clean up.

## When to Use

- Implementation on a feature/fix branch is complete and its own tests pass
- You need to decide between merging locally, opening a PR, leaving the branch for later, or
  discarding it — and the workspace (worktree vs. normal checkout) affects how cleanup should work
- A `subagent-driven-development`-style task loop (see `fleet-parallel` §5-A) just finished its
  final whole-branch review and needs a clean handoff

## When NOT to Use

| Instead of finishing-a-development-branch | Use |
|--------------------------------------------|-----|
| You need conventional commit messages while still working | `commit-workflow` |
| The branch is already merged and you are cutting a version | `release` |
| You need PR-lifecycle operations (labels, review requests, merge) once a PR exists | `github-pr-workflow` |
| You just need to create or remove a worktree, independent of a merge decision | `using-git-worktrees` |

## Workflow

### 1. Verify tests pass

```powershell
npm test  # or the project's actual test command
```

If tests fail, stop here. Report the failures and do not proceed to any option below — a
failing branch has nothing to finish yet.

### 2. Detect the workspace environment

```powershell
$gitDir = git rev-parse --git-dir
$gitCommon = git rev-parse --git-common-dir
```

| State | Menu | Cleanup behavior |
|-------|------|-------------------|
| `$gitDir == $gitCommon` | Standard 4 options (below) | No worktree involved |
| `$gitDir != $gitCommon`, named branch (a worktree) | Standard 4 options | Worktree removed only for Merge/Discard, per Step 4 |
| `$gitDir != $gitCommon`, detached HEAD | Reduced 3 options (no local merge) | Externally managed — do not remove |

### 3. Determine the base branch

```powershell
git merge-base HEAD main 2>$null
if (-not $?) { git merge-base HEAD master 2>$null }
```

If neither resolves, ask which branch this work should integrate into.

### 4. Present options and execute the choice

**Normal repo or named-branch worktree:**

```text
Implementation complete. What would you like to do?
1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is
4. Discard this work
```

**Detached HEAD:**

```text
Implementation complete (detached HEAD — externally managed workspace).
1. Push as a new branch and create a Pull Request
2. Keep as-is
3. Discard this work
```

Keep the menu terse — do not pad it with explanation.

| Option | Action | Worktree cleanup |
|--------|--------|-------------------|
| Merge locally | See **Merging from a worktree** below, then delete the branch | Yes — remove after merge succeeds |
| Push + PR | Named branch: `git push -u origin <branch>`. Detached HEAD: `git checkout -b <new-branch-name>` first, then `git push -u origin <new-branch-name>`. Either way, hand off to `github-pr-workflow` | No — the worktree must stay alive for review iteration |
| Keep as-is | Report the branch name (or commit SHA, if detached) and worktree path; do nothing else | No |
| Discard | Require the user to type the literal word `discard` to confirm, listing the commits and worktree path that will be deleted. Named branch: force-delete the branch, then remove the worktree. Detached HEAD: this workspace is externally managed (see Step 2) — do not remove it or the branch; report which commits are being abandoned and let the host harness reclaim the workspace | Named branch only — remove before/instead of deleting the branch. Never for detached HEAD |

Never remove a worktree for "Push + PR" or "Keep as-is" — the whole point of those two options is
that the workspace must remain usable afterward. Never remove a detached-HEAD workspace yourself
under any option — Step 2 already established it is externally managed.

#### Merging from a worktree

If the base branch is already checked out somewhere else (the common case when this branch lives
in its own worktree), running `git checkout <base>` from inside the feature worktree fails with
`fatal: '<base>' is already checked out at ...`. Merge from the worktree/checkout that actually
owns the base branch instead of the feature worktree:

```powershell
# Resolve the main checkout (where the base branch actually lives)
$mainRoot = git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel

# Merge in the main checkout, not the feature worktree
Push-Location $mainRoot
git checkout <base-branch>
git pull
git merge <feature-branch>
<test command>   # re-verify tests on the merged result before cleanup
Pop-Location
```

Only proceed to worktree cleanup (Step 5) and branch deletion after the merge and its test run
both succeed. If `$mainRoot` equals the current directory (normal repo, no worktree), the
`Push-Location`/`Pop-Location` pair is a no-op and the merge runs in place as expected.

### 5. Clean up the workspace (Merge and Discard only)

```powershell
$worktreePath = git rev-parse --show-toplevel
```

- If `$gitDir == $gitCommon`: no worktree exists — nothing to remove.
- If the worktree lives under a path this workflow (or `using-git-worktrees`) created, remove it
  and prune stale registrations from the main checkout:

  ```powershell
  $mainRoot = git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel
  Push-Location $mainRoot
  git worktree remove $worktreePath
  git worktree prune
  Pop-Location
  ```

- Otherwise, a host harness or externally managed environment owns the workspace — do not remove
  it yourself. Use the platform's own workspace-exit mechanism if one exists, or leave it in place.

## Examples

### Finishing a fleet task-loop branch

After `fleet-parallel` §5-A's final whole-branch review passes:

```text
> Implementation complete. What would you like to do?
> 1. Merge back to main locally
> 2. Push and create a Pull Request
> 3. Keep the branch as-is
> 4. Discard this work
"2" — push and open a PR so the team can review before merge.
```

### Discarding an abandoned spike

```text
> This will permanently delete:
> - Branch spike/cache-experiment
> - 4 commits
> - Worktree at .worktrees/spike-cache
> Type 'discard' to confirm.
"discard"
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Tests passed in CI earlier, skip re-checking now" | Re-verify at the point of decision — commits may have landed since the last CI run. |
| "I'll just delete the worktree, the branch can go too" | Options 2 and 3 exist specifically because the worktree must survive; always match cleanup to the chosen option. |
| "Discard is obviously fine, no need to list what's lost" | Force-delete is irreversible — always show the exact branch, commits, and path before requiring explicit confirmation. |

## Red Flags

- A branch is merged or discarded without first re-running its tests
- A worktree is removed after "Push and create a Pull Request" or "Keep as-is"
- A discard proceeds without the user typing the literal confirmation word
- The workspace state (worktree vs. normal checkout, attached vs. detached HEAD) was never checked before presenting options

## Verification

- [ ] Tests were re-verified immediately before presenting options
- [ ] The workspace state (worktree/detached HEAD) was detected before choosing a menu
- [ ] The executed action matches the option chosen — no extra cleanup on Push/Keep, no missing cleanup on Merge/Discard
- [ ] Discard required an explicit typed confirmation naming what will be deleted

## See Also

- [`commit-workflow`](../commit-workflow/SKILL.md) — atomic commits while work is still in progress
- [`release`](../release/SKILL.md) — version tagging and publishing once work is merged
- [`github-pr-workflow`](../../copilot-exclusive/github-pr-workflow/SKILL.md) — PR lifecycle once a PR exists
- [`using-git-worktrees`](../using-git-worktrees/SKILL.md) — creating and managing the worktrees this skill may clean up
- [`fleet-parallel`](../../copilot-exclusive/fleet-parallel/SKILL.md) — §5-A's final whole-branch review hands off here
