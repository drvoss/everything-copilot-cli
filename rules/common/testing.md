# Testing Rules

Guidelines for writing effective, maintainable tests.

## Coverage & Goals

- Target **80%+ code coverage** as a baseline; critical paths should be higher
- Coverage is a guide, not a goal — prioritize meaningful tests over hitting a number
- Test the **behavior**, not the implementation details
- If refactoring breaks tests but not behavior, the tests were too coupled

## Test Structure

- Each test should test **one thing** — one assertion per logical concept
- Follow the **Arrange → Act → Assert** pattern (or Given → When → Then)
- Keep tests short and focused; if a test needs extensive setup, the code may need refactoring
- Use factory functions or builders for complex test data setup

## Naming & Organization

- Use **descriptive test names** that explain the scenario and expected outcome
- Good: `should return 404 when user is not found`
- Bad: `test1`, `testGetUser`, `it works`
- Group related tests with `describe`/`context` blocks
- Mirror the source file structure in test directories

## Mocking & Dependencies

- **Mock external dependencies** (APIs, databases, file system, time)
- Do not mock the code under test — only its collaborators
- Prefer dependency injection to make code testable
- Use fakes or in-memory implementations over complex mock setups when practical

## Edge Cases & Error Paths

- **Include edge cases**: empty inputs, null/undefined, boundary values, large inputs
- Test error paths — verify correct error types, messages, and status codes
- Test concurrent/async behavior where applicable
- Verify that invalid inputs are rejected properly

## Test Independence

- Tests must be **independent** — no shared mutable state between tests
- Each test sets up and tears down its own data
- Tests must pass in any order and in isolation
- Use `beforeEach`/`setUp` for common setup, not test-to-test dependencies

## Test Quality

- Treat test code with the same quality standards as production code
- Refactor tests when they become hard to read or maintain
- Avoid logic in tests (no loops, conditionals, or try-catch in assertions)
- Flaky tests must be fixed or quarantined immediately — they erode trust

## CI Integration

- All tests must pass before merging — no exceptions
- Run the full test suite in CI on every pull request
- Keep test execution fast; use parallelism where possible
- Separate slow integration/E2E tests from fast unit tests
