<p align="center">
  <img src="https://github.githubassets.com/images/icons/copilot/cp-head-square.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>The definitive guide &amp; configuration system for GitHub Copilot CLI</strong><br/>
  Agents · Skills · Rules · Multi-AI Orchestration
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="#"><img src="https://img.shields.io/badge/copilot--cli-ready-28a745?logo=github" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="https://img.shields.io/badge/models-18%2B-blueviolet" alt="18+ Models" /></a>
  <a href="#"><img src="https://img.shields.io/badge/agents-8-orange" alt="8 Agents" /></a>
  <a href="#"><img src="https://img.shields.io/badge/skills-30%2B-green" alt="30+ Skills" /></a>
  <a href="#multi-ai-orchestration-"><img src="https://img.shields.io/badge/★_Multi--AI-Orchestrator-ff6f00" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.ko.md">🇰🇷 한국어</a>
</p>

---

## What is this?

**everything-copilot-cli** is for [GitHub Copilot CLI](https://githubnext.com/projects/copilot-cli/) what [everything-claude-code](https://github.com/anthropics/everything-claude-code) is for Claude Code — a curated, community-driven collection of agents, reusable skills, coding rules, MCP configurations, and comprehensive guides.

But we go further. Because Copilot CLI sits inside the GitHub ecosystem and supports 18+ models from multiple providers, it can do something no other coding agent can:

> **Act as a Multi-AI Orchestrator** — coordinating Claude Code, Codex CLI, Gemini CLI, and more from a single command line.

---

## Why Copilot CLI?

GitHub Copilot CLI has **11 structural advantages** over single-vendor coding agents:

| # | Advantage | Description |
|---|-----------|-------------|
| 1 | 🔗 **GitHub-Native Integration** | Issues, PRs, Actions, code search — all via built-in MCP. No extra setup. |
| 2 | 🧠 **18+ Model Selection** | GPT-5, Claude Sonnet/Opus, Gemini Pro — pick the right model per task. |
| 3 | 🔄 **IDE ↔ CLI Seamless Switching** | Same Copilot context in VS Code, JetBrains, and the terminal. |
| 4 | 📋 **Plan Mode** | Visual approval UI — review every step before execution. |
| 5 | 🤖 **Autopilot Mode** | Autonomous task execution with guardrails. |
| 6 | 👻 **Background Agents** | Fire-and-forget agents with auto-completion notifications. |
| 7 | ⚡ **Fleet Mode** | Parallel agent execution — split work across multiple agents simultaneously. |
| 8 | 🗄️ **Session SQL Database** | Built-in SQLite per session for structured data, todo tracking, and state. |
| 9 | 🧲 **Cross-Session Memory** | Persistent knowledge via `session_store` — learn across sessions. |
| 10 | 🏗️ **LSP First-Class Support** | Language Server Protocol integration for precise code intelligence. |
| 11 | 🌐 **Multi-AI Orchestrator** | ★ Orchestrate Claude Code, Codex, Gemini CLI from Copilot as the meta-hub. |

---

## Quick Start

```bash
# 1. Install GitHub Copilot CLI
gh extension install github/gh-copilot

# 2. Clone this repository
git clone https://github.com/anthropics/everything-copilot-cli.git
cd everything-copilot-cli

# 3. Run setup
npm install && npm run setup
```

Then open a terminal and start using Copilot CLI with the included agents, skills, and rules:

```bash
# Use an agent
gh copilot --agent planner "Design a REST API for user management"

# Use a skill
gh copilot --skill tdd "Add tests for the auth module"

# Orchestrate multiple AIs
gh copilot --skill orchestrate "Claude reasons, Codex implements, Copilot reviews"
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
├── skills/                        # Reusable workflow skills
│   ├── development/               #   Dev skills (TDD, code review, etc.)
│   ├── security/                  #   Security scanning & validation
│   ├── documentation/             #   Doc generation & updates
│   ├── testing/                   #   Test coverage & E2E
│   └── copilot-exclusive/         #   ★ Copilot-only skills (12)
│
├── rules/                         # Coding rules & guidelines
│   ├── common/                    #   Universal rules
│   └── languages/                 #   Language-specific (TS, Python, Go, C#, Java)
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   5 orchestration patterns
│   ├── configs/                   #   MCP bridge configs
│   ├── skills/                    #   Orchestration skills
│   └── examples/                  #   Real-world examples
│
├── guides/                        # Comprehensive guides
├── mcp-configs/                   # MCP server configurations
├── examples/                      # Project-specific examples
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

### ⚙️ Skills (20+ Core · 12 Copilot-Exclusive · Orchestration)

Reusable, composable workflows that agents can invoke.

<details>
<summary><strong>Development Skills</strong></summary>

- TDD Workflow
- Code Review Checklist
- Refactoring Patterns
- Dependency Upgrade
- Git Workflow Automation
</details>

<details>
<summary><strong>Security Skills</strong></summary>

- Secret Scanning
- Dependency Audit
- SAST Analysis
- Input Validation Checks
</details>

<details>
<summary><strong>Documentation Skills</strong></summary>

- API Doc Generation
- README Sync
- Changelog Generation
- Architecture Decision Records
</details>

<details>
<summary><strong>Testing Skills</strong></summary>

- Unit Test Generation
- E2E Test Scaffolding
- Coverage Analysis
- Mutation Testing
</details>

<details>
<summary><strong>★ Copilot-Exclusive Skills (12)</strong></summary>

Skills that leverage capabilities unique to GitHub Copilot CLI:

1. **Fleet Parallel Execution** — Split work across multiple agents
2. **Session SQL Tracking** — Use built-in SQLite for task management
3. **Cross-Session Memory** — Persist knowledge between sessions
4. **Background Agent Fire** — Launch fire-and-forget agents
5. **Plan Mode Review** — Visual step-by-step approval
6. **Model Selector** — Pick optimal model per subtask
7. **GitHub Issue Triage** — Auto-triage with built-in GitHub MCP
8. **PR Review Pipeline** — End-to-end PR review workflow
9. **Actions Debug** — Debug CI/CD failures with native Actions access
10. **LSP-Powered Refactor** — Refactor using Language Server intelligence
11. **Copilot Space Query** — Query Copilot Spaces for team context
12. **Multi-AI Delegate** — Delegate subtasks to other AI coding agents
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
| ⚖️ **Copilot vs Claude Code** | Feature-by-feature comparison |
| 🚚 **Migration from Claude Code** | Step-by-step migration path |
| ⭐ **Copilot Exclusive Features** | Features only available in Copilot CLI |
| 🌐 **Orchestration Guide** ★ | Multi-AI orchestration patterns and setup |

All guides are in the [`guides/`](guides/) directory.

---

## Multi-AI Orchestration ★

> **The killer feature.** GitHub Copilot CLI can act as a **meta-hub** that orchestrates multiple AI coding agents — each contributing its unique strength.

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

### 5 Orchestration Patterns

| Pattern | How It Works | Best For |
|---------|-------------|----------|
| 🐚 **Shell Execution** | Copilot spawns other CLIs via shell commands | Simple delegation |
| 🔌 **MCP Bridge** | Connect agents via Model Context Protocol servers | Structured tool sharing |
| 💬 **Message IPC** | Inter-process communication via files/pipes | Real-time collaboration |
| 🔗 **Pipeline** | Chain agents sequentially — output of one feeds the next | Multi-stage workflows |
| 🏛️ **Agent Council** | Multiple agents deliberate and vote on decisions | Critical decisions |

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

- [MCO (Multi-Claude Orchestrator)](https://github.com/example/mco) — Multi-instance orchestration
- [hcom](https://github.com/example/hcom) — Human-Computer Orchestration Model
- [roam-code](https://github.com/example/roam-code) — Roaming agent architecture
- [claude-flow](https://github.com/example/claude-flow) — Flow-based agent coordination
- [swarm](https://github.com/example/swarm) — OpenAI Swarm patterns
- [autogen](https://github.com/example/autogen) — Microsoft AutoGen framework
- [crewai](https://github.com/example/crewai) — CrewAI role-based agents
- [langgraph](https://github.com/example/langgraph) — LangGraph state machines
- [metagpt](https://github.com/example/metagpt) — MetaGPT multi-agent SOP

> 📖 See the full [Orchestration Guide](guides/) for implementation details.

---

## Copilot CLI vs Claude Code

| Feature | Copilot CLI | Claude Code |
|---------|:-----------:|:-----------:|
| GitHub-native MCP (Issues, PRs, Actions) | ✅ | ❌ |
| Multi-model (18+ models) | ✅ | ⚠️ Single vendor |
| IDE ↔ CLI shared context | ✅ | ❌ |
| Plan Mode with visual UI | ✅ | ⚠️ Text-only |
| Autopilot Mode | ✅ | ⚠️ `--dangerously-skip-permissions` |
| Background Agents | ✅ | ❌ |
| Fleet Mode (parallel agents) | ✅ | ❌ |
| Session SQL Database | ✅ | ❌ |
| Cross-session Memory | ✅ | ⚠️ `CLAUDE.md` only |
| LSP Integration | ✅ | ❌ |
| Multi-AI Orchestration | ✅ | ❌ |
| Deep Reasoning (single model) | ⚠️ Model-dependent | ✅ Opus |
| Community & ecosystem maturity | ⚠️ Growing | ✅ Established |
| Custom slash commands | ❌ | ✅ |

> ⚖️ See the full [Comparison Guide](guides/) for detailed analysis.

---

## Migration from Claude Code

Already using `everything-claude-code`? Migration is straightforward:

```
CLAUDE.md rules       →  rules/common/ & rules/languages/
.claude/commands/     →  skills/
.claude/settings.json →  mcp-configs/ & contexts/
```

The migration script automates most of the work:

```bash
node scripts/migrate-from-claude.js --source /path/to/your/project
```

> 🚚 See the full [Migration Guide](guides/) for step-by-step instructions.

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
  <sub>Inspired by <a href="https://github.com/anthropics/everything-claude-code">everything-claude-code</a> · Built for the GitHub Copilot CLI community</sub>
</p>
