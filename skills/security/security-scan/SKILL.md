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

## When NOT to Use

| Instead of security-scan | Use |
|--------------------------|-----|
| PR-diff-only security review | `pr-security-review` |
| Agent / MCP / LLM risk review | `agent-owasp-check` |
| Strategic threat-model audit | `security-audit` or `threat-model-analyst` |

## Prerequisites

- Access to the project source code and dependency manifests
- Package manager CLI available (npm, pip, go, etc.)
- Understanding of the application's architecture (web, API, CLI, etc.)

## Workflow

### 0. Choose the operating mode

This skill can run in three distinct modes without becoming a separate skill:

1. **Secure-by-default implementation** — when writing new code or refactoring risky paths,
   identify the stack first, load any matching security references, and keep safe defaults
   in mind while implementing.
2. **Passive detection during the current task** — while you are already reading or editing
   files, call out only high-impact violations of the loaded guidance. This is not a
   background watcher; it applies only to the files you are actively handling.
3. **Explicit security report** — when the user asks for a review or report, produce a
   prioritized findings list with IDs, severity, and concrete file:line references.

### 0a. Load stack-specific security references

Before scanning deeply, identify the language and primary framework in scope. If the shared
[`../../../references/security-scan/`](../../../references/security-scan/) directory contains a
matching file, read it first and pair it with the shared repository checklist at
[`../../../references/security-checklist.md`](../../../references/security-checklist.md).

Suggested lookup order:

1. framework-specific reference such as
   `../../../references/security-scan/javascript-typescript-general-security.md` when the
   codebase is JS/TS-heavy
2. `../../../references/security-scan/python-general-security.md` when the codebase is
   Python-heavy
3. `../../../references/security-scan/rust.md` when the codebase is Rust-heavy
4. the shared repository checklist when no stack-specific note exists

If no matching reference exists, continue with the scan using well-known best practices rather
than inventing framework-specific rules.

### 0b. Keep the scan itself safe

Start with read-only discovery commands. Do not treat destructive shell forms as harmless
inspection:

- `find -exec` and `find -delete` require explicit approval
- wrapper-prefixed commands such as `env ...`, `sudo ...`, `watch ...`, `ionice ...`, and
  `setsid ...` inherit the risk of the underlying command

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

Treat secret matches as toxic output: do not paste raw credential values into chat, Markdown reports,
or issue comments. When a grep or `secret-detection` run hits a live-looking value, report the
finding as `path:line - potential secret [REDACTED]` and keep only the evidence needed for remediation.

### 4. Configuration Security

```powershell
# Check for debug mode or dev settings in production configs
grep -rni "debug.*true\|NODE_ENV.*development" src/ --include="*.ts" | grep -v "test\|spec"

# Check CORS configuration
grep -rni "cors\|Access-Control-Allow-Origin" src/ --include="*.ts"

# Check for disabled security features
grep -rni "helmet\|csrf\|xss\|sanitize" src/ --include="*.ts"
```

#### 4-A. Sensitive bootstrap and execution surfaces

Treat repository-contained startup and build-entry files as security-sensitive
execution surfaces, not ordinary text files.

```powershell
# Inventory repo-contained bootstrap/config files worth extra review
$bootstrapFiles = git --no-pager ls-files --cached --others --exclude-standard |
  Select-String "(^|/)(\.bashrc|\.zshrc|\.profile|\.bash_profile|\.zprofile|\.bash_logout|Makefile|pyproject\.toml|package\.json|[^/]+\.sh)$" |
  ForEach-Object { $_.Line }

# Look for script hooks or fetched-content execution in those files
if ($bootstrapFiles) {
  Select-String -Path $bootstrapFiles -Pattern "preinstall|postinstall|prepare|curl|wget|Invoke-WebRequest|iex|eval|bash -c|sh -c|source "
}
```

Review especially:

- repo-contained shell profile or startup files that modify PATH, aliases, shell functions, or
  bootstrap commands
- `package.json` script hooks such as `preinstall`, `postinstall`, or `prepare`
- `pyproject.toml` build-system and tool configuration that can alter packaging or code execution
- `Makefile` targets used for setup, bootstrap, release, or developer environment initialization

