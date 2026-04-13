# Skill: Agent Review Chain

> **When:** Code needs multi-perspective review before shipping — implementation, architecture, performance, and GitHub integration

## Overview

The Agent Review Chain passes code through a series of specialist AI agents, each adding their expertise. Like a code review gauntlet, the output of one agent feeds into the next.

```text
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Codex   │ ──► │  Claude  │ ──► │  Gemini  │ ──► │ Copilot  │
│ Implement│     │ Review   │     │ Perf     │     │ Ship     │
│          │     │ Arch     │     │ Review   │     │ PR       │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
   Stage 1          Stage 2          Stage 3          Stage 4
```

## The Four Stages

### Stage 1: Implementation (Codex CLI)

Codex generates the initial implementation from a specification.

```powershell
# Stage 1: Codex implements the feature
$spec = @"
Implement a rate limiting middleware for Express with:
- Sliding window algorithm using Redis
- Configurable limits per route
- Custom response headers (X-RateLimit-Limit, X-RateLimit-Remaining)
- IP-based and API-key-based limiting
- Bypass list for trusted IPs
- TypeScript with full type safety
"@

$implementation = codex --quiet --approval-mode suggest $spec

# Save checkpoint
$implementation | Out-File .review-chain/01-implementation.ts -Encoding utf8
Write-Host "✅ Stage 1: Implementation complete"
```

### Stage 2: Architecture Review (Claude Code)

Claude reviews the implementation for architectural correctness and security.

```powershell
# Stage 2: Claude reviews architecture and security
$code = Get-Content .review-chain/01-implementation.ts -Raw

$archReview = npx @anthropic-ai/claude-code --print @"
You are a senior architect reviewing a rate limiting middleware.

## Code to Review
$code

## Review Checklist
1. **Architecture**: Is the separation of concerns correct? Are dependencies properly injected?
2. **Security**: Are there bypass vulnerabilities? Can limits be circumvented?
3. **Error Handling**: Are all failure modes covered? What happens if Redis is down?
4. **Type Safety**: Are TypeScript types complete and correct?
5. **Edge Cases**: Empty inputs, concurrent requests, clock skew?

## Output Format
{
  "approved": true/false,
  "score": 1-10,
  "issues": [
    {"severity": "critical|high|medium|low", "category": "security|architecture|correctness", 
     "description": "...", "location": "line/function", "fix": "suggested fix"}
  ],
  "strengths": ["what's good about this code"],
  "recommendations": ["improvements even if approved"]
}

Output ONLY valid JSON.
"@

$archReview | Out-File .review-chain/02-arch-review.json -Encoding utf8

# Check if fixes are needed
$review = $archReview | ConvertFrom-Json
if (-not $review.approved) {
    Write-Host "❌ Stage 2: Architecture review found issues — requesting fixes"
    
    # Send issues back to Codex for fixes
    $fixPrompt = "Fix these issues in the rate limiter: $($review.issues | ConvertTo-Json -Compress)"
    $fixedCode = codex --quiet $fixPrompt
    $fixedCode | Out-File .review-chain/01-implementation-v2.ts -Encoding utf8
    
    # Re-review (recursive until approved or max iterations)
} else {
    Write-Host "✅ Stage 2: Architecture review passed (score: $($review.score)/10)"
}
```

### Stage 3: Performance Review (Gemini CLI)

Gemini analyzes the implementation for performance characteristics.

```powershell
# Stage 3: Gemini reviews performance
$code = Get-Content .review-chain/01-implementation.ts -Raw

$perfReview = gemini --prompt @"
Analyze this rate limiting middleware for performance:

$code

Evaluate:
1. **Time Complexity**: O(?) for each operation (check, increment, reset)
2. **Memory Usage**: How does memory scale with number of clients?
3. **Redis Round Trips**: How many Redis calls per request? Can they be pipelined?
4. **Concurrency**: Race conditions under high load? Atomic operations?
5. **Hot Path**: What's the fastest path for an allowed request?

Provide specific optimization suggestions with expected improvement.
"@

$perfReview | Out-File .review-chain/03-perf-review.txt -Encoding utf8
Write-Host "✅ Stage 3: Performance review complete"
```

### Stage 4: Ship via GitHub (Copilot CLI)

Copilot CLI creates the branch, commits, and opens a PR with all review context.

```powershell
# Stage 4: Copilot ships it
$archReview = Get-Content .review-chain/02-arch-review.json -Raw
$perfReview = Get-Content .review-chain/03-perf-review.txt -Raw

# Create branch and commit
git checkout -b feat/rate-limiter
Copy-Item .review-chain/01-implementation.ts src/middleware/rate-limiter.ts
git add src/middleware/rate-limiter.ts
git commit -m "feat: add sliding window rate limiter

- Redis-based sliding window algorithm
- Configurable per-route limits
- IP and API-key based limiting
- Full TypeScript types

Co-authored-by: Codex <codex@openai.com>
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Create PR with review context
$prBody = @"
## Rate Limiting Middleware

### Implementation (Codex CLI)
Sliding window rate limiter with Redis backend, configurable per-route limits.

### Architecture Review (Claude Code)
$archReview

### Performance Review (Gemini CLI)  
$perfReview

### Review Chain
- [x] Implementation (Codex CLI)
- [x] Architecture & Security Review (Claude Code)
- [x] Performance Review (Gemini CLI)
- [x] PR Creation (Copilot CLI)
"@

gh pr create --title "feat: add sliding window rate limiter" --body $prBody
Write-Host "✅ Stage 4: PR created"
```

