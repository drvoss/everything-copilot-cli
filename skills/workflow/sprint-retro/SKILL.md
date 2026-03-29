---
name: sprint-retro
description: Run a sprint retrospective using /chronicle session stats and git metrics. Surface what shipped, what slowed you down, and concrete improvements for next sprint.
metadata:
  category: workflow
---

# Sprint Retrospective

Use Copilot CLI's `/chronicle` session history and git metrics to run a data-driven
retrospective. Go beyond "what went well / what didn't" — anchor the discussion in facts.

## When to Use

- End of each sprint or iteration
- After a major feature ships
- When velocity has been unexpectedly high or low
- When the team wants to improve but isn't sure where to start

## Getting Session Data

### `/chronicle` — Session History

> ⚠️ Experimental feature — enable with `/experimental on` before using.

```
/experimental on
/chronicle
```

`/chronicle` generates a timeline of your Copilot sessions: what you worked on,
session durations, tool usage patterns, and key decisions made.

Use this to answer:
- What did we actually build this sprint?
- How much time did each major task take?
- Which tasks got re-opened or took multiple sessions?

### Git Metrics

```
> Analyze the git log for the last 2 weeks:
> - Number of commits
> - Files most frequently changed
> - Commit frequency by day (are we shipping continuously or in bursts?)
> - PR merge times (open → merged)
> - Any files with unusually high churn (changed in > 50% of commits)
```

```bash
# Commit count and velocity
git log --since="2 weeks ago" --oneline | wc -l

# Files with most churn
git log --since="2 weeks ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20

# PR cycle time (requires gh CLI)
gh pr list --state merged --json createdAt,mergedAt --limit 20
```

## Retro Framework

### What We Shipped

```
> Based on /chronicle and git log, summarize what we shipped this sprint.
> Group by feature area. Include: PR links, key decisions, and anything
> that surprised you about how it came together.
```

### Velocity Analysis

```
> Compare planned scope vs. actual scope:
> - What was planned but not shipped? (Why?)
> - What was shipped but not planned? (Unplanned work or scope creep?)
> - What tasks took significantly longer than expected?
```

### Friction Points

```
> Identify the top 3 friction points from this sprint:
> - Where did I spend time on tooling/process rather than building?
> - Any tasks that required multiple attempts or restarts?
> - What would have been faster with better upfront planning?
```

### What Worked Well

```
> What patterns from this sprint accelerated delivery?
> - Which Copilot CLI features saved the most time?
> - Any workflows we should standardize?
> - Code patterns or architectural decisions that simplified implementation?
```

## Action Items

Generate concrete, owner-assigned improvements:

```
> Based on the retro analysis, generate 3-5 concrete action items for next sprint.
> Each action item should be:
> - Specific and measurable
> - Completable within one sprint
> - Assigned to a skill, tool, or workflow change (not vague "be better at X")
>
> Format: | Action | Owner | Success Metric |
```

## Full Retro Workflow

### Step 1: Gather Session Data

```powershell
# Enable experimental features and pull session chronicle
/experimental on
/chronicle
```

### Step 2: Collect Git Metrics

```powershell
# Commit count this sprint
git log --since="2 weeks ago" --oneline | Measure-Object -Line | Select-Object -ExpandProperty Lines

# Files with highest churn (changed most often)
git log --since="2 weeks ago" --name-only --pretty=format: |
  Where-Object { $_ -ne "" } | Sort-Object | Group-Object | Sort-Object Count -Descending |
  Select-Object -First 15 | Format-Table Count, Name -AutoSize

# PR cycle time (open → merged)
gh pr list --state merged --json number,title,createdAt,mergedAt --limit 20 |
  ConvertFrom-Json | ForEach-Object {
    $cycle = ([datetime]$_.mergedAt - [datetime]$_.createdAt).TotalHours
    [PSCustomObject]@{ PR = $_.number; Hours = [math]::Round($cycle,1); Title = $_.title }
  } | Sort-Object Hours -Descending | Format-Table -AutoSize
```

### Step 3: Generate Retro Summary

```
> Using the /chronicle data and git metrics above, create a sprint retrospective report.
> Include: (1) shipped features, (2) velocity vs. plan, (3) top 3 friction points,
> (4) what worked well. Cite specific commits or PRs where possible.
```

### Step 4: Generate Action Items

```
> Based on the retro analysis, generate exactly 3 concrete action items for next sprint.
> Each must be specific, measurable, and completable in one sprint.
> Format as a table: | Action | Owner | Success Metric |
```

### Step 5: Save to File

```powershell
# Write the retro to the team docs folder
$date = Get-Date -Format "yyyy-MM-dd"
# Paste Copilot output into:
New-Item -Path "docs/retros/retro-$date.md" -ItemType File
```

## Output Format

A completed retro produces:

```markdown
## Sprint Retro — 2024-12-06

### Shipped
| Feature | PR | Cycle Time |
|---------|-----|-----------|
| User pagination | #142 | 18h |
| Rate limiting | #147 | 6h |

### Velocity
- Planned: 5 features → Shipped: 4 (80%)
- Unplanned work: 2 hotfixes consumed ~20% capacity

### Friction Points
1. PR reviews averaging 14h (target: 8h)
2. `src/db/` changed in 60% of commits — high instability
3. Test suite takes 4m 30s — slows feedback loop

### What Worked
- Plan Mode prevented 2 mid-sprint course corrections
- `/fleet` parallelized the API route work

### Action Items
| Action | Owner | Success Metric |
|--------|-------|----------------|
| Add required reviewers policy | @lead | PR cycle time < 8h |
| Extract db helpers to reduce churn | @dev | db/ churn < 30% |
| Parallelize test suite with --shard | @ci | Suite time < 2m |
```

## Tips

- **Data before opinions**: Anchor the retro in `/chronicle` and git metrics before going subjective
- **Focus on systems, not people**: "Our PR review process takes 3 days" not "X is slow to review"
- **Time-box action items**: If you generate 10 items, nothing changes. Pick 3 max.
- **Compare sprint over sprint**: Keep a `docs/retros/` folder and trend the metrics over time
- **Don't skip when things go well**: The best retros often come from successful sprints

## See Also

- [`sprint-workflow`](../sprint-workflow/SKILL.md) — Full sprint execution (Think → Plan → Build → Review → Ship)
- [`commit-workflow`](../commit-workflow/SKILL.md) — Conventional commits that feed clean git metrics
- [`add-to-changelog`](../../documentation/add-to-changelog/SKILL.md) — Changelog entries generated from same git data
