---
name: ecosystem-intake
description: Use when monitoring a curated ecosystem source and you need to turn new items into concrete adopt/adapt/reject backlog candidates — combines GitHub-native reading with SQL triage and repository-fit scoring.
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
  copilot_feature: "GitHub MCP, web fetch, session SQL database, task delegation"
---

# Ecosystem Intake

Curated lists are only useful if they turn into decisions. This skill converts ecosystem
inputs like `awesome-claude-code`, release notes, or community skill collections into a
structured **adopt / adapt / reject** backlog for this repository.

## Why This is Copilot-Exclusive

The value is not generic web research. The value is combining **GitHub-native repository
inspection** with **session SQL tracking** in one workflow:

- GitHub MCP or `web_fetch` to read the upstream list or repo state
- SQL tables to track candidate items and triage status
- Copilot task routing to decide whether a candidate becomes a new skill, an update, or a rejection

This makes the output actionable instead of leaving it as a loose research note.

## When to Use

- A curated list like `awesome-claude-code` gained new entries and you want backlog candidates
- A monitored ecosystem repo added a new command, skill, hook, or workflow worth evaluating
- You want to scan merged PRs or README diffs and convert them into concrete next steps
- You need a repeatable intake process instead of ad-hoc "maybe we should copy this"

## When NOT to Use

| Instead of ecosystem-intake | Use |
|-----------------------------|-----|
| Deep evidence-gathering on a broad technical topic | `deep-research` |
| Translating one known external pattern into a new skill | `skill-creator` |
| Choosing how to execute an already-approved task | `task-intake-router` |

## Intake Outcome Categories

Each candidate should end in exactly one bucket:

| Outcome | Meaning |
|---------|---------|
| **Adopt** | Create a new skill or workflow because the gap is real and distinct |
| **Adapt** | Update an existing skill because the idea fits, but the primitive already exists here |
| **Reject** | Do not add it; document why it is redundant, incompatible, or low value |

## Workflow

### 1. Define the Intake Source

Start with a single explicit source and a narrow question:

```text
> Run intake on [source].
> Focus on: [skills / hooks / slash commands / tooling]
> Goal: identify adopt/adapt/reject candidates for this repository.
```

Good examples:

- `hesreallyhim/awesome-claude-code` README changes from the last week
- merged PRs in a monitored repo
- one section of a curated list, such as Agent Skills or Hooks

### 2. Read the Source as Structured Inputs

Use GitHub-native reads where possible:

```text
Tool: github-mcp-server-get_file_contents
  owner: "hesreallyhim"
  repo: "awesome-claude-code"
  path: "README.md"
```

If GitHub access is not the best fit, use `web_fetch` on the canonical page.

Capture at minimum:

- source URL or repo path
- item name
- source section
- short description
- evidence that it is new, noteworthy, or community-validated

### 3. Load Candidates into SQL

Track intake explicitly so decisions are queryable:

```sql
CREATE TABLE IF NOT EXISTS ecosystem_candidates (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  section TEXT,
  item_name TEXT NOT NULL,
  item_type TEXT,         -- skill | hook | command | tool | pattern
  summary TEXT,
  fit_score INTEGER,      -- 1-5
  action TEXT,            -- adopt | adapt | reject
  target_path TEXT,
  rationale TEXT,
  status TEXT DEFAULT 'pending'
);
```

Then insert each candidate:

```sql
INSERT INTO ecosystem_candidates (
  id, source, section, item_name, item_type, summary, fit_score, status
) VALUES (
  'awesome-agent-skill-1',
  'hesreallyhim/awesome-claude-code',
  'Agent Skills',
  'context-prime',
  'skill',
  'Session-start context loading workflow',
  4,
  'pending'
);
```

### 4. Score Repository Fit

Score each item before deciding:

| Question | High-fit signal |
|----------|-----------------|
| Does this solve a clear gap in our catalog? | No existing skill covers it well |
| Is the value Copilot-native after translation? | Can be expressed with GitHub MCP, SQL, task agents, or plan/autopilot |
| Is the concept reusable across repos? | Not tied to one private toolchain |
| Is it distinct enough to maintain? | Not just a slight wording variant of an existing skill |

