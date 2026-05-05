---
name: the-shortform-guide
description: Essential Copilot CLI concepts condensed into a single reference
category: guide
---

# The Shortform Guide

> Everything you need to know about GitHub Copilot CLI, condensed. Read this once, reference it forever.

---

## Agent Modes

Three modes control how Copilot CLI behaves. Switch with **Shift+Tab**.

| Mode | Autonomy | Best For |
|---|---|---|
| **Interactive** | Low — asks before each action | Exploring code, learning a codebase, sensitive changes |
| **Plan** | Medium — plans first, then executes after approval | Multi-file refactors, feature development, architecture changes |
| **Autopilot** | High — acts autonomously | Trusted tasks, bulk operations, well-defined work |

**When to use which:**

- Start in **Interactive** when you're unsure what the right approach is
- Use **Plan** for anything touching more than 3 files
- Use **Autopilot** for tasks you'd trust a senior developer to do unsupervised

---

## Agent Types

Copilot CLI can spawn specialized sub-agents via the `task` tool:

### explore

- **Model**: Claude Haiku (fast, cheap)
- **Tools**: grep, glob, view, bash/powershell
- **Use for**: Finding files, searching code, answering codebase questions
- **Safe to parallelize**: ✅ Yes — launch multiple explore agents simultaneously

```text
# Internally, Copilot uses explore agents like this:
task(agent_type="explore", prompt="Find all API endpoints in src/")
```

### task

- **Model**: Claude Haiku
- **Tools**: All CLI tools
- **Use for**: Running builds, tests, linting, dependency installs
- **Returns**: Brief summary on success, full output on failure

### general-purpose

- **Model**: Claude Sonnet (full reasoning)
- **Tools**: All CLI tools
- **Use for**: Complex multi-step work — refactoring, feature implementation
- **Runs in**: Separate context window to keep main conversation clean

### code-review

- **Model**: Claude Sonnet
- **Tools**: All CLI tools (read-only behavior)
- **Use for**: Reviewing staged/unstaged changes, branch diffs
- **Signal**: Extremely high — only surfaces bugs, security issues, logic errors

---

## Skills & Commands

Skills are reusable workflows defined in markdown with YAML front matter.

### Skill Structure

```yaml
---
name: my-skill
description: What this skill does
category: development
agent_type: general-purpose
---

# My Skill

## When to Use
- Trigger condition 1
- Trigger condition 2

## Workflow
1. Step one...
2. Step two...

## Examples
...
```

### Built-in Skill Categories

| Category | Skills | Path |
|---|---|---|
| Development | TDD workflow, code review, refactoring, build fixes | `skills/development/` |
| Security | Security scan, secret detection, input validation | `skills/security/` |
| Documentation | Doc updates, API documentation | `skills/documentation/` |
| Testing | Test coverage, E2E testing | `skills/testing/` |
| Copilot-Exclusive | Fleet parallel, session management, PR workflow | `skills/copilot-exclusive/` |

### Essential Slash Commands

```text
/model [name]       # Switch AI model (20+ available)
/skills             # List available skills
/add-dir <path>     # Add directory to context
/clear              # Clear conversation history
/compact            # Compress context to save tokens
/login              # Authenticate with GitHub
/diff               # Review current changes
/review             # Run PR code review
/init               # Initialize Copilot setup for this project
/plugin install     # Install a community plugin
/chronicle          # Standup reports & session history (experimental)
/help               # Show all commands
```

---

## Rules

Rules define coding standards that Copilot follows automatically.

### Rule Types

