---
name: llm-wiki
description: Use when research or domain knowledge keeps getting rediscovered across sessions — build a supplementary markdown wiki that compounds synthesized knowledge without replacing GitHub or committed project guidance
metadata:
  category: workflow
  agent_type: general-purpose
  compatible_runtimes: [copilot-cli, claude-code, codex-cli, gemini-cli]
---

# LLM Wiki

Build a persistent, interlinked markdown wiki for domain knowledge, research notes,
and long-lived synthesized context. This follows Andrej Karpathy's LLM Wiki pattern,
but keeps the repository boundary clear: the wiki is a **supplementary knowledge layer**,
not the system of record for issues, PRs, shipped decisions, or canonical project rules.

In this repository's philosophy:

- **GitHub stays the system of record** for tasks, code review, and shipped artifacts
- **project-specific durable guidance** still belongs in `.github/copilot-instructions.md`,
  `CONTRIBUTING.md`, guides, or ADRs
- the wiki is best for **domain knowledge that would otherwise be re-derived every session**

## When to Use

- You are researching a domain across many external sources and want the knowledge to compound
- You want a persistent knowledge base about a technology landscape, product area, or codebase-adjacent domain
- The same background explanation keeps getting repeated across sessions
- A query answer would be expensive to reconstruct from raw notes every time

## When NOT to Use

| Instead of llm-wiki | Use |
|---------------------|-----|
| One-off research or a single answer with citations | `deep-research` |
| Promoting repeated repo-specific lessons into durable project guidance | `knowledge-curator` |
| Recovering what happened in prior Copilot sessions | `cross-session-memory` |
| Issue tracking, delivery planning, or implementation state | GitHub Issues / PRs / session SQL |

## Boundary with Other Skills

| Skill | Best for |
|-------|----------|
| `llm-wiki` | Compounding external or domain knowledge in a separate markdown wiki |
| `knowledge-curator` | Graduating stable repository guidance into committed project docs |
| `deep-research` | Evidence-heavy investigation that may or may not be worth filing permanently |
| `cross-session-memory` | Looking up prior local session history and decisions |

If a wiki insight becomes a stable repository rule, **promote it out of the wiki** into
the committed docs that future contributors actually depend on.

## Configuration

Set the wiki path with an environment variable. Default to a user-owned directory outside the
repository working tree unless there is a strong reason to keep it inside the repo.

```powershell
# PowerShell
$env:LLM_WIKI_PATH = "C:\Users\you\wiki"

# Bash equivalent
export LLM_WIKI_PATH="$HOME/wiki"
```

Recommended top-level layout:

```text
wiki/
├── SCHEMA.md
├── index.md
├── log.md
├── raw/
│   ├── articles/
│   ├── papers/
│   ├── transcripts/
│   └── assets/
├── entities/
├── concepts/
├── comparisons/
└── queries/
```

## Workflow

### 1. Orient at session start

Read the schema, navigation index, and recent log before touching the wiki:

```powershell
$wiki = if ($env:LLM_WIKI_PATH) { $env:LLM_WIKI_PATH } else { "$HOME\wiki" }

Get-Content "$wiki\SCHEMA.md"
Get-Content "$wiki\index.md"
Get-Content "$wiki\log.md" | Select-Object -Last 50
```

This prevents duplicate pages, inconsistent tags, and missed cross-links.

### 2. Ingest new sources deliberately

When the user provides a URL, file, transcript, or pasted text:

1. save the raw source under `raw/`
2. inspect whether the topic already exists
3. create or update only the pages that meet the wiki's page threshold
4. add backlinks and update `index.md`
5. append a concise action entry to `log.md`

```powershell
$wiki = if ($env:LLM_WIKI_PATH) { $env:LLM_WIKI_PATH } else { "$HOME\wiki" }

# Search existing pages before creating anything new
Get-ChildItem -Path $wiki -Recurse -Filter *.md |
  Select-String -Pattern "EntityName"
```

Use frontmatter on wiki pages so updates stay traceable:

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [tag-from-taxonomy]
sources: [raw/articles/source-name.md]
---
```

### 3. Query from the synthesized layer first

When a user asks a domain question:

1. search `index.md`
2. search page content if the wiki is large
3. read the relevant pages
4. answer from the synthesized pages, not by re-reading every raw source
5. file the answer under `queries/` or `comparisons/` only if it will save future work

### 4. Keep the wiki healthy

Healthy wikis decay more slowly than ad-hoc notes because navigation and traceability are maintained.

- keep `raw/` immutable
- update `index.md` and `log.md` every time pages change
- require meaningful cross-links between pages
- archive superseded pages instead of silently overwriting history
- ask before a single ingest would rewrite a large portion of the wiki

## Optional Upstream Extras

This repository adopts the workflow only. It does **not** bundle the upstream templates,
scripts, examples, or extensions.

If you want bootstrap or lint helpers, use the upstream repository separately:

- upstream repo: <https://github.com/drvoss/llm-wiki-skill>
- optional helpers: `scripts/wiki-init.py`, `scripts/wiki-lint.py`, `scripts/wiki-stats.py`
- optional extras: schema templates, Obsidian integration, GitHub/arXiv extensions, sample wiki

Treat those as optional tooling, not a required dependency for the core skill.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll just keep re-explaining the topic each session" | Repeated synthesis wastes time and produces drift. The wiki is for knowledge that should compound. |
| "The wiki can replace project instructions" | It should not. Repository policies and team defaults belong in committed project docs. |
| "I'll save every mention as its own page" | Over-fragmentation makes the wiki noisy and hard to navigate. |
| "I can skip index and log updates for now" | A wiki without navigation and history degrades into an unsearchable folder of notes. |

## Red Flags

- The wiki starts storing task state that belongs in Issues, PRs, or SQL todos
- Pages duplicate committed project rules instead of linking or promoting them
- New pages are created without checking whether the topic already exists
- `index.md` and `log.md` fall out of sync with actual changes
- Raw source files are edited instead of treated as immutable evidence

## Verification

- [ ] The wiki path and layout are defined
- [ ] Session start orientation reads `SCHEMA.md`, `index.md`, and recent `log.md`
- [ ] New ingest work updates navigation and activity history
- [ ] The wiki is used for durable knowledge, not task tracking or canonical project policy
- [ ] Stable repository guidance is promoted into committed docs when needed

## Tips

- Start with one real domain, not a giant catch-all wiki
- Prefer updating strong existing pages over creating many thin pages
- File only the answers that would be expensive to reconstruct later
- Keep the wiki outside the active repo unless versioning the wiki itself is the goal

## See Also

- [`deep-research`](../deep-research/SKILL.md) — gather and synthesize evidence before deciding what to keep
- [`implementation-review`](../implementation-review/SKILL.md) — review whether a proposed knowledge artifact actually matches the original ask
- [`knowledge-curator`](../../copilot-exclusive/knowledge-curator/SKILL.md) — promote repository-specific lessons into durable committed guidance
- [`cross-session-memory`](../../copilot-exclusive/cross-session-memory/SKILL.md) — recover earlier local session context
