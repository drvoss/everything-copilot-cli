---
name: refactor-clean
description: Use when code has grown complex, duplicated, or cluttered — clean up structure and remove dead code without changing observable behavior
metadata:
  category: development
  agent_type: general-purpose
---

# Refactor & Clean Code

## When to Use
- Code is correct but hard to read, modify, or extend
- Duplicated logic exists across multiple files
- Functions or classes have grown too large
- Preparing code for a new feature that requires structural changes
- After a rapid prototype that needs production-quality cleanup

## Prerequisites
- Existing tests that cover the code to refactor (add tests first if missing)
- All tests passing before starting
- Code committed so you can revert if needed

## Workflow

### 1. Identify Code Smells
```powershell
# Find long files (likely doing too much)
Get-ChildItem -Recurse -Include *.ts,*.js,*.py,*.go | Where-Object { (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 300 } | Select-Object FullName, @{N='Lines';E={(Get-Content $_.FullName | Measure-Object -Line).Lines}}

# Find duplicated string patterns
grep -rn "pattern-you-suspect-is-duplicated" src/ --include="*.ts"

# Find functions with too many parameters (>4 is a smell)
grep -n "function.*,.*,.*,.*," src/**/*.ts
```

Common smells to look for:
- **Long functions** (>40 lines) — extract smaller functions
- **Duplicate code** — extract shared utility
- **Deep nesting** (>3 levels) — use early returns or extract
- **God objects** — split into focused classes/modules
- **Primitive obsession** — introduce domain types
- **Feature envy** — move logic to the class that owns the data

### 2. Establish a Safety Net
```powershell
# Run existing tests and record baseline
npm test 2>&1 | Tee-Object -Variable baseline
echo $baseline | Select-Object -Last 5

# If coverage is low, write characterization tests first
npm test -- --coverage --collectCoverageFrom="src/module-to-refactor.ts"
```

### 3. Plan the Refactoring
Before touching code, decide on the transformation:
- **Extract Function** — pull a block into a named function
- **Extract Module** — move related functions to a new file
- **Rename** — improve names for clarity
- **Inline** — remove unnecessary indirection
- **Replace Conditional with Polymorphism** — use strategy pattern
- **Introduce Parameter Object** — group related parameters

### 4. Make Small, Incremental Changes
Each change should be:
1. A single refactoring operation
2. Followed by running tests
3. Committed if tests pass

```powershell
# After each refactoring step
npm test 2>&1 | Select-Object -Last 10

# If tests break, revert and try a smaller step
git checkout -- src/module-to-refactor.ts
```

### 5. Verify Behavior is Preserved
```powershell
# Full test suite must still pass
npm test

# Compare coverage — it should not decrease
npm test -- --coverage
```

## Examples

### Extract Repeated Logic
```typescript
// BEFORE: duplicated validation in multiple handlers
function createUser(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  // ... create logic
}
function updateUser(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  // ... update logic
}

// AFTER: extracted to a shared validator
function validateEmail(email: string): void {
  if (!email || !email.includes('@')) throw new Error('Invalid email');
}
function createUser(data) { validateEmail(data.email); /* ... */ }
function updateUser(data) { validateEmail(data.email); /* ... */ }
```

### Flatten Deep Nesting with Early Returns
```typescript
// BEFORE
function process(input) {
  if (input) {
    if (input.isValid) {
      if (input.data.length > 0) {
        return transform(input.data);
      }
    }
  }
  return null;
}

// AFTER
function process(input) {
  if (!input || !input.isValid || input.data.length === 0) return null;
  return transform(input.data);
}
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "이 코드가 뭔지 모르지만 안 쓰이는 것 같다" | 확실히 모른다면 제거하지 않는다. `git blame`으로 맥락을 파악한다. (Chesterton's Fence) |
| "리팩터를 하면서 기능도 같이 추가하겠다" | 리팩터와 기능 추가를 분리한다. 두 개를 동시에 하면 디버깅이 불가능해진다. |
| "테스트가 통과하니까 리팩터가 맞다" | 리팩터 전에 테스트가 있어야 의미있다. 테스트가 없다면 먼저 작성한다. |
| "타입스크립트가 경고 안 하면 지워도 된다" | 동적 import, reflection, 외부 참조는 타입 시스템이 감지 못한다. |

## Red Flags
- 리팩터 커밋에 기능 변경이 포함됨
- Dead code 제거 후 테스트 없음
- `// @ts-ignore`나 `any` 타입으로 타입 오류 회피
- 리팩터 전후 동일한 테스트를 통과하는지 확인 안 함
- "나중에 정리하겠다"는 TODO 없이 복잡한 코드 방치

## Verification
- [ ] 리팩터 전후 `npm test` 동일하게 통과
- [ ] 제거된 코드가 실제 미사용임을 확인 (`grep -rn` 또는 IDE 참조 검색)
- [ ] 복잡도 지표 개선 (함수 길이, 중첩 깊이 감소)
- [ ] 리팩터 커밋에 기능 변경 없음 (커밋 메시지: `refactor:`)
- [ ] PR에 리팩터 동기 명시 (왜 이 코드를 정리했는가)

## Tips
- **Never refactor and add features in the same commit** — keep them separate
- Use `explore` agent to understand call graphs before renaming or moving functions
- Use `grep` to find all callers before changing a function signature
- If tests are missing, write them first — refactoring without tests is gambling
- Commit after every successful small refactoring — you can always squash later
- The best refactoring is deleting code: look for dead code with `grep` and remove it
