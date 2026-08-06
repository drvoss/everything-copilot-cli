# Migration from Claude Code to Copilot CLI

> A practical, step-by-step guide for teams and developers migrating from Claude Code
> to GitHub Copilot CLI. Covers concept mapping, configuration migration, and what
> you gain and lose in the transition.

---

## Concept Mapping

If you're familiar with Claude Code, this table maps every major concept to its
Copilot CLI equivalent:

| Claude Code | Copilot CLI | Notes |
|------------|------------|-------|
| `CLAUDE.md` | `.github/copilot-instructions.md` | Runtime project instructions; optionally keep a fuller `COPILOT-INSTRUCTIONS.md` reference guide in the repo root |
| `AGENTS.md` | `AGENTS.md` + skill files | Direct mapping; Copilot also uses `skills/` directory |
| `/agent-name` (slash command) | `agent_type` parameter in task tool | Architecture differs — Copilot uses 4 agent types |
| Hooks (pre-tool, post-tool) | Native Copilot hooks (`preToolUse`/`postToolUse`/etc.) | Direct equivalent as of CLI v1.0.72+ — see [hooks guide](./hooks-to-github-actions.md); Git Hooks/Actions/prompt guards remain useful for CI-level, team-wide enforcement |
| Skills (`.claude/skills/`) | Skills (`skills/` directory) | Nearly identical format! Markdown + YAML frontmatter |
| Slash commands (`/help`, `/clear`) | Slash commands (`/help`, `/clear`) | Direct mapping for most commands |
| MCP config (`.mcp.json`) | workspace `.mcp.json` / user `~/.copilot/mcp-config.json` | Similar file name, different schema and optional user-level config |
| `/compact` | `/clear` | Similar purpose — manage context window |
| Git worktrees (parallel) | Fleet mode | Better in Copilot — native fleet orchestration |
| `--dangerously-skip-permissions` | Autopilot mode | Better in Copilot — safer, more structured |
| `CLAUDE.md` hierarchy | `.github/copilot-instructions.md` | Recommended migration target for project runtime instructions; Copilot can also read other instruction files such as `CLAUDE.md` and `AGENTS.md` |
| Context files | `contexts/` directory | Reusable context definitions |
| Todo tracking (file-based) | SQL `todos` table | Better in Copilot — queryable, dependency-aware |
| Session memory (hooks) | `session_store` database | Both experimental, different approaches |
| Single model (Claude) | 20+ models (GPT, Claude, Gemini, Grok) | Major upgrade in model flexibility |

---

## Step-by-Step Migration

### Step 1: Migrate Instructions File

**From:** `CLAUDE.md` (project root)
**To:** `.github/copilot-instructions.md`

```powershell
# Create the target directory if it doesn't exist
New-Item -ItemType Directory -Force -Path .github

# Copy as starting point
Copy-Item CLAUDE.md .github/copilot-instructions.md
```

**Adapt the content:**

| Claude Code Syntax | Copilot CLI Equivalent |
|-------------------|----------------------|
| "You are Claude..." | Remove — Copilot has its own identity |
| Tool references (`Bash`, `Read`) | Update to Copilot tools (`powershell`, `view`) |
| `ultrathink` / `think harder` | Use model override: `model: "claude-opus-4.6"` |
| Hook references | Replace with startup script references |
| Claude-specific behaviors | Generalize for multi-model compatibility |

**Example transformation:**

```markdown
<!-- CLAUDE.md (before) -->
When running tests, use the Bash tool with `pytest`.
Think deeply about architecture decisions.

<!-- copilot-instructions.md (after) -->
When running tests, use powershell with `pytest` or the project's test command.
For architecture decisions, use a premium model (claude-opus-4.6 or gpt-5.4).
```

### Step 2: Port Skills

Claude Code skills and Copilot CLI skills use **nearly identical formats** — Markdown
files with YAML frontmatter. Migration is mostly copy + adjust.

