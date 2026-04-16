---
name: test-coverage
description: "Identifies untested code paths via coverage analysis and writes targeted unit or integration tests to close the gap. Use when test coverage falls below target, a new module has no tests, preparing for a release, or adding a safety net before refactoring. Covers coverage reports, missing tests, uncovered branches, and test gaps."
metadata:
  version: 1.0.0
  category: testing
  agent_type: general-purpose
---

# Test Coverage Improvement

## When to Use

- Coverage reports show critical modules below target thresholds
- New code was merged without sufficient test coverage
- Preparing for a release and need confidence in code correctness
- Refactoring requires a safety net of comprehensive tests
- Team has set a coverage target that needs to be met

## Workflow

### 1. Generate a Coverage Report

```powershell
# Node.js / Jest
npm test -- --coverage 2>&1 | Select-Object -Last 30

# With specific thresholds
npm test -- --coverage --coverageReporters="text" 2>&1

# Python / pytest
pytest --cov=src --cov-report=term-missing 2>&1

# Go
go test -coverprofile=coverage.out ./... && go tool cover -func=coverage.out
```

### 2. Identify Uncovered Code

```powershell
# Find files with lowest coverage (Jest text output)
npm test -- --coverage --coverageReporters="text" 2>&1 | Select-String "\d+\.\d+\s*\|" | Sort-Object { [double]($_ -split '\|')[1].Trim().TrimEnd('%') }

# Generate detailed HTML report for visual inspection
npm test -- --coverage --coverageReporters="html"
# Report is in coverage/lcov-report/index.html
```

### 3. Prioritize What to Test

Focus testing effort where it matters most:

| Priority | What to Cover | Why |
|----------|--------------|-----|
| 🔴 High | Business logic, calculations | Bugs here cost money |
| 🔴 High | Authentication, authorization | Security-critical |
| 🟡 Medium | Data transformations, parsers | Common source of bugs |
| 🟡 Medium | Error handling paths | Often untested, often broken |
| 🟢 Low | Simple getters/setters | Low risk |
| 🟢 Low | UI layout components | Better tested with E2E |

### 4. Write Targeted Tests

For each uncovered function or branch:

```powershell
# View the uncovered code
# Coverage report shows line numbers — use view tool to see the code

# Find existing test file (or create one)
glob pattern="**/*moduleName*.test.*"
```

```typescript
// Test the happy path
describe('calculateDiscount', () => {
  it('applies 10% discount for orders over $100', () => {
    expect(calculateDiscount(150)).toBe(135);
  });

  // Test edge cases and branches
  it('returns original price for orders under $100', () => {
    expect(calculateDiscount(50)).toBe(50);
  });

  it('handles zero amount', () => {
    expect(calculateDiscount(0)).toBe(0);
  });

  // Test error paths
  it('throws for negative amounts', () => {
    expect(() => calculateDiscount(-10)).toThrow('Amount must be non-negative');
  });
});
```

### 5. Target Uncovered Branches

```powershell
# Find conditional logic that may lack branch coverage
grep -n "if\|switch\|? .*:\|&&\|||" src/target-module.ts
```

Common branch gaps:

- `else` clauses
- `catch` blocks
- Default cases in switch statements
- Short-circuit evaluation (`&&`, `||`)
- Ternary operators
- Early returns

### 6. Measure Improvement

```powershell
# Run coverage again and compare
npm test -- --coverage --collectCoverageFrom="src/target-module.ts" 2>&1

# Verify overall coverage meets target
npm test -- --coverage 2>&1 | Select-String "All files|Statements|Branches"
```

## Examples

### Cover Error Handling

```typescript
// Source: src/api/client.ts has uncovered catch block
describe('apiClient.fetch', () => {
  it('retries on network error', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: () => ({ data: 'ok' }) });

    const result = await apiClient.fetch('/endpoint', { fetch: mockFetch });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.data).toBe('ok');
  });

  it('throws after max retries', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    await expect(apiClient.fetch('/endpoint', { fetch: mockFetch }))
      .rejects.toThrow('Network error');
  });
});
```

### Using task Agent for Coverage Runs

```text
task agent_type: "task"
prompt: "Run 'npm test -- --coverage' and report the coverage summary. List any files below 80% line coverage."
```

## Red Flags

- Tests with no meaningful assertions (`expect(true).toBe(true)`)
- No tests for error paths (catch blocks, failure cases)
- Coverage drops when new features are added
- Only happy path tested, no edge cases

## Verification

- [ ] `npm run coverage` result meets or exceeds the baseline
- [ ] Newly added files have ≥80% coverage
- [ ] Tests exist for all error handling paths
- [ ] Uncovered lines in the coverage report have been reviewed
- [ ] Files/paths excluded from coverage are documented

## Tips

- Cover **branches**, not just lines — branch coverage catches more bugs
- Add coverage thresholds to CI so coverage can't silently regress
