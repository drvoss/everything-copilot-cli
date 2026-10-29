---
name: multi-model-strategy
license: MIT
description: Use when choosing which AI model to use for a task — pick the right model family and tier based on cost, speed, context needs, and reasoning depth
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
  copilot_feature: "Model selection (/model command), Auto model selection, per-agent model override, tier-based routing"
---

# Multi-Model Strategy

## Why This is Copilot-Exclusive

Copilot CLI provides a **broad model selection** that can be switched at any time via the
`/model` command or per-agent via the `model` parameter. This lets you mix premium review
models, code-focused implementation models, and fast/cheap exploration models in one workflow
instead of forcing every step through the same model family.

## When to Use

- Deciding whether Copilot Auto should handle model choice or whether to override it manually
- Matching model strengths to task requirements
- Optimizing cost for high-volume operations (use cheaper models for exploration)
- Using premium models for security-critical or architecturally complex work
- Running different models for different sub-agents in the same session
- A/B testing model quality on the same task
- Pairing implementation and review models on the same workflow

## Workflow

### Auto Model Selection

Auto model selection is available in Copilot CLI. When you choose **Auto**, Copilot selects an
appropriate supported model based on your plan and policies, and shows which model was used for each
response in the terminal.

```text
/model
# Select Auto
```

Use Auto when:

- the task mix is broad and you do not want to hand-tune each step
- you want lower mental overhead for everyday work
- the session may shift between exploration, implementation, and review

Prefer a manual override when:

| Scenario | Why override Auto | Suggested path |
|----------|-------------------|----------------|
| High-stakes security or architecture work | You want a guaranteed premium model | choose a premium model explicitly |
| Strict reproducibility matters | Auto can route to different supported models over time | lock a specific model |
| You are comparing two models intentionally | A/B testing requires a stable choice | pick exact model names |

### Copilot Fusion

Copilot Fusion is generally available in `/model`. It is not a single model:
for each prompt it either answers with one model, drafts with an efficient model and escalates
when a quality check fails (cascade), or has one model draft, another review, and the first revise
(critique). You pick the effort level — Fusion Standard, Fusion High, or Fusion Max — instead of a
model.

| Choose | When |
|--------|------|
| Auto | You want one routed model per response with the least setup |
| Fusion | You want Copilot to route, and when useful orchestrate, models for you |
| An exact model | You need reproducibility, a known model identity, or a fair comparison |

Fusion only uses models your organization and enterprise policies allow, and you are billed for
each model it uses at that model's standard rate. Administrators can set Fusion, at any effort
level, as the default model through enterprise managed settings.

### Model Tiers and Strengths

#### Premium Tier (Deep Reasoning)

| Model                        | Best For                                    |
|------------------------------|---------------------------------------------|
| `claude-opus-5.5`            | Complex architecture, security analysis, deep review |

#### Standard Tier (General Purpose)

| Model                        | Best For                                    |
|------------------------------|---------------------------------------------|
| `claude-sonnet-5.5`          | General-purpose coding (CLI default)        |
| `gpt-6.1-sol`                | Strong general reasoning and code generation (opt-in) |
| `gpt-6-astra`                | General-purpose alternative (opt-in)        |
| `gpt-5.3-codex`              | Code-focused tasks                          |

#### Fast/Cheap Tier (High Volume)

| Model                        | Best For                                    |
|------------------------------|---------------------------------------------|
| `gpt-6-luna`                 | Fast implementation and transformation work (opt-in) |
| `claude-haiku-5.5`           | Fast, lightweight operations                |
| `claude-haiku-4.5`           | Exploration, simple edits, high-volume      |
| `gemini-3.8-flash`           | Fast Google Gemini responses                |

Model IDs above follow the Copilot CLI command reference ("Supported models", checked
2026-10-23); the tiers are this skill's suggested routing, not an official classification. Availability still varies by plan and organization policy, and models retire on a
published schedule — check `/model` before pinning an ID in an agent file or automation.

### 1. Switch Your Main Model

```text
/model claude-opus-5.5
```

Changes the model for your current interactive session.

Prefer `/model --session` (or `/model -s`) when you want to try a different model,
reasoning effort, or context window for just one session. It keeps the experiment local
instead of polluting your global defaults, which matches this skill's broader advice not to
lock yourself into one globally hardcoded model choice when the task should drive routing.

Model availability changes frequently, so treat the current session's `/model` output as the
single source of truth rather than maintaining a waiting list in documentation. Use `/model plan`
to choose the model used specifically for Plan Mode; unlike `/model --session`, which scopes a
general model choice to the current session, the plan setting scopes the choice by mode.

### 2. Per-Agent Model Override

Assign different models to different sub-agents:

```text
# Cheap model for exploration
task(agent_type: "explore", model: "claude-haiku-4.5",
     prompt: "Find all files that import the UserService class")

# Premium model for security review
task(agent_type: "code-review", model: "claude-opus-5.5",
     prompt: "Review these auth changes for security vulnerabilities")

# Fast model for test generation
task(agent_type: "general-purpose", model: "gpt-6-luna",
     prompt: "Generate unit tests for src/utils/validator.ts")
```

### 3. Cost-Optimized Workflow

```text
Phase 1 - Exploration (cheap):     claude-haiku-4.5
Phase 2 - Planning (standard):     claude-sonnet-5.5
Phase 3 - Implementation (code):   gpt-5.3-codex
Phase 4 - Review (premium):        claude-opus-5.5
Phase 5 - Test generation (fast):  gpt-6-luna
```

