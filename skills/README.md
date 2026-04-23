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
# Copy each skill directory to: .github/skills/<skill-name>/SKILL.md
# Example: skills/development/fix-build-errors/ -> .github/skills/fix-build-errors/

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

**Why this matters:** When composing workflows, load Orchestrator skills into the
coordinating agent and Agent-Extending skills into specialist sub-agents.
External skills can live in either layer depending on context.

---

## Orchestration Hub

Some of this repository's strongest multi-AI capabilities live outside `skills/` in the
dedicated orchestration layer.

| If you want to... | Start here |
|-------------------|------------|
| Delegate work to external AI tools | [`orchestration/skills/`](../orchestration/skills/) |
| Learn the core cross-AI patterns | [`orchestration/README.md`](../orchestration/README.md) |
| Fan out work across independent agents | [`fleet-parallel`](copilot-exclusive/fleet-parallel/SKILL.md) |
| Coordinate a specialist team from Copilot CLI | [`team-planner`](copilot-exclusive/team-planner/SKILL.md) |

---

## Skill Categories

### 🔵 Copilot-Exclusive (`copilot-exclusive/`)

Skills that use features specific to GitHub Copilot CLI — background agents,
fleet mode, plan mode, and GitHub integration.

| Skill | Description |
|-------|-------------|
| [`actions-debugging`](copilot-exclusive/actions-debugging/SKILL.md) | Use when a GitHub Actions workflow fails — diagnose the run log, identify the root cause, and apply a targeted fix |
| [`agentic-engineering`](copilot-exclusive/agentic-engineering/SKILL.md) | Use when designing or decomposing a task for agent execution — applies 15-minute task units, eval-first loops, and explicit input/output contracts |
| [`autopilot-patterns`](copilot-exclusive/autopilot-patterns/SKILL.md) | Use when you're ready to let Copilot execute a multi-step plan autonomously — configures guardrails and handles plan-to-autopilot transitions |
| [`background-agent`](copilot-exclusive/background-agent/SKILL.md) | Use when a task is too long to block the current session — delegates to a cloud background agent via `&` or `/delegate` and opens a draft PR |
| [`context-prime`](copilot-exclusive/context-prime/SKILL.md) | Invoke when starting a session (or resuming after a break) on a repo before making changes, to load live project context |
| [`cross-session-memory`](copilot-exclusive/cross-session-memory/SKILL.md) | Use when you need to recover prior context, decisions, or artifacts across sessions — search history and resume with the right state |
| [`fleet-parallel`](copilot-exclusive/fleet-parallel/SKILL.md) | Use when you need to run the same task across many files or contexts in parallel — triggers /fleet mode for batch operations |
| [`github-code-search`](copilot-exclusive/github-code-search/SKILL.md) | Use when you need real-world implementation examples or cross-repository context — search GitHub's global code index and reuse the results as grounded context |
| [`github-issue-triage`](copilot-exclusive/github-issue-triage/SKILL.md) | Use when you have a backlog of unorganized GitHub Issues — bulk-labels, prioritizes, and assigns at scale |
| [`github-pr-workflow`](copilot-exclusive/github-pr-workflow/SKILL.md) | Use when creating, reviewing, or merging a PR — runs the full PR lifecycle through Copilot's built-in GitHub MCP |
| [`ide-switching`](copilot-exclusive/ide-switching/SKILL.md) | Use when moving between VS Code and Copilot CLI — transfers context so you don't lose state when switching environments |
| [`knowledge-curator`](copilot-exclusive/knowledge-curator/SKILL.md) | Use when recurring project lessons should be promoted from session context into durable instructions, docs, or decision records |
| [`mcp-builder`](copilot-exclusive/mcp-builder/SKILL.md) | Use when you need to build a new MCP server — plan, implement, validate, reload, and test it end to end |
| [`mcp-ecosystem`](copilot-exclusive/mcp-ecosystem/SKILL.md) | Use when built-in tools don't cover a service you need — add a custom MCP server to extend Copilot CLI's capabilities |
| [`multi-model-strategy`](copilot-exclusive/multi-model-strategy/SKILL.md) | Use when choosing which model to use for a task — routes to the best model based on task type and cost trade-offs |
| [`plan-mode-mastery`](copilot-exclusive/plan-mode-mastery/SKILL.md) | Use when you want structured, approval-gated planning before execution — switches to Plan Mode for complex multi-step tasks |
| [`scope-guard`](copilot-exclusive/scope-guard/SKILL.md) | Use when a task must stay inside a narrow writable boundary or when risky commands need an explicit stop rule |
| [`session-management`](copilot-exclusive/session-management/SKILL.md) | Use when a task spans multiple steps or sessions and needs structured state tracking via the built-in SQLite session database |
| [`stack-detector`](copilot-exclusive/stack-detector/SKILL.md) | Scan the project tech stack (package.json, config files, lockfiles) and recommend the most relevant skills and rules from this collection |
| [`task-intake-router`](copilot-exclusive/task-intake-router/SKILL.md) | Use when a request arrives and the right execution path is unclear — routes work to the correct mode, agent type, model tier, and delegation pattern before implementation starts |
| [`ecosystem-intake`](copilot-exclusive/ecosystem-intake/SKILL.md) | Use when evaluating an external repository, tool, or framework for adoption — applies the Adopt/Adapt/Reject filter and produces a structured intake report |
| [`team-planner`](copilot-exclusive/team-planner/SKILL.md) | Use when a task is too large or multi-domain for a single agent — assemble a specialist team with SQL tracking and /fleet dispatch |

