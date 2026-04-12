# Hooks to GitHub Actions (and Alternatives)

> **Claude Code → Copilot CLI Migration Guide: Hooks Edition**

Claude Code **Hooks** are scripts that run on events within an AI session.
Copilot CLI does not have the same in-session hook system, but depending on the purpose,
there are three alternatives.

---

## Claude Code Hooks Overview

Claude Code supports hooks for the following events:

| Hook type | When it runs |
|---------|----------|
| `PreToolUse` | Right before the AI uses a tool (file edits, command execution, etc.) |
| `PostToolUse` | Right after the AI uses a tool |
| `Notification` | When the AI session requests attention |
| `Stop` | When the AI session completes |
| `SubagentStop` | When a subagent completes |

**Key difference**: Claude Code Hooks respond to *AI session lifecycle* events.
Copilot CLI does not have a direct equivalent mechanism.

---

## Alternative Mapping (Alternatives, Not Equivalents)

The table below shows ways to achieve similar effects in the Copilot ecosystem based on the
*purpose* of Claude Code Hooks.

| Claude Code Hook | Main use case | Copilot alternative 1 | Copilot alternative 2 | Copilot alternative 3 |
|-----------------|---------------|---------------|---------------|---------------|
| `PreToolUse` | Run lint/validation before changes | [Git Pre-commit Hook](#alternative-1-git-pre-commit-hooks) | [GitHub Actions (PR)](#alternative-2-github-actions) | [Pre-task Checklist in Prompt](#alternative-3-prompt-level-guards) |
| `PostToolUse` | Run tests/formatting after changes | [Git Post-commit Hook](#alternative-1-git-pre-commit-hooks) | [GitHub Actions (push)](#alternative-2-github-actions) | — |
| `Stop` | Generate a summary after the AI session ends | GitHub Actions (when PR is created) | Manual | — |
| `Notification` | Send notifications | GitHub Actions (Slack/Email) | `gh` CLI notification | — |
| `SubagentStop` | Aggregate subagent results | [Fleet + GitHub Actions](#alternative-2-github-actions) | Orchestration pattern | — |

---

## Alternative 1: Git Pre-commit Hooks

**Best for**: enforcing code quality right before commits, similar to `PreToolUse`

### Husky + lint-staged (Node.js)

```powershell
# Install
npm install --save-dev husky lint-staged
npx husky init

# Create .husky/pre-commit
@"
npx lint-staged
"@ | Set-Content .husky/pre-commit

# Add lint-staged settings to package.json
# {
#   "lint-staged": {
#     "*.{ts,js}": ["eslint --fix", "prettier --write"],
#     "*.md": ["markdownlint --fix"]
#   }
# }
```

### pre-commit (Python/general-purpose)

```powershell
# Install
pip install pre-commit

# Create .pre-commit-config.yaml
@"
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
"@ | Set-Content .pre-commit-config.yaml

pre-commit install
```

**Pros**: runs immediately locally, no network required  
**Cons**: team members must install the hook (`pre-commit install`)

---

## Alternative 2: GitHub Actions

**Best for**: CI/CD-level automation such as PR gates, deployment verification, and notifications

### PR Gate (CI equivalent of PreToolUse)

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

### Post-Merge Notification (CI equivalent of Stop Hook)

```yaml
# .github/workflows/notify-on-merge.yml
name: Notify on Merge

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  notify:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.26.0
        with:
          channel-id: '#deployments'
          slack-message: "✅ PR #${{ github.event.number }} merged: ${{ github.event.pull_request.title }}"
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### Fleet Agent Results Aggregation (equivalent to SubagentStop)

```yaml
# .github/workflows/multi-agent-review.yml
name: Multi-Agent Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  security-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Security Scan
        run: npm run security:scan > security-results.txt
      - uses: actions/upload-artifact@v4
        with:
          name: security-results
          path: security-results.txt

  quality-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Quality Analysis
        run: npm run quality:check > quality-results.txt
      - uses: actions/upload-artifact@v4
        with:
          name: quality-results
          path: quality-results.txt

  aggregate-results:
    needs: [security-review, quality-review]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - name: Post Aggregated Review
        run: |
          echo "## Automated Review Results" >> review.md
          cat security-results/security-results.txt >> review.md
          cat quality-results/quality-results.txt >> review.md
          gh pr comment ${{ github.event.number }} --body-file review.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Pros**: automatically applies to all team members, managed as infrastructure  
**Cons**: only responds to CI/CD pipeline events, not AI session events

---

## Alternative 3: Prompt-Level Guards

**Best for**: telling the AI to perform checks before executing work (`PreToolUse` equivalent
at the prompt level)

### Add rules to `.github/copilot-instructions.md`

```markdown
## Before Making Changes

Before modifying any file:
1. Run `npm run lint` and fix any existing errors first
2. Check `git status` — do not work on uncommitted changes from a previous session
3. For security-sensitive files (auth/, config/), read the file completely before editing

## After Making Changes

After any code changes:
1. Run the relevant test suite: `npm test -- --testPathPattern="<changed-file>"`
2. Verify `npm run build` succeeds before committing
3. Update CHANGELOG.md if the change is user-visible
```

### Checklist prompt at session start

```text
> Before we start today's work:
> 1. Run npm run lint and show me any errors
> 2. Run npm test and show me the pass/fail summary
> 3. Show me the last 3 commits
> Then proceed with the task.
```

**Pros**: no extra installation required, applies immediately  
**Cons**: the AI may ignore the instructions; there is no hard enforcement

---

## Recommended Alternatives by Use Case

| Purpose | Recommended alternative | Reason |
|-----|----------|------|
| Enforce linting before commit | Git Pre-commit Hook (Husky) | Immediate local execution, simple setup |
| Test gate before PR merge | GitHub Actions | Enforced for the whole team |
| Context check before AI work | Prompt-Level Guard | No extra infrastructure needed |
| Post-deployment notifications | GitHub Actions | Reliable and reusable |
| Aggregate parallel agent results | GitHub Actions + Fleet | Combines Copilot Fleet with CI |

---

## Migration Example from Claude Code Hooks

### Original: Claude Code `Stop` Hook

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo 'Session complete' | notify-send"
      }]
    }]
  }
}
```

### Copilot alternative A: GitHub Actions (Slack notification on push)

```yaml
on:
  push:
    branches: [main]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Push to main completed"
      # Slack notification step here
