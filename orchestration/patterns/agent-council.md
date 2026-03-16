# Pattern 5: Agent Council

> **Complexity: High** | **Setup: Multi-agent config** | **Best for: Complex tasks needing multiple expert perspectives**

The Agent Council is the most sophisticated orchestration pattern. A dispatcher routes tasks to specialist AI agents based on their strengths, collects their responses, and resolves conflicts to produce the best possible output.

## How It Works

```
                         ┌──────────────────────┐
                         │    Copilot CLI        │
                         │    (Dispatcher)       │
                         │                      │
                         │  • Route tasks        │
                         │  • Aggregate results  │
                         │  • Resolve conflicts  │
                         │  • Ship to GitHub     │
                         └──────────┬───────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
    ┌──────────▼──────────┐ ┌──────▼──────────┐ ┌──────▼──────────┐
    │    Claude Code       │ │   Codex CLI      │ │   Gemini CLI    │
    │    (Architect)       │ │   (Builder)      │ │   (Analyst)     │
    │                      │ │                  │ │                 │
    │  • Architecture      │ │  • Fast code gen │ │  • Multimodal   │
    │  • Security review   │ │  • Boilerplate   │ │  • Performance  │
    │  • Deep reasoning    │ │  • Multi-file    │ │  • Large context│
    │  • 200K context      │ │  • GPT-5 speed   │ │  • Diagrams     │
    └─────────────────────┘ └──────────────────┘ └─────────────────┘
```

## Agent Specializations

### Claude Code — The Architect

**Strengths:** Deep reasoning, 200K token context, architecture design, security analysis

```powershell
# Best for: Architecture decisions
npx @anthropic-ai/claude-code --print `
  "You are a senior software architect. Review the system design in src/ and:
   1. Identify architectural anti-patterns
   2. Suggest improvements for scalability
   3. Evaluate separation of concerns
   4. Check for security vulnerabilities
   Provide specific file references and code examples."
```

**Route to Claude when:**
- Task requires understanding the full codebase (200K context)
- Architecture or design decisions needed
- Security audit or threat modeling
- Complex refactoring that requires reasoning about side effects
- Code review requiring deep understanding of business logic

### Codex CLI — The Builder

**Strengths:** GPT-5 speed, fast code generation, multi-file implementations, boilerplate

```powershell
# Best for: Rapid implementation
codex --quiet --approval-mode full-auto `
  "Implement a complete CRUD API for the User model:
   - GET/POST/PUT/DELETE endpoints
   - Input validation with Zod
   - Error handling middleware
   - TypeScript types
   Create all necessary files in src/routes/users/"
```

**Route to Codex when:**
- Need fast code generation (speed is priority)
- Boilerplate or repetitive code patterns
- Implementing well-defined specifications
- Multi-file scaffolding
- Applying well-known patterns (CRUD, auth, etc.)

### Gemini CLI — The Analyst

**Strengths:** Multimodal analysis, performance profiling, diagram understanding, large context

```powershell
# Best for: Performance and multimodal analysis
gemini --prompt `
  "Analyze the performance characteristics of the database queries in src/db/.
   1. Identify N+1 query patterns
   2. Suggest index optimizations
   3. Estimate query complexity (Big O)
   4. Recommend caching strategies"
```

**Route to Gemini when:**
- Analyzing images, diagrams, or screenshots
- Performance profiling and optimization
- Processing very large codebases
- Comparing visual designs or UI screenshots
- Data analysis and pattern recognition

### Copilot CLI — The Integrator

**Strengths:** GitHub-native, PR/Issue management, Actions, MCP ecosystem

```powershell
# Best for: GitHub operations
# Copilot CLI handles all GitHub integration natively:
# - Creating PRs with context
# - Managing Issues
# - Running and monitoring Actions
# - Code review coordination
```

**Route to Copilot when:**
- Creating/updating Pull Requests
- Managing GitHub Issues
- Triggering and monitoring CI/CD
- Searching across repositories
- Coordinating the overall workflow

## Dispatcher Logic

The dispatcher routes tasks based on type, complexity, and required capabilities:

```python
#!/usr/bin/env python3
"""Agent Council Dispatcher — routes tasks to specialist AI agents."""
import json
import subprocess
import asyncio
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Agent(Enum):
    CLAUDE = "claude"
    CODEX = "codex"
    GEMINI = "gemini"
    COPILOT = "copilot"


