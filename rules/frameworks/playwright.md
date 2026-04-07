# Playwright Rules

Best practices for writing reliable end-to-end tests with Playwright.

## Test Structure

- Use `test.describe` to group related scenarios; keep individual tests focused on one flow
- Follow the **Arrange → Act → Assert** pattern in every test
- Keep test files in a `tests/e2e/` or `e2e/` directory, separate from unit tests
- Name test files with `.spec.ts` suffix for consistency

## Selectors

- Prefer **user-facing attributes**: `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`
- Avoid CSS selectors and XPaths for elements that have accessible equivalents
- Use `data-testid` only as a last resort when no semantic selector is available
- Define reusable selectors in Page Object Models, not inline in tests

## Assertions

- Always use Playwright's built-in `expect` with auto-retrying assertions:

  ```typescript
  await expect(page.getByRole('button')).toBeVisible()
  await expect(page.getByText('Success')).toBeVisible()
  ```

- Never use `page.waitForTimeout()` — use `expect` with timeout options instead
- Set a global `timeout` in `playwright.config.ts` rather than per-test

## Page Object Model

- Create a Page Object class for each major page or component:

  ```typescript
  class LoginPage {
    constructor(private page: Page) {}
    async login(email: string, password: string) {
      await this.page.getByLabel('Email').fill(email)
      await this.page.getByLabel('Password').fill(password)
      await this.page.getByRole('button', { name: 'Sign in' }).click()
    }
  }
  ```

- Import and instantiate Page Objects in test files, not inside `test` bodies

## Configuration

- Run tests in multiple browsers in CI: Chromium, Firefox, WebKit
- Use `storageState` for authenticated tests to avoid repeated logins
- Set `baseURL` in config so tests use relative URLs
- Enable `trace: 'on-first-retry'` in CI for debugging failures

## CI/CD

- Run Playwright tests in a dedicated CI step after unit tests pass
- Store test artifacts (screenshots, traces) as CI artifacts on failure
- Use `--shard` to parallelize across CI workers for large test suites
