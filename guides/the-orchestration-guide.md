---
name: the-orchestration-guide
description: Comprehensive guide to multi-AI orchestration using Copilot CLI as the meta-hub
category: guide
---

# The Orchestration Guide

> How to orchestrate multiple AI coding tools from GitHub Copilot CLI — the meta-hub for multi-AI development workflows.

---

## Introduction: Why Orchestrate Multiple AI Tools?

No single AI tool excels at everything. Claude has deep reasoning. Codex is fast at code generation. Gemini handles multimodal input. Copilot CLI ties directly into GitHub's ecosystem.

**Multi-AI orchestration** means using each tool for what it does best, coordinated from a single hub. Instead of switching between terminals, you direct all tools from one place.

The result: faster development, higher-quality code, and lower cost per task.

---

## The Meta-Hub Concept

Copilot CLI is the ideal orchestrator for multi-AI workflows. Here's why:

### Why Copilot CLI?

| Advantage | How It Helps |
|---|---|
| **GitHub Convergence** | Native access to Issues, PRs, Actions, code search via built-in MCP |
| **Background Agents** | Launch long-running tasks, check back later |
| **Session SQL Database** | Track multi-step workflows with structured data |
| **Fleet Mode** | Parallelize work across multiple agents |
| **20+ Built-in Models** | GPT-5, Claude Opus/Sonnet/Haiku, Gemini — switch instantly |
| **MCP Ecosystem** | Extend capabilities with any MCP server |
| **IDE Integration** | Switch between CLI and VS Code seamlessly |

### The Hub-and-Spoke Model

```
                    ┌─────────────┐
                    │  Copilot CLI │
                    │  (Meta-Hub)  │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴───┐ ┌─────┴─────┐
        │ Claude Code│ │ Codex │ │ Gemini CLI│
        │  (Analyze) │ │(Build)│ │ (Assess)  │
        └───────────┘ └───────┘ └───────────┘
```

Copilot CLI delegates tasks to specialized tools, collects results, and coordinates the workflow — all while maintaining context in its session database.

---

## Tool Strength Matrix

### Detailed Comparison

| Capability | Claude Code | Codex CLI | Gemini CLI | Copilot CLI |
|---|---|---|---|---|
| **Deep reasoning** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| **Code generation speed** | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| **Context window** | 200K tokens | 128K tokens | 1M+ tokens | Varies by model |
| **Architecture analysis** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| **Security analysis** | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| **Multimodal (images)** | ★★★☆☆ | ★☆☆☆☆ | ★★★★★ | ★★★☆☆ |
| **GitHub integration** | ★★☆☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★★★★ |
| **CI/CD awareness** | ★★☆☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★★★★ |
| **Cost efficiency** | Medium-High | Low-Medium | Low | Included with Copilot |
| **Parallel execution** | Limited | Sandboxed | Limited | Fleet mode ★★★★★ |

### When to Use Each Tool

| Tool | Best For |
|---|---|
| **Claude Code** | Architecture decisions, complex refactors, security audits, code review requiring deep analysis |
| **Codex CLI** | Fast implementation tasks, boilerplate generation, straightforward coding, OpenAI-ecosystem projects |
| **Gemini CLI** | Performance analysis, diagram interpretation, multimodal input, large context analysis |
| **Copilot CLI** | GitHub workflows, PR/Issue management, orchestration, IDE-integrated development, fleet operations |

---

## Pattern Overview

Copilot CLI supports five orchestration patterns, from simple to complex:

| # | Pattern | Complexity | Setup | Use Case |
|---|---|---|---|---|
| 1 | [Shell Invocation](../orchestration/patterns/shell-invocation.md) | Low | None | Quick delegation to another tool |
| 2 | [MCP Bridge](../orchestration/patterns/mcp-bridge.md) | Medium | Config file | Structured tool communication |
| 3 | [Message IPC](../orchestration/patterns/message-ipc.md) | Medium | File/pipe setup | Real-time inter-process coordination |
| 4 | [Pipeline](../orchestration/patterns/pipeline.md) | High | Script setup | Sequential multi-stage workflows |
| 5 | [Agent Council](../orchestration/patterns/agent-council.md) | High | Multi-tool setup | Multi-agent consensus and debate |

**Start with Pattern 1.** Graduate to higher patterns only when you need the extra capability.

---

## Getting Started

### Check Installed Tools

```powershell
# Check what's available on your system
copilot --version         # GitHub Copilot CLI
codex --version           # OpenAI Codex CLI
npx claude --version      # Anthropic Claude Code
gemini --version          # Google Gemini CLI
```

You don't need all of them — start with whichever tools you already have installed.

### Simplest Orchestration: Shell Invocation

From inside a Copilot CLI session, you can invoke any other tool directly:

