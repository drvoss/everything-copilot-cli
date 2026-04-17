---
name: source-driven-development
description: Use when implementing framework-specific or library-specific code — verify non-trivial APIs against official documentation before writing them, and record the source in task notes, docs, or the PR.
metadata:
  category: development
  agent_type: general-purpose
  origin: ported and adapted from addyosmani/agent-skills source-driven-development
---

# Source-Driven Development

AI agents can confidently generate outdated or deprecated framework code. Source-driven
development replaces memory-based implementation with a repeatable loop:
**detect the version, fetch the official source, implement from that source, then
capture the reference in durable notes**.

## When to Use

- Writing framework-specific code you have not touched recently
- Using a library that changed versions since the last time you used it
- Implementing middleware, routing, configuration, hooks, or SDK integration
- Seeing deprecation warnings or suspecting API drift
- Asking an AI agent to write code where stale training data could mislead it

## When NOT to Use

| Instead of source-driven-development | Use |
|-------------------------------------|-----|
| Writing pure business logic with no framework dependency | `spec-driven-development` |
| Reusing a stable internal utility with known behavior | implement directly |
| Looking up tool setup for MCP servers | `mcp-ecosystem` |

## Prerequisites

- You know which library, framework, or SDK is involved
- You can determine the exact version used in the project
- You have access to official docs, release notes, or migration guides

## Workflow

### 1. Detect the exact version

Do not look up docs before you know what version the project actually uses.

```text
Check package manifests, lockfiles, or module metadata first.
Examples:
- package.json / package-lock.json
- pyproject.toml / requirements.txt
- go.mod
```

### 2. Fetch the official source

Use this priority order:

1. Official documentation site
2. Official GitHub repository changelog or migration guide
3. Official release notes or blog posts
4. MDN for web platform APIs

Avoid secondary tutorials as your primary authority.

### 3. Extract the exact pattern you need

Write down the specific API shape before coding:

- function or hook name
- required arguments
- return shape
- error handling behavior
- version-specific caveats

### 4. Implement to match the source

Only write the framework code after you can point to the official pattern it follows.

```text
Implementation rule:
- use the documented API shape
- follow the documented order of operations
- avoid "this is probably how it works" guesses
```

### 5. Capture the reference in durable project context

For non-obvious decisions, record the source in one of:

- task notes
- ADR or design doc
- PR description
- surrounding documentation

Prefer durable project context over scattering source URLs through product code.

## Examples

### Next.js middleware change

```text
1. Confirm the project uses Next.js 15 in package.json
2. Fetch the current official middleware docs
3. Verify the App Router middleware API shape
4. Implement the middleware
5. Note the docs URL and the version-specific behavior in the PR description
```

### Using Context7 for live docs

```text
use context7
How do I configure middleware in Next.js 15 App Router?
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I remember how this API works" | Framework APIs drift quietly between versions. |
| "The AI probably knows the current syntax" | Model training data is not a guarantee of version accuracy. |
| "A blog post is good enough" | Secondary tutorials often lag behind the official API. |
| "I'll fix deprecations later" | Deprecations compound and make migrations harder. |

## Red Flags

- Guessing parameter order or option names
- Writing code before checking the installed version
- Mixing patterns from multiple major versions
- No durable note for a non-obvious framework decision

## Verification

- [ ] The project version was checked before implementation
- [ ] The implementation matches an official source
- [ ] Non-obvious API choices were captured in docs, notes, or the PR
- [ ] No deprecated or guessed API usage remains

## Tips

- Use `Context7` or direct doc fetches when you need current, version-aware guidance
- Pair this with `spec-driven-development` when an interface and a framework decision both matter
- If a decision still feels fuzzy after reading docs, stop and isolate the unknown before coding

## See Also

- [`spec-driven-development`](../spec-driven-development/SKILL.md) — define interfaces and boundaries first
- [`context-engineering`](../context-engineering/SKILL.md) — provide the right source context to the agent
- [`mcp-ecosystem`](../../copilot-exclusive/mcp-ecosystem/SKILL.md) — set up documentation-oriented MCP tools
