---
name: skill-creator
description: Use when you want to create a new SKILL.md file — describe a workflow and this skill generates a properly structured, frontmatter-complete SKILL.md that follows this repository's conventions
metadata:
  category: development
  agent_type: general-purpose
---

# Skill Creator

A meta-skill that produces new SKILL.md files. Describe what the skill should do,
and this skill generates a complete, convention-compliant SKILL.md file ready to commit.

## When to Use

- You want to add a new skill but are unsure of the required structure
- You have a workflow in mind and want to formalize it as a skill
- You are migrating a skill from another source and need to adapt it to this repo's format
- You need to translate an external slash-command or Claude-oriented pattern into Copilot-native primitives
- Bootstrapping multiple skills quickly for a new domain

## When NOT to Use

| Instead of skill-creator | Use |
|--------------------------|-----|
| Editing an existing skill | `edit` tool directly |
| Creating an agent definition | See `agents/` directory conventions in `AGENTS.md` |
| Writing an orchestration pattern | See `orchestration/patterns/` |

## Prerequisites

- A clear description of the workflow the skill should encode
- Knowledge of which `skills/` subdirectory it belongs to:
  - `development/` — coding, debugging, testing workflows
  - `security/` — security scanning, review, hardening
  - `testing/` — test strategy, eval, coverage
  - `documentation/` — doc generation, update workflows
  - `content/` — copywriting, SEO, content strategy
  - `product/` — PRD, launch, roadmap
  - `workflow/` — process workflows (research, release, sprint)
  - `copilot-exclusive/` — GitHub Copilot CLI-specific features
- Confirm the category already exists in this repository. Research-focused skills
  currently live under `workflow/`; adding a new category requires updating the
  shared allowlist in `scripts/skill-metadata.js` before introducing new files.

## Workflow

### 1. Gather requirements

Ask (or determine from context):

```text
1. What is the skill name? (kebab-case, e.g., `api-versioning-guide`)
2. What category does it belong to? (development / security / testing / etc.)
3. What triggers this skill? (When should an agent use it?)
4. What is the step-by-step workflow?
5. What are the verification criteria (Done When)?
6. Are there any anti-patterns or common mistakes to warn about?
```

**Important:** the description is the first routing clue an AI sees when deciding whether
to load a skill. If it is vague, the skill may be correct but still fail to trigger when
the user actually needs it.

### 2. Generate the SKILL.md

Use this template as a base and fill in the gathered information.
Replace all `[PLACEHOLDER]` tokens with real content:

```markdown
---
name: [kebab-case-name]
description: Use when [trigger condition] — [one-line description of output]
metadata:
  category: [category]
  agent_type: general-purpose
  # Optional when clearly useful:
  # copilot_feature: "[Copilot CLI feature or primitive]"
  # origin: "ported and adapted from [source]"
---

# [Title Case Name]

[One paragraph describing the skill's purpose and what it produces.]

## When to Use

- [Concrete trigger scenario 1]
- [Concrete trigger scenario 2]
- [Concrete trigger scenario 3]

## When NOT to Use

| Instead of [skill-name] | Use |
|-------------------------|-----|
| [alternative scenario] | [alternative skill or approach] |

## Prerequisites

- [Required setup or knowledge]
- [Tools or permissions needed]

## Workflow

### 1. [Step name]

[Description of what to do in this step.]

### 2. [Step name]

...

## Examples

### [Example scenario]

[Concrete example showing input and output]

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "[excuse to skip the skill]" | [why that reasoning is wrong] |

## Red Flags

- [Warning sign that something is wrong]
- [Another warning sign]

## Verification

- [ ] [Concrete, checkable criterion 1]
- [ ] [Concrete, checkable criterion 2]

## Tips

- [Practical tip]
- [Link to related skills if applicable]
```

### 3. Place the file

```powershell
# Create the directory if it doesn't exist
mkdir "skills/[category]/[skill-name]" -Force

# The file goes at:
# skills/[category]/[skill-name]/SKILL.md
```

### 4. Port External Skills Intentionally

If the source came from Claude Code, an awesome list, or another skill collection,
**adapt the concept instead of copying source-specific primitives verbatim**.

Use this translation rubric:

| External concept | Copilot-native target |
|------------------|-----------------------|
| Slash command | skill or workflow section |
| Claude hook / event primitive | guidance, checklist, or repo-maintenance note |
| Subagent naming / mentions | `task` agent types, `/fleet`, or `team-planner` roles |
| Team/task registry | SQL tables |
| Model recommendation | `multi-model-strategy` or per-agent `model` override |

Before finalizing the skill, answer:

1. What user problem is worth preserving from the source?
2. Which source primitives do **not** exist in Copilot CLI?
3. What is the nearest Copilot-native equivalent?
4. Should the result be a new skill, or an update to an existing one?

### Third-party SKILL.md is untrusted input

