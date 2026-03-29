---
name: security-audit
description: Perform a thorough security audit using OWASP Top 10 and STRIDE threat modeling. Adopt the CSO perspective — every endpoint, input, and auth path is suspect until proven safe.
metadata:
  category: workflow
---

# Security Audit Skill

A structured security review workflow inspired by gstack's `/cso` role. Treat every
audit as if you are the Chief Security Officer: adversarial, systematic, and unapologetic
about raising issues.

This skill is distinct from the `security-scan` development skill — it covers full
threat modeling, not just code-level checks.

## When to Use

- Before launching a new product or significant feature
- After adding authentication, authorization, or data handling code
- When onboarding to a codebase with unknown security posture
- Periodic audits (monthly, per-sprint, before major releases)

## Audit Framework

### OWASP Top 10 Checklist

Copilot will systematically check each OWASP category:

```
> Perform an OWASP Top 10 audit on this codebase. For each category:
> 1. Check if the application is potentially vulnerable
> 2. Find specific code locations if vulnerable
> 3. Recommend a fix
> 4. Rate severity: Critical / High / Medium / Low
```

OWASP categories to cover:
- **A01 Broken Access Control** — authorization bypasses, privilege escalation
- **A02 Cryptographic Failures** — weak encryption, hardcoded secrets, cleartext data
- **A03 Injection** — SQL, NoSQL, OS command, LDAP injection
- **A04 Insecure Design** — threat modeling gaps, missing security controls
- **A05 Security Misconfiguration** — default credentials, verbose errors, open cloud storage
- **A06 Vulnerable Components** — outdated dependencies with known CVEs
- **A07 Auth Failures** — session management, credential stuffing, weak passwords
- **A08 Software Integrity** — unsigned updates, insecure CI/CD, deserialization
- **A09 Logging Failures** — missing security logs, log injection
- **A10 SSRF** — server-side request forgery, internal service exposure

### STRIDE Threat Modeling

For each major component (API endpoint, service, data store):

```
> Apply STRIDE threat modeling to the [component]. For each threat type,
> describe the attack vector, assess likelihood (1-5), assess impact (1-5),
> and recommend a mitigation.
```

| Threat | Question |
|--------|----------|
| **S**poofing | Can an attacker impersonate a user or service? |
| **T**ampering | Can data be modified in transit or at rest? |
| **R**epudiation | Can an actor deny performing an action? |
| **I**nformation Disclosure | Can sensitive data be exposed unintentionally? |
| **D**enial of Service | Can the system be made unavailable? |
| **E**levation of Privilege | Can a low-privilege user gain higher access? |

### Secrets Scan

```
> Scan the codebase for hardcoded secrets, API keys, passwords, and tokens.
> Include config files, environment examples, and test fixtures.
```

Check these patterns:
- Hardcoded API keys, tokens, passwords
- `.env.example` files with real values
- Comments containing credentials
- Git history (check `.git` log for accidentally committed secrets)
- Infrastructure-as-code files (Terraform, CloudFormation)

### Dependency Audit

```
> Audit our dependencies for known CVEs. Run npm audit / pip audit / 
> bundler-audit and summarize critical and high severity issues.
```

### Auth & Session Review

```
> Review the authentication and session management implementation:
> - Token expiration and refresh logic
> - Password hashing (bcrypt/argon2, not MD5/SHA1)
> - Session fixation and hijacking prevention
> - OAuth/OIDC implementation correctness
> - MFA implementation
```

## Full Audit Workflow

```
# 1. Get the lay of the land
> Map the attack surface: list all public API endpoints, auth endpoints,
> file upload handlers, and external service integrations.

# 2. OWASP sweep
> Perform an OWASP Top 10 audit. Start with A01-A03 (highest frequency).

# 3. Threat model critical paths
> Apply STRIDE to our authentication flow and payment processing.

# 4. Secrets scan
> Scan for hardcoded secrets and credentials.

# 5. Dependency check
npm audit --audit-level=high

# 6. Generate report
> Generate a security audit report with:
> - Executive summary (3 sentences)
> - Critical findings (must fix before launch)
> - High findings (fix within 2 weeks)
> - Medium/Low findings (backlog)
> - Recommended next steps
```

## Output Format

Request a structured report:

```
> Format the audit findings as a Markdown table:
> | Finding | Category | Severity | Location | Recommended Fix |
```

## Tips

- **Be adversarial**: Ask Copilot to think like an attacker, not a developer
- **Audit the happy path last**: Most vulnerabilities are in error handling and edge cases
- **Check the infrastructure too**: Security isn't just code — review CORS config, headers, TLS
- **Rotate secrets after audits**: If you found any, assume they're compromised
- **Schedule regular audits**: Security debt accumulates; quarterly > never

## Skill Differentiation

| Skill | Scope | When |
|-------|-------|------|
| **security-audit** (this skill) | Full threat model: OWASP + STRIDE + auth + deps. Strategic/CSO view. | Pre-launch, quarterly, new auth feature |
| [`security-scan`](../../security/security-scan/SKILL.md) | Code-level grep patterns + `npm audit`. Quick tactical scan. | Before every PR, CI integration |
| [`evaluate-repository`](../../security/evaluate-repository/SKILL.md) | Repository-wide 6-dimension scorecard (secrets, deps, auth, error handling, supply chain). | Onboarding to unknown codebase |

Run `security-scan` every PR. Run `security-audit` every sprint or release. Run `evaluate-repository` once on unfamiliar codebases.

## See Also

- [`security-scan`](../../security/security-scan/SKILL.md) — Quick code-level vulnerability scan (OWASP grep + STRIDE per feature)
- [`evaluate-repository`](../../security/evaluate-repository/SKILL.md) — Full repo security scorecard
- [`pr-multi-perspective-review`](../../development/pr-multi-perspective-review/SKILL.md) — Security Lens in PR reviews
- [`secret-detection`](../../security/secret-detection/SKILL.md) — Dedicated secret and credential scanning
