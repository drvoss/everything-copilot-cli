---
name: incident-response
license: MIT
description: Use when production users are affected or data integrity is at risk and someone must run the response — declare severity and roles, keep one timeline, separate mitigation from root cause, post status on a fixed cadence, and close with a blameless review whose actions have owners.
metadata:
  category: workflow
  agent_type: general-purpose
---

# Incident Response

An incident is a coordination problem before it is a debugging problem. Several people (and agents)
act at once, facts arrive out of order, and users want to know what is happening. This skill gives
the response a shape: one severity, named roles, one timeline, mitigation first, and a review that
turns the outage into tracked work.

## When to Use

- An alert, support report, or monitor shows users are failing, data is wrong, or a security
  boundary may be breached
- A deploy, migration, or config change is suspected of causing live harm
- More than one person or agent is already working the problem and nobody owns coordination
- After recovery, to run the post-incident review and record follow-up actions

## When NOT to Use

| Instead of incident-response | Use |
|------------------------------|-----|
| Watching a release that is still healthy behind a canary | `deployment-canary` |
| Finding the root cause once users are no longer affected | `systematic-debugging` |
| A failing test or CI job with no user impact | `actions-debugging` or `fix-build-errors` |
| A suspected vulnerability with no evidence of exploitation | `security-scan` or `threat-model-analyst` |

## Prerequisites

- A place everyone can read: an incident issue, a chat channel, or a shared document
- Access to the signals that show user impact (dashboards, logs, error tracker, status checks)
- Knowledge of the rollback or failover paths for the affected system

## Workflow

### 1. Declare and Assign Roles

Declare the incident as soon as impact is likely; downgrading later is cheap, declaring late is not.
Record a severity using the team's scale, or this default:

| Severity | Meaning |
|----------|---------|
| SEV1 | Core workflow down or data loss/exposure for many users |
| SEV2 | Major feature degraded, workaround exists, or a subset of users affected |
| SEV3 | Minor impact, no urgency beyond business hours |

Name three roles, even if one person holds two:

- **Incident lead** — owns decisions and priorities; does not debug
- **Operations lead** — runs the technical investigation and changes
- **Communications** — writes status updates and keeps the timeline

Open the record with the GitHub CLI when the team tracks incidents as issues (the `incident` label
must already exist — create it once with `gh label create incident`):

```powershell
gh issue create --title "SEV2: checkout errors after 14:05 deploy" --label incident `
  --body "Lead: @a  Ops: @b  Comms: @c  Status: investigating"
```

### 2. Keep One Timeline

Append every observation and action with a timestamp in one place. Write facts, not conclusions:
"14:12 error rate 8% on /checkout (dashboard X)" rather than "14:12 DB is overloaded". When an agent
runs commands, record the command, the time, and the output that drove a decision. Redact
credentials, personal data, and customer data; keep large raw output in an access-controlled place
and link to it from the timeline.

### 3. Mitigate Before You Diagnose

Stop the user impact first, with the least risky reversible action:

1. Roll back the suspected change, or turn off its feature flag
2. Fail over, shed load, or scale the saturated component
3. Block the abusive or malformed traffic

Each mitigation is a change: state it in the timeline before running it, and say how you will know
whether it worked. Root-cause work starts once impact is contained — hand it to
`systematic-debugging` with the timeline attached.

### 4. Communicate on a Fixed Cadence

Post status at a fixed interval (for example every 30 minutes for SEV1, 60 for SEV2), even when
nothing changed. Each update states: current impact, what is being done, and the time of the next
update. Do not speculate about cause in external updates.

### 5. Resolve and Review

Close the incident only after the recovery checks below pass. Within a few days, run a blameless
review:

- Timeline of detection, mitigation, and recovery, with times
- What made detection or mitigation slow
- Contributing causes (usually several), not a single culprit
- Actions, each with an owner and a due date, filed as issues

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "It's probably nothing, let's look first" | Late declaration is the most common reason incidents run long |
| "I'll fix the root cause, that's faster than rolling back" | A fix under pressure is an untested change; roll back first |
| "No new information, so no update" | Silence reads as abandonment; "no change, next update 15:30" is an update |
| "We know whose change caused it" | Blame stops people reporting; contributing causes stop recurrence |

## Red Flags

- Nobody can say who the incident lead is
- Several people are making production changes without writing them down
- The status update promises a cause or an ETA the team does not have
- The review produces "be more careful" instead of owned, dated actions

## Verification

- [ ] The user-facing signal that showed the impact is back to its baseline, not just a component
      health check
- [ ] The mitigation's side effects are checked (rolled-back data, disabled features, queued work)
- [ ] Any data written during the incident is confirmed correct, or a repair action is filed
- [ ] The timeline is complete enough for someone absent to follow the response
- [ ] Every review action has an owner, a due date, and an issue

If recovery checks fail after a mitigation, reopen the response at step 3 with the next mitigation
rather than declaring partial success.

## Tips

- Agents are useful as scribes and investigators: give one the timeline role and others bounded
  read-only investigations, and keep production changes with the operations lead
- Use the review actions as input to `deployment-canary` rollback triggers for the next release
