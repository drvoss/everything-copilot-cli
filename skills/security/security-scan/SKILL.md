---
name: security-scan
description: Use when you want a quick security pass on code changes or dependencies — checks OWASP Top 10 patterns, runs dependency audits, and surfaces critical vulnerabilities with targeted fixes.
metadata:
  category: security
  agent_type: general-purpose
---

# Security Scan

## When to Use
- Before releasing a new version or deploying to production
- After adding new dependencies
- During periodic security reviews
- When onboarding to an unfamiliar codebase
- After a security incident to check for similar vulnerabilities

## Prerequisites
- Access to the project source code and dependency manifests
- Package manager CLI available (npm, pip, go, etc.)
- Understanding of the application's architecture (web, API, CLI, etc.)

## Workflow

### 1. Dependency Vulnerability Audit
```powershell
# Node.js
npm audit 2>&1

# Python
pip audit 2>&1

# Go
go vuln check ./... 2>&1
```

Review findings by severity and fix critical/high issues:
```powershell
# Auto-fix where possible
npm audit fix

# For breaking changes, review and update manually
npm audit fix --force --dry-run
```

### 2. OWASP Top 10 Code Review
Search for common vulnerability patterns in the codebase:

```powershell
# A01: Broken Access Control — missing auth checks
grep -rn "app\.\(get\|post\|put\|delete\)" src/ --include="*.ts" | grep -v "auth\|middleware\|protect"

# A02: Cryptographic Failures — weak algorithms
grep -rni "md5\|sha1\|DES\|RC4\|Math\.random" src/ --include="*.ts"

# A03: Injection — string concatenation in queries
grep -rn "query.*\+\|exec.*\+\|\`.*\$\{" src/ --include="*.ts" | grep -i "sql\|query\|exec\|eval"

# A07: Auth failures — hardcoded credentials
grep -rni "password\s*=\|secret\s*=\|api_key\s*=" src/ --include="*.ts" | grep -v "test\|spec\|mock"

# A09: Logging failures — sensitive data in logs
grep -rn "console\.log\|logger\.\(info\|debug\)" src/ --include="*.ts" | grep -i "password\|token\|secret\|credit"
```

### 3. Secret Detection
```powershell
# Find potential secrets (API keys, tokens, passwords)
grep -rni "AKIA[0-9A-Z]\{16\}\|ghp_[a-zA-Z0-9]\{36\}\|sk-[a-zA-Z0-9]\{48\}" src/

# Check for .env files committed to git
git --no-pager ls-files | Select-String "\.env$|\.env\." | Select-String -NotMatch "\.example|\.template"
```

### 4. Configuration Security
```powershell
# Check for debug mode or dev settings in production configs
grep -rni "debug.*true\|NODE_ENV.*development" src/ --include="*.ts" | grep -v "test\|spec"

# Check CORS configuration
grep -rni "cors\|Access-Control-Allow-Origin" src/ --include="*.ts"

# Check for disabled security features
grep -rni "helmet\|csrf\|xss\|sanitize" src/ --include="*.ts"
```

### 5. Generate Report
Document findings with severity, location, and remediation:

```markdown
## Security Scan Results — [Date]

### Critical
- [ ] SQL injection in src/db/query.ts:42 — use parameterized queries

### High
- [ ] npm audit: lodash prototype pollution — upgrade to 4.17.21

### Medium
- [ ] Missing CSRF protection on POST /api/users

### Low
- [ ] Console.log contains user email in src/auth/login.ts:15
```

## Examples

### Full Scan Pipeline
```powershell
# Run all checks in sequence
npm audit --json 2>&1 | Select-Object -First 50
grep -rni "eval\|innerHTML\|dangerouslySetInnerHTML" src/ --include="*.ts"
grep -rni "password\|secret\|api.key" src/ --include="*.ts" | grep -v "test\|\.d\.ts"
```

### Using explore Agent for Deep Analysis
```
task agent_type: "explore"
prompt: "Find all database query functions and check if they use parameterized queries or string concatenation. List each file, line, and whether it's safe or vulnerable."
```

## STRIDE Threat Modeling

For new features or significant changes, apply STRIDE before scanning:

```
> Apply STRIDE threat modeling to the [feature/module]:
>
> S — Spoofing: Can an attacker impersonate a user or service?
> T — Tampering: Can data be modified in transit or at rest without detection?
> R — Repudiation: Can a user deny performing an action?
> I — Information Disclosure: Can sensitive data leak to unauthorized parties?
> D — Denial of Service: Can availability be disrupted?
> E — Elevation of Privilege: Can a user gain more permissions than intended?
>
> For each threat, rate likelihood (1-3) × impact (1-3) = risk score.
> List mitigations for risk score ≥ 4.
```

## Severity Classification

| Level | CVSS | Examples | Response Time |
|-------|------|---------|---------------|
| 🔴 **Critical** | 9.0–10.0 | RCE, auth bypass, secret leak in code | Fix before next commit |
| 🟠 **High** | 7.0–8.9 | SQLi, XSS, broken access control | Fix this sprint |
| 🟡 **Medium** | 4.0–6.9 | Missing rate limiting, weak crypto | Fix next sprint |
| 🔵 **Low** | 0.1–3.9 | Verbose error messages, info disclosure | Backlog |

## Tips

- Run `npm audit` in CI to catch new vulnerabilities automatically
- Use `.gitignore` to prevent secrets from being committed — but also verify with `git ls-files`
- Focus on **input boundaries** — anywhere user data enters the system
- Check both direct dependencies and transitive dependencies
- Security is a spectrum: prioritize by exploitability and impact, not just severity score
- Schedule regular scans, not just one-time reviews

## See Also

- [`evaluate-repository`](../evaluate-repository/SKILL.md) — Full 6-dimension repository security scorecard
- [`secret-detection`](../secret-detection/SKILL.md) — Dedicated secret and credential scanning
- [`pr-multi-perspective-review`](../../development/pr-multi-perspective-review/SKILL.md) — Security Lens in PR review
- [`input-validation`](../input-validation/SKILL.md) — Dedicated input sanitization patterns
