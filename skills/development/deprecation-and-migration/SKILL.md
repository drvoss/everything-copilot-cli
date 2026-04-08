---
name: deprecation-and-migration
description: Use when removing old APIs, migrating to new patterns, or cleaning up legacy code — treats code as liability and follows a structured removal process
metadata:
  category: development
  agent_type: general-purpose
---

# Deprecation and Migration

## When to Use
- API/함수를 제거하거나 교체할 때
- 라이브러리 또는 패턴을 마이그레이션할 때
- 레거시 코드를 점진적으로 제거할 때
- Breaking change를 포함한 메이저 버전 릴리즈 준비

> 코드는 자산이 아닌 **부채**다. 유지해야 할 코드가 많을수록 비용이 증가한다.

## Prerequisites
- 현재 사용처 파악 (`grep -rn "deprecated_api"`)
- 대체 API 또는 패턴 준비됨
- 영향 받는 팀/소비자 파악

## Workflow

### 1. 사용처 파악 및 영향 분석

```bash
# 제거할 심볼의 모든 사용처 찾기
grep -rn "oldFunction\|OldClass\|OLD_CONSTANT" src/ --include="*.ts"

# 외부 소비자 확인 (공개 npm 패키지인 경우)
# npm 레지스트리에서 역의존성 확인
open https://www.npmjs.com/package/your-package-name?activeTab=dependents
# 또는 GitHub에서 usage 검색
gh search code "from 'your-package-name'" --limit 20
```

### 2. 3단계 Deprecation 프로세스

#### Phase 1: 경고 추가 (Soft Deprecation)
```typescript
/** @deprecated Use `newFunction()` instead. Will be removed in v3.0. */
export function oldFunction() {
  console.warn('[Deprecated] oldFunction() will be removed in v3.0. Use newFunction() instead.');
  return newFunction();
}
```

#### Phase 2: 마이그레이션 가이드 작성
CHANGELOG와 문서에 기록:
```markdown
## Migration Guide: v2 → v3

### `oldFunction()` → `newFunction()`
Before: `oldFunction(arg1, arg2)`
After: `newFunction({ param1: arg1, param2: arg2 })`
```

#### Phase 3: 제거 (Hard Removal)
메이저 버전 업에서만 제거. 제거 전 마지막 확인:

```bash
# 코드베이스 내 잔여 사용처 없는지 확인
grep -rn "oldFunction" src/ tests/
# 결과: 0건이어야 제거 가능
```

### 3. Strangler Fig 패턴 (점진적 마이그레이션)

전면 교체 대신 신구 코드가 공존하며 점진적으로 전환:

```
Old System ─┐
            ├─→ Router/Adapter ─→ New System (새 요청)
Old System ←┘                  (기존 요청은 old로)
```

Copilot의 `session-management` 스킬로 마이그레이션 진행 상황 추적:
```sql
INSERT INTO todos (id, title, status) VALUES ('migrate-user-service', 'Migrate UserService to new auth', 'in_progress');
```

### 4. 완전 제거 체크리스트

```bash
# 1. 모든 사용처 제거 확인
grep -rn "oldPattern" . --include="*.{ts,js,py}"

# 2. 테스트 파일도 확인
grep -rn "oldPattern" tests/

# 3. 문서에서도 제거
grep -rn "oldPattern" docs/ README.md

# 4. 마이그레이션 완료 후 어댑터/wrapper 제거
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "혹시 모르니 deprecated 코드를 남겨두겠다" | 남겨둔 코드는 유지보수 대상이 된다. 제거하거나 명시적으로 tombstone 처리한다. |
| "사용처를 다 찾을 수 없어서 못 지운다" | `grep`과 IDE로 정확히 찾을 수 있다. 찾을 수 없다면 동적 호출이다 — 이것도 문서화해야 한다. |
| "한 번에 전부 바꾸겠다" | 큰 마이그레이션은 실패한다. Strangler Fig로 점진적으로 전환한다. |
| "하위 호환성을 영원히 유지해야 한다" | 하위 호환성에는 비용이 있다. Breaking change를 두려워하지 않는다. Semantic versioning이 있다. |

## Red Flags
- `@deprecated` 주석만 있고 언제 제거하는지 없음
- 제거 예정 코드가 수년간 남아있음
- 마이그레이션 가이드 없는 breaking change
- 제거 전 `grep`으로 잔여 사용처 확인 안 함

## Verification
- [ ] 제거된 API의 모든 사용처가 마이그레이션됨
- [ ] `grep -rn "removed_symbol"` 결과 0건
- [ ] CHANGELOG에 breaking change 기록됨
- [ ] 마이그레이션 가이드가 문서에 포함됨
- [ ] 마이그레이션 후 전체 테스트 통과

## Tips
- `refactor-clean` 스킬과 함께 사용: 제거 후 남은 dead code 정리
- `add-to-changelog` 스킬로 마이그레이션 가이드를 CHANGELOG에 자동 추가
- 공개 라이브러리라면 deprecation warning을 최소 1 메이저 버전 동안 유지한다
