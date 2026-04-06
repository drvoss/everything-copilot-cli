---
name: eval-harness
description: Use when you need to evaluate an LLM pipeline or AI feature systematically — sets up an eval harness with test cases, scoring rubrics, and pass/fail tracking rather than one-off manual spot-checks
metadata:
  category: testing
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# Eval Harness

Build a reproducible evaluation harness for LLM pipelines, AI features, or agent workflows. The harness consists of:
- **Eval definitions** — test cases with inputs, expected outputs, and scoring rubrics
- **Runner** — executes the pipeline against all test cases
- **Scorer** — applies rubrics and records results
- **Tracker** — maintains pass/fail history across runs (via SQL session DB)

## When to Use

- Building a new LLM-powered feature and want regressions caught automatically
- Changing prompts and want to confirm no quality degradation
- Demonstrating quality evidence for a shipped AI pipeline
- Setting a quality gate for a CI/CD pipeline

## When NOT to Use

| Instead of eval-harness | Use |
|------------------------|-----|
| Spot-check one interaction | answer directly |
| Standard software unit tests (no LLM output) | `tdd-workflow` skill |
| Formal red-team safety evaluation | security team involvement required |

## Eval Directory Layout

```
.evals/
  <harness-name>/
    config.json          # harness metadata
    cases/               # individual test cases
      01_basic.json
      02_edge_case.json
    rubrics/             # scoring rubrics
      accuracy.md
      format.md
    results/             # run results (auto-generated)
      2024-01-15_run001.json
```

## Workflow

### 1. Define the eval scope

```
What pipeline or feature are you evaluating?
What does "good" output look like?
What are the critical failure modes?
```

### 2. Write test cases

Minimum viable test suite structure:

| Test type | Minimum count |
|-----------|---------------|
| Happy path (well-formed inputs) | 5 |
| Edge cases (unusual but valid) | 3 |
| Near-miss (close to but not in scope) | 3 |
| Adversarial / jailbreak attempts | 2 |

Each test case file:

```json
{
  "id": "tc_01",
  "name": "Basic summarization accuracy",
  "input": "Summarize this article: [article text]",
  "expected_output": {
    "contains": ["main topic", "key insight"],
    "excludes": ["hallucinated fact"],
    "format": "3-5 sentences"
  },
  "rubric": "accuracy + format",
  "tags": ["happy-path", "summarization"]
}
```

### 3. Define scoring rubrics

Rubric types (choose appropriate ones):

| Rubric type | Use for |
|-------------|---------|
| `exact_match` | classification, routing, label extraction |
| `contains_all` | structured output with required fields |
| `semantic_similarity` | open-ended generation; threshold 0.80 |
| `human_review` | subjective quality, creativity |
| `format_check` | JSON schema, Markdown structure, length |

### 4. Track runs in SQL

```sql
-- Create eval tracking tables
CREATE TABLE IF NOT EXISTS eval_runs (
    run_id TEXT PRIMARY KEY,
    harness_name TEXT,
    timestamp TEXT,
    total INTEGER,
    passed INTEGER,
    failed INTEGER,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS eval_results (
    run_id TEXT,
    case_id TEXT,
    status TEXT,  -- pass | fail | skip
    score REAL,
    notes TEXT,
    PRIMARY KEY (run_id, case_id)
);
```

### 5. Run and record

For each test case:
1. Submit input to the pipeline
2. Compare output to rubric
3. Record `pass` / `fail` and score
4. Flag regressions (previously passing tests now failing)

After all cases:

```sql
INSERT INTO eval_runs VALUES ('run_001', 'summarizer', '2024-01-15', 10, 8, 2, 'Baseline run');
```

### 6. Analyze and act

Interpret results:
- < 60% pass rate → pipeline needs rework before shipping
- 60–80% → document known failures, consider mitigations
- 80–95% → acceptable for beta / early access
- > 95% → confidence for general availability

On regression (previously passing, now failing):
- Compare pipeline changes since last green run
- Identify if the test case itself needs updating or if the regression is real

## Config Schema

```json
{
  "name": "summarizer-v2",
  "version": "1.0",
  "description": "Evaluates summarization quality for the article pipeline",
  "rubrics": ["accuracy", "format"],
  "thresholds": {
    "pass_rate": 0.80,
    "semantic_similarity": 0.80
  },
  "tags": ["summarization", "nlp"]
}
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Only happy-path cases | Add 3+ edge cases and 2+ adversarial cases |
| Rubric too strict (exact match for generation) | Use semantic similarity or contains-all |
| Rubric too loose (all pass trivially) | Make a case that should fail and verify it fails |
| Never updating test cases | Revisit monthly or when pipeline changes |

## See Also

- [tdd-workflow](../tdd-workflow/SKILL.md) — unit testing workflow for traditional code
- [qa-agent-guide](../../guides/qa-agent-guide.md) — incremental QA with agent boundaries
- [multi-model-strategy](../../copilot-exclusive/multi-model-strategy/SKILL.md) — picking the right model per task
