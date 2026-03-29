---
name: fan-out-parallel
type: fan-out
agents:
  - copilot
  - claude
  - codex
  - gemini
---

# Pattern: Fan-Out Parallel

> **Complexity: Medium** | **Setup: Minimal** | **Best for: Parallelizable independent subtasks**

The Fan-Out Parallel pattern distributes a single workload across multiple agents simultaneously. Unlike [Pipeline](pipeline.md) (sequential) or [Agent Council](agent-council.md) (consensus), fan-out sends **different independent subtasks** to agents in parallel and collects results.

## How It Works

```
                    ┌──────────────────────────────┐
                    │      Copilot CLI              │
                    │   (Orchestrator / Splitter)   │
                    └──────┬──────┬──────┬──────────┘
                           │      │      │
             ┌─────────────┘      │      └─────────────┐
             │                    │                    │
   ┌─────────▼──────┐  ┌─────────▼──────┐  ┌─────────▼──────┐
   │  Agent A        │  │  Agent B        │  │  Agent C        │
   │  subtask-1      │  │  subtask-2      │  │  subtask-3      │
   └─────────┬──────┘  └─────────┬──────┘  └─────────┬──────┘
             │                    │                    │
             └─────────────┐      │      ┌─────────────┘
                           ▼      ▼      ▼
                    ┌──────────────────────────────┐
                    │      Copilot CLI              │
                    │   (Collector / Aggregator)    │
                    └──────────────────────────────┘
```

## When to Use

- Tasks that can be split into **independent, non-overlapping subtasks**
- The same operation applied to **multiple targets** (files, modules, languages)
- Generating multiple versions of the same artifact for comparison
- Batch processing: translating docs, scanning modules, auditing files

**Do NOT use when:**
- Subtasks depend on each other's output → use [Pipeline](pipeline.md)
- You need a consensus decision → use [Agent Council](agent-council.md)

## Workflow

### 1. Split — Identify Independent Subtasks

Decompose the workload into chunks that can run in isolation:

```powershell
# Example: audit each module independently
$modules = Get-ChildItem src/ -Directory | Select-Object -ExpandProperty Name
# → ["auth", "api", "db", "workers"]
```

### 2. Fan Out — Dispatch in Parallel (PowerShell Jobs)

```powershell
# Fan-out using PowerShell background jobs
$jobs = @()

$jobs += Start-Job -Name "auth-review" {
    npx @anthropic-ai/claude-code --print `
      "Security review of the auth module. Identify vulnerabilities in: $(Get-Content src/auth/ -Raw)"
}

$jobs += Start-Job -Name "api-review" {
    codex --quiet `
      "Review src/api/ for missing input validation. List each endpoint and status."
}

$jobs += Start-Job -Name "db-review" {
    gemini --prompt `
      "Review src/db/ for N+1 query patterns and missing indexes."
}

# Wait for all
$jobs | Wait-Job | Out-Null

# Collect results
$results = @{}
foreach ($job in $jobs) {
    $results[$job.Name] = $job | Receive-Job
    $job | Remove-Job
}
```

### 3. Fan Out — Multiple Targets, Same Task

Apply the same prompt to N targets:

```powershell
# Translate docs into multiple languages simultaneously
$languages = @("ko", "ja", "de", "fr")
$jobs = @()

foreach ($lang in $languages) {
    $jobs += Start-Job -Name "translate-$lang" -ArgumentList $lang {
        param($targetLang)
        $source = Get-Content docs/README.md -Raw
        gemini --prompt "Translate this Markdown to $targetLang. Preserve all code blocks. Output only the translated text.`n`n$source"
    }
}

$jobs | Wait-Job | Out-Null

foreach ($job in $jobs) {
    $lang = $job.Name.Replace("translate-", "")
    $job | Receive-Job | Set-Content "docs/README.$lang.md"
    $job | Remove-Job
    Write-Host "✅ docs/README.$lang.md written"
}
```

### 4. Collect — Aggregate Results

```powershell
# Combine all review results into a single report
$report = @"
# Parallel Security Review Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm")

"@

foreach ($key in $results.Keys | Sort-Object) {
    $report += "## $key`n`n$($results[$key])`n`n---`n`n"
}

$report | Set-Content ".review/parallel-report.md"
Write-Host "📄 Report: .review/parallel-report.md"
```

### 5. Synthesize (Optional)

For summaries or conflict detection, pass collected results to a synthesizer:

```powershell
$allFindings = $results.Values -join "`n---`n"

