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

### 0. Load the recurring-monitoring playbook when needed

If you are setting up or revisiting an ongoing watchlist, load the reference playbook first:

> [`references/ecosystem-monitoring-playbook.md`](../../../references/ecosystem-monitoring-playbook.md)

Use it to choose:

- the review cadence (daily / weekly / monthly / on-demand)
- the source record fields you will track
- the correct prompt archetype for the source (`Type A` through `Type D`)
- the point where a multi-model handoff is justified

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

If the source is part of a recurring watchlist, record the prompt archetype explicitly:

- **Type A** — direct comparison against another skill collection
- **Type B** — changelog or release analysis
- **Type C** — curated-list filtering
- **Type D** — framework/reference pattern extraction

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
- manifest version plus marketplace/registry version when the candidate is a packaged plugin or tool

### 2-A. Externalize selection rationale as audit evidence

Do not leave the choice buried as an implicit judgment call inside a PR description.
For any external plugin, skill, or tool that reaches serious consideration, create a
written evidence artifact that records:

- what capability need triggered the evaluation
- which source evidence made the candidate worth reviewing
- why the selected candidate won over the alternatives
- any unresolved risks, tradeoffs, or follow-up checks

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

Before deciding, run a **coverage-first gate**:

- search the current repository for an existing skill, guide, or reference that already captures the
  upstream delta
- if coverage already exists, classify the candidate as **Reject** with rationale `covered locally`
  instead of creating duplicate edits
- cite the existing local path and add a re-review trigger describing what upstream change would
  make the item worth revisiting

Use `fit_score` as a forcing function:

- **5** — obvious gap, strong candidate to adopt
- **4** — good fit, likely adapt or adopt
- **3** — plausible but needs stronger differentiation
- **1-2** — reject unless a real user need appears

### 4-A. Build a capability ledger before adopting

Before adopting an external plugin, skill, or tool, enumerate the capabilities you
actually need and compare every candidate against **each** capability explicitly.
For every capability, either:

- mark it as covered by a specific candidate, or
- record it as an explicit catalog gap if no candidate covers it

Do not silently drop uncovered capabilities just because no candidate satisfies them.
The ledger should make missing coverage visible so the intake result stays auditable.

For packaged plugins, also verify **version parity** before adoption: check that the
version declared in the manifest matches the version shown in the marketplace or
registry, so stale or mismatched packaging is caught before it enters the catalog.

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
- **Reject** → upstream concept depends on Claude-only hooks, duplicates what we already ship, or
  is already covered locally in a committed file

### 6. Create a Backlog-Ready Output

Do not stop at observations. Produce an execution-ready backlog:

```markdown
| Candidate | Source | Action | Target | Why | Re-review trigger |
|-----------|--------|--------|--------|-----|-------------------|
| deployment-canary | gstack | adopt | skills/workflow/deployment-canary/ | release monitoring gap | n/a |
| built-in review chaining | claude-code | adapt | skills/workflow/sprint-workflow/ | review step already exists locally, but upstream added a stronger composition pattern | if Copilot adds comparable programmatic built-in chaining |
| make-pdf | gstack | reject | n/a | heavy renderer/runtime dependency for a markdown-first repo | if a markdown-first or low-dependency variant becomes reusable here |
| prompt-injection-defense | gstack | reject | n/a | upstream approach depends on a local model stack we do not ship | if a rules-first or lightweight variant emerges |
| PreCompact hook helper | claude-code | reject | n/a | Copilot's `preCompact` hook exists but is notification-only (cannot act before compaction like Claude's) | if Copilot's `preCompact` gains the ability to act (inject state) before compaction, not just observe |
| hooks parity in `--agent` | claude-code | adapt (2026-07-20) | hooks-to-github-actions.md, migration-from-claude-code.md, copilot-vs-claude-code.md | v1.0.72 shipped a native 14-event hook system (preToolUse/postToolUse/agentStop/subagentStop/preCompact/etc.) — trigger fired, re-review happened | if Copilot's `preCompact` becomes able to act, not just observe |
```

If there are enough concrete items, add SQL todos for the top actions.

### 7. Learn from Rejected Items

Rejected candidates still have value:

- they reveal what quality threshold the ecosystem expects
- they surface upstream concepts that should remain notes rather than user-facing skills
- they help prevent duplicate or low-value additions later
- they should carry a re-review trigger so the next monitoring pass does not restart from zero

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

### Recurring watchlist review (changelog source, Type B)

```text
> Use ecosystem-intake with the monitoring playbook reference.
> Treat this source as Type B (changelog analysis).
> Review only changes since the last pass and end in adopt/adapt/reject.
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
- [ ] Adopted or adapted external candidates have a written audit-evidence record
- [ ] Required capabilities are tracked in a ledger with every capability marked as covered or reported as a gap
- [ ] Packaged plugin candidates passed a manifest-versus-marketplace version parity check
- [ ] The final output is backlog-ready rather than a loose research note

## Tips

- **One source at a time**: intake quality drops when you mix too many upstream sources in one pass
- **Prefer section-level intake**: "Hooks" or "Agent Skills" is easier to score than an entire giant README
- **Reject aggressively**: a smaller, sharper catalog is more useful than a large noisy one
- **Use SQL as the decision log**: it is easier to compare successive intake passes when the state is queryable
- **Commit the playbook, not the snapshot**: durable cadence rules and prompt shapes belong in the repo; volatile rankings and live metrics usually do not

## See Also

- [`deep-research`](../../workflow/deep-research/SKILL.md) — broad multi-source evidence gathering
- [`task-intake-router`](../task-intake-router/SKILL.md) — route approved work to the right execution path
- [`skill-creator`](../../development/skill-creator/SKILL.md) — turn an adopted candidate into a real SKILL.md
- [`github-issue-triage`](../github-issue-triage/SKILL.md) — triage large GitHub backlogs with built-in MCP tools
- [`references/ecosystem-monitoring-playbook.md`](../../../references/ecosystem-monitoring-playbook.md) — recurring watchlist cadence, prompt archetypes, and multi-model handoff rules
