---
name: spec-driven-development
description: Use before starting any non-trivial feature to write a technical spec first — prevents misaligned implementation and scope creep
metadata:
  category: development
  agent_type: general-purpose
---

# Spec-Driven Development

## When to Use

- 구현에 2시간 이상 걸리는 기능을 시작할 때
- 요구사항이 불명확한 기능을 작업할 때
- 다른 팀이 소비하는 인터페이스를 설계할 때
- `/create-prd` 실행 후 제품 스펙을 기술 스펙으로 전환할 때
- Copilot의 Plan Mode에 진입하기 전 사전 정의가 필요할 때

## DO NOT use when

- 범위가 명확한 단순 버그 수정
- 복사 변경이나 사소한 UI 조정

## Prerequisites

- 요구사항 또는 이슈 내용이 존재
- 프로젝트 구조와 기술 스택 파악 완료

## Workflow

### 1. 스펙 문서 생성

기능 디렉토리 또는 프로젝트 루트에 `SPEC.md` 생성:

```bash
# 관련 기존 파일 파악
glob pattern="src/**/*.ts" # 유사 기능 찾기
grep -rn "관련_키워드" src/
```

**필수 6개 섹션:**

#### Objective (목표)

한 문장. 무엇이 왜 바뀌는가.

#### Interface (인터페이스)

계약 우선. CLI 플래그, API 엔드포인트, 함수 시그니처, 이벤트 이름.
구현 전에 인터페이스를 확정한다.

#### Project Structure (프로젝트 구조)

변경될 파일, 새로 생성될 파일, 삭제될 파일 목록.

#### Code Style (코드 스타일)

이 기능에 특정하게 적용되는 컨벤션. 기존 `rules/` 파일을 참조.

#### Testing Strategy (테스트 전략)

테스트 종류, 커버리지 목표, mock 범위.

#### Boundaries (범위 경계)

이 스펙이 명시적으로 포함하지 않는 것. "~은 하지 않는다"를 명문화.

### 2. 스펙 리뷰 체크포인트

코드 작성 전 각 섹션에 대해 확인:

- 스펙만으로 구현 가능한가? (추가 질문 없이)
- 인터페이스가 모호하지 않은가?
- 테스트 케이스가 구체적으로 명시되었는가?
- Boundaries가 명확한가?

### 3. 스펙을 소스 코드와 함께 커밋

```bash
git add SPEC.md src/new-feature.ts
git commit -m "feat(feature-name): add spec and initial implementation"
```

스펙은 코드와 함께 버전 관리된다. 구현이 스펙에서 벗어나면 스펙을 먼저 업데이트한다.

### 4. 스펙 사후 검토

구현 완료 후: 스펙이 현실을 예측했는가? 다음번을 위한 교훈을 기록.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "요구사항이 머릿속에 명확하다" | 머릿속의 요구사항은 검토, 테스트, 공유가 불가능하다. |
| "코드로 바로 가는 게 더 빠르다" | 잘못된 구현을 고치는 비용이 스펙 작성 비용보다 크다. |
| "프로토타입 후에 스펙을 쓰겠다" | 프로토타입은 프로덕션이 된다. 스펙은 결코 쓰이지 않는다. |
| "PRD가 이미 있다" | PRD는 제품 동작을 설명한다. 스펙은 기술 인터페이스와 구조를 설명한다. |
| "에이전트에게 맡기면 알아서 할 것이다" | 에이전트도 명확한 인터페이스와 경계가 없으면 잘못된 방향으로 구현한다. |

## Red Flags

- 구현이 이슈 설명과 문서화된 이유 없이 다름
- 구현 완료 후 처음 실행에 100% 통과하는 테스트 (실패를 본 적 없음)
- "인터페이스는 만들면서 정하겠다"
- PR 설명이 "X 기능 추가"만 있고 기술적 컨텍스트 없음
- 스펙 없이 Plan Mode 진입

## Verification

- [ ] 코드 첫 커밋 전에 `SPEC.md` 또는 동등한 문서 존재
- [ ] 6개 섹션 모두 작성됨 (Interface와 Testing에 "TBD" 없음)
- [ ] 구현이 스펙의 인터페이스와 일치
- [ ] 벗어난 사항이 있다면 스펙이 먼저 업데이트됨

## Examples

### CLI 명령어 추가 스펙

```markdown
# SPEC: `copilot skill install`

**Objective**: URL 또는 로컬 경로에서 스킬을 CLI로 설치할 수 있도록 한다.

**Interface**:
- `copilot skill install <url-or-path>`
- `copilot skill install --dry-run` (설치될 내용 미리보기)
- Exit code: 0 성공, 1 검증 실패, 2 네트워크 오류

**Project Structure**:
- 신규: `src/commands/skill-install.ts`
- 수정: `src/cli.ts` (명령어 등록)
- 신규: `tests/commands/skill-install.test.ts`

**Code Style**: `src/commands/` 내 기존 명령어 패턴 준수

**Testing Strategy**:
- URL 검증 및 경로 해석 단위 테스트
- 픽스처 스킬 디렉토리로 통합 테스트
- 네트워크 호출 mock; 실제 파일 I/O 테스트

**Boundaries**: 인증, 비공개 저장소, 버전 고정은 이 스펙에 포함하지 않는다.
```

## Tips

- 스펙은 완벽할 필요가 없다 — 인터페이스와 경계가 명확하면 충분하다
- `create-prd` 스킬로 제품 스펙을 먼저 만든 뒤 이 스킬로 기술 스펙을 작성한다
- 스펙이 너무 길어진다면 범위가 너무 크다는 신호다 — 분리를 검토한다
