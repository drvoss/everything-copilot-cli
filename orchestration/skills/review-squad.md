# Orchestration Skill: Review Squad

## Which Review Skill to Use?

There are four review options in this repo. Choose based on artifact size and depth needed:

```
Which review skill?
  ├─ Quick review, single session, cost-sensitive?
  │   → skills/development/code-review/SKILL.md
  ├─ PR with 6 perspectives (PM/Dev/QA/Security/DevOps/UX)?
  │   → skills/development/pr-multi-perspective-review/SKILL.md
  ├─ Non-PR artifact (RFC, schema, architecture doc)?
  │   → orchestration/patterns/review-trio.md
  └─ Large PR (200+ lines), need deep parallel specialist review?
      → orchestration/skills/review-squad.md  ← (you are here)
```

> **When to use this vs `pr-multi-perspective-review`:**
> - Use `pr-multi-perspective-review` for: quick reviews, single session, lower token cost
> - Use Review Squad for: large PRs, when specialist depth matters, true parallel context isolation

This orchestration skill runs a **true multi-agent parallel review** where each specialist operates in an **isolated context** and returns a focused report. A final **Synthesizer** merges results into a single GitHub-ready PR comment.

## Specialists

| Specialist | Focus | Invocation |
|---|---|---|
| Security Analyst | Auth, injection, secrets, OWASP | `task` — `code-review` agent type |
| Performance Analyst | N+1 queries, O(n²), memory allocs | `task` — `explore` agent type |
| Architecture Reviewer | Coupling, SOLID, module boundaries | `task` — `general-purpose` agent type |
| Style Inspector | Conventions, naming, dead code, lint | `task` — `task` agent type |
| UX Reviewer | Component behavior, accessibility | `task` — `explore` agent type (conditional) |

### Specialist report contract

Ask each specialist to return:

- **Top findings** (bulleted)
- **Suggested fixes** (actionable)
- **Severity per finding**: `[BLOCK]` / `[CONCERN]` / `[PASS]` (use `[PASS]` only when explicitly checking and finding no issues)
- **Evidence**: file paths + line references when possible

## Synthesizer

A separate agent that:

- Collects all 5 reports
- Deduplicates overlapping findings
- Assigns final severity: `[BLOCK]` / `[CONCERN]` / `[PASS]`
- Outputs as a markdown table suitable for a GitHub PR comment

### Output format (PR comment)

The Synthesizer should output a single table:

| Severity | Area | Finding | Evidence | Suggested Fix |
|---|---|---|---|---|
| [BLOCK] | Security | ... | `src/auth.ts:42` | ... |

## Implementation

PowerShell implementation using `Start-Job` for parallel dispatch.

### Notes

- This script assumes you are in a git repo and the PR is available via `gh`.
- It uses:
  - `gh pr diff` to fetch the diff
  - `gh copilot suggest` to run each specialist prompt (in parallel)
  - `gh pr review --comment` to post the consolidated report
- The UX reviewer is **conditional**: run only when the diff includes UI-facing files.

### PowerShell script

```powershell
# Review Squad: parallel multi-agent PR review
# Prereqs: GitHub CLI logged in, Copilot enabled: gh auth status

param(
  [Parameter(Mandatory=$false)]
  [string]$Pr = "@",

  [Parameter(Mandatory=$false)]
  [int]$TimeoutSeconds = 180
)

$ErrorActionPreference = 'Stop'

# 1) Gather diff and basic file lists
$diff = gh pr diff $Pr

# Heuristic UI files; tune per repo conventions
$uiFiles = @(
  $diff -split "`n" |
    Where-Object { $_ -match '^\+\+\+ b/' } |
    ForEach-Object { $_ -replace '^\+\+\+ b/', '' } |
    Where-Object { $_ -match '\.(tsx|jsx|vue|svelte|html|css|scss)$' }
) | Select-Object -Unique

# Helper: run gh copilot suggest in a job
function Start-ReviewJob {
  param(
    [Parameter(Mandatory=$true)][string]$Name,
    [Parameter(Mandatory=$true)][string]$SystemRole,
    [Parameter(Mandatory=$true)][string]$Focus,
    [Parameter(Mandatory=$true)][string]$AgentHint,
    [Parameter(Mandatory=$true)][string]$Diff
  )

  $prompt = @"
You are the $SystemRole in a parallel PR review squad.

Focus:
- $Focus

Constraints:
- Provide only substantive findings.
- Include file paths + line references when possible.
- Severity must be one of: [BLOCK] / [CONCERN] / [PASS].

Return format:
- Summary (1-2 lines)
- Findings (bulleted), each with Severity + Evidence + Suggested fix

Context:
- This is a multi-agent review; your output will be synthesized with other specialists.
- Invocation hint (for orchestrator documentation): $AgentHint

PR diff:
$Diff
"@

  Start-Job -Name $Name -ScriptBlock {
    param($p)
    # NOTE: gh copilot suggest is interactive by default and --no-interactive is not an
    # officially documented flag. This script is illustrative.
    # Preferred: run review-squad INSIDE a Copilot CLI session using the task tool.
    # Outside a session, check `gh copilot suggest --help` for supported flags in your version.
    gh copilot suggest "$p"
  } -ArgumentList $prompt
}

