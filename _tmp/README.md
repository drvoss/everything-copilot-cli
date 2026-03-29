# 검증 패키지 인덱스

> 생성 일시: 2026-03-29

## 목적

이 폴더는 **awesome-claude-code → everything-copilot-cli 마이그레이션 계획**의
타당성을 외부 검토자(사람 또는 AI)가 검증할 수 있도록 필요한 모든 정보를 담고 있다.

---

## 파일 목록

| 파일 | 내용 | 독자 |
|------|------|------|
| [`01-source-repo-snapshot.md`](./01-source-repo-snapshot.md) | 원본 저장소(awesome-claude-code) 구조, 카테고리, 핵심 파일 내용 발췌 | "원본이 무엇인가?" |
| [`02-target-repo-snapshot.md`](./02-target-repo-snapshot.md) | 현재 저장소(everything-copilot-cli) 구조, 기존 스킬 현황, Gap 분석 | "현재 무엇이 있는가?" |
| [`03-migration-rationale.md`](./03-migration-rationale.md) | 항목별 What/Why/How + 우선순위 + 리스크 + 검증 체크리스트 | "왜 이렇게 바꾸는가?" |
| [`04-multi-ai-evaluation.md`](./04-multi-ai-evaluation.md) | Claude Code + Gemini CLI + Codex CLI 3-AI 종합 평가 | "검토 결과는?" |

---

## 빠른 요약

### 핵심 작업 (6개 Phase)

```
Phase 1: skills/ 카테고리 README 명문화
Phase 2: 핵심 slash-commands → Copilot skills 포팅 (7개 스킬)
          commit-workflow, pr-multi-perspective-review, fix-github-issue,
          create-prd, add-to-changelog, release, context-prime
Phase 3: evaluate-repository → skills/security/ 포팅
Phase 4: 다중 AI 오케스트레이션 패턴 2개 신규 (fan-out-parallel, review-trio)
Phase 5: examples/aws-mcp-server/ 예시 신규 추가
Phase 6: guides/hooks-to-github-actions.md 신규
         guides/migration-from-claude-code.md 강화
```

### 개념 매핑 한 줄 요약

```
Claude Code /slash-command  =  Copilot CLI skills/*.md
CLAUDE.md                   =  .github/copilot-instructions.md
Claude Code Hooks           =  GitHub Actions composite actions
evaluate-repository cmd     =  skills/security/evaluate-repository/
awesome-claude-code 전체    =  Copilot CLI용 everything-copilot-cli의 모델
```

### 최우선 P0 작업 (즉시 착수 권장)

1. `skills/development/fix-github-issue/SKILL.md` — 낮은 노력, 높은 임팩트
2. `skills/workflow/commit-workflow/SKILL.md` — 일상적으로 가장 많이 쓰임
3. `skills/development/pr-multi-perspective-review/SKILL.md` — 기존 스킬과 차별화

---

## 검증 방법

### 사람 검토자의 경우

1. `01-source-repo-snapshot.md`로 원본 확인
2. `02-target-repo-snapshot.md`의 Gap 분석 테이블 검토
3. `03-migration-rationale.md`의 타당성 검증 섹션에서 각 항목의 Why/How 확인
4. 우선순위 매트릭스로 진행 순서 조정

### AI 에이전트 검토자의 경우 (Claude Code, Gemini, Codex 등)

```
이 폴더의 파일 3개를 읽고 다음을 평가해주세요:
1. 원본-대상 개념 매핑의 타당성 (01 vs 02)
2. 각 Phase의 근거가 충분한지 (03)
3. 빠진 리스크나 대안이 있는지 (03의 리스크 섹션)
4. 우선순위 조정 제안 (03의 우선순위 매트릭스)
```

---

## 관련 파일

- 전체 계획: `~/.copilot/session-state/.../plan.md`
- SQL Todo 추적: 세션 데이터베이스 (7개 todos)
- 원본 저장소: https://github.com/hesreallyhim/awesome-claude-code
- 현재 저장소: `C:\work-copilot\everything-copilot-cli`
