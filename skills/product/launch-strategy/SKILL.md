---
name: launch-strategy
description: Plan and execute a product launch using a structured checklist covering positioning, distribution, messaging, and success metrics. From private beta to public launch.
metadata:
  category: product
---

# Launch Strategy

A product launch isn't a single event — it's a coordinated campaign with phases.
This skill structures your launch from private beta through public announcement,
ensuring nothing falls through the cracks.

## Launch Tiers

| Tier | Audience | Goal |
|------|----------|------|
| **Alpha** | Internal team only | Find critical bugs |
| **Private Beta** | Invited users | Validate product-market fit signal |
| **Public Beta** | Self-serve signup | Gather scale feedback, build pipeline |
| **GA Launch** | Everyone | Revenue growth, press, distribution |

## Pre-Launch Checklist

### Product Readiness

```
> Evaluate our launch readiness against these criteria:
> - Core use case works end-to-end without errors
> - Onboarding is < 5 minutes to first value
> - Key user flows have error handling (not just happy path)
> - Performance is acceptable under expected load
> - Mobile/responsive works if applicable
```

### Positioning and Messaging

```
> Help me write the positioning for [product/feature]:
>
> 1. One-liner: "[Product] is the [category] for [target customer] who [key need]"
> 2. Elevator pitch (3 sentences): What it does, who it's for, why now
> 3. Key benefits (3 bullets): Outcomes, not features
> 4. Differentiation: How are we different from [Competitor A] and [Competitor B]?
> 5. Proof point: What evidence do we have this matters to users?
```

### Distribution Channels

```
> For [product type], help me identify the best launch channels:
>
> Our target users: [describe ICP]
> Budget: [free / paid / both]
> Existing audience: [email list size, Twitter followers, etc.]
>
> Prioritize channels by: reach, conversion likelihood, time-to-impact
```

Common channels to evaluate:
- Product Hunt (best for developer tools, B2C, SaaS)
- Hacker News: Show HN (best for technical audiences)
- Twitter/X product announcement thread
- LinkedIn article (B2B)
- Email to waitlist / existing users
- Partner newsletters / podcasts
- Direct outreach to key accounts

### Success Metrics

```
> Define success metrics for our [tier] launch:
>
> Primary: [the one number that matters most]
> Secondary: [3-5 supporting metrics]
> Guardrails: [metrics we're watching to catch regressions]
>
> Time horizon: [1 day / 1 week / 30 days post-launch]
```

## Launch Plan Template

```
> Create a launch plan document for [product/feature]:
>
> Launch date: [date]
> Launch tier: [alpha/beta/GA]
> Target audience: [ICP]
>
> Include:
> - T-7 days: What needs to be done one week before
> - T-1 day: Final prep checklist
> - Launch day: Hour-by-hour sequence
> - T+7 days: Post-launch review criteria
```

## SQL Launch Tracker

```sql
CREATE TABLE launch_tasks (
    id TEXT PRIMARY KEY,
    phase TEXT,          -- pre_launch | launch_day | post_launch
    category TEXT,       -- product | marketing | comms | eng | success
    title TEXT NOT NULL,
    owner TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT
);

INSERT INTO launch_tasks VALUES
  ('lp1', 'pre_launch', 'product', 'Complete end-to-end smoke test', 'eng', 'T-2', 'pending', ''),
  ('lp2', 'pre_launch', 'marketing', 'Write Product Hunt description', 'marketing', 'T-3', 'pending', ''),
  ('lp3', 'pre_launch', 'comms', 'Prepare launch email to waitlist', 'marketing', 'T-2', 'pending', ''),
  ('lp4', 'launch_day', 'marketing', 'Post on Product Hunt at 12:01 AM PST', 'marketing', 'T0', 'pending', ''),
  ('lp5', 'launch_day', 'comms', 'Send waitlist email at 9 AM', 'marketing', 'T0', 'pending', ''),
  ('lp6', 'post_launch', 'success', 'Review activation metrics at T+24h', 'product', 'T+1', 'pending', '');

-- Track progress
SELECT phase, category, title, status
FROM launch_tasks
ORDER BY phase, category;
```

## Post-Launch Review

```
> We launched [X] on [date]. Here are our results:
> [metrics]
>
> Generate a post-launch analysis:
> 1. What did we expect vs. what happened?
> 2. What distribution channel drove the most value?
> 3. What user feedback patterns emerged in the first 48 hours?
> 4. What would we do differently?
> 5. What's the next milestone (path to [next tier / revenue goal])?
```

## Tips

- **Nail the narrative before writing copy**: Positioning first, then messaging, then distribution
- **Sequence channels**: Don't blast everything simultaneously — stagger for sustained momentum
- **Have a war room**: Assign someone to monitor metrics and respond to users on launch day
- **Pre-write your responses**: Draft answers to the 10 most likely questions before launch
- **Soft-launch first**: A private beta with 50 users is worth more than a public launch with bugs
- **Build the list before you need it**: Start collecting emails/signups weeks before launch
