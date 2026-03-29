# 3-AI 종합 평가 결과

> 평가 일시: 2026-03-29  
> 평가자: Claude Code (사용자 제공) + Gemini CLI + Codex CLI  
> 대상: awesome-claude-code → everything-copilot-cli 마이그레이션 계획

---

## 각 AI 원문 평가 요약

### Claude Code (사용자 제공)

| 항목 | 평가 |
|------|------|
| Hooks → GitHub Actions | ⚠️ "대안"이 정확, "대응"은 과장. 실행 시점 근본적 다름 |
| evaluate-repository 9→4개 축소 | ⚠️ 근거 미흡 |
| review-trio 메커니즘 | ⚠️ Claude 200K 호출 방법 미정 |
| Phase 5 AWS MCP | ❌ 근거 가장 약함 → Backlog |
| 우선순위 조정 | context-prime/add-to-changelog P0 승격, create-prd P2 강등 |

**빠진 리스크 3개**:
1. release의 에코시스템 의존성 (package.json vs pyproject.toml vs go.mod)
2. pr-multi-perspective의 병렬 실행 Copilot 지원 여부 미검증
3. create-prd 경로 일반화 시 맥락 연쇄 강점 희석

---

### Gemini CLI

**Claude 분석에 전적으로 동의** + 추가 기여:

| 항목 | Gemini 기여 |
|------|------------|
| Hooks 대안 | GitHub Actions만으론 부족 → **Git Hooks(Husky) + 로컬 스크립트** 병행 가이드 필요 |
| review-trio에서 Gemini 역할 | 1M~2M 토큰 컨텍스트로 전역 의존성(나비효과) 추적, 아키텍처 패턴 일관성 검증, 복잡한 조건문 수학적 추론 |
| fan-out-parallel 병목 | "**상태 충돌 해결(Conflict Resolution)**"이 핵심 — Integrator 에이전트 역할 설계 필수 |

**추가 권고 3개**:
1. **조건부 오케스트레이션**: 파일 변경 수/중요도에 따라 AI 투입 수준 차등 (모든 PR에 Trio 가동은 비효율)
2. **Read-only 분석 모드 기본값**: `evaluate-repository` 포팅 시 MCP 서버 로컬 파일 쓰기 권한 위험 경고
3. **인간 피드백 루프**: 다중 AI 충돌 시 사람이 최종 결정 → 다음 세션 컨텍스트(Memory)에 저장

---

### Codex CLI

**핵심 통찰**: "이 계획의 상당수는 '0→1'이 아니라 '1→1.5'. 기존 자산(github-pr-workflow, github-issue-triage, multi-model-strategy, agent-council)을 먼저 활용해야 한다."

**동의**:
- Hooks → GitHub Actions은 "대안". Gemini의 Husky 추가도 옳음.

**부분 반대 (Claude에게)**:
- review-trio의 "Claude 200K 호출 메커니즘 미정"은 과장. `delegate-to-claude.md`와 `agent-council.md`에 뼈대 있음. 진짜 문제는 **결과 스키마 표준화, read-only 기본값, 충돌 해결 규약**임.

**Codex만 발견한 추가 리스크 5개**:

| 리스크 | 설명 |
|--------|------|
| 검증 얕음 | `validate-skills.test.js`가 frontmatter/category만 체크 → 쓸모없는 skill도 CI 통과 |
| 자동 포팅 품질 | `migrate-from-claude.js`는 문자열 치환 중심 → 그럴듯하지만 잘못된 지침 대량 생성 위험 |
| 스킬 중복/탐색성 저하 | `pr-review` + `github-pr-workflow` + `code-review` + `fleet-parallel` + `agent-review-chain` 겹침 → 사용자 혼란 |
| 도구/권한 모델 차이 | Claude slash-command를 그대로 포팅하면 Copilot/Codex의 승인 모델·작업 디렉터리·GitHub 통합 방식 차이로 실행 기대치 어긋남 |
| 병렬 리뷰 병합 비용 | 출력이 자유 텍스트면 결과 합치는 비용이 사람에게 전가됨 |

**구현 복잡도 (Codex 평가)**:

| 스킬 | 복잡도 | 이유 |
|------|--------|------|
| commit-workflow | 🟢 낮음 | 규칙화 쉽고 기존 git/PR 자산과 잘 맞음 |
| fix-github-issue | 🟡 중간 | 기존 issue-triage + build-fix 조합으로 가능 |
| create-prd | 🟡 중간 | 좁히면 중간, 범용화하면 급격히 어려워짐 |
| pr-multi-perspective | 🔴 높음 | 멀티모델 병합 규약 때문에 높음 |
| evaluate-repository | 🔴 높음 | 체크리스트 근거 + 증거 수집 + 결과 신뢰도 설계 필요 |

**Codex 우선순위 (가장 보수적)**:

