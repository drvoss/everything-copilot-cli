# GitHub Copilot Instructions

> Concise project instructions for GitHub Copilot.
> For the full guide, see [`COPILOT-INSTRUCTIONS.md`](../COPILOT-INSTRUCTIONS.md) in the repository root.

---

## Project Context

This is **everything-copilot-cli** — a reference repository defining agents, skills, rules,
orchestration patterns, and MCP configurations for GitHub Copilot CLI.
Content is Markdown and JSON configuration, not application code.

## Essential Rules

1. **Use YAML frontmatter** in all agent, skill, and rule files
2. **Use kebab-case** for all filenames (e.g., `build-error-resolver.md`)
3. **Use conventional commits** (`feat:`, `fix:`, `docs:`, `chore:`)
4. **Include Co-authored-by trailer** in commits when Copilot assists
5. **Run validation before committing**: `npm run validate && npm run lint:md && npm test`
6. **Don't mix concerns** — one agent/skill/rule per file, one topic per PR

## Directory Structure

| Directory | Contents |
|-----------|----------|
| `agents/` | Agent definitions with persona, tools, model, behavior |
| `skills/` | Composable skill modules by domain (`development/`, `security/`, `testing/`, `documentation/`, `copilot-exclusive/`) |
| `rules/common/` | Universal behavioral rules |
| `rules/languages/` | Language-specific coding standards |
| `orchestration/` | Multi-agent coordination (`patterns/`, `configs/`, `examples/`, `skills/`) |
| `contexts/` | Execution context definitions |
| `mcp-configs/` | MCP server configurations |
| `examples/` | Complete example projects (`nextjs-app/`, `python-api/`, `dotnet-webapp/`, `monorepo/`) |

## Agent Type Selection

Use the right Copilot agent type for each task:

| Task Type | Agent Type | Examples |
|-----------|-----------|----------|
| Understanding code/configs | `explore` | "What agents are defined?", "How does orchestration work?" |
| Running builds/tests/lints | `task` | "Validate all configs", "Run the test suite" |
| Complex multi-step changes | `general-purpose` | "Add a new agent with skills and tests", "Refactor rule structure" |
| Reviewing changes | `code-review` | "Review this PR", "Check for issues in staged changes" |
| Parallel independent work | Fleet mode | "Create example configs for all 4 project types" |

## File Conventions

### Agent files (`agents/*.md`)

Required frontmatter: `name`, `description`, `agent_type`, `model`, `tools`, `escalation`

### Skill files (`skills/<category>/*.md`)

Required frontmatter: `name`, `category`, `triggers`, `requires_tools`
Must include a "When to Use" section.

### Rule files (`rules/**/*.md`)

Required frontmatter: `name`, `scope`, `severity`
Language-specific rules also need: `language`
Must include ✅ Correct and ❌ Incorrect examples.

### Orchestration patterns (`orchestration/patterns/*.md`)

Required frontmatter: `name`, `type`, `agents`
Types: `pipeline`, `fan-out`, `review-chain`, `iterative`

## Multi-AI Delegation

- **Keep in Copilot CLI**: GitHub integration, PR/Issue management, MCP workflows, orchestration
- **Delegate to Claude Code**: Deep reasoning, architecture analysis, large context (200K tokens)
- **Delegate to Codex**: Fast code generation, boilerplate, transformations

## Validation

```bash
npm run validate   # Check configs against schemas
npm run lint:md    # Lint all Markdown
npm test           # Run test suite
```