### 🛠 Development (`development/`)

Core software development skills applicable to any project.

| Skill | Description |
|-------|-------------|
| [`api-and-interface-design`](development/api-and-interface-design/SKILL.md) | Define public APIs, CLIs, webhooks, or SDK contracts first so compatibility and validation stay intentional |
| [`code-review`](development/code-review/SKILL.md) | Structured code review for quality and correctness |
| [`context-engineering`](development/context-engineering/SKILL.md) | Optimize information delivery to AI agents — minimize noise, maximize signal |
| [`deprecation-and-migration`](development/deprecation-and-migration/SKILL.md) | Safely remove old APIs and migrate to new patterns with a 3-phase process |
| [`fix-build-errors`](development/fix-build-errors/SKILL.md) | Diagnose and fix build failures fast |
| [`fix-github-issue`](development/fix-github-issue/SKILL.md) | Resolve a GitHub Issue end-to-end: read → locate → fix → test → PR |
| [`performance-optimization`](development/performance-optimization/SKILL.md) | Measure first, isolate bottlenecks, and prove that a performance change actually helps |
| [`pr-multi-perspective-review`](development/pr-multi-perspective-review/SKILL.md) | Review PRs from 6 lenses: PM / Dev / QA / Security / DevOps / UX |
| [`refactor-clean`](development/refactor-clean/SKILL.md) | Remove dead code and simplify complex logic |
| [`skill-creator`](development/skill-creator/SKILL.md) | Describe a workflow and get a properly structured SKILL.md scaffolded in minutes |
| [`source-driven-development`](development/source-driven-development/SKILL.md) | Verify framework and library APIs against current official docs before implementing |
| [`spec-driven-development`](development/spec-driven-development/SKILL.md) | Write a technical spec before coding — defines interface, structure, and boundaries first |
| [`systematic-debugging`](development/systematic-debugging/SKILL.md) | 4-phase root cause analysis (reproduce → isolate → hypothesize → verify) before fixing |
| [`tdd-workflow`](development/tdd-workflow/SKILL.md) | Test-driven development with red-green-refactor cycles |

**Combo Skills** (activate when two technologies are used together):

| Skill | Description |
|-------|-------------|
| [`nextjs-prisma`](development/nextjs-prisma/SKILL.md) | Type-safe data fetching and Server Actions for Next.js App Router + Prisma projects |
| [`react-vitest`](development/react-vitest/SKILL.md) | Component testing setup and patterns for React + Vitest projects |
| [`nestjs-prisma`](development/nestjs-prisma/SKILL.md) | PrismaService singleton, repository pattern, and unit testing for NestJS + Prisma |

### 📝 Documentation (`documentation/`)

Skills for keeping docs accurate and up-to-date.

| Skill | Description |
|-------|-------------|
| [`add-to-changelog`](documentation/add-to-changelog/SKILL.md) | Add versioned entries to CHANGELOG.md (Keep a Changelog format) |
| [`api-documentation`](documentation/api-documentation/SKILL.md) | Generate and maintain API documentation |
| [`architecture-decisions`](documentation/architecture-decisions/SKILL.md) | Document hard-to-reverse technical decisions as Architecture Decision Records (ADRs) |
| [`code-tour`](documentation/code-tour/SKILL.md) | Use when a user asks for a code tour, onboarding walkthrough, architecture tour, or PR tour — creates persona-targeted `.tour` files with real file and line anchors |
| [`doc-update`](documentation/doc-update/SKILL.md) | Sync documentation when implementation changes |

### 🔒 Security (`security/`)

Skills for identifying and fixing security issues.

| Skill | Description |
|-------|-------------|
| [`agent-owasp-check`](security/agent-owasp-check/SKILL.md) | Audit an AI agent system against the OWASP Agentic Security Initiative Top 10 |
| [`evaluate-repository`](security/evaluate-repository/SKILL.md) | Score a repository 1-10 across 7 dimensions, including AI agent governance |
| [`input-validation`](security/input-validation/SKILL.md) | Validate and sanitize all user-supplied inputs |
| [`pr-security-review`](security/pr-security-review/SKILL.md) | Review a pull request for security vulnerabilities — auth, injection, secrets, and OWASP Top 10 before merging |
| [`secret-detection`](security/secret-detection/SKILL.md) | Find and remove hardcoded secrets |
| [`security-bounty-hunter`](security/security-bounty-hunter/SKILL.md) | Use when the goal is practical vulnerability discovery for responsible disclosure or bounty submission — focuses on remotely reachable, exploitable issues |
| [`security-scan`](security/security-scan/SKILL.md) | Run a security scan across the codebase |

