---
name: nextjs-prisma
description: Use when working on a Next.js App Router project that uses Prisma as the ORM — covers server component data fetching, singleton client setup, and type-safe query patterns.
metadata:
  category: development
  agent_type: general-purpose
  combo: "next, prisma"
---

# Next.js + Prisma Combo Skill

## When to Use

- Setting up Prisma in a new Next.js App Router project
- Reviewing or refactoring data-fetching logic in Server Components
- Debugging Prisma client instantiation issues (hot-reload client explosion)
- Implementing type-safe CRUD operations across Server Actions and API routes

## Workflow

### 1. Singleton Client Setup

Ensure Prisma client is instantiated only once across hot reloads:

> **Next.js version note**: The `global` cache pattern below is recommended for Next.js 13/14.
> In Next.js 15 (with React 19), module-level singletons are stable across hot reloads —
> you can use `export const prisma = new PrismaClient(...)` directly in `lib/prisma.ts`.

```typescript
// lib/prisma.ts  (Next.js 13/14 pattern)
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### 2. Data Fetching in Server Components

```typescript
// app/users/page.tsx
import { prisma } from "@/lib/prisma"

export default async function UsersPage() {
  // Runs on the server — safe to use Prisma directly
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "desc" },
  })
  return <UserList users={users} />
}
```

### 3. Server Actions with Prisma

```typescript
// app/users/actions.ts
"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createUser(data: { name: string; email: string }) {
  await prisma.user.create({ data })
  revalidatePath("/users")
}
```

### 4. Avoiding Common Pitfalls

- Never import `prisma` in `"use client"` components — it will fail at runtime
- Use `prisma.$transaction()` when a page requires multiple dependent writes
- Apply `select` to limit fields — avoid sending sensitive columns to the client
- Run `prisma generate` after every schema change before running the dev server

### 5. Environment Setup Checklist

```bash
# 1. Install
pnpm add prisma @prisma/client
pnpm prisma init

# 2. Add DATABASE_URL to .env
# 3. Define schema in prisma/schema.prisma
# 4. Run first migration
pnpm prisma migrate dev --name init

# 5. Generate client
pnpm prisma generate
```

## Rules Applied

- `rules/frameworks/nextjs.md` — App Router, Server Components, environment variables
- `rules/frameworks/prisma.md` — schema design, singleton client, query safety
- `rules/common/security.md` — secrets management, input validation
