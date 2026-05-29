---
name: conventional-branch
description: >
  Use when creating or validating a Git branch name so the branch follows a
  conventional type/description format, matches the work being done, and starts
  from the right base branch.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot conventional-branch (MIT)
---

# Conventional Branch

Create branch names that are easy to scan, easy to sort, and easy to align with
Conventional Commits.

## When to Use

- Starting a new task and no branch exists yet
- Renaming or validating a branch before pushing it
- Aligning branch naming with a team convention such as `feature/...` or `fix/...`
- Mapping a work item to a predictable branch slug before parallel work begins

## When NOT to Use

| Instead of conventional-branch | Use |
|--------------------------------|-----|
| Writing or splitting commit messages | `commit-workflow` |
| Creating isolated parallel checkouts for multiple branches | `using-git-worktrees` |
| Switching to an already agreed branch name with no validation needed | create or checkout the branch directly |

## Branch Shape

```text
<type>/<description>
```

### Allowed types

| Type | Alias | Good fit |
|------|-------|----------|
| `feature` | `feat` | New features or enhancements |
| `fix` | `bugfix` | Non-urgent bug fixes |
| `hotfix` | — | Urgent production fixes |
| `release` | — | Release preparation branches |
| `docs` | — | Documentation-only changes |
| `chore` | — | Tooling, config, or housekeeping |

`main`, `master`, and `develop` remain reserved trunk branches. Do not treat
them as valid topic branch names in this workflow.

## Naming Rules

- Lowercase only
- Use letters, digits, and hyphens in normal descriptions
- Allow dots only for release versions such as `release/v1.2.0`
- No spaces, underscores, or special characters
- No consecutive hyphens or dots
- No `-.` or `.-`
- No leading or trailing hyphen or dot in the description

## Valid examples

```text
feature/add-login-page
feat/issue-123-add-login
fix/fix-header-overflow
hotfix/security-patch
release/v1.2.0
docs/update-docs-links
```

## Workflow

### 1. Decide the branch type

Choose the type from the actual work:

- new capability -> `feature`
- defect correction -> `fix`
- urgent production repair -> `hotfix`
- release prep -> `release`
- documentation-only change -> `docs`
- tooling or config cleanup -> `chore`

If the user did not specify a type, default to `feature` unless the task is
clearly a fix or release action.

### 2. Normalize the description

Turn the work summary into a short kebab-case slug:

1. keep 2-5 meaningful words
2. include an issue number only when it helps disambiguate
3. remove filler words
4. replace spaces and underscores with hyphens
5. collapse repeated separators

Examples:

- `Add OAuth Login` -> `add-oauth-login`
- `issue 123 fix header bug` -> `issue-123-fix-header-bug`
- `Release 1.2.0` -> `v1.2.0`

### 3. Validate the final name

Use a quick validation pass before creating the branch:

```powershell
$branch = "feature/add-oauth-login"

if ($branch -cmatch '[A-Z]') { throw "Branch must be lowercase." }
if ($branch -match '[ _]') { throw "Branch cannot contain spaces or underscores." }
if ($branch -match '--|\.\.|-\.|\.-') { throw "Branch has an invalid separator sequence." }
if ($branch -notmatch '^(?:feature|feat|fix|bugfix|hotfix|release|docs|chore)\/[a-z0-9][a-z0-9.-]*[a-z0-9]$') {
  throw "Branch does not match the conventional pattern."
}

$parts = $branch.Split('/', 2)
if ($parts.Count -eq 2) {
  $type = $parts[0]
  $description = $parts[1]
  if ($type -ne 'release' -and $description -match '\.') {
    throw "Dots are only allowed for release branches."
  }
}
```

For release branches, verify the description still looks like a version rather
than a prose sentence.

### 4. Detect the base branch

Prefer the remote default branch first, then fall back to local trunk branches:

```powershell
$base = git symbolic-ref --short refs/remotes/origin/HEAD 2>$null
if ($base) {
  $base = $base -replace '^origin/', ''
} else {
  foreach ($candidate in @('develop', 'main', 'master')) {
    git show-ref --verify --quiet "refs/heads/$candidate"
    if ($LASTEXITCODE -eq 0) {
      $base = $candidate
      break
    }
  }
}

if (-not $base) { throw "Could not determine the base branch." }
```

### 5. Create and switch

```powershell
$branch = "feature/add-oauth-login"

$hasRemoteBase = $false
git ls-remote --exit-code origin "refs/heads/$base" *> $null
if ($LASTEXITCODE -eq 0) {
  $hasRemoteBase = $true
}

git checkout $base
if ($hasRemoteBase) {
  git pull origin $base
}
git checkout -b $branch
```

Report:

1. the created branch name
2. the detected base branch
3. whether the branch started from a synced remote base or a local fallback
4. the follow-up push command: `git push -u origin <branch>`

## Relationship to Conventional Commits

Keep the branch type aligned with the likely commit prefix when practical:

| Branch | Typical commit |
|--------|----------------|
| `feature/add-login` | `feat: add login` |
| `fix/fix-header` | `fix: correct header overflow` |
| `docs/update-readme` | `docs: refresh setup guide` |
| `chore/update-deps` | `chore: bump dependencies` |
| `release/v1.2.0` | `chore: release v1.2.0` |

## Verification

- [ ] The branch name matches the allowed type/description format
- [ ] The slug is lowercase kebab-case (or release version form)
- [ ] Dots only appear in release branch descriptions
- [ ] The base branch was detected before checkout
- [ ] The final branch name describes the work without filler

## See Also

- [`commit-workflow`](../commit-workflow/SKILL.md) - align later commit messages with the branch intent
- [`using-git-worktrees`](../using-git-worktrees/SKILL.md) - isolate multiple topic branches in parallel
