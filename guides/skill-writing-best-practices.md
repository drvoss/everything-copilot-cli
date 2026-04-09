# Skill Writing Best Practices

In this repo (agentskills.io spec), a skill’s YAML frontmatter `description:` is the **primary signal** that determines whether an AI *invokes* the skill. The biggest mistake is writing a description that merely *summarizes* the skill instead of **explicitly stating when to use it**.

## 1) The “Pushiness” Principle

Write the `description:` as an *invocation trigger*, not marketing copy.

- **Pushy** descriptions name clear conditions (“Use when…”, “Invoke when…”) so the model can match user intent.
- **Passive** descriptions read like a label; they get skipped because they don’t strongly map to a situation.

**Rule of thumb:** If your description could appear in a navigation menu, it’s probably too passive.

## 2) Trigger Condition Patterns (recommended)

Use one of these patterns (pick the one that best matches the skill):

- **“Use when the user asks to…”**
  - Best for user-driven requests.
- **“Triggered when working on…”**
  - Best for workflow phases (reviewing, debugging, releasing).
- **“Invoke this skill when…”**
  - Best for explicit orchestration (“run X now”).

Keep the first clause *about the condition*, then (optionally) add a short “so that…” outcome.

## 3) Anti-patterns (why descriptions become ineffective)

Avoid these (they are easy to skip / hard to match):

- **Vague**: `description: A skill for code review`
  - Doesn’t say *when* to use it or what inputs exist.
- **Noun-only**: `description: Code review tool`
  - Reads like a tag/category, not an invocation.
- **Missing context**: `description: Reviews pull requests`
  - Which PR? When? What triggers it (before merge, when asked for approval, etc.)?

## 4) Before/After Examples (from this repo)

Below are short `description:`-only edits. Keep changes small and situation-focused.

### `context-prime`

**Evaluation:** ⚠️ Needs improvement — it states what it does, but the trigger is implied (“at the start of a session”) rather than expressed as a condition the model can match.

**Before**
```yaml
description: Load project context at the start of a session so the AI understands the codebase before making changes
```

**After (pushier trigger)**
```yaml
description: Invoke when starting a session (or resuming after a break) on a repo before making changes, to load live project context (structure, recent commits, test status)
```

### `fix-github-issue`

**Evaluation:** ✅ Good — strongly action-oriented and end-to-end. It can be even better by anchoring to the typical input (an issue number/link), but it’s already likely to trigger.

**Before**
```yaml
description: Resolve a GitHub Issue end-to-end — read the issue, locate the bug, fix it, test it, and open a PR, all from the terminal
```

**After (optional tightening)**
```yaml
description: Use when the user provides a GitHub Issue (number/link) and asks to fix it end-to-end: reproduce, patch, add tests, and open a PR from the terminal
```

### `commit-workflow`

**Evaluation:** ⚠️ Needs improvement — feature list (emoji/auto-stage/split) is clear, but it doesn’t clearly state the *moment* to invoke (e.g., “about to commit” or “diff mixes concerns”).

**Before**
```yaml
description: Craft conventional commits with emoji, auto-stage, and split atomic commits from a mixed diff
```

**After (trigger-first)**
```yaml
description: Use when you’re about to commit (especially with a mixed diff) to stage changes, split into atomic commits, and write Conventional Commit messages (optionally with emoji)
```

### `pr-multi-perspective-review`

**Evaluation:** ✅ Good — clear trigger (review a PR) and unique mechanism (6 perspectives). Consider adding a “before merge” clause if you see false negatives.

**Before**
```yaml
description: Review a pull request from 6 perspectives (PM, Dev, QA, Security, DevOps, UX) for comprehensive, bias-free feedback
```

**After (optional trigger anchor)**
```yaml
description: Use when reviewing a pull request (ideally pre-merge) to run a 6-perspective review (PM/Dev/QA/Security/DevOps/UX) and synthesize actionable feedback
```

