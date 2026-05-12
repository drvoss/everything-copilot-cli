---
name: mcp-ecosystem
description: Use when Copilot CLI's built-in tools don't cover a service you need (database, custom API, internal tool) — add an MCP server to extend capabilities beyond the default GitHub MCP. NOT when the built-in tools already cover the task.
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP, copilot mcp commands, workspace .mcp.json, plugin MCP servers"
---

# MCP Server Ecosystem

## Why This is Copilot-Exclusive

Copilot CLI ships with a **built-in GitHub MCP server** providing 20+ tools for Issues, PRs,
Actions, code search, and repository management — zero configuration required. Beyond that, it
has a practical MCP management flow through `copilot mcp add`, `copilot mcp list`,
`copilot mcp get`, user config at `~/.copilot/mcp-config.json`, workspace config in `.mcp.json`,
and plugin-provided MCP servers. Claude Code supports MCP but has no built-in GitHub server and a
different configuration workflow.

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

Use `copilot mcp add` for user-level installs, or edit `~/.copilot/mcp-config.json` directly:

```text
copilot mcp add context7 -- npx -y @upstash/context7-mcp
copilot mcp add --transport http notion https://mcp.notion.com/mcp
```

Equivalent JSON:

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

Create `.mcp.json` in your repo:

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

### 3. Inspect Configured Servers

Use the CLI to inspect what Copilot currently sees:

```text
copilot mcp list
copilot mcp get my-api
```

### 4. Load Servers into a Session

Copilot loads MCP servers from three sources:

- user config: `~/.copilot/mcp-config.json`
- workspace config: `.mcp.json`
- installed plugins that expose MCP servers

Inside a running session, use `/env` to inspect which MCP servers were loaded for that session.

### 5. Verify Available Tools

Once the session has loaded your config, new tools appear alongside the built-in ones.
Copilot automatically discovers and can use all registered MCP tools.

If a configured server is missing, check `copilot mcp list`, then inspect the specific entry with
`copilot mcp get <name>`.

### 6. Use Context7 for Live Documentation

When you need current, version-aware framework or library docs, Context7 is one of the
highest-value MCP servers to add.

Use the two-stage lookup pattern:

#### Stage 1: Resolve the library ID

```text
use context7
resolve the library ID for: next.js
```

#### Stage 2: Fetch targeted docs

```text
use context7
get current docs for /vercel/next.js
focus on: App Router middleware, route handlers
```

If you already know the library ID or only need one focused answer, you can combine the
lookup into a single prompt:

```text
How do I configure middleware in Next.js 15 App Router? use context7
```

This pattern is especially useful when:

- the installed library version may differ from model training data
- a framework recently changed APIs
- you need official docs instead of secondary tutorials

## Examples

### Database-Aware Development

```json
// .mcp.json
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

Register it in `.mcp.json` and Copilot can query feature flags natively.

## Troubleshooting

### Inspect the active configuration

```text
copilot mcp list
copilot mcp get <name>
/env
```

| Symptom | Likely cause | What to check |
|---------|--------------|---------------|
| Server missing from `copilot mcp list` | Wrong config path or invalid JSON | Confirm the file is `.mcp.json` in the workspace root or `~/.copilot/mcp-config.json` for user config |
| Server is listed but tools are unavailable in-session | Session loaded a different config state | Use `/env` to inspect loaded MCP servers for the current session |
| Remote server fails to respond | URL, auth header, or timeout issue | Re-check the remote endpoint and any `--header` values |
| Local stdio server fails | Command path or dependencies are missing | Run the command manually and inspect its stderr outside Copilot |

## Tips

- **Start with built-in GitHub MCP**: It covers 90% of GitHub workflows. Only
  add custom servers when you need tools beyond GitHub.
- **Use `.mcp.json` for team tools**: Project-level configs live at the workspace root
  and can be committed to the repo for team use.
- **Use `~/.copilot/mcp-config.json` for personal tools**: Global configs for
  tools only you use (personal databases, API keys).
- **Environment variables**: Use `${env:VAR_NAME}` syntax to keep secrets out
  of config files.
- **Inspect before you trust**: `copilot mcp list` and `copilot mcp get` are the
  fastest way to verify that Copilot is seeing the server definition you expect.
- **Re-check fast-moving MCP tools**: Context7 evolves quickly, so confirm its latest
  CLI and MCP behavior against upstream docs before standardizing new team workflows.

## See Also

- [`github-code-search`](../github-code-search/SKILL.md) — use the built-in GitHub code index as grounded implementation context
