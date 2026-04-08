---
name: architecture-decisions
description: Use when making significant, hard-to-reverse technical decisions to document context, rationale, and consequences as Architecture Decision Records (ADRs)
metadata:
  category: documentation
  agent_type: general-purpose
---

# Architecture Decision Records (ADR)

## When to Use
- 되돌리기 어렵거나 비용이 큰 기술적 결정을 내릴 때
- 기술 스택, 인프라, 데이터 모델, API 설계 변경
- 팀 내 합의가 필요한 아키텍처 논의
- 미래의 팀원이 "왜 이렇게 했지?"라고 물을 것 같은 결정

> `cross-session-memory` 스킬과 연계: ADR을 Copilot의 세션 간 지식으로 활용

## DO NOT use when
- 일상적인 구현 결정 (어떤 변수명을 쓸지 등)
- 명확히 옳은 선택이 있는 경우

## Prerequisites
- 결정해야 할 기술적 선택지가 2개 이상 있음
- 팀에 결정 내용을 전달해야 하거나, 나중에 이 결정의 근거가 필요한 상황
- `docs/decisions/` 디렉토리 (없으면 생성)

## Workflow

### 1. ADR 파일 생성

```bash
# ADR 디렉토리 확인 또는 생성
ls docs/decisions/ 2>/dev/null || echo "docs/decisions 생성 필요"

# 다음 번호 확인
ls docs/decisions/*.md 2>/dev/null | wc -l
```

파일명: `docs/decisions/NNN-decision-title.md` (예: `001-use-postgresql.md`)

### 2. ADR 작성 형식

```markdown
# ADR-{NNN}: {결정 제목}

**날짜**: YYYY-MM-DD  
**상태**: Proposed | Accepted | Deprecated | Superseded by ADR-NNN

## Context (배경)
이 결정이 필요하게 된 상황, 제약 조건, 고려해야 할 영향 요소들.

## Decision (결정)
우리가 내린 결정과 그 이유. 능동태, 현재 시제 사용.

## Options Considered (검토한 대안)
| 옵션 | 장점 | 단점 |
|------|------|------|
| A    | ...  | ...  |
| B    | ...  | ...  |
| 선택한 옵션 | ... | ... |

## Consequences (결과)
- **긍정적**: 이 결정으로 얻는 것
- **부정적**: 감수해야 할 트레이드오프
- **중립적**: 추가로 필요한 작업

## References
- 관련 이슈, PR, 외부 자료 링크
```

### 3. ADR 상태 관리

결정이 변경될 때:
```markdown
**상태**: Superseded by [ADR-005](005-new-decision.md)
```

새 ADR에서 이전 결정을 참조:
```markdown
**상태**: Accepted (Supersedes [ADR-002](002-old-decision.md))
```

### 4. COPILOT-INSTRUCTIONS.md에 연결

중요한 ADR은 Copilot에게 미리 알림:
```markdown
## Key Architecture Decisions
- [ADR-001](docs/decisions/001-postgresql.md): PostgreSQL 선택 이유
- [ADR-003](docs/decisions/003-api-versioning.md): API 버전 전략
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "결정이 명확하니까 문서가 필요 없다" | 6개월 후 팀원이 그 결정에 의문을 가질 것이다. 명확한 결정일수록 기록하기 쉽다. |
| "코드를 보면 알 수 있다" | 코드는 '무엇'을 말하지만 '왜'를 말하지 않는다. ADR은 '왜'를 기록한다. |
| "나중에 쓰겠다" | 결정 시점에서 멀어질수록 컨텍스트를 잃는다. 결정 즉시 기록한다. |

## Red Flags
- "왜 이 라이브러리를 쓰는지 아무도 모른다"
- 이미 시도했다가 실패한 접근법을 팀이 다시 시도하려 함
- 아키텍처 회의에서 같은 논쟁이 반복됨

## Verification
- [ ] ADR 파일이 `docs/decisions/` 에 번호 형식으로 존재
- [ ] 모든 4개 필수 섹션 작성됨 (Context, Decision, Consequences, 상태)
- [ ] 검토한 대안이 기록됨
- [ ] 관련 PR 또는 이슈에서 ADR 링크됨

## Tips
- 완벽한 ADR보다 존재하는 ADR이 낫다 — 짧아도 된다
- `council` 스킬의 4-voice adversarial 결정 과정을 ADR Options Considered에 기록한다
- ADR 인덱스를 `docs/decisions/README.md`로 유지하면 탐색이 쉽다
