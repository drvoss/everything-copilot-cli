# Skill: Delegate to Claude Code

> **When:** Deep reasoning, architecture decisions, security analysis, 200K+ context needed

## Decision Matrix

| Signal | Delegate to Claude? |
|--------|:-------------------:|
| Need to understand 50+ files at once | ✅ Yes |
| Architecture or design decision | ✅ Yes |
| Security audit or threat modeling | ✅ Yes |
| Complex refactoring with side effects | ✅ Yes |
| Simple code generation | ❌ Use Codex |
| GitHub PR/Issue operations | ❌ Use Copilot |
| Image or diagram analysis | ❌ Use Gemini |

## Method 1: Shell Invocation (Quick)

### Basic Delegation

```powershell
# Delegate architecture review to Claude
$result = npx @anthropic-ai/claude-code --print `
  "Review the architecture of this project. Focus on:
   1. Separation of concerns
   2. Error handling consistency
   3. Scalability bottlenecks
   Provide specific file paths and line numbers."

Write-Output $result
```

### With File Context

```powershell
# Send specific files for Claude's deep analysis
$files = Get-Content src/services/auth.ts, src/middleware/jwt.ts -Raw
$prompt = @"
Analyze these authentication files for security vulnerabilities:

$files

Check for:
- Token validation bypasses
- Timing attacks
- Missing input sanitization
- Improper error disclosure
"@

$review = npx @anthropic-ai/claude-code --print $prompt
Write-Output $review
```

### Structured Output

```powershell
# Request JSON output for programmatic processing
$json = npx @anthropic-ai/claude-code --print @"
Analyze the database models in src/models/ and output a JSON migration plan:
{
  "currentIssues": ["issue 1", ...],
  "migrations": [
    {"table": "...", "change": "...", "risk": "low|medium|high", "sql": "..."}
  ],
  "estimatedDowntime": "..."
}
Output ONLY valid JSON.
"@

$plan = $json | ConvertFrom-Json
$plan.migrations | Where-Object { $_.risk -eq "high" } | Format-Table
```

## Method 2: MCP Bridge (Recommended for Teams)

### Setup

Add to your MCP configuration (`.copilot/mcp.json` or `.vscode/mcp.json`):

```json
{
  "mcpServers": {
    "claude-code": {
      "command": "npx",
      "args": ["@anthropic-ai/claude-code", "--mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### Usage

Once configured, Claude Code's tools are available natively in Copilot CLI. Simply describe what you need:

```
You: "Use Claude to review our authentication architecture for security issues"

Copilot CLI automatically invokes Claude's tools through the MCP bridge.
```

## Template Prompts

### Architecture Review

```
Review the architecture of [directory/project]. Analyze:
1. Component boundaries and coupling
2. Data flow between services
3. Error propagation patterns
4. Scalability characteristics
5. Single points of failure

Provide specific recommendations with file paths and priority levels.
```

### Security Audit

```
Perform a security audit of [files/directory]. Check for:
1. Authentication/authorization bypasses
2. Injection vulnerabilities (SQL, XSS, command)
3. Sensitive data exposure
4. Insecure cryptographic practices
5. Missing input validation

Rate each finding: CRITICAL / HIGH / MEDIUM / LOW
Include remediation steps for each finding.
```

### Refactoring Plan

```
Create a refactoring plan for [files/directory]. Goal: [describe goal].

For each change:
1. What to change and why
2. Files affected
3. Risk of breaking existing behavior
4. Suggested order of changes
5. How to verify correctness

Output as a numbered, actionable plan.
```

### Design Decision

```
I need to decide between [option A] and [option B] for [feature/component].

Context: [current architecture, constraints, requirements]

Analyze each option considering:
1. Maintainability (1-5 years)
2. Performance implications
3. Team learning curve
4. Migration effort
5. Risk factors

Provide a clear recommendation with justification.
```

## Processing Claude's Response

### In Copilot CLI

After Claude returns its analysis, Copilot CLI can:

1. **Create Issues** from findings:
```powershell
# Parse Claude's security findings and create GitHub Issues
$findings | ForEach-Object {
    gh issue create --title "Security: $($_.issue)" --body $($_.details) --label "security"
}
```

2. **Feed to Codex** for implementation:
```powershell
# Claude designs, Codex implements
$design = npx @anthropic-ai/claude-code --print "Design a caching layer for src/api/"
$implementation = codex --quiet "Implement this design: $design"
```

3. **Create a PR** with Claude's review as context:
```powershell
# Include Claude's analysis in the PR description
gh pr create --title "refactor: improve auth architecture" `
  --body "## Architecture Review (Claude Code)`n`n$review"
```

## Best Practices

1. **Be specific** — Claude performs best with clear, detailed prompts
2. **Provide context** — Include relevant file contents, not just file paths
3. **Request structure** — Ask for JSON, numbered lists, or tables for parseable output
4. **Set scope** — Tell Claude which files/directories to focus on
5. **Chain with Copilot** — Use Copilot CLI to act on Claude's recommendations

## See Also

- [Delegate to Codex](delegate-to-codex.md) — Fast code generation
- [Agent Review Chain](agent-review-chain.md) — Multi-agent review pipeline
- [MCP Bridge Pattern](../patterns/mcp-bridge.md) — Type-safe integration
- [Architecture Review Example](../examples/architecture-review.md) — Full walkthrough
