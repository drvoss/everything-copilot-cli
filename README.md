<p align="center">
  <img src="docs/images/copilot.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>A Copilot-first guide &amp; configuration system for GitHub Copilot CLI</strong><br/>
  Agents · Skills · Rules · Multi-AI Orchestration
</p>

<p align="center">
  <a href="LICENSE"><img src="docs/images/badge-license.svg" alt="MIT License" /></a>
  <a href="#"><img src="docs/images/badge-copilot-cli-ready.svg" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="docs/images/badge-models.svg" alt="20+ Models" /></a>
  <a href="#"><img src="docs/images/badge-agents.svg" alt="8 Agents" /></a>
  <a href="#"><img src="docs/images/badge-skills.svg" alt="100 Skills" /></a>
  <a href="#multi-ai-orchestration-"><img src="docs/images/badge-multi-ai.svg" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.ko.md">한국어</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.zh.md">中文</a>
</p>

---

## What is this?

**everything-copilot-cli** is a Copilot-first operating kit for AI-assisted software delivery on GitHub.

This repository is built around three ideas:

- **GitHub as the system of record** — Issues, PRs, Actions, and code search are first-class inputs, not afterthoughts
- **Copilot CLI as the orchestration hub** — the coordination layer that routes tasks to the right model or agent and synthesizes results back through GitHub
- **Model choice as a routing decision** — GPT, Claude, and Gemini each have strengths inside Copilot; external specialists like Codex CLI can be orchestrated when a separate tool is the better fit

The result is a curated collection of agents, skills, rules, MCP configurations, and orchestration patterns — portable where possible, Copilot-native where it matters.

