---
name: pr-security-review
description: Use when reviewing a pull request for security issues — automatically analyzes the diff for vulnerabilities, hardcoded secrets, injection risks, and broken access control before merging
metadata:
  category: security
  agent_type: code-review
  origin: inspired by anthropics/claude-code-security-review
---

# PR Security Review

Automated security analysis of pull request diffs. Focuses on security-specific concerns
that generic code review misses: injection vulnerabilities, authentication bypasses,
hardcoded secrets, and insecure data handling introduced by the change.

## When to Use

- Before merging any PR that touches authentication, authorization, or session handling
- Before merging PRs that add or modify API endpoints
- When a PR processes user input, file uploads, or external data
- Before merging PRs that update security-sensitive dependencies
- As a final gate before releasing to production

## When NOT to Use

| Instead of pr-security-review | Use |
|-------------------------------|-----|
| Full codebase audit (not a PR) | `evaluate-repository` + `security-scan` skills |
| Dependency-only update with no code change | `npm audit` / `pip-audit` directly |
| Code quality review (no security concerns) | `code-review` skill |

## Prerequisites

- Access to the PR diff (via `get_diff` or `get_files` GitHub MCP methods)
- Understanding of the application's trust boundary (what data is user-controlled)

## Workflow

### 1. Fetch the PR diff

```text
# Using GitHub MCP (built-in to Copilot CLI)
get_diff(owner, repo, pullNumber)

# Or review changed files
get_files(owner, repo, pullNumber)
```

### 2. Identify the attack surface in the diff

Before scanning for specific vulnerabilities, map what the PR adds or changes:

```text
Attack surface checklist (mark relevant items):
[ ] New API endpoints or routes
[ ] Changes to authentication logic
[ ] Changes to authorization / permission checks
[ ] New or modified database queries
[ ] User input processing (form data, URL params, file uploads)
[ ] New dependencies added (check each with npm audit / pip-audit)
[ ] Environment variable / config changes
[ ] Cryptographic operations (hashing, encryption, token generation)
[ ] File system access
[ ] External HTTP requests
```

Only continue with checks relevant to the PR's actual attack surface.

### 3. Scan for injection vulnerabilities

