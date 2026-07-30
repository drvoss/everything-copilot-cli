---
name: tdd-workflow
description: Use when starting a new feature or function to write failing tests first, then implement the minimal code to pass (Red→Green→Refactor)
metadata:
  category: development
  agent_type: general-purpose
---

# TDD Workflow

## When to Use

- Building new features where correctness is critical
- Fixing bugs where a regression test should be written first
- Refactoring code that lacks test coverage
- Working on business logic, parsers, or data transformations

## Prerequisites

- Test framework installed and configured (Jest, pytest, Go test, etc.)
- Ability to run tests from the command line
- Understanding of the feature requirements or bug to reproduce

| Language | Common frameworks | Example commands |
|----------|-------------------|------------------|
| JavaScript / TypeScript | Jest, Vitest | `npm test`, `npx vitest` |
| Python | pytest | `pytest` |
| Go | go test | `go test ./...` |
| Ruby | RSpec, Minitest | `bundle exec rspec`, `ruby -Itest test/` |
| PHP | PHPUnit | `./vendor/bin/phpunit` |
| Rust | cargo test | `cargo test` |

> **tdd-guard users**: v1.7.0 improves SDK validation error handling, reduces response
> tokens for allow-operation, and refactors hook-payload parsing. After `bundle add tdd-guard`,
> re-check its framework detection before relying on automatic enforcement.

## Workflow

### 0. Choose the Thinnest Slice First

Before you write or change anything, shrink the task to the smallest meaningful behavior that can
go through one Red → Green → Refactor loop.

Good first slices usually have all three properties:

- one visible behavior change
- one main assertion path
- one reason it could fail

If the first test needs multiple branches, multiple modules, or a large fixture to make sense,
shrink it again. After each Green phase, pause long enough to confirm the direction before stacking
more behavior on top.

### 1. Pre-Check — Does a Test Already Exist?

Before writing a new test, verify you are not duplicating existing coverage.

```text
glob pattern="**/*.{test,spec}.{js,jsx,ts,tsx}"
glob pattern="**/{test_*,*_test}.py"
glob pattern="**/*_test.go"
rg pattern="<function-or-behavior-name>" path="."
```

If an equivalent test already exists, extend or correct it instead of creating a
duplicate. If not, proceed to write the failing test.

### 2. Red — Write a Failing Test

Identify the behavior to implement, then write a test that asserts it.

```bash
# Find existing test files to follow conventions
```

```text
glob pattern="**/*.test.{ts,js,tsx}" # or **/*_test.go, **/test_*.py
```

Write a focused test using `create` or `edit`:

```javascript
// example: src/utils/parse.test.ts
describe('parseConfig', () => {
  it('should return default values when input is empty', () => {
    expect(parseConfig({})).toEqual({ timeout: 30, retries: 3 });
  });
});
```

Run the test and confirm it **fails**:

```powershell
npm test -- --testPathPattern="parse.test" 2>&1 | Select-Object -Last 20
```

Every test must name the break it catches: its name or a focused comment should answer which
production regression makes it fail. Every test must also exercise the real behavior; a test that
only verifies its mock can stay green while the implementation is broken.

Avoid change-detector tests that can fail only when an intentional constant, exact message, or
private structure changes; they fire on redesign and sleep through behavioral bugs. Likewise,
asserting that a script, skill, or config contains an exact string proves only that the source
contains that string. Exercise the consuming behavior, output, side effect, or exit code instead.

Before finishing, perform a mutation check: deliberately make a safe, temporary break in the
implementation and confirm that the relevant test fails, then restore it. If no test detects the
mutation, the behavior is unprotected or the test is tautological.

### 3. Green — Write Minimal Code to Pass

Implement only enough code to make the failing test pass. Resist the urge to add extras.

```typescript
// src/utils/parse.ts
export function parseConfig(input: Record<string, unknown>) {
  return { timeout: input.timeout ?? 30, retries: input.retries ?? 3 };
}
```

Run the test again and confirm it **passes**:

```powershell
npm test -- --testPathPattern="parse.test"
```

