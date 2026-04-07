---
name: nestjs-prisma
description: Use when building a NestJS application with Prisma — covers PrismaService setup as an injectable singleton, repository pattern integration, and testing with Prisma mocks.
metadata:
  category: development
  agent_type: general-purpose
  combo: ["nestjs", "prisma"]
---

# NestJS + Prisma Combo Skill

## When to Use

- Setting up Prisma in a NestJS project for the first time
- Implementing a data access layer using Prisma as the ORM
- Writing unit tests for services that depend on Prisma
- Debugging connection pooling or client lifecycle issues

## Workflow

### 1. PrismaService Setup

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
  }
  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from "@nestjs/common"
import { PrismaService } from "./prisma.service"

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Import `PrismaModule` in `AppModule` once — `@Global()` makes it available everywhere.

### 2. Using PrismaService in a Feature Service

```typescript
// src/users/users.service.ts
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true },
    })
  }

  async create(data: { name: string; email: string }) {
    return this.prisma.user.create({ data })
  }
}
```

### 3. Unit Testing with Prisma Mock

```typescript
// src/users/users.service.spec.ts
import { Test } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { PrismaService } from "../prisma/prisma.service"

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}

describe("UsersService", () => {
  let service: UsersService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it("returns all users", async () => {
    mockPrismaService.user.findMany.mockResolvedValue([{ id: 1, name: "Alice" }])
    const result = await service.findAll()
    expect(result).toHaveLength(1)
  })
})
```

### 4. Environment Setup Checklist

```bash
# 1. Install
pnpm add @prisma/client
pnpm add -D prisma

# 2. Initialize
pnpm prisma init

# 3. Add DATABASE_URL to .env
# 4. Define schema then migrate
pnpm prisma migrate dev --name init

# 5. Generate client
pnpm prisma generate
```

## Rules Applied

- `rules/frameworks/nestjs.md` — module structure, DI, controllers, security
- `rules/frameworks/prisma.md` — schema design, client lifecycle, query safety
- `rules/common/security.md` — secrets, input validation
