# Skill: Delegate to Codex CLI

> **When:** Fast code generation, boilerplate, multi-file implementation, well-defined tasks

## Decision Matrix

| Signal | Delegate to Codex? |
|--------|:-------------------:|
| Need code generated quickly | ✅ Yes |
| Boilerplate or scaffolding | ✅ Yes |
| Well-defined implementation spec | ✅ Yes |
| Multiple files to create/edit | ✅ Yes |
| CRUD API endpoints | ✅ Yes |
| Complex architecture decision | ❌ Use Claude |
| Security-sensitive code review | ❌ Use Claude |
| GitHub PR/Issue management | ❌ Use Copilot |

## Method 1: Shell Invocation (Quick)

### Basic Code Generation

```powershell
# Generate a single file
codex --quiet "Create a TypeScript Express middleware for request logging 
  that includes timestamp, method, path, status code, and response time"
```

### Multi-File Scaffolding

```powershell
# Generate multiple related files with full-auto mode
codex --quiet --approval-mode full-auto `
  "Create a complete CRUD API for a 'Product' resource:
   - src/models/product.ts (Prisma model + TypeScript types)
   - src/routes/products.ts (Express routes: GET, POST, PUT, DELETE)
   - src/validators/product.ts (Zod validation schemas)
   - src/services/product.ts (Business logic layer)
   - tests/products.test.ts (Jest unit tests)
   
   Use proper error handling, input validation, and TypeScript types throughout."
```

### With Approval Modes

```powershell
# suggest (default) — Codex shows changes, asks for approval
codex "Add pagination to the users endpoint"

# auto-edit — Codex applies changes automatically but doesn't run commands
codex --approval-mode auto-edit "Add error handling to all service methods"

# full-auto — Codex applies changes and runs commands (tests, etc.)
codex --approval-mode full-auto "Add input validation and write tests for it"
```

### Capture Output for Pipeline

```powershell
# Generate code and pipe to review
$code = codex --quiet "Generate a WebSocket server class in TypeScript 
  with rooms, authentication, and reconnection handling"

# Save to file
$code | Out-File -FilePath src/ws/server.ts -Encoding utf8

# Feed to Claude for review (Pipeline pattern)
$review = npx @anthropic-ai/claude-code --print `
  "Review this WebSocket implementation for security and correctness: $code"
```

## Method 2: MCP Bridge (Recommended for Teams)

### Setup

Add to your MCP configuration:

```json
{
  "servers": {
    "codex-bridge": {
      "command": "node",
      "args": ["orchestration/scripts/codex-bridge.js"],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
      }
    }
  }
}
```

### Usage

```text
You: "Use Codex to generate the API endpoints from our OpenAPI spec"

Copilot CLI calls codex_generate through MCP with type-safe parameters.
```

## Template Prompts

### CRUD API Generation

```text
Generate a complete CRUD API for [resource name] with:
- TypeScript types/interfaces
- Express/Fastify routes (GET list, GET by ID, POST, PUT, DELETE)
- Input validation using Zod
- Service layer with business logic
- Proper error handling (404, 400, 500)
- Database queries using [Prisma/TypeORM/Drizzle]

Follow the existing patterns in src/routes/ for consistency.
```

### Test Generation

```text
Generate comprehensive unit tests for [file path] using [Jest/Vitest]:
- Test all public methods/functions
- Include happy path and error cases
- Test edge cases (empty input, null, boundary values)
- Mock external dependencies
- Aim for >90% code coverage

Follow the test patterns in tests/ for consistency.
```

### Boilerplate Scaffolding

```text
Scaffold a new [microservice/module/component] named [name]:
- Directory structure following project conventions
- Configuration files (tsconfig, package.json if needed)
- Base classes with TypeScript types
- Health check endpoint
- Dockerfile if applicable
- README with setup instructions

Match the patterns used in [reference directory].
```

### Migration Generation

```text
Generate database migrations for these schema changes:
[describe changes]

Using [Prisma/Knex/TypeORM] migration format.
Include both up and down migrations.
Add appropriate indexes for query performance.
```

## Processing Codex Results

### Verify Generated Code

```powershell
# After Codex generates code, verify it compiles
codex --quiet --approval-mode full-auto "Generate the user service"

# Check TypeScript compilation
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    # If compilation fails, ask Codex to fix
    codex --quiet --approval-mode auto-edit "Fix all TypeScript compilation errors"
}
```

### Run Generated Tests

```powershell
# Generate tests and immediately verify they pass
codex --quiet --approval-mode full-auto `
  "Generate unit tests for src/services/auth.ts"

# Run the tests
npm test -- --testPathPattern="auth"

if ($LASTEXITCODE -ne 0) {
    # Fix failing tests
    codex --quiet --approval-mode auto-edit `
      "Fix the failing tests. Error output: $(npm test -- --testPathPattern='auth' 2>&1)"
}
```

### Integrate with Copilot Workflow

```powershell
# Full flow: Codex implements → verify → Copilot ships
codex --quiet --approval-mode full-auto "Implement the notification service"

# Verify
npm run build && npm test

if ($LASTEXITCODE -eq 0) {
    # Copilot CLI creates the PR
    git checkout -b feat/notification-service
    git add -A
    git commit -m "feat: add notification service

    Implemented by Codex CLI, verified with existing test suite.

    Co-authored-by: Codex <codex@openai.com>"
    gh pr create --fill
}
```

## Codex CLI Flags Reference

| Flag | Description | Example |
|------|-------------|---------|
| `--quiet` | Suppress interactive UI, output result only | `codex --quiet "prompt"` |
| `--approval-mode` | Set autonomy level | `codex --approval-mode full-auto` |
| `--model` | Choose model variant | `codex --model o4-mini` |
| `--notify` | Desktop notification on completion | `codex --notify "long task"` |

## Best Practices

1. **Be specific about patterns** — Reference existing code files so Codex follows conventions
2. **Use full-auto for trusted tasks** — Boilerplate, tests, and well-defined implementations
3. **Use suggest for sensitive code** — Auth, payments, data handling
4. **Always verify** — Run build + tests after Codex generates code
5. **Chain with Claude** — Use Codex to generate, Claude to review

## See Also

- [Delegate to Claude](delegate-to-claude.md) — Deep reasoning and review
- [Agent Review Chain](agent-review-chain.md) — Multi-agent pipeline
- [Pipeline Pattern](../patterns/pipeline.md) — Chaining AI tools
- [Fast Implementation Example](../examples/fast-implementation.md) — Full walkthrough
