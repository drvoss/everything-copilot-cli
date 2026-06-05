---
name: evaluate-repository
description: Use when you need a comprehensive health scorecard of a codebase — scores security, code quality, test coverage, documentation, and AI agent governance across 7 dimensions with a prioritized remediation plan.
metadata:
  category: security
  agent_type: code-review
---

# Evaluate Repository

## When to Use

- Before merging a dependency or forked repository into your project
- As part of a security review gate before production deployment
- When onboarding a new open-source project — quick trust assessment
- Periodic audits of your own repository for hygiene regressions
- Before granting broad write, review, or merge autonomy to a coding agent

## Prerequisites

- Read access to the repository (no write access required)
- `gh` CLI or Copilot GitHub MCP for fetching issue/PR history (optional, enriches results)

## Workflow

### 1. Establish Scope

```powershell
# Confirm what's being evaluated
git --no-pager log --oneline -10
git --no-pager tag --sort=-creatordate | Select-Object -First 5

# Find sensitive file categories
git ls-files | Where-Object { $_ -match '\.(env|pem|key|p12|pfx|secret)$' }
git ls-files | Where-Object { $_ -match '(secret|credential|password|token)' -and $_ -notmatch 'test|spec|mock' }
```

### 2. Score Each Dimension (1–10)

For each dimension below, assign a score and list specific findings:

#### Dimension 1: Secrets & Credentials

```powershell
# Scan for hardcoded secrets patterns
git --no-pager grep -in "password\s*=\s*['\"][^'\"]" -- "*.ts" "*.js" "*.py" "*.go"
git --no-pager grep -in "api_key\s*=\s*['\"][^'\"]"
git --no-pager grep -in "secret\s*=\s*['\"][^'\"]"

# Check .gitignore covers sensitive files
Get-Content .gitignore | Select-String "\.env|\.pem|\.key|secret"
```

**Red flags (score → 1–3):**

- Hardcoded passwords, API keys, tokens in source
- `.env` or `.pem` files committed (not in .gitignore)
- AWS/GCP/Azure credentials in any file

#### Dimension 2: Dependency Security

```powershell
# Node.js
npm audit --audit-level=high 2>&1 | Select-Object -Last 20

# Python
pip-audit 2>&1 | Select-Object -Last 10

# Check for very outdated dependencies
npm outdated 2>&1 | Select-Object -First 20
```

**Red flags (score → 1–3):**

- Known CVEs in direct dependencies (high/critical severity)
- Dependencies last updated >2 years ago with no security patch history
- No lock file (package-lock.json, poetry.lock, go.sum)

#### Dimension 3: Input Validation & Injection Risk

```powershell
# SQL injection patterns
git --no-pager grep -n "query.*\+.*req\." -- "*.ts" "*.js" "*.py"
git --no-pager grep -n "execute.*f'" -- "*.py"

# Command injection
git --no-pager grep -n "exec.*req\.\|spawn.*req\.\|shell.*true" -- "*.js" "*.ts"

# Unsanitized template literals in queries
git --no-pager grep -n '\$\{.*req\.' -- "*.ts" "*.js"
```

**Red flags (score → 1–3):**

- String concatenation in SQL queries
- User input passed directly to `exec()`, `eval()`, or `shell`
- No input validation library (joi, zod, pydantic, etc.) despite user-facing API

#### Dimension 4: Authentication & Authorization

```powershell
# Find auth-related files
git ls-files | Where-Object { $_ -match 'auth|login|token|session|jwt' }

# Check for auth bypass patterns
git --no-pager grep -n "skipAuth\|bypassAuth\|noAuth\|TODO.*auth" -- "*.ts" "*.js" "*.py"

# Verify token expiration
git --no-pager grep -n "expiresIn\|exp\s*:" -- "*.ts" "*.js"
```

**Red flags (score → 1–3):**

- JWTs without expiration (`expiresIn` missing)
- Auth middleware not applied to sensitive routes
- Admin endpoints without role checks

#### Dimension 5: Error Handling & Information Leakage

```powershell
# Check for stack trace exposure in API responses
git --no-pager grep -n "error\.stack\|err\.stack" -- "*.ts" "*.js" | Where-Object { $_ -notmatch 'test|spec|log' }

# Overly broad catch blocks that swallow errors
git --no-pager grep -n "catch.*\{\s*\}" -- "*.ts" "*.js"

# console.log with sensitive data
git --no-pager grep -n "console\.log.*password\|console\.log.*token\|console\.log.*secret" -- "*.ts" "*.js"
```

**Red flags (score → 1–3):**

- Stack traces returned in HTTP responses in production
- Internal database errors exposed to API consumers
- Credentials logged (even debug logs)

#### Dimension 6: Supply Chain & Configuration

```powershell
# Check CI/CD pipeline for secret handling
Get-ChildItem .github/workflows -ErrorAction SilentlyContinue | Get-Content |
  Select-String "secrets\." | Select-Object -First 10

# Check for pinned dependencies (reduces supply chain risk)
Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty dependencies

# Check for SECURITY.md / responsible disclosure policy
Test-Path SECURITY.md
Test-Path .github/SECURITY.md
```

