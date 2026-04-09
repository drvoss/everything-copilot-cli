# Security Rules

Rules for writing secure code. Apply these in every language and framework.

## Secrets & Credentials

- **Never hardcode** secrets, API keys, passwords, or tokens in source code
- Store sensitive configuration in **environment variables** or a secrets manager
- Use `.env` files for local development; never commit them (add to `.gitignore`)
- Rotate secrets regularly and support rotation without downtime

## Input Validation

- **Always validate user input** on the server side, even if validated on the client
- Use allowlists over denylists when possible
- Validate data types, lengths, ranges, and formats
- Reject unexpected input early — fail fast

## Database Security

- Use **parameterized queries** or prepared statements — never concatenate strings into SQL
- Apply the principle of least privilege to database credentials
- Sanitize and escape all dynamic values in queries (including NoSQL)

## Output & XSS Prevention

- **Sanitize all output** rendered in HTML, emails, or logs
- Use framework-provided escaping (e.g., React's JSX auto-escaping, template engines)
- Set `Content-Security-Policy` headers to restrict inline scripts
- Encode user-generated content before rendering

## Network & Transport

- Use **HTTPS for all external requests** — never send sensitive data over HTTP
- Validate TLS certificates; do not disable certificate verification
- Set appropriate CORS policies — avoid `Access-Control-Allow-Origin: *` in production

## API Security

- Implement **rate limiting** on all public-facing APIs
- Use authentication and authorization on every endpoint
- Return minimal error details to clients (no stack traces in production)
- Log failed authentication attempts for monitoring

## Logging & Monitoring

- **Never log sensitive data** (passwords, tokens, PII, credit card numbers)
- Log security-relevant events (login, access denied, privilege changes)
- Use structured logging for easier analysis
- Set up alerts for anomalous patterns

## Dependency Management

- Keep dependencies up to date; monitor for known vulnerabilities
- Use lock files (`package-lock.json`, `poetry.lock`, `go.sum`) for reproducible builds
- Audit dependencies regularly with tools like `npm audit`, `pip-audit`, or `govulncheck`

## Agent Governance

When using AI agents to execute code, apply these governance principles to limit blast
radius and maintain accountability. Based on the principle of defense-in-depth for
agentic systems.

### Least Privilege

Grant agents only the permissions they need for the specific task:

```text
✅ Correct: "Review src/auth/ for security issues" (read-only, scoped scope)
❌ Too broad: "Review the whole project and fix everything you find"

✅ Correct: Agent has access to: grep, glob, view, specific file paths
❌ Too broad: Agent has unrestricted file system write access
```

**Tool permission matrix** (apply to agent definitions in `agents/`):

| Agent role | Read files | Write files | Run commands | External network |
|-----------|-----------|------------|-------------|-----------------|
| Reviewer | ✅ All | ❌ None | ⚠️ Read-only | ⚠️ Limited |
| Implementer | ✅ All | ✅ Scoped | ✅ Test runner | ❌ None |
| Researcher | ✅ All | ⚠️ Session only | ❌ None | ✅ web_fetch |
| Planner | ✅ All | ✅ plan.md only | ⚠️ Read-only | ❌ None |

### Audit Trail

Agents should leave a traceable record of what they did and why:

```text
Every agent action should be traceable to:
1. The task it was executing (SQL todos table)
2. The decision it made (commit message or comment)
3. The state before and after (git diff)
```

```powershell
# Before running an agent on a clean working tree — create a snapshot
git stash push -m "pre-agent-$(Get-Date -Format 'yyyyMMddHHmmss')"
# or
git commit -am "chore: snapshot before agent run"
```

### Approval Gates

For high-risk agent actions, require explicit human confirmation before proceeding:

| Risk level | Examples | Gate required |
|-----------|---------|---------------|
| 🔴 High | Delete files, modify CI/CD config, dependency changes | Human approval |
| 🟠 Medium | Large-scale refactor, schema migrations | Human review of diff |
| 🟡 Low | Documentation updates, test additions | Automated validation only |
| 🔵 Minimal | Read-only analysis, plan creation | No gate |

```powershell
# Example: gate before a destructive agent action
Write-Host "⚠️  Agent is about to: delete 15 deprecated files"
Write-Host "Files to delete:"
git --no-pager diff --cached --name-only | Write-Host
$confirm = Read-Host "Proceed? (yes/N)"
if ($confirm -ne 'yes') {
    Write-Error "Aborted by user"
    exit 1
}
```

### Scope Containment

Define explicit boundaries before an agent starts:

```text
Agent task brief template:
## Allowed scope
- Read: any file
- Write: src/auth/ only
- Commands: npm test only

## Prohibited
- Modifying package.json or lock files
- Adding new dependencies
- Creating files outside src/auth/
- Accessing external URLs

## Stop conditions
- If tests fail after a change: revert and report
- If you need to modify a file outside scope: stop and ask
```
