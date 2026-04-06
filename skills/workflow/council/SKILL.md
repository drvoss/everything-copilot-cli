---
name: council
description: Use when a decision has multiple credible paths and no obvious winner — convene a four-voice council (Architect, Skeptic, Pragmatist, Critic) for structured adversarial deliberation before choosing
metadata:
  category: workflow
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# Council

Convene four advisors for decisions under ambiguity:

- **Architect** — correctness, maintainability, long-term implications
- **Skeptic** — premise challenge, simplification, assumption breaking
- **Pragmatist** — shipping speed, user impact, operational reality
- **Critic** — edge cases, downside risk, failure modes

This is for **decision-making under ambiguity**, not code review, architecture design, or implementation planning.

## When to Use

- A decision has multiple credible paths and no obvious winner
- You need explicit tradeoff surfacing before committing
- Conversational anchoring is a risk (you've been going in one direction too long)
- A go/no-go call would benefit from adversarial challenge

Examples: monorepo vs polyrepo · ship now vs hold for polish · feature flag vs full rollout · simplify scope vs keep strategic breadth

## When NOT to Use

| Instead of council | Use |
|--------------------|-----|
| Verifying whether output is correct | `evaluate-repository` or direct review |
| Breaking a feature into implementation steps | planner / Plan Mode |
| Reviewing code for bugs | `code-review` skill |
| Straight factual questions | answer directly |
| Obvious execution tasks | do the task |

## Workflow

### 1. Extract the real question

Reduce to one explicit prompt:
- What exactly are we deciding?
- What constraints matter?
- What counts as success?

If the question is vague, ask one clarifying question before convening.

### 2. Form the Architect position first

Before reading other voices, write down:
- Your initial position
- The three strongest reasons for it
- The main risk in your preferred path

This anchors the synthesis so it doesn't simply mirror external voices.

### 3. Launch three subagents in parallel

Each subagent gets: the decision question + compact context + strict role. No full conversation history.

```
# Copilot CLI tool call — launch 3 background task agents

task:
  agent_type: "general-purpose"
  name: "skeptic"
  mode: "background"
  prompt: |
    You are the Skeptic on a four-voice decision council.

    Question: [DECISION QUESTION]
    Context: [COMPACT CONTEXT]

    Challenge the framing. Question assumptions. Propose the simplest credible alternative.

    Respond with:
    1. Position — 1-2 sentences
    2. Reasoning — 3 concise bullets
    3. Risk — biggest risk in the status quo
    4. Surprise — one thing the other voices may miss
    Under 300 words. No hedging.

task:
  agent_type: "general-purpose"
  name: "pragmatist"
  mode: "background"
  prompt: |
    You are the Pragmatist on a four-voice decision council.
    [same structure — optimize for speed, simplicity, real-world execution]

task:
  agent_type: "general-purpose"
  name: "critic"
  mode: "background"
  prompt: |
    You are the Critic on a four-voice decision council.
    [same structure — surface downside risk, edge cases, failure modes]
```

Then `read_agent` each result.

### 4. Synthesize with bias guardrails

- Do not dismiss an external view without explaining why
- If an external voice changed your recommendation, say so explicitly
- Always include the strongest dissent even if you reject it
- If two voices align against your initial position, treat that as a real signal

### 5. Output format

```markdown
## Council Verdict: [Decision Question]

### Positions
| Voice | Recommendation | Core Reasoning |
|-------|---------------|----------------|
| Architect | [position] | [1-line summary] |
| Skeptic | [position] | [1-line summary] |
| Pragmatist | [position] | [1-line summary] |
| Critic | [position] | [1-line summary] |

### Strongest Dissent
[The best argument against the recommended path]

### Verdict
**[Chosen path]**

Rationale: [2-3 sentences explaining the choice and why dissent was acknowledged but not followed]

Next action: [Concrete first step]
```

## See Also

- [multi-model-strategy](../../copilot-exclusive/multi-model-strategy/SKILL.md) — choosing which model to use
- [plan-mode-mastery](../../copilot-exclusive/plan-mode-mastery/SKILL.md) — structured planning before execution
- [team-planner](../../copilot-exclusive/team-planner/SKILL.md) — multi-agent coordination for large tasks
