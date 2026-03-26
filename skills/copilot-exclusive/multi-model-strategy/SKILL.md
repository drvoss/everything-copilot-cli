---
name: multi-model-strategy
description: Strategic use of 20+ available AI models for optimal cost, speed, and quality
metadata:
  category: copilot-exclusive
  copilot_feature: "20+ model selection (/model command), per-agent model override, cost tiers"
---

# Multi-Model Strategy

## Why This is Copilot-Exclusive

Copilot CLI provides access to **18 different AI models** across OpenAI, Anthropic, and Google,
switchable at any time via the `/model` command or per-agent via the `model` parameter. This
includes premium models (Claude Opus), standard models (GPT-5, Sonnet), and fast/cheap models
(Haiku, GPT-4.1). Claude Code is locked to Anthropic models only — no GPT, no Gemini, no
cross-provider optimization.

## When to Use

- Matching model strengths to task requirements
- Optimizing cost for high-volume operations (use cheaper models for exploration)
- Using premium models for security-critical or architecturally complex work
- Running different models for different sub-agents in the same session
- A/B testing model quality on the same task

## Workflow

### Model Tiers and Strengths

#### Premium Tier (Deep Reasoning)
| Model                        | Best For                                    |
|------------------------------|---------------------------------------------|
| `claude-opus-4.6`            | Complex architecture, security analysis     |
| `claude-opus-4.6-fast`       | Same quality, lower latency                 |
| `claude-opus-4.6`            | Deep reasoning, nuanced code review         |

#### Standard Tier (General Purpose)
| Model                        | Best For                                    |
|------------------------------|---------------------------------------------|
| `gpt-5.4`                    | Latest GPT, strong code generation          |
| `gpt-5.3-codex`              | Code-optimized GPT                          |
| `gpt-5.2-codex`              | Code-optimized GPT (previous gen)           |
| `gpt-5.2`                    | General purpose                             |
| `gpt-5.1-codex-max`          | Maximum code capability                     |
| `gpt-5.1-codex`              | Code-optimized GPT                          |
| `gpt-5.1`                    | General purpose                             |
| `claude-sonnet-4.6`          | Balanced quality/speed                      |
| `claude-sonnet-4.5`          | Balanced quality/speed (previous gen)       |
| `claude-sonnet-4`            | Efficient standard reasoning                |
| `gemini-3-pro-preview`       | Multimodal, large context                   |

#### Fast/Cheap Tier (High Volume)
| Model                        | Best For                                    |
|------------------------------|---------------------------------------------|
| `gpt-5.1-codex-mini`         | Fast code tasks                             |
| `gpt-5-mini`                 | Quick general tasks                         |
| `claude-haiku-4.5`           | Exploration, simple edits, high-volume      |

### 1. Switch Your Main Model

```
/model claude-opus-4.6
```

Changes the model for your current interactive session.

### 2. Per-Agent Model Override

Assign different models to different sub-agents:

```
# Cheap model for exploration
task(agent_type: "explore", model: "claude-haiku-4.5",
     prompt: "Find all files that import the UserService class")

# Premium model for security review
task(agent_type: "code-review", model: "claude-opus-4.6",
     prompt: "Review these auth changes for security vulnerabilities")

# Fast model for test generation
task(agent_type: "general-purpose", model: "gpt-5.1-codex-mini",
     prompt: "Generate unit tests for src/utils/validator.ts")
```

### 3. Cost-Optimized Workflow

```
Phase 1 - Exploration (cheap):     claude-haiku-4.5
Phase 2 - Planning (standard):     claude-sonnet-4.6
Phase 3 - Implementation (code):   gpt-5.3-codex
Phase 4 - Review (premium):        claude-opus-4.6
Phase 5 - Test generation (fast):  gpt-5.1-codex-mini
```

## Examples

### Security Audit with Premium Model

```
/model claude-opus-4.6
You: "Perform a security audit of the authentication system in src/auth/.
      Check for injection attacks, token handling issues, and OWASP Top 10."
```

Use the most capable model for security-critical analysis.

### Bulk Documentation with Fast Model

```
# Launch fleet with cheap model for high-volume doc generation
task(agent_type: "general-purpose", model: "gpt-5-mini",
     prompt: "Add JSDoc to all exports in src/utils/string.ts")
task(agent_type: "general-purpose", model: "gpt-5-mini",
     prompt: "Add JSDoc to all exports in src/utils/array.ts")
task(agent_type: "general-purpose", model: "gpt-5-mini",
     prompt: "Add JSDoc to all exports in src/utils/date.ts")
```

### Model Comparison

Test the same task on different models:

```
task(agent_type: "general-purpose", model: "gpt-5.4",
     prompt: "Implement a rate limiter middleware...")
task(agent_type: "general-purpose", model: "claude-sonnet-4.6",
     prompt: "Implement a rate limiter middleware...")
```

Compare outputs to find which model produces better code for your use case.

## Tips

- **Default to standard tier**: Models like `claude-sonnet-4.6` or `gpt-5.3-codex`
  handle 90% of tasks well. Only switch for specific reasons.
- **Use Haiku for exploration**: The `explore` agent defaults to Haiku for a reason —
  it's fast, cheap, and great for codebase navigation.
- **Premium for high-stakes**: Reserve Opus for security reviews, architecture
  decisions, and complex debugging. The cost is worth it for critical code.
- **Codex variants for code**: GPT Codex models are specifically fine-tuned for code
  generation and editing — prefer them over base GPT for implementation.
- **Gemini for large contexts**: `gemini-3-pro-preview` excels with very large files
  or when processing multiple large documents simultaneously.
- **Track model performance**: Note which models work best for your specific codebase
  and task types. Build your own playbook over time.