# 2) Dispatch specialists in parallel
$jobs = @()

$jobs += Start-ReviewJob -Name 'security' -SystemRole 'Security Analyst' -Focus 'Auth, injection, secrets, OWASP' -AgentHint 'task — code-review agent type' -Diff $diff
$jobs += Start-ReviewJob -Name 'performance' -SystemRole 'Performance Analyst' -Focus 'N+1 queries, O(n^2), memory allocs' -AgentHint 'task — explore agent type' -Diff $diff
$jobs += Start-ReviewJob -Name 'architecture' -SystemRole 'Architecture Reviewer' -Focus 'Coupling, SOLID, module boundaries' -AgentHint 'task — general-purpose agent type' -Diff $diff
$jobs += Start-ReviewJob -Name 'style' -SystemRole 'Style Inspector' -Focus 'Conventions, naming, dead code, lint' -AgentHint 'task — task agent type' -Diff $diff

if ($uiFiles.Count -gt 0) {
  $jobs += Start-ReviewJob -Name 'ux' -SystemRole 'UX Reviewer' -Focus 'Component behavior, accessibility' -AgentHint 'task — explore agent type (conditional)' -Diff $diff
}

# 3) Collect results with timeout + fallback
$results = @{}

foreach ($j in $jobs) {
  $completed = Wait-Job -Job $j -Timeout $TimeoutSeconds

  if (-not $completed) {
    $results[$j.Name] = "[TIMEOUT] Specialist did not respond within ${TimeoutSeconds}s."
    Stop-Job $j | Out-Null
    Remove-Job $j | Out-Null
    continue
  }

  try {
    $out = Receive-Job $j -ErrorAction Stop
    if ([string]::IsNullOrWhiteSpace($out)) {
      $results[$j.Name] = "[ERROR] Specialist returned empty output."
    } else {
      $results[$j.Name] = $out
    }
  } catch {
    $results[$j.Name] = "[ERROR] $($_.Exception.Message)"
  } finally {
    Remove-Job $j -Force | Out-Null
  }
}

# 4) Synthesizer (single session) - consolidate into GitHub PR comment
# NOTE: This is intentionally a single call so it can reason over all specialist outputs.
$synthPrompt = @"
You are the Synthesizer for a 5-specialist parallel code review.

Task:
- Merge the specialist reports below.
- Deduplicate overlapping items.
- Assign final severity per row: [BLOCK] / [CONCERN] / [PASS].
- Output ONLY a markdown table suitable for a GitHub PR comment.

Table format:
| Severity | Area | Finding | Evidence | Suggested Fix |
|---|---|---|---|---|

Guidance:
- Prefer fewer, higher-signal rows over exhaustive lists.
- If a specialist output contains [ERROR]/[TIMEOUT], include a single [CONCERN] row noting reduced coverage.

Specialist reports:

--- Security Analyst ---
$($results['security'])

--- Performance Analyst ---
$($results['performance'])

--- Architecture Reviewer ---
$($results['architecture'])

--- Style Inspector ---
$($results['style'])

--- UX Reviewer ---
$($results['ux'])
"@

# NOTE: In a Copilot CLI session, use the task tool for synthesis (preferred over gh copilot suggest).
# See: skills/copilot-exclusive/team-planner/SKILL.md for the task-tool pattern.
$commentBody = gh copilot suggest "$synthPrompt"

# 5) Post as PR comment review
gh pr review $Pr --comment --body $commentBody
```

## When to Use

- PR > 200 lines changed
- PR touches multiple domains (auth + DB + UI)
- High-risk release (pre-production, security-sensitive)
- NOT for: small bug fixes, single-concern PRs (use `pr-multi-perspective-review` instead)

## See Also

- `skills/development/pr-multi-perspective-review/SKILL.md` — simpler single-session variant
- `orchestration/patterns/fan-out-parallel.md` — the underlying pattern
- `orchestration/examples/code-review-team.md` — full worked example
