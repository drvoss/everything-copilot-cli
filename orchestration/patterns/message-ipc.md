# Pattern 3: Message-Based IPC

> **Complexity: Medium** | **Setup: hcom or similar** | **Best for: Real-time multi-agent collaboration**

The Message IPC pattern uses inter-process communication to let multiple AI agents running in separate terminals collaborate in real-time. Agents subscribe to events, publish results, and coordinate without tight coupling.

## How It Works

```text
Terminal 1              Terminal 2              Terminal 3
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Copilot CLI  │       │  Claude Code  │       │  Codex CLI   │
│  (coordinator)│       │  (reviewer)   │       │  (generator)  │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       ▼                      ▼                      ▼
  ┌─────────────────────────────────────────────────────────┐
  │                    Message Bus (hcom)                     │
  │  Channels: #tasks  #reviews  #results  #coordination     │
  └─────────────────────────────────────────────────────────┘
```

Each AI agent runs independently but communicates through a shared message bus. The coordinator (Copilot CLI) dispatches tasks and aggregates results.

## Setting Up hcom

[hcom](https://github.com/rinkaaan/hcom) provides lightweight inter-agent communication.

### Installation

```bash
# Install hcom globally
npm install -g hcom

# Or use npx
npx hcom --help
```

### Start the Message Hub

```powershell
# Terminal 0: Start the hcom message hub
hcom serve --port 4200

# Output:
# hcom hub listening on ws://localhost:4200
# Channels: #default
```

## Multi-Terminal Setup

### Terminal 1: Copilot CLI (Coordinator)

```powershell
# Subscribe to result channels
hcom subscribe --channel results --channel reviews

# Publish a task
hcom publish --channel tasks --message '{
  "id": "task-001",
  "type": "implement",
  "description": "Create a JWT authentication middleware",
  "assignee": "codex",
  "priority": "high",
  "context": {
    "language": "typescript",
    "framework": "express",
    "files": ["src/middleware/"]
  }
}'
```

### Terminal 2: Codex CLI (Generator)

```powershell
# Subscribe to task channel, filter for codex assignments
hcom subscribe --channel tasks --filter '.assignee == "codex"'

# When a task arrives, Codex processes it and publishes results
hcom publish --channel results --message '{
  "taskId": "task-001",
  "agent": "codex",
  "status": "completed",
  "output": {
    "files_created": ["src/middleware/auth.ts"],
    "summary": "Created JWT auth middleware with token validation and refresh"
  }
}'
```

### Terminal 3: Claude Code (Reviewer)

```powershell
# Subscribe to results, auto-review completed implementations
hcom subscribe --channel results --filter '.status == "completed"'

# Claude reviews and publishes feedback
hcom publish --channel reviews --message '{
  "taskId": "task-001",
  "agent": "claude",
  "reviewType": "security",
  "findings": [
    {"severity": "medium", "issue": "Token expiry not checked on refresh"},
    {"severity": "low", "issue": "Consider adding rate limiting to auth endpoint"}
  ],
  "approved": false,
  "recommendation": "Fix token expiry check before merging"
}'
```

## Example Message Flows

### Flow 1: Implement → Review → Fix

```text
Time  Channel    From      Message
─────────────────────────────────────────────────────────
t0    #tasks     copilot   {type: "implement", task: "auth middleware"}
t1    #results   codex     {status: "completed", files: ["auth.ts"]}
t2    #reviews   claude    {approved: false, issues: ["token expiry"]}
t3    #tasks     copilot   {type: "fix", task: "fix token expiry", ref: "task-001"}
t4    #results   codex     {status: "completed", files: ["auth.ts"]}
t5    #reviews   claude    {approved: true, note: "LGTM"}
t6    #results   copilot   {status: "merged", pr: "#42"}
```

### Flow 2: Parallel Analysis

```text
Time  Channel        From      Message
─────────────────────────────────────────────────────────
t0    #tasks         copilot   {type: "analyze", files: ["src/"]}
t1    #security      claude    {scanning: true}
t2    #performance   agy       {scanning: true}
t3    #security      claude    {findings: [...]}
t4    #performance   agy       {findings: [...]}
t5    #coordination  copilot   {aggregated: true, report: "..."}
```

## Automation Script

Automate the coordination loop with a script:

```python
#!/usr/bin/env python3
"""Multi-agent coordinator using hcom message bus."""
import json
import subprocess
import asyncio
import websockets

HCOM_URL = "ws://localhost:4200"


async def coordinator():
    async with websockets.connect(HCOM_URL) as ws:
        # Subscribe to results and reviews
        await ws.send(json.dumps({
            "action": "subscribe",
            "channels": ["results", "reviews"]
        }))

        # Dispatch initial task
        await ws.send(json.dumps({
            "action": "publish",
            "channel": "tasks",
            "message": {
                "id": "task-001",
                "type": "implement",
                "description": "Create user registration API endpoint",
                "assignee": "codex"
            }
        }))

        # Event loop: react to agent messages
        async for raw in ws:
            msg = json.loads(raw)
            channel = msg.get("channel")
            data = msg.get("message", {})

            if channel == "results" and data.get("status") == "completed":
                # Auto-dispatch review to Claude
                await ws.send(json.dumps({
                    "action": "publish",
                    "channel": "tasks",
                    "message": {
                        "id": f"{data['taskId']}-review",
                        "type": "review",
                        "files": data.get("output", {}).get("files_created", []),
                        "assignee": "claude"
                    }
                }))

            elif channel == "reviews" and data.get("approved"):
                # All clear — Copilot creates PR
                print(f"✅ Task {data['taskId']} approved. Creating PR...")
                subprocess.run([
                    "gh", "pr", "create",
                    "--title", f"feat: {data['taskId']}",
                    "--body", f"Implemented by Codex, reviewed by Claude.\n\n{json.dumps(data, indent=2)}"
                ])

            elif channel == "reviews" and not data.get("approved"):
                # Review failed — dispatch fix
                print(f"❌ Task {data['taskId']} needs fixes")
                await ws.send(json.dumps({
                    "action": "publish",
                    "channel": "tasks",
                    "message": {
                        "id": f"{data['taskId']}-fix",
                        "type": "fix",
                        "issues": data.get("findings", []),
                        "assignee": "codex"
                    }
                }))


if __name__ == "__main__":
    asyncio.run(coordinator())
```

## Event Types

Define a standard event schema for inter-agent communication:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Unique message ID" },
    "taskId": { "type": "string", "description": "Related task ID" },
    "agent": { "type": "string", "enum": ["copilot", "claude", "codex", "agy"] },
    "type": { "type": "string", "enum": ["implement", "review", "fix", "analyze", "report"] },
    "status": { "type": "string", "enum": ["pending", "in_progress", "completed", "failed"] },
    "timestamp": { "type": "string", "format": "date-time" },
    "payload": { "type": "object" }
  },
  "required": ["id", "agent", "type"]
}
```

## Pros and Cons

| Pros | Cons |
|------|------|
| ✅ Real-time collaboration | ❌ Requires hcom or similar tool |
| ✅ Agents work independently | ❌ More complex than shell invocation |
| ✅ Event-driven architecture | ❌ Message schema needs agreement |
| ✅ Natural parallelism | ❌ Debugging distributed messages is harder |
| ✅ Loose coupling between agents | ❌ Network overhead (WebSocket) |
| ✅ Scalable to many agents | ❌ Need to handle message ordering |

## When to Use

- **Multi-developer teams** — different team members run different AI agents
- **Long-running workflows** — agents work asynchronously on large tasks
- **Real-time coordination** — agents need to react to each other's output
- **Complex projects** — multiple aspects need simultaneous AI attention

## Alternative IPC Mechanisms

If hcom isn't available, these alternatives work:

| Mechanism | Setup | Latency | Notes |
|-----------|-------|---------|-------|
| hcom | `npm i -g hcom` | Low | Purpose-built for agents |
| Redis Pub/Sub | Redis server | Low | Industrial strength |
| Named Pipes | OS-native | Very low | No network needed |
| File Watching | `chokidar` | Medium | Simplest fallback |
| SQLite WAL | None | Medium | Shared database approach |

## See Also

- [Pattern 1: Shell Invocation](shell-invocation.md) — Simpler alternative
- [Pattern 5: Agent Council](agent-council.md) — More sophisticated coordination
- [Parallel Agents](../skills/parallel-agents.md) — Running agents simultaneously
- [hcom](https://github.com/rinkaaan/hcom) — Inter-agent communication protocol
