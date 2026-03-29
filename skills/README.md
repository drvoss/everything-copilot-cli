# Skills Catalog

Composable skill modules for GitHub Copilot CLI, Codex CLI, and Gemini CLI.
Each skill follows the [agentskills.io](https://agentskills.io) spec — skills are
subdirectories containing a `SKILL.md` file that can be installed directly into
any compatible AI coding tool.

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

## Skill Categories

### 🔵 Copilot-Exclusive (`copilot-exclusive/`)

Skills that use features specific to GitHub Copilot CLI — background agents,
fleet mode, plan mode, and GitHub integration.

| Skill | Description |
|-------|-------------|
| [`actions-debugging`](copilot-exclusive/actions-debugging/SKILL.md) | Debug GitHub Actions workflow failures using the Copilot CLI integration |
| [`autopilot-patterns`](copilot-exclusive/autopilot-patterns/SKILL.md) | Master Autopilot mode for autonomous multi-step task execution |
| [`background-agent`](copilot-exclusive/background-agent/SKILL.md) | Delegate long-running tasks to cloud Copilot agents via `&` or `/delegate` |
| [`context-prime`](copilot-exclusive/context-prime/SKILL.md) | Load project context at session start — README, file tree, recent commits, stack |
| [`cross-session-memory`](copilot-exclusive/cross-session-memory/SKILL.md) | Persist knowledge across sessions using memory tools |
| [`fleet-parallel`](copilot-exclusive/fleet-parallel/SKILL.md) | Execute tasks across multiple parallel agents with `/fleet` |
| [`github-issue-triage`](copilot-exclusive/github-issue-triage/SKILL.md) | Triage and classify GitHub issues at scale |
| [`github-pr-workflow`](copilot-exclusive/github-pr-workflow/SKILL.md) | Full PR lifecycle — draft, review, merge — using Copilot CLI |
| [`ide-switching`](copilot-exclusive/ide-switching/SKILL.md) | Context-switch efficiently between CLI and IDE editors |
| [`mcp-ecosystem`](copilot-exclusive/mcp-ecosystem/SKILL.md) | Extend Copilot CLI with MCP tools and servers |
| [`multi-model-strategy`](copilot-exclusive/multi-model-strategy/SKILL.md) | Select the right model for each task type |
| [`plan-mode-mastery`](copilot-exclusive/plan-mode-mastery/SKILL.md) | Use Plan Mode for structured, approved task execution |
| [`session-management`](copilot-exclusive/session-management/SKILL.md) | Manage, resume, and archive Copilot CLI sessions |

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

> **확장 스킬 (비개발 업무)** — 개발자 외 마케터, 콘텐츠 팀, 제품 성장 담당자에게 유용한 스킬입니다.
> Core developer skills 와 별도로 분류됩니다.

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
