---
name: deployment-canary
description: Use when a release has been deployed to a limited audience and must be observed before full rollout — defines success signals, watch windows, rollback triggers, and investigate handoffs.
metadata:
  category: workflow
  agent_type: general-purpose
---

# Deployment Canary

A release is not done when it is deployed — it is done when it survives contact with
real traffic. This skill formalizes the **canary phase** between "ship" and
"fully rolled out": define what healthy looks like, watch the right signals, and
rollback fast when the evidence says to.

## When to Use

- After deploying a new version behind a canary, percentage rollout, or feature flag
- Before promoting a release from a small traffic slice to full production
- When the release changes critical paths: auth, checkout, billing, queueing, migrations
- When a team needs explicit rollback criteria instead of "watch the dashboard and hope"

## When NOT to Use

| Instead of deployment-canary | Use |
|------------------------------|-----|
| Packaging a library with no runtime environment | `release` plus smoke install checks |
| Diagnosing an already-confirmed incident | `systematic-debugging` |
| Deciding whether to ship at all | `council` or `launch-strategy` |

## Prerequisites

- The release has a unique identifier: image tag, build SHA, version, or feature flag
- You know the **canary scope**: percentage of traffic, tenant list, region, or cohort
- Dashboards, logs, or health checks exist for the affected system
- A rollback path is available before promotion starts

## Workflow

### 1. Define the Canary Contract

Before watching dashboards, define the exact terms for success and failure:

```text
> Prepare a canary contract for release [version/build]:
> - Scope: what percentage, which region, or which customer cohort
> - Watch window: how long the canary must stay healthy
> - Primary signals: error rate, latency, saturation, business KPI
> - Rollback triggers: exact thresholds that stop promotion
> - Owners: who decides promote / hold / rollback
```

At minimum, define:

- **Scope** — e.g. 5% traffic, one region, internal users only
- **Window** — e.g. 30 minutes, 2 hours, one business cycle
- **Signals** — system health + user outcome + business impact
- **Thresholds** — e.g. error rate +1%, p95 latency +200 ms, failed checkout rate above baseline

### 2. Prepare the Watchlist

Track the checks explicitly instead of keeping them in chat history:

```sql
CREATE TABLE IF NOT EXISTS canary_checks (
  id TEXT PRIMARY KEY,
  signal TEXT NOT NULL,
  baseline TEXT,
  threshold TEXT NOT NULL,
  owner TEXT,
  status TEXT DEFAULT 'watching',   -- watching | healthy | breached | investigating | rolled_back
  notes TEXT
);

INSERT INTO canary_checks (id, signal, baseline, threshold, owner, notes) VALUES
  ('api-errors', '5xx error rate', '<0.3%', 'rollback if >0.8% for 10m', 'oncall', 'Compare to previous release baseline'),
  ('api-latency', 'p95 latency', '420ms', 'hold if >650ms for 15m', 'backend', 'Use the production dashboard'),
  ('biz-kpi', 'checkout success rate', '97.2%', 'rollback if <96.5%', 'product', 'Business health guardrail');
```

If the release touches multiple subsystems, separate checks by component so one breach
does not get hidden inside a blended dashboard.

### 3. Start the Limited Rollout

Document the exact release and blast radius:

```text
> We are starting canary for [release] at [time].
> Scope: [traffic slice / cohort / region]
> Watch for: [top 3 signals]
> Rollback if: [explicit thresholds]
```

Useful operational questions:

1. What changed in this release that could move these metrics?
2. What baseline are we comparing against?
3. Which signals are leading indicators vs lagging indicators?
4. Who has authority to rollback immediately?

### 4. Watch Signals in Layers

Do not watch only infrastructure graphs. Use three layers:

| Layer | Examples | Why it matters |
|------|----------|----------------|
| **System health** | 5xx rate, p95 latency, queue depth, CPU, memory | Detect operational regressions quickly |
| **User journey** | login success, checkout completion, API success ratio | Detect failures users feel directly |
| **Business guardrails** | conversion, activation, payment completion | Detect silent but expensive regressions |

