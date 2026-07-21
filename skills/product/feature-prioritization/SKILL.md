---
name: feature-prioritization
description: Use when you have a backlog of features and need to rank them for the next sprint — scores each feature using Impact × Confidence × Effort matrix with SQL tracking for transparent prioritization.
metadata:
  category: product
---

# Feature Prioritization

Stop arguing about what to build. Use a scoring matrix to make prioritization
decisions fast, defensible, and transparent. Track everything in SQL so the
decision logic is auditable.

## The Matrix

Score each feature on three dimensions (1-5 scale):

| Dimension | 1 (Low) | 3 (Medium) | 5 (High) |
|-----------|---------|-----------|---------|
| **Impact** | Nice-to-have, <5% of users | Useful for core segment | Critical path, >30% of users or major revenue |
| **Confidence** | Hunch / no data | 1-2 data points | Validated by user research / A/B test |
| **Effort** | 5 = lowest (easy) | 3 = medium | 1 = highest (hardest) |

**Score = Impact × Confidence × Effort** (higher = higher priority)

> Note: Effort scoring is **inverted** — easy things score higher because ROI is better.

## Setup

```sql
CREATE TABLE features (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    impact INTEGER,          -- 1-5
    confidence INTEGER,      -- 1-5
    effort INTEGER,          -- 1-5 (5=easy, 1=very hard)
    score REAL,              -- impact * confidence * effort
    status TEXT DEFAULT 'backlog',  -- backlog | in_sprint | shipped | rejected
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Workflow

### Step 1: List and Describe Features

```text
> I have the following feature requests for [product area]:
> [paste feature list or backlog items]
>
> For each feature, write a 1-sentence description of the user benefit.
> Then help me think through the scoring dimensions.
```

### Step 2: Score Each Feature

```text
> Let's score each feature against our prioritization matrix.
>
> For [Feature X]:
> - Impact: What % of users does this affect? Is it on the critical path to revenue?
> - Confidence: Do we have user research, data, or is this a hypothesis?
> - Effort: Engineering complexity estimate (S/M/L → 5/3/1)
>
> Challenge my assumptions if something seems over- or under-valued.
```

### Alternative Frameworks

Impact × Confidence × Effort is the default because it is fast and transparent, but
it is not the only valid framework. Switch when the situation calls for it:

| Framework | Best for | Trade-off vs. this matrix |
|-----------|----------|---------------------------|
| **RICE** (Reach × Impact × Confidence ÷ Effort) | Larger backlogs where reach varies widely (e.g., 50 users vs. 50,000) | Adds an explicit reach term instead of folding it into Impact |
| **ICE** (Impact × Confidence × Ease) | Fast, low-ceremony triage with a small team | Simpler but less precise than RICE or this matrix |
| **MoSCoW** (Must / Should / Could / Won't) | Scope-cutting inside a fixed release, not ongoing backlog ranking | Categorical, not a numeric score — pairs well with `launch-strategy` tiers |
| **Kano Model** (Basic / Performance / Delighter) | Understanding *why* a feature matters to satisfaction, not just urgency | Requires user surveys; slower than a team scoring session |

If the backlog spans wildly different audience sizes, prefer RICE over this matrix.
If the team needs a same-meeting decision, ICE is faster. Record which framework was
used in the `notes` column so future prioritization stays comparable.

### Step 3: Insert into SQL

```sql
INSERT INTO features (id, title, description, impact, confidence, effort, score) VALUES
  ('f1', 'SSO integration', 'Enable login via corporate SSO (Okta, Azure AD)', 5, 4, 3, 60),
  ('f2', 'Dark mode', 'UI theme toggle', 2, 3, 4, 24),
  ('f3', 'Bulk import', 'Import records from CSV', 4, 5, 3, 60),
  ('f4', 'Email digest', 'Weekly summary email to users', 3, 2, 5, 30),
  ('f5', 'Public API v2', 'REST API for third-party integrations', 5, 3, 1, 15);
```

### Step 4: Generate the Priority Stack

```sql
-- Prioritized backlog
SELECT id, title, impact, confidence, effort, score,
       RANK() OVER (ORDER BY score DESC) as priority_rank
FROM features
WHERE status = 'backlog'
ORDER BY score DESC;
```

### Step 5: Sense-Check with Copilot

```text
> Here's our prioritized feature list:
> [paste SQL output]
>
> Does this ranking look right to you? Are there any features where
> the score doesn't match your intuition? Flag them and explain why.
>
> Also: are there any dependencies between features we haven't accounted for?
```

### Step 6: Sprint Assignment

```sql
-- Move top 3 to current sprint
UPDATE features SET status = 'in_sprint'
WHERE id IN (
    SELECT id FROM features
    WHERE status = 'backlog'
    ORDER BY score DESC
    LIMIT 3
);
```

## Adjustments and Special Cases

### Must-Do Items (Compliance, Security)

Some features must be done regardless of score:

```sql
-- Force-rank compliance items
ALTER TABLE features ADD COLUMN is_mandatory INTEGER DEFAULT 0;
UPDATE features SET is_mandatory = 1 WHERE id IN ('gdpr-compliance', 'soc2-logging');
```

Query: mandatory items always come first, then by score.

### Strategic Bets

For high-impact, low-confidence, high-effort features (score is low but strategically important):

```text
> Feature [X] scores low because confidence is low. But strategically it could be
> a major differentiator. What's the cheapest experiment to raise confidence?
```

Before committing serious resources, run a **free-AI reproducibility check**: can the
core deliverable or value proposition be reproduced with a single prompt to an
off-the-shelf frontier model?

- If **yes**, treat that as a **risk signal**, not an automatic dead verdict
- Raise the evidence bar on three follow-up questions:
  1. What meaningful differentiation exists beyond the raw capability?
  2. What distribution or go-to-market advantage helps *us* reach users?
  3. What proprietary assets, workflows, or data make the offer harder to clone?

Also correct for a common false positive: **demand does not equal access**. Users wanting
something is not proof that *you* can capture that demand. Incumbents, distribution
barriers, switching costs, or already-dominant solutions may absorb the opportunity first.
Positive signals such as active user requests or live paid advertising in the category
mean "the market exists," not "we have a wedge."

## Example Run

```text
> Score these 5 features from our Q2 roadmap:
> 1. Audit logs (compliance requirement, requested by 3 enterprise prospects)
> 2. Mobile app (requested by community, no revenue signal yet)
> 3. Faster search (top complaint in support tickets, affects all users)
> 4. Zapier integration (medium demand, very quick to build)
> 5. AI summaries (trendy, uncertain user value, long build time)
```

Expected output: Audit logs and Faster search rank first (high impact + confidence).
Zapier ranks high despite moderate demand (low effort = high ROI).
AI summaries rank low unless confidence can be raised.

## Tips

- **Score as a team**: Alignment on scoring surfaces hidden assumptions
- **Revisit quarterly**: Scores change as you learn more and market shifts
- **Track rejected features**: Record why you said no **and** assign a short named kill pattern such as `no distribution moat`, `commodity capability`, or `demand without access` so repeated failure modes become recognizable instead of being relitigated
- **Weight the dimensions**: If velocity is critical, multiply effort score by 2
- **Use SQL for transparency**: Share the scored backlog with stakeholders
