# 현재 저장소 스냅샷: everything-copilot-cli

> 분석 일시: 2026-03-29  
> 경로: C:\work-copilot\everything-copilot-cli

---

## 저장소 개요

**everything-copilot-cli**는 GitHub Copilot CLI를 위한 참조 저장소로,
에이전트 정의, 스킬, 규칙, 오케스트레이션 패턴, MCP 설정을 포함한다.
내용은 Markdown과 JSON 설정이 주를 이루며, 애플리케이션 코드는 없다.

---

## 전체 디렉터리 구조 (현재 상태)

```
everything-copilot-cli/
├── agents/                          ← 에이전트 정의 (8개)
│   ├── planner.md
│   ├── architect.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── tdd-guide.md
│   ├── build-error-resolver.md
│   ├── doc-updater.md
│   └── refactor-cleaner.md
│
├── skills/                          ← 재사용 가능한 스킬 모듈
│   ├── development/
│   │   ├── code-review/SKILL.md       ← PR 코드 리뷰
│   │   ├── fix-build-errors/SKILL.md  ← 빌드 오류 수정
│   │   ├── refactor-clean/SKILL.md    ← 리팩터링/클린업
│   │   └── tdd-workflow/SKILL.md      ← TDD 워크플로우
│   ├── workflow/
│   │   ├── security-audit/SKILL.md    ← 보안 감사
│   │   ├── sprint-retro/SKILL.md      ← 스프린트 회고
│   │   └── sprint-workflow/SKILL.md   ← 스프린트 전체 워크플로우
│   ├── testing/
│   │   ├── e2e-testing/SKILL.md
│   │   └── test-coverage/SKILL.md
│   ├── documentation/
│   │   ├── api-documentation/SKILL.md
│   │   └── doc-update/SKILL.md
│   ├── security/
│   │   ├── input-validation/SKILL.md
│   │   ├── secret-detection/SKILL.md
│   │   └── security-scan/SKILL.md
│   ├── product/
│   │   ├── feature-prioritization/SKILL.md
│   │   ├── launch-strategy/SKILL.md
│   │   └── opportunity-solution-tree/SKILL.md
│   ├── content/
│   ├── copilot-exclusive/
│   └── README.md
│
├── orchestration/
│   ├── patterns/
│   │   ├── pipeline.md              ← 파이프라인 패턴 (Claude→Codex→Claude→Copilot)
│   │   ├── agent-council.md         ← 에이전트 의회 (병렬 전문가 라우팅)
│   │   ├── mcp-bridge.md            ← MCP 브릿지 패턴
│   │   ├── message-ipc.md           ← 메시지 IPC 패턴
│   │   └── shell-invocation.md      ← 셸 호출 패턴
│   ├── skills/                      ← 오케스트레이션 전용 스킬
│   ├── configs/
│   ├── examples/
│   └── README.md
│
├── contexts/                        ← 실행 컨텍스트 정의
├── mcp-configs/                     ← MCP 서버 설정
├── rules/
│   ├── common/                      ← 범용 행동 규칙
│   └── languages/                   ← 언어별 코딩 표준
├── examples/
│   ├── dotnet-webapp/
│   ├── monorepo/
│   ├── nextjs-app/
│   └── python-api/
├── guides/
│   ├── copilot-exclusive-features.md
│   ├── copilot-vs-claude-code.md
│   ├── migration-from-claude-code.md   ← Claude Code 마이그레이션 가이드 (기존)
│   ├── the-longform-guide.md
│   ├── the-orchestration-guide.md
│   ├── the-quickstart-guide.md
│   ├── the-security-guide.md
│   └── the-shortform-guide.md
├── scripts/
│   ├── migrate-from-claude.js
│   ├── setup.js
│   └── validate-config.js
├── _tmp/                            ← 임시 작업 디렉터리
├── package.json
├── README.md
├── README.ko.md
├── AGENTS.md
├── CONTRIBUTING.md
└── COPILOT-INSTRUCTIONS.md
```

---

## 기존 스킬 상세 현황

### skills/development/ (4개)

| 스킬 파일 | 설명 | 에이전트 타입 |
|-----------|------|--------------|
| `code-review/SKILL.md` | PR 코드 리뷰, 6가지 심각도 체크리스트 | code-review |
| `fix-build-errors/SKILL.md` | 빌드 오류 진단 및 수정 | task |
| `refactor-clean/SKILL.md` | 데드 코드 제거, 리팩터링 | general-purpose |
| `tdd-workflow/SKILL.md` | 테스트 주도 개발 (Red-Green-Refactor) | general-purpose |

### skills/workflow/ (3개)

| 스킬 파일 | 설명 | 에이전트 타입 |
|-----------|------|--------------|
| `security-audit/SKILL.md` | 보안 감사 워크플로우 | code-review |
| `sprint-retro/SKILL.md` | 스프린트 회고 | general-purpose |
| `sprint-workflow/SKILL.md` | Think→Plan→Build→Review→Test→Ship 전체 스프린트 | general-purpose |

### skills/documentation/ (2개)

| 스킬 파일 | 설명 |
|-----------|------|
| `api-documentation/SKILL.md` | API 문서화 |
| `doc-update/SKILL.md` | 오래된 문서 식별 및 업데이트 |