If these files download remote content, invoke shells dynamically, or run before ordinary developer
review, treat them as higher-priority findings.

### 5. Generate Report (quick checklist)

For standard scans or ongoing work, use a lightweight checklist format:

Document findings with severity, location, and remediation.
Redact API keys, passwords, tokens, private keys, connection strings, and direct PII values in the
report body; keep file path, line number, and finding type, but mask the value as `[REDACTED]` or `***`.

```markdown
## Security Scan Results — [Date]

### Critical
- [ ] SQL injection in src/db/query.ts:42 — use parameterized queries

### High
- [ ] npm audit: lodash prototype pollution — upgrade to 4.17.21

### Medium
- [ ] Missing CSRF protection on POST /api/users
- [ ] Potential GitHub token in src/config.ts:18 — value redacted as [REDACTED]

### Low
- [ ] Console.log contains user email in src/auth/login.ts:15
```

### 6. Report format for explicit security-review requests

When the user explicitly asks for a security review or best-practices report, prefer numbered
findings with evidence:

Apply the same redaction rule here: include enough evidence to act, but never reproduce secret values,
session tokens, authorization headers, or unnecessary personal data verbatim.

````markdown
## Security Scan Results — [Date]

### Critical
- **[SEC-001] SQL Injection** `src/db/query.ts:42` — User-controlled input is concatenated
  into a raw SQL string. Use a parameterized query.

### High
- **[SEC-002] Missing Auth Check** `src/api/admin.ts:15` — Sensitive route lacks auth
  middleware and is reachable with an ordinary session.

### Medium
- **[SEC-003] Weak Secret Handling** `src/auth/config.ts:8` — Fallback development secret is
  hardcoded in source. Move it to environment configuration. Report the finding with the literal
  value redacted as `[REDACTED]` when sharing evidence.
````

If the user wants a written report, write it to a path they specify. Otherwise, present the
report in chat first and only create a Markdown file when asked.

## Examples

### Full Scan Pipeline

```powershell
# Run all checks in sequence
npm audit --json 2>&1 | Select-Object -First 50
grep -rni "eval\|innerHTML\|dangerouslySetInnerHTML" src/ --include="*.ts"
grep -rni "password\|secret\|api.key" src/ --include="*.ts" | grep -v "test\|\.d\.ts"
```

### Using explore Agent for Deep Analysis

```text
task agent_type: "explore"
prompt: "Find all database query functions and check if they use parameterized queries or string concatenation. List each file, line, and whether it's safe or vulnerable."
```

## STRIDE Threat Modeling

For new features or significant changes, apply STRIDE before scanning:

```text
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

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "It's an internal tool, security matters less" | A compromised internal tool grants access to all internal systems. |
| "Our dependencies are well-vetted" | Supply chain attacks on npm/PyPI packages happen continuously. |
| "Frontend already validates input" | Frontend validation is for UX. Backend validation is for security. |
| "We use an ORM, so SQL injection isn't a concern" | Raw queries, dynamic queries, and ORM misuse are still vulnerable. |

## Red Flags

- Use of `eval()`, `exec()`, `subprocess(shell=True)`
- String concatenation in SQL queries (f-strings, `+` operator)
- API keys or passwords hardcoded in source files
- Critical vulnerabilities in `npm audit` output being ignored
- Wildcard `*` in CORS configuration
- `find -exec` or `find -delete` used during "inspection" without an explicit safety review
- Wrapper-prefixed commands used to hide risky actions (`env`, `sudo`, `watch`, `ionice`, `setsid`)

## Verification

- [ ] `npm audit --audit-level=high` or `pip-audit` returns 0 findings
- [ ] No secrets in source code (`secret-detection` skill executed)
- [ ] OWASP Top 10 checklist completed
- [ ] Server-side validation present for all user inputs
- [ ] Security headers verified (CSP, HSTS, X-Frame-Options)

## Tips

- Load any matching stack reference before making framework-specific recommendations
- Use `[SEC-001]` style IDs only when the scan is operating in explicit report mode
- Always include concrete file:line references for actionable findings
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
