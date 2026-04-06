# Multi-AI Orchestration with Copilot CLI

> **Copilot CLI as the Meta Hub** — GitHub is where all code converges. Copilot CLI is the only AI tool with native access to Issues, PRs, Actions, and the full GitHub ecosystem. This makes it the natural orchestrator for all other AI coding tools.

## Why Multi-AI Orchestration Matters

No single AI tool excels at everything. Claude Code has 200K context and deep reasoning. Codex CLI has GPT-5 and blazing speed. Gemini CLI handles multimodal analysis. **Copilot CLI connects them all through GitHub** — where every project lives.

Instead of choosing one tool, orchestrate them:

```
┌─────────────────────────────────────────────────────┐
│                  Copilot CLI (Hub)                   │
│         GitHub Issues • PRs • Actions • MCP         │
├──────────┬──────────┬──────────┬────────────────────┤
│ Claude   │ Codex    │ Gemini   │ Other AI           │
│ Code     │ CLI      │ CLI      │ Tools              │
│          │          │          │                    │
│ 200K ctx │ GPT-5    │ Multi-   │ Extensible         │
│ Reason   │ Fast gen │ modal    │ via MCP            │
└──────────┴──────────┴──────────┴────────────────────┘
```

## Tool Strength Matrix

| Capability              | Copilot CLI | Claude Code | Codex CLI | Gemini CLI |
|------------------------|:-----------:|:-----------:|:---------:|:----------:|
| GitHub Integration     | ★★★★★      | ★★☆☆☆      | ★★☆☆☆    | ★★☆☆☆     |
| Deep Reasoning         | ★★★★☆      | ★★★★★      | ★★★★☆    | ★★★★☆     |
| Fast Code Generation   | ★★★★☆      | ★★★☆☆      | ★★★★★    | ★★★★☆     |
| Large Context (200K+)  | ★★★☆☆      | ★★★★★      | ★★★☆☆    | ★★★★★     |
| Multimodal Analysis    | ★★☆☆☆      | ★★★☆☆      | ★★☆☆☆    | ★★★★★     |
| MCP Ecosystem          | ★★★★★      | ★★★★★      | ★★★☆☆    | ★★★★☆     |
| Autonomous Execution   | ★★★★★      | ★★★★★      | ★★★★★    | ★★★★☆     |
| PR/Issue Management    | ★★★★★      | ★★☆☆☆      | ★★☆☆☆    | ★★☆☆☆     |

## Ten Orchestration Patterns

### Cross-AI Patterns (1–5)

| # | Pattern | Complexity | Best For |
|---|---------|:----------:|----------|
| 1 | [Shell Invocation](patterns/shell-invocation.md) | Low | Quick delegation, simple tasks |
| 2 | [MCP Bridge](patterns/mcp-bridge.md) | Medium | Type-safe integration, production use |
| 3 | [Message IPC](patterns/message-ipc.md) | Medium | Real-time multi-agent collaboration |
| 4 | [Pipeline](patterns/pipeline.md) | Medium | Sequential processing, Unix philosophy |
| 5 | [Agent Council](patterns/agent-council.md) | High | Complex tasks needing multiple perspectives |

### Intra-Team Patterns (6–10)

| # | Pattern | Complexity | Best For |
|---|---------|:----------:|----------|
| 6 | [Fan-Out Parallel](patterns/fan-out-parallel.md) | Medium | Independent subtasks running simultaneously |
| 7 | [Producer-Reviewer](patterns/producer-reviewer.md) | Medium | Iterative artifact refinement with feedback loop |
| 8 | [Hierarchical Delegation](patterns/hierarchical-delegation.md) | High | Large multi-domain tasks with nested orchestrators |
| 9 | [Iterative Refinement](patterns/iterative-refinement.md) | Medium | Quality-sensitive generation with measurable exit criteria |
| 10 | [Review Trio](patterns/review-trio.md) | Low | 3-way review for non-PR artifacts (RFC, schema, architecture) |

### Pattern Selection Guide

```
Need it simple and fast?
  → Pattern 1: Shell Invocation

Need type-safe, reusable integration?
  → Pattern 2: MCP Bridge

Need agents collaborating in real-time?
  → Pattern 3: Message IPC

Need sequential processing with clear hand-offs?
  → Pattern 4: Pipeline

Need the highest quality output from multiple AIs?
  → Pattern 5: Agent Council

Need to run independent subtasks in parallel?
  → Pattern 6: Fan-Out Parallel

Need iterative review cycles until quality threshold met?
  → Pattern 7: Producer-Reviewer

Need nested orchestration for large multi-domain tasks?
  → Pattern 8: Hierarchical Delegation

Need self-correcting generation with measurable criteria?
  → Pattern 9: Iterative Refinement

Need a lightweight 3-way review for documents or designs?
  → Pattern 10: Review Trio
```

## Skills (Reusable Recipes)

