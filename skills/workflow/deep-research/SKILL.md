---
name: deep-research
description: Use when a question requires comprehensive evidence gathering from multiple sources, systematic synthesis, and traceable citations — produces a structured research brief rather than a quick answer
metadata:
  category: workflow
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# Deep Research

Conduct systematic multi-source research with traceable citations and structured synthesis. Produces a verifiable research brief, not a hallucinated summary.

## When to Use

- A technology decision needs evidence-backed comparison
- You need to synthesize competing viewpoints from multiple sources
- A topic requires both primary sources and derivative context
- The answer is too uncertain or consequential for a quick answer

## When NOT to Use

| Instead of deep-research | Use |
|--------------------------|-----|
| Quick factual lookup | answer directly |
| Internal codebase investigation | `evaluate-repository` or direct search |
| Implementation planning | Plan Mode |
| Conversational brainstorming | conversation directly |

## Tooling

**Native (always available):**
- `web_fetch` — fetch a URL and read its content

**Optional via MCP (if configured):**
- Firecrawl — crawl entire sites, extract clean text at scale
- Exa — semantic web search with real results

If you only have `web_fetch`, use targeted URL fetches. Prefer primary sources (papers, official docs, specification pages) over aggregators.

See `mcp-configs/` for MCP server configuration if you want Firecrawl or Exa.

## Workflow

### 1. Define the research question

Be precise. Vague questions produce vague briefs.

```
Research question: [clear, specific question]
Scope: [what to include / exclude]
Output goal: [decision support / comparison / summary / literature review]
```

### 2. Source planning

For each major claim or sub-question, identify target source types:

| Source type | Examples |
|-------------|---------|
| Primary technical | official docs, RFCs, specification pages, academic papers |
| Reference implementations | GitHub, codebase examples |
| Industry commentary | credible blog posts, conference talks, case studies |
| Counter-evidence | critiques, known limitations, alternative views |

Minimum 3 independent sources per key claim.

### 3. Evidence gathering

Track sources in SQL:

```sql
CREATE TABLE IF NOT EXISTS research_sources (
    id TEXT PRIMARY KEY,
    url TEXT,
    title TEXT,
    source_type TEXT,
    fetched_at TEXT,
    key_finding TEXT,
    credibility TEXT  -- high | medium | low
);
```

For each source:
1. Fetch with `web_fetch`
2. Extract key finding in ≤ 50 words
3. Assess credibility
4. Insert into `research_sources`

### 4. Conflict detection

Before synthesizing, check for contradictions:

```sql
SELECT key_finding FROM research_sources
WHERE credibility = 'high'
ORDER BY fetched_at;
```

When sources conflict:
- Prefer more recent, primary sources
- Surface the conflict explicitly in the brief
- Do not silently resolve it

### 5. Synthesis

Synthesize with explicit attribution. Never present claims without tracing them to at least one source.

Do not:
- Fill gaps with plausible-sounding guesses
- Omit dissenting evidence
- Present synthesis as more certain than the underlying evidence

### 6. Brief format

```markdown
## Research Brief: [Question]

**Summary** (3-5 sentences)
[Key conclusion with appropriate uncertainty]

**Key Findings**

| Finding | Source | Confidence |
|---------|--------|------------|
| [finding] | [source title + URL] | High/Med/Low |

**Conflicting Evidence**
[Surface any disagreements between sources]

**Limitations**
- [What this research did not cover]
- [What would require additional investigation]

**Sources**
1. [Title] — [URL]
2. ...
```

### 7. Auto-Continuation (Long Research)

For topics that require more than 5 sources or span multiple sub-questions, use
continuation checkpoints to avoid context overflow:

```sql
-- Track research progress across continuation points
CREATE TABLE IF NOT EXISTS research_progress (
    checkpoint_id TEXT PRIMARY KEY,
    sub_question TEXT,
    status TEXT,  -- pending | in_progress | complete
    sources_fetched INTEGER DEFAULT 0,
    findings_summary TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Continuation workflow:**

```text
Checkpoint 1: Sub-question A (fetch 3-5 sources, synthesize)
  → Write findings to research_progress
  → Continue to checkpoint 2 (do not wait for human input)

Checkpoint 2: Sub-question B (fetch 3-5 sources, synthesize)
  → Write findings to research_progress
  → Continue to checkpoint 3

Checkpoint N: Final synthesis
  → SELECT * FROM research_progress WHERE status = 'complete'
  → Combine all checkpoint findings into the final brief
```

**When to split into sub-questions:**

- The main question has multiple independent facets (e.g., "compare X and Y across
  performance, cost, and ease of use" → 3 sub-questions)
- Any sub-question requires > 5 sources to answer confidently
- Different sub-questions require different source types

**Continuation prompt template:**

```text
[Previous checkpoint summary]

Continuing research on: [sub-question N]
Sources already consulted: [list from research_sources table]
Remaining sub-questions: [list]

Next: fetch sources for sub-question N, extract findings, update research_progress.
Then continue to the next sub-question without stopping.
```

## Quality Standards

| Check | Standard |
|-------|----------|
| Source minimum | ≥ 3 independent sources per key claim |
| Citation format | URL + title for every factual claim |
| Conflict handling | All conflicts surfaced, none silently resolved |
| Uncertainty | Hedging language when evidence is incomplete |
| Scope integrity | Stays within defined research question scope |

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Citing only one source per claim | Cross-reference at minimum 3 |
| Treating a high-confidence summary as ground truth | Trace back to primary sources |
| Ignoring conflicting evidence | Surface it explicitly |
| Fabricating URLs | Only include URLs you have actually fetched |

## See Also

- [council](../council/SKILL.md) — adversarial deliberation for decisions informed by research
- [content-strategy](../../content/content-strategy/SKILL.md) — research applied to content planning
- `mcp-configs/` — configuring Firecrawl or Exa for enhanced web research