### 🧪 Testing (`testing/`)

Skills for improving test coverage and quality.

| Skill | Description |
|-------|-------------|
| [`browser-devtools`](testing/browser-devtools/SKILL.md) | Verify frontend behavior at runtime — DOM validation, network inspection, performance profiling |
| [`e2e-testing`](testing/e2e-testing/SKILL.md) | Write and run end-to-end tests |
| [`eval-harness`](testing/eval-harness/SKILL.md) | Use when you need to evaluate an LLM pipeline or AI feature systematically — sets up test cases, scoring rubrics, and pass/fail tracking |
| [`test-coverage`](testing/test-coverage/SKILL.md) | Analyze and improve test coverage |
| [`ux-audit`](testing/ux-audit/SKILL.md) | Use when a page or component feels confusing and you need a structured UX audit — applies 6 Krug-inspired usability checks and returns prioritized findings |

### 🔄 Workflow (`workflow/`)

End-to-end development workflow skills — from planning to shipping.

| Skill | Description |
|-------|-------------|
| [`commit-workflow`](workflow/commit-workflow/SKILL.md) | Conventional commit messages with emoji, atomic splits, and pre-commit checks |
| [`cost-audit`](workflow/cost-audit/SKILL.md) | Use when AI inference costs are growing unexpectedly or when comparing model choices by cost/quality ratio — produces an actionable cost reduction plan |
| [`council`](workflow/council/SKILL.md) | Use when a decision has multiple credible paths and no obvious winner — convene a four-voice council (Architect, Skeptic, Pragmatist, Critic) for adversarial deliberation |
| [`deep-research`](workflow/deep-research/SKILL.md) | Use when a question requires comprehensive evidence gathering from multiple sources, systematic synthesis, and traceable citations |
| [`deployment-canary`](workflow/deployment-canary/SKILL.md) | Use when a release needs staged rollout checks, rollback thresholds, and explicit promote/hold decisions |
| [`release`](workflow/release/SKILL.md) | Cut a versioned release: tag → GitHub Release → publish (npm/PyPI/Docker) |
| [`verification-before-completion`](workflow/verification-before-completion/SKILL.md) | Prove a task is done with fresh command output before claiming success |
| [`sprint-workflow`](workflow/sprint-workflow/SKILL.md) | Full sprint: Think → Plan → Build → Review → Test → Ship |
| [`security-audit`](workflow/security-audit/SKILL.md) | OWASP Top 10 + STRIDE threat modeling audit |
| [`sprint-retro`](workflow/sprint-retro/SKILL.md) | Data-driven retrospectives using `/chronicle` and git metrics |
| [`using-git-worktrees`](workflow/using-git-worktrees/SKILL.md) | Create isolated working directories for parallel branch work without cloning the repo repeatedly |

### 📦 Product (`product/`)

Product management and strategy skills.

| Skill | Description |
|-------|-------------|
| [`create-prd`](product/create-prd/SKILL.md) | Generate a structured PRD grounded in Jobs-to-be-Done thinking |
| [`feature-prioritization`](product/feature-prioritization/SKILL.md) | Impact × Confidence × Effort matrix with SQL tracking |
| [`launch-strategy`](product/launch-strategy/SKILL.md) | Product launch checklist: alpha → beta → GA |
| [`opportunity-solution-tree`](product/opportunity-solution-tree/SKILL.md) | Teresa Torres' OST framework: outcome → opportunity → solution → experiment |
| [`product-capability`](product/product-capability/SKILL.md) | Use when engineering needs testable, implementable technical requirements — capability spec with acceptance criteria, task breakdown, and traceability |

### 📣 Content & Marketing (`content/`)

> **Extended skills (non-development tasks)** — useful for marketers, content teams, and product growth roles in addition to developers. Classified separately from core development skills.

| Skill | Description |
|-------|-------------|
| [`ai-visibility`](content/ai-visibility/SKILL.md) | GEO optimization: llms.txt, AI crawler access, citation optimization |
| [`content-strategy`](content/content-strategy/SKILL.md) | Keyword research, topic clusters, and content calendar planning |
| [`seo`](content/seo/SKILL.md) | Use when the user wants better search visibility, SEO remediation, schema markup, or Core Web Vitals improvements — distinct from ai-visibility (GEO) |

---

## Skill Format

All skills follow the [agentskills.io](https://agentskills.io) spec:

```text
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
  category: <category>
---
```

Valid categories:
`development`, `testing`, `security`, `documentation`, `copilot-exclusive`,
`workflow`, `product`, `content`

If you add a new category, update the shared allowlist in
`scripts/skill-metadata.js` and then update the catalog/docs in the same change.

---

## Contributing

1. Create a directory: `skills/<category>/<your-skill>/`
2. Add `SKILL.md` with required frontmatter (`name`, `description`, `metadata.category`)
3. Follow the pattern of existing skills for content structure
4. Add to this README's catalog table
5. Run `npm run validate && npm run lint:md && npm test` before submitting a PR