## 5) Anti-trigger conditions (“NOT when…”) to prevent false triggers

Add a short exclusion clause when a skill is commonly confused with another:

- `… NOT when the user only wants a quick summary; use basic chat instead.`
- `… NOT when there is no PR/issue identifier; ask for one or use a generic review skill.`
- `… NOT when the task is only triage/labeling; use the triage skill instead.`

Pattern:
```yaml
description: Use when …; NOT when …
```

## 6) Description Checklist (before committing)

- [ ] Starts with a **trigger phrase**: “Use when…”, “Triggered when…”, or “Invoke when…”.
- [ ] Names the **input cue** the model will see (issue number, PR link, “about to commit”, failing tests, etc.).
- [ ] Mentions the **outcome** in one short clause (what success looks like).
- [ ] Avoids **noun-only** or **category** wording.
- [ ] Includes a **NOT when…** clause if the skill is easy to mis-invoke.
- [ ] Stays **1–2 sentences**; no long feature lists unless they improve routing.

---

## 7) Why-First Principle

Prefer explaining *why* over writing ALWAYS/NEVER imperatives. Imperatives are brittle — they don't transfer well to edge cases, unusual repos, or novel tooling. When the model understands the reason, it applies correct judgment even when the literal instruction would be wrong.

**Bad (imperative, no rationale):**
```yaml
description: ALWAYS run every test suite before making any change. NEVER edit configuration files.
```

**Good (reasoning-based, preserves intent):**
```yaml
description: |
  Prioritize correctness: run the smallest relevant tests first (unit/lint), then broaden
  coverage when changes touch shared code. Avoid config edits unless the change requires it —
  config mistakes can break unrelated workflows. If a config change is necessary, validate it
  and explain why.
```

---

## 8) 500-Line Limit + `references/` Split
Keep the main skill body under ~500 lines. If it grows beyond that, split extended platform or domain material into a `references/` subdirectory — the core skill stays scannable, and the model loads detail only when needed.

```
skills/<category>/<skill-name>/
  SKILL.md            ← under 500 lines
  references/
    <topic>.md        ← extended platform/domain content
```

**Convention:** at the very top of each reference file, include a pointer:
> **Read this file when:** [condition] (e.g., "when deploying to Kubernetes" or "when debugging OAuth flows")

---

## 9) Domain-Based Conditional References

If a skill spans multiple platforms or environments, split references by domain so only the relevant content is loaded — this reduces noise, token waste, and cross-platform confusion.

**Example for a hypothetical `cloud-deploy` skill:**
```
skills/development/cloud-deploy/
  SKILL.md
  references/
    aws.md      ← Read when: target is AWS (EC2, ECS, Lambda)
    gcp.md      ← Read when: target is Google Cloud (GKE, Cloud Run)
    azure.md    ← Read when: target is Azure (AKS, Container Apps)
    common.md   ← Read when: shared concepts apply (naming, rollout, rollback)
```

Keep provider-specific commands and pitfalls in the respective files, and shared concepts in `common.md`.

---

## 10) Validating Agent and Skill Files

Use the built-in validation scripts to catch structural issues before committing:

```powershell
npm run validate   # validates SKILL.md frontmatter and required fields across all agents, skills, rules, and MCP configs
npm run lint:md    # markdownlint across all Markdown files
```

Run both together as a pre-commit quality gate:

```powershell
npm run validate && npm run lint:md
```

**What `npm run validate` checks:**

- Required frontmatter fields present and non-empty (`name`, `description`, `metadata.category` for skills; `name`, `agent_type`, `model` for agents)
- Frontmatter type correctness (e.g., `tools` is an array)
- Counts and reports totals for skills, agents, rules, and MCP configs

Add to your CI workflow to prevent broken agent/skill configs from being merged:

```yaml
- name: Validate configs
  run: npm run validate && npm run lint:md
```
