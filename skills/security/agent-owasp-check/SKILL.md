---
name: agent-owasp-check
description: Use when auditing an AI agent system against the OWASP Agentic Security Initiative Top 10 — checks tool access, prompt boundaries, memory handling, and operational safeguards across the agent pipeline.
metadata:
  category: security
  agent_type: general-purpose
---

# Agent OWASP Check

Audit an AI agent system against the OWASP Agentic Security Initiative (ASI) Top 10.
Use this when you need a focused agent-security workflow rather than a broad repository
scorecard.

## When to Use

- Reviewing a repository that exposes agent, MCP, or LLM execution paths
- Before deploying a new multi-agent workflow or tool-using assistant
- When onboarding a new MCP server, tool layer, or prompt orchestration pattern
- During a security review of an AI-powered product feature

## When NOT to Use

| Instead of agent-owasp-check | Use |
|------------------------------|-----|
| General repository security scoring | `evaluate-repository` |
| Ordinary web-app auth or injection review | `security-scan` or `pr-security-review` |
| Prompt-quality regression testing | `eval-harness` |

## Prerequisites

- The repository actually contains agent, MCP, or LLM behavior to inspect
- You can search source, config, and workflow files
- You know which runtime boundaries matter: prompts, tools, memory, logs, or external fetches

## Workflow

### 1. Confirm the agent surface exists

```powershell
git ls-files | Where-Object { $_ -match 'agent|llm|mcp|openai|anthropic|claude|langchain|gpt|gemini|codex|vertex|bedrock|ollama|litellm' }
```

If nothing relevant is present, stop and use a broader repository audit instead.

### 2. Check each ASI risk

#### ASI-01: Unbounded Resource Consumption

```powershell
git --no-pager grep -n "maxTokens\|max_tokens\|timeout\|rate_limit\|maxRetries" -- "*.ts" "*.js" "*.py" "*.json"
```

**Pass**: Agent runs have explicit limits for time, retries, tokens, or tool calls.  
**Fail**: The agent can loop or consume resources without a clear bound.

#### ASI-02: Privilege Escalation

```powershell
git --no-pager grep -n "allowedTools\|toolWhitelist\|allowlist\|permissions" -- "*.ts" "*.js" "*.py" "*.json"
```

**Pass**: Tool access is scoped to the task or role.  
**Fail**: The agent can invoke any available tool or cross trust boundaries freely.

#### ASI-02-B: Tool Usage Policy Enforcement

```powershell
git --no-pager grep -n "rate_limit\|approval\|require_approval\|tool_policy\|UsagePolicy" -- "*.ts" "*.js" "*.py" "*.json" "*.yaml" "*.yml"
```

**Pass**: Tool calls have rate limits and high-risk tools require explicit approval or review gates.  
**Fail**: Tools can be called indefinitely or without any approval boundary for sensitive operations.

#### ASI-03: Memory Injection

```powershell
git --no-pager grep -n "UNTRUSTED\|sanitize\|escape\|external content" -- "*.md" "*.ts" "*.js" "*.py"
```

**Pass**: Untrusted external content is clearly isolated before it reaches prompts or memory.  
**Fail**: Fetched or user-supplied content flows directly into agent instructions.

#### ASI-04: Tool Poisoning

```powershell
git ls-files | Where-Object { $_ -match 'mcp|tool' }
git --no-pager grep -n "\"name\"\|toolName\|tool_name" -- "*.json" "*.ts" "*.js"
```

**Pass**: MCP servers and tool names are intentional, reviewed, and not easily spoofed.  
**Fail**: Tool registration accepts arbitrary or confusing names without validation.

#### ASI-05: Prompt Injection

```powershell
git --no-pager grep -n "system.*user\|template.*input\|prompt.*input" -- "*.ts" "*.js" "*.py"
```

**Pass**: User input stays separated from system-level instructions.  
**Fail**: User content is concatenated into privileged prompt layers.

#### ASI-06: Data Exfiltration

```powershell
git --no-pager grep -n "console\.log\|logger\|print" -- "*.ts" "*.js" "*.py" | Select-String "token|secret|key|password"
```

**Pass**: Sensitive data is redacted or blocked before logging or agent output.  
**Fail**: Secrets or raw tool results can leak through logs or responses.

