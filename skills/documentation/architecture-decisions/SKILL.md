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
- 기존 ADR 위치를 찾을 수 있거나, 아무 관례가 없으면 fallback 위치로 `docs/decisions/` 를 만들 준비가 되어 있음

## Workflow

### 1. 기존 ADR 관례 먼저 탐지

새 ADR을 쓰기 전에 **기본 템플릿부터 적용하지 말고**, 이 저장소가 이미 쓰고 있는
ADR 관례를 먼저 찾는다. 기본 템플릿은 **아무 관례도 감지되지 않을 때만** fallback으로 사용한다.

다음 4축을 확인:

1. **위치**: `docs/adr/`, `docs/decisions/`, `adr/` 등 기존 ADR 디렉토리
2. **형식/템플릿**: MADR 스타일, `adr-tools` 생성 형식, 자유 서술형 Markdown, reStructuredText 등
3. **번호 체계**: 가장 큰 기존 번호를 찾아 그 다음 번호를 사용 (1부터 다시 시작하거나 추측 금지)
4. **헤딩/섹션 스타일**: 기존 ADR의 제목, 상태 표기, 섹션 이름을 그대로 재사용

로컬 저장소만 보지 말고, 접근 가능하다면 조직 공용 규칙도 함께 확인:

- 조직 공용 템플릿 저장소나 문서 허브의 ADR 규칙 (GitHub 조직이라면 `.github` 저장소 포함)
- 열려 있는 PR/리뷰 요청에서 새 ADR이 어떤 형식으로 추가되고 있는지

예시 확인 방법:

```bash
# 로컬 ADR 후보 위치 확인
find . -type d \( -name adr -o -name adrs -o -name decisions \)

# 기존 ADR 파일과 번호/헤딩 스타일 확인
find . -type f \( -name '*.md' -o -name '*.rst' \) | grep -Ei 'adr|decision'

# 조직 공용 템플릿 저장소 / 문서 허브 / 열려 있는 PR에서 ADR 관례 확인
# (GitHub를 쓰고 gh 접근이 가능하면 org-level .github repo와 open PR 확인 포함)
gh repo view <org>/.github
gh search prs --owner <org> --state open -- 'ADR OR "architecture decision"'
```

관례가 감지되면 **그 관례에 맞춰 작성**한다. 위치, 파일명, 번호, 헤딩을
새로 발명하지 않는다. 위 원격 확인은 선택적 보강 단계이며, 특정 호스팅 도구가
없어도 핵심 규칙은 **기존 관례 우선, 기본 템플릿 fallback**이다.

### 2. ADR 파일 생성

```bash
# 감지된 ADR 위치를 그대로 사용하고, 아무 관례가 없을 때만 fallback 사용
ADR_DIR=<detected-adr-dir-or-docs/decisions>

# 다음 번호는 "파일 개수"가 아니라 "가장 큰 기존 번호 + 1"
NEXT_ADR_NUMBER=<highest-existing-number-plus-one>
```

파일명도 감지된 관례를 우선한다. fallback 예시는
`docs/decisions/NNN-decision-title.md` (예: `001-use-postgresql.md`)

> 위 형식은 **기본 fallback 예시**다. 저장소에 기존 ADR 관례가 있으면 그 형식과 번호 체계를 우선한다.

### 3. ADR 작성 형식

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

### 4. ADR 상태 관리

결정이 변경될 때:

```markdown
**상태**: Superseded by [ADR-005](005-new-decision.md)
```

새 ADR에서 이전 결정을 참조:

```markdown
**상태**: Accepted (Supersedes [ADR-002](002-old-decision.md))
```

### 5. COPILOT-INSTRUCTIONS.md에 연결

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

- [ ] 기존 ADR 관례를 먼저 조사했고, 감지되면 그 위치/형식/번호/헤딩 스타일을 재사용함
- [ ] ADR 파일이 기존 ADR 위치에 맞게 존재하며, 번호는 최고 기존 번호 다음 값을 사용함
- [ ] 감지된 ADR 관례의 필수 섹션을 모두 따랐거나, 관례가 없으면 fallback 템플릿의 핵심 섹션(Context, Decision, Consequences, 상태)을 작성함
- [ ] 검토한 대안이 기록됨
- [ ] 관련 PR 또는 이슈에서 ADR 링크됨

## Tips

- 완벽한 ADR보다 존재하는 ADR이 낫다 — 짧아도 된다
- `council` 스킬의 4-voice adversarial 결정 과정을 ADR Options Considered에 기록한다
- ADR 인덱스를 `docs/decisions/README.md`로 유지하면 탐색이 쉽다