**From:** `.claude/skills/*.md`
**To:** `.github/skills/<skill-name>/SKILL.md` (project-level install)

```powershell
# Copy skills into Copilot's project-level skills directory
New-Item -ItemType Directory -Force ".github/skills/tdd-workflow" | Out-Null
Copy-Item .claude/skills/tdd-workflow.md .github/skills/tdd-workflow/SKILL.md

New-Item -ItemType Directory -Force ".github/skills/security-scan" | Out-Null
Copy-Item .claude/skills/security-scan.md .github/skills/security-scan/SKILL.md
```

**Adjust frontmatter:**

```yaml
# Claude Code skill frontmatter
---
name: tdd-workflow
description: Test-driven development cycle
---

# Copilot CLI skill frontmatter
---
name: tdd-workflow
description: >
  Use when you need to write tests before implementation — run the red/green/refactor cycle.
metadata:
  category: development
  agent_type: general-purpose
keep-coding-instructions: true
---
```

If you later contribute a migrated skill back to this repository's shared library, the
source path format here is `skills/<category>/<skill-name>/SKILL.md`.

**Adjust tool references in skill body:**

| Claude Code | Copilot CLI |
|------------|------------|
| `Bash("npm test")` | `powershell: npm test` |
| `Read("file.ts")` | `view: file.ts` |
| `Write("file.ts", content)` | `create / edit: file.ts` |
| `TodoWrite(todos)` | `SQL: INSERT INTO todos ...` |
| `Glob("**/*.ts")` | `glob: **/*.ts` |
| `Grep("pattern", "dir")` | `grep: pattern (in dir)` |

### Step 3: Convert MCP Configurations

**From:** `.mcp.json` (Claude Code format)

```json
{
  "mcpServers": {
    "github": {
      "command": "github-mcp-server",
      "args": ["--tools=all"],
      "env": { "GITHUB_TOKEN": "..." }
    }
  }
}
```

**To:** workspace `.mcp.json` (Copilot CLI format)

```json
{
  "servers": {
    "github": {
      "command": "github-mcp-server",
      "args": ["--tools=all"],
      "env": { "GITHUB_TOKEN": "${env:GITHUB_TOKEN}" }
    }
  }
}
```

**Key differences:**

- Root key changes from `mcpServers` to `servers`
- Environment variables use `${env:VAR_NAME}` syntax
- Root-level workspace config stays `.mcp.json`; user-specific config can move to `~/.copilot/mcp-config.json`

Claude Code v2.1.117 notes that **agent** frontmatter `mcpServers` can load during `--agent`
main-thread runs. That is separate from repository-specific plugin or skill frontmatter rules,
which some upstream repos treat differently. In either case, Copilot CLI expects MCP
configuration in workspace `.mcp.json`, user `~/.copilot/mcp-config.json`, or plugin-provided MCP
servers.

**Note:** Copilot CLI already includes GitHub MCP tools natively — you may not need a
separate GitHub MCP server at all.

### Step 4: Map Agent Invocations

Claude Code uses named agents (16 types); Copilot CLI uses 4 agent types with model
overrides:

| Claude Code Agent | Copilot CLI Equivalent |
|------------------|----------------------|
| Codebase exploration | `agent_type: "explore"` |
| Test runner | `agent_type: "task"` |
| Code implementer | `agent_type: "general-purpose"` |
| Code reviewer | `agent_type: "code-review"` |
| Security scanner | `agent_type: "code-review"` + security prompt |
| Documentation writer | `agent_type: "general-purpose"` + doc prompt |
| Architect | `agent_type: "general-purpose"` + model: `"claude-opus-4.6"` |

**For tasks that need Claude Code's deeper specialization,** use Copilot CLI's
orchestration to delegate to Claude Code:

```text
# In Copilot CLI, delegate complex analysis to Claude Code
See orchestration/skills/delegate-to-claude.md
```

### Step 5: Complement Native Hooks with Git Hooks and GitHub Actions