```powershell
# Ask Claude to analyze architecture, capture the result
$analysis = npx claude --print "Analyze the architecture of src/ and identify coupling issues"

# Ask Codex to implement a fix based on the analysis
codex --quiet "Based on this analysis, decouple the user service: $analysis"
```

### From Copilot CLI (Natural Language)

You don't even need to remember the commands. Just ask:

```
> Use Claude Code to analyze the architecture of src/services/
> Then use Codex to implement the recommended changes
> Finally, review the changes with the code-review agent
```

Copilot CLI translates your intent into the appropriate shell commands and orchestration.

---

## Real-World Workflows

### Workflow 1: Full-Stack Feature Development

**Scenario**: Add a user notification system with email and in-app channels.

```
Step 1: Architecture (Claude — deep reasoning)
> Use Claude to design the notification system architecture.
> It should support email and in-app channels with a plugin pattern.

Step 2: Implementation (Codex — fast coding)
> Use Codex to implement the notification service based on this design:
> - NotificationService class with send(), queue(), retry()
> - EmailChannel and InAppChannel plugins
> - Database migration for notifications table

Step 3: Testing (Copilot CLI — GitHub-integrated)
> Write tests for the notification service using our existing Jest setup.
> Ensure >80% coverage on the new code.

Step 4: PR Creation (Copilot CLI — native GitHub)
> Create a PR with a description summarizing the notification system.
> Link it to issue #142.
```

### Workflow 2: Code Review Pipeline

Implement, review, and merge with multi-AI coverage:

```powershell
# Step 1: Implement the feature
# (Use Copilot CLI in Autopilot mode)

# Step 2: AI code review for logic
npx claude --print "Review these changes for logic errors and edge cases: $(git diff)"

# Step 3: Security review
# (Use Copilot CLI's code-review agent)
# > Review staged changes for security vulnerabilities

# Step 4: Create PR with all findings addressed
# > Create a PR and request human review from @senior-dev
```

### Workflow 3: Architecture Decision with Implementation

```powershell
# Phase 1: Get architectural recommendation from Claude
$recommendation = npx claude --print @"
Analyze our current codebase and recommend whether we should:
A) Refactor the monolithic API into microservices
B) Keep the monolith but add a service layer
C) Use a modular monolith pattern
Consider our team size (5 devs), deployment infrastructure (Kubernetes),
and current pain points (slow test suite, deployment coupling).
"@

# Phase 2: Discuss and refine in Copilot CLI
# > Based on Claude's recommendation, create an implementation plan
# > Break it into phases with estimated effort

# Phase 3: Implement with Codex (fast, parallel)
codex --quiet "Implement phase 1 of the modular monolith: extract user domain into its own module with clear boundaries"
```

---

## Cost Optimization

Use the right tool at the right price point for each task:

### Cost Tiers

| Tier | Tool / Model | Cost | Best For |
|---|---|---|---|
| **Free/Included** | Copilot CLI explore agent | $0 (included) | File search, codebase Q&A |
| **Cheap** | Claude Haiku, GPT-4.1 | $0.25-1/M tokens | Routine tasks, formatting, simple edits |
| **Standard** | Claude Sonnet, GPT-5.1-Codex | $3-15/M tokens | Feature implementation, code review |
| **Premium** | Claude Opus | $15-75/M tokens | Architecture, security audit, complex reasoning |

### Cost-Effective Strategy

```
# ❌ Expensive: Using Opus for everything
/model claude-opus-4.6
> Fix the typo in the README

# ✅ Smart: Match model to task
/model gpt-5-mini              # Typo fix — cheapest model
> Fix the typo in the README

/model claude-sonnet-4.6     # Feature work — balanced
> Implement the caching layer

/model claude-opus-4.6       # Architecture — worth the premium
> Design the event-driven migration strategy
```

### Orchestration Cost Example

A typical feature development workflow:

| Phase | Tool | Estimated Cost |
|---|---|---|
| Explore codebase | Copilot explore agent | $0 |
| Design architecture | Claude Opus (1 call) | ~$0.50 |
| Implement feature | Codex CLI (5 calls) | ~$0.30 |
| Write tests | Copilot CLI Sonnet | ~$0.20 |
| Code review | Copilot code-review | ~$0.10 |
| Create PR | Copilot GitHub MCP | $0 |
| **Total** | | **~$1.10** |

---

## Orchestration Skills

Pre-built orchestration skills are available in the repository:

| Skill | Path | What It Does |
|---|---|---|
| Parallel Agents | [orchestration/skills/parallel-agents.md](../orchestration/skills/parallel-agents.md) | Run multiple agents simultaneously |
| Delegate to Codex | [orchestration/skills/delegate-to-codex.md](../orchestration/skills/delegate-to-codex.md) | Send implementation tasks to Codex CLI |
| Delegate to Claude | [orchestration/skills/delegate-to-claude.md](../orchestration/skills/delegate-to-claude.md) | Send analysis tasks to Claude Code |
| Agent Review Chain | [orchestration/skills/agent-review-chain.md](../orchestration/skills/agent-review-chain.md) | Sequential multi-agent code review |

