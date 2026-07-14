# Skill: Delegate to Antigravity CLI (agy)

> **When:** Multimodal analysis, screenshot or diagram interpretation, very large document digestion, or tasks that benefit from running multiple models (Gemini 3.x, Claude, GPT-OSS) behind one CLI, before handing results back to Copilot CLI
>
> **Note:** Antigravity CLI (`agy`) is Google's official successor to the standalone Gemini CLI, announced at Google I/O 2026.
> The free/individual Gemini CLI tier stopped serving requests on 2026-06-18. If you have an existing Gemini CLI setup, migrate
> it with `agy plugin import gemini` (see [migration-from-gemini-cli.md](../../guides/migration-from-gemini-cli.md)). Gemini
> CLI access via Code Assist Standard/Enterprise or Google Cloud licensing may still be supported separately — check current
> Google documentation if that applies to you.

## Decision Matrix

| Signal | Delegate to Antigravity (`agy`)? |
|--------|:-------------------:|
| Need to analyze screenshots, diagrams, or other images | ✅ Yes |
| Need to digest a very large document before implementation starts | ✅ Yes |
| Need to extract structure from mixed visual + text input | ✅ Yes |
| Need multiple models (Gemini 3.x/Claude/GPT-OSS) behind one CLI, or background subagents | ✅ Yes |
| Need GitHub PR, Issue, or Actions operations | ❌ Use Copilot |
| Need fast boilerplate or CRUD generation | ❌ Use Codex |
| Need deep architecture or security judgment | ❌ Use Claude |
| Need repo-aware multi-file editing with IDE-shared context | ❌ Use Cursor |

## Method 1: Shell Invocation (Quick)

> ⚠️ `agy` is not installed/verified in this environment. Confirm exact flag names with `agy --help` before relying on the examples below — flag names shown are illustrative based on the general `agy -p "PROMPT"` pattern documented for Antigravity CLI.

### Screenshot or Diagram Analysis

```powershell
$result = agy -p @"
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
$result = agy -p @"
Read this large document and extract:
1. key requirements
2. constraints that affect implementation
3. unanswered questions

Return a concise bullet list for Copilot CLI to act on.
"@ --file path/to/large-spec.md

Write-Output $result
```

### Sandboxed Execution

`agy` runs in a sandboxed shell by default. If you need it to touch files or the network directly (e.g., via a migrated Gemini CLI plugin), pass `--sandbox` explicitly and confirm the permission model — plugins that assumed ambient system permissions under Gemini CLI can fail silently under Antigravity's sandbox until permissions are re-granted. See [migration-from-gemini-cli.md](../../guides/migration-from-gemini-cli.md).

```powershell
agy -p "PROMPT" --sandbox
```

## Method 2: Structured Handoff

When Antigravity is doing analysis that will return to Copilot for GitHub-side execution,
use the shared handoff envelope:

```json
{
  "handoff_version": "1.0",
  "from": "copilot-cli",
  "to": "antigravity-cli",
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
  "return_action": "turn Antigravity's findings into issues, tasks, or PR work"
}
```

See [`multi-ai-handoff.md`](multi-ai-handoff.md) for the full envelope format.

## How Copilot Uses Antigravity's Output

Typical flow:

```text
Antigravity (agy) analyzes screenshots or a large document
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

1. Use Antigravity for **analysis-first** work, then hand implementation back to Copilot or Codex
2. Ask for structured output that Copilot can reuse directly
3. Keep GitHub-native actions in Copilot CLI even when Antigravity did the analysis
4. Prefer the handoff protocol when the result must be reused across tools
5. Confirm sandbox/permission behavior before relying on any migrated Gemini CLI plugin or hook

## See Also

- [Delegate to Claude](delegate-to-claude.md) — deep reasoning, architecture, security
- [Delegate to Codex](delegate-to-codex.md) — fast code generation and implementation
- [Delegate to Cursor](delegate-to-cursor.md) — repo-aware multi-file editing
- [Multi-AI Handoff](multi-ai-handoff.md) — structured cross-tool handoff format
- [Quad-CLI Consensus Gate](quad-cli-consensus-gate.md) — automated 4-CLI review consensus
- [Migration from Gemini CLI](../../guides/migration-from-gemini-cli.md) — `agy plugin import gemini` and sandbox notes
- [Orchestration README](../README.md) — overall pattern catalog and strength matrix