Claude Code hooks (pre-tool, post-tool, notification, stop) are **AI session lifecycle
callbacks** — they fire inside the AI session when the model calls a tool.

> **⚠️ Updated 2026-07-20:** Copilot CLI now has its own native in-session hook system
> (`sessionStart`, `sessionEnd`, `userPromptSubmitted`, `preToolUse`, `postToolUse`, `agentStop`,
> `subagentStop`, `errorOccurred` — JSON files in `.github/hooks/*.json` or
> `~/.copilot/hooks/*.json`). `preToolUse` can allow/deny a tool call directly, which is a
> first-party equivalent to Claude Code's `PreToolUse`. **Prefer the native hook first** for
> anything that must react inside the session; use the Git/GitHub Actions/prompt-guard
> alternatives below when you want CI-level, team-wide enforcement in addition to the local
> hook, or when the native event exists but cannot do what you need (for example `preCompact`
> is notification-only and cannot block compaction).

| Claude Code Hook Purpose | Copilot Native Hook | Copilot Alternative (if no native match, or for CI-wide enforcement) |
|-------------------------|---------------------|---------|
| Lint/validate before changes | `preToolUse` (allow/deny) | Git Pre-commit Hook (Husky) |
| Test/format after changes | `postToolUse` | Git Post-commit Hook |
| PR gate before merge | *(none — CI-level concern)* | GitHub Actions workflow |
| Notify on session complete | `agentStop` | GitHub Actions (push/merge event) |
| Guard what AI can modify | `preToolUse` (deny) | Prompt-level instructions in `copilot-instructions.md` |

**Example: Native `preToolUse` hook (direct replacement for `PreToolUse` validation)**

Save this as `.github/hooks/guard-auth-config.json`:

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "./scripts/guard-auth-config.sh",
        "powershell": "./scripts/guard-auth-config.ps1",
        "timeoutSec": 15
      }
    ]
  }
}
```

The script inspects the pending tool call (received as JSON) and prints a single decision object
to stdout, e.g.
`{"permissionDecision": "deny", "permissionDecisionReason": "protected path"}`, to block it
(or `{"permissionDecision": "allow"}`
to let it through). Note that command `preToolUse` hooks are fail-closed on script errors, but a
**timed-out** hook always fails open — the call falls through to the normal permission flow.

**Example: Pre-commit Hook (Git-level alternative, for team-wide enforcement outside the session)**

```powershell
# Install Husky for Node.js projects
npm install --save-dev husky
npx husky init

