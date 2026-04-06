---
name: code-tour
description: Use when a user asks for a code tour, onboarding walkthrough, architecture tour, or PR tour — creates persona-targeted, step-by-step `.tour` files with real file and line anchors
metadata:
  category: documentation
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# Code Tour

Create **CodeTour** `.tour` files for codebase walkthroughs that open directly to real files and line ranges. Tours live in `.tours/` and are meant for the CodeTour format, not ad hoc Markdown notes.

A good tour is a narrative for a specific reader: what they are looking at, why it matters, and what path to follow next.

**Only create `.tour` JSON files. Do not modify source code.**

## When to Use

- User asks for a code tour, onboarding tour, architecture walkthrough, or PR tour
- User says "explain how X works" and wants a reusable guided artifact
- Onboarding a new maintainer or reviewer
- Documenting an RCA failure path or security trust boundary

## When NOT to Use

| Instead of code-tour | Use |
|---------------------|-----|
| A one-off chat explanation is enough | answer directly |
| User wants prose docs, not a `.tour` artifact | `doc-update` skill |
| Task is implementation or refactoring | implement directly |

## Workflow

### 1. Discover

Explore the repo before writing anything:
- README and entry points
- Folder structure and key config files
- Changed files if PR-focused

Do not start writing steps before understanding the code shape.

### 2. Infer the reader persona

| Request shape | Persona | Steps |
|---------------|---------|-------|
| "onboarding", "new joiner" | `new-joiner` | 9–13 |
| "quick tour", "vibe check" | `vibecoder` | 5–8 |
| "architecture" | `architect` | 14–18 |
| "tour this PR" | `pr-reviewer` | 7–11 |
| "why did this break" | `rca-investigator` | 7–11 |
| "security review" | `security-reviewer` | 7–11 |

### 3. Verify anchors

Every file path and line anchor must be real:
- Confirm the file exists (`glob` / `grep`)
- Confirm line numbers are in range (`view` with `view_range`)
- Never guess line numbers

### 4. Write the `.tour` file

Output path: `.tours/<persona>-<focus>.tour`

```json
{
  "title": "<Tour Title>",
  "description": "<One sentence: who this tour is for and what it covers>",
  "steps": [
    {
      "file": "src/auth/middleware.ts",
      "line": 42,
      "title": "Auth Gate",
      "description": "Every protected request passes here first. Notice the early-return on missing tokens."
    },
    {
      "directory": "src/services",
      "title": "Service Layer",
      "description": "All business logic lives here — handlers delegate immediately to these services."
    },
    {
      "file": "src/core/pipeline.ts",
      "selection": {
        "start": { "line": 15, "character": 0 },
        "end": { "line": 34, "character": 0 }
      },
      "title": "Request Pipeline",
      "description": "The 5-stage pipeline that every request traverses."
    }
  ]
}
```

### 5. Validate before finishing

- Every referenced path exists
- Every line or selection is in range
- First step is anchored to a real file or directory (not content-only)
- Tour tells a coherent story, not just a file list

## Step Types

| Type | Use when |
|------|----------|
| `file` + `line` | Default — anchor to a specific line |
| `file` + `selection` | A specific block matters more than the whole file |
| `directory` | Orient the reader to a module boundary |
| content-only | Closing "next steps" only — never as first step |

## See Also

- [doc-update](../doc-update/SKILL.md) — prose documentation updates
- [pr-multi-perspective-review](../../development/pr-multi-perspective-review/SKILL.md) — review a PR from multiple lenses
