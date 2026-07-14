# Example: Fast Implementation with Codex CLI

> **Scenario:** You need to implement a complete CRUD API for a new resource, including routes, validation, service layer, and tests. You delegate the bulk implementation to Codex CLI for speed, then verify with Copilot CLI.

## The Setup

Your project uses:

- Express.js with TypeScript
- Prisma ORM
- Zod for validation
- Jest for testing
- Existing patterns in `src/routes/users.ts` as a reference

You need to create a complete `Product` resource API.

## Step 1: Define the Spec (Copilot CLI)

Start by defining what you need clearly:

```powershell
# Copilot CLI reviews the existing user routes as a reference
Get-Content src/routes/users.ts | Select-Object -First 30

# Output shows the existing pattern:
# import { Router } from 'express';
# import { z } from 'zod';
# import { userService } from '../services/userService';
# ...
```

## Step 2: Delegate to Codex (Full-Auto Mode)

Delegate the implementation to Codex with a detailed specification:

```powershell
# Codex generates the complete CRUD API
codex exec --skip-git-repo-check --full-auto @"
Create a complete CRUD API for a 'Product' resource following the exact same 
patterns as src/routes/users.ts and src/services/userService.ts.

Create these files:

1. src/models/product.ts
   - Prisma model type exports
   - TypeScript interfaces: Product, CreateProductInput, UpdateProductInput

2. src/validators/product.ts
   - Zod schemas: createProductSchema, updateProductSchema, productQuerySchema
   - Fields: name (string, 1-200 chars), description (string, optional), 
     price (number, positive), category (enum: electronics|clothing|food|other),
     inStock (boolean, default true), sku (string, unique pattern: [A-Z]{3}-\d{6})

3. src/services/productService.ts
   - ProductService class with methods:
     - findAll(query: ProductQuery): Promise<PaginatedResult<Product>>
     - findById(id: string): Promise<Product | null>
     - create(input: CreateProductInput): Promise<Product>
     - update(id: string, input: UpdateProductInput): Promise<Product>
     - delete(id: string): Promise<void>
   - Proper error handling (NotFoundError, ValidationError)
   - Pagination support (page, limit, sortBy, sortOrder)

4. src/routes/products.ts
   - Express Router with endpoints:
     - GET /products (list with pagination and filtering)
     - GET /products/:id (get by ID)
     - POST /products (create, validate body)
     - PUT /products/:id (update, validate body)
     - DELETE /products/:id (delete)
   - Request validation middleware using Zod schemas
   - Proper HTTP status codes (200, 201, 204, 400, 404, 500)
   - Error handling middleware

5. tests/services/productService.test.ts
   - Jest unit tests for all ProductService methods
   - Mock Prisma client
   - Test cases: happy path, not found, validation error, pagination
   - At least 15 test cases

Follow existing code style, import patterns, and error handling conventions.
"@
```

## Step 3: Codex Output (Generated Files)

Codex generates all 5 files. Here's a summary of what gets created:

### `src/models/product.ts`

```typescript
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  inStock: boolean;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 'electronics' | 'clothing' | 'food' | 'other';

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  inStock?: boolean;
  sku: string;
}
// ... UpdateProductInput, ProductQuery, PaginatedResult
```

### `src/validators/product.ts`

```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food', 'other']),
  inStock: z.boolean().default(true),
  sku: z.string().regex(/^[A-Z]{3}-\d{6}$/, 'SKU must match format: ABC-123456'),
});
// ... updateProductSchema, productQuerySchema
```

### `src/routes/products.ts`

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';
import { createProductSchema, updateProductSchema } from '../validators/product';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.findAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
// ... other endpoints
```

## Step 4: Verify (Copilot CLI)

After Codex generates the code, verify everything works:

```powershell
# Check TypeScript compilation
npx tsc --noEmit

# Output: (clean — no errors)
Write-Host "✅ TypeScript compilation passed"

# Run the generated tests
npm test -- --testPathPattern="productService" --verbose