Prompt Copilot with the specific signals:

```text
> Evaluate this canary using the agreed thresholds.
> Tell me whether the result is PROMOTE, HOLD, or ROLLBACK.
> If HOLD or ROLLBACK, cite the breached signals and likely blast radius.
```

### 5. Investigate Before You Guess

If a signal breaches, do not immediately patch at random.

```text
> A canary guardrail breached.
> Start an investigation summary:
> - Which signal moved first?
> - Which release change most plausibly explains it?
> - What evidence would confirm or falsify that hypothesis?
> - Should we rollback now or continue the investigation in parallel?
```

Use `systematic-debugging` for the root-cause phase once the incident is contained.
Containment first, diagnosis second.

### 6. Promote, Hold, or Roll Back

Make the decision explicit:

```text
PROMOTE  — all required signals stayed inside thresholds for the full watch window
HOLD     — no critical breach, but confidence is not high enough to expand safely
ROLLBACK — one or more hard rollback triggers fired
```

Decision rules:

- **PROMOTE** only when the full watch window is complete
- **HOLD** when data is noisy, missing, or contradictory
- **ROLLBACK** when user impact or irreversible risk is plausible, not only when it is proven

### 7. Capture What the Canary Taught You

Every canary should improve the next release:

```text
> Summarize the canary outcome:
> - What signals were most informative?
> - Which thresholds were too loose or too strict?
> - What dashboard, alert, or rollout automation should change before the next release?
```

Feed the result into `sprint-retro` or the next `release` checklist.

## Examples

### API Release Canary

```text
> Run a canary review for api:v2.4.0.
> Scope: 10% traffic in us-east.
> Watch window: 45 minutes.
> Hard rollback triggers:
> - 5xx rate > 1%
> - p95 latency > baseline + 250ms
> - login success rate drops below 98%
```

### Feature Flag Canary

```text
> We enabled the new onboarding flow for 50 internal users.
> Build a canary checklist with:
> - user journey checkpoints
> - product KPI guardrails
> - rollback criteria if completion drops or support tickets spike
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The deploy succeeded, so the release is good" | Deployment success says nothing about runtime correctness under real traffic. |
| "Let's just watch one dashboard" | Single dashboards hide user-facing and business regressions. |
| "We can investigate before rolling back" | If rollback criteria are met, contain first. Guessing while impact grows is not discipline. |
| "The signal is probably noisy" | Noisy signals need better thresholds, not wishful interpretation during a live canary. |

## Red Flags

- No explicit rollback threshold before rollout starts
- Canary scope is unknown or keeps changing mid-watch
- Only infrastructure metrics are monitored
- A guardrail is breached but nobody owns the decision
- Promotion happens before the agreed watch window completes

## Verification

- [ ] The canary has an explicit scope, watch window, and owner
- [ ] System, user, and business signals are all represented
- [ ] Rollback triggers are defined before traffic is expanded
- [ ] The final outcome is explicitly labeled PROMOTE, HOLD, or ROLLBACK
- [ ] Follow-up improvement notes were captured for the next release

## Tips

- **Smaller first slice, faster learning**: start with the smallest cohort that still gives signal
- **Baseline everything**: compare to the prior stable release, not memory
- **Separate hard vs soft thresholds**: some breaches require rollback, others require a hold
- **Automate the boring parts**: the watchlist and decision log belong in SQL or release tooling

## See Also

- [`release`](../release/SKILL.md) — release preparation, tagging, and rollout handoff
- [`sprint-workflow`](../sprint-workflow/SKILL.md) — end-to-end delivery now including monitoring
- [`systematic-debugging`](../../development/systematic-debugging/SKILL.md) — root-cause workflow after containment
- [`sprint-retro`](../sprint-retro/SKILL.md) — fold canary lessons into the next sprint