$summary = npx @anthropic-ai/claude-code --print @"
These are security reviews from multiple agents covering different modules:

$allFindings

Synthesize into a prioritized list of findings across all modules.
Group by: CRITICAL / HIGH / MEDIUM / LOW.
Deduplicate similar findings.
"@

$summary | Set-Content ".review/summary.md"
```

## Use Cases

### Use Case A: Parallel File Translation

```powershell
# Translate all Markdown docs in parallel
$docs = Get-ChildItem docs/ -Filter "*.md" | Where-Object { $_.Name -notmatch "\.ko\." }

$jobs = foreach ($doc in $docs) {
    Start-Job -Name $doc.BaseName -ArgumentList $doc.FullName {
        param($path)
        $content = Get-Content $path -Raw
        gemini --prompt "Translate to Korean. Preserve all code blocks and frontmatter.`n`n$content"
    }
}

$jobs | Wait-Job | ForEach-Object {
    $outPath = $_.Name + ".ko.md"
    $_ | Receive-Job | Set-Content "docs/$outPath"
    $_ | Remove-Job
    Write-Host "✅ $outPath"
}
```

### Use Case B: Multi-Model Code Generation Comparison

```powershell
# Generate the same component with 3 agents, compare outputs
$prompt = "Write a TypeScript function that validates an email address. Include JSDoc."

$claude  = Start-Job { npx @anthropic-ai/claude-code --print $using:prompt }
$codex   = Start-Job { codex --quiet $using:prompt }
$gemini  = Start-Job { gemini --prompt $using:prompt }

@($claude, $codex, $gemini) | Wait-Job | Out-Null

$claude_out  = $claude  | Receive-Job; $claude  | Remove-Job
$codex_out   = $codex   | Receive-Job; $codex   | Remove-Job
$gemini_out  = $gemini  | Receive-Job; $gemini  | Remove-Job

# Present all 3 for human selection or Claude synthesis
npx @anthropic-ai/claude-code --print @"
Three agents wrote an email validator. Pick the best one, explaining why.

[Claude]: $claude_out

[Codex]: $codex_out

[Gemini]: $gemini_out
"@
```

### Use Case C: Batch Module Audit

```powershell
# Audit every service in src/services/ independently
$services = Get-ChildItem src/services/ -Directory

$jobs = foreach ($svc in $services) {
    $name = $svc.Name
    $content = Get-ChildItem $svc.FullName -Filter "*.ts" |
                ForEach-Object { Get-Content $_.FullName -Raw } |
                Out-String
    Start-Job -Name $name -ArgumentList $name, $content {
        param($svcName, $svcContent)
        npx @anthropic-ai/claude-code --print @"
Audit the '$svcName' service. Report:
1. Missing error handling
2. Unvalidated inputs
3. Missing tests (check for *.test.ts references)

Service code:
$svcContent
"@
    }
}

$jobs | Wait-Job | ForEach-Object {
    Write-Host "`n## $($_.Name)" -ForegroundColor Cyan
    $_ | Receive-Job | Write-Host
    $_ | Remove-Job
}
```

## Output Format

Each agent produces independent output. The aggregator collects them:

```
## parallel-review-report.md

### auth-review (Claude)
[STATUS: CONCERN]
- Missing rate limiting on /auth/login
- JWT secret read from env but not validated at startup

### api-review (Codex)
[STATUS: PASS]
- All endpoints have input validation via Zod
- Error responses sanitized

### db-review (Gemini)
[STATUS: BLOCK]
- N+1 query in getUserWithOrders() — line 42
- Missing index on users.email
```

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Maximizes throughput (parallel execution) | ❌ Results are unordered — need aggregation step |
| ✅ Scales linearly with agent count | ❌ Each subtask must be truly independent |
| ✅ Each agent uses full context for its subtask | ❌ PowerShell job overhead adds latency for tiny tasks |
| ✅ No inter-agent communication needed | ❌ Cost scales with agent count |
| ✅ Simple to add/remove agents | |

## See Also

- [Pattern: Pipeline](pipeline.md) — Sequential chaining when subtasks depend on each other
- [Pattern: Agent Council](agent-council.md) — All agents answer the same question for consensus
- [Skill: pr-multi-perspective-review](../../skills/development/pr-multi-perspective-review/SKILL.md) — Fan-out applied to PR review (6 lenses in parallel)
- [Orchestration Guide](../../guides/the-orchestration-guide.md) — Full orchestration overview
