---
name: cost-audit
description: Use when AI inference costs are growing unexpectedly, when comparing model choices by cost/quality ratio, or when optimizing token usage across a multi-model pipeline — produces an actionable cost reduction plan
metadata:
  category: workflow
  agent_type: general-purpose
---

# Cost Audit

Audit AI inference costs and optimize token usage across multi-model pipelines. This is not about cutting capabilities — it is about eliminating waste, right-sizing models, and keeping costs predictable.

## When to Use

- AI API costs growing faster than usage justifies
- Unsure whether you are using the right model tier for each task
- Want to compare cost-quality trade-offs before committing to a model
- Preparing for production traffic and need a cost baseline
- Running fleet mode or parallel agents and want to avoid runaway spend

## Model Cost Tiers

Use the most capable model necessary — not the most capable model available.

| Tier | Models | Best for |
|------|--------|----------|
| **Premium** | `claude-opus-4.7`, `claude-opus-4.6`, `claude-opus-4.5` | Architecture decisions, complex multi-file reasoning, security audits |
| **Standard** | `claude-sonnet-4.6`, `claude-sonnet-4.5`, `gpt-5.2` | Most coding tasks, code review, test generation, documentation |
| **Fast / Cheap** | `claude-haiku-4.5`, `gpt-5-mini`, `gpt-4.1` | File edits, boilerplate, classification, triage, simple summaries |

## Workflow

### 1. Identify high-cost call sites

Scan for:

- Long system prompts that repeat across calls
- Premium models used for simple transforms
- Entire file contents passed when only relevant sections are needed
- No context caching on static instructions
- Fleet mode with all agents on premium tiers

### 2. Measure baseline

| Metric | How to measure |
|--------|---------------|
| Total tokens / task | Compare before and after context changes |
| Model mix | Tally which models are called per workflow |
| Prompt size distribution | Log avg/max token counts per call type |

### 3. Apply reduction patterns

**Model downgrade**

- Does this task require premium reasoning? If not, drop a tier.
- Classification, routing, simple edits → use fast/cheap tier
- Reserve premium for tasks that demonstrably need it

**Context pruning**

- Pass a summary instead of the full history when prior turns are less relevant
- Slice file ranges with `view_range` instead of full-file reads
- Remove redundant boilerplate from system prompts

**Prompt deduplication**

- Repeated instructions in every call → move to a system prompt / shared prefix
- Static context that never changes → candidate for caching (if platform supports it)

**Task batching**

- Small independent tasks → batch into one call instead of N separate calls
- Fan-out agents → assign right tier per task, not fleet-wide premium

### 4. Estimate savings

For each change:

```text
Change: Replace claude-opus-4.7 on doc-summary with claude-haiku
Before: ~4,000 tokens × $0.015/1K = $0.06/call
After:  ~4,000 tokens × $0.00025/1K = $0.001/call
Savings: ~$0.059/call, ~$590/10K calls
```

Use approximate public pricing for estimation. Actual prices vary; check your provider dashboard.

### 5. Prioritize

| Priority | Criterion |
|----------|-----------|
| High | Premium model on a task a fast model handles well |
| High | Context window > 50K tokens when shorter would suffice |
| Medium | Duplicate context passed on every call |
| Medium | Fleet agents with mismatched model tiers |
| Low | Minor prompt size variations |

### 6. Report format

```markdown
## Cost Audit Report

### Summary
Estimated waste: ~$X/day at current scale
Top three opportunities: [list]

### Findings

#### [HIGH] Premium model for boilerplate generation
Location: [file or workflow name]
Issue: `claude-opus-4.7` used for all code generation including templates and stubs.
Recommendation: Use `claude-haiku-4.5` for boilerplate; reserve opus for complex tasks.
Estimated savings: ~80% cost reduction on boilerplate tasks.

#### [MEDIUM] Entire codebase passed as context on every PR review
...
```

## Common Waste Patterns

| Pattern | Fix |
|---------|-----|
| Entire conversation history on every call | Summarize old context, keep recent turns |
| Full file reads when only one function matters | Use `view_range` for targeted reads |
| Premium model for all parallel agents in fleet | Assign tier per task type |
| Same instructions repeated in every prompt | Move to shared system prompt |
| No caching on static reference docs | Check if your API client supports prompt caching |

## See Also

- [multi-model-strategy](../../copilot-exclusive/multi-model-strategy/SKILL.md) — when to use which model tier
- [team-planner](../../copilot-exclusive/team-planner/SKILL.md) — assigning models per agent in a team
- `orchestration/templates/orchestrator-template.md` — model selection guidance in orchestration context