# .husky/pre-commit
@"
npm run lint && npm run test -- --passWithNoTests
"@ | Set-Content .husky/pre-commit
```

**Example: Prompt Guard (lightweight alternative when a hook script is overkill)**

Add to `.github/copilot-instructions.md`:

```markdown
## Before Making Changes
1. Run `npm run lint` — fix any existing errors before adding new code
2. Never modify `auth/` or `config/` files without first reading them completely
```

For a comprehensive mapping of every Claude Code hook to its native Copilot hook or alternative,
with more examples, see:
→ **[guides/hooks-to-github-actions.md](./hooks-to-github-actions.md)**

## Slash Command to Copilot CLI Mapping

If you're coming from `awesome-claude-code` slash commands, here's how each command maps to Copilot CLI skills and workflows:

| awesome-claude-code Command | Copilot CLI Equivalent | Location |
|----------------------------|------------------------|----------|
| `/commit` | `commit-workflow` skill | `skills/workflow/commit-workflow/` |
| `/pr-review` | `pr-multi-perspective-review` skill | `skills/development/pr-multi-perspective-review/` |
| `/fix-github-issue` | `fix-github-issue` skill | `skills/development/fix-github-issue/` |
| `/create-prd` | `create-prd` skill | `skills/product/create-prd/` |
| `/add-to-changelog` | `add-to-changelog` skill | `skills/documentation/add-to-changelog/` |
| `/release` | `release` skill | `skills/workflow/release/` |
| `/context-prime` | `context-prime` skill | `skills/copilot-exclusive/context-prime/` |
| `/create-pr` | `github-pr-workflow` skill or `gh pr create` + commit-workflow | `skills/copilot-exclusive/github-pr-workflow/` or native `gh` CLI |
| `/update-docs` | `doc-update` skill | `skills/documentation/doc-update/` |
| `/optimize` | `performance-optimization` skill or Plan Mode | `skills/development/performance-optimization/` |
| `/clean` | `refactor-clean` skill or `refactor-cleaner` agent | `skills/development/refactor-clean/` or `agents/refactor-cleaner.md` |
| `/todo` | SQL `todos` table | `sql` tool |
| `/evaluate-repository` | `evaluate-repository` skill | `skills/security/evaluate-repository/` |
| CLAUDE.md | `.github/copilot-instructions.md` | See Step 1 above |
| Hooks (pre/post-tool) | Native Copilot hooks + Git Hooks / GitHub Actions | Native hooks handle the session; see Step 5 for team-wide complements |

### Installing a Skill

Copilot CLI skills are Markdown files — install by copying to your project:

```powershell
# From everything-copilot-cli repository
$skill = "commit-workflow"
$category = "workflow"
New-Item -ItemType Directory -Force ".github/skills/$skill" | Out-Null
Copy-Item "skills/$category/$skill/SKILL.md" ".github/skills/$skill/SKILL.md"
```

Or reference the skill directly in a Copilot prompt:

```text
> Use the commit-workflow skill from everything-copilot-cli to commit these changes
> with a conventional commit message and appropriate emoji.
```

---

## Using awesome-claude-code Resources with Copilot CLI

The `awesome-claude-code` repository contains CLAUDE.md examples, slash commands, and workflows that can be adapted for Copilot CLI:

### Use CLAUDE.md Files as Inspiration

The `resources/claude.md-files/` directory in awesome-claude-code contains 20+ real-world `CLAUDE.md` files from production projects. These map directly to `.github/copilot-instructions.md`:

```powershell
# Clone awesome-claude-code for reference
git clone https://github.com/hesreallyhim/awesome-claude-code.git .ref/awesome-claude-code

# View available CLAUDE.md examples
Get-ChildItem .ref/awesome-claude-code/resources/claude.md-files/