Use `fit_score` as a forcing function:

- **5** — obvious gap, strong candidate to adopt
- **4** — good fit, likely adapt or adopt
- **3** — plausible but needs stronger differentiation
- **1-2** — reject unless a real user need appears

### 5. Decide: Adopt, Adapt, or Reject

For each candidate, record one action and one reason:

```text
> For each candidate, decide:
> - Adopt: create a new skill
> - Adapt: update an existing skill
> - Reject: document why we should not add it
> Include the exact target skill or file path when adapting.
```

Typical patterns:

- **Adopt** → new gap like `deployment-canary`
- **Adapt** → existing skill already covers the user problem with room for a stronger workflow
- **Reject** → upstream concept depends on Claude-only hooks, or duplicates what we already ship

### 6. Create a Backlog-Ready Output

Do not stop at observations. Produce an execution-ready backlog:

```markdown
| Candidate | Source | Action | Target | Why |
|-----------|--------|--------|--------|-----|
| deployment-canary | gstack | adopt | skills/workflow/deployment-canary/ | release monitoring gap |
| /review | gstack | adapt | skills/development/code-review/ | existing review skill already present |
| PreCompact hook helper | claude-code | reject | n/a | Claude-specific primitive, not user-facing in Copilot |
```

If there are enough concrete items, add SQL todos for the top actions.

### 7. Learn from Rejected Items

Rejected candidates still have value:

- they reveal what quality threshold the ecosystem expects
- they surface upstream concepts that should remain notes rather than user-facing skills
- they help prevent duplicate or low-value additions later

Use this especially with rejected issues or stale PRs from curated-list ecosystems.

## Examples

### Intake from awesome-claude-code

```text
> Read the Agent Skills and Hooks sections of awesome-claude-code.
> Create an adopt/adapt/reject backlog for this repository.
> Prefer Copilot-native translations, not direct Claude clones.
```

### Intake from a Skill Collection Repo

```text
> Compare a monitored skill collection against our existing catalog.
> Surface only the top 5 highest-fit gaps or updates.
> Reject anything already covered by our current skills.
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Let's add every interesting thing we find" | Intake without filtering creates catalog sprawl. |
| "If the community merged it, we should copy it" | Community validation matters, but repository fit still decides. |
| "Rejected ideas are wasted work" | Rejection criteria are how you keep the collection coherent. |
| "Research notes are enough" | If it never becomes adopt/adapt/reject, it is not intake — it is browsing. |

## Red Flags

- The source is broad, but the intake question is vague
- Candidates are listed with no final action
- "Adapt" is chosen without naming the target skill
- Claude-specific primitives are copied directly into Copilot-facing guidance
- The backlog keeps growing with no rejection discipline

## Verification

- [ ] Every candidate has a source, section, and short summary
- [ ] Every candidate ends in adopt, adapt, or reject
- [ ] Adapt items name an existing target skill or file path
- [ ] Rejections include a concrete reason, not just "not now"
- [ ] The final output is backlog-ready rather than a loose research note

## Tips

- **One source at a time**: intake quality drops when you mix too many upstream sources in one pass
- **Prefer section-level intake**: "Hooks" or "Agent Skills" is easier to score than an entire giant README
- **Reject aggressively**: a smaller, sharper catalog is more useful than a large noisy one
- **Use SQL as the decision log**: it is easier to compare successive intake passes when the state is queryable

## See Also

- [`deep-research`](../../workflow/deep-research/SKILL.md) — broad multi-source evidence gathering
- [`task-intake-router`](../task-intake-router/SKILL.md) — route approved work to the right execution path
- [`skill-creator`](../../development/skill-creator/SKILL.md) — turn an adopted candidate into a real SKILL.md
- [`github-issue-triage`](../github-issue-triage/SKILL.md) — triage large GitHub backlogs with built-in MCP tools
