# Skill: Parallel Agents

> **When:** Multiple independent tasks, speed is critical, or you need multiple perspectives simultaneously

## Overview

Run multiple AI agents in parallel to maximize throughput. Copilot CLI can launch background agents, use Fleet mode for parallel sub-agents, or spawn OS-level parallel processes.

## Method 1: Copilot CLI Background Agents

Copilot CLI's `task` tool supports background agents that run independently:

```text
You: "I need to do three things at once:
      1. Generate unit tests for src/services/
      2. Review src/auth/ for security issues  
      3. Create API documentation for src/routes/"

Copilot CLI launches three background agents:
  → Agent 1 (task): Generate tests
  → Agent 2 (task): Security review  
  → Agent 3 (task): Documentation
  
Results are collected when all agents complete.
```

### Using explore Agents in Parallel

```text
# Copilot CLI can launch multiple explore agents simultaneously:
# These are safe to parallelize and run on the fast Haiku model

Agent 1: "Find all authentication-related files and explain the auth flow"
Agent 2: "List all API endpoints and their HTTP methods"  
Agent 3: "Identify all database models and their relationships"

# All three run in parallel, results returned together
```

### Using Fleet Mode

```text
# For highly parallelizable implementation work, Copilot CLI offers
# autopilot_fleet mode that distributes work across multiple agents:

Copilot CLI creates todos:
  - todo-1: "Add validation to user endpoints"
  - todo-2: "Add validation to product endpoints"
  - todo-3: "Add validation to order endpoints"

Fleet mode assigns each todo to a separate agent, all running simultaneously.
```

## Method 2: OS-Level Parallel Processes

### PowerShell Jobs

```powershell
# Launch three AI agents as parallel background jobs
$jobs = @()

# Agent 1: Claude Code — Architecture review
$jobs += Start-Job -Name "claude-arch" -ScriptBlock {
    claude -p `
      "Review the architecture of src/ for scalability issues. Output JSON."
}

# Agent 2: Codex CLI — Generate tests
$jobs += Start-Job -Name "codex-tests" -ScriptBlock {
    codex exec --skip-git-repo-check "Generate comprehensive unit tests for src/services/user.ts"
}

# Agent 3: Antigravity CLI (`agy`) — Performance analysis
$jobs += Start-Job -Name "agy-perf" -ScriptBlock {
    agy -p "Analyze src/ for performance bottlenecks. Focus on database queries."
}

Write-Host "⏳ Running 3 agents in parallel..."

# Wait for all to complete
$jobs | Wait-Job

# Collect results
$results = @{}
foreach ($job in $jobs) {
    $results[$job.Name] = $job | Receive-Job
    Write-Host "✅ $($job.Name) completed"
}

# Use results
Write-Host "`n=== Architecture Review (Claude) ===" 
Write-Output $results["claude-arch"]

Write-Host "`n=== Generated Tests (Codex) ==="
Write-Output $results["codex-tests"]

Write-Host "`n=== Performance Analysis (Antigravity) ==="
Write-Output $results["agy-perf"]

# Cleanup
$jobs | Remove-Job
```

### Bash Background Processes

```bash
#!/bin/bash
# Launch three AI agents in parallel

WORKDIR=".parallel/$(date +%s)"
mkdir -p "$WORKDIR"

echo "⏳ Running 3 agents in parallel..."

# Agent 1: Claude Code — Architecture review
claude -p \
  "Review the architecture of src/ for scalability issues" \
  > "$WORKDIR/claude-arch.txt" 2>&1 &
PID_CLAUDE=$!

# Agent 2: Codex CLI — Generate tests  
codex exec --skip-git-repo-check \
  "Generate unit tests for src/services/user.ts" \
  > "$WORKDIR/codex-tests.txt" 2>&1 &
PID_CODEX=$!

# Agent 3: Antigravity CLI (`agy`) — Performance analysis
agy -p \
  "Analyze src/ for performance bottlenecks" \
  > "$WORKDIR/agy-perf.txt" 2>&1 &
PID_AGY=$!

