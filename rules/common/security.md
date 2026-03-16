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
