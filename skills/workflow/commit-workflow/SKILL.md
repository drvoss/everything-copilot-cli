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
| "빠르게 커밋하고 나중에 메시지 정리하겠다" | 나중에 정리한 커밋은 원래 맥락을 잃는다. 커밋 시점의 의도가 가장 명확하다. |
| "WIP 커밋은 나중에 squash할 것이다" | Squash 없이 PR이 머지되는 경우가 더 많다. 처음부터 의미있는 커밋을 만들어라. |
| "커밋 메시지는 아무도 안 읽는다" | `git log`, `git blame`, `git bisect`는 모두 커밋 메시지에 의존한다. |
| "작은 변경이라 타입 분류가 필요 없다" | 소규모 변경일수록 타입 분류가 쉽다. 분류하지 않으면 changelog가 불가능하다. |

## Red Flags
- `fix`, `update`, `changes`, `stuff` 같은 의미없는 커밋 메시지
- 하나의 커밋에 관련 없는 여러 변경사항 묶음
- 커밋 메시지에 이슈/PR 참조 없음
- 수백 줄 변경이 "minor fix"로 커밋됨
- 테스트와 구현이 별도 커밋 (같은 기능이면 함께 커밋)

## Verification
- [ ] 커밋 메시지가 Conventional Commits 형식을 따름 (`type(scope): description`)
- [ ] 각 커밋이 하나의 논리적 변경만 포함
- [ ] Breaking change가 있으면 `BREAKING CHANGE:` 표기
- [ ] `git log --oneline` 으로 봤을 때 변경 히스토리가 읽힘

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
