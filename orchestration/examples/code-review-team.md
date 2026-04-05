# Example: Parallel Code Review Team (5 Specialists)

> **Scenario:** A PR arrives touching authentication (security), performance-critical database paths, and React UI components (UX). Copilot CLI acts as the root orchestrator and assembles a **5-specialist parallel review team**.

## The Setup

The PR diff includes:

- **Auth code** (security concern): login/session/JWT/middleware
- **Database queries** (performance concern): ORM calls, SQL, repositories (risk of N+1)
- **React components** (UX concern): behavior changes, accessibility regressions

## Step 1 — Root Orchestrator Triage (Copilot CLI)

Copilot CLI first determines *what changed* and which specialists are needed.

```powershell
# Identify PR and fetch metadata
$PR = 123
$files = gh pr view $PR --json files -q '.files[].path'

# Classify file paths (tune patterns to your repo)
$authFiles = $files | Where-Object { $_ -match '(?i)(^src/auth/|auth|login|session|jwt|middleware/auth)' }
$dbFiles   = $files | Where-Object { $_ -match '(?i)(db|database|repository|dao|prisma|sql|models|queries)' }
$uiFiles   = $files | Where-Object { $_ -match '(?i)\.(tsx|jsx|css|scss)$' -or $_ -match '(?i)(^src/components/|^ui/)' }

$needUx = ($uiFiles.Count -gt 0)

Write-Host "Auth files: $($authFiles.Count) | DB files: $($dbFiles.Count) | UI files: $($uiFiles.Count)"
Write-Host "UX reviewer needed: $needUx"
```

## Step 2 — Dispatch 5 Specialists in Parallel (Start-Job)

Key principle: **each specialist receives only the relevant diff sections**, not the full PR.

### 2A) Fetch the diff and split it by file

```powershell
$fullPatch = gh pr diff $PR --patch

function Split-DiffByFile {
    param([Parameter(Mandatory)] [string]$Patch)

    $byFile = @{}
    $current = $null

    foreach ($line in ($Patch -split "`n")) {
        if ($line -match '^diff --git a/(.+?) b/(.+)$') {
            $current = $matches[2]
            $byFile[$current] = @($line)
            continue
        }

        if ($null -ne $current) {
            $byFile[$current] += $line
        }
    }

    # Convert arrays to strings
    foreach ($k in @($byFile.Keys)) {
        $byFile[$k] = ($byFile[$k] -join "`n")
    }

    return $byFile
}

$diffByFile = Split-DiffByFile -Patch $fullPatch
```

### 2B) Build filtered diffs per specialist

```powershell
function Get-FilteredDiff {
    param(
        [hashtable]$DiffByFile,
        [string[]]$Paths
    )

    $Paths | Where-Object { $DiffByFile.ContainsKey($_) } | ForEach-Object {
        "=== DIFF FILE: $_ ===`n$($DiffByFile[$_])"
    } | Out-String
}

$securityDiff = Get-FilteredDiff -DiffByFile $diffByFile -Paths $authFiles
$perfDiff     = Get-FilteredDiff -DiffByFile $diffByFile -Paths $dbFiles
$uxDiff       = Get-FilteredDiff -DiffByFile $diffByFile -Paths $uiFiles

# Architecture + Style typically need broader context, but still can avoid unrelated files.
# Example: exclude docs/vendor/generated artifacts.
$nonNoiseFiles = $files | Where-Object { $_ -notmatch '(?i)^(docs/|vendor/|dist/)' }
$archDiff  = Get-FilteredDiff -DiffByFile $diffByFile -Paths $nonNoiseFiles
$styleDiff = Get-FilteredDiff -DiffByFile $diffByFile -Paths $nonNoiseFiles
```

### 2C) Start jobs (5 specialists)

Below, each job runs an LLM-driven reviewer (you can swap tools/commands to match your org).

```powershell
$jobs = @()

# 1) Security analyst — auth/injection/secrets
$jobs += Start-Job -Name "security" -ScriptBlock {
    param($diff)
    npx @anthropic-ai/claude-code --print @"
You are a security code reviewer.

Review ONLY the diff below. Focus on:
- Authentication/authorization bypass
- Injection risks (SQL/ORM, command injection)
- Secret leakage, token handling, logging sensitive data
- Session fixation, CSRF, SSRF

Output format:
- [BLOCK] ...
- [CONCERN] ...
- [PASS] ...

DIFF:
$diff
"@
} -ArgumentList $securityDiff