### skills/security/ (3개)

| 스킬 파일 | 설명 |
|-----------|------|
| `input-validation/SKILL.md` | 입력 유효성 검사 |
| `secret-detection/SKILL.md` | 시크릿/자격증명 감지 |
| `security-scan/SKILL.md` | OWASP Top 10 + 의존성 감사 |

### skills/product/ (3개)

| 스킬 파일 | 설명 |
|-----------|------|
| `feature-prioritization/SKILL.md` | 기능 우선순위 결정 |
| `launch-strategy/SKILL.md` | 출시 전략 |
| `opportunity-solution-tree/SKILL.md` | 기회-솔루션 트리 |

---

## 기존 오케스트레이션 패턴

### orchestration/patterns/ (5개)

| 패턴 파일 | 설명 |
|-----------|------|
| `pipeline.md` | 직렬 파이프라인: Claude 분석 → Codex 구현 → Claude 검토 → Copilot 배포 |
| `agent-council.md` | 병렬 라우팅: Copilot(디스패처), Claude(아키텍트), Codex(빌더), Gemini(분석가) |
| `mcp-bridge.md` | MCP 서버를 통한 AI 간 통신 |
| `message-ipc.md` | 메시지 파일 기반 AI 간 IPC |
| `shell-invocation.md` | 단일 단계 위임 패턴 |

---

## 기존 마이그레이션 가이드 (guides/migration-from-claude-code.md) 개요

현재 가이드에 포함된 내용:

| 항목 | 상태 |
|------|------|
| Claude Code ↔ Copilot CLI 개념 매핑 테이블 | ✅ 있음 |
| CLAUDE.md → copilot-instructions.md 마이그레이션 | ✅ 있음 |
| Skills 포팅 방법 | ✅ 있음 |
| MCP 설정 마이그레이션 | ✅ 있음 |
| Slash commands 상세 대응표 | ❌ 없음 (단순 언급만) |
| Hooks → GitHub Actions 매핑 | ❌ 없음 |
| awesome-claude-code 리소스 활용법 | ❌ 없음 |
| 도메인별 copilot-instructions 예시 | ❌ 없음 |

---

## 현재 저장소에서 비어 있는 영역 (Gap 분석)

### 스킬 공백

| 기능 영역 | awesome-claude-code 존재 여부 | everything-copilot-cli 존재 여부 |
|-----------|------------------------------|--------------------------------|
| 커밋 메시지 자동화 (conventional + emoji) | ✅ `/commit` | ❌ 없음 |
| 다중 관점 PR 리뷰 (6-axis) | ✅ `/pr-review` | ❌ 없음 (단일 관점만) |
| PR 생성 자동화 | ✅ `/create-pr`, `/create-pull-request` | ❌ 없음 |
| GitHub 이슈 기반 수정 | ✅ `/fix-github-issue` | ❌ 없음 |
| PRD(제품 요구사항 문서) 생성 | ✅ `/create-prd` | ❌ 없음 |
| CHANGELOG 업데이트 | ✅ `/add-to-changelog` | ❌ 없음 |
| 릴리즈 자동화 | ✅ `/release` | ❌ 없음 |
| 컨텍스트 프라이밍 | ✅ `/context-prime` | ❌ 없음 |
| 성능 최적화 | ✅ `/optimize` | ❌ 없음 |
| 코드 클린업 | ✅ `/clean` | ❌ 없음 |
| 저장소 보안/품질 감사 (스코어링) | ✅ `evaluate-repository` | ❌ 없음 |
| Fan-out 병렬 오케스트레이션 | ❌ | ❌ 없음 |
| 3자 리뷰 체인 (Copilot+Claude+Gemini) | ❌ | ❌ 없음 |
| Hooks → GitHub Actions 매핑 가이드 | ❌ | ❌ 없음 |

### 예시 공백

| 도메인 | everything-copilot-cli 상태 |
|--------|----------------------------|
| Next.js 앱 | ✅ `examples/nextjs-app/` 있음 |
| Python API | ✅ `examples/python-api/` 있음 |
| .NET 웹앱 | ✅ `examples/dotnet-webapp/` 있음 |
| 모노레포 | ✅ `examples/monorepo/` 있음 |
| AWS MCP 서버 | ❌ 없음 |
| 각 예시의 copilot-instructions 충실도 | ⚠️ 검토 필요 |

---

## 파일 형식 표준 (현재 저장소)

### SKILL.md 필수 frontmatter
```yaml
---
name: skill-name
description: 한 줄 설명
metadata:
  category: development|workflow|testing|documentation|security|product
  agent_type: code-review|general-purpose|task|explore
---
```

### 필수 섹션
1. `## When to Use` — 사용 조건
2. `## Prerequisites` — 사전 조건
3. `## Workflow` — 단계별 작업 흐름 (powershell 코드 블록 포함)
4. `## Examples` — 실제 사용 예시
5. `## Tips` — 실용적 팁

---

## package.json 스크립트 (검증 명령어)

```json
{
  "scripts": {
    "validate": "node scripts/validate-config.js",
    "lint:md": "markdownlint .",
    "test": "node tests/..."
  }
}
```