| 순위 | 항목 |
|------|------|
| P0 | skills/README 정비, context-prime, add-to-changelog, commit-workflow |
| P1 | fix-github-issue, guides/hooks-to-github-actions.md |
| P2 | create-prd (좁은 템플릿 기반 버전 먼저) |
| P3 | pr-multi-perspective-review, fan-out-parallel, evaluate-repository |
| Backlog | release, examples/aws-mcp-server/ |

---

## 3-AI 합의 사항 (모두 동의)

1. **Hooks → GitHub Actions은 "대응"이 아닌 "대안"** — 용어 수정 필요
2. **context-prime을 P0로 승격** — 모든 스킬의 전제 조건, 최저 노력
3. **add-to-changelog를 P0로 승격** — commit-workflow → release 체인의 필수 중간 고리
4. **AWS MCP 예시는 Backlog** — 구체적 수요 증거 없음
5. **create-prd는 좁은 버전 먼저** — 하드코딩 경로 일반화 시 가치 희석 위험

---

## 3-AI 불일치 사항 (논쟁 포인트)

| 항목 | Claude | Gemini | Codex |
|------|--------|--------|-------|
| review-trio 구현 가능성 | ⚠️ 메커니즘 미정 | ✅ 즉각 가능 | ✅ 뼈대 이미 있음, 스키마가 진짜 문제 |
| pr-multi-perspective 우선순위 | P0 | P0 (언급 없음) | P3 (병합 규약 미비) |
| evaluate-repository 우선순위 | P1 | P1 | P3 (신뢰도 설계 필요) |
| release 스킬 우선순위 | P2 | P2 | Backlog |

---

## 최종 통합 우선순위 권고 (3-AI 합의 기반)

| 순위 | 항목 | 합의 수준 |
|------|------|----------|
| **P0** | context-prime | ✅ 3/3 동의 |
| **P0** | add-to-changelog | ✅ 3/3 동의 |
| **P0** | commit-workflow | ✅ 3/3 동의 (Codex 제안) |
| **P1** | fix-github-issue | ✅ 3/3 동의 |
| **P1** | guides/hooks-to-github-actions.md | ✅ 3/3 동의 (Codex 제안) |
| **P2** | create-prd (좁은 템플릿 버전) | ✅ 3/3 동의 |
| **P2** | evaluate-repository | ⚠️ Claude/Gemini P1, Codex P3 → 절충 |
| **P3** | pr-multi-perspective-review | ⚠️ Claude/Gemini P0, Codex P3 → 병합 규약 먼저 |
| **P3** | fan-out-parallel | ⚠️ 충돌 해결 PoC 먼저 필요 |
| **Backlog** | release | ✅ 3/3 동의 (에코시스템 의존성) |
| **Backlog** | AWS MCP 예시 | ✅ 3/3 동의 |

---

## 3-AI가 공통으로 추가한 리스크 (원본 문서에 없던 것)

| # | 리스크 | 출처 |
|---|--------|------|
| R1 | Hooks 마이그레이션 가이드에 Git Hooks(Husky)+로컬 스크립트 대안 미포함 | Gemini + Codex |
| R2 | fan-out-parallel의 상태 충돌 해결 메커니즘(Integrator) 미설계 | Gemini + Codex |
| R3 | review-trio 출력 스키마 표준화 부재 → 자유 텍스트 병합 비용 사람에게 전가 | Codex + (Gemini 암시) |
| R4 | validate-skills.test.js가 frontmatter만 검증 → 내용 품질 보장 안됨 | Codex |
| R5 | 스킬 중복/탐색성 저하 (pr-review vs github-pr-workflow vs code-review) | Codex |
| R6 | 도구/권한 모델 차이로 포팅 후 실행 기대치 어긋남 | Codex |
| R7 | evaluate-repository 포팅 시 MCP read-only 기본값 설정 필요 | Gemini |
| R8 | 다중 AI 충돌 시 인간 피드백 루프 및 메모리 설계 필요 | Gemini |
| R9 | 조건부 오케스트레이션 부재 (모든 PR에 Trio 가동은 비효율) | Gemini |

---

## plan.md 반영 필요 사항

1. **용어 수정**: "Hooks → GitHub Actions 대응" → "대안 (근본적 차이 있음, Git Hooks/Husky 보완 필요)"
2. **P0 추가**: commit-workflow (기존엔 P0가 아니었음)
3. **P1 추가**: guides/hooks-to-github-actions.md (기존엔 Phase 6에 묻혀 있었음)
4. **pr-multi-perspective 조건부 착수**: 병합 규약 설계 완료 후 시작
5. **신규 리스크 9개** 반영
6. **스킬 중복 검토 선행**: 신규 스킬 추가 전 기존 skills/copilot-exclusive/ 스킬과 겹침 확인 필수
