---
name: ide-switching
description: Seamless VS Code ↔ CLI workflow with shared context and complementary strengths
category: copilot-exclusive
copilot_feature: VS Code integration, shared Copilot subscription, unified context model
---

# IDE ↔ CLI Switching

## Why This is Copilot-Exclusive

GitHub Copilot exists in **both VS Code and the terminal** under a single subscription and
unified platform. You can start a conversation in VS Code's Copilot Chat, switch to the CLI
for batch automation, and return to VS Code for visual debugging — all with the same model
access, same MCP servers, and same GitHub integration. Claude Code is terminal-only with no
IDE counterpart; switching contexts means losing your AI assistant entirely.

## When to Use

- Visual tasks (diffing, debugging UI, extension-based tooling) → VS Code
- Batch operations, automation, scripting → CLI
- Large refactors that benefit from both visual review and automated execution
- When VS Code's Copilot Chat lacks a tool you need (SQL, fleet agents, MCP)
- Pair programming where one person uses IDE, another uses CLI

## Workflow

### Know Your Strengths: When to Use Each

| Task                        | VS Code Copilot          | Copilot CLI              |
|-----------------------------|--------------------------|--------------------------|
| Visual code review          | ✅ Side-by-side diffing  | ❌                       |
| Breakpoint debugging        | ✅ Debug panel            | ❌                       |
| Single-file inline edits    | ✅ Inline suggestions     | ✅ Edit tool             |
| Multi-file refactoring      | ⚠️ Limited               | ✅ Fleet mode            |
| CI/CD debugging             | ❌                        | ✅ Actions MCP tools     |
| PR review & management      | ⚠️ Basic                 | ✅ Full GitHub MCP       |
| Batch test execution        | ⚠️ Manual                | ✅ Background agents     |
| SQL-based task tracking     | ❌                        | ✅ Session database      |
| Multi-model selection       | ⚠️ Limited               | ✅ 18 models available   |
| Terminal automation         | ⚠️ Integrated terminal   | ✅ Native                |

### Switching Patterns

#### Pattern 1: CLI-First, Visual Verify

1. Use Copilot CLI to make sweeping changes across many files
2. Open VS Code: `code .`
3. Use VS Code's Source Control panel to review all changes visually
4. Use VS Code's Copilot Chat to ask questions about specific diffs
5. Return to CLI for any follow-up batch operations

#### Pattern 2: VS Code Debug, CLI Fix

1. Hit a bug while coding in VS Code
2. Use VS Code debugger to identify the root cause
3. Switch to CLI for the fix — especially if it spans multiple files
4. CLI makes the edits, runs the tests, confirms the fix
5. Back to VS Code for continued development

#### Pattern 3: Shared MCP Configuration

Both VS Code and CLI can read from `.vscode/mcp.json`:

```json
{
  "servers": {
    "my-api": {
      "command": "npx",
      "args": ["my-api-mcp-server"],
      "env": { "API_KEY": "${env:MY_API_KEY}" }
    }
  }
}
```

Configure once, use in both environments.

## Examples

### Large Refactor Workflow

```bash
# Step 1: CLI - Rename across the codebase
# "Rename the UserService class to AuthService in all files under src/"
# Copilot uses fleet agents to process files in parallel

# Step 2: VS Code - Visual review
code .
# Review changes in Source Control panel, check diff views

# Step 3: CLI - Run tests and fix issues
# "Run the full test suite and fix any failures from the rename"
```

### Morning Developer Workflow

```bash
# Start in CLI for triage
# "List my open PRs, check CI status, and summarize review comments"

# Switch to VS Code for focused coding
code src/feature.ts
# Use Copilot Chat inline for suggestions

# Back to CLI for PR creation
# "Create a PR for this branch with a description based on my commits"
```

## Tips

- **MCP config sharing**: Place MCP configs in `.vscode/mcp.json` so both VS Code
  Copilot and CLI can use the same external tools.
- **Use CLI for what VS Code can't do**: Fleet mode, background agents, session SQL,
  and Actions debugging are CLI-exclusive features.
- **Quick switch**: Keep a terminal open alongside VS Code. Use `code <file>` from CLI
  to open specific files for visual inspection.
- **Context handoff**: When switching from VS Code to CLI, paste relevant code snippets
  or error messages to give CLI the context it needs.
- **Same subscription**: Both tools use the same GitHub Copilot license — no extra cost
  for using both. Maximize your subscription value.
