# Pattern 1: Direct Shell Invocation

> **Complexity: Low** | **Setup: None** | **Best for: Quick delegation, one-off tasks**

The simplest orchestration pattern. Copilot CLI spawns other AI CLIs as child processes, captures their output, and uses the results. No configuration, no servers — just shell commands.

## How It Works

```
┌──────────────┐     shell exec      ┌──────────────┐
│  Copilot CLI  │ ──────────────────► │  Codex CLI   │
│  (orchestrator)│ ◄──────────────── │  (worker)     │
│              │    stdout/stderr    │              │
└──────────────┘                     └──────────────┘
```

Copilot CLI uses its `powershell` tool to:
1. Execute another AI CLI with a specific prompt
2. Capture stdout (the AI's response)
3. Parse and use the result in its workflow

## PowerShell Examples

### Delegate Code Generation to Codex

```powershell
# Generate a function with Codex CLI
$result = codex --quiet "Generate a TypeScript function that validates 
  credit card numbers using the Luhn algorithm. Output only the code."

# Use the result in your workflow
$result | Out-File -FilePath src/validators/credit-card.ts

# Now Copilot can review, test, or commit the generated code
```

### Delegate Architecture Review to Claude Code

```powershell
# Send your codebase to Claude for deep analysis
$review = npx @anthropic-ai/claude-code --print `
  "Review the architecture of this project. Focus on:
   1. Separation of concerns
   2. Error handling patterns
   3. Scalability concerns
   Provide specific file references."

Write-Output $review
```

### Quick Analysis with Gemini

```powershell
# Use Gemini for performance analysis
$analysis = gemini --prompt "Analyze the performance characteristics 
  of the database queries in src/db/. Suggest index optimizations."

Write-Output $analysis
```

## Bash Examples

### Generate and Apply Code Changes

```bash
# Generate code with Codex, save to file
codex --quiet "Create a REST API middleware for rate limiting 
  using a sliding window algorithm in Node.js" > src/middleware/rate-limiter.js

# Have Claude review it
npx @anthropic-ai/claude-code --print \
  "Review src/middleware/rate-limiter.js for security issues" > review.txt

# Read the review and decide whether to keep or regenerate
cat review.txt
```

### Batch Processing with Multiple AI Tools

```bash
# Generate tests for multiple files using Codex
for file in src/services/*.ts; do
  codex --quiet "Write unit tests for $(cat $file)" > "tests/$(basename $file .ts).test.ts"
done

# Have Claude review all generated tests
npx @anthropic-ai/claude-code --print \
  "Review the test files in tests/ for completeness and edge cases"
```

## How to Use from Copilot CLI

Within a Copilot CLI session, you can orchestrate other AIs naturally:

```
You: "Use Codex to generate a Redis caching layer, then have Claude review it"

Copilot CLI will:
1. Run: codex "Generate a Redis caching layer for our API..."
2. Save the output to a file
3. Run: npx @anthropic-ai/claude-code --print "Review this caching implementation..."
4. Present both results to you
```

## Capturing Structured Output

For more reliable parsing, request structured output:

```powershell
# Ask for JSON output
$json = codex --quiet 'Generate a JSON schema for a User model with fields: 
  id, email, name, role, createdAt. Output valid JSON only.'

# Parse and use
$schema = $json | ConvertFrom-Json

# Verify it's valid
$schema | ConvertTo-Json -Depth 10
```

## Error Handling

```powershell
try {
    $result = codex --quiet "Generate authentication middleware"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Codex failed with exit code $LASTEXITCODE"
        # Fallback: try Claude instead
        $result = npx @anthropic-ai/claude-code --print "Generate authentication middleware"
    }
    Write-Output $result
} catch {
    Write-Error "AI delegation failed: $_"
}
```

## Timeout Management

```powershell
# Set a timeout for long-running AI operations
$job = Start-Job -ScriptBlock {
    codex --quiet "Analyze and refactor all services in src/services/"
}

$completed = $job | Wait-Job -Timeout 120

if ($completed) {
    $result = $job | Receive-Job
    Write-Output $result
} else {
    $job | Stop-Job
    Write-Warning "Codex timed out — task may be too complex for single invocation"
}
```

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Zero setup required | ❌ No shared context between calls |
| ✅ Works with any CLI tool | ❌ Each invocation starts fresh |
| ✅ Easy to understand and debug | ❌ Stdout parsing can be fragile |
| ✅ No dependencies beyond the AI CLIs | ❌ No type safety |
| ✅ Portable across platforms | ❌ Sequential by default |

## When to Use

- **Quick prototyping** — test multi-AI workflows before investing in MCP bridges
- **One-off tasks** — delegate a single complex task to a specialist AI
- **Simple pipelines** — chain 2-3 AI tools for a linear workflow
- **Learning** — understand how orchestration works before adding complexity

## When to Graduate

Move to [Pattern 2: MCP Bridge](mcp-bridge.md) when you need:
- Type-safe tool invocation
- Persistent connections (no cold-start overhead)
- Shared context between AI tools
- Production-ready reliability

## See Also

- [Pattern 2: MCP Bridge](mcp-bridge.md) — Next level of integration
- [Delegate to Codex](../skills/delegate-to-codex.md) — Reusable Codex delegation skill
- [Delegate to Claude](../skills/delegate-to-claude.md) — Reusable Claude delegation skill