### Using Orchestration Skills

Reference these skills in your Copilot CLI sessions:

```
> Use the delegate-to-claude skill to get an architecture review
> Then use delegate-to-codex to implement the recommended changes
> Finally, run the agent-review-chain for quality checks
```

---

## Ecosystem References

The multi-AI orchestration ecosystem is growing. Notable projects and tools:

| Project | What It Does |
|---|---|
| **MCO** | Multi-Claude Orchestration — parallel Claude instances |
| **hcom** | Human-Computer Orchestration Manager |
| **roam-code** | Roaming AI code agents across repositories |
| **agentpipe** | Unix-style piping between AI agents |
| **CoPal** | Cooperative AI pair programming |
| **OpenSwarm** | Open-source agent swarm framework |

### Integrating with Copilot CLI

Any tool that reads stdin/stdout or exposes an MCP server can be orchestrated from Copilot CLI:

```powershell
# Unix pipe style
Get-Content src\api.ts | codex --quiet "Add error handling" | Set-Content src\api-improved.ts

# MCP integration
# Add any MCP server to .vscode/mcp.json and it becomes available in Copilot CLI

# Custom scripts
# Write orchestration scripts in scripts/ and invoke them from Copilot CLI
```

---

## Advanced: Session Database for Orchestration

Use Copilot CLI's built-in SQL database to track multi-AI workflows:

```sql
-- Track which tool handles which task
CREATE TABLE orchestration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool TEXT NOT NULL,           -- 'claude', 'codex', 'copilot', 'gemini'
    task TEXT NOT NULL,           -- What was delegated
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'done', 'failed'
    result TEXT,                  -- Output summary
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Log each delegation
INSERT INTO orchestration_log (tool, task) VALUES
  ('claude', 'Architecture review of auth module'),
  ('codex', 'Implement JWT refresh token rotation'),
  ('copilot', 'Create PR and link to issue #89');

-- Check progress
SELECT tool, task, status FROM orchestration_log WHERE status != 'done';
```

---

## Orchestration Examples

Complete worked examples are available in the repository:

| Example | Path | Scenario |
|---|---|---|
| Full Workflow | [orchestration/examples/full-workflow.md](../orchestration/examples/full-workflow.md) | End-to-end feature with multi-AI |
| Fast Implementation | [orchestration/examples/fast-implementation.md](../orchestration/examples/fast-implementation.md) | Speed-focused with Codex delegation |
| Architecture Review | [orchestration/examples/architecture-review.md](../orchestration/examples/architecture-review.md) | Deep analysis with Claude delegation |

---

## Future Vision

Multi-AI orchestration is evolving rapidly. Here's where it's heading:

### Near-Term (Now)
- Shell invocation and MCP bridges work today
- Manual orchestration via Copilot CLI natural language
- Session database tracks workflow state

### Mid-Term (6-12 months)
- Standardized MCP protocols between AI tools
- Automated tool selection based on task characteristics
- Shared context windows between orchestrated tools
- Cost-aware automatic routing

### Long-Term (1-2 years)
- Fully autonomous multi-AI pipelines
- AI tools that negotiate and specialize dynamically
- Unified billing and cost optimization across providers
- Enterprise-grade audit trails for multi-AI workflows

### Copilot CLI's Position

GitHub Copilot CLI is uniquely positioned as the orchestration hub because:

1. **GitHub is where code lives** — PRs, Issues, Actions, code search are native
2. **Model-agnostic** — 20+ models from multiple providers, more coming
3. **MCP-native** — The protocol for AI tool interoperability is built in
4. **Enterprise-ready** — Authentication, permissions, audit trails from day one
5. **IDE-bridged** — Seamless transition between terminal and VS Code

---

## Quick Reference

### Start Orchestrating in 3 Steps

```powershell
# 1. Check your tools
copilot --version && codex --version && npx claude --version

# 2. Start a Copilot CLI session in your project
cd C:\your-project
copilot

# 3. Ask Copilot CLI to orchestrate
> Analyze the codebase with Claude, implement improvements with Codex,
> and create a PR with the results
```

### Choosing the Right Pattern

```
Do you need to delegate a single task?
  → Pattern 1: Shell Invocation

Do you need structured communication with another tool?
  → Pattern 2: MCP Bridge

Do you need real-time coordination between tools?
  → Pattern 3: Message IPC

Do you need a multi-stage sequential workflow?
  → Pattern 4: Pipeline

Do you need multiple AI tools to debate or reach consensus?
  → Pattern 5: Agent Council
```

---

> ★ **Start simple.** Shell invocation (Pattern 1) handles 80% of orchestration needs. Graduate to more complex patterns only when you hit their limits. The best orchestration is the simplest one that solves your problem.