### 4. Pair-Model Workflow

Do not think only in terms of one "best" model. Many tasks are safer when split into
specialized roles:

| Role | Recommended model | Why |
|------|-------------------|-----|
| Builder | `gpt-5.3-codex` | Strong code transformation and implementation speed |
| Planner / synthesizer | `gpt-6.1-sol` or `claude-sonnet-5.5` | Balanced reasoning and summarization |
| Security / architecture reviewer | `claude-opus-5.5` | Stronger high-risk judgment |
| Scout / file search | `claude-haiku-4.5` | Fast, cheap exploration |

This works especially well with [`task-intake-router`](../task-intake-router/SKILL.md)
and [`team-planner`](../team-planner/SKILL.md), where the route and agent roster are
decided before implementation begins.

### 5. Explicit Model Declaration per Dispatch

When dispatching sub-agents in fleet or parallel workflows — or any workflow where cost or
capability matters — always name the model explicitly for every `task()` call.

Using **Auto** for your main interactive session is fine. But when delegating to sub-agents,
accidental escalation to expensive models compounds across multiple parallel lanes. Name the
model so the intent is visible and reviewable.

```text
# ✅ Explicit — model intent is visible and reviewable
task(agent_type: "general-purpose", model: "claude-haiku-4.5",
     prompt: "Scan for unused imports in src/utils/")

# ❌ Implicit — which model runs this? Can change between sessions
task(agent_type: "general-purpose",
     prompt: "Scan for unused imports in src/utils/")
```

Dispatch declaration checklist:

- [ ] Every `task()` call names a model
- [ ] Premium models are reserved for justified tasks (security, architecture, complex review)
- [ ] Exploration and transformation tasks use fast/cheap tier
- [ ] The model choice is readable in the orchestration script itself

### 6. Future Model Integration

When new models appear in Copilot CLI's `/model` output, apply the same explicit-declaration
principle immediately — name the model in every dispatch from the first time you use it.

Check `/model` or Copilot's current documentation when you suspect new model families
have been added. The roster changes over time; avoid hardcoding assumptions about which
models exist without verification.

## Examples

### Security Audit with Premium Model

```text
/model claude-opus-5.5
You: "Perform a security audit of the authentication system in src/auth/.
      Check for injection attacks, token handling issues, and OWASP Top 10."
```

Use the most capable model for security-critical analysis.

### Bulk Documentation with Fast Model

```text
# Launch fleet with cheap model for high-volume doc generation
task(agent_type: "general-purpose", model: "gpt-6-luna",
     prompt: "Add JSDoc to all exports in src/utils/string.ts")
task(agent_type: "general-purpose", model: "gpt-6-luna",
     prompt: "Add JSDoc to all exports in src/utils/array.ts")
task(agent_type: "general-purpose", model: "gpt-6-luna",
     prompt: "Add JSDoc to all exports in src/utils/date.ts")
```

### Model Comparison

Test the same task on different models:

```text
task(agent_type: "general-purpose", model: "gpt-6.1-sol",
     prompt: "Implement a rate limiter middleware...")
task(agent_type: "general-purpose", model: "claude-sonnet-5.5",
     prompt: "Implement a rate limiter middleware...")
```

Compare outputs to find which model produces better code for your use case.

### Builder + Reviewer Pairing

```text
task(agent_type: "general-purpose", model: "gpt-5.3-codex",
     prompt: "Implement the pagination changes described in plan.md")

task(agent_type: "code-review", model: "claude-sonnet-5.5",
     prompt: "Review the pagination changes for correctness, test gaps, and API regressions")
```

### Ecosystem Monitoring Split

```text
# Step 1: classify the upstream signal
task(agent_type: "general-purpose", model: "gpt-6.1-sol",
     prompt: "Use ecosystem-intake and the ecosystem monitoring playbook to review the latest upstream changes and classify them into adopt/adapt/reject for this repository")

# Step 2: only after approval, translate the approved doc change into precise edits
task(agent_type: "general-purpose", model: "gpt-5.3-codex",
     prompt: "Update our ecosystem monitoring playbook and related skill docs to reflect the approved changes")
```

This pattern works well for recurring ecosystem monitoring: use a stronger synthesizer first,
then a code-focused model for the actual repository edits.

## Tips

- **Default to Auto for mixed workloads**: it lowers model-picking overhead and keeps routing
  flexible when a session spans exploration, implementation, and review.
- **Default to standard tier**: Models like `claude-sonnet-5.5` or `gpt-5.3-codex`
  handle 90% of tasks well. Only switch for specific reasons.
- **Use a fast model for exploration**: The built-in `explore` agent defaults to a fast, light model (the reference lists gpt-5.6-luna) for a reason —
  it's fast, cheap, and great for codebase navigation.
- **Route first, then choose models**: decide the execution path with `task-intake-router`
  before spending premium tokens.
- **Premium for high-stakes**: Reserve Opus for security reviews, architecture
  decisions, and complex debugging. The cost is worth it for critical code.
- **Codex variants for code**: GPT Codex models are specifically fine-tuned for code
  generation and editing — prefer them over base GPT for implementation.
- **Avoid brittle counts**: exact model availability changes over time. Re-check `/model`
  or current Copilot docs when updating this playbook.
- **Track model performance**: Note which models work best for your specific codebase
  and task types. Build your own playbook over time.
- **Cost tuning is a routing problem**: if spend matters, pair Auto and explicit overrides with
  [`token-cost-optimizer`](../token-cost-optimizer/SKILL.md) instead of picking one model blindly.
