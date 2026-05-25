# JavaScript / TypeScript General Security Reference

Load this note when the project is primarily JavaScript or TypeScript and no more specific
security reference exists for the active framework.

## Focus areas

- Validate user-controlled input at every server boundary with schemas or narrow parsing
- Prefer parameterized queries and ORM-safe APIs; treat raw SQL strings and template literals as suspect
- Avoid `eval`, dynamic code execution, and shell commands built from untrusted input
- Escape or sanitize HTML output; treat `innerHTML` and `dangerouslySetInnerHTML` as review hotspots
- Keep auth defaults strict: short-lived tokens, explicit session expiry, secure cookie settings under TLS
- Never hardcode secrets in source; prefer environment-based config and redact sensitive values in logs
- Review path handling for traversal risks when using uploads, archives, or filesystem APIs
- Run `npm audit` for dependency risk and inspect any unusual packages for typosquatting or abandonment

## Pair with

- [`../security-checklist.md`](../security-checklist.md)
- [`../../skills/security/security-scan/SKILL.md`](../../skills/security/security-scan/SKILL.md)
- relevant framework rules in `rules/frameworks/` when they exist
