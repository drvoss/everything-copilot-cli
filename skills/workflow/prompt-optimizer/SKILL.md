---
name: prompt-optimizer
description: >
  Use when a rough prompt, vague idea, or task description needs to become a finished
  copy-pasteable prompt for a chat-based LLM - rewrite it into one ready-to-send
  prompt with no blanks, no placeholders, and a clear output shape.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot prompt-optimizer
---

# Prompt Optimizer

Prompt Optimizer turns rough prompting intent into a single reusable prompt that the
user can paste directly into a chat interface.

This is for **chat prompts**, not API parameter tuning or full agent design.

## When to Use

- The user says "rewrite this prompt", "improve this prompt", or "turn this into a prompt"
- The user has a half-formed idea and wants a strong prompt instead of a direct answer
- The user pasted a draft prompt and wants it sharpened for quality, structure, or clarity
- The user wants a reusable prompt they can send to Copilot, Claude, Codex, or another chat LLM

## When NOT to Use

| Instead of prompt-optimizer | Use |
|-----------------------------|-----|
| The user wants the answer to the task right now | answer directly |
| Designing context packs or task briefs for agents | `context-engineering` |
| Generating a new SKILL.md for this repository | `skill-creator` |

## Two Hard Rules

### 1. No placeholders

Do not output blanks like:

- `[insert X]`
- `{topic}`
- `<your input here>`

The result must be ready to send as-is.

### 2. Always ship a finished prompt

There are only two acceptable modes:

- **Case A - real content was provided**: bake that content directly into the final prompt
- **Case B - only the task type was described**: write a self-contained prompt that asks the
  next-model turn for the missing inputs

In both cases, the user should be able to copy, paste, and send immediately.

## Workflow

### 1. Identify the real goal

Before rewriting, decide:

- what output the user wants
- who the output is for
- what constraints matter
- whether this is Case A or Case B

### 2. Choose the right amount of structure

Use simple prose for simple tasks. Use sections or tags only when the task is complex
enough to benefit from them.

Good structure helps. Unnecessary ceremony hurts.

### 3. Handle missing information the right way

If the missing details are essential and the user did not provide them:

- do not create placeholders
- instruct the model to ask a short clarifying question first
- or phrase the prompt so the user will naturally provide the input in the next turn

### 4. Be explicit about output shape

State:

- the deliverable
- the tone
- the format
- the constraints
- any verification or self-check step

If the task is high-stakes, tell the target model to re-check its answer before finishing.

### 5. End with a reasoning cue

Close the prompt with one clear instruction such as:

- `Take time to think through this carefully before responding.`

Adapt the wording to the language and tone of the prompt.

### 6. Output only the final prompt

Return a single fenced code block containing the optimized prompt.

Do not prepend explanation unless the user explicitly asked for commentary.

## Output Format

````markdown
```text
<single final prompt>
```
````

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "A template with blanks is good enough." | Blank templates push the hard work back onto the user. |
| "I'll explain my changes too." | The default deliverable is the prompt, not the meta-commentary. |
| "More structure is always better." | Over-structuring simple asks makes prompts worse, not better. |

## Red Flags

- The output contains brackets or obvious variables
- The prompt assumes missing inputs without saying so
- The result is really an agent spec or system prompt instead of a reusable chat prompt
- The answer includes a long preamble before the code block

## Verification

- [ ] The output is a single ready-to-send prompt
- [ ] No placeholder syntax remains
- [ ] If inputs were missing, the prompt asks for them itself
- [ ] The response defaults to one fenced code block and nothing else

## See Also

- [`context-engineering`](../../development/context-engineering/SKILL.md) - structure task context for agents and multi-step work
- [`skill-creator`](../../development/skill-creator/SKILL.md) - turn a workflow into a repository SKILL.md
