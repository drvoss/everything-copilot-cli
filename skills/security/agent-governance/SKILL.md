---
name: agent-governance
description: >
  Use when designing or reviewing an AI agent system that needs policy-based access
  controls, intent classification, tool-level rate limiting, trust scoring for
  multi-agent workflows, or append-only audit trails.
metadata:
  category: security
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot agent-governance (MIT)
---

# Agent Governance

Add explicit policy, trust, and audit controls around agent behavior before "helpful"
automation becomes unbounded automation.

## When to Use

- Designing an agent that can call tools, APIs, databases, or shell commands
- Reviewing a multi-agent workflow that needs trust boundaries between specialists
- Defining when an action should be allowed, denied, or escalated for approval
- Adding audit requirements, rate limits, or policy configuration to an existing system

## When NOT to Use

| Instead of agent-governance | Use |
|-----------------------------|-----|
| Broad repository security scoring | `evaluate-repository` |
| OWASP ASI checklist review | `agent-owasp-check` |
| Architecture-first threat modeling | `threat-model-analyst` |

## Governance Model

Think in this order:

```text
User request -> intent classification -> policy check -> tool execution -> audit log
                  ↓                       ↓                ↓
             threat signals         allow/review/deny   trust update
```

A useful governance layer usually needs five parts:

1. **policy definition**
2. **intent classification**
3. **tool-level enforcement**
4. **trust scoring**
5. **append-only audit trail**

## Workflow

### 1. Define policy as configuration

Start with a serializable policy instead of hardcoding checks across business logic.

Include:

- `allowed_tools`
- `blocked_tools`
- `blocked_patterns`
- `max_calls_per_request`
- `require_human_approval`

Example shape:

```yaml
name: production-agent
allowed_tools:
  - search_documents
  - query_database
blocked_tools:
  - shell_exec
  - delete_record
blocked_patterns:
  - "(?i)(api[_-]?key|secret|password)\\s*[:=]"
max_calls_per_request: 25
require_human_approval:
  - send_email
```

Use "most restrictive wins" when composing org-wide, team, and agent-specific policies.

### 2. Classify intent before tool execution

Do not wait until after a tool runs to discover the request was dangerous.

Look for signals such as:

- data exfiltration intent
- privilege escalation requests
- destructive system modification
- prompt-injection phrasing

Keep the classifier simple and auditable first:

- pattern rules for obvious cases
- confidence scoring
- explicit review threshold for risky content

### 3. Enforce governance at the tool boundary

Every tool call should answer:

1. is this tool allowed?
2. does it require human approval?
3. has the request exceeded the call budget?
4. do the arguments contain blocked content?

Apply the checks at the boundary where the tool is actually invoked, not only in a
planner or prompt template.

### 4. Add trust scoring for delegated agents

Multi-agent systems need memory of which delegates are reliable.

Track at least:

- current trust score
- successes
- failures
- last updated time

Use trust thresholds to choose between:

- autonomous execution
- execution with human oversight
- denial or explicit re-approval

Trust should decay over time so stale reputation does not behave like permanent trust.

### 5. Keep an append-only audit trail

For every governed action, log:

- timestamp
- agent ID
- tool name
- action taken (`allowed`, `denied`, `error`, `review`)
- policy name
- supporting details such as duration, matched rule, or error

Export to JSONL or another append-only form that works with later incident review.

### 6. Choose an explicit governance level

| Level | Controls | Good fit |
|-------|----------|----------|
| **Open** | Audit only | internal experimentation |
| **Standard** | Allowlist + content filters | general production agents |
| **Strict** | Standard + approval on sensitive tools | regulated or customer-facing systems |
| **Locked** | Allowlist only + full audit + no dynamic tools | compliance-critical environments |

## Implementation Checklist

- [ ] Define policy in YAML or JSON rather than scattering checks through code
- [ ] Add intent classification before tool execution
- [ ] Enforce allow/deny/review decisions at the tool boundary
- [ ] Add rate limits or per-request call budgets
- [ ] Record trust scores for delegated agents
- [ ] Export an append-only audit trail
- [ ] Fail closed when governance checks error

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "We trust our agent because we wrote it." | Governance is about constraining runtime behavior, not trusting authorship. |
| "The model will probably avoid risky tools on its own." | Tool access without enforcement is a permission model with no guardrails. |
| "We log enough already." | Generic app logs rarely capture policy decisions, denials, or agent-to-agent trust changes. |

## Red Flags

- Agents can call any available tool by default
- No approval path exists for high-risk actions
- Rate limits are absent or unenforced
- Trust between agents is assumed rather than measured
- Audit logs can be edited or discarded after the fact

## Verification

- [ ] Policies can be read and changed without editing core business logic
- [ ] Dangerous intent is checked before tool execution
- [ ] High-risk tools require review or approval
- [ ] Multi-agent workflows have an explicit trust threshold
- [ ] Audit events are durable and append-only

## See Also

- [`agent-owasp-check`](../agent-owasp-check/SKILL.md) - audit an existing agent system against OWASP ASI risks
- [`threat-model-analyst`](../threat-model-analyst/SKILL.md) - model architecture and trust-boundary risks
- [`evaluate-repository`](../evaluate-repository/SKILL.md) - broader repository security and AI governance review
