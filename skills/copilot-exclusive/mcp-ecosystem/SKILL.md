---
name: mcp-ecosystem
description: Use when Copilot CLI's built-in tools don't cover a service you need (database, custom API, internal tool) — add an MCP server to extend capabilities beyond the default GitHub MCP. NOT when the built-in tools already cover the task.
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP, MCP config system, mcp_reload/mcp_validate tools"
---

# MCP Server Ecosystem

## Why This is Copilot-Exclusive

Copilot CLI ships with a **built-in GitHub MCP server** providing 20+ tools for Issues, PRs,
Actions, code search, and repository management — zero configuration required. Beyond that, it
has a robust MCP extension system with config files, hot-reload (`mcp_reload`), and validation
(`mcp_validate`). Claude Code supports MCP but has no built-in servers and a less mature
configuration workflow.

## When to Use

- Accessing GitHub resources natively (the built-in MCP covers most needs)
- Adding domain-specific tools (databases, APIs, cloud services)
- Creating MCP bridges to internal systems
- Sharing tool configurations across VS Code and CLI
- Building custom AI-powered workflows with specialized servers

## Workflow

### 1. Built-In GitHub MCP (Zero Config)

These tools work immediately — no setup required:

**Repository & Code:**

- `get_file_contents` — Read files from any GitHub repo
- `search_code` — Search code across all of GitHub
- `search_repositories` — Find repos by topic, language, etc.
- `list_branches`, `list_commits`, `get_commit` — Git history

**Issues:**

- `list_issues`, `search_issues` — Find and filter issues
- `issue_read` — Get details, comments, sub-issues, labels

**Pull Requests:**

- `list_pull_requests`, `search_pull_requests` — Find PRs
- `pull_request_read` — Diffs, reviews, check runs, files

**Actions:**

- `actions_list`, `actions_get` — Workflow and run details
- `get_job_logs` — CI/CD log analysis

**Users:**

- `search_users` — Find GitHub users

### 2. Add Custom MCP Servers

#### Global Configuration

Edit `~/.copilot/mcp-config.json`:

```json
{
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/docs"]
    }
  }
}
```

#### Project-Level Configuration

Create `.vscode/mcp.json` in your repo (shared with VS Code):

```json
{
  "servers": {
    "my-api": {
      "command": "node",
      "args": ["./tools/mcp-server.js"],
      "env": {
        "API_KEY": "${env:MY_API_KEY}"
      }
    }
  }
}
```

### 3. Validate Configuration

Before loading, check for errors:

```text
Tool: mcp_validate
  path: "C:\\Users\\dev\\.copilot\\mcp-config.json"
```

### 4. Hot-Reload Without Restart

After editing your config, reload without restarting the CLI:

```text
Tool: mcp_reload
```

All MCP servers restart with the new configuration.

### 5. Verify Available Tools

After reload, your new tools appear alongside the built-in ones.
Copilot automatically discovers and can use all registered MCP tools.

## Examples

### Database-Aware Development

```json
// .vscode/mcp.json
{
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "${env:DATABASE_URL}" }
    }
  }
}
```

Now Copilot can query your database directly:

> "Show me the schema for the users table and write a migration to add
> an email_verified column"

### Multi-Service Architecture

```json
{
  "servers": {
    "github": "built-in",
    "postgres": { "command": "npx", "args": ["-y", "@mcp/server-postgres"] },
    "redis": { "command": "npx", "args": ["-y", "@mcp/server-redis"] },
    "slack": { "command": "npx", "args": ["-y", "@mcp/server-slack"] }
  }
}
```

Copilot can now coordinate across GitHub, your database, cache, and
communication channels — all through native tool calls.

### Building a Custom MCP Server

Create a project-specific MCP server for your domain:

```javascript
// tools/mcp-server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "my-project-tools" });

server.tool("get_feature_flags", { env: z.string() }, async ({ env }) => {
  const flags = await fetchFeatureFlags(env);
  return { content: [{ type: "text", text: JSON.stringify(flags) }] };
});

server.run();
```

Register it in `.vscode/mcp.json` and Copilot can query feature flags natively.

## Tips

- **Start with built-in GitHub MCP**: It covers 90% of GitHub workflows. Only
  add custom servers when you need tools beyond GitHub.
- **Use `.vscode/mcp.json` for team tools**: Project-level configs are committed
  to the repo and shared across the team.
- **Use `~/.copilot/mcp-config.json` for personal tools**: Global configs for
  tools only you use (personal databases, API keys).
- **Environment variables**: Use `${env:VAR_NAME}` syntax to keep secrets out
  of config files.
- **Validate before reload**: Always run `mcp_validate` before `mcp_reload` to
  catch syntax errors early.
- **Hot-reload is your friend**: Edit configs and reload without losing your
  session context. Iterate quickly on MCP setups.
