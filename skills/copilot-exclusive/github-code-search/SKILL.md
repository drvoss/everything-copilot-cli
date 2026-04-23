---
name: github-code-search
description: Use when you need real-world implementation examples or cross-repository context — search GitHub's global code index with the built-in MCP tools and reuse the results as grounded context.
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP server (search_code, get_file_contents, search_repositories)"
---

# GitHub Code Search as Context

## Why This is Copilot-Exclusive

Copilot CLI includes built-in GitHub MCP tools for global code search and repository
inspection. That makes it practical to search for real implementations on GitHub, read
the matching files, and bring the results back into your current task without leaving
the CLI.

## When to Use

- You want grounded implementation examples before writing a new pattern
- You need to compare how multiple repositories solve the same problem
- You want to inspect real API usage instead of relying only on memory or docs
- You need cross-repository context before making a design decision

## When NOT to Use

| Instead of github-code-search | Use |
|-------------------------------|-----|
| Searching your current local repository | direct search tools |
| GitHub Issues, PRs, or Actions workflows | `github-issue-triage`, `github-pr-workflow`, or `actions-debugging` |
| Documentation-heavy research | `deep-research` |
| Broad MCP setup guidance | `mcp-ecosystem` |

## Workflow

### 1. Form a focused query

Use GitHub code search qualifiers to keep results tight:

```text
language:TypeScript "circuit breaker" "retry"
org:microsoft path:src/auth "refresh token"
filename:SKILL.md "Use when" "GitHub MCP"
```

### 2. Search with the built-in GitHub MCP

```text
Tool: github-mcp-server-search_code
  query: "language:TypeScript \"circuit breaker\" retry"
  perPage: 10
```

### 3. Read the most relevant files

After finding candidate matches, inspect the actual source:

```text
Tool: github-mcp-server-get_file_contents
  owner: "example-org"
  repo: "example-repo"
  path: "src/retry.ts"
```

### 4. Reuse results as grounded context

Treat the retrieved code as external reference material:

```text
Use the GitHub examples above as reference only.
Implement the same pattern in our repo, but adapt naming, boundaries, and tests
to local conventions.
```

## Common Query Patterns

| Goal | Query example |
|------|---------------|
| Find API usage examples | `"supabase.auth.signIn" language:TypeScript` |
| Find config patterns | `filename:docker-compose.yml "healthcheck" "interval"` |
| Find error-handling conventions | `"catch (error)" "instanceof" language:TypeScript NOT test` |
| Find comparable skills | `filename:SKILL.md "Use when" "GitHub MCP"` |

## Combining with Other GitHub MCP Tools

```text
search_code
  -> get_file_contents
  -> search_repositories
  -> optionally inspect commits or PRs for evolution
```

This works especially well when you need examples plus surrounding repository context.

## Quality Check

- [ ] Query uses qualifiers to reduce noise
- [ ] Results come from multiple relevant sources, not one random repo
- [ ] External examples are treated as references, not copied blindly
- [ ] Final implementation is adapted to this repository's conventions

## See Also

- [`mcp-ecosystem`](../mcp-ecosystem/SKILL.md) — broader guide to built-in GitHub MCP and custom servers
- [`github-pr-workflow`](../github-pr-workflow/SKILL.md) — act on GitHub-native PR workflows once you know what to implement
- [`deep-research`](../../workflow/deep-research/SKILL.md) — documentation and evidence gathering rather than code search
