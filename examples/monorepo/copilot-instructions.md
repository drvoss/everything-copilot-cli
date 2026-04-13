# Monorepo — Copilot Instructions

## Project Overview

This is a **Turborepo monorepo** containing multiple packages that share code,
configuration, and tooling. It hosts a Next.js web app, a Node.js API, shared
TypeScript libraries, and a React Native mobile app.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Build System | Turborepo                           |
| Language     | TypeScript 5.x (strict mode)        |
| Package Mgr  | pnpm workspaces                     |
| Web App      | Next.js 15+ (App Router)            |
| API Server   | Node.js + Fastify                   |
| Mobile       | React Native + Expo                 |
| Shared       | TypeScript libraries (pure)         |
| Testing      | Vitest (unit) + Playwright (E2E)    |
| CI/CD        | GitHub Actions (matrix builds)      |

## Architecture & Conventions

### Workspace Structure

```text
/
├── apps/
│   ├── web/                  # @app/web — Next.js frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api/                  # @app/api — Fastify REST API
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/               # @app/mobile — React Native (Expo)
│       ├── src/
│       ├── app.json
│       └── package.json
├── packages/
│   ├── shared/               # @app/shared — shared types & utilities
│   │   ├── src/
│   │   │   ├── types/        # Shared TypeScript interfaces
│   │   │   ├── utils/        # Pure utility functions
│   │   │   └── constants/    # Shared constants
│   │   └── package.json
│   ├── ui/                   # @app/ui — shared React components
│   │   ├── src/
│   │   └── package.json
│   ├── config-typescript/    # @app/tsconfig — shared TS config
│   │   └── base.json
│   └── config-eslint/        # @app/eslint-config — shared ESLint
│       └── index.js
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # Workspace definitions
└── package.json              # Root scripts and devDependencies
```

### Key Rules

1. **Shared TypeScript config** — all packages extend `@app/tsconfig/base.json`.
   Never duplicate compiler options across packages.
2. **Workspace dependencies** — use `"@app/shared": "workspace:*"` in package.json.
   Never reference packages by relative path in source code.
3. **Package boundaries** — each package has a clear public API exported from
   `src/index.ts`. Never import from internal package paths.
4. **Independent versioning** — each package manages its own version. Use changesets
   for coordinated version bumps.
5. **Build order** — Turborepo handles the dependency graph. `shared` builds first,
   then `ui`, then apps. Never circumvent the pipeline.

### Cross-Package Conventions

- Types shared between web and API live in `@app/shared/src/types/`.
- API response types are defined once in `@app/shared` and imported by both apps.
- Validation schemas (Zod) in `@app/shared` are reused by API (server) and web (forms).
- Environment variables are package-specific — each app has its own `.env`.

### Naming Conventions

- Packages: `@app/{name}` scope
- Directories: `kebab-case`
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- Shared types: `{Entity}.types.ts` (e.g., `User.types.ts`)

## Testing Strategy

- **Each package has its own test suite** — run with `pnpm test` from package root.
- **Turborepo caching** — `turbo run test` runs all tests with dependency-aware caching.
- **Unit tests** (Vitest): in every package, co-located with source files.
- **E2E tests** (Playwright): in `apps/web/e2e/`, tests against running web + API.
- **Mobile tests**: Detox for React Native E2E, Jest for unit tests.

## CI/CD

### GitHub Actions Matrix Builds

```yaml
strategy:
  matrix:
    package: [web, api, shared, mobile]
steps:
  - run: pnpm turbo run build test lint --filter=@app/${{ matrix.package }}
```

- PRs: lint + test + build for affected packages only (`turbo --filter=...[HEAD]`).
- Main: full build + deploy. Web → Vercel, API → AWS, Mobile → EAS Build.
- Caching: Turborepo remote cache via Vercel for CI speed.

## Environment & Deployment

| App      | Platform        | Trigger          |
|----------|-----------------|------------------|
| Web      | Vercel          | Push to `main`   |
| API      | AWS ECS Fargate | Push to `main`   |
| Mobile   | Expo EAS Build  | Manual / release |

## Copilot CLI — Monorepo Navigation

- **Always specify which package** you are working in when giving Copilot context.
  Example: "In @app/api, add a new endpoint for…"
- Use **explore** agents to understand cross-package dependencies before making
  changes. A type change in `@app/shared` may affect all consumers.
- Use **task** agents with targeted Turborepo commands:
  `pnpm turbo run build --filter=@app/api`
- When modifying shared types, run `turbo run build test --filter=...@app/shared`
  to verify all downstream packages still compile and pass tests.
- For new packages, use `turbo gen workspace` to scaffold with correct config.
- Check `turbo.json` pipeline definitions when adding new build steps.
