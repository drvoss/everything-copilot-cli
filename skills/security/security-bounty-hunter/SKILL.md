---
name: security-bounty-hunter
description: Use when the goal is practical vulnerability discovery for responsible disclosure or bounty submission — focuses on remotely reachable, exploitable issues that qualify for real reports rather than a broad best-practices review
metadata:
  category: security
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# Security Bounty Hunter

Hunt for exploitable, bounty-worthy security issues. Bias toward remotely reachable, user-controlled attack paths — discard patterns that bounty platforms routinely reject as informative or out of scope.

## When to Use

- Scanning a repository for exploitable vulnerabilities
- Preparing a Huntr, HackerOne, or similar bounty submission
- Triage where the question is "does this actually qualify for a payout?" rather than "is this theoretically unsafe?"

## When NOT to Use

For broad best-practices audits, use [`security-scan`](../security-scan/SKILL.md) or [`evaluate-repository`](../evaluate-repository/SKILL.md) instead.

## In-Scope Patterns

| Pattern | CWE | Typical impact |
|---------|-----|----------------|
| SSRF through user-controlled URLs | CWE-918 | internal network access, cloud metadata theft |
| Auth bypass in middleware or API guards | CWE-287 | unauthorized account or data access |
| Remote deserialization or upload-to-RCE | CWE-502 | code execution |
| SQL injection in reachable endpoints | CWE-89 | data exfiltration, auth bypass |
| Command injection in request handlers | CWE-78 | code execution |
| Path traversal in file-serving paths | CWE-22 | arbitrary file read or write |
| Auto-triggered XSS | CWE-79 | session theft, admin compromise |

## Usually Out of Scope (skip unless program says otherwise)

- Local-only `pickle.loads`, `eval()` with no remote path
- `shell=True` on fully hardcoded commands
- Missing security headers alone
- Generic rate-limiting without exploit impact
- Self-XSS requiring victim to paste code manually
- Demo, example, or test-only code

## Workflow

1. **Check scope** — program rules, SECURITY.md, disclosure channel, exclusions
2. **Find real entrypoints** — HTTP handlers, uploads, webhooks, background jobs, parsers
3. **Run static triage** — use `grep` / `powershell` for pattern scanning; treat as triage input only
4. **Read the real code path end to end** — follow data from entrypoint to sink
5. **Prove user control reaches a meaningful sink**
6. **Confirm exploitability** with the smallest safe PoC
7. **Check for duplicates** — existing advisories, CVEs, open tickets

## Static Triage Patterns

```powershell
# Find potential injection sinks
grep -r "exec\|eval\|system\|popen\|subprocess" src/ --include="*.py" -n
grep -r "shell=True" src/ --include="*.py" -n

# Find potential SSRF
grep -r "requests.get\|urllib\|fetch\|axios" src/ --include="*.py" --include="*.ts" -n

# Find potential SQL injection
grep -r "f\"SELECT\|f'SELECT\|\+ .* WHERE\|string.*query" src/ -n
```

Then manually filter: drop tests, demos, fixtures, vendored code, non-reachable paths.

## Report Structure

```markdown
## Description
[What the vulnerability is and why it matters]

## Vulnerable Code
[File path, line range, and a small snippet]

## Proof of Concept
[Minimal working request or script]

## Impact
[What the attacker can achieve]

## Affected Version
[Version, commit, or deployment target tested]
```

## Quality Gate

Before submitting, confirm all of:
- [ ] Code path is reachable from a real user or network boundary
- [ ] Input is genuinely user-controlled
- [ ] Sink is meaningful and exploitable
- [ ] PoC works
- [ ] Issue is not already covered by an advisory, CVE, or open ticket
- [ ] Target is in scope for the bounty program

## See Also

- [security-scan](../security-scan/SKILL.md) — OWASP Top 10 + STRIDE broad audit
- [evaluate-repository](../evaluate-repository/SKILL.md) — scored security posture review
- [input-validation](../input-validation/SKILL.md) — sanitize and validate user inputs
