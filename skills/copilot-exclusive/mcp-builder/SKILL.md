---
name: mcp-builder
description: Use when you need to build a new MCP server — plan the tool surface, implement the server, register it in Copilot CLI, inspect the config, and test the tools end to end.
metadata:
  category: copilot-exclusive
  agent_type: general-purpose
  copilot_feature: "copilot mcp commands, workspace .mcp.json, plugin MCP servers"
  origin: ported and adapted from anthropics/skills mcp-builder
---

# MCP Builder

`mcp-ecosystem` helps you install and configure existing servers. This skill is for when
you need to **build a new MCP server** for your own domain, APIs, or internal tools.
Copilot CLI makes that loop faster with native MCP management commands and workspace/user config
surfaces.

## Why This is Copilot-Exclusive

Copilot CLI has a practical MCP authoring loop built around:

- `copilot mcp add` — quick user-level server registration
- `copilot mcp list` / `copilot mcp get` — inspect what Copilot will load
- shared config paths such as workspace `.mcp.json`

That shortens the edit → inspect → load → test cycle while you build a server.

## When to Use

- You need tools for an internal API, database, or service Copilot cannot reach natively
- Existing MCP servers do not match the workflow you need
- You want a shared MCP server for a team or repository
- You need domain-specific tools with tighter validation than generic servers provide

## When NOT to Use

| Instead of mcp-builder | Use |
|------------------------|-----|
| Installing an existing MCP server | `mcp-ecosystem` |
| Using only built-in GitHub tools | built-in GitHub MCP |
| Writing a one-off local script for yourself | a normal script or CLI tool |

## Prerequisites

- Clear target users and workflows for the server
- Access to the service or API the server will wrap
- A chosen implementation stack such as TypeScript or Python
- A place to store the MCP config (workspace `.mcp.json` or user-level config)

## Workflow

### 1. Plan the tool surface

Decide whether the server should expose:

- low-level API coverage
- workflow-oriented tools
- or a mix of both

Use stable, action-oriented tool names such as:

- `db_query`
- `payments_get_invoice`
- `feature_flags_list`

### 2. Model the inputs and outputs

Every tool should define:

- explicit parameter names
- descriptions with constraints
- predictable output shape
- actionable error messages

For read-only tools, mark the intent clearly in the tool design.

### 3. Implement the server

TypeScript example:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "my-service" });

server.tool(
  "my_service_lookup",
  { id: z.string().describe("Service object ID") },
  async ({ id }) => {
    const result = await lookup(id);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);
```

### 4. Register the server in MCP config

```json
// .mcp.json
{
  "servers": {
    "my-service": {
      "command": "node",
      "args": ["./tools/mcp-server.js"]
    }
  }
}
```

### 5. Centralize transport concerns

If your server talks to remote HTTP or SSE backends, keep request-scoped concerns in one
place instead of rebuilding them inside every tool:

- auth header injection
- OAuth token refresh
- trace or correlation IDs
- tenant or user context propagation

Whether your stack calls these **interceptors**, **middleware**, or **request wrappers**,
the rule is the same: tool handlers should focus on business logic, while transport policy
stays in a reusable layer.

### 6. Inspect, load, and test

Use Copilot CLI's built-in management flow:

```text
1. Register or edit the server config
2. Inspect it with `copilot mcp list` and `copilot mcp get <name>`
3. Start or refresh a Copilot session so the server is loaded
4. Call the new tool with a real test input
```

### 7. Add lightweight evaluations

Before sharing the server, prepare realistic prompts that prove:

- the tool is discoverable
- the parameters are understandable
- the output is useful to an LLM-driven workflow

## Quality Checklist

- [ ] Tool names are stable and action-oriented
- [ ] All parameters have descriptions
- [ ] Output shape is predictable
- [ ] Errors tell the caller what to fix next
- [ ] Auth, header, or request-context propagation is centralized instead of duplicated per tool
- [ ] The config is visible in `copilot mcp list`
- [ ] At least one end-to-end tool invocation succeeds after the server is loaded

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll just expose every endpoint" | Too many low-value tools make the server harder to use well. |
| "The schema is obvious" | LLMs rely on explicit parameter descriptions and output shape. |
| "I can skip inspection and test it live" | Bad config slows iteration and creates avoidable confusion. |
| "A generic wrapper is enough" | Workflow-specific tools often serve agents better than raw API mirrors. |
| "I'll copy the auth headers in each tool" | Request policy belongs in one interceptor or middleware layer so it stays correct everywhere. |

## Red Flags

- Tool names describe implementation details instead of user tasks
- Inputs are under-specified or ambiguous
- The server requires hidden setup not captured in config or docs
- Every tool reconstructs auth or trace headers manually
- You have not tested the tool from Copilot after loading the server

## Verification

- [ ] The server solves a concrete workflow gap that built-in tools do not cover
- [ ] MCP config is visible in `copilot mcp list`
- [ ] `copilot mcp get <name>` shows the expected command, env, or URL
- [ ] At least one real prompt can discover and use the tool correctly

## Tips

- Start with 2-5 high-value tools, not exhaustive API coverage
- Prefer project-level `.mcp.json` when a team should share the server
- Pair this with `source-driven-development` when wrapping a third-party SDK or API

## See Also

- [`mcp-ecosystem`](../mcp-ecosystem/SKILL.md) — install and manage existing MCP servers
- [`source-driven-development`](../../development/source-driven-development/SKILL.md) — verify SDK usage against official docs
- [`skill-creator`](../../development/skill-creator/SKILL.md) — create supporting skills for your MCP workflow
