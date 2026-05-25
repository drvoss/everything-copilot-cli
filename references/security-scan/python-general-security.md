# Python General Security Reference

Load this note when the project is primarily Python and no more specific security reference
exists for the active framework.

## Focus areas

- Validate external input with explicit schemas, serializers, or typed parsing at API boundaries
- Use parameterized queries or ORM filters; flag SQL built with f-strings, `%` formatting, or concatenation
- Prefer safe template rendering and autoescaping; review any raw HTML output or disabled escaping
- Avoid `subprocess` with `shell=True` for untrusted input and treat command construction as a high-risk sink
- Require explicit auth and authorization checks on every sensitive endpoint, job, or admin action
- Keep secrets out of source and config examples; redact tokens, passwords, and PII from logs
- Review file uploads, archive extraction, and path joins for traversal or unsafe overwrite behavior
- Run `pip-audit` or equivalent dependency checks and verify abandoned or low-trust packages before adoption

## Pair with

- [`../security-checklist.md`](../security-checklist.md)
- [`../../skills/security/security-scan/SKILL.md`](../../skills/security/security-scan/SKILL.md)
- relevant framework rules in `../../rules/frameworks/` or language rules in `../../rules/languages/` when they exist
