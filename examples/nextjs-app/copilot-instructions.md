# Next.js App — Copilot Instructions

## Project Overview

This is a **Next.js 15+ App Router** application built with TypeScript, React,
Tailwind CSS, and Prisma. It follows a server-first architecture where Server
Components are the default rendering strategy.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Next.js 15+ (App Router)           |
| Language     | TypeScript 5.x (strict mode)       |
| Styling      | Tailwind CSS 3.x + clsx            |
| ORM          | Prisma 5.x                         |
| Database     | PostgreSQL 15+                     |
| Auth         | Auth.js v5                         |
| Validation   | Zod                                |
| State        | React Server Components + nuqs     |
| Testing      | Vitest + React Testing Library + Playwright |
| Deployment   | Vercel                             |

## Architecture & Conventions

### Directory Structure

```
src/
├── app/              # App Router pages and layouts
│   ├── (auth)/       # Auth route group
│   ├── (dashboard)/  # Dashboard route group
│   ├── api/          # API Route Handlers
│   └── layout.tsx    # Root layout
├── components/       # Reusable UI components
│   ├── ui/           # Primitives (Button, Input, Card)
│   └── features/     # Feature-specific components
├── lib/              # Shared utilities and configurations
│   ├── db.ts         # Prisma client singleton
│   ├── auth.ts       # Auth configuration
│   └── utils.ts      # General helpers
├── actions/          # Server Actions
├── hooks/            # Custom React hooks (client-only)
└── types/            # Shared TypeScript type definitions
```

### Key Rules

1. **Server Components by default** — only add `"use client"` when the component
   needs interactivity, browser APIs, or React hooks (useState, useEffect, etc.).
2. **Data fetching in Server Components** — use `async` Server Components with
   direct Prisma calls; avoid client-side fetching for initial data.
3. **Server Actions for mutations** — define actions in `src/actions/` with the
   `"use server"` directive. Validate inputs with Zod schemas.
4. **Route Handlers for external APIs** — use `app/api/` Route Handlers only for
   webhooks, third-party callbacks, and public API endpoints.
5. **Colocation** — keep page-specific components, loading states, and error
   boundaries alongside their `page.tsx` in the App Router.

### Naming Conventions

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities/hooks: `camelCase.ts` (e.g., `useDebounce.ts`)
- Server Actions: `camelCase.ts` prefixed with verb (e.g., `createPost.ts`)
- Types: `PascalCase` with suffix `Props`, `State`, or descriptive name

### Styling

- Use Tailwind utility classes directly in JSX.
- Extract repeated patterns into components, not CSS classes.
- Use `cn()` helper (clsx + tailwind-merge) for conditional classes.
- Dark mode via `dark:` variant — always support both themes.

## Testing Strategy

- **Unit tests** (Vitest): utilities, hooks, Server Actions, and pure components.
- **Integration tests** (React Testing Library): component interactions, form flows.
- **E2E tests** (Playwright): critical user journeys (auth, checkout, CRUD).
- Run `npm test` before committing; run `npx playwright test` for E2E.

## Environment & Deployment

- Environment variables: `.env.local` for development, Vercel dashboard for prod.
- Database migrations: `npx prisma migrate dev` locally, auto-applied on deploy.
- Preview deployments: every PR gets a Vercel preview URL.
- Production: `main` branch auto-deploys to Vercel.

## Copilot CLI Tips

- Use **explore** agents to trace data flow through Server Components.
- Use **task** agents to run `npx prisma migrate` or `npm run build`.
- When debugging SSR issues, check both server and client component boundaries.
- For database schema changes, always generate and review the migration SQL.
