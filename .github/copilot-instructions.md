# GitHub Copilot Instructions

> Concise runtime instructions for GitHub Copilot.
> For the fuller human-facing reference guide, see [`COPILOT-INSTRUCTIONS.md`](../COPILOT-INSTRUCTIONS.md) in the repository root.

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
| `skills/` | Source skill library. Each skill lives at `skills/<category>/<skill-name>/SKILL.md` |
| `skills/copilot-exclusive/` | Copilot-only capabilities such as plan mode, fleet, background agents, and session memory |
| `skills/development/`, `skills/workflow/`, `skills/security/`, `skills/testing/`, `skills/documentation/`, `skills/product/`, `skills/content/` | Portable domain skills grouped by category |
| `rules/common/` | Universal behavioral rules |
| `rules/languages/` | Language-specific coding standards |
| `rules/frameworks/` | Framework-specific guidance |
| `orchestration/` | Multi-agent coordination (`patterns/`, `configs/`, `examples/`, `skills/`, `templates/`) |
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

Required frontmatter: `name`, `description`, `agent_type`
Recommended frontmatter: `model`, `tools`, `escalation`

### Skill files (`skills/<category>/<skill-name>/SKILL.md`)

Required frontmatter: `name`, `description`, `metadata.category`
Recommended frontmatter: `metadata.agent_type`
Optional frontmatter: `keep-coding-instructions: true`, `disable-model-invocation: true`
Must include a "When to Use" section.

### Rule files (`rules/**/*.md`)

Current validator requirement: non-empty Markdown content.
Repository convention: keep rules concise, actionable, and include clear ✅ Correct / ❌ Incorrect examples when relevant.

### Orchestration patterns (`orchestration/patterns/*.md`)

Current repository convention: document the pattern, setup, examples, tradeoffs, and references in plain Markdown.

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
