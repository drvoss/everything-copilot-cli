# Copilot Instructions — everything-copilot-cli

> The equivalent of `CLAUDE.md` for the GitHub Copilot CLI ecosystem.
> This file tells Copilot CLI how to understand, navigate, and contribute to this repository.

---

## Project Overview

**everything-copilot-cli** is the definitive guide and configuration system for GitHub Copilot CLI.
It provides a structured collection of agents, skills, rules, orchestration patterns,
MCP configurations, and multi-AI workflows.

This is a **reference repository** — it defines conventions, patterns, and reusable configurations
that projects can adopt. When working in this repo, Copilot CLI should treat content as
**configuration and documentation**, not application code.

### What This Repo Contains

| Directory | Purpose |
|-----------|---------|
| `agents/` | Agent definitions (persona, tools, model, behavior) |
| `skills/` | Composable skill modules organized by domain |
| `rules/` | Behavioral rules (common + language-specific) |
| `orchestration/` | Multi-agent coordination patterns |
| `contexts/` | Context definitions for scoped execution |
| `mcp-configs/` | Model Context Protocol server configurations |
| `schemas/` | JSON Schema files for validation |
| `guides/` | Documentation and usage guides |
| `examples/` | Complete example projects (Next.js, Python, .NET, monorepo) |
| `scripts/` | Validation, setup, and utility scripts |
| `tests/` | Configuration validation tests |

---

## Key Concepts

### Agents

Agents are personas with defined responsibilities, tool permissions, and behavioral guardrails. Each agent has:

- **Identity**: Name, role description, expertise areas
- **Tools**: Which tools the agent can use (e.g., `grep`, `edit`, `powershell`)
- **Model**: Recommended AI model (e.g., `claude-sonnet-4.5`, `gpt-4.1`)
- **Behavioral Rules**: How the agent should approach tasks
- **Escalation Policy**: When to hand off to another agent or human

### Skills

Skills are composable capabilities that agents can invoke. They are organized by domain:

- `skills/copilot-exclusive/` — GitHub-specific integrations (PRs, Issues, Actions)
- `skills/development/` — Code generation, refactoring, debugging
- `skills/documentation/` — Doc generation, README updates, API docs
- `skills/security/` — Vulnerability scanning, secret detection
- `skills/testing/` — Test generation, coverage analysis, TDD workflows

Each skill file should include a **"When to Use"** section describing trigger conditions.

### Rules

Rules define behavioral constraints and coding standards:

- `rules/common/` — Universal rules (commit formats, file naming, error handling)
- `rules/languages/` — Language-specific rules (TypeScript conventions, Python style, etc.)

### Orchestration Patterns

Orchestration defines how multiple agents collaborate:

- `orchestration/patterns/` — Reusable coordination patterns (pipeline, fan-out, review-chain)
- `orchestration/configs/` — Configuration for specific orchestration setups
- `orchestration/examples/` — Worked examples of multi-agent workflows
- `orchestration/skills/` — Orchestration-specific skill combinations

---

## Architecture

```text
┌─────────────────────────────────────────────────┐
│                   User Request                   │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Orchestration Layer                  │
│  (patterns/ configs/ — decides agent routing)    │
└──────┬──────────┬──────────┬──────────┬─────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐┌──────────┐┌──────────┐┌──────────┐
│  Agent 1 ││  Agent 2 ││  Agent 3 ││  Agent N │
│(planner) ││(architect)││(reviewer)││  (...)   │
└────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
     │           │           │           │
     ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────┐
│                  Skills Layer                    │
│  (composable capabilities agents can invoke)     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                  Rules Layer                     │
│  (behavioral constraints & coding standards)     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              MCP / Tool Layer                    │
│  (GitHub API, filesystem, build tools, etc.)     │
└─────────────────────────────────────────────────┘
```

---

## Working with This Repository

### Adding a New Agent

Create a Markdown file in `agents/` with this structure:

```markdown
---
name: agent-name
description: One-line description of what this agent does
agent_type: general-purpose | explore | task | code-review
model: claude-sonnet-4.5 | gpt-4.1 | claude-haiku-4.5
tools:
  - grep
  - glob
  - view
  - edit
  - powershell
escalation: human | planner | architect
---

# Agent Name

## Role
Detailed description of the agent's purpose and expertise.

## When to Use
- Bullet list of scenarios where this agent is the right choice.

## Behavioral Rules
1. Always do X before Y.
2. Never modify files outside scope Z.
3. Escalate to [other-agent] when [condition].

## Tool Permissions
| Tool | Permission | Notes |
|------|-----------|-------|
| edit | ✅ Allowed | Only within designated directories |
| powershell | ⚠️ Limited | Read-only commands only |
| github API | ✅ Allowed | Full access |

## Example Prompts
- "Break down this feature into implementable tasks"
- "Review this PR for security issues"
```

### Adding a New Skill

