---
name: zoom-out
description: Use when you are lost in local code details — step one abstraction level up, map the owning modules and callers, and restate the system in project vocabulary
disable-model-invocation: true
metadata:
  category: development
  agent_type: general-purpose
  origin: adapted from mattpocock/skills zoom-out
---

# Zoom Out

Zoom Out is for moments when a function or file is understandable in isolation but the surrounding
system is not. The goal is to move up one abstraction level and rebuild the mental map around the
code you are reading.

## When to Use

- You understand the local code but not why it exists
- A file is readable, yet the owning module and its callers are still unclear
- You need the domain-language explanation of a technical area before editing it
- The next step should be "show me the bigger picture," not "change this line"

## Workflow

### 1. Start from the current artifact

Pick the function, file, or class you are staring at.

### 2. Move one level up

Ask:

- Which module or subsystem owns this?
- What broader workflow is this code participating in?
- Which upstream callers depend on it?

### 3. Translate into project vocabulary

Do not stop at implementation terms. Re-express the answer using the product or domain language
the project actually uses.

### 4. Produce a compact map

Return something like:

```markdown
## Zoom-Out Map

- **Current artifact:** `src/...`
- **Owning module:** ...
- **Upstream callers:** ...
- **Adjacent collaborators:** ...
- **Domain purpose:** ...
- **Next best file to read:** ...
```

## Tips

- Move only one abstraction level at a time; jumping straight to "the whole architecture" often
  produces generic summaries
- Prefer real callers and collaborators over speculative architecture prose
- If the picture is still too large, run Zoom Out again from the owning module

## See Also

- [`context-prime`](../../copilot-exclusive/context-prime/SKILL.md) — load project-wide context at session start
- [`code-tour`](../../documentation/code-tour/SKILL.md) — turn the mental map into an onboarding walkthrough
- [`systematic-debugging`](../systematic-debugging/SKILL.md) — switch from orientation to root-cause analysis
