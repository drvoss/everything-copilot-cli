---
name: context-engineering
description: Use when designing prompts or agent tasks to optimize information delivery — minimize noise, maximize signal for AI agents
metadata:
  category: development
  agent_type: general-purpose
---

# Context Engineering

## When to Use
- AI 에이전트에게 복잡한 태스크를 위임할 때
- 에이전트가 잘못된 방향으로 반복 작업할 때
- 긴 컨텍스트에서 에이전트 성능이 저하될 때
- 여러 에이전트가 협업하는 파이프라인을 설계할 때

> `context-prime` (Copilot 전용)과의 차이:
> - `context-prime`: 세션 시작 시 프로젝트 컨텍스트 로딩
> - `context-engineering`: 태스크 단위로 최적의 정보를 구조화하는 기법

## Prerequisites
- 위임할 태스크의 목표와 범위가 명확
- 관련 파일 목록 또는 도메인 파악

## Workflow

### 1. 신호 대 잡음 분석

에이전트에게 전달할 정보를 분류:

| 정보 유형 | 포함 여부 | 이유 |
|----------|---------|------|
| 직접 관련 코드 파일 | ✅ 포함 | 에이전트가 수정해야 할 대상 |
| 인터페이스/타입 정의 | ✅ 포함 | 계약 이해에 필수 |
| 관련 없는 파일 | ❌ 제외 | 토큰 낭비, 집중도 저하 |
| 전체 README | ❌ 제외 (요약으로) | 길이 대비 정보량 낮음 |
| 이미 알려진 정보 | ❌ 제외 | 중복 토큰 낭비 |

### 2. Progressive Disclosure (단계적 정보 제공)

모든 정보를 한 번에 주지 않는다. 단계별로 필요한 정보만:

```
Phase 1: 태스크 정의 + 인터페이스 계약
Phase 2: 구현 시작 → 관련 파일 추가
Phase 3: 테스트 → 테스트 패턴 참조 추가
```

### 3. 구조화된 컨텍스트 템플릿

에이전트 지시 시 다음 형식 사용:

```
## Task
[단일 명확한 목표]

## Given (이미 알고 있는 것)
- [파일 경로]: [역할]
- [인터페이스 계약]

## Constraints (하지 말아야 할 것)
- [금지 사항]
- [수정하면 안 되는 파일]

## Done When (완료 기준)
- [ ] [구체적이고 검증 가능한 기준]
```

### 4. 컨텍스트 윈도우 예산 관리

Copilot CLI의 모델 컨텍스트 예산 기준:
- **짧은 태스크** (Claude Haiku): 파일 2~3개, 명확한 목표
- **중간 태스크** (GPT-4o): 파일 5~10개, 인터페이스 계약
- **긴 태스크** (Claude Opus): 파일 10~20개, 전체 모듈 수준

### 5. 결과 검증 루프

에이전트 결과가 기대와 다를 때:
1. 컨텍스트에서 모호한 부분 찾기
2. Constraints에 명시적 금지사항 추가
3. Done When 기준을 더 구체화
4. (반복) → 에이전트 재실행

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "에이전트에게 많은 정보를 줄수록 좋다" | 관련 없는 정보는 에이전트를 산만하게 한다. 신호 대 잡음비가 중요하다. |
| "전체 코드베이스를 컨텍스트로 주겠다" | 토큰 낭비이며 에이전트 성능을 저하시킨다. 관련 파일만 선택한다. |
| "자연어로 설명하면 에이전트가 알아서 한다" | 구체적인 완료 기준 없이는 에이전트가 멈출 지점을 모른다. |

## Red Flags
- 에이전트가 같은 실수를 반복함
- 에이전트 응답이 질문에서 많이 벗어남
- 태스크 지시에 "Done When" 기준이 없음
- 전체 README나 전체 파일을 컨텍스트로 붙여넣음

## Verification
- [ ] 태스크 지시에 단일 명확한 목표 포함
- [ ] 관련 없는 파일이 컨텍스트에서 제외됨
- [ ] 완료 기준이 검증 가능하게 명시됨
- [ ] 에이전트 결과가 완료 기준을 충족함

## Examples

### Before (나쁜 예)
```
"프로젝트를 보고 버그를 찾아서 고쳐줘"
```

### After (좋은 예)
```
## Task
`src/auth/token.ts`의 JWT 만료 시간 검증 버그를 수정한다.

## Given
- `src/auth/token.ts`: 수정 대상 파일
- `src/auth/token.test.ts`: 기존 테스트
- 버그: `exp` 클레임이 Unix timestamp인데 ms로 비교함

## Constraints
- `src/auth/` 외 파일 수정 금지
- 기존 함수 시그니처 변경 금지

## Done When
- [ ] 기존 테스트 모두 통과
- [ ] `exp` 비교가 초(seconds) 단위로 수정됨
- [ ] 새 엣지 케이스 테스트 (만료 직전/직후) 추가됨
```

## Tips
- `spec-driven-development` 스킬과 연계: 스펙이 곧 컨텍스트 템플릿이 된다
- Copilot의 `multi-model-strategy` 스킬로 태스크 복잡도에 맞는 모델을 선택한다
- 에이전트가 두 번 연속 틀리면 컨텍스트 구조 자체를 재검토한다
