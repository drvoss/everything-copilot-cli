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

### 4. Validate

```powershell
# Run the full validation suite
npm run validate && npm run lint:md && npm test
```

Fix any markdownlint errors before committing.

### 5. Register in skills/README.md

Add a row to the skills catalog table:

```markdown
| [`[skill-name]`]([category]/[skill-name]/SKILL.md) | [One-line description] |
```

## Quality Checklist

After generating a new skill, verify:

- [ ] Frontmatter has `name`, `description`, and `metadata.category`
- [ ] File name is kebab-case and matches `name` in frontmatter
- [ ] "When to Use" section has ≥ 3 concrete trigger scenarios
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

- **Start with triggers**: the "When to Use" section determines whether agents will
  actually reach for this skill. Make triggers concrete and scenario-specific.
- **Verification criteria drive quality**: vague verifications like "it works" are useless.
  Write criteria an agent can check with a command or an observable outcome.
- **Link related skills**: skills are more powerful when chained. Cross-reference skills
  in "See Also" or "Tips" sections.
- **Use this skill first**: before creating any new skill in this repository, run
  `skill-creator` to scaffold the file. Edit the scaffold rather than starting from scratch.
