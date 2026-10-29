# Copilot CLI Exclusive Features

> A deep guide to features that are unique to GitHub Copilot CLI — capabilities you
> won't find in Claude Code, Codex CLI, or other AI coding assistants.
> Each section covers what it is, why it matters, how to use it, and a practical example.

---

## Table of Contents

1. [GitHub Native Integration](#github-native-integration)
2. [Plugin and Marketplace Lifecycle](#plugin-and-marketplace-lifecycle)
3. [20+ Model Selection](#20-model-selection)
4. [IDE ↔ CLI Synergy](#ide--cli-synergy)
5. [Plan Mode Mastery](#plan-mode-mastery)
6. [Autopilot Deep-Dive](#autopilot-deep-dive)
7. [Local Sandbox and Settings](#local-sandbox-and-settings)
8. [Background Agents](#background-agents)
9. [Fleet Execution](#fleet-execution)
10. [Session Database](#session-database)
11. [Cross-Session Memory](#cross-session-memory)
12. [Multi-AI Orchestration](#multi-ai-orchestration)

---

## GitHub Native Integration

### What It Is

Copilot CLI covers core GitHub development workflows out of the box — pull requests, issues,
Actions workflows, code search, commits, branches, and repositories — through its built-in
GitHub MCP tools or, when `gh` is on PATH, mostly through `gh` (it omits the overlapping MCP
tools by default). No additional MCP server setup required.

### Why It Matters

Other AI coding tools require configuring external MCP servers or writing custom
integrations to interact with GitHub. Copilot CLI has it out of the box, reducing
setup time and eliminating configuration drift.

### How to Use It

GitHub access is automatically available — the default MCP subset plus `gh` when it is on PATH, or the
full MCP tool set otherwise. Just ask:

```text
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

> **When `gh` is on PATH, most of this table is served by `gh`, not MCP.** Copilot CLI changelog: "When gh CLI is on PATH,
> GitHub MCP server now omits redundant gh-replaceable tools by default, reducing token usage." The default subset is then
> `get_file_contents`, `search_code`, `get_copilot_space`, `list_copilot_spaces`, `web_search`, `search_users`; PR, issue, Actions,
> commit, branch, and repo-search tools are omitted and the model is expected to use `gh`, e.g. `gh pr view <n>`, `gh pr checks <n>`, `gh run view <id> --log-failed`.
> To restore MCP tools, start with `--add-github-mcp-tool=<name>` (repeatable; it **replaces** the default subset, so name every
> tool you need, including defaults; enables no write tools) or `--enable-all-github-mcp-tools` (= `--add-github-mcp-tool=*`),
> which restores everything **including write tools** such as `add_issue_comment`. Measured on Copilot CLI 1.0.103.

### Example

```text
> "The CI is failing on PR #87. Diagnose and fix it."

Copilot CLI will:
1. Fetch PR #87 details (with gh: gh pr view 87; when exposed: github-mcp-server-pull_request_read)
2. Get failing check runs (with gh: gh pr checks 87; when exposed: get_check_runs)
3. Download job logs (with gh: gh run view <run-id> --log-failed; when exposed: get_job_logs)
4. Identify the failing test
5. Read the relevant source code
6. Fix the bug
7. Suggest pushing the fix
```

See [GitHub PR Workflow skill](../skills/copilot-exclusive/github-pr-workflow/SKILL.md) and
[Actions Debugging skill](../skills/copilot-exclusive/actions-debugging/SKILL.md).

---

## Plugin and Marketplace Lifecycle

The singular `copilot plugin` is the command. `copilot plugins` still runs, but it routes to the
singular form and reports plugins only — it is a legacy alias, not a separate command with its own
flags. The interactive `/plugins` command was **removed**; its resources moved to `/plugin`,
`/mcp`, and `/skills`. Keep terminal and slash syntax distinct when copying commands between
surfaces.

| Operation | Terminal command | Interactive slash surface |
|-----------|------------------|---------------------------|
| Install / uninstall / list | `copilot plugin install SOURCE`, `uninstall NAME`, `list` | `/plugin install SOURCE`, `/plugin uninstall PLUGIN[@MARKETPLACE]`, `/plugin list` |
| Update | `copilot plugin update PLUGIN[@MARKETPLACE]` | `/plugin update PLUGIN[@MARKETPLACE]` |
| Enable / disable a plugin | `copilot plugin enable NAME`, `copilot plugin disable NAME` | `/plugin` dashboard |
| Enable / disable an MCP server | `copilot mcp enable NAME`, `copilot mcp disable NAME` | `/mcp enable`, `/mcp disable` |
| Enable / disable a skill | `copilot skill enable NAME`, `copilot skill disable NAME` | `/skills` dashboard |
| Register / list a marketplace | `copilot plugin marketplace add SOURCE`, `list` | `/plugin marketplace add SOURCE`, `/plugin marketplace list` |
| Browse / refresh | `copilot plugin marketplace browse NAME`, `update [NAME]` | `/plugin marketplace browse NAME` |
| Remove a marketplace | `copilot plugin marketplace remove NAME` | `/plugin marketplace remove NAME` |

One marketplace ships by default: `awesome-copilot` (`github/awesome-copilot`). `copilot-plugins`
(`github/copilot-plugins`) is now an ordinary marketplace; register it with
`copilot plugin marketplace add github/copilot-plugins` before installing from it.

`update NAME` and `update --all` are alternatives; do not combine a name with `--all`. Marketplace
sources may be Git repositories, URLs, or local paths. The CLI checks marketplace manifests in
this order:

1. `marketplace.json`
2. `.plugin/marketplace.json`
3. `.github/plugin/marketplace.json`
4. `.claude-plugin/marketplace.json`

This repository ships both `.github/plugin/marketplace.json` and `.claude-plugin/marketplace.json`.
Copilot CLI reads the first one it finds (`.github/plugin/`), so the Claude Code manifest does not
affect Copilot installs. For installing the same skills in Claude Code, Cursor, or Antigravity, see
the [README](../README.md#using-the-skills-in-claude-code).

Repository plugin defaults are generally available. A maintainer can make this marketplace and the
full collection a default for everyone who works in a project by committing
`.github/copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "everything-copilot-cli": {
      "source": { "source": "github", "repo": "drvoss/everything-copilot-cli" }
    }
  },
  "enabledPlugins": {
    "everything-copilot-cli@everything-copilot-cli": true
  }
}
```

A plugin enabled only this way is scoped to that repository: it installs and activates there and
stays disabled everywhere else. To opt out in Copilot CLI, a contributor sets the same key to
`false` in `.github/copilot/settings.local.json` (never committed), saves it, and starts a new
session. While the repository setting decides a plugin's state, `copilot plugin enable` and
`disable` are rejected with an error that names the controlling file. Enterprise-managed required
or blocked entries always win, and an `autoUpdate: true` on a repository-level marketplace entry is
ignored. Copilot cloud agent also reads these two keys, so the same file can set the default for
both, subject to managed policy.

The cross-kind `--plugin`, `--mcp`, `--skill`, `--kind`, and `--scope` flags were removed from
`copilot plugins`. Each resource kind now has its own command: `copilot plugin`, `copilot mcp`,
and `copilot skill` each carry their own `enable` and `disable`. Discovery moved too —
`copilot instruction list` and `copilot lsp list` replace `copilot plugins list --kind instruction`
and `--kind lsp`, and both are inspect-only. `copilot plugin list --json` now emits a flat array
rather than a `{ plugins, errors }` object.

Custom agents and session-scoped hooks are not covered by any of these commands; they require a
live session.

Agent Plugins (Open Plugin Spec) v1.0.0 and v1.1.0 are supported through `plugin.json` at
the plugin root. An Agent Plugins manifest requires `$schema`
(`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` or the 1.1.0 URL) and `name`
(kebab-case, at most 64 characters; periods allowed). Optional fields are `version`, `description`,
`author`, `homepage`, `repository`, `license`, `keywords` and `extensions`. Components live at fixed
paths (`skills/`, root `mcp.json`, and `com.github.copilot/` for agents, commands, rules and hooks);
component path fields such as `agents`, `skills`, `hooks`, `mcpServers` and `lspServers` belong to
the legacy manifest only. The meaning of `extensions` differs in Open
Plugin Spec mode, so consult the current reference instead of guessing.

Disabling is not uninstalling. Disabled skills remain visible in `copilot skill list` and its JSON
output, so automation must inspect disabled state rather than treating name presence as proof that
a skill is active. Separately, v1.0.78 release notes document that first-party plugins update to
the latest version at session start; that automatic refresh is distinct from the manual
`copilot plugin update` command.

For native hook output fields and failure behavior, see
[Hooks to GitHub Actions](hooks-to-github-actions.md#copilot-clis-native-hook-system).

---

## 20+ Model Selection

### What It Is

Copilot CLI supports 20+ models across multiple providers (OpenAI, Anthropic, Google, xAI),
organized into three tiers: premium, standard, and fast/cheap.

### Why It Matters

Different tasks have different complexity requirements. Using an expensive model for
simple file searches wastes money; using a cheap model for architecture decisions
produces poor results. Model selection lets you optimize the cost-quality tradeoff
for every task.

### How to Use It

Override the default model for any agent with the `model` parameter:

```text
task(agent_type="explore", model="claude-haiku-4.5", prompt="Find all test files")
task(agent_type="general-purpose", model="claude-opus-5.5", prompt="Redesign auth")
```

### Reference Model Catalog

Tiers and one-line purposes below are this repository's suggested routing; the model IDs come from
the reference table.

| Model | Provider | Tier | Best For |
|-------|----------|------|----------|
| `claude-opus-5.5` | Anthropic | Premium | High-capability complex tasks, architecture, deep review |
| `claude-sonnet-5.5` | Anthropic | Standard | General-purpose coding (CLI default) |
| `gpt-6.1-sol` | OpenAI | Standard | Strong general reasoning (opt-in) |
| `gpt-6-astra` | OpenAI | Standard | General-purpose alternative (opt-in) |
| `gpt-5.3-codex` | OpenAI | Standard | Code-focused tasks |
| `gpt-6-luna` | OpenAI | Fast/Cheap | Fast general tasks (opt-in) |
| `claude-haiku-5.5` | Anthropic | Fast/Cheap | Fast, lightweight operations |
| `claude-haiku-4.5` | Anthropic | Fast/Cheap | Exploration, simple edits |
| `gemini-3.8-flash` | Google | Fast/Cheap | Fast Google Gemini responses |

This catalog mirrors the **Supported models** table in the official Copilot CLI command reference
(checked 2026-10-23), which highlights nine models with published IDs. GitHub's per-client model
table lists about 25 models as available in Copilot CLI — including xAI Grok and Kimi models —
so `/model` usually shows more than this catalog; take the exact ID from `/model` for those.
"Opt-in" means the model is recommended but is not the automatic default.
Pass `--model auto` (or choose Auto in `/model`) to let Copilot pick a model. Availability still
varies by plan, region, and organization policy, and GitHub retires models on a published
schedule — for example, `gpt-5-mini` and `gpt-5.4` retired on 2026-10-19 and
`claude-sonnet-4.6` / `claude-opus-4.6` on 2026-09-01. Re-check `/model` before pinning an ID
in an agent file or automation. A custom agent whose `model` cannot be honored **silently falls
back to the session model** instead of failing, so a retired pin does not raise an error —
use the `models:` priority list (or `modelPolicy: "required"` when a fallback is unacceptable).

### Example: Cost-Aware Routing

```text
Phase 1 — Explore (cheap):     claude-haiku-4.5      → $
Phase 2 — Plan (standard):     default model          → $$
Phase 3 — Implement (standard): claude-sonnet-5.5     → $$
Phase 4 — Review (standard):    claude-sonnet-5.5     → $$
Phase 5 — Arch review (premium): claude-opus-5.5      → $$$  (only if needed)
```

See [Multi-Model Strategy skill](../skills/copilot-exclusive/multi-model-strategy/SKILL.md).

---

## Turn-Level Rewind and Tool Timing

`/rewind` (alias `/undo`) opens a picker to roll the session back to an earlier user turn and can revert the file changes made since. The
v1.0.78 release notes document that it no longer requires a Git repository, offers conversation-only
or conversation-and-files rollback, and restores only files Copilot changed. A file is skipped when
its current contents no longer match what Copilot last wrote, protecting later user edits.

This tool is a turn-level recovery aid, not a replacement for version control. The release notes do
not define durable snapshot retention or complete behavior for renames, deletions, binaries, or
newline normalization; use commits for recoverable project history.

Timeline headers also show a live, right-aligned duration for tool calls that run for at least five
seconds. This is on by default in v1.0.78 and can be disabled with `/settings showToolDurations`.

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

**Shared workflow artifacts (keep these aligned across both tools):**

- `.github/copilot-instructions.md` — project instructions
- `AGENTS.md` — shared custom instructions (custom agents live in `.github/agents/`)
- `.mcp.json` — workspace MCP server configuration for Copilot CLI

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

```text
1. VS Code: Explore codebase with Copilot chat, understand the auth module
2. CLI:     "Implement OAuth2 login — plan mode" → approve plan
3. CLI:     Autopilot executes the plan across 8 files
4. VS Code: Review diffs in source control panel
5. VS Code: Set breakpoints, debug the new OAuth flow
6. CLI:     "Create PR with these changes, run code-review agent"
7. VS Code: Address review comments with inline Copilot
```

See [IDE Switching skill](../skills/copilot-exclusive/ide-switching/SKILL.md).

---

## Plan Mode Mastery

### What It Is

Plan Mode is a structured planning workflow where Copilot CLI produces a detailed
implementation plan, presents it for review in the terminal, and optionally transitions to
autopilot for execution.

### Why It Matters

For complex tasks, jumping straight to implementation often leads to wrong approaches,
wasted effort, and code that needs to be reverted. Plan Mode catches design mistakes
early and ensures alignment before any code is written.

### How to Use It

**Plan Mode workflow:**

```text
1. Request enters plan mode    → Copilot analyzes the task
2. Plan created (plan.md)      → Structured breakdown with todos
3. Plan presented in terminal    → You review and approve/modify
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

```text
> "Add comprehensive error handling to the API. Use plan mode."

Plan created:
  ✅ todo: error-types     — Define custom error classes
  ✅ todo: error-middleware — Create global error handler
  ✅ todo: route-errors     — Add try-catch to all routes (depends: error-types)
  ✅ todo: error-tests      — Add error handling tests (depends: error-middleware)
  ✅ todo: error-docs       — Update API documentation (depends: route-errors)

[Approve] [Approve + Autopilot] [Modify]
```

See [Plan Mode Mastery skill](../skills/copilot-exclusive/plan-mode-mastery/SKILL.md).

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

```text
> "Add input validation to all API endpoints. Autopilot."

Copilot autonomously:
1. Scans all route files for endpoints
2. Identifies input parameters for each
3. Adds validation using the project's validation library
4. Adds tests for validation edge cases
5. Runs existing tests to verify nothing broke
6. Reports completion with summary
```

See [Autopilot Patterns skill](../skills/copilot-exclusive/autopilot-patterns/SKILL.md).

---

## Local Sandbox and Settings

### What It Is

Since v1.0.93, command sandboxing is available to all users. The OS-level sandbox restricts
filesystem and network access for shell commands, local (stdio) MCP servers, and command hooks.
Settings that used to be edited by hand now have a non-interactive command, `copilot config`.

### Why It Matters

Autopilot and unattended runs are only as safe as their boundary. The sandbox moves that
boundary from "tool permissions" to the operating system, and `copilot config` makes the same
settings reproducible in CI and on managed machines.

### How to Use It

| Surface | What it does |
|---------|--------------|
| `/sandbox` (or `/sandbox config`) | Settings dialog — enable for this session or as the default for new sessions |
| `/sandbox enable session` · `/sandbox disable session` | Change only the current session; the saved default is untouched |
| `/sandbox status` · `/sandbox policy [COMMAND]` | Show whether the session is sandboxed, its path grants, network settings, and developer-tool access |
| `--sandbox` · `--no-sandbox` | Turn the sandbox on or off for one run without changing the saved setting (useful with `-p`) |
| `/add-dir PATH` | Also grants the sandbox access to that directory for the current session |
| `copilot sandbox ca …` | Manage the sandbox proxy CA outside a session (`create`, `trust`, `rotate`, `remove`, `status`) |
| `copilot config KEY [VALUE]` | Read or change a setting from the command line; `--list`, `--rm KEY`, `--repo` |

Behaviors worth knowing before you rely on it:

- **Ambient `GITHUB_TOKEN` is withheld** from sandboxed shells unless you configure it explicitly
  (v1.0.92).
- **Local network access is on by default**, so commands can reach `localhost` and
  private-network services (v1.0.100).
- An **enterprise policy can enforce the sandbox** as a floor; `--no-sandbox` is then overridden.
- Repository, user, and plugin **command** hooks run **inside** the sandbox; machine-wide policy
  hooks always run on the host.
- User settings are read only from `~/.copilot/settings.json`; user-setting keys left in
  `~/.copilot/config.json` are ignored (v1.0.93).

Path-specific instruction files in `.github/instructions/` are now applied automatically when the
agent reads or edits a matching file (v1.0.100), alongside `.github/copilot-instructions.md`.

### Example

```text
copilot --sandbox -p "Run the test suite and summarize failures"
copilot config --repo --list --json
```

See [The Security Guide](./the-security-guide.md) for how the sandbox fits with permissions and
hooks.

---

## Background Agents

### What It Is

**Background Delegation** hands off tasks to a cloud-based Copilot coding agent that
runs autonomously on GitHub. Your terminal is immediately freed. The agent works on a
branch on GitHub, and you review the result there as a diff or PR — not by polling from
the terminal.

### Why It Matters

Long-running tasks (large refactors, multi-file migrations, full test suite additions)
no longer block your workflow. Delegate with `&`, keep coding locally, and review the
agent's GitHub output when it's ready.

### How to Use It

Prefix any prompt with `&` (or use `/delegate [PROMPT]`) to hand off to the cloud agent:

```text
# Delegate to cloud Copilot coding agent — terminal is immediately free
& "Add pagination to the /api/users endpoint and write integration tests"

# The agent:
#   1. Commits current state to a new branch
#   2. Works autonomously on GitHub
#   3. Leaves the work on GitHub for diff review or PR creation

# → Review the branch diff or PR on GitHub for results
```

**`/resume` — continuing a cloud session locally:**

`/resume` brings a cloud agent session into your local CLI — it is not for polling
delegation results. Use it when you want to continue the conversation after reviewing
the GitHub result:

```text
# List recent sessions
/resume

# Bring a specific cloud session into the local CLI
/resume abc123

# Continue from where the cloud agent left off
> Refactor the pagination logic to use cursor-based pagination instead
```

### Example

```text
# Delegate a long-running task to the cloud agent
& "Migrate all REST endpoints to use the new auth middleware"

# Terminal is free — continue local work while the agent runs on GitHub
# ...coding a new feature locally...

# GitHub notifies you when the branch diff or PR is ready
# → Open GitHub to review changes, leave comments, or create/approve a PR

# Optionally: bring the session local to continue in the CLI
/resume abc123
> Update the migration guide to reflect these changes
```

See [Background Agent skill](../skills/copilot-exclusive/background-agent/SKILL.md).

---

## Fleet Execution

### What It Is

Fleet mode decomposes a task into mostly independent units and executes parallel-safe work
across multiple autonomous agents, each with its own context window.

### Why It Matters

Many development tasks are embarrassingly parallel — adding tests for 5 modules, updating
10 configuration files, reviewing 8 pull requests. Fleet mode provides 3-4x speedup on
these tasks with no manual coordination.

### How to Use It

**Task decomposition strategy:**

```text
1. Identify independent units first and make follow-up dependencies explicit
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
- Heavily sequential operations where each step depends on the previous one
- Tasks requiring shared state (use SQL + sequential instead)

> **Write-Scope Rule**: Before launching a fleet batch, verify that no two agents will write to the same file. Same file = must be serialized. If scope overlap is discovered mid-run, stop the later agent and requeue after the first completes.
>
> **Heartbeat Monitoring**: For long-running fleet batches, check agent status periodically — look for DONE, ERROR, STUCK (waiting for input), or STALLED (no progress). Do not retry indefinitely; surface the blocker after a bounded number of attempts.

### Example

```text
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

See [Fleet Parallel skill](../skills/copilot-exclusive/fleet-parallel/SKILL.md).

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

### /chronicle — Session History & Standup Reports

The `/chronicle` command leverages the session database to generate automatic summaries
of your work, productivity insights, and standup-ready reports:

```text
# What did I do today?
/chronicle standup

# Tips based on session patterns
/chronicle tips

# Reindex session history
/chronicle reindex
```

Use `/chronicle cost-tips` to compare local and cloud cost profiles based on session history.
Use `/limits predict` when you want the CLI to suggest a session AI-credit limit from comparable
past sessions; confirm the suggestion against current policy rather than embedding a fixed amount.

`/chronicle` reads from `~/.copilot/session-store.db`, which records prompts, responses,
tools used, and files modified across all sessions. No manual logging required.

See [Session Management skill](../skills/copilot-exclusive/session-management/SKILL.md).

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

```text
> "I fixed a similar caching bug last week. Find what I did."

Copilot searches session_store:
  Found session from 2024-01-15: "Fix Redis cache invalidation"
  Applied pattern: TTL-based invalidation with fallback to DB
  Files changed: src/cache/redis.ts, src/services/users.ts

> "Apply the same pattern to the payments service."
```

See [Cross-Session Memory skill](../skills/copilot-exclusive/cross-session-memory/SKILL.md).

---

## Multi-AI Orchestration

> ⚠️ **Community Pattern** — This is not a built-in native feature of GitHub Copilot CLI.
> It is a community-proposed workflow pattern that uses shell scripting, MCP, and pipelines
> to combine multiple AI tools. Copilot CLI serves as a convenient hub due to its GitHub
> integration and multi-model support.

### What It Is

Using Copilot CLI as a hub, you can orchestrate multiple AI coding tools —
Claude Code, Codex CLI, Cursor CLI, Antigravity CLI (`agy`), and any MCP-compatible tool — routing tasks to
whichever tool is best suited via shell scripting and MCP.

### Why It Matters

No single AI tool is best at everything. Claude excels at deep reasoning, Codex at
fast generation, Cursor CLI at repo-aware multi-file editing, Antigravity CLI (`agy`) at multimodal analysis, and Copilot at GitHub integration.
Orchestration lets you leverage all of them from a single interface.

### How to Use It

**Five cross-AI orchestration patterns (increasing complexity):**

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
| Cursor CLI | ⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| Antigravity CLI | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

### Example: Full Workflow Orchestration

```text
1. Copilot CLI: Gather requirements from GitHub issues
2. Claude Code: Design architecture (deep reasoning, 200K context)
3. Codex CLI:   Rapid prototype implementation (fast, sandboxed)
4. Antigravity CLI (`agy`): Analyze UI mockups and generate components
5. Copilot CLI: Run tests, create PR, request reviews
6. Claude Code: Deep code review of critical paths
7. Copilot CLI: Merge PR and close related issues
```

See the full [Orchestration Guide](../orchestration/README.md) and
[Orchestration Examples](../orchestration/examples/).

---

## Feature Summary Matrix

| Feature | Copilot CLI | Claude Code | Codex CLI | Cursor CLI | Antigravity CLI |
|---------|:-----------:|:-----------:|:---------:|:----------:|:----------:|
| GitHub Native | ✅ | ❌ | ❌ | ❌ | ❌ |
| 20+ Models | ✅ | ❌ | ❌ | ❌ | ❌ |
| IDE Synergy | ✅ | ❌ | ❌ | ✅ | ❌ |
| Plan Mode | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Autopilot | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| Background Agents | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fleet Execution | ✅ | ❌ | ❌ | ❌ | ❌ |
| Session SQL DB | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cross-Session Memory | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Multi-AI Orchestration _(community pattern)_ | ⚠️ | ❌ | ❌ | ❌ | ❌ |

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