```powershell
# Fetch the PR diff first
$diff = gh pr diff <number>

# A03 — SQL Injection: string concatenation in queries
$diff | Select-String -Pattern "query.*\+|exec.*\+|`.*\${"

# A03 — Command Injection: unsanitized input in shell execution
$diff | Select-String -Pattern "exec\(|spawn\(|child_process|subprocess"

# A07 — XSS: unsanitized output in HTML context
$diff | Select-String -Pattern "innerHTML|dangerouslySetInnerHTML|document\.write"
```

### 4. Scan for authentication and authorization issues

```powershell
# Check for missing auth middleware on new routes
# Look for patterns like:
# router.get('/sensitive', handler)  ← no auth middleware
# vs
# router.get('/sensitive', authenticate, handler)  ← protected

# Check for hardcoded credentials in the diff
$diff | Select-String -Pattern "password\s*=\s*['\`"]|secret\s*=\s*['\`"]|api.key\s*=\s*['\`"]" -CaseSensitive:$false

# Check for tokens/keys in new config files
$diff | Select-String -Pattern "AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|sk-[a-zA-Z0-9]{48}"
```

### 5. Check new dependencies

For any new package added in the PR:

```powershell
# After checking out the PR branch
npm audit --json 2>&1 | Select-Object -First 100

# Check the specific package
npm info <package-name> dist-tags
```

Flag packages that:

- Have known CVEs in `npm audit`
- Have very few downloads or no maintenance
- Are unusual alternatives to well-known packages (potential typosquatting)

### 6. Review data flow for sensitive data

Trace user-controlled inputs through the diff:

```text
Input sources (user-controlled):
→ req.body, req.params, req.query, req.headers
→ file uploads (req.files, multer)
→ WebSocket messages
→ URL paths

For each input: does it reach a dangerous sink without sanitization?
Dangerous sinks: database queries, shell execution, HTML output, file paths, eval()
```

### 7. Write the security review comment

Structure findings by severity:

````markdown
## Security Review — PR #[number]

### 🔴 Critical (Block merge)
- **[SQL Injection]** `src/db/users.ts:42` — User-controlled `id` concatenated
  into raw SQL query. Use parameterized queries.
  ```typescript
  // Current (vulnerable)
  db.query(`SELECT * FROM users WHERE id = ${req.params.id}`)
  // Fix
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id])
  ```

### 🟠 High (Fix this sprint)

- **[Missing Auth]** `src/api/admin.ts:15` — New `/admin/export` endpoint has
  no authentication middleware. Add `requireAdmin` middleware.

### 🟡 Medium (Fix next sprint)

- **[Weak Crypto]** `src/auth/token.ts:8` — Using `Math.random()` for token
  generation. Use `crypto.randomBytes(32)` instead.

### ✅ No issues found in

- Dependency changes (npm audit clean)
- Database queries (all parameterized)

````

## Severity Classification

| Level | Examples | Action |
|-------|----------|--------|
| 🔴 Critical | RCE, auth bypass, secret in code, SQL injection | Block merge |
| 🟠 High | Missing auth on endpoint, broken access control, XSS | Fix before merge or create critical issue |
| 🟡 Medium | Weak crypto, missing rate limiting, info leak | Fix this sprint |
| 🔵 Low | Verbose errors, minor config issues | Backlog acceptable |

## OWASP Top 10 Quick Reference

| # | Category | What to look for in the diff |
|---|----------|------------------------------|
| A01 | Broken Access Control | Missing auth middleware, insecure direct object reference |
| A02 | Cryptographic Failures | Weak algorithms (MD5, SHA1), unencrypted sensitive data |
| A03 | Injection | SQL, command, LDAP, XPath string concatenation |
| A04 | Insecure Design | Missing rate limiting, no input bounds |
| A05 | Security Misconfiguration | Debug mode enabled, overly permissive CORS |
| A06 | Vulnerable Components | New deps with CVEs, outdated packages |
| A07 | Auth Failures | Weak password policy, missing brute force protection |
| A08 | Software Integrity | Unsigned dependencies, missing subresource integrity |
| A09 | Logging Failures | PII in logs, insufficient audit trail |
| A10 | SSRF | User-controlled URLs used in server-side requests, especially when URL parsing, hostname allowlists, or IP validation can be bypassed |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "It's just an internal API, no auth needed" | Internal endpoints are compromised via SSRF, insider threat, or lateral movement. Authenticate everything. |
| "The frontend already validates this" | Frontend validation is bypass-able by any HTTP client. Server-side validation is mandatory. |
| "It's a small change, security review is overkill" | Most breaches start with a "small change" — a single parameter added to a query, one route added without auth. |
| "We'll fix the hardcoded secret before production" | Secrets committed to git history remain retrievable forever, even after deletion. Rotate immediately. |

## Red Flags

- A new route is added without any mention of auth middleware in the diff
- `eval()`, `exec()`, or `child_process.spawn()` added with user input
- A new `*.env` file or secrets file added to the repository
- Dependencies added that are unusual variations of popular package names
- JWT or token validation logic changed or simplified
- New `Access-Control-Allow-Origin: *` header
- SSRF protections only block plain `127.0.0.1` or exact hostnames, but do not normalize encoded IP literals such as `2130706433` or `0x7f.0.0.1`
- SSRF allowlists or denylists compare raw hostnames without handling trailing-dot forms such as `internal.example.com.`

## Verification

- [ ] Attack surface mapped (all relevant categories identified)
- [ ] No injection vulnerabilities in new query/exec/eval calls
- [ ] All new API endpoints have appropriate auth middleware
- [ ] No secrets or API keys in the diff
- [ ] New dependencies pass `npm audit --audit-level=high`
- [ ] Sensitive data (passwords, tokens, PII) not logged
- [ ] Security findings communicated to PR author with specific line references

## Tips

- **Focus on the diff**: you're reviewing what changed, not the whole codebase.
  A secure old function does not become a concern — a new insecure call does.
- **Trace data flows**: don't just grep for patterns. Follow user input from where
  it enters to where it lands.
- **Use `explore` agent** for deep analysis: "Find all places in this PR diff where
  `req.body` is used without validation."
- **Escalate confirmed Critical/High findings** to the security team — don't merge.

## See Also

- [`security-scan`](../security-scan/SKILL.md) — full codebase scan (not just PR diff)
- [`evaluate-repository`](../evaluate-repository/SKILL.md) — 6-dimension repo security scorecard
- [`secret-detection`](../secret-detection/SKILL.md) — dedicated secret scanning
- [`input-validation`](../input-validation/SKILL.md) — sanitization patterns for fixing findings
