---
name: review-trio
type: fan-out
agents:
  - copilot
  - claude
  - gemini
---

# Pattern: Review Trio

> **Status: Superseded for PR review** — For PR review, use [`pr-multi-perspective-review`](../../skills/development/pr-multi-perspective-review/SKILL.md) (Fleet Option B), which provides the same multi-agent fan-out with a structured 6-lens output format. For non-PR artifacts (RFCs, schema proposals, architecture documents), Review Trio remains the recommended pattern.

The Review Trio pattern was designed to combine three AI perspectives (Copilot + Claude + Gemini) for a single PR or code change review. This is now subsumed by the pr-multi-perspective-review skill's Fleet option.

## When This Pattern Still Has Value

Use Review Trio directly (rather than the skill) when:

- Reviewing artifacts **other than PRs**: architecture documents, RFCs, database schemas, infrastructure configs
- You need **raw multi-agent output** without the lens-based structure
- You want to compare how different models interpret the same code

## Minimal Implementation

```powershell
# Raw 3-way review of any artifact
param([string]$Target = "ARCHITECTURE.md")

$content = Get-Content $Target -Raw

$copilot = Start-Job {
    # Copilot CLI: GitHub-native context (issues, PRs, history)
    gh copilot suggest "Review this for correctness and GitHub workflow integration: $using:content"
}

$claude = Start-Job {
    npx @anthropic-ai/claude-code --print @"
Review the following for architecture quality, edge cases, and security implications.
Be specific — quote the relevant sections.

$using:content
"@
}

$gemini = Start-Job {
    gemini --prompt @"
Review for performance implications, scalability concerns, and factual accuracy.

$using:content
"@
}

@($copilot, $claude, $gemini) | Wait-Job | Out-Null

Write-Host "## Copilot Review" -ForegroundColor Blue
$copilot | Receive-Job; $copilot | Remove-Job

Write-Host "`n## Claude Review" -ForegroundColor Magenta
$claude | Receive-Job; $claude | Remove-Job

Write-Host "`n## Gemini Review" -ForegroundColor Green
$gemini | Receive-Job; $gemini | Remove-Job
```

## For PR Review → Use the Skill Instead

```
# Preferred: structured 6-lens review with Pass/Concern/Block output
# See: skills/development/pr-multi-perspective-review/SKILL.md

# Option A (single session, sequential):
> Use the pr-multi-perspective-review skill on PR #123

# Option B (fleet parallel, 6 agents simultaneously):
/fleet [pr-multi-perspective-review skill — Option B prompt]
```

## See Also

- [Skill: pr-multi-perspective-review](../../skills/development/pr-multi-perspective-review/SKILL.md) — Full structured PR review (replaces this pattern for PRs)
- [Pattern: Fan-Out Parallel](fan-out-parallel.md) — General-purpose parallel fan-out
- [Pattern: Agent Council](agent-council.md) — Multi-agent consensus with conflict resolution
