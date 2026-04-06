<p align="center">
  <img src="docs/images/copilot.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>The definitive guide &amp; configuration system for GitHub Copilot CLI</strong><br/>
  Agents · Skills · Rules · Multi-AI Orchestration
</p>

<p align="center">
  <a href="LICENSE"><img src="docs/images/badge-license.svg" alt="MIT License" /></a>
  <a href="#"><img src="docs/images/badge-copilot-cli-ready.svg" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="docs/images/badge-models.svg" alt="20+ Models" /></a>
  <a href="#"><img src="docs/images/badge-agents.svg" alt="8 Agents" /></a>
  <a href="#"><img src="docs/images/badge-skills.svg" alt="49 Skills" /></a>
  <a href="#multi-ai-orchestration-"><img src="docs/images/badge-multi-ai.svg" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.ko.md">🇰🇷 한국어</a>
</p>

---

## What is this?

**everything-copilot-cli** is a curated, community-driven collection of agents, reusable skills,
coding rules, MCP configurations, and comprehensive guides for [GitHub Copilot CLI](https://github.com/github/copilot-cli).

It started as a parallel to [everything-claude-code](https://github.com/affaan-m/everything-claude-code) and drew inspiration from community resources like [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — but has since grown into its own identity. The focus is on what makes Copilot CLI genuinely different: **native GitHub integration, multi-model flexibility, and the ability to orchestrate other AI coding agents from a single hub**.

> **Act as a Multi-AI Orchestrator** — coordinating Claude Code, Codex CLI, Gemini CLI, and more from a single command line. _(Community pattern — see [Multi-AI Orchestration](#multi-ai-orchestration-))_

---

## Why Copilot CLI?

GitHub Copilot CLI has **11 structural advantages** over single-vendor coding agents:

| # | Advantage | Description |
|---|-----------|-------------|
| 1 | 🔗 **GitHub-Native Integration** | Issues, PRs, Actions, code search — all via built-in MCP. No extra setup. |
| 2 | 🧠 **20+ Model Selection** | GPT-5.x, Claude Sonnet/Opus 4.6, Gemini 3 Pro — pick the right model per task. |
| 3 | 🔄 **IDE ↔ CLI Seamless Switching** | Same Copilot context in VS Code, JetBrains, and the terminal. |
| 4 | 📋 **Plan Mode** | Structured text planning — Copilot builds a step-by-step implementation plan before writing any code. |
| 5 | 🤖 **Autopilot Mode** | Autonomous task execution with guardrails. _(Experimental)_ |
| 6 | 👻 **Background Agents** | Delegate to cloud Copilot agents via `&` or `/delegate`; resume anytime with `/resume`. |
| 7 | ⚡ **Fleet Mode** | Parallel agent execution — split work across multiple agents simultaneously. |
| 8 | 🗄️ **Session SQL Database** | Built-in SQLite per session for structured data, todo tracking, and state. |
| 9 | 🧲 **Cross-Session Memory** | Persistent knowledge via `session_store` — learn across sessions. |
| 10 | 🏗️ **LSP First-Class Support** | Language Server Protocol integration for precise code intelligence. |
| 11 | 🌐 **Multi-AI Orchestrator** | ★ Orchestrate Claude Code, Codex, Gemini CLI from Copilot as the meta-hub. |

---

## Quick Start

```bash
# 1. Install GitHub Copilot CLI
npm install -g @github/copilot

# 2. Clone this repository
git clone https://github.com/drvoss/everything-copilot-cli.git
cd everything-copilot-cli

# 3. Run setup
npm install && npm run setup
```

Then open a terminal and start using Copilot CLI with the included agents, skills, and rules:

```bash
# Start a session in your project directory
cd your-project
copilot

# Use the planner agent (inside the session)
> Design a REST API for user management — use plan mode

# Run TDD workflow
> Add tests for the auth module using TDD

# Orchestrate multiple AIs
> Claude reasons architecture, Codex implements, Copilot reviews — delegate accordingly
```

> 📖 For detailed instructions, see the [Quick Start Guide](guides/).

---

## Repository Structure

```
everything-copilot-cli/
├── agents/                        # Agent definitions (8 core agents)
│   ├── planner.md
│   ├── architect.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── tdd-guide.md
│   ├── build-error-resolver.md
│   ├── doc-updater.md
│   └── refactor-cleaner.md
│
├── skills/                        # Reusable workflow skills (49 total)
│   ├── copilot-exclusive/         #   ★ Copilot-only skills (14)
│   ├── development/               #   Dev skills (6)
│   ├── documentation/             #   Doc skills (3)
│   ├── security/                  #   Security skills (4)
│   ├── testing/                   #   Test skills (2)
│   ├── workflow/                  #   Workflow skills (5)
│   ├── product/                   #   Product skills (4)
│   └── content/                   #   Content & GEO skills (2)
│
├── rules/                         # Coding rules & guidelines
│   ├── common/                    #   Universal rules (5)
│   └── languages/                 #   Language-specific: TS, Python, Go, C#, Java
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   10 orchestration patterns
│   ├── configs/                   #   MCP bridge configs
│   ├── skills/                    #   Orchestration skills (6)
│   ├── templates/                 #   Reusable orchestrator templates
│   └── examples/                  #   Real-world examples (5)
│
├── guides/                        # 12 comprehensive guides
├── mcp-configs/                   # MCP server configurations (4)
├── examples/                      # Project-specific copilot-instructions
│   ├── nextjs-app/
│   ├── python-api/
│   ├── dotnet-webapp/
│   └── monorepo/
│
├── contexts/                      # Context presets
├── schemas/                       # Validation schemas
├── scripts/                       # Setup & migration tools
└── tests/                         # Test suite
```

---

## Core Components

### 🤖 Agents (8 Core)

Pre-configured agent definitions — each with a specific role, system prompt, and tool set.

| Agent | Purpose |
|-------|---------|
| **planner** | Breaks tasks into structured plans with dependency tracking |
| **architect** | Designs system architecture and component boundaries |
| **code-reviewer** | Reviews code for bugs, logic errors, and security issues |
| **security-reviewer** | Focused security audit with OWASP/CWE classification |
| **tdd-guide** | Test-Driven Development workflow — red/green/refactor |
| **build-error-resolver** | Diagnoses and fixes build/compilation errors |
| **doc-updater** | Keeps documentation in sync with code changes |
| **refactor-cleaner** | Identifies and executes safe refactoring opportunities |

### ⚙️ Skills (49 Total · 8 Categories)

Reusable, composable workflows organized by category. All follow the [agentskills.io](https://agentskills.io) spec.

<details>
<summary><strong>★ Copilot-Exclusive Skills (14)</strong></summary>

Skills that leverage capabilities unique to GitHub Copilot CLI:

| Skill | Description |
|-------|-------------|
| `context-prime` | Load project context at session start (README, file tree, commits, stack) |
| `session-management` | Built-in SQLite for todo tracking and structured state |
| `plan-mode-mastery` | Structured text planning with approval workflow |
| `autopilot-patterns` | Autonomous execution with guardrails |
| `background-agent` | Delegate to cloud agents via `&` / `/delegate` |
| `fleet-parallel` | Parallel agent execution with `/fleet` |
| `github-pr-workflow` | Full PR lifecycle via built-in GitHub MCP |
| `github-issue-triage` | Bulk issue classification and triage |
| `actions-debugging` | Debug CI failures with native Actions access |
| `cross-session-memory` | Persist knowledge across sessions |
| `multi-model-strategy` | Pick the right model per task |
| `mcp-ecosystem` | Extend with custom MCP servers |
| `ide-switching` | Seamless VS Code ↔ CLI context sharing |
| `team-planner` | Assemble specialist agent teams via SQL roster + `/fleet` dispatch |
</details>

<details>
<summary><strong>Development Skills (6)</strong></summary>

| Skill | Description |
|-------|-------------|
| `tdd-workflow` | Red → Green → Refactor cycle |
| `code-review` | Structured review with severity levels |
| `fix-github-issue` | Read issue → locate bug → fix → test → PR |
| `fix-build-errors` | Diagnose and resolve build failures |
| `pr-multi-perspective-review` | 6-lens PR review: PM / Dev / QA / Security / DevOps / UX |
| `refactor-clean` | Remove dead code, simplify logic safely |
</details>

<details>
<summary><strong>Documentation Skills (3)</strong></summary>

| Skill | Description |
|-------|-------------|
| `add-to-changelog` | Keep a Changelog format, semver version sync |
| `doc-update` | Sync docs when implementation changes |
| `api-documentation` | Generate and maintain API docs from source |
</details>

<details>
<summary><strong>Security Skills (4)</strong></summary>

| Skill | Description |
|-------|-------------|
| `evaluate-repository` | 6-dimension scorecard (1–10) with remediation plan |
| `security-scan` | OWASP Top 10 + dependency audit |
| `secret-detection` | Find hardcoded secrets in source and git history |
| `input-validation` | Prevent injection attacks (SQL, XSS, CSRF) |
</details>

<details>
<summary><strong>Workflow Skills (5)</strong></summary>

| Skill | Description |
|-------|-------------|
| `commit-workflow` | Conventional commits + emoji, atomic split guidance |
| `release` | tag → GitHub Release → publish (npm/PyPI/Docker) |
| `sprint-workflow` | Full sprint: Think → Plan → Build → Review → Ship |
| `security-audit` | OWASP Top 10 + STRIDE threat modeling |
| `sprint-retro` | Data-driven retros using git metrics |
</details>

<details>
<summary><strong>Product Skills (4)</strong></summary>

| Skill | Description |
|-------|-------------|
| `create-prd` | JTBD-grounded PRD template |
| `feature-prioritization` | Impact × Confidence × Effort matrix |
| `opportunity-solution-tree` | Teresa Torres' OST framework |
| `launch-strategy` | Alpha → Beta → GA launch checklist |
</details>

<details>
<summary><strong>Testing Skills (2)</strong></summary>

| Skill | Description |
|-------|-------------|
| `test-coverage` | Identify gaps and write targeted tests |
| `e2e-testing` | E2E test scaffolding for critical paths |
</details>

<details>
<summary><strong>Content & Marketing Skills (2) — 확장 스킬</strong></summary>

> 개발자 외 마케터, 콘텐츠 팀을 위한 확장 스킬입니다.

| Skill | Description |
|-------|-------------|
| `ai-visibility` | GEO optimization: llms.txt, AI crawler access |
| `content-strategy` | Keyword research, topic clusters, content calendar |
</details>

### 📏 Rules

Coding rules and guidelines, organized by scope:

- **Common Rules** — Universal best practices (error handling, logging, naming conventions)
- **Language-Specific Rules** — TypeScript, Python, Go, C#, Java

### 🌐 Orchestration

The Multi-AI Orchestration system (see [dedicated section](#multi-ai-orchestration-) below).

---

## Guides

| Guide | Description |
|-------|-------------|
| 📘 **Quick Start** | Get up and running in 5 minutes |
| 📗 **Shortform Guide** | Concise reference for everyday use |
| 📕 **Longform Guide** | Deep dive into every feature |
| 🔒 **Security Guide** | Security best practices and scanning |
| ⭐ **Copilot Exclusive Features** | Features only available in Copilot CLI |
| ⚖️ **Copilot vs Claude Code** | Feature-by-feature comparison |
| 🚚 **Migration from Claude Code** | Step-by-step migration path with concept mapping |
| 🪝 **Hooks to GitHub Actions** | Claude Code Hooks alternatives (Git Hooks / Actions / Prompt Guards) |
| 🌐 **Orchestration Guide** ★ | Multi-AI orchestration patterns and setup |
| ✍️ **Skill Writing Best Practices** | Write trigger-first descriptions that actually fire |
| 🧪 **Skill Testing Guide** | Test trigger accuracy and output quality for promptware |
| 🔍 **QA Agent Guide** | Design QA agents that catch real bugs via boundary-crossing comparison |

All guides are in the [`guides/`](guides/) directory.

---

## Multi-AI Orchestration ★

> **Community pattern.** This is not an official built-in feature of GitHub Copilot CLI — it is a community-proposed workflow pattern that uses shell scripting, MCP, and pipelines to combine multiple AI tools. Copilot CLI serves as a convenient hub because of its GitHub integration and multi-model support.

### The Idea

No single AI is best at everything. Claude excels at reasoning, Codex at rapid implementation, Gemini at multimodal understanding, and Copilot at GitHub integration. What if you could use **all of them** from one place?

```
┌──────────────────────────────────────────────────┐
│              GitHub Copilot CLI                   │
│            (Orchestrator / Meta-Hub)              │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Claude Code│  │ Codex CLI│  │Gemini CLI│  ...  │
│  │(Reasoning)│  │(Implement)│ │(Multimod)│       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5 Orchestration Patterns (Patterns 1–5: cross-AI)

| Pattern | How It Works | Best For |
|---------|-------------|----------|
| 🐚 **Shell Execution** | Copilot spawns other CLIs via shell commands | Simple delegation |
| 🔌 **MCP Bridge** | Connect agents via Model Context Protocol servers | Structured tool sharing |
| 💬 **Message IPC** | Inter-process communication via files/pipes | Real-time collaboration |
| 🔗 **Pipeline** | Chain agents sequentially — output of one feeds the next | Multi-stage workflows |
| 🏛️ **Agent Council** | Multiple agents deliberate and vote on decisions | Critical decisions |

### 5 Additional Patterns (Intra-team orchestration)

| Pattern | How It Works | Best For |
|---------|-------------|----------|
| ⚡ **Fan-Out Parallel** | Dispatch independent subtasks simultaneously | Batch operations |
| 🔁 **Producer-Reviewer** | Iterative produce→review feedback loop | Artifact refinement |
| 🌲 **Hierarchical Delegation** | Nested orchestrators (root→domain→specialists) | Large multi-domain tasks |
| 🔄 **Iterative Refinement** | Self-correction loop with measurable exit criteria | Quality-sensitive generation |
| 🤝 **Review Trio** | 3-way review for non-PR artifacts (RFC, schema, architecture) | Pre-publish review |

### Tool Strength Matrix

| Capability | Copilot CLI | Claude Code | Codex CLI | Gemini CLI |
|-----------|:-----------:|:-----------:|:---------:|:----------:|
| GitHub Integration | ★★★ | ★☆☆ | ★★☆ | ★☆☆ |
| Deep Reasoning | ★★☆ | ★★★ | ★★☆ | ★★☆ |
| Rapid Implementation | ★★☆ | ★★☆ | ★★★ | ★★☆ |
| Multi-Model Access | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ |
| Multimodal (Images) | ★★☆ | ★★☆ | ★☆☆ | ★★★ |
| Orchestration | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ |

### References & Proven Frameworks

The orchestration system is informed by real-world multi-agent frameworks:

- [microsoft/autogen](https://github.com/microsoft/autogen) — Microsoft AutoGen framework
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — CrewAI role-based agents
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — LangGraph state machines
- [geekan/MetaGPT](https://github.com/geekan/MetaGPT) — MetaGPT multi-agent SOP
- [openai/swarm](https://github.com/openai/swarm) — OpenAI Swarm patterns

> 📖 See the full [Orchestration Guide](guides/) for implementation details.

---

## Copilot CLI vs Claude Code

| Feature | Copilot CLI | Claude Code |
|---------|:-----------:|:-----------:|
| GitHub-native MCP (Issues, PRs, Actions) | ✅ | ❌ |
| Multi-model (20+ models) | ✅ | ⚠️ Single vendor |
| IDE ↔ CLI shared context | ✅ | ⚠️ Via VS Code extension |
| Plan Mode with structured text planning | ✅ | ⚠️ Text-only |
| Autopilot Mode _(Experimental)_ | ✅ | ⚠️ `--dangerously-skip-permissions` |
| Background Agents | ✅ | ❌ |
| Fleet Mode (parallel agents) | ✅ | ❌ |
| Session SQL Database | ✅ | ❌ |
| Cross-session Memory | ✅ | ⚠️ `CLAUDE.md` only |
| LSP Integration | ✅ | ❌ |
| Multi-AI Orchestration | ✅ | ❌ |
| Deep Reasoning (single model) | ⚠️ Model-dependent | ✅ Opus |
| Community & ecosystem maturity | ⚠️ Growing | ✅ Established |
| Custom slash commands | ⚠️ Plugin-based | ✅ |

> ⚖️ See the full [Comparison Guide](guides/) for detailed analysis.

---

## Migration from Claude Code

Already using Claude Code or `everything-claude-code`? Migration is straightforward — the skill format is nearly identical:

```
CLAUDE.md rules        →  .github/copilot-instructions.md
.claude/commands/      →  skills/
.claude/settings.json  →  mcp-configs/ & contexts/
Claude Code Hooks      →  Git Hooks / GitHub Actions / Prompt Guards
```

The migration script automates most of the work:

```bash
node scripts/migrate-from-claude.js --source /path/to/your/project
```

> 🚚 See the full [Migration Guide](guides/migration-from-claude-code.md) and [Hooks Alternatives Guide](guides/hooks-to-github-actions.md).

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Add agents** — Define new agent roles in `agents/`
2. **Create skills** — Build reusable workflows in `skills/`
3. **Write rules** — Add coding guidelines in `rules/`
4. **Share orchestration patterns** — Contribute to `orchestration/`
5. **Improve guides** — Enhance documentation in `guides/`
6. **Add examples** — Show real-world setups in `examples/`

### Development

```bash
# Install dependencies
npm install

# Validate configs
npm run validate

# Run tests
npm test

# Lint markdown
npm run lint:md
```

Please read the existing guides and follow the established patterns before submitting a PR.

---

## License

[MIT](LICENSE) © Everything Copilot CLI Contributors

---

<p align="center">
  <sub>Built for the GitHub Copilot CLI community · Inspired by <a href="https://github.com/affaan-m/everything-claude-code">everything-claude-code</a> and <a href="https://github.com/hesreallyhim/awesome-claude-code">awesome-claude-code</a></sub>
</p>
