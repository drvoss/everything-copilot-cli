# Skill: Delegate to Cursor CLI

> **When:** Repo-aware multi-file editing, changes that should share context with an open
> Cursor IDE session, headless JSON/stream-json output for scripting and CI

## Decision Matrix

| Signal | Delegate to Cursor CLI? |
|--------|:-----------------------:|
| Multi-file edit that should stay consistent with an open Cursor IDE session | ✅ Yes |
| Repo-aware refactor across many files with shared context | ✅ Yes |
| Headless CI-driven edit needing structured JSON/stream-json output | ✅ Yes |
| Fast, well-defined single-file code generation | ❌ Use Codex |
| Deep architecture / security reasoning | ❌ Use Claude |
| Multimodal (screenshots, diagrams) or large-document analysis | ❌ Use Antigravity |
| GitHub PR/Issue management | ❌ Use Copilot |

## Method 1: Shell Invocation (Quick)

### Basic Non-Interactive Edit

```powershell
# -f (trust) is required non-interactively, or cursor-agent exits with
# "Workspace Trust Required". -p passes the prompt.
cursor-agent -f -p "Add input validation to the login handler in src/auth/login.ts"
```

### Multi-File Repo-Aware Edit

```powershell
cursor-agent -f -p "Rename the User.legacyId field to User.externalId across the
  codebase: update the Prisma schema, all TypeScript types, service methods, and
  existing tests. Keep the database column name unchanged; only rename the
  in-code field."
```

### Headless JSON Output for CI

```powershell
# Check cursor-agent --help for the exact flag name/format in your installed
# version (e.g. --output-format json or --json) before relying on this in a
# pipeline; flag names have changed across releases.
$result = cursor-agent -f -p "Fix the failing lint errors in src/" --output-format json
$parsed = $result | ConvertFrom-Json
```

### Passing Prompts via stdin (Preferred for Untrusted Text)

```powershell
# Prefer stdin over shell string interpolation when the prompt includes
# untrusted content (issue text, PR descriptions, diffs) — see
# multi-ai-handoff.md's "Security: Pass Prompts via stdin" section.
$promptText | cursor-agent -f -p -
```

## Method 2: MCP Bridge (Recommended for Teams)

### Setup

Add to your MCP configuration:

```json
{
  "servers": {
    "cursor-bridge": {
      "command": "node",
      "args": ["orchestration/scripts/cursor-bridge.js"]
    }
  }
}
```

### Usage

```text
You: "Use Cursor to rename this field consistently across the repo"

Copilot CLI calls cursor_edit through MCP with type-safe parameters.
```

## Template Prompts

### Repo-Wide Rename / Refactor

```text
Rename [old identifier] to [new identifier] across the codebase:
- Update all TypeScript/JavaScript references
- Update imports and exports
- Update tests that reference the old name
- Do not change [anything explicitly out of scope]

Keep changes minimal and consistent with existing code style.
```

### Multi-File Consistency Pass

```text
Apply [pattern/convention] consistently across [directory or file set]:
- Identify every file that currently deviates from the pattern
- Bring each into alignment with minimal, targeted edits
- Do not restructure unrelated code
```

## Processing Cursor Results

### Verify Generated/Edited Code

```powershell
cursor-agent -f -p "Add error handling to all service methods in src/services/"

# Check TypeScript compilation
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    cursor-agent -f -p "Fix all TypeScript compilation errors introduced by the last edit"
}
```

### Run Tests After Edits

```powershell
cursor-agent -f -p "Rename the legacy field across the codebase"
npm test
if ($LASTEXITCODE -ne 0) {
    cursor-agent -f -p "Fix the failing tests. Error output: $(npm test 2>&1)"
}
```

### Integrate with Copilot Workflow

```powershell
# Full flow: Cursor edits repo-wide → verify → Copilot ships
cursor-agent -f -p "Extract the shared validation logic into src/validators/common.ts"

npm run build && npm test

if ($LASTEXITCODE -eq 0) {
    git checkout -b refactor/shared-validation
    git add -A
    git commit -m "refactor: extract shared validation logic

    Implemented by Cursor CLI, verified with existing test suite.

    Co-authored-by: Cursor <cursor@anysphere.com>"
    gh pr create --fill
}
```

## Cursor CLI Flags Reference

| Flag | Description | Example |
|------|-------------|---------|
| `-f` | Trust the workspace non-interactively (required for headless/CI use) | `cursor-agent -f -p "..."` |
| `-p` | Pass the prompt (or `-` to read from stdin) | `cursor-agent -f -p "..."` |
| `--force` | Allow file edits without additional interactive confirmation | `cursor-agent -f --force -p "..."` |

> Flag names and availability vary by installed version — run `cursor-agent --help`
> to confirm exact syntax before relying on it in scripts or CI.

## Best Practices

1. **Always pass `-f`** for non-interactive/CI use, or the run will fail with "Workspace Trust Required".
2. **Prefer stdin for untrusted prompt text** — see the security note in [multi-ai-handoff.md](multi-ai-handoff.md).
3. **Use for repo-aware, multi-file changes** — Cursor CLI's advantage is IDE-shared context and consistency across many files, not raw generation speed.
4. **Always verify** — run build + tests after Cursor edits, same as any other delegated CLI.
5. **Chain with Claude for review** — use Cursor for the mechanical multi-file pass, Claude for a deeper correctness/security review of the result.

## See Also

- [Delegate to Codex](delegate-to-codex.md) — Fast single-task code generation
- [Delegate to Claude](delegate-to-claude.md) — Deep reasoning and review
- [Delegate to Antigravity](delegate-to-antigravity.md) — Multimodal/multi-model analysis
- [Multi-AI Handoff](multi-ai-handoff.md) — Structured cross-tool handoff format
- [Quad-CLI Consensus Gate](quad-cli-consensus-gate.md) — Automated 4-CLI review consensus