```

### Copilot alternative B: Prompt Guard (pre-session checklist)

```markdown
## Session Wrap-Up (copilot-instructions.md)
At the end of each task:
1. Run the test suite
2. Commit all changes with conventional commit format
3. Update the CHANGELOG.md [Unreleased] section
```

---

## Alternative 4: AST-Based Safe Command Auto-Approval (Dippy Pattern)

**Best for**: replacing the pattern where `PreToolUse` hooks automatically approved or rejected
CLI commands

Claude Code hooks could intercept `bash` commands before execution and judge safety using AST
or pattern analysis. Copilot CLI does not have the same mechanism, but you can achieve a
similar effect with an **allowlist + prompt guard** approach.

### Allowlist-based approach

Explicitly list command patterns known to be safe in `.github/copilot-instructions.md`:

```markdown
## Safe Commands (auto-proceed without asking)

The following command patterns are safe to execute without confirmation:
- `git status`, `git log`, `git diff` — read-only git operations
- `npm test`, `npm run lint`, `npm run build` — standard project scripts
- `Get-Content`, `Select-String` — read-only file inspection
- `node --version`, `npm --version` — version checks

## Requires Confirmation

Always ask before:
- `git push`, `git force-push` — remote state changes
- `rm`, `Remove-Item` — file deletion
- Any command with `--force` or `-f` flags
- Database migrations or schema changes
```

### Pattern matching approach (PowerShell pre-commit hook)

A local script that detects dangerous patterns before committing:

```powershell
# .husky/pre-commit (dangerous pattern detection)
$dangerousPatterns = @(
    'rm -rf',
    '--force',
    'DROP TABLE',
    'DELETE FROM.*WHERE 1=1',
    'eval\(',
    'shell=True'
)

$stagedFiles = git diff --cached --name-only
foreach ($file in $stagedFiles) {
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    foreach ($pattern in $dangerousPatterns) {
        if ($content -match $pattern) {
            Write-Host "⚠️  Dangerous pattern '$pattern' found in $file"
            Write-Host "Review before committing."
            exit 1
        }
    }
}
```

**Pros**: explicit, version-controlled, and applies to the whole team  
**Cons**: scans source code only, not runtime commands, so it is not as fine-grained as
Claude Code Hooks

> **Note:** [Dippy](https://github.com/dippyai/dippy) is an AST-based safe command
> auto-approval pattern for Claude Code. If you want a similar security level in Copilot CLI,
> the allowlist approach above is a practical alternative.

---

## Related Guides

- [`migration-from-claude-code.md`](./migration-from-claude-code.md) — overall migration overview
- [`context-prime`](../skills/copilot-exclusive/context-prime/SKILL.md) — loading context at session start
- [`commit-workflow`](../skills/workflow/commit-workflow/SKILL.md) — commit automation
- [GitHub Actions official documentation](https://docs.github.com/en/actions)
- [Husky official documentation](https://typicode.github.io/husky/)
