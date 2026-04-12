---
name: api-and-interface-design
description: Use when defining a public API, CLI, webhook, or SDK surface — lock the contract first so compatibility, validation, and versioning stay intentional instead of accidental
metadata:
  category: development
  agent_type: general-purpose
  origin: ported and adapted from addyosmani/agent-skills
---

# API and Interface Design

Define the contract before the implementation. This skill is for **public or cross-team interfaces**
where downstream consumers can depend on every observable behavior, including the ones you did not
mean to promise.

## When to Use

- Designing a new public HTTP API, CLI command, webhook, SDK surface, or plugin contract
- Changing an existing interface that other teams, tools, or customers already consume
- Clarifying breaking-change policy before implementation starts
- Tightening the interface section of `spec-driven-development` for a compatibility-sensitive feature

## When NOT to Use

| Instead of api-and-interface-design | Use |
|-------------------------------------|-----|
| Internal implementation design inside one module | `spec-driven-development` |
| Writing user-facing docs for a finished API | `api-documentation` |
| Retiring or replacing an old interface | `deprecation-and-migration` |
| Narrow bug fixes with no contract change | do the fix directly |

## Workflow

### 1. Identify the real contract boundary

Write down:

- **Who consumes this interface?** Humans, services, CLI users, integrations, third-party developers
- **What is observable?** Inputs, outputs, error codes, ordering, timing, idempotency, pagination, retries
- **What must stay stable?** Field names, response structure, exit codes, callback payloads, invariants

If the consumer or stability target is unclear, you are not ready to implement.

### 2. Draft the contract before code

Create a contract document or spec section before touching implementation:

```markdown
## Interface Contract: createWidget

**Interface type**: REST API / CLI / SDK / webhook
**Consumers**: Internal services + external customers
**Stability**: stable / beta / experimental

### Inputs
- Method / command / function name:
- Required parameters:
- Optional parameters:
- Validation rules:

### Outputs
- Success shape:
- Error shape:
- Ordering / pagination guarantees:

### Invariants
- [Behavior that must remain true]

### Non-Goals
- [What this interface deliberately does not promise]
```

### 3. Run a Hyrum's Law review

For every observable behavior, ask:

- Is this behavior intentionally part of the contract?
- If consumers start depending on it, can we support it long-term?
- If not, should we remove it, hide it, or document that it is non-contractual?

Common accidental contracts:

- Stable ordering without documenting it
- Error message wording used by scripts
- Undocumented default values
- Side effects triggered by read operations
- Field presence that is only an implementation artifact

### 4. Design validation at the trust boundary

Validation should happen where untrusted input enters the system:

- HTTP body, query params, headers
- CLI args and environment variables
- Webhook payloads
- Files or user-supplied configuration

Do not scatter the same runtime validation through every internal layer. Define:

- Accepted input shape
- Rejection rules
- Standard error envelope or exit code mapping
- Which invariants are guaranteed after boundary validation succeeds

### 5. Choose the compatibility strategy

| Change type | Default strategy |
|-------------|------------------|
| Additive field | Make optional first; define default behavior |
| Renamed field | Add new field, deprecate old one, keep overlap window |
| Semantic change | Version the interface or add a new endpoint/flag |
| Removed capability | Publish a migration path before removal |

If you cannot explain the migration path in two or three sentences, the change is not ready.

### 6. Hand off to implementation planning

Once the contract is stable:

1. Feed it into `spec-driven-development`
2. Identify tests that prove the contract
3. Implement the smallest slice that honors the contract exactly

## Example

```markdown
## Interface Contract: `copilot skill install`

**Interface type**: CLI
**Consumers**: Developers using Copilot CLI
**Stability**: beta

### Inputs
- Command: `copilot skill install <url-or-path>`
- Optional flags: `--dry-run`, `--force`
- Validation rules:
  - URL must be HTTPS or GitHub shorthand
  - Local path must contain a valid skill directory

### Outputs
- Exit code `0`: install succeeded
- Exit code `1`: validation failure
- Exit code `2`: network or fetch failure

### Invariants
- Installed skill is validated before being written
- `--dry-run` never mutates the filesystem

### Non-Goals
- Private repository authentication
- Version pinning
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Letting implementation details leak into the contract | Document only consumer-visible behavior |
| Treating every internal helper as a public interface | Limit this skill to external or cross-team boundaries |
| Adding validation everywhere "just in case" | Validate once at the boundary, then trust the normalized input |
| Delaying breaking-change planning until after coding | Choose the migration strategy before implementation |

## Verification

- [ ] Consumers and stability target are explicitly named
- [ ] Inputs, outputs, invariants, and non-goals are written before coding
- [ ] Observable but accidental behaviors were reviewed for Hyrum's Law risk
- [ ] Boundary validation and error semantics are defined
- [ ] Breaking changes have a migration or versioning strategy

## See Also

- [`spec-driven-development`](../spec-driven-development/SKILL.md) — turn the contract into an implementation plan
- [`api-documentation`](../../documentation/api-documentation/SKILL.md) — publish user-facing API docs
- [`deprecation-and-migration`](../deprecation-and-migration/SKILL.md) — retire or replace old interfaces safely
