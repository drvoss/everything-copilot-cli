# Migration Guide: Gemini CLI → Antigravity CLI (`agy`)

> Google retired the free/individual tier of the standalone Gemini CLI on 2026-06-18. Its
> official successor for the orchestration patterns in this repository is **Antigravity CLI**
> (binary: `agy`), announced at Google I/O 2026. This guide covers what changed and how to
> migrate configs, scripts, and plugins that still target the old `gemini` command.

## When to Use This Guide

- You have existing scripts, MCP configs, or CI pipelines that invoke the `gemini` binary
- You maintained a Gemini CLI plugin/hook and need to know if it still works
- You're updating documentation or automation that still references "Gemini CLI" as an
  orchestration spoke and need the equivalent Antigravity CLI command/flag

## What Changed

| Aspect | Gemini CLI (retired) | Antigravity CLI (`agy`) |
|--------|-----------------------|--------------------------|
| Binary name | `gemini` | `agy` |
| Prompt flag | `--prompt "PROMPT"` | `-p "PROMPT"` |
| Backend | Single model (Gemini) | Multi-model: Gemini 3.x, Claude, or GPT-OSS, selectable via `--model` |
| Sandbox | Ambient system permissions by default | Sandboxed shell by default; `--sandbox` needed for file/network access |
| Free tier | Individual tier retired 2026-06-18 | Current — check Google's official docs for licensing details |
| Strengths documented here | Performance analysis, general prompting | Multimodal (screenshots/diagrams), large-document digestion, multi-model backend, Google grounding, background subagents |

> Gemini CLI access via Code Assist Standard/Enterprise or Google Cloud licensing may still be
> supported separately from the retired free/individual tier — check current Google
> documentation if that applies to your organization before assuming a hard cutover is required.

## Step 1: Import Existing Plugins/Config

```powershell
agy plugin import gemini
```

This imports a previously-configured Gemini CLI plugin/hook setup into Antigravity CLI where
possible. Not all Gemini CLI plugins have a 1:1 Antigravity equivalent — review the import
output for anything it could not translate automatically.

## Step 2: Re-Verify Sandbox / Permission Behavior

`agy` runs in a sandboxed shell by default, unlike Gemini CLI's ambient system permissions.
A migrated plugin or hook that assumed it could touch files or the network directly **can fail
silently** under Antigravity's sandbox until permissions are explicitly re-granted:

```powershell
# If a migrated plugin needs file/network access, pass --sandbox explicitly
agy -p "PROMPT" --sandbox
```

Do not assume a migrated plugin "just works" — re-test it once, in a low-stakes context,
before wiring it into CI or automation.

## Step 3: Update Command Invocations

Find and replace direct `gemini` binary invocations:

```powershell
# Before
gemini --prompt "Analyze src/ for performance bottlenecks"

# After
agy -p "Analyze src/ for performance bottlenecks"
```

```powershell
# Before
gemini --version

# After
agy --version
```

## Step 4: Update Orchestration Configs

If you maintain a local copy of `orchestration/configs/multi-agent.json` (or a similar
multi-agent config), replace any `gemini-cli` agent entry with the `antigravity` entry —
see that file for the current shape (`command: "agy"`, `args: ["-p"]`). Verify the actual
auth method (API key vs OAuth) and exact flags with `agy --help` before relying on a config
you have not tested against your installed version.

## Step 5: Diversity/Consensus Considerations

Antigravity CLI is multi-model: it can be configured to run on Gemini, Claude, or GPT-OSS
depending on `--model`. If you use `agy` alongside other CLIs (e.g., in the
[Quad-CLI Consensus Gate](../orchestration/skills/quad-cli-consensus-gate.md)) for
independent-opinion consensus, be aware that an `agy` instance running on a Claude backend
is **not an independent opinion** from a `claude` CLI instance — see that skill's Model
Family Voting section and `schemas/backend-families.json` for how this repo's tooling
accounts for that.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `agy: command not found` | Antigravity CLI not installed | Install per current Google documentation; this repo does not bundle it |
| Migrated plugin silently does nothing | Sandbox blocking file/network access | Re-run with `--sandbox` and re-check permissions |
| `agy --help` shows different flags than this guide | CLI version drift | Trust `agy --help` over this document; flags may change between releases |
| Need the old single-model (Gemini-only) behavior | Multi-model backend defaults to a different model | Pin explicitly with `--model gemini` |

## See Also

- [Delegate to Antigravity](../orchestration/skills/delegate-to-antigravity.md) — Full delegation skill doc and shell examples
- [Quad-CLI Consensus Gate](../orchestration/skills/quad-cli-consensus-gate.md) — Multi-CLI consensus review, including model-family-aware voting
- [Multi-AI Handoff](../orchestration/skills/multi-ai-handoff.md) — Structured cross-tool handoff format
