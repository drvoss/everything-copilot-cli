---
name: github-actions-efficiency
description: >
  Use when auditing GitHub Actions workflows for efficiency — reducing CI minutes,
  cutting costs, eliminating redundant runs, or optimizing caching and concurrency.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot github-actions-efficiency (MIT)
---

# GitHub Actions Efficiency

Audit GitHub Actions workflow efficiency without weakening required validation. Focus on
runner time, wasted runs, broad triggers, and the fastest fixes that actually hold up under
review.

## When to Use

- CI minutes are growing faster than the repository's actual change volume
- Workflows run too often for docs-only, workflow-only, or narrow-scope changes
- You need to optimize caches, concurrency, trigger scope, or matrix breadth
- A repository is onboarding GitHub Actions and needs a lean baseline first
- A team wants a before/after efficiency report grounded in real workflow evidence

## When NOT to Use

| Instead of github-actions-efficiency | Use |
|--------------------------------------|-----|
| Debugging one failed workflow run | `actions-debugging` |
| Reviewing Actions security risks | `gha-security-review` |
| Auditing model or token spend across AI workflows | `cost-audit` |

## Prerequisites

- Access to `.github/workflows/`
- `gh` CLI access if you want live run data
- Understanding of which checks are mandatory for release, shared libraries, or migrations

## Load Only What You Need

- [`../../../references/github-actions-efficiency/actions.md`](../../../references/github-actions-efficiency/actions.md) - audit order, trigger scoping, matrix reduction, and live validation guidance
- [`../../../references/github-actions-efficiency/reporting.md`](../../../references/github-actions-efficiency/reporting.md) - before/after reporting and follow-up review passes
- [`../../../references/github-actions-efficiency/patterns.md`](../../../references/github-actions-efficiency/patterns.md) - concrete YAML examples when inline guidance is not enough
- [`../../../references/github-actions-efficiency/review-rubric.md`](../../../references/github-actions-efficiency/review-rubric.md) - review rubric for completed efficiency changes

If no workflows exist yet, start with `actions.md` and define a minimal baseline before trying
to optimize.

If `gh` CLI access is unavailable, fall back to static analysis of workflow files and make the
scope explicit: **Static-only analysis** (not confirmed with live runs).

## Core Workflow

### 1. Measure first

```powershell
rg -n "on:|concurrency:|paths:|paths-ignore:|strategy:|matrix:|cache:" .github/workflows
gh run list --limit 10
$runId = gh run list --limit 1 --json databaseId --jq ".[0].databaseId"
gh run view $runId --log-failed
```

Look for:

- missing dependency caches
- missing `concurrency` cancellation
- over-broad triggers
- duplicate workflow coverage across files or jobs
- expensive jobs that run on every change regardless of scope

### 2. Apply guardrails

Check each proposed fix against these rules before recommending it:

1. Do not hide required validation for release, schema, migration, or shared-library safety.
2. Do not reduce parallelism without justification; only accept a slower critical path when the
   cost trade-off is explicit and still acceptable.
3. Preserve only documented matrix legs; drop unsupported versions or platforms first.
4. Keep write-back jobs opt-in; formatter or bot jobs should usually use labels, manual
   dispatch, or another explicit trigger.
5. Split repo-editable YAML changes from org-level or account-level settings.

### 3. Select the top 3 fixes

Rank the surviving candidates by expected daily CI minutes saved:

1. add dependency caching with lockfile-based keys
2. add or correct `concurrency` cancellation
3. remove duplicate workflow coverage before merging jobs
4. narrow workflow or job triggers safely
5. reduce matrix breadth to match risk and event type
6. parallelize independent jobs on the critical path

Keep only changes supported by audit evidence and guardrails. Return up to three.

### 4. Verify

- If live GitHub access is available, validate concurrency cancellation and path gating with a
  test change on a non-protected branch.
- If live validation is not possible, say so explicitly.
- Treat surprising live behavior as a real workflow bug even when the YAML looks correct.

## Required Output

1. **Waste sources** - top cost or latency drivers from the audit
2. **Proposed fixes** - up to 3 recommendations with supporting evidence
3. **Validation** - what was proven live, what stayed static-only, and what risk remains
4. **Impact** - expected savings versus measured savings; separate PR wall-clock time from total runner time

## Tips

- Measure before editing YAML; the first fix should be evidence-backed, not stylistic
- Prefer low-risk waste first: caches, concurrency, and redundant trigger scope
- Separate "fewer minutes billed" from "faster feedback for developers"
- Keep follow-up reviews short and ranked by value, not as a giant wishlist

## See Also

- [`actions-debugging`](../../copilot-exclusive/actions-debugging/SKILL.md) - investigate failed workflow runs and job logs
- [`gha-security-review`](../../security/gha-security-review/SKILL.md) - review GitHub Actions workflows for exploitable security issues
- [`cost-audit`](../cost-audit/SKILL.md) - compare broader AI cost patterns beyond CI runner spend
