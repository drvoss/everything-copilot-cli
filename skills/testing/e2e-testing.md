---
name: e2e-testing
description: End-to-end testing workflow for critical user paths
category: testing
agent_type: general-purpose
---

# End-to-End Testing

## When to Use
- Validating critical user journeys work from start to finish
- After major refactors that may break integration between components
- Before releases to verify the full system works together
- When unit tests pass but users report bugs in real workflows
- Setting up regression tests for frequently broken features

## Prerequisites
- Application can be started in a test/dev environment
- E2E test framework installed (Playwright, Cypress, Selenium, etc.)
- Test data and fixtures available or can be seeded
- Understanding of the most important user workflows

## Workflow

### 1. Identify Critical User Paths
Map the workflows that must always work:

```powershell
# Find existing E2E tests to understand what's covered
glob pattern="**/*.e2e.*"
glob pattern="**/e2e/**/*.{ts,js}"
glob pattern="**/cypress/**/*.{ts,js}"
glob pattern="**/playwright/**/*.{ts,js}"
```

Prioritize paths by business impact:
| Priority | Path | Example |
|----------|------|---------|
| 🔴 P0 | Revenue-critical | Signup → Purchase → Confirmation |
| 🔴 P0 | Authentication | Login → Access protected resource |
| 🟡 P1 | Core features | Create item → Edit → Delete |
| 🟡 P1 | Data integrity | Import → Transform → Export |
| 🟢 P2 | Secondary flows | Settings → Profile update |

### 2. Set Up the Test Environment
```powershell
# Start the application in test mode
$env:NODE_ENV="test"
npm run dev  # mode: async, detach: true

# Seed test data
npm run db:seed:test 2>&1

# Verify the app is running
curl -s http://localhost:3000/health
```

### 3. Write E2E Tests

**Playwright example:**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can sign up and log in', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Fill the form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });
});
```

**API E2E example:**
```typescript
// e2e/api-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API CRUD Workflow', () => {
  let itemId: string;

  test('create → read → update → delete', async ({ request }) => {
    // Create
    const createRes = await request.post('/api/items', {
      data: { name: 'Test Item', price: 29.99 },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    itemId = created.id;

    // Read
    const getRes = await request.get(`/api/items/${itemId}`);
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).name).toBe('Test Item');

    // Update
    const updateRes = await request.put(`/api/items/${itemId}`, {
      data: { name: 'Updated Item' },
    });
    expect(updateRes.status()).toBe(200);

    // Delete
    const deleteRes = await request.delete(`/api/items/${itemId}`);
    expect(deleteRes.status()).toBe(204);

    // Verify deleted
    const verifyRes = await request.get(`/api/items/${itemId}`);
    expect(verifyRes.status()).toBe(404);
  });
});
```

### 4. Run E2E Tests
```powershell
# Playwright
npx playwright test 2>&1

# Cypress
npx cypress run 2>&1

# With specific test file
npx playwright test e2e/auth.spec.ts 2>&1

# Use task agent for clean output
```

```
task agent_type: "task"
prompt: "Run 'npx playwright test' and report results. Show full output for any failures."
```

### 5. Debug Failures
```powershell
# Run with headed browser for visual debugging
npx playwright test --headed --debug e2e/auth.spec.ts

# View trace for failed test
npx playwright show-trace test-results/auth-trace.zip

# Screenshot on failure (auto-configured in playwright.config.ts)
```

### 6. Maintain Tests
```powershell
# Find flaky tests (tests that sometimes pass, sometimes fail)
# Run tests multiple times to detect flakiness
npx playwright test --repeat-each=3 2>&1 | Select-String "passed|failed|flaky"

# Find slow tests
npx playwright test --reporter=list 2>&1 | Sort-Object { [int]($_ -split '\s+')[-1] } -Descending | Select-Object -First 10
```

## Examples

### Setting Up Playwright from Scratch
```powershell
npm init playwright@latest 2>&1
# Generates: playwright.config.ts, e2e/ directory, package.json scripts
```

### CI Configuration
```yaml
# .github/workflows/e2e.yml
- name: Run E2E tests
  run: |
    npm run build
    npm start &
    npx wait-on http://localhost:3000
    npx playwright test
```

## Tips
- **Keep E2E tests focused** — test user journeys, not implementation details
- Use **page objects** or **fixtures** to reduce duplication across tests
- Run E2E tests in CI but not on every commit — they're slower than unit tests
- Use `test.beforeAll` to seed data and `test.afterAll` to clean up
- Prefer CSS selectors or test IDs (`data-testid`) over fragile XPath or text selectors
- If an E2E test is flaky, add explicit waits (`waitForSelector`) instead of arbitrary delays
- Use the `task` agent to run E2E suites — it keeps your context clean and summarizes results
- Capture screenshots and traces on failure for faster debugging
