---
name: opportunity-solution-tree
description: Apply Teresa Torres' Opportunity Solution Tree (OST) framework to break down product outcomes into opportunities, solutions, and experiments. Connects every feature to a measurable business outcome.
metadata:
  category: product
---

# Opportunity Solution Tree (OST)

Teresa Torres' **Opportunity Solution Tree** prevents building features that don't
matter. It ensures every solution you build is connected to a real user pain
and a business outcome you care about.

## The Framework

```
Desired Outcome
└── Opportunity 1 (user pain / unmet need)
│   ├── Solution A
│   │   ├── Experiment 1
│   │   └── Experiment 2
│   └── Solution B
└── Opportunity 2
    └── Solution C
```

**Outcome**: A measurable business goal (OKR-level: "Increase trial-to-paid conversion by 15%")
**Opportunity**: A user pain, unmet need, or desire (discovered through research)
**Solution**: A product change that might address the opportunity
**Experiment**: The smallest thing you can build to test if the solution works

## Workflow

### Step 1: Define the Desired Outcome

```
> I'm building the OST for: [product/feature area]
>
> Help me define 1 crisp desired outcome. It should be:
> - Measurable (has a metric)
> - Achievable within the quarter
> - Aligned with business goals
>
> Context: Our goal is [business context]. Key metric: [current baseline].
```

### Step 2: Map the Opportunity Space

```
> Now let's map the opportunity space for this outcome.
>
> Based on [user research / support tickets / interview data / NPS feedback]:
> > [paste data here]
>
> Identify the top 5-7 user opportunities (pains, needs, desires) that, if addressed,
> would most directly improve [outcome metric].
>
> Format as a prioritized list with a one-sentence "when I [situation], I struggle to [pain]" statement for each.
```

### Step 3: Generate Solutions

For each top opportunity:

```
> For the opportunity: "[opportunity statement]"
>
> Generate 5-7 possible solutions. Include:
> - Conventional solutions (what everyone would build)
> - Lateral solutions (unexpected approaches)
> - Low-tech or process solutions (not just feature builds)
>
> For each, estimate: effort (S/M/L), confidence (Low/Med/High), impact potential (Low/Med/High)
```

### Step 4: Design Experiments

For your top-priority solution:

```
> For solution: "[solution name]"
>
> Design 3 experiments to test the core assumption, ordered from least to most expensive:
> 1. A concierge experiment (manual, no code)
> 2. A fake door / prototype test
> 3. An MVP build
>
> For each experiment, define:
> - The hypothesis: "We believe [solution] will [expected outcome] because [reason]"
> - The success metric
> - The time box
```

### Step 5: Build the Tree Visualization

```
> Generate a Markdown-formatted OST for:
>
> Outcome: [outcome]
> Opportunities: [list]
> Solutions per opportunity: [list]
> Experiments for priority solution: [list]
>
> Use nested Markdown lists with clear labels for each level.
> Add a "Current Focus" indicator on the solution we're pursuing.
```

## SQL Tracking

Use the session database to track OST items:

```sql
CREATE TABLE ost_items (
    id TEXT PRIMARY KEY,
    type TEXT,  -- outcome | opportunity | solution | experiment
    parent_id TEXT,
    title TEXT,
    status TEXT DEFAULT 'active',
    metric TEXT,
    notes TEXT
);

INSERT INTO ost_items VALUES
  ('O1', 'outcome', NULL, 'Increase trial-to-paid conversion 15%', 'active', 'trial_conversion_rate', ''),
  ('OP1', 'opportunity', 'O1', 'Onboarding takes too long to first value', 'active', NULL, ''),
  ('S1', 'solution', 'OP1', 'Progressive disclosure of features', 'active', NULL, ''),
  ('E1', 'experiment', 'S1', 'Show only 3 steps to first task', 'in_progress', 'time_to_first_task', '');
```

## Example: SaaS Conversion OST

```
Outcome: Increase trial-to-paid conversion rate from 12% to 18%

Opportunity 1: Users don't reach the "aha moment" before trial ends
  Solution A: Personalized onboarding based on role
    Experiment 1: Wizard with role selection (concierge test, 1 week)
    Experiment 2: Role-based dashboard (2-week MVP)
  Solution B: Proactive success manager outreach at day 3

Opportunity 2: Users don't trust us with their real data during trial
  Solution A: Pre-loaded demo data matching user's industry
  Solution B: "Import 10 rows free" limited trial import

Opportunity 3: Trial users don't share product with team
  Solution A: Collaborative invitation flow mid-trial
```

## Tips

- **One outcome at a time**: A single team can only optimize one metric at a time. Multiple outcomes = diffused focus.
- **Separate opportunity discovery from solution generation**: Don't jump to solutions before mapping pains.
- **Experiments > builds**: The goal is to learn cheaply. Most solutions shouldn't become builds.
- **Continuous tree**: OST is a living document. Update it weekly as you learn.
- **Start with existing data**: Support tickets, NPS verbatims, and session recordings are free opportunity maps.
