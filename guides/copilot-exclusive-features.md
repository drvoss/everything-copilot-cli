# Copilot CLI Exclusive Features

> A deep guide to features that are unique to GitHub Copilot CLI — capabilities you
> won't find in Claude Code, Codex CLI, or other AI coding assistants.
> Each section covers what it is, why it matters, how to use it, and a practical example.

---

## Table of Contents

1. [GitHub Native Integration](#github-native-integration)
2. [18-Model Selection](#18-model-selection)
3. [IDE ↔ CLI Synergy](#ide--cli-synergy)
4. [Plan Mode Mastery](#plan-mode-mastery)
5. [Autopilot Deep-Dive](#autopilot-deep-dive)
6. [Background Agents](#background-agents)
7. [Fleet Execution](#fleet-execution)
8. [Session Database](#session-database)
9. [Cross-Session Memory](#cross-session-memory)
10. [Multi-AI Orchestration](#multi-ai-orchestration)

---

## GitHub Native Integration

### What It Is

Copilot CLI includes built-in MCP tools for the entire GitHub platform — pull requests,
issues, Actions workflows, code search, commits, branches, and repositories. No
additional MCP server setup required.

### Why It Matters

Other AI coding tools require configuring external MCP servers or writing custom
integrations to interact with GitHub. Copilot CLI has it out of the box, reducing
setup time and eliminating configuration drift.

### How to Use It

The GitHub tools are automatically available. Just ask:

```
"List open PRs with failing CI checks"
"Create a PR from my current branch with a summary of changes"
"Find the issue that reported this bug"
"Show me the failing job logs for workflow run 12345"
"Search for authentication code across all our repositories"
```

### Available GitHub Tools

| Tool Category | Capabilities |
|--------------|-------------|
| **Pull Requests** | List, get details, get diff, get files, get reviews, get check runs |
| **Issues** | List, search, get details, get comments, get labels |
| **Actions** | List workflows, get runs, get job logs, download artifacts |
| **Code Search** | Search across all GitHub repos with advanced syntax |
| **Commits** | List commits, get commit details with diffs |
| **Branches** | List branches, compare branches |
| **Repositories** | Search repos, get file contents |

### Example

```
> "The CI is failing on PR #87. Diagnose and fix it."

Copilot CLI will:
1. Fetch PR #87 details (github-mcp-server-pull_request_read)
2. Get failing check runs (get_check_runs)
3. Download job logs (get_job_logs)
4. Identify the failing test
5. Read the relevant source code
6. Fix the bug
7. Suggest pushing the fix
```

See [GitHub PR Workflow skill](../skills/copilot-exclusive/github-pr-workflow.md) and
[Actions Debugging skill](../skills/copilot-exclusive/actions-debugging.md).

---

## 18-Model Selection

### What It Is

Copilot CLI supports 18 models across three providers (OpenAI, Anthropic, Google),
organized into three tiers: premium, standard, and fast/cheap.

### Why It Matters

Different tasks have different complexity requirements. Using an expensive model for
simple file searches wastes money; using a cheap model for architecture decisions
produces poor results. Model selection lets you optimize the cost-quality tradeoff
for every task.

### How to Use It

Override the default model for any agent with the `model` parameter:

```
task(agent_type="explore", model="claude-haiku-4.5", prompt="Find all test files")
task(agent_type="general-purpose", model="claude-opus-4.6", prompt="Redesign auth")
```

### Complete Model Catalog

| Model | Provider | Tier | Best For |
|-------|----------|------|----------|
| `gpt-5.4` | OpenAI | Standard | General-purpose coding |
| `gpt-5.3-codex` | OpenAI | Standard | Code generation |
| `gpt-5.2-codex` | OpenAI | Standard | Code generation |
| `gpt-5.2` | OpenAI | Standard | General-purpose |
| `gpt-5.1-codex-max` | OpenAI | Standard | Maximum code quality |
| `gpt-5.1-codex` | OpenAI | Standard | Code generation |
| `gpt-5.1` | OpenAI | Standard | General-purpose |
| `gpt-5.1-codex-mini` | OpenAI | Fast/Cheap | Quick code tasks |
| `gpt-5-mini` | OpenAI | Fast/Cheap | Simple tasks |
| `gpt-5-mini` | OpenAI | Fast/Cheap | Quick general tasks |
| `claude-sonnet-4.6` | Anthropic | Standard | Balanced quality + speed |
| `claude-sonnet-4.5` | Anthropic | Standard | Reliable all-rounder |
| `claude-sonnet-4` | Anthropic | Standard | Stable, proven |
| `claude-haiku-4.5` | Anthropic | Fast/Cheap | Exploration, simple edits |
| `claude-opus-4.6` | Anthropic | Premium | Deep analysis, architecture |
| `claude-opus-4.6-fast` | Anthropic | Premium | Premium quality, faster |
| `gemini-3-pro-preview` | Google | Standard | Multimodal, large context |

### Example: Cost-Aware Routing

```
Phase 1 — Explore (cheap):     claude-haiku-4.5      → $
Phase 2 — Plan (standard):     default model          → $$
Phase 3 — Implement (standard): claude-sonnet-4.6     → $$
Phase 4 — Review (standard):    claude-sonnet-4.6     → $$
Phase 5 — Arch review (premium): claude-opus-4.6      → $$$  (only if needed)
```

See [Multi-Model Strategy skill](../skills/copilot-exclusive/multi-model-strategy.md).

---

## IDE ↔ CLI Synergy

### What It Is

GitHub Copilot runs natively in both VS Code (as an extension) and the terminal
(as the CLI). Both share the same configuration files, instructions, and project context.

### Why It Matters

You get the best of both worlds — visual IDE features (inline completions, debugging,
diff views) combined with terminal power (batch operations, automation, background agents).
No other AI coding tool offers this integration depth.

### How to Use It

**Shared configuration (both tools read these):**
- `.github/copilot-instructions.md` — project instructions
- `AGENTS.md` — agent definitions
- `.vscode/mcp.json` — MCP server configurations

**IDE-first workflow:**
1. Use VS Code Copilot chat to explore and understand code
2. Use inline completions for quick single-file edits
3. Switch to CLI for multi-file batch operations or autonomous execution

**CLI-first workflow:**
1. Use CLI to plan and implement changes autonomously
2. Switch to VS Code to review diffs visually
3. Use IDE debugger to verify behavior
4. Return to CLI for PR creation and review

### Example: Full-Cycle Development

```
1. VS Code: Explore codebase with Copilot chat, understand the auth module
2. CLI:     "Implement OAuth2 login — plan mode" → approve plan
3. CLI:     Autopilot executes the plan across 8 files
4. VS Code: Review diffs in source control panel
5. VS Code: Set breakpoints, debug the new OAuth flow
6. CLI:     "Create PR with these changes, run code-review agent"
7. VS Code: Address review comments with inline Copilot
```

See [IDE Switching skill](../skills/copilot-exclusive/ide-switching.md).

---

## Plan Mode Mastery

### What It Is

Plan Mode is a structured planning workflow where Copilot CLI produces a detailed
implementation plan, presents it for visual approval, and optionally transitions to
autopilot for execution.

### Why It Matters

For complex tasks, jumping straight to implementation often leads to wrong approaches,
wasted effort, and code that needs to be reverted. Plan Mode catches design mistakes
early and ensures alignment before any code is written.

### How to Use It

**Plan Mode workflow:**

```
1. Request enters plan mode    → Copilot analyzes the task
2. Plan created (plan.md)      → Structured breakdown with todos
3. Visual approval presented   → You review and approve/modify
4. Execution begins            → Interactive, autopilot, or fleet
```

**SQL todo integration:**

```sql
-- Plan mode automatically creates todos
INSERT INTO todos (id, title, description, status) VALUES
    ('auth-model', 'Create user model', 'Define User schema with JWT fields in src/models/', 'pending'),
    ('auth-routes', 'Add auth routes', 'POST /login, /logout, /refresh in src/routes/', 'pending'),
    ('auth-middleware', 'Create auth middleware', 'JWT validation middleware in src/middleware/', 'pending');

-- With dependencies
INSERT INTO todo_deps (todo_id, depends_on) VALUES
    ('auth-routes', 'auth-model'),
    ('auth-middleware', 'auth-model');

-- Query "ready" todos (no pending dependencies)
SELECT t.* FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM todo_deps td
    JOIN todos dep ON td.depends_on = dep.id
    WHERE td.todo_id = t.id AND dep.status != 'done'
);
```

**Approval options:**
- **Accept** — proceed with the plan
- **Accept + Autopilot** — execute autonomously
- **Accept + Fleet** — parallelize independent tasks
- **Modify** — provide feedback, plan is revised

### Example

```
> "Add comprehensive error handling to the API. Use plan mode."

Plan created:
  ✅ todo: error-types     — Define custom error classes
  ✅ todo: error-middleware — Create global error handler
  ✅ todo: route-errors     — Add try-catch to all routes (depends: error-types)
  ✅ todo: error-tests      — Add error handling tests (depends: error-middleware)
  ✅ todo: error-docs       — Update API documentation (depends: route-errors)

[Approve] [Approve + Autopilot] [Modify]
```

See [Plan Mode Mastery skill](../skills/copilot-exclusive/plan-mode-mastery.md).

---

## Autopilot Deep-Dive

### What It Is

Autopilot mode allows Copilot CLI to execute tasks autonomously without requiring
per-step user approval. It's the mode between interactive (approve every action) and
fully unattended.

### Why It Matters

For well-defined tasks with clear acceptance criteria, per-step approval adds friction
without adding safety. Autopilot lets you say "implement this plan" and get a coffee
while Copilot works.

### How to Use It

**When to use autopilot:**
- Task is well-defined with clear scope
- You've reviewed the plan in plan mode
- Changes are reversible (git tracked)
- Tests exist to validate the result

**When NOT to use autopilot:**
- Exploratory tasks with unclear requirements
- Security-sensitive changes (credentials, permissions)
- Database migrations or destructive operations
- First time working in an unfamiliar codebase

**Safety guardrails:**
- Changes are git-tracked — easy to revert
- Copilot follows existing project conventions
- Tool permissions are still enforced
- You can interrupt at any time

### Example

```
> "Add input validation to all API endpoints. Autopilot."

Copilot autonomously:
1. Scans all route files for endpoints
2. Identifies input parameters for each
3. Adds validation using the project's validation library
4. Adds tests for validation edge cases
5. Runs existing tests to verify nothing broke
6. Reports completion with summary
```

See [Autopilot Patterns skill](../skills/copilot-exclusive/autopilot-patterns.md).

---

## Background Agents

### What It Is

Background agents run asynchronously in separate processes while you continue working
in your main session. You receive a notification when they complete, then read their
results.

### Why It Matters

Long-running tasks (codebase analysis, test suites, documentation generation) no longer
block your workflow. Start a background agent, continue coding, and collect results when
they're ready.

### How to Use It

```
# Launch
agent_id = task(mode="background", agent_type="explore",
    prompt="Analyze all error handling patterns in this codebase")

# Continue working on other things...

# Get notified when complete, then read results
results = read_agent(agent_id)

# Optionally send follow-up messages
write_agent(agent_id, "Now categorize the patterns by severity")
```

**Multi-turn pattern:**

```
Turn 1: "Analyze the authentication system"
  → Agent investigates, reports findings
Turn 2: "Focus on the token refresh flow — are there race conditions?"
  → Agent drills deeper with accumulated context
Turn 3: "Write a summary with recommendations"
  → Agent produces final report
```

### Example

```
# Launch two background agents in parallel
agent1 = task(mode="background", prompt="Audit all npm dependencies for vulnerabilities")
agent2 = task(mode="background", prompt="Generate test coverage report for src/services/")

# Both run concurrently while you work on a feature
# ...implementing a new feature...

# Results arrive via notifications
read_agent(agent1)  # → "Found 3 vulnerabilities: lodash (high), ..."
read_agent(agent2)  # → "Coverage: auth 87%, users 62%, payments 91%"
```

See [Background Agent skill](../skills/copilot-exclusive/background-agent.md).

---

## Fleet Execution

### What It Is

Fleet mode decomposes a task into independent units and executes them in parallel across
multiple autonomous agents, each with its own context window.

### Why It Matters

Many development tasks are embarrassingly parallel — adding tests for 5 modules, updating
10 configuration files, reviewing 8 pull requests. Fleet mode provides 3-4x speedup on
these tasks with no manual coordination.

### How to Use It

**Task decomposition strategy:**

```
1. Identify independent units (no shared state, no file overlap)
2. Write self-contained prompts (agents are stateless)
3. Include all context each agent needs
4. Launch fleet
5. Aggregate results
```

**Good fleet candidates:**
- Adding tests for independent modules
- Updating configuration files
- Reviewing multiple PRs
- Fixing the same type of issue across files
- Generating documentation for separate components

**Bad fleet candidates:**
- Tasks that modify the same files (merge conflicts)
- Sequential operations (migrations, ordered deployments)
- Tasks requiring shared state (use SQL + sequential instead)

### Example

```
> "Add unit tests for all 6 service modules. Use fleet."

Fleet decomposes into 6 independent agents:
  Agent 1: Add tests for src/services/auth.ts
  Agent 2: Add tests for src/services/users.ts
  Agent 3: Add tests for src/services/payments.ts
  Agent 4: Add tests for src/services/notifications.ts
  Agent 5: Add tests for src/services/search.ts
  Agent 6: Add tests for src/services/analytics.ts

All 6 run simultaneously → completed in ~8 min instead of ~30 min
```

See [Fleet Parallel skill](../skills/copilot-exclusive/fleet-parallel.md).

---

## Session Database

### What It Is

Every Copilot CLI session includes a built-in SQLite database with pre-configured tables
(`todos`, `todo_deps`) and the ability to create custom tables for any purpose.

### Why It Matters

Context window compaction can lose details. The SQL database provides persistent,
queryable structured state that survives compaction, enables dependency tracking,
and supports complex workflows that chat-based memory cannot.

### How to Use It

**Pre-built tables:**

```sql
-- Todo tracking
INSERT INTO todos (id, title, description, status) VALUES
    ('fix-auth', 'Fix auth bug', 'Token refresh fails after 24h', 'pending');

-- Dependency management
INSERT INTO todo_deps (todo_id, depends_on) VALUES
    ('deploy-auth', 'fix-auth');

-- Find ready tasks (no pending dependencies)
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
    id TEXT PRIMARY KEY, name TEXT, file_path TEXT,
    status TEXT DEFAULT 'not_written'
);

-- Batch file processing
CREATE TABLE files_to_process (
    path TEXT PRIMARY KEY, status TEXT DEFAULT 'pending', error TEXT
);

-- Key-value session state
CREATE TABLE session_state (key TEXT PRIMARY KEY, value TEXT);

-- Fleet result aggregation
CREATE TABLE fleet_results (
    task_id TEXT PRIMARY KEY, status TEXT, summary TEXT, files_changed TEXT
);
```

### Example: TDD Workflow with SQL Tracking

```sql
-- 1. Plan test cases
INSERT INTO test_cases (id, name, status) VALUES
    ('login-valid', 'should authenticate valid credentials', 'not_written'),
    ('login-invalid', 'should reject invalid password', 'not_written'),
    ('token-refresh', 'should refresh expired tokens', 'not_written');

-- 2. Pick next test to write
SELECT * FROM test_cases WHERE status = 'not_written' LIMIT 1;

-- 3. Mark as written
UPDATE test_cases SET status = 'written' WHERE id = 'login-valid';

-- 4. After test passes
UPDATE test_cases SET status = 'passing' WHERE id = 'login-valid';

-- 5. Check progress
SELECT status, COUNT(*) as count FROM test_cases GROUP BY status;
```

See [Session Management skill](../skills/copilot-exclusive/session-management.md).

---

## Cross-Session Memory

### What It Is

The `session_store` database provides read-only access to data from previous sessions,
enabling knowledge persistence across multiple Copilot CLI sessions. This feature is
experimental but already useful.

### Why It Matters

Developers often solve the same types of problems repeatedly. Cross-session memory
lets you find how you solved something before, resume interrupted work, and build
on previous analysis without starting from scratch.

### How to Use It

```sql
-- Search previous sessions with full-text search
SELECT * FROM session_store.sessions
WHERE content MATCH 'authentication refactor';

-- Find artifacts from previous sessions
SELECT * FROM session_store.files
WHERE path LIKE '%analysis%';
```

**Session resume:**
Sessions can be resumed from `events.jsonl`, picking up exactly where you left off
with full conversation history and context.

### Example

```
> "I fixed a similar caching bug last week. Find what I did."

Copilot searches session_store:
  Found session from 2024-01-15: "Fix Redis cache invalidation"
  Applied pattern: TTL-based invalidation with fallback to DB
  Files changed: src/cache/redis.ts, src/services/users.ts

> "Apply the same pattern to the payments service."
```

See [Cross-Session Memory skill](../skills/copilot-exclusive/cross-session-memory.md).

---

## Multi-AI Orchestration

### What It Is

Copilot CLI can serve as a **meta-hub** that orchestrates multiple AI coding tools —
Claude Code, Codex CLI, Gemini CLI, and any MCP-compatible tool — routing tasks to
whichever tool is best suited.

### Why It Matters

No single AI tool is best at everything. Claude excels at deep reasoning, Codex at
fast generation, Gemini at multimodal analysis, and Copilot at GitHub integration.
Orchestration lets you leverage all of them from a single interface.

### How to Use It

**Five orchestration patterns (increasing complexity):**

| Pattern | Complexity | Description |
|---------|-----------|-------------|
| [Shell Invocation](../orchestration/patterns/shell-invocation.md) | Low | Direct CLI calls |
| [MCP Bridge](../orchestration/patterns/mcp-bridge.md) | Medium | MCP protocol integration |
| [Message IPC](../orchestration/patterns/message-ipc.md) | Medium | Inter-process communication |
| [Pipeline](../orchestration/patterns/pipeline.md) | Medium | Unix-pipe chaining |
| [Agent Council](../orchestration/patterns/agent-council.md) | High | Multi-agent deliberation |

**Tool Strength Matrix:**

| Tool | GitHub | Reasoning | Speed | Multimodal | Context |
|------|--------|-----------|-------|------------|---------|
| Copilot CLI | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ |
| Claude Code | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| Codex CLI | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| Gemini CLI | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

### Example: Full Workflow Orchestration

```
1. Copilot CLI: Gather requirements from GitHub issues
2. Claude Code: Design architecture (deep reasoning, 200K context)
3. Codex CLI:   Rapid prototype implementation (fast, sandboxed)
4. Gemini CLI:  Analyze UI mockups and generate components
5. Copilot CLI: Run tests, create PR, request reviews
6. Claude Code: Deep code review of critical paths
7. Copilot CLI: Merge PR and close related issues
```

See the full [Orchestration Guide](../orchestration/README.md) and
[Orchestration Examples](../orchestration/examples/).

---

## Feature Summary Matrix

| Feature | Copilot CLI | Claude Code | Codex CLI | Gemini CLI |
|---------|:-----------:|:-----------:|:---------:|:----------:|
| GitHub Native | ✅ | ❌ | ❌ | ❌ |
| 18 Models | ✅ | ❌ | ❌ | ❌ |
| IDE Synergy | ✅ | ❌ | ❌ | ❌ |
| Plan Mode | ✅ | ⚠️ | ❌ | ❌ |
| Autopilot | ✅ | ⚠️ | ⚠️ | ❌ |
| Background Agents | ✅ | ❌ | ❌ | ❌ |
| Fleet Execution | ✅ | ❌ | ❌ | ❌ |
| Session SQL DB | ✅ | ❌ | ❌ | ❌ |
| Cross-Session Memory | ✅ | ⚠️ | ❌ | ❌ |
| Multi-AI Orchestration | ✅ | ❌ | ❌ | ❌ |

**These features combined make Copilot CLI uniquely powerful as both a standalone tool
and an orchestration hub for the entire AI-assisted development ecosystem.**

---

## Further Reading

- [The Longform Guide](the-longform-guide.md) — Deep-dive into all features
- [Copilot vs Claude Code](copilot-vs-claude-code.md) — Detailed comparison
- [Migration from Claude Code](migration-from-claude-code.md) — Step-by-step migration
- [Orchestration Patterns](../orchestration/README.md) — Multi-AI coordination
- [Skills Library](../skills/) — All available skills
- [Agent Catalog](../AGENTS.md) — All available agents
