---
name: security-scan
description: Scan for security vulnerabilities including OWASP Top 10 and dependency audits
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

## Tips
- Run `npm audit` in CI to catch new vulnerabilities automatically
- Use `.gitignore` to prevent secrets from being committed — but also verify with `git ls-files`
- Focus on **input boundaries** — anywhere user data enters the system
- Check both direct dependencies and transitive dependencies
- Security is a spectrum: prioritize by exploitability and impact, not just severity score
- Schedule regular scans, not just one-time reviews