# Wait for all agents
wait $PID_CLAUDE && echo "✅ Claude completed" || echo "❌ Claude failed"
wait $PID_CODEX && echo "✅ Codex completed" || echo "❌ Codex failed"  
wait $PID_AGY && echo "✅ Antigravity completed" || echo "❌ Antigravity failed"

echo ""
echo "=== Results ==="
for f in "$WORKDIR"/*.txt; do
  echo "--- $(basename $f) ---"
  cat "$f"
  echo ""
done
```

## Method 3: Parallel Review (Multiple Perspectives)

Get different perspectives on the same code simultaneously:

```powershell
# Ask the same question to three different AIs
$question = "Review src/middleware/auth.ts for security vulnerabilities"

$claude = Start-Job { claude -p $using:question }
$codex = Start-Job { codex exec --skip-git-repo-check $using:question }
$agy = Start-Job { agy -p $using:question }

$claude, $codex, $agy | Wait-Job

$results = @{
    claude = $claude | Receive-Job
    codex = $codex | Receive-Job
    agy = $agy | Receive-Job
}

# Synthesize: use Claude to merge all perspectives
$synthesis = claude -p @"
Three AI agents reviewed the same auth middleware. Synthesize their findings:

Claude's review:
$($results.claude)

Codex's review:
$($results.codex)

Antigravity's review:
$($results.agy)

Combine all valid findings. Note where agents agree (high confidence) 
and where they disagree (needs human review). Prioritize by severity.
"@

Write-Output $synthesis
```

## Collecting and Merging Results

### Simple Merge (Concatenation)

```powershell
# When agents produce independent, non-overlapping output
$allTests = @()
$allTests += codex exec --skip-git-repo-check "Generate tests for src/services/auth.ts"
$allTests += codex exec --skip-git-repo-check "Generate tests for src/services/user.ts"
$allTests += codex exec --skip-git-repo-check "Generate tests for src/services/order.ts"

$allTests | Out-File tests/generated-tests.ts
```

### Intelligent Merge (AI-Assisted)

```powershell
# When agents produce overlapping or conflicting output
$implementations = @{
    codex = codex exec --skip-git-repo-check "Implement a rate limiter"
    claude = claude -p "Implement a rate limiter"
}

# Use Claude to pick the best parts from each
$merged = claude -p @"
Two implementations of a rate limiter were generated. 
Create the best version by combining the strengths of each:

Implementation A (Codex - optimized for speed):
$($implementations.codex)

Implementation B (Claude - optimized for correctness):
$($implementations.claude)

Output only the merged implementation.
"@
```

### Conflict Resolution

```powershell
# When agents disagree, present options to the user
$reviews = @{
    claude = "This function is safe" 
    agy = "This function has a potential race condition"
}

# Check if there's a conflict
if ($reviews.claude -match "safe" -and $reviews.agy -match "race condition") {
    Write-Host "⚠️  Agents disagree on safety:"
    Write-Host "  Claude: $($reviews.claude)"
    Write-Host "  Antigravity: $($reviews.agy)"
    Write-Host ""
    Write-Host "  Recommendation: Investigate the race condition (err on side of caution)"
}
```

## Performance Tips

1. **Launch all agents at the same time** — Don't wait for one to finish before starting others
2. **Use the fastest agent for time-sensitive tasks** — Codex is typically fastest for code generation
3. **Set timeouts** — Don't let one slow agent block the entire workflow
4. **Use file-based output** — Avoids stdout interleaving issues
5. **Batch related work** — One Codex call for 5 files is faster than 5 separate calls

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Dramatically faster than sequential | ❌ Higher resource usage |
| ✅ Multiple perspectives at once | ❌ Result merging can be complex |
| ✅ Agents don't block each other | ❌ Error handling more difficult |
| ✅ Natural fit for independent tasks | ❌ API rate limits may apply |
| ✅ Scales with available agents | ❌ Debugging parallel issues is harder |

## See Also

- [Agent Council](../patterns/agent-council.md) — Parallel agents with consensus
- [Agent Review Chain](agent-review-chain.md) — Sequential multi-agent pipeline
- [Pipeline Pattern](../patterns/pipeline.md) — Sequential alternative
