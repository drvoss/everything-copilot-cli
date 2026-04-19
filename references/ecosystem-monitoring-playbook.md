# Ecosystem Monitoring Playbook Reference

> Related skills: [`ecosystem-intake`](../skills/copilot-exclusive/ecosystem-intake/SKILL.md), [`team-planner`](../skills/copilot-exclusive/team-planner/SKILL.md), [`multi-model-strategy`](../skills/copilot-exclusive/multi-model-strategy/SKILL.md), [`evaluate-repository`](../skills/security/evaluate-repository/SKILL.md)

---

## 1. What to preserve

Commit the **operating model**, not a brittle snapshot.

Keep durable:

- cadence rules for how often a source deserves review
- watchlist fields so future passes are comparable
- prompt archetypes for different source types
- output requirements that end in adopt / adapt / reject

Keep out of the repo until repeatedly validated:

- exact repo rankings
- live star counts, release counts, or "last checked" dates
- hard-coded recommendations to add skills that have not been reviewed yet
- automation configs for scheduled crawlers that do not exist yet

---

## 2. Cadence rubric

Use cadence as a **signal budget** decision:

| Cadence | Use when | Typical source types | Expected output |
|---------|----------|----------------------|-----------------|
| **Daily** | An upstream changes fast enough to alter existing Copilot guidance within days | core CLI changelogs, high-signal curated lists, actively evolving skill collections | triage note or concrete adapt/reject decisions |
| **Weekly** | The source changes regularly, but missing a few days is acceptable | official ecosystems, reference skill repos, active frameworks, tooling release notes | backlog-ready adopt/adapt candidates |
| **Monthly** | Changes are meaningful but slower-moving | stable reference implementations, mature frameworks, lower-volume ecosystem indexes | pattern refresh or targeted backlog updates |
| **On-demand** | The source is mostly static, dormant, or only useful for periodic re-harvest | archival datasets, mostly inactive frameworks, one-time pattern libraries | design reference only |

If a source starts producing repeated "no-op" reviews, downgrade it. If it repeatedly changes active
skills or rules in this repo, upgrade it.

---

## 3. Watchlist record template

Track sources as structured rows, not prose paragraphs:

| Field | Meaning |
|-------|---------|
| `source` | owner/repo or canonical URL |
| `source_type` | skill-collection, curated-list, changelog, framework, tool, reference implementation |
| `cadence` | daily, weekly, monthly, on-demand |
| `prompt_type` | A, B, C, or D |
| `signal_focus` | what to look for first |
| `translation_target` | which existing skill, guide, or rule this most likely affects |
| `last_reviewed` | date of the last real review |
| `evidence_link` | release, PR, README diff, or issue link |
| `notes` | short rationale, not a mini essay |

Example row shape:

```text
source: owner/repo
source_type: curated-list
cadence: weekly
prompt_type: C
signal_focus: new hooks and agent skills
translation_target: skills/copilot-exclusive/ecosystem-intake/
last_reviewed: 2026-04-19
evidence_link: README diff or merged PR
notes: strong discovery source, but filter aggressively
```

---

## 4. Prompt archetypes

Choose the prompt shape based on the source, not personal preference.

### Type A — Skill collection direct compare

Use when the source mostly ships reusable skills, commands, or checklists.

**Goal**

1. list the source artifacts
2. compare them with this repo's current catalog
3. separate new gaps from already-covered concepts
4. end with adopt / adapt / reject decisions

**Prompt skeleton**

```text
Compare [source] against our current skill catalog.
Focus on the top [N] missing or materially stronger workflows.
Reject near-duplicates and anything tied to upstream-only primitives.
Return adopt/adapt/reject with exact target paths.
```

### Type B — Changelog or release analysis

Use when the source's value is driven by releases, changelogs, or notable commits.

**Goal**

1. read changes since the last review
2. classify them as existing-skill impact, new skill idea, or irrelevant
3. name the affected local files when impact exists

**Prompt skeleton**

```text
Review [source] changes since [date or release].
Classify each meaningful change as:
1. impacts an existing skill or guide here
2. suggests a new candidate
3. no repository action
Name the exact local file path for any adapt recommendation.
```

### Type C — Curated list filtering

Use when the source is a discovery layer that links outward.

**Goal**

1. identify newly added items
2. filter to platform-relevant entries
3. decide which linked repos deserve deeper intake

**Prompt skeleton**

```text
Read the newly added items from [source].
Filter for entries that are reusable in Copilot CLI, not vendor-locked features.
For each relevant item, recommend:
- reject now
- queue for deeper intake
- adapt an existing local skill
Include the reason in one line.
```

### Type D — Framework or reference pattern extraction

Use when you are not copying artifacts directly, but learning from architecture, patterns, or
protocol changes.

**Goal**

1. identify meaningful architectural or protocol changes
2. describe the reusable pattern
3. connect it to a local skill, guide, or future idea

**Prompt skeleton**

```text
Check whether [source] added or changed any reusable patterns since the last review.
Ignore routine churn.
Summarize only patterns that strengthen an existing local skill, guide, or orchestration concept.
Prefer design references over direct copying.
```

---

## 5. Output contract

Every monitoring pass should end in one of three repository actions:

| Action | Meaning | Required detail |
|--------|---------|-----------------|
| **Adopt** | create a new artifact because the gap is real | proposed path + why existing assets are insufficient |
| **Adapt** | strengthen an existing artifact | exact local file path + what changes |
| **Reject** | do not add it now | concrete reason: duplicate, vendor-specific, low fit, or stale |

Do not stop at "interesting." If there is no action, it is browsing, not intake.

---

## 6. Multi-model review pattern

Use multiple models only when their roles differ:

| Role | Recommended model | Why |
|------|-------------------|-----|
| Scout | `claude-haiku-4.5` or built-in GitHub tools | fast collection of diffs, release notes, and repo structure |
| Synthesizer | `gpt-5.4` or `claude-sonnet-4.6` | classifies signals into adopt/adapt/reject with good judgment |
| Builder | `gpt-5.3-codex` | turns approved doc or skill updates into precise edits |
| Reviewer | `gpt-5.4` or `claude-opus-4.6` | checks whether the proposed change is durable and repo-safe |

Recommended flow:

1. gather evidence with GitHub-native reads
2. ask a synthesizer model to classify repository impact
3. use Codex only after the change is approved and scoped
4. run a reviewer pass before committing if the change adds new guidance

Model availability changes over time. Re-check `/model` or current Copilot docs before treating any
specific model name here as a stable default.

---

## 7. Hand-off boundaries

Escalate beyond `ecosystem-intake` when needed:

- use [`evaluate-repository`](../skills/security/evaluate-repository/SKILL.md) when a linked repo
  needs deep quality or security review before adoption
- use [`team-planner`](../skills/copilot-exclusive/team-planner/SKILL.md) when monitoring becomes
  a parallel fleet task
- use [`skill-creator`](../skills/development/skill-creator/SKILL.md) only after an item is clearly
  in the **Adopt** bucket

---

## 8. Anti-patterns

- committing a large ranked watchlist as if it were evergreen truth
- mixing four source types into one intake pass
- copying Claude-specific hooks directly into Copilot-facing guidance
- treating release churn as evidence of repository fit
- using Codex to implement before a higher-level model has classified the signal
