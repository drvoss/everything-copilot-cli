---
name: sprint-workflow
description: Use when starting a new feature, refactor, or multi-step dev task — runs the full sprint cycle (Think → Plan → Build → Review → Test → Ship) using Copilot CLI's plan/autopilot modes.
metadata:
  category: workflow
---

# Sprint Workflow

A structured end-to-end development sprint using Copilot CLI's full capability stack.
Inspired by Garry Tan's gstack approach — each step feeds the next, nothing falls through.

**Think → Plan → Build → Review → Test → Ship**

## When to Use

- Starting a new feature or significant refactor
- Any task that spans multiple files or requires sequencing
- When you want structured, reviewable output rather than ad-hoc changes
- Team environments where pull requests are the delivery mechanism

## Prerequisites

- Copilot CLI authenticated (`gh auth status`)
- For the **Review step**: standard mode (no extra setup)
- For the **sprint-retro** skill after this sprint: enable experimental features first:
  ```
  /experimental on
  ```
  > ⚠️ `/chronicle` (used in `sprint-retro`) requires `/experimental on` to be run in the **same session**.

## The Sprint

### Step 1: Think — Frame the Problem

Before writing a line, challenge the premise:

```
> I want to build [X]. What am I actually trying to solve?
```

Push back on your own framing. Identify:
- The real user pain (not the feature request)
- Assumptions that could be wrong
- The simplest possible version that delivers value

### Step 2: Plan — Structured Implementation Plan

Switch to **Plan Mode** (`Shift+Tab`) and describe the task:

```
[Plan Mode]
> Implement paginated results for the /api/users endpoint
```

Copilot will ask clarifying questions, then produce a structured plan. Review it carefully.
Approve with `exit_plan_mode` when ready.

For complex tasks, prompt for explicit sections:

```
[Plan Mode]
> Design the pagination feature. Include:
> 1. Data flow and API contract
> 2. Edge cases and error handling
> 3. Test plan (unit + integration)
> 4. Files to change and why
```

### Step 3: Build — Autopilot Execution

After plan approval, switch to **Autopilot Mode** (`Shift+Tab`) and let Copilot execute:

```
[Autopilot Mode]
> Implement the plan
```

Copilot works autonomously. You can monitor progress or continue other work.
For parallelizable tasks (multiple independent files), use:

```
/fleet Implement the pagination plan across all affected service files
```

### Step 4: Review — Catch Issues Before They Ship

Run the `/review` command to trigger a systematic code review:

```
/review
```

Copilot's code-review agent surfaces only genuine issues — bugs, security holes,
logic errors. Address blockers before testing.

You can also check the diff:

```
/diff
```

### Step 5: Test — Verify the Implementation

Run the test suite and verify new tests were added:

```
> Run the test suite and confirm all tests pass including the new pagination tests
```

For comprehensive E2E verification:

```
> Run the full test suite. If any tests fail, analyze and fix them before continuing.
```

### Step 6: Ship — Delegate to Cloud or Create PR

**Option A: Delegate the PR creation to the cloud agent:**

```
& "Create a PR for the pagination feature with a clear description and review checklist"
```

**Option B: Create a PR locally:**

```
> Create a pull request for the pagination feature. Include:
> - Summary of changes
> - Testing approach
> - Screenshots or examples if applicable
```

## Full Example

```
# Step 1: Think
> We have slow API responses. I want to add caching.
> [Challenge: is caching the right fix, or is the query slow?]

# Step 2: Plan
[Plan Mode]
> Investigate the slow /api/products query, then implement the right fix.
> Include a performance benchmark before and after.

# Step 3: Build
[Autopilot Mode]
> Execute the plan.

# Step 4: Review
/review

# Step 5: Test
> Run the benchmark and confirm the performance improvement.

# Step 6: Ship
& "Create a PR: Fix slow product queries — add DB index + query optimization"
```

## Output Format

Each step produces verifiable output:

| Step | Output | How to Verify |
|------|--------|---------------|
| Think | Written problem statement | Challenge at least one assumption |
| Plan | `plan.md` with numbered tasks + file list | Confirm scope before approving |
| Build | File changes | `/diff` — confirm only planned files changed |
| Review | `[PASS]`/`[CONCERN]`/`[BLOCK]` per category | Address all BLOCKs before continuing |
| Test | Test run output (pass count, coverage delta) | Zero regressions; new tests for new behaviour |
| Ship | PR URL + description | PR description references the plan |

### `/review` Output Interpretation

```
✅ PASS    — No issues in this category
⚠️ CONCERN — Advisory; fix if feasible, document if not
🚫 BLOCK   — Must fix before merging

Categories: Logic, Security, Tests, Performance, API Contracts
```

### `/diff` Output Interpretation

```
# Confirm scope is correct:
# - Only files in the plan should appear
# - No unintended deletions
# - No debug code or temporary files
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Skip planning, start coding now" | Sprints without a plan lose direction mid-way. An hour in Plan Mode saves three hours of rework. |
| "Reviews can wait until next sprint" | Features merged without review accumulate technical debt. Review must be part of the definition of done. |
| "Tests after the feature stabilizes" | Stabilization never comes. Once shipped, there's no time to add tests. |
| "Deadline approaching, lower the quality bar" | Low-quality 'done' features return as bugs in the next sprint. |

## Red Flags
- Sprint started without a definition of done
- Features merged within the sprint without tests
- Next sprint started immediately without a retrospective
- Sprint goal is missing or has too many objectives (5+)
- PRs merged directly to main without review

## Verification
- [ ] Sprint goal defined in 1–3 clear sentences
- [ ] Every task has explicit acceptance criteria
- [ ] All PRs merged by sprint end passed code review
- [ ] `sprint-retro` skill used for a data-driven retrospective
- [ ] Next sprint backlog prepared
## Tips

- **Plan Mode is not optional** for features > 1 file. It prevents costly mid-build corrections.
- **Autopilot with full permissions** (`--yolo`) speeds up execution but review the plan carefully first.
- **`/review` before every PR** — the signal-to-noise is high, it surfaces real issues.
- **Use `/diff` to sanity-check** scope before shipping — did Copilot change more than planned?
- **Reference the plan in the PR description** — use `/session plan` to surface it.

## See Also

- [`fix-github-issue`](../../development/fix-github-issue/SKILL.md) — Issue-driven variant of this sprint workflow
- [`commit-workflow`](../commit-workflow/SKILL.md) — Conventional commit + emoji for the Ship step
- [`pr-multi-perspective-review`](../../development/pr-multi-perspective-review/SKILL.md) — Deeper 6-lens review for the Review step
- [`sprint-retro`](../sprint-retro/SKILL.md) — Retrospective after the sprint completes

