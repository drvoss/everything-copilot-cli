# Example: Next.js App

> **Reference `.github/copilot-instructions.md`** for a Next.js 15+ App Router project.

## What This Example Represents

A production Next.js application with TypeScript, Tailwind CSS, Prisma, and Auth.js.
The instructions encode decisions that AI assistants commonly get wrong in this stack:
Server Component vs Client Component boundaries, Server Action usage, Prisma query
patterns, and Auth.js session handling.

## Project Structure (assumed)

```text
nextjs-app/
├── .github/
│   └── copilot-instructions.md   ← copy this to your project
├── src/
│   ├── app/                      # App Router pages, layouts, route handlers
│   │   ├── (auth)/               # Auth-related routes
│   │   ├── api/                  # Route Handlers (not Server Actions)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # Shadcn/ui primitives (never edit directly)
│   │   └── features/             # Domain-specific components
│   ├── lib/
│   │   ├── db.ts                 # Prisma client singleton
│   │   └── auth.ts               # Auth.js configuration
│   ├── server/                   # Server-only code (actions, queries)
│   └── types/
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/                     # Vitest
│   └── e2e/                      # Playwright
└── package.json
```

## How to Use This Example

1. **Copy** `.github/copilot-instructions.md` into your Next.js project root
2. **Edit** the Tech Stack table to match your actual versions
3. **Customize** the Architecture section to reflect your directory layout
4. **Add** project-specific rules (e.g., domain model constraints, API conventions)

```powershell
# Copy from this example into your project
Copy-Item examples/nextjs-app/.github/copilot-instructions.md `
  -Destination /path/to/your-project/.github/copilot-instructions.md
```

## Recommended Skills & Agents

| Task | Skill / Agent |
|------|--------------|
| Fix a GitHub Issue end-to-end | `skills/development/fix-github-issue/` |
| Multi-lens PR review | `skills/development/pr-multi-perspective-review/` |
| Commit + PR workflow | `skills/workflow/commit-workflow/` |
| Release (npm) | `skills/workflow/release/` |
| Security scan | `skills/security/security-scan/` |

## See Also

- [`examples/monorepo/`](../monorepo/) — when this app is part of a larger Turborepo
- [Migration guide](../../guides/migration-from-claude-code.md) — adapt from Claude Code
- [skills/README.md](../../skills/README.md) — full skill catalog
