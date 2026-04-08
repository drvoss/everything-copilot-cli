---
name: commit-workflow
description: Use when you're about to commit (especially with a mixed diff) to stage changes, split into atomic commits, and write Conventional Commit messages with emoji
metadata:
  category: workflow
  agent_type: general-purpose
---

# Commit Workflow

## When to Use

- Before every commit — to enforce conventional commit format consistently
- When a diff mixes multiple logical concerns (feat + refactor + docs)
- When you want emoji-annotated commits for visual git history
- In teams that enforce Conventional Commits via CI

## Prerequisites

- Changes staged or present as unstaged modifications
- Optional: pre-commit hooks configured (`husky`, `pre-commit`, or similar)

## Workflow

### 1. Stage and Inspect

If nothing is staged, stage everything and inspect what changed:

```powershell
# Check current state
git --no-pager status --short

# Stage all if nothing is staged
$staged = git --no-pager diff --cached --name-only
if (-not $staged) { git add -A }

# Review the diff
git --no-pager diff --cached --stat
```

### 2. Run Pre-Commit Checks (Optional)

```powershell
# Node.js projects
npm run lint && npm run build

# Python projects
ruff check . && pytest --tb=short -q

# Generic pre-commit hooks
pre-commit run --all-files
```

Skip with `--no-verify` flag on the final commit if checks are handled externally.

### 3. Analyze the Diff for Atomic Splits

```powershell
git --no-pager diff --cached
```

Ask: *Do these changes serve more than one logical purpose?*

**Split when changes involve:**
- Different concerns (e.g., new feature **and** bug fix)
- Different file types (e.g., source code **and** documentation)
- Different modules with no dependency between them

If splitting, use `git add -p` to stage partial hunks:

```powershell
git add -p   # interactive hunk selection
```

### 4. Write the Commit Message

Format: `<emoji> <type>(<scope>): <imperative description>`

**Type → Emoji mapping (most common):**

| Type | Emoji | Use for |
|------|-------|---------|
| `feat` | ✨ | New feature |
| `fix` | 🐛 | Bug fix |
| `fix` | 🚑️ | Critical hotfix |
| `docs` | 📝 | Documentation only |
| `style` | 💄 | Formatting, no logic change |
| `refactor` | ♻️ | Code change without feat/fix |
| `perf` | ⚡️ | Performance improvement |
| `test` | ✅ | Adding or fixing tests |
| `chore` | 🔧 | Build, tooling, config |
| `ci` | 👷 | CI/CD changes |
| `revert` | ⏪️ | Reverting a change |
| `wip` | 🚧 | Work in progress |
| `security` | 🔒️ | Security fix |
| `breaking` | 💥 | Breaking change |
| `deps` | ➕ | Add dependency |
| `deps` | ➖ | Remove dependency |

**Rules:**
- First line ≤ 72 characters
- Imperative mood: "add feature" not "added feature"
- Scope is optional: `feat(auth): add JWT refresh`

```powershell
git commit -m "✨ feat(api): add pagination to /users endpoint"
```

### 5. Multi-Commit Flow (Split Changes)

```powershell
# First logical unit
git add src/api/users.ts
git commit -m "✨ feat(api): add cursor-based pagination to users endpoint"

# Second logical unit
git add docs/api.md
git commit -m "📝 docs(api): document pagination parameters for users endpoint"

# Third logical unit (cleanup found along the way)
git add src/utils/query.ts
git commit -m "♻️ refactor(utils): extract page-size validation into shared helper"
```

## Examples

### Feature with Co-authored Docs

```powershell
git add -A
git commit -m "✨ feat(notifications): add real-time push alerts via WebSocket

- Implement WebSocket connection pool
- Add client-side reconnect logic with exponential backoff
- Write integration tests for disconnect/reconnect scenarios

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Hotfix

```powershell
git add src/auth/token.ts
git commit -m "🚑️ fix(auth): prevent JWT secret from leaking into error logs"
```

### Breaking Change

```powershell
git commit -m "💥 feat(config)!: rename API_KEY to COPILOT_API_KEY

BREAKING CHANGE: rename environment variable API_KEY → COPILOT_API_KEY.
Update .env files and CI secrets before deploying."
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Commit fast, clean up messages later" | Messages written later lose the original context. The intent at commit time is the most accurate. |
| "WIP commits will be squashed later" | PRs more often merge without squashing. Write meaningful commits from the start. |
| "Nobody reads commit messages" | `git log`, `git blame`, and `git bisect` all depend on commit messages. |
| "It's a small change, no type prefix needed" | Small changes are the easiest to classify. Without classification, changelogs become impossible. |

## Red Flags
- Meaningless commit messages like `fix`, `update`, `changes`, `stuff`
- Multiple unrelated changes bundled in one commit
- No issue or PR reference in the commit message
- Hundreds of lines of changes committed as "minor fix"
- Tests and implementation in separate commits for the same feature

## Verification
- [ ] Commit message follows Conventional Commits format (`type(scope): description`)
- [ ] Each commit contains exactly one logical change
- [ ] Breaking changes are marked with `BREAKING CHANGE:`
- [ ] `git log --oneline` tells a readable story of the changes
## Tips

- **Check `git log --oneline` after** — if you can't parse the history at a glance, the messages need work
- **One commit = one revert**: if reverting a commit breaks something unrelated, it wasn't atomic
- **Use `git commit --amend`** to fix the last message before pushing
- **`git add -p` is your friend** for splitting mixed diffs without stashing
- **CI conventional commit lint**: add `commitlint` to `husky` to enforce format automatically

## See Also

- [`add-to-changelog`](../../documentation/add-to-changelog/SKILL.md) — keep CHANGELOG in sync after committing
- [Conventional Commits spec](https://www.conventionalcommits.org/)
- [gitmoji reference](https://gitmoji.dev/)
- *Inspired by: [awesome-claude-code/resources/slash-commands/commit](https://github.com/hesreallyhim/awesome-claude-code)*