| Type | Path | Scope |
|---|---|---|
| Common rules | `rules/common/` | Apply to all code (git workflow, error handling, security) |
| Language rules | `rules/languages/` | Language-specific (TypeScript, Python, Java, Go, C#) |
| Project rules | `.github/copilot-instructions.md` | Your project's specific conventions |

### How Rules Load

1. Copilot reads `.github/copilot-instructions.md` from your project root
2. Repository rules from `rules/` are available as context
3. Rules are applied automatically — no manual activation needed

---

## MCP Ecosystem

The Model Context Protocol (MCP) extends Copilot CLI with external tools.

### Built-in: GitHub MCP Server

Copilot CLI ships with the GitHub MCP server, providing:

- Issue and PR management
- Repository search and file access
- GitHub Actions workflow inspection
- Code search across all GitHub repositories

### Adding Custom MCP Servers

Create `.vscode/mcp.json` or `~/.copilot/mcp-config.json`:

```json
{
  "servers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"],
      "env": {
        "API_KEY": "${env:API_KEY}"
      }
    }
  }
}
```

See [MCP Configs](../mcp-configs/) for pre-built configurations.

---

## Session Management

### SQL Database

Every session includes a SQLite database for structured data:

```sql
-- Built-in tables
SELECT * FROM todos WHERE status = 'pending';

-- Create custom tables for any purpose
CREATE TABLE test_results (id TEXT, passed BOOLEAN, duration_ms INTEGER);
```

### Session Resume

Sessions persist across restarts. Your conversation history, SQL data, and context carry over.

### /chronicle — Standup Reports & History _(Experimental)_

Automatically summarizes your work from the session database.
Requires `/experimental on` to activate:

```text
/experimental on         # Enable experimental features
/chronicle standup       # What did I work on today?
/chronicle tips          # Tips based on session patterns
```

### Cross-Session Memory

The `session_store` database provides read-only access to history from previous sessions.

---

## Multi-Model Strategy

20+ models available across OpenAI, Anthropic, Google, and xAI. Choose based on your task:

| Task | Recommended Model | Why |
|---|---|---|
| Quick questions | `gpt-5-mini` or `gpt-4.1` | Fast, cheap |
| Code generation | `gpt-5.1-codex` | Optimized for code |
| Balanced work | `claude-sonnet-4.6` | Good reasoning + speed |
| Deep analysis | `claude-opus-4.6` | Best reasoning |
| Bulk operations | `claude-haiku-4.5` | Cheapest per token |
| Complex architecture | `claude-opus-4.6` | Premium reasoning |
| Multimodal / images | `gemini-3.1-pro-preview` | Best visual understanding |

Switch models mid-session:

```text
/model gpt-5-mini          # Switch to fast model for simple tasks
/model claude-opus-4.6   # Switch to deep model for architecture decisions
```

---

## IDE Integration

Copilot CLI works alongside VS Code with Copilot Chat:

| Workflow | Where |
|---|---|
| Quick edits, inline suggestions | VS Code Copilot |
| Multi-file refactors, complex tasks | Copilot CLI |
| PR reviews, GitHub operations | Copilot CLI |
| Debugging with breakpoints | VS Code |
| Build/test automation | Copilot CLI |

**Switch between them freely** — both read the same `.github/copilot-instructions.md` and project context.

---

## Fleet & Background Agents

### Fleet Mode (autopilot_fleet)

Launches multiple agents in parallel for highly parallelizable work:

```text
# Copilot works best with fleet mode on mostly independent tasks:
> Update all 12 API endpoint tests to use the new auth middleware
# Fleet parallelizes safe subtasks and may serialize follow-up dependencies
```

### Background Agents (Background Delegation)

Delegate tasks to a cloud Copilot coding agent with `&` — terminal is immediately free.
The agent works on GitHub and returns the result there as a branch diff or PR:

```text
# Delegate to cloud agent
& "Add comprehensive error handling to all API endpoints"
# → Agent leaves the result on GitHub for review

# /resume brings a cloud session into your local CLI (not for polling results)
/resume abc123
```

---

## Orchestration

Copilot CLI can orchestrate other AI tools (Claude Code, Codex CLI, Gemini CLI) for multi-AI workflows.

### Five Patterns

| Pattern | Complexity | Use Case |
|---|---|---|
| [Shell Invocation](../orchestration/patterns/shell-invocation.md) | Low | Quick delegation to other tools |
| [MCP Bridge](../orchestration/patterns/mcp-bridge.md) | Medium | Structured tool communication |
| [Message IPC](../orchestration/patterns/message-ipc.md) | Medium | Real-time inter-process coordination |
| [Pipeline](../orchestration/patterns/pipeline.md) | High | Sequential multi-stage workflows |
| [Agent Council](../orchestration/patterns/agent-council.md) | High | Multi-agent consensus and debate |

See [The Orchestration Guide](the-orchestration-guide.md) for detailed workflows.

---

## Top 10 Productivity Tips

1. **Start specific** — "Add rate limiting to the /api/users endpoint" beats "improve the API"
2. **Use Plan mode for big tasks** — Shift+Tab gives you a reviewable plan before execution
3. **Parallelize with Fleet** — Independent tasks across files run simultaneously
4. **Switch models mid-task** — Use fast models for exploration, powerful models for decisions
5. **Add project instructions** — `.github/copilot-instructions.md` makes every response better
6. **Use the SQL database** — Track progress on batch operations with built-in SQLite
7. **Explore before changing** — Use explore agents to understand code before modifying it
8. **Chain commands** — `npm run build && npm run test` in one call saves round-trips
9. **Leverage GitHub MCP** — Search issues, review PRs, check Actions directly from CLI
10. **Read the agents** — Browse [agents/](../agents/) to understand specialized roles available

---

> ★ **Remember**: Copilot CLI is most powerful when you treat it as a senior developer on your team — give it context, review its plans, and trust it with well-scoped tasks.