**Red flags (score → 1–3):**

- No `SECURITY.md` or security disclosure policy
- Unpinned wildcard versions (`"*"` or `"latest"`) for production deps
- Secrets echoed in CI logs

#### Dimension 7: AI Agent Governance *(apply only when the repository includes agent or LLM features)*

```powershell
# Check whether this repository actually exposes agent / LLM surfaces
git ls-files | Where-Object { $_ -match 'agent|llm|mcp|openai|anthropic|claude|langchain|gpt|gemini|codex|vertex|bedrock|ollama|litellm' }

# Look for resource limits and execution bounds
git --no-pager grep -n "maxTokens\|max_tokens\|timeout\|rate_limit\|maxRetries" -- "*.ts" "*.js" "*.py"

# Look for tool access controls or allowlists
git --no-pager grep -n "allowedTools\|toolWhitelist\|allowlist\|tool_guard" -- "*.ts" "*.js" "*.py"

# Check maintainer-controlled agent instructions and MCP configs
git ls-files | Where-Object {
  $_ -match '(^|/)(AGENTS\.md|CLAUDE\.md|GEMINI\.md|SKILL\.md|\.mcp\.json|mcp-config\.json)$'
}

# Check whether untrusted GitHub event text can reach automation paths
git --no-pager grep -n "issue_comment\|pull_request\|pull_request_target\|workflow_run\|repository_dispatch" -- ".github/workflows/*.yml" ".github/workflows/*.yaml"

# Check whether prior agent runs leave reviewable traces or artifacts
git ls-files | Where-Object { $_ -match '(^|/)(runs|traces|artifacts)/' }
```

Use this dimension only when the repo actually contains agentic behavior. If no such
surface exists, mark the dimension `N/A` and exclude it from the average.

**Red flags (score → 1–3):**

- Agents can invoke arbitrary tools with no allowlist or scope control
- No resource caps exist for agent runs (tokens, retries, time)
- Untrusted external content is injected directly into prompts or memory
- No audit trail exists for agent actions or tool calls
- Maintainer-controlled agent instructions or MCP configs are absent, contradictory, or unreviewed
- GitHub event payloads, PR comments, or issue text can steer automation without an explicit trust boundary
- No reviewable traces exist for previous automated runs, so readiness claims cannot be verified

**Readiness evidence to collect before enabling automation broadly:**

- scorecard-style summary with explicit blockers
- status of maintainer-controlled instruction files (`AGENTS.md`, `SKILL.md`, MCP config)
- whether untrusted event text is treated as data instead of executable instruction
- traces, logs, or prior run artifacts that justify the claimed safety level

### 3. Generate Scorecard

```text
╔══════════════════════════╦═══════╦══════════════════════════════════════════╗
║ Dimension                ║ Score ║ Key Finding                              ║
╠══════════════════════════╬═══════╬══════════════════════════════════════════╣
║ Secrets & Credentials    ║  7/10 ║ .env.example checked in, no actuals      ║
║ Dependency Security      ║  5/10 ║ 2 high CVEs in express-validator 5.x     ║
║ Input Validation         ║  8/10 ║ Zod validation on all routes             ║
║ Auth & Authorization     ║  6/10 ║ JWT has no expiration set                ║
║ Error Handling           ║  9/10 ║ Custom error handler hides stack traces  ║
║ Supply Chain & Config    ║  7/10 ║ No SECURITY.md present                   ║
║ AI Agent Governance      ║  N/A  ║ No agent or LLM execution surface found  ║
╠══════════════════════════╬═══════╬══════════════════════════════════════════╣
║ OVERALL                  ║ 7/10  ║ Exclude N/A dimensions from the average  ║
╚══════════════════════════╩═══════╩══════════════════════════════════════════╝
```

### 4. Prioritize Remediation

**P0 (Block deployment):**

- Any score ≤ 3 in Secrets & Credentials, Auth & Authorization, or Input Validation

**P1 (Fix before next release):**

- Any score ≤ 5 in any dimension
- Known CVEs in direct dependencies (high/critical)

**P2 (Fix in next sprint):**

- Missing SECURITY.md
- Unpinned dependency versions
- Stale dependencies (>18 months)

## Tips

- **Read-only always**: this skill never modifies files — analysis only
- **Combine with `security-scan`**: `security-scan` checks your own code; `evaluate-repository` assesses third-party code you're adopting
- **Re-run after `npm install`**: dependency graph changes on every install
- **Score calibration**: a 7/10 overall with a 2/10 on Secrets is worse than a 6/10 uniform

## See Also

- [`security-scan`](../security-scan/SKILL.md) — automated scan of your own codebase
- [`code-reviewer`](../../../agents/code-reviewer.md) — full code quality review agent
- *Inspired by: [awesome-claude-code/resources/slash-commands/evaluate-repository](https://github.com/hesreallyhim/awesome-claude-code)*
