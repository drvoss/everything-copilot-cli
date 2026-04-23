# Skill: Delegate to Gemini CLI

> **When:** Multimodal analysis, screenshot or diagram interpretation, and very large document digestion before handing results back to Copilot CLI

## Decision Matrix

| Signal | Delegate to Gemini? |
|--------|:-------------------:|
| Need to analyze screenshots, diagrams, or other images | ✅ Yes |
| Need to digest a very large document before implementation starts | ✅ Yes |
| Need to extract structure from mixed visual + text input | ✅ Yes |
| Need GitHub PR, Issue, or Actions operations | ❌ Use Copilot |
| Need fast boilerplate or CRUD generation | ❌ Use Codex |
| Need deep architecture or security judgment | ❌ Use Claude |

## Method 1: Shell Invocation (Quick)

### Screenshot or Diagram Analysis

```powershell
$result = gemini -p @"
Analyze this architecture diagram.

Return:
1. the main components
2. likely bottlenecks or single points of failure
3. open questions Copilot should verify in the codebase
"@ --image path/to/diagram.png

Write-Output $result
```

### Large Document Distillation

```powershell
$result = gemini -p @"
Read this large document and extract:
1. key requirements
2. constraints that affect implementation
3. unanswered questions

Return a concise bullet list for Copilot CLI to act on.
"@ --file path/to/large-spec.md

Write-Output $result
```

## Method 2: Structured Handoff

When Gemini is doing analysis that will return to Copilot for GitHub-side execution,
use the shared handoff envelope:

```json
{
  "handoff_version": "1.0",
  "from": "copilot-cli",
  "to": "gemini-cli",
  "task": {
    "original_intent": "Analyze screenshots and extract implementation tasks",
    "status": "delegated",
    "completed_steps": [],
    "next_step": "Return a structured summary to Copilot CLI"
  },
  "context": {
    "files_to_analyze": ["mockups/dashboard.png", "docs/spec.md"],
    "output_format": "bullets or JSON"
  },
  "return_to": "copilot-cli",
  "return_action": "turn Gemini's findings into issues, tasks, or PR work"
}
```

See [`multi-ai-handoff.md`](multi-ai-handoff.md) for the full envelope format.

## How Copilot Uses Gemini's Output

Typical flow:

```text
Gemini analyzes screenshots or a large document
  -> returns structured findings
  -> Copilot converts findings into GitHub issues, PR plans, or fleet tasks
  -> Copilot remains the hub for shipping and GitHub-native operations
```

## Template Prompts

### UI Reverse-Engineering

```text
Analyze these screenshots and extract:
1. the visible components
2. repeated layout patterns
3. likely states or variants
4. questions that require codebase verification

Return a component inventory Copilot can turn into implementation tasks.
```

### Requirements Extraction

```text
Read this large product or requirements document.

Return:
1. implementation requirements
2. acceptance criteria
3. constraints
4. ambiguous areas that need a human decision
```

## Best Practices

1. Use Gemini for **analysis-first** work, then hand implementation back to Copilot or Codex
2. Ask for structured output that Copilot can reuse directly
3. Keep GitHub-native actions in Copilot CLI even when Gemini did the analysis
4. Prefer the handoff protocol when the result must be reused across tools

## See Also

- [Delegate to Claude](delegate-to-claude.md) — deep reasoning, architecture, security
- [Delegate to Codex](delegate-to-codex.md) — fast code generation and implementation
- [Multi-AI Handoff](multi-ai-handoff.md) — structured cross-tool handoff format
- [Orchestration README](../README.md) — overall pattern catalog and strength matrix