Create a Markdown file in the appropriate `skills/<category>/` subdirectory:

```markdown
---
name: skill-name
category: development | testing | security | documentation | copilot-exclusive
triggers:
  - keyword or phrase that activates this skill
  - another trigger condition
requires_tools:
  - tool1
  - tool2
---

# Skill Name

## Purpose
What this skill accomplishes.

## When to Use
Describe the conditions under which this skill should be activated.

## Steps
1. First action to take.
2. Second action to take.
3. Validation/verification step.

## Output Format
Describe what the skill produces (files, PR comments, reports, etc.).
```

### Adding a New Rule

Create a Markdown file in the appropriate `rules/` subdirectory:

- `rules/common/` for universal rules (e.g., `commit-format.md`, `error-handling.md`)
- `rules/languages/` for language-specific rules (e.g., `typescript.md`, `python.md`)

````markdown
---
name: rule-name
scope: common | language-specific
language: typescript | python | go | csharp  # only for language-specific
severity: error | warning | info
---

# Rule Name

## Description
What this rule enforces and why.

## Examples

### ✅ Correct

```text
// good example
```

### ❌ Incorrect

```text
// bad example
```

## Exceptions

When this rule can be relaxed and why.
````

### Adding an Orchestration Pattern

Create files in `orchestration/patterns/`:

```markdown
---
name: pattern-name
type: pipeline | fan-out | review-chain | iterative
agents:
  - agent1
  - agent2
  - agent3
---

# Pattern Name

## Flow
Describe the coordination flow between agents.

## When to Use
Scenarios where this orchestration pattern applies.

## Agent Responsibilities
| Step | Agent | Action | Output |
|------|-------|--------|--------|
| 1 | planner | Break down task | Task list |
| 2 | architect | Design solution | Architecture doc |
| 3 | code-reviewer | Review implementation | Feedback |

## Example
Worked example showing the pattern in action.
```

---

## Copilot Agent Mode Mapping

Copilot CLI operates in different modes. Here's how they map to this repository's patterns:

### Interactive Mode (Default)

Standard question-and-answer with user approval at each step.

- **Use for**: Exploratory work, learning the codebase, small targeted changes
- **Agent mapping**: Single agent with human-in-the-loop
- **Best agents**: `explore`, individual specialist agents
- **Example**: "What does the planner agent do?" → reads `agents/planner.md`, explains

### Plan Mode

Structured planning with a visual plan document for user approval before execution.

- **Use for**: Multi-step features, refactoring, migration tasks
- **Agent mapping**: Planner agent creates plan → user approves → execution agents implement
- **Best agents**: `planner` → `architect` → specialist agents
- **Example**: "Add a new security scanning skill" → plan created → approved → implemented

### Autopilot Mode

Autonomous execution without step-by-step approval.

- **Use for**: Well-defined tasks with clear acceptance criteria
- **Agent mapping**: Single agent or pipeline executing without checkpoints
- **Best agents**: `task` agent for builds/tests, `doc-updater` for docs
- **Example**: "Run all validation scripts and fix any issues" → executes autonomously

### Fleet Mode

Parallel task distribution across multiple agents.

- **Use for**: Large-scale changes, batch operations, independent subtasks
- **Agent mapping**: Fan-out pattern — multiple agents working simultaneously
- **Best agents**: Multiple `general-purpose` agents in parallel
- **Example**: "Add example configs for all 4 example projects" → 4 parallel agents

---

## Agent Type Usage

Map repository agents to Copilot CLI's built-in agent types:

| Copilot Agent Type | Best For | Repository Agents |
|-------------------|----------|-------------------|
| `explore` | Codebase understanding, file discovery, reading configs | Used by: planner (analysis phase), doc-updater (discovery) |
| `task` | Builds, tests, linting, dependency installs | Used by: build-error-resolver, tdd-guide (test runs) |
| `general-purpose` | Complex multi-step implementation, refactoring | Used by: architect, refactor-cleaner, security-reviewer |
| `code-review` | Reviewing changes, PR feedback | Used by: code-reviewer, security-reviewer |

### Agent Type Selection Guide

```text
Is it a read-only question about the codebase?
  → explore agent

Is it running a command (build, test, lint, install)?
  → task agent

Is it reviewing existing changes?
  → code-review agent

Is it implementing something complex?
  → general-purpose agent

Can parts of the work be done independently?
  → fleet mode with multiple agents
```

---

## Multi-AI Orchestration Guidelines

This repository supports workflows that span multiple AI coding assistants. Use the right tool for each job.

### When to Delegate to Claude Code

Claude Code excels at tasks requiring deep reasoning and large context windows (200K tokens):

- **Architecture decisions** — analyzing entire codebases for structural changes
- **Complex refactoring** — understanding interconnected dependencies across many files
- **Long document generation** — comprehensive guides, detailed specifications
- **Debugging subtle issues** — tracing logic across deep call chains
- **Code review with full context** — reviewing PRs that touch many files