### 4. Refactor — Clean Up Without Changing Behavior

Improve code structure, naming, and duplication while keeping all tests green.

**Exception — type-only edits**: Adding type annotations, cleaning up imports, or
renaming for clarity without changing behavior does not require a prior failing test.
Restrict this exception to structural changes only; any logic change must still go
through Red → Green first.

```powershell
# Run full test suite to ensure nothing else broke
npm test 2>&1 | Select-Object -Last 30
```

### 5. Repeat the Cycle

Add the next test case for edge cases or the next slice of behavior:

- Null/undefined inputs
- Boundary values
- Error conditions
- Integration with adjacent modules

Pick the smallest next slice that adds new information. If the product direction, API shape, or UX
is still uncertain, stop after a thin vertical slice and get feedback before widening the change.

### 6. Check Coverage

```powershell
npm test -- --coverage --collectCoverageFrom="src/utils/parse.ts"
```

Aim for **≥80% line coverage** on new code, **100% branch coverage** on critical paths.

## Examples

### Bug Fix TDD

```powershell
# 1. Reproduce the bug as a test
#    grep for the failing function, write a test with the exact input that causes the bug
grep -n "calculateTotal" src/billing/*.ts

# 2. Run and see it fail
npm test -- --testPathPattern="billing"

# 3. Fix the code
# 4. Run and see it pass
# 5. Add edge-case tests around the fix
```

### Multi-file Feature

```powershell
# Use the task agent to run tests continuously while you code
# Start test watcher in async mode
npx jest --watch --testPathPattern="feature" # mode: async
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "This code is too simple to need tests" | Simple code still has edge cases. A 5-line function can have 3. |
| "I'll add tests later" | Later never comes. Untested code becomes legacy code overnight. |
| "It works, I can see it" | Manual verification is not reproducible. CI will catch what you missed. |
| "Copilot wrote it, so it must be right" | AI-generated code requires the same verification standards as human-written code. |
| "Tests still pass after refactoring" | Tests must exist before refactoring — otherwise they provide no safety net. |

## TDD Guardrail Enforcement

Prevent implementation code from being committed without a corresponding failing test.
Add this pre-commit check to your workflow:

```powershell
# Verify that implementation files have corresponding test files staged
$stagedSrc = git diff --cached --name-only | Where-Object { $_ -match "^src/" -and $_ -notmatch "\.test\." }
$stagedTests = git diff --cached --name-only | Where-Object { $_ -match "\.test\." }

if ($stagedSrc -and -not $stagedTests) {
    Write-Error "TDD violation: source files staged without corresponding test files."
    Write-Error "Write a failing test first, then implement."
    exit 1
}
```

To enforce this automatically, add it as a Git pre-commit hook:

```powershell
# .git/hooks/pre-commit (chmod +x on Unix)
# See rules/common/testing.md for the full hook content
```

## Red Flags

- Tests written after implementation with 100% pass rate (tests never saw a red state)
- Test files committed after source files
- Tests like `it('works')` with no meaningful assertions
- Tests that call internal implementations directly (testing private methods instead of public API)
- Tests written only to meet coverage numbers with no real assertions
- AI-generated implementation code committed before a failing test was written

## Verification

- [ ] Confirmed tests started in a Red state (via commit history or direct observation)
- [ ] `npm test` (or equivalent) exits with code 0
- [ ] Line coverage ≥80% and branch coverage ≥90% on critical paths for new code
- [ ] Each test runs independently (no ordering dependencies)
- [ ] Tests exist for edge cases (null, empty values, boundary values)

## Tips

- Write the **assertion first**, then work backward to the setup
- Start with the **smallest meaningful behavior**, not the full feature
- Each test should verify **one behavior** — keep tests small and descriptive
- Name tests as sentences: `it('rejects negative quantities')`
- Use `task` agent to run tests so output stays clean in your main context
- If you can't write a test easily, the code may need a better interface — that's valuable feedback
- Commit after each Green phase so you can safely revert a failed refactor
- Claude Code users can also study
  [tdd-guard](https://github.com/nizos/tdd-guard) for hook-based TDD enforcement
