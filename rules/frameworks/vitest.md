# Vitest Rules

Best practices for writing fast, reliable unit tests with Vitest.

## Test Structure

- Use `describe` to group related tests by feature or function
- Follow **Arrange → Act → Assert** in every test case
- Keep tests independent — each test must be able to run in isolation
- Name tests descriptively: `it('returns null when input is empty')`, not `it('works')`

## Assertions

- Prefer specific matchers over generic ones:
  - `toBe` for primitives, `toEqual` for objects, `toStrictEqual` for strict object equality
  - `toThrow` for error cases, `toHaveBeenCalledWith` for mock verification
- Avoid `expect.assertions(n)` except when testing async error paths

## Mocking

- Use `vi.fn()` for function mocks and `vi.spyOn()` to observe real implementations
- Reset mocks between tests with `vi.clearAllMocks()` in `beforeEach`
- Mock modules with `vi.mock('module-name')` at the top of the file, outside `describe`
- Prefer dependency injection over module mocking where possible — it makes tests clearer

## Async Tests

- Always `await` async operations; never leave unhandled floating promises
- Use `vi.useFakeTimers()` for testing `setTimeout` / `setInterval`-dependent code
- Use `vi.runAllTimers()` or `vi.advanceTimersByTime()` to control fake timer execution

## Configuration

- Set `coverage.provider: 'v8'` in `vitest.config.ts` for accurate coverage
- Define coverage thresholds (`lines: 80`, `branches: 70`) to prevent regression
- Use `test.concurrent` judiciously — shared mutable state causes flaky tests
- Run `vitest --ui` during development for a live test dashboard

## Snapshot Testing

- Use snapshots sparingly — prefer explicit assertions for critical output
- Review snapshot diffs carefully in PRs; update with `vitest --update-snapshots` only when intentional
