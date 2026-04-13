---
name: the-security-guide
description: Security best practices for AI-assisted development with Copilot CLI
category: guide
---

# The Security Guide

> Security practices for AI-assisted development. Covers traditional application security and AI-specific concerns unique to working with Copilot CLI.

---

## Secret Management

**Rule #1: Never hardcode secrets.**

### Use Environment Variables

```powershell
# Set environment variables
$env:DATABASE_URL = "postgresql://user:pass@host:5432/db"
$env:API_KEY = "sk-..."

# In your code, always read from environment
# ❌ Bad
# const apiKey = "sk-1234567890abcdef";

# ✅ Good
# const apiKey = process.env.API_KEY;
```

### Use .env Files (Never Commit Them)

```bash
# .env
DATABASE_URL=postgresql://user:pass@host:5432/db
API_KEY=sk-1234567890abcdef
JWT_SECRET=your-256-bit-secret
```

```gitignore
# .gitignore — ALWAYS include these
.env
.env.local
.env.production
*.pem
*.key
```

### Secret Rotation

- Rotate secrets on a schedule (90 days minimum)
- Use a secret manager (GitHub Secrets, AWS Secrets Manager, Azure Key Vault)
- Never share secrets via chat, email, or commit messages

### When Working with Copilot CLI

- Copilot CLI never stores your secrets
- Avoid pasting secrets directly into the chat — use environment variable references
- Use the [Secret Detection skill](../skills/security/secret-detection/SKILL.md) to scan for leaked secrets

---

## Input Validation

Validate all user input at every boundary.

### SQL Injection Prevention

```typescript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Parameterized query
const query = `SELECT * FROM users WHERE id = $1`;
const result = await db.query(query, [userId]);
```

### XSS Prevention

```typescript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Safe
element.textContent = userInput;

// ✅ If HTML is needed, sanitize first
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### CSRF Prevention

```typescript
// Always use CSRF tokens for state-changing operations
app.use(csrf({ cookie: true }));

// Include token in forms
// <input type="hidden" name="_csrf" value="{{csrfToken}}">
```

### Command Injection Prevention

```typescript
// ❌ Vulnerable
exec(`git log --author="${userInput}"`);

// ✅ Use parameterized APIs
execFile('git', ['log', `--author=${userInput}`]);
```

### Ask Copilot CLI to Validate

```text
> Review all API endpoints for input validation vulnerabilities
> Check the user registration flow for injection risks
```

---

## Dependency Security

### Regular Audits

```powershell
# Node.js
npm audit
npm audit fix

# Python
pip audit
pip install --upgrade safety && safety check

# Go
go list -m all | nancy sleuth
```

### Supply Chain Attack Prevention

| Practice | How |
|---|---|
| Pin exact versions | Use `package-lock.json`, `requirements.txt` with `==` |
| Review new dependencies | Check download counts, maintenance activity, known issues |
| Use lockfiles | Always commit lockfiles to version control |
| Limit transitive deps | Prefer packages with fewer dependencies |
| Enable Dependabot | Auto-creates PRs for vulnerable dependencies |

### When Adding Dependencies with Copilot CLI

```text
# Ask Copilot to evaluate a dependency before adding it
> What are the security implications of adding the xyz package?
> Are there lighter alternatives to lodash for deep cloning?
```

---

## Authentication & Authorization

### JWT Best Practices

```typescript
import jwt from 'jsonwebtoken';

// ✅ Short expiration, strong algorithm
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',
    expiresIn: '15m',       // Short-lived access tokens
    issuer: 'your-app',
    audience: 'your-api'
  }
);

// ✅ Always verify all claims
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'],     // Prevent algorithm confusion
  issuer: 'your-app',
  audience: 'your-api'
});
```

### OAuth Implementation

- Always use PKCE for public clients (SPAs, mobile apps)
- Validate `state` parameter to prevent CSRF
- Store tokens securely (httpOnly cookies, not localStorage)
- Implement token refresh with rotation

### Session Management

- Set secure cookie flags: `httpOnly`, `secure`, `sameSite`
- Implement session timeout (idle and absolute)
- Invalidate sessions on password change
- Store session data server-side, never in cookies

---

## Error Handling

### Don't Leak Information

```typescript
// ❌ Leaks internal details
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,        // Never expose stack traces
    query: err.sql           // Never expose SQL queries
  });
});