> See [Multi-AI Orchestration](#multi-ai-orchestration-) for how this repo's community patterns coordinate Claude Code, Codex CLI, and Gemini CLI as external specialist workers.

---

## Design Principles

| Principle | What it means in practice |
|-----------|--------------------------|
| **GitHub as system of record** | Every workflow starts and ends in GitHub. Issues are task inputs. PRs are agent outputs. Actions are the observability layer. |
| **Copilot CLI as orchestration hub** | Copilot does not just generate code — it coordinates specialists. Claude reasons deeply, Codex generates fast, Gemini analyzes visuals; Copilot routes and synthesizes. |
| **Model choice is routing, not loyalty** | No single model wins every task. Skills and patterns in this repo are designed to route work to the strongest model for each subtask. |
| **Portable core, Copilot-native layer** | Most skills work in any agentskills.io-compatible runtime. Copilot-exclusive capabilities are clearly separated in `skills/copilot-exclusive/` so you always know what depends on native Copilot features. |

---

## Why Copilot CLI?

Three capabilities make Copilot CLI a strong hub for multi-AI development workflows:

**GitHub-native access** — Copilot CLI ships with a built-in GitHub MCP server. Issues, PRs, Actions logs, and code search are structured tool calls, not scraped text. No extra GitHub integration layer is required.

**Multi-model routing** — Within Copilot CLI you can switch between model families such as GPT, Claude, and Gemini with `/model` or per-agent overrides in the same session. Use a premium reasoning model for architecture, a fast model for boilerplate, and a cheaper model for triage.

**Orchestration primitives** — Plan Mode, Autopilot, Fleet, Background Delegation, and the built-in SQLite session database give you building blocks for complex multi-agent workflows. When a separate specialist tool is the better fit, this repository's orchestration patterns show how to delegate to Codex CLI, Claude Code, or Gemini CLI and bring the result back through GitHub.

<details>
<summary>Full capability reference (11 features)</summary>

| # | Advantage | Description |
|---|-----------|-------------|
| 1 | **GitHub-Native Integration** | Issues, PRs, Actions, code search — all via built-in MCP. No extra setup. |
| 2 | **20+ Model Selection** | GPT-5.x, Claude Sonnet/Opus 4.6, Gemini 3 Pro — pick the right model per task. |
| 3 | **IDE ↔ CLI Seamless Switching** | Same Copilot context in VS Code, JetBrains, and the terminal. |
| 4 | **Plan Mode** | Structured text planning — Copilot builds a step-by-step implementation plan before writing any code. |
| 5 | **Autopilot Mode** | Autonomous task execution with guardrails. _(Experimental)_ |
| 6 | **Background Agents** | Delegate to cloud Copilot agents via `&` or `/delegate`; resume anytime with `/resume`. |
| 7 | **Fleet Mode** | Parallel agent execution — split work across multiple agents simultaneously. |
| 8 | **Session SQL Database** | Built-in SQLite per session for structured data, todo tracking, and state. |
| 9 | **Cross-Session Memory** | Search and reuse prior session history via `session_store`. |
| 10 | **LSP First-Class Support** | Language Server Protocol integration for precise code intelligence. |
| 11 | **Multi-AI Orchestrator** | Orchestrate Claude Code, Codex, Gemini CLI from Copilot as the meta-hub _(community pattern)_. |

</details>

---

## Quick Start

```bash
# 1. Install GitHub Copilot CLI
npm install -g @github/copilot

# 2. Clone this repository
git clone https://github.com/drvoss/everything-copilot-cli.git
cd everything-copilot-cli

# 3. Verify the cloned repository
npm install && npm run setup

# 4. Install the collection into your project
npm run setup -- --target /path/to/your-project
```

The first command runs a quick verification for the documented clone + setup flow. The second command is also run from this repository root and installs into the project path passed through `--target`.

During step 4, setup offers these profiles:

| Profile | Recommended? | Installs |
|---|---|---|
| `minimal` | For light touch onboarding | `.github/copilot-instructions.md` only |
| `recommended` | **Yes** | Starter instructions, agents, skills, and rules |
| `full` | For advanced setups | Everything, including contexts |
| `custom` | When you want full control | Lets you choose each component with explanations |

Setup writes project instructions to `.github/copilot-instructions.md`, installs custom agents to `.github/agents/`, project skills to `.github/skills/`, and rules to `.github/copilot/rules/`. The `full` profile also installs contexts to `.github/copilot/contexts/`.

Then open a terminal and start using Copilot CLI with the installed agents, skills, and rules:

```bash
# Start a session in your project directory
cd your-project
copilot
```

After `copilot` starts, you can quickly check whether the installation was picked up:

```text
- The startup banner should mention your project custom instruction and show additional project skills and agents.
- `/instructions` should show the installed project instructions.
- `/skills` should show project skills, not just built-in ones.
- `/agent` should show custom agents such as `planner`.
- If you only see built-in skills and no project agents, the collection was not discovered in this repository yet.
```

```bash
# Use the planner agent (inside the session)
> Design a REST API for user management — use plan mode

# Run TDD workflow
> Add tests for the auth module using TDD

# Orchestrate multiple AIs
> Claude reasons architecture, Codex implements, Copilot reviews — delegate accordingly
```

> For detailed instructions, see the [Quick Start Guide](guides/the-quickstart-guide.md).
> Want a copy-paste beginner lab? Try the [Beginner Skills Tutorial](guides/the-beginner-skills-tutorial.md).

---

## Repository Structure

```text
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
├── skills/                        # Reusable workflow skills (96 total)
│   ├── copilot-exclusive/         #   ★ Copilot-only skills (25)
│   ├── development/               #   Dev skills (23)
│   ├── documentation/             #   Doc skills (6)
│   ├── security/                  #   Security skills (7)
│   ├── testing/                   #   Test skills (5)
│   ├── workflow/                  #   Workflow skills (22)
│   ├── product/                   #   Product skills (5)
│   └── content/                   #   Content & GEO skills (3)
│
├── rules/                         # Coding rules & guidelines
│   ├── common/                    #   Universal rules (6)
│   ├── languages/                 #   Language-specific: TS, Python, Go, C#, Java, C++
│   └── frameworks/                #   Framework rules (7)
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   11 orchestration patterns
│   ├── configs/                   #   MCP bridge configs
│   ├── skills/                    #   Orchestration skills (7)
│   ├── templates/                 #   Reusable orchestrator templates
│   └── examples/                  #   Real-world examples (6)
│
├── guides/                        # 16 comprehensive guides
├── mcp-configs/                   # MCP server configurations (7 files; 6 configs + README)
├── examples/                      # Project-specific copilot-instructions
│   ├── nextjs-app/
│   ├── python-api/
│   ├── dotnet-webapp/
│   └── monorepo/
│
├── contexts/                      # Context presets
├── references/                    # Checklist & pattern references (5)
│   ├── testing-patterns.md        # AAA structure, mocking, component/API/E2E patterns
│   ├── security-checklist.md      # OWASP Top 10, auth, input validation, security headers
│   ├── performance-checklist.md   # Core Web Vitals, frontend/backend optimization
│   ├── accessibility-checklist.md # WCAG 2.1 AA, keyboard nav, screen reader, forms
│   └── ecosystem-monitoring-playbook.md # Monitoring cadence, prompt archetypes, adopt/adapt/reject output contract
├── scripts/                       # Setup & migration tools
└── tests/                         # Test suite
```

---

## Core Components

### Agents (8 Core)

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

### Skills (96 Total · 8 Categories)

Reusable, composable workflows organized by category. All follow the [agentskills.io](https://agentskills.io) spec.

<details>
<summary><strong>★ Copilot-Exclusive Skills (25)</strong></summary>

Skills that leverage capabilities unique to GitHub Copilot CLI:

| Skill | Description |
|-------|-------------|
| `context-prime` | Load project context at session start (README, file tree, commits, stack) |
| `session-management` | Built-in SQLite for todo tracking and structured state |
| `plan-mode-mastery` | Structured text planning with approval workflow |
| `autopilot-patterns` | Autonomous execution with guardrails |
| `background-agent` | Delegate to cloud agents via `&` / `/delegate` |
| `fleet-parallel` | Parallel agent execution with `/fleet` |
| `github-code-search` | Search GitHub's global code index for real implementation examples and use the results as grounded context |
| `github-pr-workflow` | Full PR lifecycle via built-in GitHub MCP |
| `github-issue-triage` | Bulk issue classification and triage |
| `actions-debugging` | Debug CI failures with native Actions access |
| `cross-session-memory` | Search and resume prior session context |
| `copilot-memory` | Review and curate repository-level Copilot memory shared across CLI, cloud agent, and code review |
| `knowledge-curator` | Promote repeated lessons into durable project guidance |
| `mcp-builder` | Build a new MCP server with config validation and hot-reload |
| `multi-model-strategy` | Pick the right model per task |
| `mcp-ecosystem` | Extend with custom MCP servers |
| `ide-switching` | Seamless VS Code ↔ CLI context sharing |
| `scope-guard` | Lock a task to a narrow writable surface and add explicit stop rules for risky work |
| `team-planner` | Assemble specialist agent teams via SQL roster + `/fleet` dispatch |
| `agentic-engineering` | Design 15-min task units, eval-first loops, and explicit I/O contracts |
| `stack-detector` | Scan project tech stack and recommend relevant skills and rules from this collection |
| `task-intake-router` | Route incoming work to the right mode, agent type, model, and delegation path |
| `ecosystem-intake` | Convert curated ecosystem sources into adopt/adapt/reject backlog candidates |
| `sub-agent-sandboxing` | Constrain delegated work with loop thresholds, circuit breakers, and sandbox escalation before accepting output |
| `token-cost-optimizer` | Proactively reduce Copilot usage cost before large autonomous or parallel tasks |

</details>

<details>
<summary><strong>Development Skills (23)</strong></summary>

| Skill | Description |
|-------|-------------|
| `api-and-interface-design` | Define public APIs, CLIs, webhooks, or SDK contracts before implementation |
| `tdd-workflow` | Red → Green → Refactor cycle |
| `code-review` | Structured review with severity levels |
| `cpp-debugging` | Use when a C++ failure involves memory lifetime, undefined behavior, native crashes, or debugger-only state — debug with symbols, sanitizers, and platform-native debuggers before patching symptoms |
| `fix-github-issue` | Read issue → locate bug → fix → test → PR |
| `fix-build-errors` | Diagnose and resolve build failures |
| `improve-codebase-architecture` | Use when a codebase feels hard to change, test, or navigate — surface architectural friction and walk one deeper-module candidate into a concrete refactoring direction |
| `performance-optimization` | Measure first, isolate bottlenecks, and prove performance improvements |
| `pr-multi-perspective-review` | 6-lens PR review: PM / Dev / QA / Security / DevOps / UX |
| `review` | Compare changes against a pinned git reference on two separate axes: repository standards and originating spec |
| `prototype` | Use when a design question is still fuzzy — build a throwaway logic or UI prototype that answers one question fast and is meant to be deleted or absorbed |
| `refactor-clean` | Remove dead code, simplify logic safely |
| `diagnose` | Build the fastest feedback loop first, rank the leading hypotheses, and instrument only what narrows the search |
| `source-driven-development` | Verify framework and library APIs against current official docs before implementing |
| `spec-driven-development` | Write a technical spec before coding — defines interface, structure, and boundaries first |
| `context-engineering` | Optimize information delivery to AI agents — minimize noise, maximize signal |
| `deprecation-and-migration` | Safely remove old APIs and migrate to new patterns with a 3-phase process |
| `skill-creator` | Describe a workflow → get a SKILL.md scaffolded in minutes |
| `systematic-debugging` | 4-phase root cause analysis (reproduce → isolate → hypothesize → verify) before fixing |
| `zoom-out` | Step one abstraction level up from a local code detail, map owners and callers, and restate the system in project vocabulary |

**Combo Skills** (activate when two technologies are used together):

| Skill | Description |
|-------|-------------|
| `nextjs-prisma` | Type-safe data fetching and Server Actions for Next.js App Router + Prisma projects |
| `react-vitest` | Component testing setup and patterns for React + Vitest projects |
| `nestjs-prisma` | PrismaService singleton, repository pattern, and unit testing for NestJS + Prisma |

</details>

<details>
<summary><strong>Documentation Skills (6)</strong></summary>

| Skill | Description |
|-------|-------------|
| `add-to-changelog` | Keep a Changelog format, semver version sync |
| `doc-update` | Sync docs when implementation changes |
| `document-generate` | Create missing Diataxis documentation from scratch for a feature, module, or project |
| `api-documentation` | Generate and maintain API docs from source |
| `code-tour` | Generate VS Code CodeTour `.tour` files for codebase onboarding |
| `architecture-decisions` | Document hard-to-reverse technical decisions as Architecture Decision Records (ADRs) |

</details>

<details>
<summary><strong>Security Skills (7)</strong></summary>

| Skill | Description |
|-------|-------------|
| `agent-owasp-check` | Audit an AI agent system against the OWASP Agentic Security Initiative Top 10 |
| `evaluate-repository` | 7-dimension scorecard (1–10) with remediation plan |
| `security-scan` | OWASP Top 10 + dependency audit |
| `secret-detection` | Find hardcoded secrets in source and git history |
| `input-validation` | Prevent injection attacks (SQL, XSS, CSRF) |
| `security-bounty-hunter` | Bug-bounty-perspective vuln hunting with proof-of-concept steps |
| `pr-security-review` | Automated PR security analysis — auth, injection, secrets, OWASP Top 10 |

</details>

<details>
<summary><strong>Workflow Skills (22)</strong></summary>

| Skill | Description |
|-------|-------------|
| `commit-workflow` | Conventional commits + emoji, atomic split guidance |
| `doubt-driven-development` | Challenge a non-trivial decision with a fresh-context adversarial review before it stands |
| `release` | tag → GitHub Release → publish (npm/PyPI/Docker) |
| `verification-before-completion` | Prove a task is done with fresh command output before claiming success |
| `sprint-workflow` | Full sprint: Think → Plan → Build → Review → Test → Ship → Monitor |
| `deployment-canary` | Post-release canary checks, rollback thresholds, and promote/hold decisions |
| `security-audit` | OWASP Top 10 + STRIDE threat modeling |
| `sprint-retro` | Data-driven retros using git metrics |
| `cost-audit` | Audit AI inference token spend and recommend model/prompt optimizations |
| `council` | Convene a 4-voice adversarial decision council for high-stakes choices |
| `deep-research` | Systematic multi-source research with structured synthesis |
| `grill-me` | Stress-test a plan with one-question-at-a-time interrogation until assumptions, dependencies, and risks are explicit |
| `grill-with-docs` | Stress-test a plan against existing docs, glossary terms, and ADRs before implementation begins |
| `handoff` | Create a portable markdown handoff for the next session, agent, or machine without duplicating existing artifacts |
| `implementation-review` | Compare a delivered diff against the original task spec and produce actionable follow-up feedback |
| `interview-me` | Discover what the user actually wants before writing a plan, spec, or code |
| `llm-wiki` | Use when research or domain knowledge keeps getting rediscovered across sessions — build a supplementary markdown wiki that compounds synthesized knowledge without replacing GitHub or committed project guidance |
| `outside-voice` | Get an independent second opinion before, during, or after implementation with challenge, consult, and review modes |
| `prompt-optimizer` | Rewrite rough prompts into a finished, copy-pasteable prompt for chat-based LLMs with no placeholders |
| `to-issues` | Break a plan, spec, or PRD into thin dependency-aware issues that each deliver a verifiable vertical slice |
| `triage` | Use when a single issue needs structured triage — classify it, reproduce if needed, request missing information, and leave a durable brief or close-out note in the tracker |
| `using-git-worktrees` | Create isolated working directories for parallel branch work without recloning the repo |

</details>

<details>
<summary><strong>Product Skills (5)</strong></summary>

| Skill | Description |
|-------|-------------|
| `create-prd` | JTBD-grounded PRD template |
| `feature-prioritization` | Impact × Confidence × Effort matrix |
| `opportunity-solution-tree` | Teresa Torres' OST framework |
| `launch-strategy` | Alpha → Beta → GA launch checklist |
| `product-capability` | Transform requirements into SRS-style capability specs with ACs and traceability |

</details>

<details>
<summary><strong>Testing Skills (5)</strong></summary>

| Skill | Description |
|-------|-------------|
| `test-coverage` | Identify gaps and write targeted tests |
| `e2e-testing` | E2E test scaffolding for critical paths |
| `eval-harness` | Build LLM pipeline evaluation suites with SQL-tracked test cases |
| `browser-devtools` | Verify frontend behavior at runtime — DOM validation, network inspection, performance profiling |
| `ux-audit` | Structured usability review with Krug-inspired heuristics and prioritized findings |

</details>

<details>
<summary><strong>Content & Marketing Skills (3)</strong></summary>

| Skill | Description |
|-------|-------------|
| `ai-visibility` | GEO optimization: llms.txt, AI crawler access |
| `content-strategy` | Keyword research, topic clusters, content calendar |
| `seo` | Technical SEO audit: Core Web Vitals, structured data, crawl issues |

</details>

### Rules

Coding rules and guidelines, organized by scope:

- **Common Rules** — Universal best practices (error handling, logging, naming conventions)
- **Language-Specific Rules** — TypeScript, Python, Go, C#, Java
- **Framework-Specific Rules** — Next.js, React, Prisma, Playwright, NestJS, Cloudflare Workers, Vitest

### Orchestration

The Multi-AI Orchestration system (see [dedicated section](#multi-ai-orchestration-) below).

---

## Guides

| Guide | Description |
|-------|-------------|
| **Quick Start** | Get up and running in 5 minutes |
| **Shortform Guide** | Concise reference for everyday use |
| **Longform Guide** | Deep dive into every feature |
| **Security Guide** | Security best practices and scanning |
| **Copilot Exclusive Features** | Features only available in Copilot CLI |
| **Copilot vs Claude Code** | Compare strengths, tradeoffs, and when to use each tool |
| **Migration from Claude Code** | Step-by-step migration path with concept mapping |
| **Hooks to GitHub Actions** | Claude Code Hooks alternatives (Git Hooks / Actions / Prompt Guards) |
| **Orchestration Guide** | Multi-AI orchestration patterns and setup |
| **Skill Writing Best Practices** | Write trigger-first descriptions that actually fire |
| **Skill Testing Guide** | Test trigger accuracy and output quality for promptware, with Promptfoo as an optional output-quality supplement |
| **QA Agent Guide** | Design QA agents that catch real bugs via boundary-crossing comparison |
| **Beginner Skills Tutorial (EN)** | Copy-paste lab to feel the difference between plain and skill-guided prompting |
| **Beginner Skills Tutorial (KO)** | Korean version of the beginner hands-on skills lab |
| **Beginner Skills Tutorial (JA)** | Japanese version of the beginner hands-on skills lab |
| **Beginner Skills Tutorial (ZH)** | Chinese version of the beginner hands-on skills lab |

All guides are in the [`guides/`](guides/) directory.

---

## Multi-AI Orchestration ★

> **Two layers — the distinction matters.**
>
> **Copilot-native**: GitHub MCP, `/model` switching, Plan Mode, Autopilot, Fleet, Background Agents, and the session SQL database are built into Copilot CLI.
>
> **Community pattern**: cross-tool orchestration with Claude Code, Codex CLI, and Gemini CLI is documented in this repository as a shell/MCP/pipeline workflow pattern. It depends on those external CLIs being installed and is not an official built-in Copilot feature.

### The Idea

No single AI is best at everything. Claude excels at reasoning, Codex at rapid implementation, Gemini at multimodal understanding, and Copilot at GitHub integration. What if you could use **all of them** from one place?

```text
┌──────────────────────────────────────────────────┐
│                GitHub Copilot CLI                │
│            (Orchestrator / Meta-Hub)             │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Claude Code│  │  Codex CLI │  │ Gemini CLI │  │
│  │ (Reasoning)│  │(Impl./Gen.)│  │(Multimodal)│  │
│  └────────────┘  └────────────┘  └────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5 Orchestration Patterns (Patterns 1–5: cross-AI)

| Pattern | How It Works | Best For |
|---------|-------------|----------|
| **Shell Invocation** | Copilot spawns other CLIs via shell commands | Simple delegation |
| **MCP Bridge** | Connect agents via Model Context Protocol servers | Structured tool sharing |
| **Message IPC** | Inter-process communication via files/pipes | Real-time collaboration |
| **Pipeline** | Chain agents sequentially — output of one feeds the next | Multi-stage workflows |
| **Agent Council** | Multiple agents deliberate and vote on decisions | Critical decisions |

### 6 Additional Patterns (Intra-team orchestration, Patterns 6–11)

| Pattern | How It Works | Best For |
|---------|-------------|----------|
| **Fan-Out Parallel** | Dispatch independent subtasks simultaneously | Batch operations |
| **Producer-Reviewer** | Iterative produce→review feedback loop | Artifact refinement |
| **Hierarchical Delegation** | Nested orchestrators (root→domain→specialists) | Large multi-domain tasks |
| **Iterative Refinement** | Self-correction loop with measurable exit criteria | Quality-sensitive generation |
| **Review Trio** | 3-way review for non-PR artifacts (RFC, schema, architecture) | Pre-publish review |
| **Sub-Agent Sandboxing** | Constrain delegated agents with worktree, scope, and permission boundaries | High-safety delegation |

### Tool Specialization

Each AI tool in the orchestration ecosystem has a distinct specialization. Copilot CLI acts as the coordinator that brings them together:

| AI Tool | Specialization | Role in the Workflow |
|---------|---------------|----------------------|
| **Copilot CLI** | GitHub integration · multi-model flexibility · orchestration | Meta-hub / coordinator |
| **Claude Code** | Deep reasoning · large-context analysis | Reasoning specialist |
| **Codex CLI** | Rapid code generation · boilerplate | Implementation specialist |
| **Gemini CLI** | Multimodal understanding · visual analysis | Vision / multimodal specialist |

### References & Proven Frameworks

The orchestration system is informed by real-world multi-agent frameworks:

- [microsoft/autogen](https://github.com/microsoft/autogen) — Microsoft AutoGen framework
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — CrewAI role-based agents
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — LangGraph state machines
- [geekan/MetaGPT](https://github.com/geekan/MetaGPT) — MetaGPT multi-agent SOP
- [openai/swarm](https://github.com/openai/swarm) — OpenAI Swarm patterns

> See the full [Orchestration Guide](guides/the-orchestration-guide.md) for implementation details.

---

## What Makes Copilot CLI Unique

Copilot CLI is purpose-built around your GitHub workflow. Here's what you get out of the box:

| Capability | Details |
|-----------|---------|
| **GitHub-Native MCP** | Issues, PRs, Actions, and code search — zero extra setup |
| **20+ Model Selection** | Switch between GPT-5.x, Claude Sonnet/Opus 4.6, Gemini 3 Pro per task |
| **IDE ↔ CLI Context Sharing** | Seamless switching between VS Code, JetBrains, and the terminal |
| **Plan Mode** | Structured text planning with approval workflow before any code is written |
| **Autopilot Mode** | Autonomous task execution with guardrails _(Experimental)_ |
| **Background Agents** | Delegate to cloud agents via `&` / `/delegate`; resume with `/resume` |
| **Fleet Mode** | Parallel agent execution — split work across multiple agents simultaneously |
| **Session SQL Database** | Built-in SQLite per session for structured state and todo tracking |
| **Cross-Session Memory** | Search prior session history with `session_store` and `/resume` |
| **LSP Integration** | Language Server Protocol for precise, symbol-aware code intelligence |
| **Multi-AI Orchestration** | Coordinate Claude Code, Codex, Gemini CLI from a single hub _(community pattern)_ |

> See the [Copilot Exclusive Features guide](guides/copilot-exclusive-features.md) for a deep dive into each capability.

---

## Migration from Another Tool

Coming from another AI coding tool? The skill format is nearly identical, so migration is straightforward:

```text
CLAUDE.md rules        →  .github/copilot-instructions.md
.claude/commands/      →  .github/skills/
.claude/settings.json  →  mcp-configs/ & contexts/
Claude Code Hooks      →  Git Hooks / GitHub Actions / Prompt Guards
```

The migration script automates most of the work:

```bash
node scripts/migrate-from-claude.js /path/to/your/project
```

> See the full [Migration Guide](guides/migration-from-claude-code.md) and [Hooks Alternatives Guide](guides/hooks-to-github-actions.md).

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
  <sub>Built for the GitHub Copilot CLI community</sub>
</p>

<p align="center">
  <sub>Acknowledges the pioneering work of <a href="https://github.com/affaan-m/everything-claude-code">everything-claude-code</a> and <a href="https://github.com/hesreallyhim/awesome-claude-code">awesome-claude-code</a></sub>
</p>
