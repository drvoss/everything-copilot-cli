---
name: threat-model-analyst
description: >
  Use when a repository, system, or major change needs a structured STRIDE-A threat
  model — map architecture, data flows, trust boundaries, abuse cases, and prioritized
  findings, or update an existing model with a change-focused diff.
metadata:
  category: security
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot threat-model-analyst (MIT)
---

# Threat Model Analyst

Perform architecture-first security analysis using **STRIDE-A**: classic STRIDE plus
explicit abuse-case thinking.

## When to Use

- A new system or subsystem needs an initial threat model
- A major change landed and the question is "what changed security-wise?"
- You need to reason about trust boundaries, data flows, or risky integrations before implementation
- A security review needs architecture evidence, not only code-pattern scanning

## When NOT to Use

| Instead of threat-model-analyst | Use |
|---------------------------------|-----|
| Code-level vulnerability scanning | `security-scan` or `pr-security-review` |
| Broad repository posture scoring | `evaluate-repository` |
| Agent-specific OWASP checklist review | `agent-owasp-check` |
| Supply-chain integrity validation | `agent-supply-chain` |

## Modes

### Single Analysis

Use when there is no prior threat model or when the whole system needs review.

### Incremental Analysis

Use when a previous threat model exists and you need to compare the current system or a
specific commit against that baseline.

Incremental mode is often the better day-to-day workflow because it highlights:

- new threats
- resolved threats
- still-present threats
- trust-boundary changes
- differences in severity or exploitability

## Workflow

### 1. Define scope and assets

Clarify:

- what system or subsystem is in scope
- what assets matter most
- what actors exist
- what trust boundaries separate them

List obvious inputs and high-value outcomes before reading code in detail.

### 2. Build an architecture and data-flow sketch

You do not need perfect diagrams before analysis, but you do need a concrete model of:

- components
- entry points
- data stores
- external systems
- privileged execution zones
- trust boundaries between them

Represent the system as a lightweight DFD or component map if helpful.

### 3. Apply STRIDE-A to each component and flow

For each component or trust boundary, ask:

| Dimension | Question |
|-----------|----------|
| **Spoofing** | Who could impersonate a user, service, or agent? |
| **Tampering** | What data or configuration could be modified without detection? |
| **Repudiation** | What actions would be hard to prove later? |
| **Information Disclosure** | What could leak across the boundary? |
| **Denial of Service** | What could exhaust or block the system? |
| **Elevation of Privilege** | What paths raise privileges unexpectedly? |
| **Abuse** | What realistic misuse path would an attacker or insider choose? |

### 4. Score and prioritize findings

For each finding, record:

- affected component or trust boundary
- short threat statement
- exploit path
- likely impact
- mitigating controls already present
- suggested remediation

Map to CWE, OWASP, or CVSS only when it clarifies the issue instead of bloating the report.

### 5. Run incremental analysis for changes

When comparing against a prior threat model, explicitly classify each item as:

- **new**
- **resolved**
- **still present**
- **changed severity**

This is especially useful for:

- new integrations
- changed authentication flows
- new background jobs or agents
- infrastructure moves
- CI/CD or deployment changes

### 6. Produce a concise decision-ready report

A good threat model report should leave the reader with:

- the architecture in scope
- the highest-risk boundaries
- the top findings in priority order
- what changed since the last model, if applicable
- the next mitigation step

Suggested structure:

```markdown
## Architecture Overview
- ...

## Trust Boundaries
- ...

## STRIDE-A Findings
- [High] ...
- [Medium] ...

## Change Diff
- New: ...
- Resolved: ...
- Still present: ...

## Next Mitigations
- ...
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "We'll just scan the code for vulnerabilities." | Code scanning misses architecture flaws, broken trust boundaries, and misuse paths. |
| "The old threat model is close enough." | Architecture drift makes stale threat models dangerously reassuring. |
| "Abuse cases are too speculative." | Real attackers optimize for abuse paths, not textbook categories. |

## Red Flags

- No one can name the trust boundaries in the system
- External systems are treated as trusted by default
- Authentication or authorization changes are documented only at code level
- A prior threat model exists but no change diff was done after a major update

## Verification

- [ ] The system scope and assets are explicit
- [ ] Components, flows, and trust boundaries were identified
- [ ] STRIDE-A was applied to each meaningful boundary or component
- [ ] Findings are prioritized instead of left as an unranked brainstorm
- [ ] Incremental changes are called out separately when a baseline exists

## See Also

- [`security-scan`](../security-scan/SKILL.md) - inspect code-level vulnerabilities after the model identifies hot spots
- [`agent-owasp-check`](../agent-owasp-check/SKILL.md) - review agent-specific OWASP ASI risks
- [`security-audit`](../../workflow/security-audit/SKILL.md) - broader workflow for OWASP plus STRIDE review
