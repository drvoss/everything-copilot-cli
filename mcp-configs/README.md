# MCP Configuration Guide

How to configure Model Context Protocol (MCP) servers for GitHub Copilot CLI.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that lets AI assistants connect to external tools and data sources. MCP servers expose capabilities — like searching code, querying databases, or managing files — that the AI can invoke during conversations.

## GitHub MCP — Built In

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

Copilot CLI reads MCP servers from:

- workspace `.mcp.json`
- user config `~/.copilot/mcp-config.json`
- installed plugins that expose MCP servers

**Workspace config (`.mcp.json`):**

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
| `context7.json` | Latest library docs injected on demand |
| `codebase-memory.json` | Persistent codebase knowledge graph |

## Context7 — Up-to-Date Library Docs

[Context7](https://github.com/upstash/context7) solves a common problem: LLMs have
a training cutoff, so they produce code using outdated APIs.

**Setup (from `context7.json`):**

```json
{
  "servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

**Usage:** Append `use context7` to any prompt.

```text
# Before: Copilot generates code using an outdated Next.js API
"How do I set up a Next.js App Router with Prisma?"

# After: Copilot fetches current docs first
"How do I set up a Next.js App Router with Prisma? use context7"
```

Context7 works for any library in its index (React, Vue, Next.js, Prisma, FastAPI, etc.).
No API key required for basic use.

## Codebase Memory — Persistent Knowledge Graph

[codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) converts your
codebase into a persistent SQLite knowledge graph that survives across sessions.

**Setup (from `codebase-memory.json`):**

```json
{
  "servers": {
    "codebase-memory": {
      "command": "npx",
      "args": ["-y", "@deusdata/codebase-memory-mcp@latest"],
      "env": {
        "CODEBASE_ROOT": "${workspaceFolder}",
        "MEMORY_DB_PATH": "${userHome}/.copilot/codebase-memory.db"
      }
    }
  }
}
```

**Use when:** You want Copilot to remember relationships between files, symbols, and
patterns across sessions — especially useful for large codebases.

## Building Custom MCP Servers with fastmcp

[fastmcp](https://github.com/jlowin/fastmcp) lets you build custom MCP servers with
minimal Python code. Use it to expose internal tools, APIs, or databases to Copilot CLI.

**Minimal custom server example:**

```python
# my_tools_server.py
from fastmcp import FastMCP

mcp = FastMCP("My Dev Tools")

@mcp.tool()
def get_feature_flags(environment: str) -> dict:
    """Get feature flags for a given environment (dev/staging/prod)"""
    # Connect to your feature flag service
    return {"new_checkout": True, "dark_mode": False}

@mcp.tool()  
def search_internal_docs(query: str) -> list[str]:
    """Search internal Confluence/Notion docs"""
    # Connect to your docs system
    return [f"Result: {query}"]

if __name__ == "__main__":
    mcp.run()
```

**Register in MCP config:**

```json
{
  "servers": {
    "my-dev-tools": {
      "command": "python",
      "args": ["my_tools_server.py"]
    }
  }
}
```

**Good candidates for custom MCP servers:**

- Internal API or database query tools
- Feature flag or config management
- Internal documentation search
- CI/CD status and deployment tools
- Ticket/issue system integration (Jira, Linear, etc.)

## Troubleshooting

- **Server not starting?** Check that the command is installed and in your PATH
- **Auth errors?** Verify environment variables are set correctly
- **Slow responses?** The MCP server may be doing heavy work — check its logs
- **Tools not appearing?** Check `copilot mcp list`, then inspect the specific server with `copilot mcp get <name>`
