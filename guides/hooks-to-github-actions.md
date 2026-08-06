# Hooks to GitHub Actions (and Alternatives)

> **Claude Code → Copilot CLI Migration Guide: Hooks Edition**
>
> **⚠️ Updated 2026-07-20 (Copilot CLI v1.0.72+ / weekly cycle correction):** earlier revisions of
> this guide said Copilot CLI has no in-session hook system. **That is no longer accurate.**
> Copilot CLI now ships a real, documented hook system with 14 events — including a `preCompact`
> hook (yes, Copilot now has this too) and a `notification` hook — configured via JSON files,> with a `preToolUse` hook that can **allow or deny tool executions**, a direct first-party
> equivalent to Claude Code's `PreToolUse`. See
> [Copilot CLI's Native Hook System](#copilot-clis-native-hook-system) below before reaching for
> Git hooks, GitHub Actions, or prompt-level guards as a workaround. The Git/Actions/prompt-guard
> alternatives further down in this guide are still valid — but as *infrastructure-level*
> complements (e.g., CI-enforced team-wide gates), not as the only option for in-session events.
> **Source verified directly against `docs.github.com/en/copilot/reference/hooks-reference` on
> 2026-07-21** — a first pass at this rewrite under-counted the event list (8 vs the real 14) and
> wrongly said `preCompact`/`notification` don't exist; corrected below.

Claude Code **Hooks** are scripts that run on events within an AI session. Copilot CLI now has
its own in-session hook system with a different event set and JSON config format — this guide
maps Claude Code's hooks to Copilot CLI's native hooks first, then covers Git/GitHub Actions/
prompt-guard alternatives for anything with no native hook equivalent (or for team-wide
enforcement that should live in CI regardless of hooks).

---

## Copilot CLI's Native Hook System

Copilot CLI hooks are JSON files with a `version: 1` field and a `hooks` object. They can live in:

- `.github/hooks/*.json` — repository-level, applies to anyone using Copilot CLI/cloud agent in the repo
- `~/.copilot/hooks/*.json` (or `%USERPROFILE%\.copilot\hooks\` on Windows) — user-level, personal
- an inline `hooks` field inside `.github/copilot/settings.json` / `~/.copilot/settings.json`
- hooks bundled by an installed plugin (`hooks.json` inside the plugin's install directory)
- machine-wide policy hook files (`/etc/github-copilot/policy.d/*.json` or the Windows registry) — admin-managed, cannot be disabled

Full supported event list (14 events), including whether stdout output is processed:

| Copilot CLI hook | Fires when | Output processed |
|---|---|---|
| `sessionStart` | A new or resumed session begins | Optional `additionalContext` injection |
| `sessionEnd` | The session terminates | No |
| `userPromptSubmitted` | The user submits a prompt | No |
| `userPromptTransformed` | After the runtime transforms a submitted prompt into model-facing content | Yes — mutation-only: rewrites content, cannot block or handle the turn |
| `preToolUse` | Before each tool executes | Yes — allow, deny, ask, or modify |
| `permissionRequest` | Before the permission service runs (rules engine, session approvals, auto-allow/auto-deny, user prompting) | Yes — allow or deny programmatically, short-circuiting the normal permission flow |
| `postToolUse` | After a tool completes successfully | Yes — replace result or add context |
| `postToolUseFailure` | After a tool fails | Yes — recovery guidance via `additionalContext` |
| `preCompact` | Context compaction is about to begin (manual or automatic) | No — notification only, cannot block compaction |
| `agentStop` | The main agent finishes a turn | Yes — allow or block and continue |
| `subagentStart` | A subagent is spawned, before it runs (not emitted by the built-in `general-purpose` agent) | Optional `additionalContext` prepended to the subagent's prompt; cannot block creation |
| `subagentStop` | A subagent completes (not emitted by the built-in `general-purpose` agent) | Yes — allow, block, or replace the response returned to the parent |
| `notification` | Fire-and-forget system notifications (shell completion, agent completion or idle, permission prompts, elicitation dialogs) | Optional `additionalContext` injection |
| `errorOccurred` | An error occurs during execution | No |

Command hook entries run a script (`bash`/`powershell`/cross-platform `command`, plus optional
`cwd`, `env`, `timeoutSec`); HTTP hook entries POST the event payload to a URL instead. A
`preToolUse` hook script controls the outcome by printing a final JSON decision object to stdout,
e.g. `{"permissionDecision": "allow"}` or
`{"permissionDecision": "deny", "permissionDecisionReason": "unsafe command"}` — this is the direct
Copilot-native equivalent of Claude Code's `PreToolUse` approve/deny hooks (see
[Alternative 4](#alternative-4-ast-based-safe-command-auto-approval-dippy-pattern) below for how
this supersedes the old allowlist-only workaround). Command `preToolUse` hooks are fail-closed on
errors (a crash or non-zero exit denies the call); a **timed-out** hook is always fail-open
regardless of hook type, letting the tool call fall through to the normal permission flow.

Hook output is one JSON object on stdout, and each event has its own field contract:

| Event | Output field | Type or values | Contract |
|-------|--------------|----------------|----------|
| `preToolUse` | `permissionDecision` | `"allow"`, `"deny"`, `"ask"` | Whether the tool executes |
| `preToolUse` | `permissionDecisionReason` | string | Required for `"deny"` |
| `preToolUse` | `modifiedArgs` | object | Replacement tool arguments |
| `postToolUse` | `modifiedResult` | object | Replacement with `resultType: "success"` |
| `postToolUse` | `additionalContext` | string | Appended to tool output; combined output capped at 10 KB |
| `postToolUseFailure` | `additionalContext` | string | Recovery guidance; exit 2 appends stdout |
| `agentStop`, `subagentStop` | `decision` | `"block"`, `"allow"` | Block forces another turn |
| `agentStop`, `subagentStop` | `reason` | string | Prompt used when blocking |
| `subagentStop` | `modifiedResponse` | string | Replacement response returned to the parent |
| `permissionRequest` | `behavior` | `"allow"`, `"deny"` | Permission decision |
| `permissionRequest` | `message` | string | Denial reason returned to the model |
| `permissionRequest` | `interrupt` | boolean | With deny, stop the agent entirely |
| `userPromptTransformed` | `modifiedTransformedPrompt` | optional string | Replacement model-facing content |
| `sessionStart`, `subagentStart`, `notification` | `additionalContext` | string | Context injected into the relevant session or subagent |

CLI v1.0.76 release notes also mention `modifiedPrompt` and `responseContent` from a
`userPromptSubmitted` hook, but the official reference says that event's output is not processed
and documents neither field. Treat both as changelog-only and unsupported as a stable contract
until runtime testing resolves the conflict. Earlier v1.0.44 and v1.0.65 release notes also describe
handling the request directly and injecting `additionalContext`, so this is a longer changelog-only
history rather than a single recent claim.

Validate output types before printing. When no mutation is needed, omit the field and return `{}`;
do not substitute `null`. Let hook exceptions fail explicitly instead of swallowing them and
emitting ambiguous empty output. Objects, numbers, or nulls in string fields have caused session
corruption (fixed in CLI v1.0.76).

Hook configuration failure is also scoped. For directory-loaded hook files, a malformed entry is
dropped while valid sibling entries remain active; structural JSON/version/list errors reject the
file, and inline settings remain strict. Diagnose per entry and source rather than assuming that
one bad hook disables every hook.

As of CLI v1.0.72, an `agentStop` hook that always blocks no longer loops forever: the CLI ends
the turn after 8 consecutive blocks, and the hook receives a `stop_hook_active` flag so it can
detect a forced continuation and self-limit instead of relying on the CLI's cap alone.

For prompts piped through stdin, v1.0.78 release notes document `sessionEnd` behavior matching
`-p`: it fires after each completed agent turn with `reason` set to `complete` (or `error` on
failure), rather than once at process exit with `user_exit`. It does not fire when the process exits
without completing a turn. CI integrations must therefore avoid assuming one hook invocation per
process.

The current hooks reference documents matcher values only for tool names, notification types,
compaction triggers, and subagent names; it does not document a declarative path filter. Hook
scripts still receive `toolArgs` and can inspect paths themselves, but that is runtime argument
validation rather than pre-execution declarative filtering.

### Direct hook mapping (Claude Code → Copilot CLI)

| Claude Code hook | Copilot CLI native hook | Notes |
|---|---|---|
| `PreToolUse` | `preToolUse` | Can allow/deny/modify, same intent as Claude — see decision JSON above |
| `PostToolUse` | `postToolUse` (+ `postToolUseFailure`) | Copilot splits success and failure into two separate events |
| `Notification` | `notification` | Fire-and-forget, never blocks the session; can inject `additionalContext` |
| `Stop` | `agentStop` | Fires when the main agent finishes a turn |
| `SubagentStop` | `subagentStop` (+ `subagentStart`) | Copilot also has a pre-spawn `subagentStart` event Claude doesn't expose the same way |
| `PreCompact` | `preCompact` | Notification-only (cannot block compaction), fires for manual or automatic compaction |

All six Claude Code hook types now have a native Copilot CLI equivalent — prefer the native hook
for anything that must react inside the session. The Git/GitHub Actions/prompt-guard alternatives
below remain useful for CI-level, team-wide enforcement that should apply regardless of whether an
individual's local hooks are configured.

Related but separate primitive: Claude Code v2.1.105+ also added a top-level `monitors:` manifest
key. Unlike `hooks:`, which reacts to session events, `monitors:` declares background monitoring
that auto-arms when the session starts. Copilot CLI does not have a direct in-session
equivalent; the closest match is an external automation or recurring check such as GitHub Actions
with `on: schedule`, or an explicit session-start checklist like
[`context-prime`](../skills/copilot-exclusive/context-prime/SKILL.md).

---

## Alternative Mapping (For CI-Enforced Team Gates Alongside Native Hooks)

The table below shows ways to achieve similar effects using Git hooks/GitHub Actions/prompt
guards. Since every Claude Code hook type now has a native Copilot equivalent (see above), use
these mainly when you want enforcement at the CI level in addition to — not instead of — the
local hook.

| Claude Code Hook | Main use case | Native Copilot hook | Copilot alternative (CI/team-wide) |
|-----------------|---------------|---------------|---------------|
| `PreToolUse` | Run lint/validation before changes | [`preToolUse`](#copilot-clis-native-hook-system) | [Git Pre-commit Hook](#alternative-1-git-pre-commit-hooks) / [GitHub Actions (PR)](#alternative-2-github-actions) |
| `PostToolUse` | Run tests/formatting after changes | [`postToolUse`](#copilot-clis-native-hook-system) | [Git Post-commit Hook](#alternative-1-git-pre-commit-hooks) / [GitHub Actions (push)](#alternative-2-github-actions) |
| `Stop` | Generate a summary after the AI session ends | [`agentStop`](#copilot-clis-native-hook-system) | GitHub Actions (when PR is created) |
| `Notification` | Send notifications | [`notification`](#copilot-clis-native-hook-system) | GitHub Actions (Slack/Email) / `gh` CLI notification |
| `SubagentStop` | Aggregate subagent results | [`subagentStop`](#copilot-clis-native-hook-system) | [Fleet + GitHub Actions](#alternative-2-github-actions) |
| `PreCompact` | Save state before context resets | [`preCompact`](#copilot-clis-native-hook-system) (notification-only) | Session artifacts, SQL notes, or a [Prompt-Level Guard](#alternative-3-prompt-level-guards) checkpoint |

---

## PreCompact Pattern: Save State Before Context Resets

Claude Code's `PreCompact` hook and Copilot CLI's `preCompact` hook both run right before context
compaction (manual or automatic) — but Copilot's `preCompact` is **notification-only**: it cannot
block or modify the compaction, only observe it (e.g. write a log line before compaction happens).
If you need to actually *save state* before compaction — not just be notified — pair a
`preCompact` hook with a **manual checkpointing pattern**, since the hook itself has no way to
inject a save action into the model's context.

Useful Copilot equivalents/companions to a `preCompact` hook:

- A `preCompact` command hook that writes a timestamped log line or triggers an external backup script
- Save the current plan or working summary to a session artifact file
- Update SQL todo state before a long context-heavy phase
- Add a short prompt checkpoint before continuing a long-running task

Example prompt-level checkpoint (still useful since the hook can't inject content itself):

```text
Before we continue, summarize the current plan, completed steps, open blockers, and pending
decisions. Save that summary to the session workspace so we can resume accurately if context is
trimmed or the session restarts.
```

This pairs well with
[`cross-session-memory`](../skills/copilot-exclusive/cross-session-memory/SKILL.md),
which helps you find and resume prior session context later.

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

### Copilot alternative A: Native `agentStop` hook (closest direct equivalent)

Save this as `.github/hooks/session-complete.json`:

```json
{
  "version": 1,
  "hooks": {
    "agentStop": [
      {
        "type": "command",
        "bash": "echo 'Session complete' | notify-send",
        "powershell": "Write-Host 'Session complete'",
        "timeoutSec": 10
      }
    ]
  }
}
```

### Copilot alternative B: GitHub Actions (Slack notification on push)

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

### Copilot alternative C: Prompt Guard (pre-session checklist)

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
or pattern analysis. **Copilot CLI's native `preToolUse` hook is now a direct equivalent**: a
command hook script can inspect the pending tool call and print a final decision object to
stdout — `{"permissionDecision": "allow"}` or
`{"permissionDecision": "deny", "permissionDecisionReason": "unsafe command"}` —
to approve or deny it before it runs. If you need AST-level command analysis specifically (not
just pattern matching), write that logic into the `preToolUse` script itself. For teams that
prefer a simpler, version-controlled, non-scripted approach — or as a defense-in-depth layer
alongside a `preToolUse` hook — the **allowlist + prompt guard** approach below is still a valid,
lower-maintenance option.

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
