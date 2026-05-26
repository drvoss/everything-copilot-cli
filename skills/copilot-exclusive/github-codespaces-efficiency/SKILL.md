---
name: github-codespaces-efficiency
description: >
  Use when optimizing GitHub Codespaces — faster startup times, lower spend,
  slimmer devcontainers, right-sizing machines, or scoping prebuilds.
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
origin: adapted from github/awesome-copilot github-codespaces-efficiency (MIT)
---

# GitHub Codespaces Efficiency

Audit GitHub Codespaces efficiency with a GitHub-native lens. Focus on devcontainer size,
startup time, machine sizing, prebuild scope, and idle-time discipline without stripping away
tools the team relies on every day.

## Why This is Copilot-Exclusive

GitHub Codespaces is a GitHub-native development environment. This skill is most useful when
you can inspect repository configuration, correlate it with `gh`-based Codespaces metadata,
and turn the result into Copilot-driven GitHub workflow guidance.

## When to Use

- Codespaces start too slowly or cost more than the team expects
- `.devcontainer/` exists and needs trimming, right-sizing, or prebuild tuning
- A team wants guidance on machine sizing, idle timeout, or prebuild scope
- The repository is onboarding Codespaces for the first time and needs a minimal baseline

## When NOT to Use

| Instead of github-codespaces-efficiency | Use |
|-----------------------------------------|-----|
| Debugging a failing GitHub Actions run | `actions-debugging` |
| Reviewing PR lifecycle and checks | `github-pr-workflow` |
| General local development environment setup without Codespaces | ordinary repo setup guidance |

## Prerequisites

- Access to `.devcontainer/` when it exists
- `gh` CLI access if you want live Codespaces or machine data
- Understanding of the team's baseline tooling requirements

## Load Only What You Need

- [`../../../references/github-codespaces-efficiency/codespaces.md`](../../../references/github-codespaces-efficiency/codespaces.md) - audit order, preferred fix order, safe-change rules, and reporting focus
- [`../../../references/github-codespaces-efficiency/review-rubric.md`](../../../references/github-codespaces-efficiency/review-rubric.md) - compact rubric for review passes

If no `.devcontainer/` exists yet, start with `codespaces.md` and define a minimal baseline
before optimizing.

## Core Workflow

### 1. Measure first

```powershell
Get-ChildItem .devcontainer -Recurse -File | Select-Object -ExpandProperty FullName
gh codespace list
$repo = gh repo view --json nameWithOwner --jq ".nameWithOwner"
gh api "/repos/$repo/codespaces/machines"
```

If `gh` auth fails or the user lacks repo admin scope, continue with static analysis of
`.devcontainer/` files and mark machine-type or prebuild recommendations as unverified.

Look for:

- devcontainer image larger than the task justifies
- too many features, packages, or extensions
- machine types larger than usage patterns support
- missing `devcontainer-lock.json`
- prebuilds scoped too broadly
- idle timeout guidance mismatched to actual usage

### 2. Apply guardrails

1. Do not remove tools the team uses every day.
2. Do not assume smaller is always better; balance cost against developer throughput.
3. Do not turn the devcontainer into a production image unless the team explicitly needs it.
4. Prefer incremental changes for existing configs; a greenfield reset is for missing configs, not stable ones.
5. Split repo-editable changes from org-level or user-level Codespaces settings.

### 3. Select the top 3 fixes

Rank by expected monthly savings or startup-time improvement:

1. trim the devcontainer
2. right-size the machine type
3. scope prebuilds to sustained-usage branches
4. tune idle timeout
5. remove unused extensions or port-forwarding rules
6. reduce image size and improve layer caching

Keep only evidence-backed, guardrail-safe recommendations. Return up to three.

### 4. Verify

- Start a test Codespace when possible and confirm that devcontainer changes still build and boot correctly.
- Validate machine sizing against observed usage when telemetry exists; otherwise mark it as an assumption.
- Treat startup or build regressions as real bugs even if the configuration looks "cleaner" on paper.

## Required Output

1. **Waste sources** - top startup-time or cost drivers
2. **Proposed fixes** - up to 3 recommendations backed by audit evidence
3. **Validation** - live, static-only, and unverified areas
4. **Impact** - expected versus measured startup time, spend, and utilization

## Tips

- Optimize the slowest, most common developer path first
- Separate startup-time wins from steady-state cost wins
- Prefer documentation changes when the real control lives outside the repository
- Keep prebuild recommendations tight and usage-based

## See Also

- [`github-pr-workflow`](../github-pr-workflow/SKILL.md) - manage GitHub pull requests and related checks
- [`actions-debugging`](../actions-debugging/SKILL.md) - debug workflow failures that block Codespaces-related changes
- [`using-git-worktrees`](../../workflow/using-git-worktrees/SKILL.md) - isolate risky environment changes in a separate checkout
