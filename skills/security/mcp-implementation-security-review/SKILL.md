---
name: mcp-implementation-security-review
description: Use when reviewing the source code of an MCP server or client implementation — not just its runtime config — for authentication, session, rate-limit, schema-validation, and SDK-usage vulnerabilities, with file/line-cited findings mapped to OWASP Top 10
metadata:
  category: security
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot mcp-implementation-security-review
---

# MCP Implementation Security Review

Review the **source code** of an MCP server or client implementation for exploitable
vulnerabilities. This is a code-level review — it inspects how a server or client is
*built*, not how it is *configured* or *governed*. Every finding must be backed by a
file/line citation so the report is directly actionable.

## When to Use

- A team is shipping or accepting a custom MCP server/client implementation (not just an
  off-the-shelf binary)
- Code review of a PR that adds or modifies MCP transport, auth, or tool-dispatch logic
- Before trusting a third-party MCP server whose source is available for inspection
- Auditing an internal MCP SDK wrapper for unsafe defaults

## When NOT to Use

| Instead of mcp-implementation-security-review | Use |
|------------------------------------------------|-----|
| Verifying plugin/package integrity and pinned versions (no source review) | `agent-supply-chain` |
| Broad OWASP Agentic Security Initiative Top 10 audit across the whole agent pipeline | `agent-owasp-check` |
| Configuring `.mcp.json` for a server you are not modifying | `mcp-ecosystem` |
| Building a brand-new MCP server from scratch | `mcp-builder` (pair this skill in afterward) |

This skill overlaps deliberately little with `agent-supply-chain` (package/version integrity)
and `agent-owasp-check` (OWASP ASI Top 10 across the whole agent pipeline): both of those treat
the MCP server as a black box. This skill opens the box and reviews the implementation itself.

## Prerequisites

- Read access to the MCP server or client's actual source code (not just its manifest)
- Know the transport in use: stdio, HTTP+SSE, or streamable HTTP
- Know the SDK/language the implementation uses (affects which unsafe patterns apply)

## The Five Controls

Review each control in the implementation source, not just its documentation:

| Control | What to inspect |
|---------|------------------|
| **Authentication** | How the server verifies caller identity; whether unauthenticated tool calls are possible; token validation logic |
| **Session management** | Session ID generation (must be cryptographically random, not sequential/timestamp-based); session fixation and hijack resistance; expiry enforcement |
| **Rate limiting** | Per-tool and per-session throttling; whether a single caller can exhaust server resources or downstream APIs |
| **Schema validation** | Whether every tool input is validated against a strict schema before use, or passed through to shell/SQL/filesystem calls unchecked |
| **SDK usage** | Whether the implementation uses the official MCP SDK's safe primitives correctly, or reimplements transport/framing logic in a way that reintroduces known SDK-fixed bugs |

## RCE Vectors to Check (Source-Level)

Grep and manually inspect the source for these seven vector classes:

1. **Unsanitized tool arguments reaching a shell** — `exec`, `spawn`, `subprocess`, backticks, or
   string-built shell commands fed by tool parameters
2. **Path traversal in file-serving tools** — tool parameters used to build file paths without
   normalization/allowlist checks
3. **Deserialization of untrusted tool input** — `pickle`, `eval`, `Function()`, YAML unsafe load,
   or similar on data that came from a tool call
4. **SSRF via server-initiated fetches** — a tool that fetches a URL supplied by the caller without
   blocking internal/metadata addresses
5. **Prompt/tool-result injection into a privileged execution path** — tool output fed back into a
   code-execution or shell-execution step without treating it as untrusted
6. **Missing origin/host validation on HTTP+SSE transports** — accepting cross-origin requests
   without a Host/Origin allowlist
7. **Unbounded resource consumption** — no caps on response size, recursion depth, or concurrent
   tool invocations, enabling a DoS from a single malicious tool call

## Workflow

### 1. Identify the implementation boundary

Confirm you are reviewing an actual server/client codebase, not just a config file. If only
`.mcp.json` is available with no accompanying source, this skill does not apply — use
`agent-supply-chain` for a config-only integrity check instead.

### 2. Walk the five controls

For each control, cite the specific file and line(s) that implement (or fail to implement) it.
Do not report a control as "missing" without having actually searched for it.

### 3. Check the seven RCE vectors

Search systematically rather than relying on memory of common patterns:

```powershell
git --no-pager grep -n -E "exec\(|spawn\(|subprocess|eval\(|pickle\.loads|yaml\.load\(" -- "*.py" "*.js" "*.ts"
git --no-pager grep -n -E "readFile|open\(|path\.join" -- "*.py" "*.js" "*.ts"
```

`git grep` uses basic regex by default — pass `-E` for extended regex so `|` alternation and
grouping work as written, and escape literal parentheses/dots that are not part of the pattern.

### 4. Map findings to OWASP Top 10

Attach each confirmed finding to the closest matching OWASP Top 10 (web) category (e.g.,
Injection, Broken Access Control, Security Misconfiguration) so severity and remediation guidance
stay consistent with existing security tooling.

### 5. Produce a file/line-cited compliance report

Every finding must include the exact file path and line number. A finding without a citation is
not actionable and should be downgraded to an open question rather than reported as a defect.

## Output Template

```markdown
## MCP Implementation Security Review: [server/client name]

### Five Controls
| Control | Status | Evidence |
|---------|--------|----------|
| Authentication | Pass/Fail/Partial | file:line |
| Session management | Pass/Fail/Partial | file:line |
| Rate limiting | Pass/Fail/Partial | file:line |
| Schema validation | Pass/Fail/Partial | file:line |
| SDK usage | Pass/Fail/Partial | file:line |

### RCE Vector Findings
| Vector | Found? | file:line | OWASP mapping | Severity |
|--------|--------|-----------|----------------|----------|

### Open Questions
- [item that could not be confirmed with a citation]
```

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "The SDK handles security, I don't need to check the implementation." | SDKs provide safe primitives; misuse at the call site still creates vulnerabilities. |
| "It's just a config file, that's enough to review." | Config-only review is `agent-supply-chain`'s job — this skill requires source access. |
| "This is internal-only, so auth doesn't matter." | Internal MCP servers are still reachable by any agent or process with tool access. |

## Red Flags

- Tool parameters reach `exec`/`subprocess`/`eval` without validation
- Session IDs are sequential, timestamps, or otherwise guessable
- No rate limiting on tools that call paid or rate-limited downstream APIs
- HTTP+SSE transport accepts requests without Host/Origin checks
- Findings reported without a specific file/line citation

## Verification

- [ ] All five controls reviewed against actual source, not documentation claims
- [ ] All seven RCE vector classes explicitly checked (not just the obvious ones)
- [ ] Every finding has a file/line citation
- [ ] Findings are mapped to OWASP Top 10 categories

## See Also

- [`agent-supply-chain`](../agent-supply-chain/SKILL.md) — integrity/tampering checks for MCP bundles as packages, not source review
- [`agent-owasp-check`](../agent-owasp-check/SKILL.md) — broader OWASP Agentic Security Initiative Top 10 audit across the whole agent pipeline
- [`mcp-builder`](../../copilot-exclusive/mcp-builder/SKILL.md) — build a new MCP server; pair with this skill before shipping it
