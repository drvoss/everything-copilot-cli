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
- `profile`
- `tool_policies`

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
profile: balanced
require_human_approval:
  - send_email
tool_policies:
  shell_exec:
    rate_limit: 3/hour
    approval: required
    justification: ticket-or-incident
  query_database:
    rate_limit: 30/request
    approval: not-required
```

Use "most restrictive wins" when composing org-wide, team, and agent-specific policies.
Policy timing is part of enforcement: apply a skill's tool restriction when that skill is
activated, not merely when its declaration is discovered.
When a system supports a `ToolPolicy` schema, keep rate-limit, approval, and
justification guards in that policy layer instead of scattering them across
prompts, docs, and handler code.

If the policy file is missing, unreadable, or fails validation, fail closed:
apply the strict profile and stop instead of falling through to a more permissive default.

Close policy paths where "nothing was checked" can be mistaken for "policy passed":

- Treat a missing required value and an absent constraint as different states. Avoid truthy chains
  that let an empty string bypass the check; use explicit presence tests.
- Reject a rule with an empty match set when emptiness would otherwise match everything and silence
  an escalation backstop.
- Reject supervisor or delegate registration above the deterministic trust root. Delegated
  authority cannot exceed its root.

### 1-A. Keep dynamic conditions in policy, not prompts

When your policy layer supports dynamic conditions, keep them declarative and
reviewable instead of burying them in agent instructions.

- **Time-based**: apply stricter profiles outside business hours, during weekends, or in incident mode
- **Cost-aware**: tighten tool access or require review when token or API spend crosses a defined threshold
- **Trust-gated registration**: require signed registration or proof-of-outcome evidence before a new agent or delegate is treated as trusted

Evaluate these conditions at the same enforcement boundary as your normal
allow/deny/review checks. If the condition inputs are missing, stale, or
unverifiable, fail closed instead of silently falling back to a permissive tier.

### 2. Classify intent before tool execution

Do not wait until after a tool runs to discover the request was dangerous.
Blocking a result prevents propagation; it does not undo an already executed side effect. Treat
post-execution interception as observation, not rollback, and gate irreversible operations first.
Reserve budget before evaluation, then charge actual usage after execution, so concurrency cannot
cross a limit before accounting notices.

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

### 3-A. Scan untrusted fetched content before use

Treat external fetch results as an input boundary, not as pre-trusted working context.

Before using fetched content to guide tool calls, memory updates, or code changes, check for:

- tool-poisoning instructions hidden in docs, READMEs, or generated artifacts
- data-exfiltration phrasing such as "print secrets", "dump config", or "send environment"
- attempts to override local policy, approval rules, or task scope

At minimum:

1. classify whether the source is maintainer-controlled or untrusted
2. inspect the fetched content for dangerous instructions before acting on it
3. require review when the fetched content would trigger shell, persistence, or credential-adjacent work

In strict mode, do not execute downstream actions from untrusted fetched content until this scan is complete.

### 3-B. Review wildcard permission scope, not just intent

Be careful with wildcard or glob-style permission rules in tool-approval systems such as
`--allow-tool` patterns. A rule that looks narrowly intended on paper can still auto-approve a
broader real scope than the author meant — for example, `write(dir/**)` may match deeply nested
writes well beyond the reviewer's mental boundary.

When reviewing permission rules:

1. check the actual match scope of every wildcard pattern
2. prefer exact paths when the writable surface is supposed to stay small
3. treat "looks right" as insufficient until the concrete expansion is understood

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

### 4-A. Harden trust boundaries explicitly

If remote identities, signed delegates, or service-issued agent credentials affect
authorization, define the trust boundary before enabling autonomy:

- which issuers are trusted
- where keys come from (for example, JWKS or another signed metadata source)
- how revocation or key rotation is handled
- which agent roles are allowed to cross each boundary

Do not let planner, worker, verifier, and synthesizer roles silently share one
flat trust zone when their permissions differ.

### 5. Keep an append-only audit trail

For every governed action, log:

- timestamp
- agent ID
- tool name
- action taken (`allowed`, `denied`, `error`, `review`)
- policy name
- supporting details such as duration, matched rule, or error

Export to JSONL or another append-only form that works with later incident review.

### 6. Choose an explicit policy profile

| Profile | Controls | Good fit |
|---------|----------|----------|
| **Advisory** | Detect and warn on risky patterns, but do not block by default | internal experimentation or supervised migrations |
| **Balanced** | Auto-allow known low-risk tools, require review for new tools and risky writes/fetches | general production agents |
| **Strict** | Fail closed on policy errors, require fetched-content scanning before action, inspect shell output, and block unapproved high-risk actions | regulated, customer-facing, or high-trust environments |

If your organization already uses broader maturity labels such as open or locked, map them onto these profiles explicitly instead of assuming the names are equivalent.

### 7. Reference the right specification layer

As systems mature, separate the governance contract into a few explicit layers:

- identity and key-discovery rules
- trust-boundary and delegation rules
- MCP or tool transport security assumptions
- audit sink and retention behavior
- SRE and incident response ownership
- external compliance mappings such as EU AI Act obligations when they matter

This keeps tool policy, identity, trust, and audit requirements reviewable instead
of burying them in one prose blob.

## Implementation Checklist

- [ ] Define policy in YAML or JSON rather than scattering checks through code
- [ ] Add intent classification before tool execution
- [ ] Enforce allow/deny/review decisions at the tool boundary
- [ ] Tool policies capture rate limits, approvals, and justification requirements explicitly
- [ ] Add rate limits or per-request call budgets
- [ ] Choose and document an explicit advisory / balanced / strict profile
- [ ] Dynamic conditions such as time windows or spend thresholds stay in policy, not prompt text
- [ ] Record trust scores for delegated agents
- [ ] Remote trust boundaries document issuer, key discovery, and revocation behavior
- [ ] Untrusted fetched content is scanned before it can steer tool use or persistence
- [ ] Export an append-only audit trail
- [ ] Fail closed when governance checks error
- [ ] Empty values and empty match sets cannot turn skipped checks into successful checks
- [ ] Delegated authority cannot register above the deterministic trust root

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
- A policy reports success even though an empty value or match set caused it to inspect nothing

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