**How**: Use `CLAUDE.md` (this repo's equivalent: `COPILOT-INSTRUCTIONS.md`) to provide project context. Claude Code reads project instructions automatically.

### When to Delegate to Codex

Codex (OpenAI) excels at fast, focused code generation:

- **Implementing well-defined functions** — clear input/output contracts
- **Code transformations** — converting between languages, frameworks, or patterns
- **Generating boilerplate** — CRUD endpoints, test scaffolding, config files
- **Quick prototyping** — rapid iteration on implementation ideas

**How**: Provide clear specifications with examples. Codex works best with precise prompts.

### When to Keep in Copilot CLI

Copilot CLI is the best choice when GitHub integration matters:

- **PR and Issue management** — creating, reviewing, commenting on PRs/Issues
- **GitHub Actions** — debugging workflows, checking CI status
- **Repository operations** — branch management, commit history, file operations
- **MCP-powered workflows** — leveraging MCP servers for extended capabilities
- **Multi-agent orchestration** — coordinating tasks across agent types

**How**: Use the agent types and orchestration patterns defined in this repository.

### MCP Bridges

Use MCP configurations in `mcp-configs/` to bridge between AI systems:

- **GitHub MCP Server** — gives any AI assistant access to GitHub APIs
- **Filesystem MCP Server** — standardized file access across tools
- **Custom MCP Servers** — project-specific integrations

```text
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Copilot CLI │────▶│  MCP Bridge │◀────│  Claude Code │
│  (orchestrate)│     │  (shared     │     │  (deep       │
│              │     │   context)   │     │   reasoning) │
└──────────────┘     └─────────────┘     └──────────────┘
                           ▲
                           │
                     ┌─────────────┐
                     │    Codex    │
                     │  (fast code │
                     │   gen)      │
                     └─────────────┘
```

---

## Coding Standards

All contributions must follow the rules defined in `rules/`:

### Common Rules (`rules/common/`)

- **Commit format**: Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **File naming**: Use kebab-case for all Markdown files (e.g., `build-error-resolver.md`)
- **Frontmatter**: All agent, skill, and rule files must include YAML frontmatter
- **Line length**: Markdown lines should wrap at 100 characters for readability
- **Links**: Use relative links within the repository

### Language-Specific Rules (`rules/languages/`)

Language rules apply when writing example code or scripts:

- **JavaScript/TypeScript**: ESM imports, strict mode, no `any` types
- **Python**: Type hints, PEP 8, f-strings over `.format()`
- **Go**: Standard library preferred, `gofmt` compliant
- **C#/.NET**: Nullable reference types enabled, async/await patterns

---

## Testing Standards

### Validating Configurations

Run the validation suite before committing:

```bash
# Validate all configuration files against schemas
npm run validate

# Lint all Markdown files
npm run lint:md

# Run the full test suite
npm test
```

### What Gets Validated

- **Frontmatter**: Required fields present and correctly typed
- **Schema compliance**: Files match their JSON Schema in `schemas/`
- **Internal links**: All cross-references resolve to existing files
- **Agent references**: Agents referenced in orchestration patterns exist in `agents/`
- **Skill references**: Skills referenced by agents exist in `skills/`

### Adding Tests

Place test files in `tests/` using Node.js built-in test runner:

```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('agent validation', () => {
  test('all agents have required frontmatter', async () => {
    // Test implementation
  });
});
```

---

## Git Workflow

### Branching Strategy

- `main` — stable, validated configurations
- `feat/<name>` — new agents, skills, or patterns
- `fix/<name>` — corrections to existing configurations
- `docs/<name>` — documentation improvements

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(agents): add security-reviewer agent definition
fix(rules): correct TypeScript rule for strict null checks
docs(guides): add getting-started guide for new contributors
chore(schemas): update agent schema with model field
```

Always include the Co-authored-by trailer when Copilot assists:

```text
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

### Pull Request Guidelines

1. **One concern per PR** — don't mix agent additions with rule changes
2. **Run validation** — `npm run validate && npm run lint:md && npm test`
3. **Update AGENTS.md** — if adding or modifying agents
4. **Include examples** — show how the new configuration is used
5. **Cross-reference** — link related agents, skills, and rules

---

## Quick Reference

| Task | Command / Action |
|------|-----------------|
| Validate configs | `npm run validate` |
| Lint Markdown | `npm run lint:md` |
| Run tests | `npm test` |
| Setup project | `npm run setup` |
| Add an agent | Create `agents/<name>.md` with frontmatter |
| Add a skill | Create `skills/<category>/<name>.md` |
| Add a rule | Create `rules/common/<name>.md` or `rules/languages/<lang>.md` |
| Add orchestration | Create `orchestration/patterns/<name>.md` |
| Add an example | Create files in `examples/<project-type>/` |
| Add MCP config | Create `mcp-configs/<name>.json` |
