# Cloudflare Workers Rules

Best practices for building and deploying edge functions with Cloudflare Workers.

## Runtime Constraints

- Workers run in the **V8 isolate** runtime — Node.js built-ins are NOT available by default
  (`fs`, `path`, `crypto` from Node are absent — use the Web Crypto API instead)
- Use `compatibility_date` in `wrangler.toml` and update it periodically after testing
- Keep bundle size under 1 MB (free tier) / 5 MB (paid) — audit with `wrangler deploy --dry-run`

## Code Structure

- Keep the main `fetch` handler lean — delegate to router or handler functions
- Use `hono` or `itty-router` for routing instead of a large if/else chain
- Avoid large dependencies — prefer lightweight alternatives (`zod` → manual validation for edge)

## Bindings

- Define all bindings (KV, D1, R2, Queues, AI) in `wrangler.toml` and type them in `Env`
- Never hardcode binding names as strings in business logic — use the `Env` type
- Use `wrangler types` to auto-generate TypeScript types for bindings

## Secrets & Environment

- Store secrets with `wrangler secret put SECRET_NAME` — never in `wrangler.toml`
- Use `vars` in `wrangler.toml` only for non-sensitive configuration
- Validate required env vars at the top of the `fetch` handler

## Performance

- Use **KV** for low-latency reads of infrequently changed data (cache, feature flags)
- Use **D1** for relational data; batch queries where possible
- Use **R2** for object storage — avoid Workers for large binary streaming
- Minimize cold start time: avoid top-level `await`, keep initialization fast

## Testing & Deployment

- Use `wrangler dev` for local development with live bindings simulation
- Write unit tests with `vitest` and `@cloudflare/vitest-pool-workers`
- Deploy to a staging environment (`wrangler deploy --env staging`) before production
- Pin the `wrangler` version in `package.json` to avoid unexpected breaking changes
