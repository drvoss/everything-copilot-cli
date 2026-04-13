# Example: Turborepo Monorepo

> **Reference `.github/copilot-instructions.md`** for a Turborepo + pnpm workspaces project.

## What This Example Represents

A Turborepo monorepo hosting a Next.js web app, a Fastify API, shared TypeScript
libraries, and a React Native mobile app. The instructions encode critical rules that AI
commonly misses: pnpm workspace protocol (`workspace:*`), cross-package import
boundaries, Turborepo task dependency ordering, and matrix CI build patterns.

## Project Structure (assumed)

```text
monorepo/
├── .github/
│   ├── copilot-instructions.md   ← copy this to your project
│   └── workflows/
│       └── ci.yml                # matrix build: [web, api, mobile]
├── apps/
│   ├── web/                      # Next.js 15+ App Router
│   ├── api/                      # Node.js + Fastify
│   └── mobile/                   # React Native + Expo
├── packages/
│   ├── ui/                       # Shared React component library
│   ├── config/                   # Shared ESLint / TypeScript configs
│   └── utils/                    # Pure TypeScript utilities
├── turbo.json                    # Pipeline: lint → build → test
├── pnpm-workspace.yaml
└── package.json
```

## How to Use This Example

1. **Copy** `.github/copilot-instructions.md` into your monorepo root
2. **Edit** the Tech Stack table and Workspace Structure to match your actual packages
3. **Customize** the cross-package boundary rules for your domain
4. **Add** per-package rules if packages have different conventions

```powershell
# Copy from this example into your monorepo
Copy-Item examples/monorepo/.github/copilot-instructions.md `
  -Destination /path/to/your-monorepo/.github/copilot-instructions.md
```

## Monorepo-Specific Skills Usage

The **fan-out-parallel** pattern is especially powerful in monorepos — audit all packages
simultaneously:

```powershell
# Audit all packages in parallel (from orchestration/patterns/fan-out-parallel.md)
$packages = @("apps/web", "apps/api", "packages/ui", "packages/utils")
$jobs = $packages | ForEach-Object {
    $pkg = $_
    Start-Job -ScriptBlock {
        gh copilot suggest "Audit $using:pkg for security issues and outdated deps"
    }
}
$jobs | Wait-Job -Timeout 180 | Receive-Job
```

## Recommended Skills & Agents

| Task | Skill / Agent |
|------|--------------|
| Fix a GitHub Issue end-to-end | `skills/development/fix-github-issue/` |
| Multi-lens PR review | `skills/development/pr-multi-perspective-review/` |
| Parallel package audits | `orchestration/patterns/fan-out-parallel.md` |
| Release (npm packages) | `skills/workflow/release/` |
| Sprint workflow | `skills/workflow/sprint-workflow/` |

## See Also

- [`examples/nextjs-app/`](../nextjs-app/) — the `apps/web` portion in isolation
- [fan-out-parallel pattern](../../orchestration/patterns/fan-out-parallel.md)
- [Migration guide](../../guides/migration-from-claude-code.md)
- [skills/README.md](../../skills/README.md) — full skill catalog
