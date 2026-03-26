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

```
# 1. Gather data
/experimental on
/chronicle

# 2. Git analysis
> Analyze git log from [start date] to [end date]. Summarize commits, churn, and PR velocity.

# 3. What shipped
> Create a sprint summary from the chronicle and git data.

# 4. Friction analysis
> What took longer than expected? What blocked progress?

# 5. Action items
> Generate 3 concrete improvements for next sprint.

# 6. Save and share
> Write a retro summary to docs/retro-YYYY-MM-DD.md
```

## Tips

- **Data before opinions**: Anchor the retro in `/chronicle` and git metrics before going subjective
- **Focus on systems, not people**: "Our PR review process takes 3 days" not "X is slow to review"
- **Time-box action items**: If you generate 10 items, nothing changes. Pick 3 max.
- **Compare sprint over sprint**: Keep a `docs/retros/` folder and trend the metrics over time
- **Don't skip when things go well**: The best retros often come from successful sprints