#### ASI-07: Adversarial Input Resilience

```powershell
git ls-files | Where-Object { $_ -match 'eval|test|prompt' }
git --no-pager grep -n "adversarial\|injection\|jailbreak" -- "*.md" "*.json" "*.yaml" "*.yml"
```

**Pass**: The project includes adversarial or injection-oriented eval coverage.  
**Fail**: No evidence exists that hostile inputs are tested.

#### ASI-08: Cascading Failure

```powershell
git --no-pager grep -n "circuit\|loop detect\|fallback\|retry" -- "*.md" "*.ts" "*.js" "*.py"
```

**Pass**: Sub-agent failures are isolated with fallback, breaker, or stop conditions.  
**Fail**: One failing agent can take down the whole workflow unchecked.

#### ASI-09: Trust Boundary Violation

```powershell
git --no-pager grep -n "trust\|verify_sender\|source_agent\|agent_id" -- "*.ts" "*.js" "*.py" "*.md"
```

**Pass**: Cross-agent messages or delegated actions carry explicit trust assumptions.  
**Fail**: Peer agents can direct privileged actions without verification.

#### ASI-10: Unmonitored Autonomy

```powershell
git --no-pager grep -n "audit\|tool log\|event store\|activity log" -- "*.ts" "*.js" "*.py" "*.md"
```

**Pass**: Tool calls and key agent actions are observable after the fact.  
**Fail**: There is no durable record of what the agent did.

### 3. Summarize findings

```text
╔══════════════╦═══════╦══════════════════════════════════════════════╗
║ Risk         ║ Score ║ Finding                                      ║
╠══════════════╬═══════╬══════════════════════════════════════════════╣
║ ASI-01       ║  ?/10 ║                                              ║
║ ASI-02       ║  ?/10 ║                                              ║
║ ASI-03       ║  ?/10 ║                                              ║
║ ASI-04       ║  ?/10 ║                                              ║
║ ASI-05       ║  ?/10 ║                                              ║
║ ASI-06       ║  ?/10 ║                                              ║
║ ASI-07       ║  ?/10 ║                                              ║
║ ASI-08       ║  ?/10 ║                                              ║
║ ASI-09       ║  ?/10 ║                                              ║
║ ASI-10       ║  ?/10 ║                                              ║
╠══════════════╬═══════╬══════════════════════════════════════════════╣
║ OVERALL      ║  ?/10 ║                                              ║
╚══════════════╩═══════╩══════════════════════════════════════════════╝
```

Block deployment if ASI-01, ASI-03, or ASI-05 lands at 3/10 or below.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Our agent only uses safe tools" | Safety comes from explicit scope control, not tool names alone. |
| "This is just prompt logic, not security" | Prompt boundaries, memory handling, and tool access are part of the security surface. |
| "We can add logging later" | Missing audit trails make incident response guesswork. |

## Red Flags

- Arbitrary tool execution with no allowlist
- Untrusted external content flows straight into prompts
- No timeout, retry cap, or stop condition on agent runs
- No evidence of adversarial testing

## Verification

- [ ] The repository actually exposes an agent or LLM surface
- [ ] Each relevant ASI risk was checked with repo-specific evidence
- [ ] Findings identify concrete files, configs, or workflow gaps
- [ ] Any critical ASI-01, ASI-03, or ASI-05 finding is called out as release-blocking

## Tips

- Pair this with `evaluate-repository` when you need both a broad repo scorecard and a focused agent-security pass
- Pair this with `eval-harness` when ASI-07 needs adversarial test coverage rather than static inspection
- Use `sub-agent-sandboxing` patterns as concrete mitigations for ASI-08 findings
- Look for tool usage policies that enforce rate limits or approvals, not just allowlists

## See Also

- [`evaluate-repository`](../evaluate-repository/SKILL.md) — broad repository scorecard with an AI governance dimension
- [`security-scan`](../security-scan/SKILL.md) — general codebase security review
- [`eval-harness`](../../testing/eval-harness/SKILL.md) — adversarial and regression eval design
- [`agent-governance`](../agent-governance/SKILL.md) — tool allowlists, approval gates, trust scoring, and audit trails
- [`sub-agent-sandboxing`](../../../orchestration/patterns/sub-agent-sandboxing.md) — loop detection and circuit breaker patterns
