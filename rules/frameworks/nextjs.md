# Next.js Rules

Best practices for building production-ready applications with Next.js (App Router).

## App Router Conventions

- Use the App Router (`app/`) by default for new projects; avoid mixing with Pages Router
- Co-locate `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` in the same route segment
- Use `layout.tsx` for shared UI; do not repeat navigation/header in each page
- Keep `page.tsx` files thin — delegate logic to server components or custom hooks

## Server vs Client Components

- Default to **Server Components** — add `"use client"` only when needed (interactivity, browser APIs)
- Never import server-only code (database clients, secrets) into `"use client"` components
- Use `next/dynamic` with `{ ssr: false }` for components that must be client-only
- Keep the client boundary as deep in the tree as possible to maximize server rendering

## Data Fetching

- Use `fetch()` with `cache` / `revalidate` options in Server Components for ISR
- Use React's `cache()` to deduplicate expensive server-side calls within a request
- Prefer `generateStaticParams` for statically known routes
- Avoid waterfall fetches — trigger parallel fetches with `Promise.all`

## Routing & Navigation

- Use `<Link>` from `next/link` instead of `<a>` for internal navigation
- Use `useRouter` from `next/navigation` (not `next/router`) in the App Router
- Implement `notFound()`, `redirect()`, and `permanentRedirect()` from `next/navigation`

## Performance

- Use `next/image` for all images — always provide `width`, `height`, and `alt`
- Use `next/font` for fonts to eliminate layout shift
- Analyze bundle size with `ANALYZE=true next build` periodically
- Avoid importing large libraries in the critical path; use dynamic imports

## Environment Variables

- Prefix public variables with `NEXT_PUBLIC_` — never expose secrets this way
- Validate all environment variables at startup with a schema (e.g., `zod`)
- Keep `.env.local` out of version control; document required variables in `.env.example`

## Error Handling

- Implement `error.tsx` at the route level for graceful error boundaries
- Use `global-error.tsx` at the root for unhandled errors
- Always handle async errors in Server Actions with try/catch
