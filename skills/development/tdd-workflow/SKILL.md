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

## Workflow

### 1. Red — Write a Failing Test
Identify the behavior to implement, then write a test that asserts it.

```bash
# Find existing test files to follow conventions
```
```
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

### 2. Green — Write Minimal Code to Pass
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

### 3. Refactor — Clean Up Without Changing Behavior
Improve code structure, naming, and duplication while keeping all tests green.

```powershell
# Run full test suite to ensure nothing else broke
npm test 2>&1 | Select-Object -Last 30
```

### 4. Repeat the Cycle
Add the next test case for edge cases or the next slice of behavior:
- Null/undefined inputs
- Boundary values
- Error conditions
- Integration with adjacent modules

### 5. Check Coverage
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
| "이 코드는 너무 간단해서 테스트가 필요 없다" | 간단한 코드도 엣지 케이스를 가진다. 5줄 함수에 3개의 엣지 케이스가 있을 수 있다. |
| "테스트는 나중에 추가하겠다" | '나중'은 오지 않는다. 테스트 없는 코드는 그날 밤 레거시가 된다. |
| "작동하는 걸 눈으로 확인했다" | 수동 검증은 재현 가능하지 않다. CI에서 실패하거나 다음 사람이 망가뜨린다. |
| "Copilot이 짜줬으니 맞을 것이다" | AI 생성 코드도 동일한 검증 기준을 적용해야 한다. |
| "리팩터 후 테스트가 여전히 통과한다" | 리팩터 전에 테스트가 있어야 그 의미가 있다. |

## Red Flags
- 구현 완료 후 100% 통과율로 테스트를 작성함 (테스트가 실패를 본 적 없음)
- 테스트 파일이 소스 파일보다 나중에 커밋됨
- `it('works')` 같이 검증 내용이 없는 테스트
- 테스트가 내부 구현을 직접 호출 (public API가 아닌 private method 테스트)
- 커버리지 숫자만 채우기 위한 assertion 없는 테스트

## Verification
- [ ] 테스트가 Red 상태에서 시작했음을 확인 (커밋 히스토리 또는 직접 확인)
- [ ] `npm test` (또는 해당 명령어)가 0으로 종료
- [ ] 새 코드의 라인 커버리지 ≥80%, 핵심 경로 브랜치 커버리지 ≥90%
- [ ] 각 테스트가 독립적으로 실행 가능 (순서 의존성 없음)
- [ ] 엣지 케이스 (null, 빈 값, 경계값)에 대한 테스트 존재

## Tips
- Write the **assertion first**, then work backward to the setup
- Each test should verify **one behavior** — keep tests small and descriptive
- Name tests as sentences: `it('rejects negative quantities')`
- Use `task` agent to run tests so output stays clean in your main context
- If you can't write a test easily, the code may need a better interface — that's valuable feedback
- Commit after each Green phase so you can safely revert a failed refactor