Orchestration skills fall into the **Orchestrator** tier of the [three-layer skill architecture](../skills/README.md#skill-architecture-three-layer-model):

| Layer | Role | Examples here |
|-------|------|---------------|
| **Orchestrator** | Coordinates teams, manages workflow, synthesizes results | `team-planner`, `fleet-parallel`, all `orchestration/skills/*` |
| **Agent-Extending** | Adds domain expertise loaded by sub-agents | Most `development/`, `security/`, `testing/` skills |
| **External** | Bridges external services beyond the built-in toolset | `mcp-ecosystem`, `github-pr-workflow`, `ai-visibility` |

> When composing workflows: load **Orchestrator** skills into the coordinating agent; load **Agent-Extending** skills into specialist sub-agents.

- [Delegate to Claude Code](skills/delegate-to-claude.md) — Deep reasoning, architecture, security
- [Delegate to Codex CLI](skills/delegate-to-codex.md) — Fast generation, boilerplate, multi-file
- [Parallel Agents](skills/parallel-agents.md) — Run multiple AIs simultaneously
- [Agent Review Chain](skills/agent-review-chain.md) — Multi-agent code review pipeline
- [Multi-AI Handoff](skills/multi-ai-handoff.md) — Standardized JSON handoff protocol between AI tools
- [Review Squad](skills/review-squad.md) — 5-specialist parallel PR review with synthesizer

## End-to-End Examples

- [Architecture Review](examples/architecture-review.md) — Claude Code reviews your architecture
- [Fast Implementation](examples/fast-implementation.md) — Codex rapidly implements CRUD APIs
- [Full Multi-AI Workflow](examples/full-workflow.md) — Plan → Design → Implement → Review → Ship
- [Code Review Team](examples/code-review-team.md) — 5-specialist parallel PR review with diff filtering
- [Migration Supervisor](examples/migration-supervisor.md) — SQL-tracked incremental migration with test gate/rollback

## Reference Projects

These open-source projects pioneered multi-agent orchestration patterns:

| Project | Stars | Relevance |
|---------|:-----:|-----------|
| [roam-code](https://github.com/mattpocock/roam-code) | 419⭐ | Multi-agent code navigation |
| [OpenSwarm](https://github.com/openswarm-ai/OpenSwarm) | 216⭐ | Agent swarm orchestration framework |
| [MCO](https://github.com/PierrunoYT/mco) | 198⭐ | Multi-Claude Orchestrator |
| [hcom](https://github.com/rinkaaan/hcom) | 144⭐ | Inter-agent communication protocol |
| [agent-council](https://github.com/cagostino/agent-council) | 115⭐ | Multi-agent council decision-making |
| [agentpipe](https://github.com/agentpipe/agentpipe) | 97⭐ | Unix-pipe-style agent chaining |

## System Status

> **Current Environment:**
> - Codex CLI: Latest stable (installed globally via `npm i -g @openai/codex`)
> - Claude Code: Available via `npx @anthropic-ai/claude-code`
> - Gemini CLI: Available via `npx @anthropic-ai/gemini-cli` or direct install
> - Copilot CLI: You're using it right now

## Quick Start

```powershell
# 1. Verify your tools are available
codex --version
npx @anthropic-ai/claude-code --version

# 2. Try the simplest orchestration (Pattern 1)
# From within a Copilot CLI session, delegate to Codex:
codex "Generate a TypeScript function that validates email addresses"

# 3. Try multi-agent review (see examples/full-workflow.md)
```

## Directory Structure

```
orchestration/
├── README.md                          # This file
├── patterns/
│   ├── shell-invocation.md            # Pattern 1: Direct CLI calls
│   ├── mcp-bridge.md                  # Pattern 2: MCP-based integration
│   ├── message-ipc.md                 # Pattern 3: Inter-process communication
│   ├── pipeline.md                    # Pattern 4: Unix-pipe chaining
│   ├── agent-council.md               # Pattern 5: Multi-agent council
│   ├── fan-out-parallel.md            # Pattern 6: Parallel subtask dispatch
│   ├── producer-reviewer.md           # Pattern 7: Iterative produce→review loop
│   ├── hierarchical-delegation.md     # Pattern 8: Nested orchestrators
│   ├── iterative-refinement.md        # Pattern 9: Self-correction loop
│   └── review-trio.md                 # Pattern 10: 3-way artifact review
├── configs/
│   ├── codex-mcp-bridge.json         # MCP config for Codex CLI
│   ├── claude-mcp-bridge.json        # MCP config for Claude Code
│   └── multi-agent.json              # Combined multi-agent config
├── skills/
│   ├── delegate-to-claude.md         # Delegation skill: Claude Code
│   ├── delegate-to-codex.md          # Delegation skill: Codex CLI
│   ├── parallel-agents.md            # Parallel agent execution
│   ├── agent-review-chain.md         # Multi-agent review pipeline
│   ├── multi-ai-handoff.md           # JSON handoff protocol
│   └── review-squad.md              # 5-specialist parallel review
└── examples/
    ├── architecture-review.md         # E2E: Architecture review with Claude
    ├── fast-implementation.md         # E2E: Rapid implementation with Codex
    ├── full-workflow.md               # E2E: Complete multi-AI workflow
    ├── code-review-team.md            # E2E: 5-specialist parallel PR review
    └── migration-supervisor.md        # E2E: Supervised incremental migration
└── templates/
    ├── orchestrator-template.md       # Reusable template for new orchestration skills
    └── agent-template.md              # Reusable template for specialist agent definitions
```
