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
| `CLAUDE.md` | `.github/copilot-instructions.md` | Same purpose — project-level AI instructions |
| `AGENTS.md` | `AGENTS.md` + skill files | Direct mapping; Copilot also uses `skills/` directory |
| `/agent-name` (slash command) | `agent_type` parameter in task tool | Architecture differs — Copilot uses 4 agent types |
| Hooks (pre-tool, post-tool) | Startup hooks + lifecycle | Partial mapping — Copilot has fewer hook points |
| Skills (`.claude/skills/`) | Skills (`skills/` directory) | Nearly identical format! Markdown + YAML frontmatter |
| Slash commands (`/help`, `/clear`) | Slash commands (`/help`, `/clear`) | Direct mapping for most commands |
| MCP config (`.mcp.json`) | `devcontainer.json` / `.vscode/mcp.json` | Format change, same concept |
| `/compact` | `/clear` | Similar purpose — manage context window |
| Git worktrees (parallel) | Fleet mode | Better in Copilot — native fleet orchestration |
| `--dangerously-skip-permissions` | Autopilot mode | Better in Copilot — safer, more structured |
| `CLAUDE.md` hierarchy | `.github/copilot-instructions.md` | Copilot reads from `.github/` directory |
| Context files | `contexts/` directory | Reusable context definitions |
| Todo tracking (file-based) | SQL `todos` table | Better in Copilot — queryable, dependency-aware |
| Session memory (hooks) | `session_store` database | Both experimental, different approaches |
| Single model (Claude) | 18 models (GPT, Claude, Gemini) | Major upgrade in model flexibility |

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
**To:** `skills/<category>/*.md`

```powershell
# Copy skills to appropriate category directories
Copy-Item .claude/skills/tdd-workflow.md skills/development/tdd-workflow.md
Copy-Item .claude/skills/security-scan.md skills/security/security-scan.md
```

**Adjust frontmatter:**

```yaml
# Claude Code skill frontmatter
---
name: tdd-workflow
description: Test-driven development cycle
---

# Copilot CLI skill frontmatter (add category + tools)
---
name: tdd-workflow
description: Test-driven development cycle
category: development
requires_tools:
  - powershell
  - edit
  - view
---
```

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

**To:** `.vscode/mcp.json` (Copilot CLI format)

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
- File location changes from `.mcp.json` to `.vscode/mcp.json` or `devcontainer.json`

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

```
# In Copilot CLI, delegate complex analysis to Claude Code
See orchestration/skills/delegate-to-claude.md
```

### Step 5: Replace Hooks with Startup Scripts

Claude Code hooks are lifecycle callbacks (pre-tool, post-tool, notification).
Copilot CLI handles this differently:

**Claude Code hooks:**
```json
{
  "hooks": {
    "pre-tool": ["validate-safety.sh"],
    "post-tool": ["log-action.sh"],
    "notification": ["slack-notify.sh"]
  }
}
```

**Copilot CLI equivalent:**
- **Pre-session setup:** Use startup scripts or context files
- **Tool validation:** Handled by Copilot's built-in safety model
- **Post-action logging:** Use the session SQL database
- **Notifications:** Use background agent completion notifications

```sql
-- Track actions in SQL instead of hook-based logging
CREATE TABLE action_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    tool TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    result TEXT
);
```