Tools that inspect or import an external skill must parse its manifest as untrusted input. Enforce
a post-expansion size cap, reject YAML merge keys, and cap anchor/alias depth to prevent
billion-laughs-style parser amplification. Prefer explicit rejection on parse failure over a
silent partial import. Supply-chain reviewers should apply the matching installation check in
[`agent-supply-chain`](../../security/agent-supply-chain/SKILL.md#bound-untrusted-manifest-parsing).

### 4-A. Audit activation and collision risk

Before you keep a new `name` + `description` pair, test whether the skill is actually
likely to load and whether it would shadow an adjacent skill.

Check at least:

1. **Trigger clarity** - would a user naturally phrase the request this way, or is the
   description too generic to win routing?
2. **Adjacency** - does another local skill already own the same trigger surface more
   clearly?
3. **Prompt simulation** - try 3-5 realistic phrasings, including one terse
   code-oriented phrasing and one broader planning/review phrasing. If two skills seem
   equally plausible, sharpen the description or merge the concept into the existing
   skill instead of adding another near-duplicate.
4. **Cross-model robustness** - avoid descriptions that only make sense in one host's
   naming conventions. Prefer portable verbs like "review", "audit", "debug", "plan",
   or "verify" over vendor-specific slash-command language.

### 4-B. Watch for steering-by-omission failure modes

Language you think of as "off" can still steer the agent. Check drafts against these two related
failure modes before finalizing:

- **Negation** — naming what *not* to do drags the forbidden behavior into context and makes it
  *more* available, not less (the "don't think of an elephant" effect). A skill full of "don't
  do X" instructions primes the agent to think about X. Prefer stating the **positive** version:
  instead of "don't skip verification," write "verify before implementing."
- **Negative space** — every decision a skill declines to make is silently delegated to the
  agent's priors rather than left neutral. An omission is never truly neutral. Read a draft for
  its silences and decide each one deliberately: either fill the gap explicitly, or leave it open
  as a documented branch point (e.g., "if the tracker is not GitHub, ask which workflow applies"
  rather than saying nothing).

Apply this check during drafting, not just at review time — a skill written entirely as
prohibitions ("never do A, never do B, don't assume C") is a sign the positive process was never
actually specified.

#### Declaring allowed-tools has blast radius

An allowed-tools declaration changes behavior according to when the host applies it. If a host
applies an inactive skill's policy eagerly, unrelated tasks can lose baseline tools before the
skill is selected. Declare only the minimum set the skill actually needs, while recognizing that
both an overly broad list and a list so narrow that required tools disappear are failures. If a
tool vanishes before any relevant skill is activated, diagnose early application of another
skill's tool policy.

### 5. Validate

```powershell
# Run the full validation suite
npm run validate && npm run lint:md && npm test
```

Fix any markdownlint errors before committing.

### 6. Register in skills/README.md

Add a row to the skills catalog table:

```markdown
| [`[skill-name]`]([category]/[skill-name]/SKILL.md) | [One-line description] |
```

## Quality Checklist

After generating a new skill, verify:

- [ ] Frontmatter has `name`, `description`, and `metadata.category`
- [ ] File name is kebab-case and matches `name` in frontmatter
- [ ] Source-specific concepts were translated into Copilot-native primitives instead of copied blindly
- [ ] The `name` + `description` pair is specific enough to trigger on real user phrasing
- [ ] The `description` includes at least one positive usage trigger, not only exclusions about when *not* to use the skill
- [ ] Adjacent skills were checked for collisions or silent shadowing before adding a new one
- [ ] "When to Use" section has ≥ 3 concrete post-activation usage scenarios; routing triggers are in `description`
- [ ] Any heading scan ignores fenced code blocks first, so `#` lines inside examples are not treated as real sections
- [ ] "When NOT to Use" table directs to alternatives
- [ ] Workflow has numbered steps with concrete commands or examples
- [ ] "Verification" section has checkable (not vague) criteria
- [ ] `npm run validate && npm run lint:md && npm test` passes

## Usage Examples

### Example: Creating a `rate-limiting-guide` skill

**Input description:**
> "A skill for adding rate limiting to Express APIs. Covers middleware selection, Redis-backed limits, and testing."

**Skill creator output skeleton:**

```markdown
---
name: rate-limiting-guide
description: Use when adding rate limiting to an API — selects the right middleware, configures Redis-backed limits, and writes integration tests
metadata:
  category: development
  agent_type: general-purpose
---

# Rate Limiting Guide
...
```

**Placed at:** `skills/development/rate-limiting-guide/SKILL.md`

## Usage Tips

- **Put selection triggers in `description`**: only frontmatter `name` and `description` are
  available when the model decides whether to load a skill. "When to Use" guides behavior after
  activation; it is not a selection signal.
- **Treat the description like routing metadata**: it is short, but it carries the most
  leverage. If it does not clearly beat adjacent skills on specificity, rewrite it.
- **Verification criteria drive quality**: vague verifications like "it works" are useless.
  Write criteria an agent can check with a command or an observable outcome.
- **Port the job, not the syntax**: preserve the workflow value from upstream sources,
  but translate slash commands, hooks, and agent primitives into Copilot CLI equivalents.
- **Keep stable lessons separate from churn**: if repeated reviews keep teaching the same
  high-level correction, consider one clearly marked longitudinal guidance subsection instead of
  scattering tiny edits across the whole skill.
- **Link related skills**: skills are more powerful when chained. Cross-reference skills
  in "See Also" or "Tips" sections.
- **Use this skill first**: before creating any new skill in this repository, run
  `skill-creator` to scaffold the file. Edit the scaffold rather than starting from scratch.
