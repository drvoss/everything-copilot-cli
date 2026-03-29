---
name: create-prd
description: Generate a structured Product Requirements Document (PRD) for a well-scoped feature, grounded in Jobs-to-be-Done thinking
metadata:
  category: product
  agent_type: general-purpose
---

# Create PRD

## When to Use

- Before starting a new feature — to align engineering, product, and stakeholders on scope
- When a GitHub Issue or Slack request needs formal requirements before implementation
- When writing a PRD from scratch for a feature you're about to build solo
- As a handoff document: from discovery → design → implementation

**Note**: This skill works best for well-scoped, single-feature PRDs. For large epics with
many sub-features, use this per sub-feature and link them together.

## Prerequisites

- A feature idea, GitHub Issue, or user request to formalize
- Access to any existing context: user research, analytics, prior PRDs, or `CLAUDE.md`/`copilot-instructions.md`

## Workflow

### 1. Gather Context

Before writing, collect:

```powershell
# What does the product currently do?
Get-Content README.md | Select-Object -First 40
if (Test-Path .github/copilot-instructions.md) {
    Get-Content .github/copilot-instructions.md | Select-Object -First 50
}

# Any existing product docs?
Get-ChildItem -Recurse -Include "*.md" | Where-Object { $_.Name -match 'product|spec|prd|requirements' }

# Related GitHub issues
# Tool: github-mcp-server-search_issues
#   query: "feature-keyword in:title is:open"
#   owner: "my-org"
#   repo: "my-app"
```

### 2. Define the Job-to-be-Done (JTBD)

Before writing requirements, anchor in the user's actual goal:

```
When [situation/trigger],
I want to [motivation],
So that I can [expected outcome].
```

Example:
> When I've finished coding a feature and want to commit,
> I want to automatically format my commit message to follow conventions,
> So that I can maintain a clean, readable git history without remembering the format.

### 3. Write the PRD

Use this template:

```markdown
# PRD: [Feature Name]

## Overview
One paragraph: what this feature does and why it matters.

## Problem Statement
What user pain point or business opportunity does this address?
Include data or quotes if available.

## Jobs-to-be-Done
**Primary JTBD:**
> When [situation], I want to [motivation], so that [outcome].

**Secondary JTBDs (optional):**
- ...

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Reduce time to commit | Time from ready-to-commit to pushed | < 30 seconds |
| Adoption | % of commits using conventional format | > 80% after 30 days |

## Non-Goals (Out of Scope)
- Explicit list of what this does NOT include
- Helps prevent scope creep

## User Stories
### Must Have (P0)
- As a [user], I can [action] so that [benefit]
- As a [user], I can [action] so that [benefit]

### Should Have (P1)
- As a [user], I can [action] so that [benefit]

### Nice to Have (P2)
- As a [user], I can [action] so that [benefit]

## Functional Requirements
### Core Behavior
1. [Requirement] — [Acceptance criterion]
2. [Requirement] — [Acceptance criterion]

### Edge Cases
- [Edge case] → [Expected behavior]
- [Edge case] → [Expected behavior]

## Technical Constraints
- Platform: [e.g., Windows + macOS + Linux]
- Existing systems to integrate with: [e.g., GitHub MCP, git CLI]
- Performance: [e.g., < 2s response time]

## Open Questions
- [ ] [Question that needs decision before implementation]
- [ ] [Question that needs design input]

## Appendix
- Related issues: #123, #456
- Inspired by: [prior art, competitor feature, user research]
```

### 4. Save and Link

```powershell
# Save to docs directory or alongside issue
$featureName = "commit-workflow"
$prdPath = "docs/prd-$featureName.md"
# (Write the PRD content to file)

# Link from GitHub Issue (via comment or issue body update)
# gh issue comment 123 --body "PRD: docs/prd-$featureName.md"
```

## Examples

### Minimal PRD (Solo Developer)

For a solo project, a PRD can be much lighter:

```markdown
# PRD: Commit Workflow Skill

## What & Why
Add a skill that guides conventional commit message creation with emoji.
Developers lose time formatting commits manually; this automates the pattern.

## JTBD
When I'm ready to commit, I want auto-formatted conventional commit messages,
so that my git history is readable without manual effort.

## Must Have
- Emoji + type + scope + description format
- Atomic commit splitting guidance
- PowerShell code blocks for Windows compat

## Non-Goals
- Automatic commit (user still types `git commit -m`)
- Integration with GUI git clients
```

### PRD from GitHub Issue

```
Issue #145: "Users can't tell which commits are breaking changes"

JTBD: When I'm reviewing git log, I want breaking changes visually distinct,
so that I can identify risky commits without reading every message.

Requirements:
- 💥 emoji + `!` suffix for breaking changes
- BREAKING CHANGE footer in body
- CI lint rule for enforcement
```

## Tips

- **Start with JTBD, not features**: features are solutions; jobs are the problems worth solving
- **Non-goals are as important as goals**: they prevent scope creep during implementation
- **Acceptance criteria are testable**: "users can X" is not; "clicking Save triggers validation and shows error within 200ms" is
- **PRD ≠ design spec**: leave implementation details out; focus on *what*, not *how*
- **Link your PRD to the GitHub Issue**: keeps traceability from discovery → delivery

## See Also

- [`github-issue-triage`](../../copilot-exclusive/github-issue-triage/SKILL.md) — understand the issue backlog first
- [`fix-github-issue`](../../development/fix-github-issue/SKILL.md) — execute after PRD is approved
- *Inspired by: [awesome-claude-code/resources/slash-commands/create-prd](https://github.com/hesreallyhim/awesome-claude-code)*