# Output:
# PASS  tests/services/productService.test.ts
#   ProductService
#     findAll
#       ✓ should return paginated products (12ms)
#       ✓ should filter by category (8ms)
#       ✓ should handle empty results (5ms)
#     findById
#       ✓ should return product when found (6ms)
#       ✓ should throw NotFoundError when not found (4ms)
#     create
#       ✓ should create a new product (10ms)
#       ✓ should reject duplicate SKU (7ms)
#     ...
# Tests: 15 passed, 15 total
Write-Host "✅ All 15 tests passed"

# Run linter
npm run lint -- --no-error-on-unmatched-pattern src/routes/products.ts src/services/productService.ts

Write-Host "✅ Linting passed"
```

## Step 5: Quick Claude Review (Optional)

For critical code, add a Claude review before shipping:

```powershell
# Quick security review of the generated code
$filesToReview = @(
    "src/routes/products.ts",
    "src/validators/product.ts",
    "src/services/productService.ts"
) | ForEach-Object { "=== $_ ===`n$(Get-Content $_ -Raw)" } | Out-String

$review = claude -p @"
Quick security review of these auto-generated API files:

$filesToReview

Check for: injection, auth bypass, data leaks, missing validation.
Only flag real issues, not style preferences. Be brief.
"@

Write-Output $review

# Claude's response:
# ✅ No critical security issues found.
# ⚠️ Minor: Consider adding rate limiting to POST /products
# ⚠️ Minor: SKU uniqueness should be enforced at DB level (add unique index)
```

## Step 6: Ship (Copilot CLI)

```powershell
# Create branch, commit, and PR
git checkout -b feat/product-api
git add src/models/product.ts src/validators/product.ts src/services/productService.ts `
       src/routes/products.ts tests/services/productService.test.ts
git commit -m "feat: add complete Product CRUD API

- Product model with TypeScript types
- Zod validation schemas (create, update, query)
- ProductService with pagination, filtering, CRUD
- Express routes with proper status codes
- 15 unit tests with full coverage

Generated by Codex CLI, reviewed by Claude Code.

Co-authored-by: Codex <codex@openai.com>
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

gh pr create --title "feat: add Product CRUD API" --body @"
## Product CRUD API

### Endpoints
- \`GET /products\` — List with pagination and filtering
- \`GET /products/:id\` — Get by ID
- \`POST /products\` — Create (validated)
- \`PUT /products/:id\` — Update (validated)
- \`DELETE /products/:id\` — Delete

### Implementation
- **Generated by:** Codex CLI (full-auto mode)
- **Reviewed by:** Claude Code (security review)
- **Shipped by:** Copilot CLI

### Test Coverage
15 unit tests covering all service methods, error cases, and edge cases.
"@

Write-Host "✅ PR created!"
```

## Timing Breakdown

| Step | Agent | Time |
|------|-------|-----:|
| Define spec | Copilot CLI | ~2 min |
| Generate 5 files | Codex CLI | ~45 sec |
| Verify (tsc + tests + lint) | Copilot CLI | ~30 sec |
| Security review | Claude Code | ~60 sec |
| Create PR | Copilot CLI | ~15 sec |
| **Total** | **Multi-AI** | **~5 min** |

Manual implementation of the same scope would typically take 2-4 hours.

## Key Takeaways

1. **Codex excels at well-defined implementations** — give it a clear spec with reference patterns
2. **Full-auto mode is safe for CRUD** — well-understood patterns with low risk
3. **Always verify** — run tsc, tests, and linter after generation
4. **Claude for critical review** — add a security check for anything facing the internet
5. **Copilot for GitHub ops** — branch, commit, PR in seconds

## See Also

- [Delegate to Codex](../skills/delegate-to-codex.md) — Codex delegation skill
- [Full Workflow Example](full-workflow.md) — Complete multi-AI workflow
- [Agent Review Chain](../skills/agent-review-chain.md) — Multi-agent review pipeline