class TaskType(Enum):
    ARCHITECTURE = "architecture"
    IMPLEMENTATION = "implementation"
    REVIEW = "review"
    PERFORMANCE = "performance"
    SECURITY = "security"
    DOCUMENTATION = "documentation"
    GITHUB_OPS = "github_ops"
    MULTIMODAL = "multimodal"


# Routing table: task type → primary agent + fallback
ROUTING_TABLE = {
    TaskType.ARCHITECTURE:    (Agent.CLAUDE, Agent.GEMINI),
    TaskType.IMPLEMENTATION:  (Agent.CODEX, Agent.CLAUDE),
    TaskType.REVIEW:          (Agent.CLAUDE, Agent.GEMINI),
    TaskType.PERFORMANCE:     (Agent.GEMINI, Agent.CLAUDE),
    TaskType.SECURITY:        (Agent.CLAUDE, Agent.CODEX),
    TaskType.DOCUMENTATION:   (Agent.CODEX, Agent.CLAUDE),
    TaskType.GITHUB_OPS:      (Agent.COPILOT, Agent.CODEX),
    TaskType.MULTIMODAL:      (Agent.GEMINI, Agent.CLAUDE),
}


@dataclass
class TaskResult:
    agent: Agent
    success: bool
    output: str
    confidence: float  # 0.0 - 1.0


@dataclass
class CouncilDecision:
    results: list[TaskResult]
    consensus: Optional[str]
    conflicts: list[str]
    final_output: str


async def dispatch(task_type: TaskType, prompt: str) -> TaskResult:
    """Route a task to the best agent."""
    primary, fallback = ROUTING_TABLE[task_type]

    result = await _invoke_agent(primary, prompt)
    if result.success:
        return result

    print(f"⚠️  {primary.value} failed, falling back to {fallback.value}")
    return await _invoke_agent(fallback, prompt)


async def council_vote(prompt: str, agents: list[Agent] = None) -> CouncilDecision:
    """Get input from multiple agents and resolve conflicts."""
    if agents is None:
        agents = [Agent.CLAUDE, Agent.CODEX, Agent.GEMINI]

    # Run all agents in parallel
    tasks = [_invoke_agent(agent, prompt) for agent in agents]
    results = await asyncio.gather(*tasks)

    # Analyze results for consensus
    conflicts = _find_conflicts(results)

    if not conflicts:
        # All agents agree — use the highest-confidence result
        best = max(results, key=lambda r: r.confidence)
        return CouncilDecision(
            results=results,
            consensus="unanimous",
            conflicts=[],
            final_output=best.output
        )

    # Conflicts exist — use Claude (strongest reasoner) to resolve
    resolution_prompt = f"""Multiple AI agents were asked: {prompt}

Their responses:
{chr(10).join(f"[{r.agent.value}]: {r.output[:500]}" for r in results)}

Conflicts found: {json.dumps(conflicts)}

Analyze the conflicting responses and provide the best synthesized answer,
explaining why you chose specific elements from each response."""

    resolution = await _invoke_agent(Agent.CLAUDE, resolution_prompt)

    return CouncilDecision(
        results=results,
        consensus="resolved" if resolution.success else "unresolved",
        conflicts=conflicts,
        final_output=resolution.output
    )


async def _invoke_agent(agent: Agent, prompt: str) -> TaskResult:
    """Invoke a specific AI agent."""
    commands = {
        Agent.CLAUDE: ["npx", "@anthropic-ai/claude-code", "--print", prompt],
        Agent.CODEX: ["codex", "--quiet", prompt],
        Agent.GEMINI: ["gemini", "--prompt", prompt],
        Agent.COPILOT: ["gh", "copilot", "suggest", prompt],
    }

    cmd = commands[agent]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=180)

        return TaskResult(
            agent=agent,
            success=proc.returncode == 0,
            output=stdout.decode(),
            confidence=0.8 if proc.returncode == 0 else 0.0
        )
    except Exception as e:
        return TaskResult(
            agent=agent,
            success=False,
            output=f"Error: {e}",
            confidence=0.0
        )


def _find_conflicts(results: list[TaskResult]) -> list[str]:
    """Detect conflicts between agent responses."""
    conflicts = []
    successful = [r for r in results if r.success]

    if len(successful) < 2:
        return conflicts

    # Simple heuristic: check if responses are substantially different
    for i, r1 in enumerate(successful):
        for r2 in successful[i+1:]:
            # Compare key recommendations
            if _responses_conflict(r1.output, r2.output):
                conflicts.append(
                    f"{r1.agent.value} vs {r2.agent.value}: different recommendations"
                )

    return conflicts


