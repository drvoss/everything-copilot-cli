# The Longform Guide to GitHub Copilot CLI

> A deep-dive reference for power users who want to extract maximum value from Copilot CLI.
> This guide covers context management, token optimization, agent orchestration, IDE integration,
> custom skills, MCP configuration, and performance patterns.

---

## Table of Contents

1. [Context Management](#context-management)
2. [Token Optimization](#token-optimization)
3. [Memory & Persistence](#memory--persistence)
4. [Verification Patterns](#verification-patterns)
5. [Parallelization](#parallelization)
6. [Advanced Agent Patterns](#advanced-agent-patterns)
7. [IDE Integration Deep-Dive](#ide-integration-deep-dive)
8. [Custom Skills Creation](#custom-skills-creation)
9. [MCP Deep-Dive](#mcp-deep-dive)
10. [Multi-AI Orchestration Advanced](#multi-ai-orchestration-advanced)
11. [Performance Tips](#performance-tips)
12. [Troubleshooting](#troubleshooting)

---

## Context Management

Copilot CLI operates within a **context window** — the total amount of text (instructions,
code, conversation history, tool output) the model can see at once. Managing this window
effectively is the single biggest lever for quality output.

### How the Context Window Works

```text
┌─────────────────────────────────────────────────┐
│                 Context Window                  │
├─────────────────────────────────────────────────┤
│  System prompt + instructions        ~5-10%     │
│  Session history (compacted)         ~20-30%    │
│  Active files / tool output          ~30-40%    │
│  Agent reasoning + response          ~20-30%    │
│  Buffer (safety margin)              ~10%       │
└─────────────────────────────────────────────────┘
```

### When to Use `/clear`

Use `/clear` to reset the conversation context when:

- **Context is polluted**: Too many irrelevant file reads, failed experiments, or
  off-topic discussions have filled the window
- **Switching tasks**: Moving from "fix authentication bug" to "add caching layer" —
  the old context will only confuse the model
- **After large refactors**: Once a big change is committed, the intermediate steps
  are noise — clear and start fresh
- **Performance degrades**: When responses become slow, repetitive, or lose coherence,
  the context is likely saturated

**Don't** clear when you're mid-task and the model has built up useful understanding
of your codebase. Instead, let session compaction handle it.

### Session Compaction

When conversation history grows too long, Copilot CLI automatically **compacts** older
turns into a summary. This preserves key decisions and context while freeing space for
new work. You can observe compaction in `events.jsonl`.

**Tips for working with compaction:**

- State critical requirements early — compacted summaries preserve early context better
- Use the SQL database for data you need to persist exactly (compaction may lose details)
- If the model "forgets" something, re-state it rather than scrolling back

### Staying Within Limits

1. **Be specific in prompts** — "Fix the auth bug in src/auth/login.ts" loads one file,
   while "Fix auth bugs" may trigger a codebase-wide search
2. **Use explore agents** for investigation — they run in separate context windows,
   keeping your main context clean
3. **Batch questions** — ask the explore agent 5 questions at once, not 5 separate calls
4. **Suppress verbose output** — use `--quiet`, `| head -20`, `| Select-Object -First 10`
5. **Chain commands** — `npm run build && npm test` produces one output block, not two turns

---

## Token Optimization

### Model Selection Matrix

Copilot CLI offers 20+ models spanning three tiers. Choose based on task complexity and cost:

| Tier | Models | Best For | Cost |
|------|--------|----------|------|
| **Premium** | `claude-opus-4.6`, `claude-opus-4.6-fast`, `claude-opus-4.5` | Architecture decisions, complex refactors, subtle bugs | High |
| **Standard** | `claude-sonnet-4.6`, `claude-sonnet-4.5`, `claude-sonnet-4`, `gpt-5.4`, `gpt-5.3-codex`, `gpt-5.2-codex`, `gpt-5.2`, `gpt-5.1-codex-max`, `gpt-5.1-codex`, `gpt-5.1`, `gemini-3-pro-preview`, `gemini-3.1-pro-preview`, `grok-code-fast-1` | General development, code review, multi-file changes | Medium |
| **Fast/Cheap** | `gpt-5.4-mini`, `gpt-5.1-codex-mini`, `gpt-5-mini`, `gpt-4.1`, `claude-haiku-4.5`, `gemini-3-flash` | Exploration, simple edits, boilerplate, formatting | Low |

### Agent Type Costs

Each agent type has a different cost profile based on its default model and capabilities:

| Agent Type | Default Model | Context Cost | Best For |
|------------|--------------|--------------|----------|
| `explore` | Haiku (cheap) | Separate window | Code search, file discovery, Q&A |
| `task` | Haiku (cheap) | Separate window | Builds, tests, installs — success/fail only |
| `general-purpose` | Sonnet (standard) | Separate window | Complex multi-step implementation |
| `code-review` | Sonnet (standard) | Separate window | Change analysis, bug detection |

**Cost optimization strategy:**

```text
Exploration (cheap)  →  Planning (standard)  →  Implementation (standard)  →  Review (standard)
    explore agent          main context            general-purpose             code-review
    claude-haiku           default model           claude-sonnet               claude-sonnet
```

### Batch Operations to Reduce Turns

Every conversational turn has overhead (system prompt, history, tool negotiation). Reduce
turns by batching:

```text
❌ Slow: 5 separate explore calls, one question each (5 turns × overhead)
✅ Fast: 1 explore call with 5 questions batched (1 turn × overhead)

❌ Slow: Read file → Edit file → Read another → Edit another (4 turns)
✅ Fast: Read both files in parallel → Edit both files in parallel (2 turns)
```

---

## Memory & Persistence

### Session SQL Database

Every Copilot CLI session includes a SQLite database with pre-built tables. This is your
primary tool for structured state that must survive context compaction.

**Pre-built tables:**

```sql
-- Track work items
SELECT * FROM todos WHERE status = 'pending';

-- Track dependencies between tasks
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM todo_deps td
    JOIN todos dep ON td.depends_on = dep.id
    WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

**Custom tables for any workflow:**

```sql
-- TDD test case tracking
CREATE TABLE test_cases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT,
    status TEXT DEFAULT 'not_written'  -- not_written → written → passing → refactored
);

-- Batch processing tracker
CREATE TABLE files_to_process (
    path TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending',  -- pending → in_progress → done → error
    error_message TEXT
);

-- Key-value session state
CREATE TABLE session_state (key TEXT PRIMARY KEY, value TEXT);
INSERT OR REPLACE INTO session_state (key, value) VALUES ('current_phase', 'testing');
```

### Events and Session History

Session history is stored in `events.jsonl` — a line-delimited JSON log of all
interactions. This enables:

- **Session resume**: Pick up where you left off after closing the terminal
- **Audit trail**: Review what changes were made and why
- **Debugging**: Trace what the model saw when it made a particular decision

### Cross-Session Memory

The `session_store` database provides read-only access to historical session data:

```sql
-- Search across previous sessions (FTS5 full-text search)
SELECT * FROM session_store.sessions WHERE content MATCH 'authentication refactor';
```

Cross-session memory is experimental but enables knowledge persistence — patterns learned
in one session can inform future sessions.

### Session Artifacts

Files created during a session are stored in the session's `files/` directory. Use these
for artifacts that need to persist beyond the conversation:

- Generated reports or analysis documents
- Exported data or intermediate results
- Plan files (`plan.md`) for structured planning

See [Cross-Session Memory skill](../skills/copilot-exclusive/cross-session-memory/SKILL.md)
for detailed patterns.

---

## Verification Patterns

### Test-First Development

The strongest verification pattern is writing tests before implementation:

```text
1. Write failing test     →  Confirms you understand the requirement
2. Run test (RED)         →  Confirms the test actually tests something
3. Write implementation   →  Focused on making the test pass
4. Run test (GREEN)       →  Confirms the implementation works
5. Refactor              →  Clean up with confidence
6. Run test (GREEN)       →  Confirms refactoring didn't break anything
```

Use the [TDD Guide agent](../agents/tdd-guide.md) and track test cases in SQL:

```sql
INSERT INTO test_cases (id, name, status) VALUES
    ('auth-login', 'should authenticate valid credentials', 'not_written'),
    ('auth-invalid', 'should reject invalid password', 'not_written'),
    ('auth-expired', 'should handle expired tokens', 'not_written');
```

### Build Verification

Always verify changes compile before committing:

```powershell
# Chain build + test for atomic verification
npm run build && npm test

# Or for compiled languages
dotnet build --no-restore && dotnet test --no-build
```

Use the `task` agent for builds — it returns brief output on success, full output on
failure, keeping your context clean.

### Lint Checks

Run existing linters, don't add new ones:

```powershell
# Check what lint scripts exist
npm run --list-scripts | Select-String "lint"

# Run them
npm run lint
```

### Review Chains

For critical changes, chain multiple review perspectives:

```text
1. Self-review     →  Re-read your own changes with fresh eyes
2. code-review     →  Automated review for bugs and logic errors
3. security-review →  Check for vulnerabilities (if security-relevant)
4. Build + test    →  Mechanical verification
5. Manual spot-check → Verify key behaviors in the running application
```

See [Code Review skill](../skills/development/code-review/SKILL.md) and
[Agent Review Chain](../orchestration/skills/agent-review-chain.md).

---

## Parallelization

### Fleet Mode Deep-Dive

Fleet mode launches multiple autonomous agents in parallel, each with independent context
windows. This is Copilot CLI's most powerful scaling feature.

**When Fleet beats Sequential:**

| Scenario | Sequential | Fleet | Speedup |
|----------|-----------|-------|---------|
| Update 10 config files | ~20 min | ~5 min | 4x |
| Add tests for 5 modules | ~30 min | ~8 min | 3.5x |
| Review 8 PRs | ~40 min | ~10 min | 4x |
| Fix 6 lint categories | ~15 min | ~5 min | 3x |

**Task decomposition strategy:**

```text
1. Identify independent units of work (no shared state)
2. Write clear, self-contained prompts for each unit
3. Include all necessary context in each prompt (agents are stateless)
4. Launch fleet with decomposed tasks
5. Aggregate results and resolve conflicts
```

**Anti-patterns to avoid:**

- Don't fleet tasks that modify the same files (merge conflicts)
- Don't fleet tasks where order matters (migrations, sequential APIs)
- Don't fleet tasks that need shared state (use SQL + sequential instead)

See [Fleet Parallel skill](../skills/copilot-exclusive/fleet-parallel/SKILL.md).

### Background Agents (Background Delegation)

**Background Delegation** frees your terminal immediately. Prefix any prompt with `&`
to hand off work to a cloud-based Copilot coding agent:

```text
1. Delegate:    & "Migrate all service tests to the new test framework"
2. Terminal is immediately free — continue your main work
3. Agent works on GitHub, opens a draft PR when complete
4. Review results on GitHub via the draft PR
5. Optionally bring the session local:  /resume [SESSION-ID]
```

> **Note:** `/resume` brings a cloud agent session into your local CLI for continued
> conversation. Results from delegation are surfaced via the draft PR on GitHub, not
> by polling with `/resume`.

**Use cases:**

- Large-scale refactors spanning many files
- Full test suite additions or migrations
- Documentation generation
- Dependency audit and upgrade

### Multi-Agent Orchestration

Combine agent types for complex workflows:

```text
┌──────────┐    ┌──────────┐    ┌────────────────┐    ┌─────────────┐
│ explore  │ →  │ planner  │ →  │ general-purpose│ →  │ code-review │
│ (search) │    │ (plan)   │    │ (implement)    │    │ (verify)    │
└──────────┘    └──────────┘    └────────────────┘    └─────────────┘
   Haiku          Default          Sonnet               Sonnet
   Cheap          Medium           Standard             Standard
```

---

## Advanced Agent Patterns

### Composing Agent Types

The most effective workflows compose agents in a pipeline, each handling what it does best:

**Pattern: Explore → Plan → Implement → Review**

```text
Step 1: explore agent (parallel, cheap)
  - "What authentication libraries does this project use?"
  - "Where are the API route definitions?"
  - "What test framework is configured?"

Step 2: Plan (main context)
  - Synthesize explore results into a plan
  - Create SQL todos with dependencies
  - Enter plan mode for user approval

Step 3: general-purpose agent (per todo)
  - Execute each todo with full tool access
  - Self-contained prompt with all context

Step 4: code-review agent
  - Review all changes for bugs, security, logic
  - Only surfaces genuinely important issues
```

### Background Agent Multi-Turn Conversations

After a cloud delegation completes and opens a draft PR, bring the session local with
`/resume` to continue the conversation with full accumulated context:

```text
1. Delegate:        & "Analyze auth system and refactor weak points"
2. Continue locally, agent works on GitHub
3. Draft PR opens:  review changes on GitHub
4. Bring local:     /resume abc123
5. Follow-up:       > Also check the session management — same issues?
6. Agent continues with accumulated context from the original run
```

This is powerful for progressive refinement — review the initial work on GitHub, then
drill into specifics by resuming the session locally.

### Sub-Agent Lifecycle Tools

When background agents are running, Copilot CLI provides four tools to manage them:

| Tool | Purpose |
|------|---------|
| `task` | Launch an agent (`sync` or `background` mode) — returns `agent_id` for background runs |
| `read_agent` | Read output from a running or completed background agent |
| `write_agent` | Send a follow-up message to an **idle** agent (waiting for input) |
| `list_agents` | List all active and completed background agents in the session |

**Typical lifecycle:**

```text
1. task(..., mode="background")  → get agent_id
2. [continue other work]         → notified automatically on completion
3. read_agent(agent_id)          → retrieve full results
4. write_agent(agent_id, msg)    → if agent is idle and needs more input
5. list_agents()                 → rediscover agent IDs if lost
```

> These tools are the backbone of the [Team Planner](../skills/copilot-exclusive/team-planner/SKILL.md) skill's **Phase 5: Monitor** — dispatch multiple background agents, then poll/follow-up using `read_agent` and `write_agent`, storing summaries in the SQL session database.

---

### Fleet Agent Result Aggregation

When fleet agents complete in parallel, aggregate their results:

```sql
-- Track fleet task results
CREATE TABLE fleet_results (
    task_id TEXT PRIMARY KEY,
    agent_id TEXT,
    status TEXT DEFAULT 'pending',
    summary TEXT,
    files_changed TEXT  -- JSON array
);

-- After fleet completes, check for conflicts
SELECT a.task_id, b.task_id, a.files_changed
FROM fleet_results a, fleet_results b
WHERE a.task_id < b.task_id
AND json_each.value IN (SELECT value FROM json_each(b.files_changed));
```

---

## IDE Integration Deep-Dive

### VS Code Copilot Extension ↔ CLI Relationship

The VS Code Copilot extension and CLI are complementary, not competing:

```text
┌─────────────────────────────┐    ┌─────────────────────────────┐
│      VS Code Extension      │    │        Copilot CLI          │
├─────────────────────────────┤    ├─────────────────────────────┤
│ ✅ Inline completions       │    │ ✅ Multi-file batch changes  │
│ ✅ Visual diff review       │    │ ✅ Autonomous workflows      │
│ ✅ Debugging integration    │    │ ✅ Background agents         │
│ ✅ UI component preview     │    │ ✅ Fleet parallelization     │
│ ✅ Interactive refactoring  │    │ ✅ Multi-AI orchestration    │
│ ✅ Chat with file context   │    │ ✅ Session SQL database      │
│ ⚠️ Single-file focused     │    │ ⚠️ No visual feedback       │
│ ⚠️ Manual approval each    │    │ ⚠️ No inline completions    │
└─────────────────────────────┘    └─────────────────────────────┘
```

### When to Use the IDE

- **Debugging**: Breakpoints, variable inspection, call stacks — visual debugging wins
- **Visual diffs**: Reviewing changes side-by-side with syntax highlighting
- **UI components**: Seeing rendered output (React components, HTML pages)
- **Inline completions**: Quick single-line or single-function completions
- **Interactive refactoring**: Rename symbol, extract method with IDE tooling

### When to Use the CLI

- **Batch operations**: Updating 20 files, adding tests across modules
- **Autonomous workflows**: "Implement this feature end-to-end" with autopilot
- **CI/CD integration**: Running in pipelines, automated reviews
- **Multi-AI orchestration**: Coordinating Claude Code + Codex + Gemini
- **Long-running tasks**: Background agents that run while you do other work

### Sharing Context Between Them

Both the VS Code extension and CLI read from the same configuration sources:

- `.github/copilot-instructions.md` — shared instructions
- `AGENTS.md` — agent definitions
- `.vscode/mcp.json` or `devcontainer.json` — MCP server configs
- Git history — both can see commits, branches, diffs

**Workflow: IDE for exploration, CLI for execution:**

```text
1. Use VS Code Copilot chat to explore and understand a codebase
2. Identify the changes needed
3. Switch to CLI for autonomous multi-file implementation
4. Return to IDE to review diffs and debug if needed
5. Use CLI to create PR and run final review
```

See [IDE Switching skill](../skills/copilot-exclusive/ide-switching/SKILL.md).

---

## Custom Skills Creation

### Skill File Structure

Skills are Markdown files with YAML frontmatter that define reusable, composable workflows:

```markdown
---
name: my-custom-skill
description: One-line description of what this skill does
category: development  # development | security | testing | documentation | copilot-exclusive
triggers:
  - keyword or phrase that activates this skill
  - another trigger phrase
requires_tools:
  - powershell
  - edit
  - view
---

# My Custom Skill

## When to Use
- Bullet points describing when this skill applies
- Be specific about trigger conditions

## Prerequisites
- What must be true before this skill can run
- Required tools, configurations, or project structure

## Workflow

### Step 1: Investigate
Describe what to investigate and how.

### Step 2: Implement
Describe the implementation steps with code examples.

### Step 3: Verify
Describe how to verify the changes work.

## Examples

### Example: Basic Usage
\```powershell
# Show realistic commands
npm run build && npm test
\```

## Tips
- Practical tips for getting the best results
```

### Frontmatter Spec

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | ✅ | string | Kebab-case identifier matching filename |
| `description` | ✅ | string | One-line purpose statement |
| `category` | ✅ | string | One of: development, security, testing, documentation, copilot-exclusive |
| `triggers` | ⚠️ | string[] | Phrases that should activate this skill |
| `requires_tools` | ⚠️ | string[] | Tools the skill needs access to |
| `agent_type` | ⚠️ | string | Which agent type best executes this skill |
| `model` | ⚠️ | string | Recommended model override |

### Testing Skills

1. **Syntax validation**: Run the repo's schema validator against your skill file
2. **Dry run**: Ask the CLI to execute your skill on a test project
3. **Edge cases**: Test with missing prerequisites, empty projects, large codebases
4. **Cross-reference**: Ensure links to other skills and agents resolve correctly

---

## MCP Deep-Dive

### What is MCP?

The **Model Context Protocol** (MCP) is a standard for connecting AI models to external
tools and data sources. Copilot CLI uses MCP to integrate with GitHub, other AI tools,
and custom servers.

### Creating Custom MCP Servers

An MCP server exposes tools that Copilot CLI can call. The simplest implementation:

```json
{
  "servers": {
    "my-custom-server": {
      "command": "node",
      "args": ["path/to/my-server.js"],
      "env": {
        "API_KEY": "${env:MY_API_KEY}"
      }
    }
  }
}
```

Your server implements the MCP protocol to expose tools:

```typescript
// my-server.ts — minimal MCP server
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "my-tools", version: "1.0.0" });

server.tool("search_docs", { query: z.string() }, async ({ query }) => {
  const results = await searchDocumentation(query);
  return { content: [{ type: "text", text: JSON.stringify(results) }] };
});
```

### MCP Bridges to Other AI Tools

MCP bridges enable Copilot CLI to invoke other AI tools as if they were native tools:

```text
┌──────────────┐     MCP      ┌──────────────┐
│  Copilot CLI │ ──────────── │  Claude Code  │
│  (hub)       │   bridge     │  (worker)     │
└──────────────┘              └──────────────┘
       │            MCP       ┌──────────────┐
       └──────────────────── │  Codex CLI    │
                   bridge     │  (worker)     │
                              └──────────────┘
```

See [MCP Bridge pattern](../orchestration/patterns/mcp-bridge.md) and
bridge configs in [orchestration/configs/](../orchestration/configs/).

### devcontainer.json Configuration

For projects using dev containers, configure MCP servers in `devcontainer.json`:

```json
{
  "customizations": {
    "vscode": {
      "settings": {
        "github.copilot.chat.mcpServers": {
          "github": {
            "command": "github-mcp-server",
            "args": ["--tools=all"]
          },
          "custom-tools": {
            "command": "node",
            "args": ["tools/mcp-server.js"]
          }
        }
      }
    }
  }
}
```

See [MCP Ecosystem skill](../skills/copilot-exclusive/mcp-ecosystem/SKILL.md).

---

## Multi-AI Orchestration Advanced

### Agent Council Pattern in Practice

The Agent Council brings multiple AI perspectives to complex decisions:

```text
┌─────────────────────────────────────────────────────────┐
│                    Agent Council                         │
├──────────┬──────────┬───────────┬───────────────────────┤
│ Copilot  │  Claude  │  Codex    │  Gemini               │
│ CLI      │  Code    │  CLI      │  CLI                  │
├──────────┼──────────┼───────────┼───────────────────────┤
│ GitHub   │ Deep     │ Fast      │ Multimodal            │
│ context  │ analysis │ generation│ analysis              │
└──────────┴──────────┴───────────┴───────────────────────┘
         │          │          │           │
         └──────────┴──────────┴───────────┘
                        │
                  Synthesized Decision
```

**Real-world example — Architecture review:**

1. **Copilot CLI** gathers GitHub context (PRs, issues, CI status)
2. **Claude Code** performs deep architectural analysis (200K context)
3. **Gemini CLI** analyzes diagrams and visual documentation
4. **Copilot CLI** synthesizes all perspectives into a recommendation

See [Agent Council pattern](../orchestration/patterns/agent-council.md).

### Cost-Aware Routing

Route tasks to the cheapest model that can handle them:

```text
┌──────────────────────────────────────────────────────┐
│                 Cost-Aware Router                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Simple task?  ──→  Haiku / GPT-4.1    ($)          │
│  Standard task? ──→  Sonnet / GPT-5.1  ($$)         │
│  Complex task?  ──→  Opus / GPT-5.4    ($$$)        │
│                                                      │
│  Exploration?   ──→  explore agent     ($)          │
│  Build/test?    ──→  task agent        ($)          │
│  Implementation ──→  general-purpose   ($$)         │
│  Review?        ──→  code-review       ($$)         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Practical routing rules:**

| Task Type | Recommended Model | Agent Type | Why |
|-----------|------------------|------------|-----|
| Find files / search code | `claude-haiku-4.5` | explore | Cheap, fast, sufficient |
| Run builds / tests | `claude-haiku-4.5` | task | Only need pass/fail |
| Simple edits / boilerplate | `gpt-5-mini` | general-purpose | Fast generation |
| Complex refactoring | `claude-sonnet-4.6` | general-purpose | Needs reasoning |
| Architecture decisions | `claude-opus-4.6` | general-purpose | Deep analysis |
| Security review | `claude-sonnet-4.6` | code-review | Specialized focus |

### Conflict Resolution When Agents Disagree

When multiple AI tools produce conflicting recommendations:

1. **Identify the conflict** — Log both recommendations with rationale
2. **Evaluate evidence** — Which recommendation has stronger supporting evidence?
3. **Consider expertise** — Claude excels at reasoning, Codex at patterns, Copilot at GitHub context
4. **Test both** — If possible, prototype both approaches and measure outcomes
5. **Escalate to human** — For architectural decisions, present both options to the developer

### Session Hand-Off Between Tools

Transfer context between AI tools using file-based hand-off:

```powershell
# Copilot CLI generates analysis
copilot-cli "Analyze auth system, write findings to analysis.md"

# Claude Code continues with deep reasoning
claude "Read analysis.md and propose architectural improvements"

# Copilot CLI implements the chosen approach
copilot-cli "Implement changes from analysis.md improvements"
```

See [Pipeline pattern](../orchestration/patterns/pipeline.md) for structured hand-off.

---

## Performance Tips

### Top 20 Tips for Maximum Productivity

1. **Use explore agents for investigation** — They're cheap and keep your main context clean
2. **Batch related questions** into a single explore call — 1 call with 5 questions beats 5 calls
3. **Launch parallel explore agents** for independent questions — safe to parallelize
4. **Use task agents for builds/tests** — Brief output on success, full output on failure
5. **Chain commands with `&&`** — `npm run build && npm test` uses one turn, not two
6. **Suppress verbose output** — `--quiet`, `| head`, `| Select-Object -First N`
7. **Use the SQL database** for structured state — Survives context compaction
8. **Track todos in SQL, not in chat** — `INSERT INTO todos` instead of "remember to do X"
9. **Use plan mode for complex tasks** — Structured approval prevents wasted work
10. **Switch to autopilot** for well-defined tasks — Skip per-step approval
11. **Use fleet mode for independent tasks** — 3-4x speedup on parallelizable work
12. **Choose the right model** — Don't use Opus for file searches (use Haiku)
13. **Use `/clear` between unrelated tasks** — Fresh context = better results
14. **Be specific in prompts** — "Fix bug in src/auth/login.ts:42" beats "fix auth"
15. **Include file paths** in your requests — Reduces search time and context usage
16. **Use background agents** for long tasks — Continue working while they run
17. **Review with code-review agent** — High signal-to-noise, catches real bugs
18. **Leverage GitHub MCP tools** — Native PR, issue, and actions integration
19. **Create custom skills** for repeated workflows — Reusable, consistent patterns
20. **Compose agent pipelines** — explore → plan → implement → review

---

## Troubleshooting

### Common Issues and Solutions

#### Model responds slowly or loses coherence

**Cause:** Context window is saturated with irrelevant information.

**Solution:**

```text
1. Use /clear to reset the conversation
2. Re-state your current goal concisely
3. Point to specific files rather than asking for broad searches
```

#### Agent keeps reading the same files repeatedly

**Cause:** The agent lost context about what it already read (compaction or long conversation).

**Solution:**

```text
1. Store key findings in the SQL database
2. Reference stored data instead of re-reading files
3. Use more specific prompts to avoid redundant exploration
```

#### Fleet mode produces merge conflicts

**Cause:** Multiple fleet agents modified the same files.

**Solution:**

```text
1. Decompose tasks so each agent works on different files
2. Use a shared SQL table to coordinate file assignments
3. Run a post-fleet merge step to resolve any conflicts
```

#### MCP server fails to connect

**Cause:** Server binary not found, wrong path, or missing environment variables.

**Solution:**

```powershell
# Verify the server binary exists
Get-Command github-mcp-server

# Check environment variables
$env:GITHUB_TOKEN

# Test server manually
node path/to/server.js --help
```

#### Background agent never completes

**Cause:** The task is too broad or the agent is stuck in a loop.

**Solution:**

```text
1. Use /resume to check current status and partial output
2. If stuck, refine the prompt and re-delegate with &
3. Break large tasks into smaller, well-defined chunks
```

#### SQL database queries return empty results

**Cause:** Tables were not created or data was inserted in a different session.

**Solution:**

```sql
-- Check what tables exist
SELECT name FROM sqlite_master WHERE type='table';

-- Verify data exists
SELECT COUNT(*) FROM todos;
```

#### Explore agent gives incomplete answers

**Cause:** The question was too broad or asked without enough context.

**Solution:**

```text
1. Be specific: "Find all Express route handlers in src/routes/"
   instead of "Find API endpoints"
2. Batch related questions into one call
3. Provide file path hints when you have them
```

#### Build verification fails after agent changes

**Cause:** The agent made changes that don't compile or pass tests.

**Solution:**

```powershell
# Check what changed
git --no-pager diff --stat

# Revert specific files if needed
git checkout -- path/to/broken/file.ts

# Re-run with more specific instructions
```

---

## Further Reading

- [Copilot Exclusive Features Guide](copilot-exclusive-features.md) — Features unique to Copilot CLI
- [Comparison with Claude Code](copilot-vs-claude-code.md) — Feature-by-feature comparison
- [Migration from Claude Code](migration-from-claude-code.md) — Step-by-step migration guide
- [Orchestration Patterns](../orchestration/README.md) — Multi-AI coordination patterns
- [Skills Library](../skills/) — Reusable workflow capabilities
- [Agent Catalog](../AGENTS.md) — All available agents
