# MCP Configuration Guide

How to configure Model Context Protocol (MCP) servers for GitHub Copilot CLI.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that lets AI assistants connect to external tools and data sources. MCP servers expose capabilities — like searching code, querying databases, or managing files — that the AI can invoke during conversations.

## GitHub MCP — Built In!

**The GitHub MCP server is built into Copilot CLI — no configuration needed.**

Out of the box, Copilot CLI can:
- Search code, repositories, issues, and pull requests
- Read file contents and commits from any accessible repository
- List and inspect GitHub Actions workflows, runs, and jobs
- Get pull request diffs, reviews, and check run status
- Browse issues, labels, and comments

This is a significant advantage — you get full GitHub integration without any setup.

## Adding Custom MCP Servers

You can extend Copilot CLI with additional MCP servers for specialized tools.

### Configuration Locations

MCP servers are configured in `devcontainer.json`, `settings.json` or dedicated MCP config files:

**VS Code workspace (`.vscode/mcp.json`):**
```json
{
  "servers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my-org/mcp-server"],
      "env": {
        "API_KEY": ""
      }
    }
  }
}
```

**User-level config (`~/.copilot/mcp-config.json`):**
```json
{
  "servers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {}
    }
  }
}
```

### Transport Types

MCP supports two transport mechanisms:

1. **stdio** (default) — server runs as a subprocess, communicates via stdin/stdout
2. **SSE** — server runs remotely, communicates via Server-Sent Events over HTTP

```json
{
  "servers": {
    "remote-server": {
      "type": "sse",
      "url": "https://mcp.example.com/sse",
      "headers": {
        "Authorization": "Bearer ${MCP_TOKEN}"
      }
    }
  }
}
```

## Token & Context Considerations

MCP tools consume context window tokens. Keep in mind:

- Each MCP tool description counts against your context budget
- Tool responses can be large — request only what you need
- Too many MCP servers can crowd out space for your actual task
- Start with 2–3 servers and add more only as needed
- Use tools that return structured, concise responses

## Example Configurations

See the other files in this directory for ready-to-use MCP configurations:

| File | Purpose |
|------|---------|
| `github.json` | GitHub MCP reference (built-in, no config needed) |
| `filesystem.json` | Local filesystem operations |
| `memory.json` | Persistent memory / knowledge graph |
| `sequential-thinking.json` | Structured reasoning and problem-solving |

## Troubleshooting

- **Server not starting?** Check that the command is installed and in your PATH
- **Auth errors?** Verify environment variables are set correctly
- **Slow responses?** The MCP server may be doing heavy work — check its logs
- **Tools not appearing?** Reload the config with `mcp_reload` in Copilot CLI