**Note:** This is an area where Claude Code currently has more flexibility.
See [What You Lose](#what-you-lose) below.

---

## What You Gain

Migrating to Copilot CLI unlocks 11 capabilities not available in Claude Code:

| # | Capability | Impact |
|---|-----------|--------|
| 1 | **GitHub Native Integration** | No MCP setup for PRs, issues, Actions, code search |
| 2 | **18 Model Selection** | Choose the best model per task — cost optimization |
| 3 | **VS Code Integration** | Share context between IDE and terminal |
| 4 | **Fleet Parallel Execution** | 3-4x speedup on parallelizable work |
| 5 | **Background Agents** | Async agents with completion notifications |
| 6 | **SQL Session Database** | Structured state that survives compaction |
| 7 | **Plan Mode UI** | Visual approval with autopilot transition |
| 8 | **Autopilot Mode** | Safer autonomous execution |
| 9 | **Multi-AI Orchestration** | Use Claude Code, Codex, Gemini as workers |
| 10 | **Cross-Session Search** | FTS5 search across previous sessions |
| 11 | **LSP Support** | Language-aware code navigation |

---

## What You Lose

Be honest about what Claude Code does better:

| # | Capability | Workaround in Copilot CLI |
|---|-----------|--------------------------|
| 1 | **16 Specialized Agents** | Use 4 types + model overrides + custom prompts |
| 2 | **65+ Battle-Tested Skills** | Growing library (~23); port your custom skills |
| 3 | **Full Lifecycle Hooks** | Use startup scripts + SQL logging |
| 4 | **AgentShield Security** | Use security-reviewer agent + security skills |
| 5 | **Claude-Optimized Integration** | Use Claude models via model override |
| 6 | **Mature Community Configs** | This repo provides comprehensive configs |
| 7 | **Deep Context (200K tokens)** | Delegate to Claude Code via orchestration |

**The key insight:** Most of what you "lose" can be recovered through Copilot CLI's
orchestration — you can still invoke Claude Code for tasks where it excels.

---

## Using Both Together

The recommended approach for teams in transition: **use both, with Copilot CLI as hub.**

```
┌─────────────────────────────────────────────────────┐
│                  Copilot CLI (Hub)                    │
│                                                      │
│  GitHub workflows ──→ Copilot handles natively       │
│  Planning/todos   ──→ SQL database + plan mode       │
│  Parallel work    ──→ Fleet mode                     │
│  Deep analysis    ──→ Delegate to Claude Code        │
│  Fast generation  ──→ Delegate to Codex CLI          │
│  Visual analysis  ──→ Delegate to Gemini CLI         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Setting Up the Bridge

1. Configure Claude Code as an MCP server:

```json
// .vscode/mcp.json
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

2. Use orchestration patterns to delegate:

```
"Delegate architecture review to Claude Code using the
 delegate-to-claude skill, then synthesize results here."
```

See [Claude MCP Bridge config](../orchestration/configs/claude-mcp-bridge.json) and
[Delegate to Claude skill](../orchestration/skills/delegate-to-claude.md).

---

## Migration Script Reference

The repository includes a migration helper script:

```powershell
# Validate migration readiness
node scripts/migrate-from-claude.js --check

# Perform migration (creates Copilot CLI configs from Claude Code configs)
node scripts/migrate-from-claude.js --migrate

# Verify migration
node scripts/migrate-from-claude.js --verify
```

The script handles:
- Copying and transforming `CLAUDE.md` → `.github/copilot-instructions.md`
- Converting `.mcp.json` → `.vscode/mcp.json`
- Porting skills with category detection
- Generating a migration report

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Copy and adapt `CLAUDE.md` → `.github/copilot-instructions.md`
- [ ] Port custom skills to `skills/<category>/` with updated frontmatter
- [ ] Convert MCP configs to `.vscode/mcp.json` or `devcontainer.json`
- [ ] Map agent invocations to Copilot CLI's 4 agent types
- [ ] Replace hooks with startup scripts and SQL logging
- [ ] Set up Claude Code as MCP bridge (if keeping both tools)
- [ ] Test key workflows (build, test, PR creation, code review)
- [ ] Train team on new features (fleet mode, plan mode, SQL database)
- [ ] Update CI/CD pipelines to use Copilot CLI commands
- [ ] Document team-specific conventions in `COPILOT-INSTRUCTIONS.md`

---

## Further Reading

- [Copilot vs Claude Code Comparison](copilot-vs-claude-code.md) — Full feature comparison
- [Copilot Exclusive Features](copilot-exclusive-features.md) — Features unique to Copilot CLI
- [The Longform Guide](the-longform-guide.md) — Deep-dive into all Copilot CLI features
- [Orchestration Patterns](../orchestration/README.md) — Multi-AI coordination
