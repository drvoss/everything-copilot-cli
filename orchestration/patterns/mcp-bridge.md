# Pattern 2: MCP Bridge

> **Complexity: Medium** | **Setup: MCP server config** | **Best for: Type-safe integration, production workflows**

The MCP (Model Context Protocol) Bridge pattern wraps other AI CLIs as MCP tool servers, letting Copilot CLI invoke them through a clean, type-safe interface. This is the **recommended pattern** for teams adopting multi-AI orchestration.

## How It Works

```text
┌──────────────┐    MCP Protocol     ┌──────────────┐    shell exec    ┌──────────────┐
│  Copilot CLI  │ ◄════════════════► │  MCP Bridge   │ ──────────────► │  Codex CLI   │
│  (MCP client) │   JSON-RPC/stdio  │  Server       │ ◄────────────── │  (AI worker)  │
└──────────────┘                     └──────────────┘   stdout/stderr  └──────────────┘
```

Instead of raw shell commands, Copilot CLI calls typed MCP tools like:

- `codex_generate(prompt, language, outputFormat)`
- `claude_review(filePath, reviewType)`
- `gemini_analyze(imagePath, question)`

## Why MCP Bridge?

| Feature | Shell Invocation | MCP Bridge |
|---------|:----------------:|:----------:|
| Type safety | ❌ | ✅ |
| Error handling | Manual | Built-in |
| Tool discovery | None | Auto |
| Parameter validation | None | Schema-based |
| Persistent connection | ❌ | ✅ |
| Composability | Low | High |

## Sample MCP Bridge Server (Python)

This server wraps Codex CLI as an MCP tool server:

```python
#!/usr/bin/env python3
"""MCP Bridge Server for Codex CLI.

Exposes Codex CLI capabilities as typed MCP tools that any
MCP client (including Copilot CLI) can invoke.
"""
import asyncio
import json
import subprocess
import sys
from typing import Any

# Using the official MCP SDK
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

server = Server("codex-bridge")


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="codex_generate",
            description="Generate code using Codex CLI (GPT-5). Best for fast "
                        "code generation, boilerplate, and multi-file implementation.",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "What code to generate"
                    },
                    "language": {
                        "type": "string",
                        "description": "Target programming language",
                        "default": "typescript"
                    },
                    "approval_mode": {
                        "type": "string",
                        "enum": ["suggest", "auto-edit", "full-auto"],
                        "default": "suggest",
                        "description": "How much autonomy Codex has"
                    }
                },
                "required": ["prompt"]
            }
        ),
        Tool(
            name="codex_edit",
            description="Edit existing files using Codex CLI. Provide the file "
                        "path and desired changes.",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to the file to edit"
                    },
                    "instruction": {
                        "type": "string",
                        "description": "What changes to make"
                    }
                },
                "required": ["file_path", "instruction"]
            }
        ),
        Tool(
            name="codex_explain",
            description="Explain code using Codex CLI. Provides detailed "
                        "explanations of code logic and architecture.",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to the file to explain"
                    },
                    "focus": {
                        "type": "string",
                        "description": "What aspect to focus on (e.g., 'error handling', 'performance')",
                        "default": "general"
                    }
                },
                "required": ["file_path"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    if name == "codex_generate":
        return await _run_codex_generate(arguments)
    elif name == "codex_edit":
        return await _run_codex_edit(arguments)
    elif name == "codex_explain":
        return await _run_codex_explain(arguments)
    else:
        raise ValueError(f"Unknown tool: {name}")


async def _run_codex_generate(args: dict) -> list[TextContent]:
    prompt = args["prompt"]
    language = args.get("language", "typescript")
    mode = args.get("approval_mode", "suggest")

    full_prompt = f"Generate {language} code: {prompt}. Output only the code."

    result = await _exec_codex(full_prompt, mode)
    return [TextContent(type="text", text=result)]


async def _run_codex_edit(args: dict) -> list[TextContent]:
    file_path = args["file_path"]
    instruction = args["instruction"]

    prompt = f"Edit the file {file_path}: {instruction}"

    result = await _exec_codex(prompt, "auto-edit")
    return [TextContent(type="text", text=result)]


async def _run_codex_explain(args: dict) -> list[TextContent]:
    file_path = args["file_path"]
    focus = args.get("focus", "general")

    prompt = f"Explain the code in {file_path}. Focus on: {focus}"

    result = await _exec_codex(prompt, "suggest")
    return [TextContent(type="text", text=result)]


async def _exec_codex(prompt: str, approval_mode: str) -> str:
    """Execute Codex CLI and capture output."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "codex", "--quiet", "--approval-mode", approval_mode, prompt,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), timeout=120
        )

        if proc.returncode != 0:
            return f"Error (exit {proc.returncode}): {stderr.decode()}"

        return stdout.decode()

    except asyncio.TimeoutError:
        proc.kill()
        return "Error: Codex CLI timed out after 120 seconds"
    except FileNotFoundError:
        return "Error: Codex CLI not found. Install with: npm i -g @openai/codex"


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
```

## Registration

### In `~/.copilot/mcp-config.json` (User-level)

```json
{
  "servers": {
    "codex-bridge": {
      "command": "python",
      "args": ["orchestration/scripts/codex-bridge.py"],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
      }
    },
    "claude-bridge": {
      "command": "npx",
      "args": ["@anthropic-ai/claude-code", "--mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### In `.mcp.json` (Project-level)

```json
{
  "servers": {
    "codex-bridge": {
      "command": "python",
      "args": ["orchestration/scripts/codex-bridge.py"]
    }
  }
}
```

## Claude Code as MCP Server

Claude Code has **native MCP server support**, making it the easiest to bridge:

```json
{
  "servers": {
    "claude-code": {
      "command": "npx",
      "args": ["@anthropic-ai/claude-code", "--mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

This exposes Claude Code's tools directly to Copilot CLI — no bridge code needed.

## Using the Bridge from Copilot CLI

Once configured, Copilot CLI discovers the tools automatically:

```text
You: "Use Codex to generate a rate limiter middleware"

Copilot CLI internally calls:
→ codex_generate(
    prompt: "Create Express middleware for rate limiting with sliding window",
    language: "typescript",
    approval_mode: "suggest"
  )

Returns typed result with the generated code.
```

## Reference Projects

| Project | Description |
|---------|-------------|
| [mcp-oauth-bridge](https://github.com/pab1it0/mcp-oauth-bridge) | OAuth-based MCP bridging between providers |
| [codex-persistent-remote-mcp](https://github.com/nicobailon/codex-persistent-remote-mcp) | Persistent Codex connections over MCP |

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Type-safe tool invocation | ❌ Requires MCP server setup |
| ✅ Auto-discovery of available tools | ❌ Need to maintain bridge code |
| ✅ Built-in error handling | ❌ Additional process overhead |
| ✅ Parameter validation via JSON Schema | ❌ Python/Node.js dependency for bridges |
| ✅ Works with Copilot CLI's native MCP | ❌ API key management needed |
| ✅ Persistent connections (no cold starts) | |

## When to Use

- **Team workflows** — standardize how AI tools are invoked across the team
- **Production pipelines** — need reliability and type safety
- **Complex orchestration** — multiple AI tools with structured data flow
- **Repeatable patterns** — same delegation pattern used frequently

## See Also

- [Shell Invocation](shell-invocation.md) — Simpler alternative (Pattern 1)
- [Configs: Codex MCP Bridge](../configs/codex-mcp-bridge.json) — Ready-to-use config
- [Configs: Claude MCP Bridge](../configs/claude-mcp-bridge.json) — Ready-to-use config