def _responses_conflict(a: str, b: str) -> bool:
    """Heuristic to detect conflicting responses."""
    # Simplified — production version would use semantic comparison
    contradiction_pairs = [
        ("should", "should not"),
        ("recommend", "avoid"),
        ("approved", "rejected"),
        ("safe", "vulnerable"),
    ]
    for pos, neg in contradiction_pairs:
        if (pos in a.lower() and neg in b.lower()) or (neg in a.lower() and pos in b.lower()):
            return True
    return False
```

## Council Strategies

### Strategy 1: Best-of-N (Speed)

Ask all agents, pick the fastest successful response.

```powershell
# Race three agents — use whoever finishes first
$claude = Start-Job { npx @anthropic-ai/claude-code --print "Explain the auth flow" }
$codex = Start-Job { codex --quiet "Explain the auth flow" }
$gemini = Start-Job { gemini --prompt "Explain the auth flow" }

$winner = @($claude, $codex, $gemini) | Wait-Job -Any
$result = $winner | Receive-Job
Write-Output "Winner: $($winner.Name)`n$result"

@($claude, $codex, $gemini) | Stop-Job
```

### Strategy 2: Consensus (Quality)

Ask all agents, resolve conflicts, synthesize the best answer.

```powershell
# Get all perspectives, then synthesize
$claude_result = npx @anthropic-ai/claude-code --print "Review src/auth/ for security issues"
$codex_result = codex --quiet "Review src/auth/ for security issues"
$gemini_result = gemini --prompt "Review src/auth/ for security issues"

# Use Claude to synthesize (strongest reasoner)
$synthesis = npx @anthropic-ai/claude-code --print @"
Three AI agents reviewed the auth module. Synthesize their findings:

Claude's review: $claude_result
Codex's review: $codex_result
Gemini's review: $gemini_result

Combine all valid findings, resolve any contradictions, and provide 
a unified security review with prioritized recommendations.
"@

Write-Output $synthesis
```

### Strategy 3: Specialist Routing (Efficiency)

Route each subtask to the best agent.

```powershell
# Break a feature request into specialist tasks
# Architecture → Claude
$design = npx @anthropic-ai/claude-code --print `
  "Design the architecture for a real-time notification system"

# Implementation → Codex
$code = codex --quiet `
  "Implement this notification system design: $design"

# Performance review → Gemini
$perf = gemini --prompt `
  "Review this notification system for performance bottlenecks: $code"

# Ship → Copilot (native GitHub integration)
# Copilot CLI creates the PR with all context
```

## Conflict Resolution

When agents disagree, use these resolution strategies:

| Strategy | When to Use | Method |
|----------|-------------|--------|
| **Majority Vote** | 3+ agents, factual questions | Pick the most common answer |
| **Expert Authority** | Domain-specific conflicts | Trust the specialist (Claude for security, Gemini for perf) |
| **Synthesis** | Complementary perspectives | Combine non-conflicting parts from each |
| **Escalation** | Critical decisions | Present all perspectives to the human |

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Best possible output quality | ❌ Complex setup and orchestration |
| ✅ Catches issues single agents miss | ❌ Higher API costs (multiple agents) |
| ✅ Built-in redundancy/fallback | ❌ Longer total execution time |
| ✅ Leverages each agent's strengths | ❌ Conflict resolution adds complexity |
| ✅ More robust than single-agent | ❌ Requires understanding of agent strengths |

## When to Use

- **Critical code changes** — security-sensitive, production-affecting code
- **Architecture decisions** — need multiple perspectives before committing
- **Complex features** — multiple concerns (security, performance, UX) need expert review
- **High-stakes reviews** — compliance, regulatory, or safety-critical code

## Reference Projects

| Project | Stars | Description |
|---------|:-----:|-------------|
| [agent-council](https://github.com/cagostino/agent-council) | 115⭐ | Multi-agent council framework |
| [OpenSwarm](https://github.com/openswarm-ai/OpenSwarm) | 216⭐ | Agent swarm orchestration |
| [MCO](https://github.com/PierrunoYT/mco) | 198⭐ | Multi-Claude Orchestrator |

## See Also

- [Pattern 4: Pipeline](pipeline.md) — Simpler sequential orchestration
- [Parallel Agents](../skills/parallel-agents.md) — Running agents simultaneously
- [Full Workflow Example](../examples/full-workflow.md) — Agent council in action
- [Multi-Agent Config](../configs/multi-agent.json) — Configuration file