## Complete Script

Here's the full review chain as a reusable script:

```powershell
#!/usr/bin/env pwsh
# review-chain.ps1 — Multi-agent review chain

param(
    [Parameter(Mandatory)]
    [string]$Spec,
    
    [string]$OutputDir = ".review-chain",
    [int]$MaxFixIterations = 3
)

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# ─── Stage 1: Implementation (Codex) ───
Write-Host "`n🔨 Stage 1/4: Implementation (Codex CLI)" -ForegroundColor Green
$code = codex --quiet --approval-mode suggest $Spec
$code | Out-File "$OutputDir/implementation.ts" -Encoding utf8

# ─── Stage 2: Architecture Review (Claude) ───
Write-Host "🏗️  Stage 2/4: Architecture Review (Claude Code)" -ForegroundColor Cyan

$iteration = 0
$approved = $false

while (-not $approved -and $iteration -lt $MaxFixIterations) {
    $currentCode = Get-Content "$OutputDir/implementation.ts" -Raw
    
    $reviewJson = npx @anthropic-ai/claude-code --print @"
Review this code for architecture and security issues. Output JSON:
{"approved": bool, "score": 1-10, "issues": [{"severity": "...", "description": "...", "fix": "..."}]}

Code:
$currentCode
"@
    
    $reviewJson | Out-File "$OutputDir/arch-review-$iteration.json" -Encoding utf8
    
    try {
        $review = $reviewJson | ConvertFrom-Json
        if ($review.approved) {
            $approved = $true
            Write-Host "   ✅ Approved (score: $($review.score)/10)"
        } else {
            $iteration++
            Write-Host "   ⚠️  Issues found (iteration $iteration/$MaxFixIterations)"
            $fixes = codex --quiet "Fix these issues: $($review.issues | ConvertTo-Json -Compress)"
            $fixes | Out-File "$OutputDir/implementation.ts" -Encoding utf8
        }
    } catch {
        Write-Warning "   Could not parse review JSON, treating as approved"
        $approved = $true
    }
}

# ─── Stage 3: Performance Review (Gemini) ───
Write-Host "⚡ Stage 3/4: Performance Review (Gemini CLI)" -ForegroundColor Yellow
$currentCode = Get-Content "$OutputDir/implementation.ts" -Raw

$perfReview = gemini --prompt "Analyze performance of this code. List optimizations: $currentCode" 2>$null
if ($perfReview) {
    $perfReview | Out-File "$OutputDir/perf-review.txt" -Encoding utf8
    Write-Host "   ✅ Performance review complete"
} else {
    Write-Host "   ⏭️  Gemini not available, skipping performance review"
}

# ─── Stage 4: Ship (Copilot/GitHub) ───
Write-Host "🚀 Stage 4/4: Ready to Ship" -ForegroundColor Magenta
Write-Host "   Artifacts in $OutputDir/"
Write-Host "   Run: gh pr create --fill"
```

## Customizing the Chain

### Add a Stage

```powershell
# Add documentation generation after implementation
# Insert between Stage 1 and Stage 2

$docs = codex --quiet "Generate JSDoc documentation for: $(Get-Content $codeFile -Raw)"
$docs | Out-File "$OutputDir/documentation.md"
```

### Skip a Stage

```powershell
# Skip performance review for non-critical code
if ($Critical) {
    # Run full chain
} else {
    # Skip Stage 3 (Gemini perf review)
}
```

### Change Agent Assignments

```powershell
# Use Claude for implementation (complex reasoning task)
# Use Codex for review (fast pattern matching)
# Swap roles based on task characteristics
```

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Multiple expert perspectives | ❌ Sequential = slower total time |
| ✅ Issues caught early in chain | ❌ Later stages depend on earlier ones |
| ✅ Clear audit trail | ❌ Each stage adds latency |
| ✅ Iterative fixing built in | ❌ Complex error propagation |
| ✅ Reproducible via scripts | ❌ API costs for multi-agent runs |

## See Also

- [Parallel Agents](parallel-agents.md) — Run stages simultaneously instead
- [Pipeline Pattern](../patterns/pipeline.md) — The underlying orchestration pattern
- [Full Workflow Example](../examples/full-workflow.md) — Complete multi-AI workflow
- [Agent Council](../patterns/agent-council.md) — Parallel multi-agent decisions
