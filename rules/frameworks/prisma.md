# Prisma Rules

Best practices for using Prisma ORM safely and efficiently.

## Schema Design

- Define all relations explicitly with `@relation` — never rely on implicit conventions
- Use `@@index` for any field frequently used in `where` or `orderBy` clauses
- Prefer `Int @id @default(autoincrement())` or `String @id @default(cuid())` consistently
- Keep the schema as the single source of truth; never modify the database directly

## Migrations

- **Never edit generated migration files** after they have been applied to any environment
- Run `prisma migrate dev` in development; use `prisma migrate deploy` in CI/CD
- Review migration SQL before applying: `prisma migrate diff`
- Always commit migration files to version control

## Client Usage

- Instantiate `PrismaClient` as a **singleton** — never create a new instance per request

  ```typescript
  // lib/prisma.ts
  import { PrismaClient } from "@prisma/client"
  const globalForPrisma = global as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
  ```

- Disconnect in scripts: `await prisma.$disconnect()` in `finally` blocks

## Query Safety

- Use `select` and `include` to limit returned fields — avoid over-fetching
- Prefer `findUniqueOrThrow` / `findFirstOrThrow` over null checks when the record must exist
- Wrap multiple writes in `prisma.$transaction()` to maintain consistency
- Never interpolate user input into `prisma.$queryRaw` — use `Prisma.sql` tagged template

## Performance

- Avoid N+1 queries — use `include` or `select` to eager-load relations
- Use `cursor`-based pagination for large datasets instead of `skip/take`
- Log slow queries in development: `new PrismaClient({ log: ['query'] })`
