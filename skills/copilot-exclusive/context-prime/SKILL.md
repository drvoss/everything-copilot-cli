---
name: context-prime
description: Load project context at the start of a session so the AI understands the codebase before making changes
metadata:
  category: copilot-exclusive
  copilot_feature: "Session initialization, .github/copilot-instructions.md, git ls-files"
---

# Context Prime

## Why This is Copilot-Exclusive

Copilot CLI reads `.github/copilot-instructions.md` automatically on every session start.
This skill layers *additional* context loading on top of that — fetching live project state
(recent commits, file structure, test status) that static instructions can't capture.

## When to Use

- At the start of any session before making changes to an unfamiliar codebase
- When resuming work after a long break (branch has moved, dependencies changed)
- Before running a large autopilot or fleet task — ensure the AI has full context
- When onboarding a new contributor — demonstrate the project structure interactively

## Workflow

### 1. Read Project Identity

```powershell
# Core identity files
Get-Content README.md | Select-Object -First 60

# Project instructions (Copilot reads this automatically, but re-surface it)
if (Test-Path .github/copilot-instructions.md) {
    Get-Content .github/copilot-instructions.md
}
```

### 2. Understand the File Structure

```powershell
# List tracked files (respects .gitignore automatically)
git ls-files | Select-Object -First 100

# Or filtered by extension for a focused view
git ls-files | Where-Object { $_ -match '\.(ts|js|py|go|cs)$' } | Select-Object -First 80

# Top-level structure
Get-ChildItem -Depth 1 | Where-Object { $_.Name -notmatch '^\.' } |
  Select-Object Name, PSIsContainer | Format-Table
```

### 3. Understand the Tech Stack

```powershell
# Node.js
if (Test-Path package.json) {
    $pkg = Get-Content package.json | ConvertFrom-Json
    Write-Host "Project: $($pkg.name) v$($pkg.version)"
    Write-Host "Scripts: $($pkg.scripts.PSObject.Properties.Name -join ', ')"
    Write-Host "Key deps: $($pkg.dependencies.PSObject.Properties.Name -join ', ')"
}

# Python
if (Test-Path pyproject.toml) { Get-Content pyproject.toml | Select-Object -First 30 }

# .NET
Get-ChildItem -Recurse -Filter "*.csproj" | Select-Object -First 3 | Get-Content
```

### 4. Get Current Development Context

```powershell
# What branch and recent activity
git --no-pager log --oneline -5
git --no-pager status --short

# Any open issues or PRs being worked on (Copilot MCP)
# Tool: github-mcp-server-list_issues  owner: ... repo: ... state: OPEN
```

### 5. Check Test and Build State (Optional)

```powershell
# Quick test status without full run
npm test -- --passWithNoTests 2>&1 | Select-Object -Last 5

# Or just see what test command exists
if (Test-Path package.json) {
    (Get-Content package.json | ConvertFrom-Json).scripts
}
```

## Example Session Start Prompt

```
> Prime context for this session:
> 1. Read README.md (first 50 lines)
> 2. List all tracked source files
> 3. Show the last 5 commits
> 4. Identify the tech stack from package.json / pyproject.toml
> 5. Summarize what this project does in 2-3 sentences
```

Copilot will run these steps and give you a compact project brief before you start working.

## Quick Variant (One-liner prompt)

```
> Read README.md, list git ls-files output, and show me the last 3 commits.
> Then tell me: what does this project do, what stack is it using, and what was last worked on?
```

## Tips

- **Run this before autopilot tasks**: A well-primed session means fewer mid-task surprises
- **Include domain context**: If the project has a `docs/` or `ARCHITECTURE.md`, include it
- **`.github/copilot-instructions.md` is your long-term context**: Use this skill for *session-specific* context (current branch state, open issues)
- **After a long break**: Always re-prime — the `[Unreleased]` CHANGELOG section and recent commits tell you where things stand

## See Also

- [`sprint-workflow`](../../workflow/sprint-workflow/SKILL.md) — full sprint starting with context prime
- [`github-issue-triage`](../github-issue-triage/SKILL.md) — load current open issues as context
- *Inspired by: [awesome-claude-code/resources/slash-commands/context-prime](https://github.com/hesreallyhim/awesome-claude-code)*