# 2) Performance analyst — N+1, complexity
$jobs += Start-Job -Name "performance" -ScriptBlock {
    param($diff)
    npx @anthropic-ai/claude-code --print @"
You are a performance code reviewer.

Review ONLY the diff below. Focus on:
- N+1 query patterns
- Missing indexes / unbounded queries
- Algorithmic complexity regressions
- Hot-path allocations and repeated work

Tag findings as [BLOCK]/[CONCERN]/[PASS].

DIFF:
$diff
"@
} -ArgumentList $perfDiff

# 3) Architecture reviewer — coupling, SOLID, layering
$jobs += Start-Job -Name "architecture" -ScriptBlock {
    param($diff)
    npx @anthropic-ai/claude-code --print @"
You are an architecture reviewer.

Review ONLY the diff below. Focus on:
- Unnecessary coupling / cross-layer leakage
- SOLID violations, circular dependencies
- Boundary erosion (UI calling data access, etc.)
- Changes that increase future migration costs

Tag findings as [BLOCK]/[CONCERN]/[PASS].

DIFF:
$diff
"@
} -ArgumentList $archDiff

# 4) Style inspector — conventions, naming, dead code
$jobs += Start-Job -Name "style" -ScriptBlock {
    param($diff)
    codex --quiet --approval-mode never @"
You are a style and maintainability reviewer.

Review ONLY the diff below. Focus on:
- Naming clarity and consistency
- Dead code / unused parameters
- Overly complex conditionals
- Missing error handling patterns / inconsistent conventions

Output with [BLOCK]/[CONCERN]/[PASS] tags.

DIFF:
$diff
"@
} -ArgumentList $styleDiff

# 5) UX reviewer — conditional: only if UI files touched
if ($using:needUx) {
    $jobs += Start-Job -Name "ux" -ScriptBlock {
        param($diff)
        npx @anthropic-ai/claude-code --print @"
You are a UX and accessibility reviewer.

Review ONLY the diff below. Focus on:
- Component behavior regressions
- Keyboard navigation and focus management
- ARIA usage, color contrast, semantic HTML
- Error states, loading states, empty states

Tag findings as [BLOCK]/[CONCERN]/[PASS].

DIFF:
$diff
"@
    } -ArgumentList $uxDiff
}

Write-Host "Dispatched jobs: $($jobs.Name -join ', ')"
```

## Step 3 — Wait, Collect, and Handle [ERROR]/[TIMEOUT]

```powershell
$timeoutSeconds = 180
$null = Wait-Job -Job $jobs -Timeout $timeoutSeconds

$results = @()

# TIMEOUT handling
$timedOut = $jobs | Where-Object { $_.State -eq 'Running' }
foreach ($j in $timedOut) {
    $results += "[TIMEOUT] $($j.Name): exceeded ${timeoutSeconds}s"
    Stop-Job $j
}

# ERROR handling + output collection
$finished = $jobs | Where-Object { $_.State -ne 'Running' }
foreach ($j in $finished) {
    try {
        $out = Receive-Job $j -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($out)) {
            $results += "[ERROR] $($j.Name): empty output"
        } else {
            $results += "=== RESULT: $($j.Name) ===`n$out"
        }
    } catch {
        $results += "[ERROR] $($j.Name): $($_.Exception.Message)"
    }
}

Remove-Job -Job $jobs -Force
```

## Step 4 — Synthesizer Consolidates and Prioritizes

A dedicated synthesizer agent merges findings, removes duplicates, and prioritizes by severity.

```powershell
$joined = ($results -join "`n`n")

$synthesis = npx @anthropic-ai/claude-code --print @"
You are the review synthesizer.

Input: multiple specialist reviews. Produce ONE consolidated review.

Requirements:
1. Deduplicate overlapping findings.
2. Group by severity: [BLOCK] then [CONCERN] then [PASS].
3. For each item, include: area (security/perf/arch/style/ux), file(s), and a concrete fix suggestion.
4. Keep it concise.

Specialist outputs:
$joined
"@
```

## Step 5 — Post Consolidated Review to the PR

```powershell
gh pr review $PR --comment --body $synthesis
Write-Host "✅ Posted consolidated review comment to PR #$PR"
```
