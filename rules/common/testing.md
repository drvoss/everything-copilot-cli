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

## TDD Guardrail — Enforcing Test-First

Inspired by [TDD Guard](https://github.com/nizos/tdd-guard): prevent AI agents and
developers from writing implementation code before writing a failing test.

**Git pre-commit hook:**

```bash
#!/bin/sh
# .git/hooks/pre-commit
# Reject commits where source files are staged without corresponding test files

staged_src=$(git diff --cached --name-only | grep "^src/" | grep -v "\.test\." | grep -v "\.spec\.")
staged_tests=$(git diff --cached --name-only | grep -E "\.(test|spec)\.")

if [ -n "$staged_src" ] && [ -z "$staged_tests" ]; then
  echo "❌ TDD violation: implementation staged without tests."
  echo "   Write a failing test first, then implement."
  echo "   Staged source files:"
  echo "$staged_src" | sed 's/^/     /'
  exit 1
fi
```

**PowerShell equivalent (Windows):**

```powershell
# .git/hooks/pre-commit.ps1
$stagedSrc = git diff --cached --name-only |
    Where-Object { $_ -match "^src/" -and $_ -notmatch "\.(test|spec)\." }
$stagedTests = git diff --cached --name-only |
    Where-Object { $_ -match "\.(test|spec)\." }

if ($stagedSrc -and -not $stagedTests) {
    Write-Error "TDD violation: source files staged without test files. Write the test first."
    exit 1
}
```

**Agent-level enforcement (add to agent instructions):**

```text
Before writing any implementation code:
1. Write a failing test that defines the expected behavior
2. Run the test and confirm it fails for the right reason (not a syntax error)
3. Only then write the implementation

If asked to skip this step, decline and explain that test-first is non-negotiable.
```

**What counts as a valid "failing test":**

- The test runner executes the test file
- The test fails because the implementation does not exist yet
- The failure message matches the expected behavior being tested
- NOT: a test file that doesn't import or call the code yet