// ✅ Safe error response
app.use((err, req, res, next) => {
  console.error(err);       // Log full error internally
  res.status(500).json({
    error: 'An internal error occurred',
    requestId: req.id        // Return correlation ID for debugging
  });
});
```

### Sanitize Error Messages

- Remove file paths, database names, and internal IPs from user-facing errors
- Use error codes instead of descriptive messages for API responses
- Log detailed errors server-side with structured logging
- Never include user credentials in log output

---

## AI-Specific Security

### Prompt Injection Risks

When using AI tools in production workflows:

| Risk | Mitigation |
|---|---|
| User input interpreted as instructions | Separate user data from system prompts |
| Malicious file content manipulating AI | Review AI actions on untrusted repositories |
| Exfiltration via tool calls | Use tool allowlisting and permission boundaries |

### Copilot CLI's Permission Model

Copilot CLI has built-in security boundaries:

- **Interactive mode**: Asks permission before every file edit, command execution
- **Plan mode**: Shows full plan before executing — you review every change
- **Autopilot mode**: More autonomous but still respects tool permission boundaries
- **Tool allowlisting**: Configure which tools agents can use

### Safe AI-Assisted Development Practices

```text
# ✅ Review generated code before committing
> Show me a diff of all changes you made

# ✅ Use code-review agents on AI-generated code
> Review the changes for security vulnerabilities

# ✅ Run security scans after AI modifications
> Run npm audit and check for new vulnerabilities
```

- Never grant AI tools access to production environments
- Review all generated code, especially security-critical paths
- Use the [Security Scan skill](../skills/security/security-scan/SKILL.md) after significant changes

---

## GitHub Security Features

Leverage GitHub's built-in security tools alongside Copilot CLI:

### Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Secret Scanning

- Enabled by default on public repositories
- Enable for private repos in repository settings
- Copilot CLI can check for secrets before you commit:

```text
> Scan all staged files for hardcoded secrets or API keys
```

### Code Scanning (CodeQL)

```yaml
# .github/workflows/codeql.yml
name: CodeQL Analysis
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3
```

### Using Copilot CLI with GitHub Security

```text
# Check Dependabot alerts
> Show me open Dependabot alerts for this repository

# Review security advisories
> Are any of our dependencies affected by recent CVEs?

# Inspect Actions workflow for security issues
> Review our CI/CD workflow for security best practices
```

---

## Security Review Checklist

### Pre-Commit Checklist

- [ ] No hardcoded secrets, tokens, or API keys
- [ ] All user inputs are validated and sanitized
- [ ] SQL queries use parameterized statements
- [ ] Error messages don't leak internal details
- [ ] New dependencies have been reviewed for security
- [ ] Authentication and authorization checks are in place

### Pre-Merge Checklist

- [ ] Code review completed (human or AI-assisted)
- [ ] Security scan passes (CodeQL, npm audit)
- [ ] No new high/critical vulnerabilities introduced
- [ ] CORS and CSP headers are properly configured
- [ ] Rate limiting is applied to public endpoints
- [ ] Tests cover security-critical paths

### Pre-Deploy Checklist

- [ ] Environment variables are set (not defaults)
- [ ] TLS/HTTPS is enforced
- [ ] Security headers are configured (HSTS, X-Frame-Options, etc.)
- [ ] Logging and monitoring are active
- [ ] Rollback plan is documented
- [ ] Incident response contacts are current

---

## Copilot CLI Security Advantages

Copilot CLI provides security features that enhance your development workflow:

| Feature | Security Benefit |
|---|---|
| **Permission dialogs** | Every file edit and command requires explicit approval (Interactive mode) |
| **Plan review** | Full visibility into planned changes before execution |
| **Tool allowlisting** | Restrict which tools agents can access |
| **Session SQL database** | Audit trail of all actions taken during a session |
| **Code-review agent** | Automated security-focused code review with high signal |
| **GitHub MCP integration** | Direct access to Dependabot alerts, secret scanning, code scanning |
| **Multi-model support** | Use premium models for security-critical analysis |

### Recommended Security Workflow

```text
# 1. Implement feature (Autopilot mode with fast model)
/model gpt-5.1-codex
> Implement the password reset flow

# 2. Security review (code-review agent with strong model)
/model claude-sonnet-4.6
> Review the password reset implementation for security vulnerabilities

# 3. Run security scans
> Run npm audit and check for OWASP Top 10 issues

# 4. Final human review before merge
> Show me the complete diff for final review
```

---

> ⚠️ **Remember**: AI tools accelerate development but don't replace security judgment. Always review generated code, especially for authentication, authorization, data handling, and any code that processes user input.