# Adapt one for your project (remove Claude-specific syntax)
# Key adaptations:
# - Remove "You are Claude..." identity statements
# - Replace Bash/Read/Write tool references with powershell/view/edit
# - Generalize model hints (ultrathink → model: "claude-opus-4.6")
```

### Adapt Slash Commands as Skills

awesome-claude-code slash commands (`.claude/commands/*.md`) are nearly identical to Copilot CLI SKILL.md format. To adapt:

```powershell
# 1. Copy the command file
Copy-Item .ref/awesome-claude-code/.claude/commands/commit.md skills/workflow/commit-workflow/SKILL.md

# 2. Add required frontmatter if missing
# 3. Update tool references (Bash → powershell, Read → view)
# 4. Generalize Claude-specific prompting (e.g., remove "ultrathink")
```

### Running Both Tools Together

For teams running both Claude Code and Copilot CLI simultaneously, use Copilot CLI as the hub:

```text
Copilot CLI (GitHub integration, orchestration)
    ├── delegates deep analysis → Claude Code (200K context)
    ├── delegates fast codegen  → Codex CLI
    └── delegates visual review → Antigravity CLI (`agy`)
```

See [Using Both Together](#using-both-together) and [orchestration patterns](../orchestration/README.md).

---

Migrating to Copilot CLI unlocks 11 capabilities not available in Claude Code:

| # | Capability | Impact |
|---|-----------|--------|
| 1 | **GitHub Native Integration** | No MCP setup for PRs, issues, Actions, code search |
| 2 | **20+ Model Selection** | Choose the best model per task — cost optimization |
| 3 | **VS Code Integration** | Share context between IDE and terminal |
| 4 | **Fleet Parallel Execution** | 3-4x speedup on parallelizable work |
| 5 | **Background Agents** | Async agents with completion notifications |
| 6 | **SQL Session Database** | Structured state that survives compaction |
| 7 | **Plan Mode** | Structured text planning with autopilot transition |
| 8 | **Autopilot Mode** | Safer autonomous execution *(Experimental)* |
| 9 | **Multi-AI Orchestration** | Use Claude Code, Codex, Hermes, Antigravity CLI (`agy`) as workers |
| 10 | **Cross-Session Search** | FTS5 search across previous sessions |
| 11 | **LSP Support** | Language-aware code navigation |

---

## What You Lose

Be honest about what Claude Code does better:

| # | Capability | Workaround in Copilot CLI |
|---|-----------|--------------------------|
| 1 | **16 Specialized Agents** | Use 4 types + model overrides + custom prompts |
| 2 | **109 Curated Skills** | 109 curated skills in this repo; port your custom skills |
| 3 | **Full Lifecycle Hooks** | Use Copilot's 14 native events first; complement them with startup scripts + SQL logging |
| 4 | **AgentShield Security** | Use security-reviewer agent + security skills |
| 5 | **Claude-Optimized Integration** | Use Claude models via model override |
| 6 | **Mature Community Configs** | This repo provides comprehensive configs |
| 7 | **Deep Context (200K tokens)** | Delegate to Claude Code via orchestration |

**The key insight:** Most of what you "lose" can be recovered through Copilot CLI's
orchestration — you can still invoke Claude Code for tasks where it excels.

---

## Using Both Together

The recommended approach for teams in transition: **use both, with Copilot CLI as hub.**

```text
┌─────────────────────────────────────────────────────┐
│                  Copilot CLI (Hub)                    │
│                                                      │
│  GitHub workflows ──→ Copilot handles natively       │
│  Planning/todos   ──→ SQL database + plan mode       │
│  Parallel work    ──→ Fleet mode                     │
│  Deep analysis    ──→ Delegate to Claude Code        │
│  Fast generation  ──→ Delegate to Codex CLI          │
│  Visual analysis  ──→ Delegate to Antigravity CLI (`agy`) │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Setting Up the Bridge

1. Configure Claude Code as an MCP server:

```json
// .mcp.json
{
  "servers": {
    "claude-code": {
      "command": "claude",
      "args": ["--mcp-server"],
      "env": {
        "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

1. Use orchestration patterns to delegate:

```text
"Delegate architecture review to Claude Code using the
 delegate-to-claude skill, then synthesize results here."
```

See [Claude MCP Bridge config](../orchestration/configs/claude-mcp-bridge.json) and
[Delegate to Claude skill](../orchestration/skills/delegate-to-claude.md).

---

## Migrating from Other AI CLI Tools

### Hermes

[Hermes](https://github.com/NousResearch/Hermes) is an open-source AI CLI that uses instruction-following models locally. Migrating from Hermes to Copilot CLI:

| Hermes concept | Copilot CLI equivalent |
|---------------|----------------------|
| Instruction files (`.hermes/`) | `.github/copilot-instructions.md` |
| Tool plugins (shell scripts) | MCP servers (`mcp-configs/`) |
| Local model inference | `model:` override (use `claude-haiku-4.5` for local-speed workflows) |
| Task files | SQL `todos` table |

**Key difference:** Hermes is local-first with no GitHub integration. Copilot CLI is GitHub-native. Skills port without changes; instruction files need light adaptation (remove Hermes-specific syntax).

### Adapting Harness Files from Hook-Based Tools

Claude Code harnesses often rely on session lifecycle hooks (`PreToolUse`, `PostToolUse`, `Stop`).
Copilot CLI now has native equivalents for these three (`preToolUse`, `postToolUse`, `agentStop` —
see [Step 5](#step-5-complement-native-hooks-with-git-hooks-and-github-actions) above and
[`hooks-to-github-actions.md`](./hooks-to-github-actions.md)), so a harness built around them can
often port as native Copilot hook JSON directly. For the remaining pieces that don't have a
native hook event (or where you'd rather keep logic in-repo without a hook script), fall back to:

1. **Replace non-hook triggers with SQL state transitions** — track workflow state explicitly in the session database rather than relying on event callbacks, for events with no native hook
2. **`PreToolUse` validation** — use a native `preToolUse` hook (preferred) or prompt-level guards in `copilot-instructions.md` as a lighter-weight fallback
3. **`Stop` cleanup** — use a native `agentStop` hook (preferred), or final SQL queries/post-task checklists in skill files
4. **`SubagentStop` aggregation** — use a native `subagentStop` hook (preferred), or `read_agent` polling after `task(mode: "background")` calls

Example: a harness that ran lint on every file save (PreToolUse) becomes either a native
`preToolUse` hook script, or — if you'd rather avoid a hook script — a prompt-level guard:

```markdown
<!-- In copilot-instructions.md -->
After editing any source file, run `npm run lint -- <file>` before proceeding to the next step.
```

### Diagnostic Tools for Orphaned Configs

When migrating from any Claude Code / Hermes setup, use **[claude-rules-doctor](https://github.com/gruns/claude-rules-doctor)** to detect orphaned or contradictory config files:

```powershell
# Scan for orphaned .claude/, .hermes/, or CLAUDE.md files that may conflict
npx claude-rules-doctor scan .

# Common findings:
# - Multiple CLAUDE.md at different directory levels (unexpected hierarchy)
# - .claude/commands/ files with no corresponding skill equivalents
# - Rules that reference tools no longer installed
```

> **Note:** claude-rules-doctor is a community diagnostic tool. Run in read-only mode first to review findings before taking action.

---

## Migration Script Reference

The repository includes a migration helper script:

```powershell
# Run migration against the current directory
node scripts/migrate-from-claude.js

# Run migration against a specific project
node scripts/migrate-from-claude.js C:\path\to\your-project
```

Pass the target project directory as the first argument. If omitted, the script uses the
current working directory.

The script handles:

- Copying and transforming `CLAUDE.md` → `.github/copilot-instructions.md`
- Reviewing `.claude/settings.json` and hooks for manual follow-up
- Copying markdown skills into `.github/skills/<skill-name>/SKILL.md`
- Generating a migration report

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Copy and adapt `CLAUDE.md` → `.github/copilot-instructions.md`
- [ ] Port custom skills to `.github/skills/<skill-name>/SKILL.md` with updated frontmatter
- [ ] Convert MCP configs to workspace `.mcp.json` or user `~/.copilot/mcp-config.json`
- [ ] Map agent invocations to Copilot CLI's 4 agent types
- [ ] Port hooks to native Copilot hooks (`.github/hooks/*.json`), falling back to Git Pre-commit Hooks/GitHub Actions/Prompt Guards only where there's no native event (see [hooks guide](./hooks-to-github-actions.md))
- [ ] Set up Claude Code as MCP bridge (if keeping both tools)
- [ ] Test key workflows (build, test, PR creation, code review)
- [ ] Train team on new features (fleet mode, plan mode, SQL database)
- [ ] Update CI/CD pipelines to use Copilot CLI commands
- [ ] Document runtime project conventions in `.github/copilot-instructions.md`
- [ ] Optionally maintain a fuller `COPILOT-INSTRUCTIONS.md` reference guide in the repo root

---

## Further Reading

- [Copilot vs Claude Code Comparison](copilot-vs-claude-code.md) — Full feature comparison
- [Copilot Exclusive Features](copilot-exclusive-features.md) — Features unique to Copilot CLI
- [The Longform Guide](the-longform-guide.md) — Deep-dive into all Copilot CLI features
- [Orchestration Patterns](../orchestration/README.md) — Multi-AI coordination
