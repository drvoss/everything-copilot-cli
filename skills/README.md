# Skills Catalog

Composable skill modules for GitHub Copilot CLI, Codex CLI, and Gemini CLI.
Each skill follows the [agentskills.io](https://agentskills.io) spec — skills are
subdirectories containing a `SKILL.md` file that can be installed directly into
any compatible AI coding tool.

## Cross-Platform Compatibility (agentskills.io)

All skills in this repository follow the **[agentskills.io](https://agentskills.io)** open standard — the same spec used by Claude Code, Hermes Agent, Cursor, and Codex CLI.

### What this means

- **Portable**: Skills written here can be used in Claude Code, Hermes, and other agentskills.io-compatible runtimes with minimal adaptation
- **Standard format**: The `SKILL.md` subdirectory layout (`skills/<category>/<skill-name>/SKILL.md`) is the canonical agentskills.io path
- **Install from GitHub**: Any agentskills.io-compatible tool can install skills directly:

  ```bash
  # Gemini CLI (native skills install command)
  gemini skills install github:drvoss/everything-copilot-cli/skills/development/fix-github-issue

  # Claude Code (manual copy — claude does not have a shell-level skills install command)
  # Copy the skill directory to your project's .claude/skills/ or user-level ~/.claude/skills/
  cp -r skills/workflow/commit-workflow ~/.claude/skills/workflow/
  ```

### Cross-runtime compatibility table

| Runtime | Compatible | Notes |
|---------|:----------:|-------|
| GitHub Copilot CLI | ✅ | Native — all features available |
| Claude Code | ✅ | Skills portable; agent_type mapping differs |
| Codex CLI | ✅ | Skills work; no fleet/background equivalent |
| Hermes Agent | ✅ | Full agentskills.io spec support |
| Cursor | ⚠️ | Skill content reusable; different invocation model |

### Key differences when using in Claude Code

- Replace `/fleet` with `Agent` tool calls
- `background-agent` skill maps to `&` background subprocess
- `sql` tool state maps to `~/.claude/state.json` or custom memory files
- Copilot-exclusive skills (`skills/copilot-exclusive/`) require adaptation

## Installing Skills

### GitHub Copilot CLI

```bash
# Install a single skill (project-level)
# Copy skill directory to: .github/skills/<category>/<skill-name>/SKILL.md

# Install user-level (available in all projects)
# Copy to: ~/.copilot/skills/<category>/<skill-name>/SKILL.md
```

### Codex CLI

```bash
# Project-level
# Copy to: .agents/skills/<skill-name>/SKILL.md

# User-level
# Copy to: ~/.codex/skills/<skill-name>/SKILL.md
```

### Gemini CLI

```bash
# Install directly from this repo using the skills command
gemini skills install github:drvoss/everything-copilot-cli/skills/<category>/<skill-name>
```

---

## Skill Architecture (Three-Layer Model)

Skills in this repository fall into three functional layers, based on the harness research:

| Layer | Role | Examples in this repo |
|-------|------|-----------------------|
| **Orchestrator** | Coordinates teams, manages workflow, handles errors and synthesis | `team-planner`, `fleet-parallel`, `orchestration/skills/*` |
| **Agent-Extending** | Adds domain expertise to an agent — loaded when the agent needs specialized knowledge | Most `development/`, `security/`, `testing/`, `documentation/` skills |
| **External** | Integrates external services and tools beyond the built-in CLI toolset | `mcp-ecosystem`, `ai-visibility`, `github-pr-workflow` |

**Why this matters:** When composing workflows, load Orchestrator skills into the coordinating agent and Agent-Extending skills into specialist sub-agents. External skills can live in either layer depending on context.

---

## Skill Categories

### 🔵 Copilot-Exclusive (`copilot-exclusive/`)

Skills that use features specific to GitHub Copilot CLI — background agents,
fleet mode, plan mode, and GitHub integration.

| Skill | Description |
|-------|-------------|
| [`actions-debugging`](copilot-exclusive/actions-debugging/SKILL.md) | Use when a GitHub Actions workflow fails — diagnose the run log, identify the root cause, and apply a targeted fix |
| [`autopilot-patterns`](copilot-exclusive/autopilot-patterns/SKILL.md) | Use when you're ready to let Copilot execute a multi-step plan autonomously — configures guardrails and handles plan-to-autopilot transitions |
| [`background-agent`](copilot-exclusive/background-agent/SKILL.md) | Use when a task is too long to block the current session — delegates to a cloud background agent via `&` or `/delegate` and opens a draft PR |
| [`context-prime`](copilot-exclusive/context-prime/SKILL.md) | Invoke when starting a session (or resuming after a break) on a repo before making changes, to load live project context |
| [`cross-session-memory`](copilot-exclusive/cross-session-memory/SKILL.md) | Use when you need to remember context, decisions, or artifacts across multiple sessions — writes to session store and resumes via /resume |
| [`fleet-parallel`](copilot-exclusive/fleet-parallel/SKILL.md) | Use when you need to run the same task across many files or contexts in parallel — triggers /fleet mode for batch operations |
| [`github-issue-triage`](copilot-exclusive/github-issue-triage/SKILL.md) | Use when you have a backlog of unorganized GitHub Issues — bulk-labels, prioritizes, and assigns at scale |
| [`github-pr-workflow`](copilot-exclusive/github-pr-workflow/SKILL.md) | Use when creating, reviewing, or merging a PR — runs the full PR lifecycle through Copilot's built-in GitHub MCP |
| [`ide-switching`](copilot-exclusive/ide-switching/SKILL.md) | Use when moving between VS Code and Copilot CLI — transfers context so you don't lose state when switching environments |
| [`mcp-ecosystem`](copilot-exclusive/mcp-ecosystem/SKILL.md) | Use when built-in tools don't cover a service you need — add a custom MCP server to extend Copilot CLI's capabilities |
| [`multi-model-strategy`](copilot-exclusive/multi-model-strategy/SKILL.md) | Use when choosing which model to use for a task — routes to the best model based on task type and cost trade-offs |
| [`plan-mode-mastery`](copilot-exclusive/plan-mode-mastery/SKILL.md) | Use when you want structured, approval-gated planning before execution — switches to Plan Mode for complex multi-step tasks |
| [`session-management`](copilot-exclusive/session-management/SKILL.md) | Use when a task spans multiple steps or sessions and needs structured state tracking via the built-in SQLite session database |
| [`team-planner`](copilot-exclusive/team-planner/SKILL.md) | Use when a task is too large or multi-domain for a single agent — assemble a specialist team with SQL tracking and /fleet dispatch |

### 🛠 Development (`development/`)

Core software development skills applicable to any project.

| Skill | Description |
|-------|-------------|
| [`code-review`](development/code-review/SKILL.md) | Structured code review for quality and correctness |
| [`fix-build-errors`](development/fix-build-errors/SKILL.md) | Diagnose and fix build failures fast |
| [`fix-github-issue`](development/fix-github-issue/SKILL.md) | Resolve a GitHub Issue end-to-end: read → locate → fix → test → PR |
| [`pr-multi-perspective-review`](development/pr-multi-perspective-review/SKILL.md) | Review PRs from 6 lenses: PM / Dev / QA / Security / DevOps / UX |
| [`refactor-clean`](development/refactor-clean/SKILL.md) | Remove dead code and simplify complex logic |
| [`tdd-workflow`](development/tdd-workflow/SKILL.md) | Test-driven development with red-green-refactor cycles |

### 📝 Documentation (`documentation/`)

Skills for keeping docs accurate and up-to-date.

| Skill | Description |
|-------|-------------|
| [`add-to-changelog`](documentation/add-to-changelog/SKILL.md) | Add versioned entries to CHANGELOG.md (Keep a Changelog format) |
| [`api-documentation`](documentation/api-documentation/SKILL.md) | Generate and maintain API documentation |
| [`doc-update`](documentation/doc-update/SKILL.md) | Sync documentation when implementation changes |

### 🔒 Security (`security/`)

Skills for identifying and fixing security issues.

| Skill | Description |
|-------|-------------|
| [`evaluate-repository`](security/evaluate-repository/SKILL.md) | Score a repository 1-10 across 6 security dimensions with remediation plan |
| [`input-validation`](security/input-validation/SKILL.md) | Validate and sanitize all user-supplied inputs |
| [`secret-detection`](security/secret-detection/SKILL.md) | Find and remove hardcoded secrets |
| [`security-scan`](security/security-scan/SKILL.md) | Run a security scan across the codebase |

### 🧪 Testing (`testing/`)

Skills for improving test coverage and quality.

| Skill | Description |
|-------|-------------|
| [`e2e-testing`](testing/e2e-testing/SKILL.md) | Write and run end-to-end tests |
| [`test-coverage`](testing/test-coverage/SKILL.md) | Analyze and improve test coverage |

### 🔄 Workflow (`workflow/`)

End-to-end development workflow skills — from planning to shipping.

| Skill | Description |
|-------|-------------|
| [`commit-workflow`](workflow/commit-workflow/SKILL.md) | Conventional commit messages with emoji, atomic splits, and pre-commit checks |
| [`release`](workflow/release/SKILL.md) | Cut a versioned release: tag → GitHub Release → publish (npm/PyPI/Docker) |
| [`sprint-workflow`](workflow/sprint-workflow/SKILL.md) | Full sprint: Think → Plan → Build → Review → Test → Ship |
| [`security-audit`](workflow/security-audit/SKILL.md) | OWASP Top 10 + STRIDE threat modeling audit |
| [`sprint-retro`](workflow/sprint-retro/SKILL.md) | Data-driven retrospectives using `/chronicle` and git metrics |

### 📦 Product (`product/`)

Product management and strategy skills.

| Skill | Description |
|-------|-------------|
| [`create-prd`](product/create-prd/SKILL.md) | Generate a structured PRD grounded in Jobs-to-be-Done thinking |
| [`opportunity-solution-tree`](product/opportunity-solution-tree/SKILL.md) | Teresa Torres' OST framework: outcome → opportunity → solution → experiment |
| [`feature-prioritization`](product/feature-prioritization/SKILL.md) | Impact × Confidence × Effort matrix with SQL tracking |
| [`launch-strategy`](product/launch-strategy/SKILL.md) | Product launch checklist: alpha → beta → GA |

### 📣 Content & Marketing (`content/`)

> **Extended skills (non-development tasks)** — useful for marketers, content teams, and product growth roles in addition to developers. Classified separately from core development skills.

| Skill | Description |
|-------|-------------|
| [`ai-visibility`](content/ai-visibility/SKILL.md) | GEO optimization: llms.txt, AI crawler access, citation optimization |
| [`content-strategy`](content/content-strategy/SKILL.md) | Keyword research, topic clusters, and content calendar planning |

---

## Skill Format

All skills follow the [agentskills.io](https://agentskills.io) spec:

```
skills/
└── <category>/
    └── <skill-name>/
        └── SKILL.md      ← required filename
```

`SKILL.md` frontmatter:

```yaml
---
name: skill-name
description: What the skill does (shown in skill pickers)
metadata:
  category: <category>   # optional metadata
---
```

---

## Contributing

1. Create a directory: `skills/<category>/<your-skill>/`
2. Add `SKILL.md` with required frontmatter (`name`, `description`)
3. Follow the pattern of existing skills for content structure
4. Add to this README's catalog table
5. Run `npm run validate && npm test` before submitting a PR
