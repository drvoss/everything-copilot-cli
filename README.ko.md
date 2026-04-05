<p align="center">
  <img src="https://github.githubassets.com/images/icons/copilot/cp-head-square.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>GitHub Copilot CLI를 위한 궁극의 가이드 &amp; 설정 시스템</strong><br/>
  Agents · Skills · Rules · Multi-AI Orchestration
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="#"><img src="https://img.shields.io/badge/copilot--cli-ready-28a745?logo=github" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="https://img.shields.io/badge/models-20%2B-blueviolet" alt="20+ Models" /></a>
  <a href="#"><img src="https://img.shields.io/badge/agents-8-orange" alt="8 Agents" /></a>
  <a href="#"><img src="https://img.shields.io/badge/skills-40-green" alt="40 Skills" /></a>
  <a href="#multi-ai-orchestration-"><img src="https://img.shields.io/badge/★_Multi--AI-Orchestrator-ff6f00" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a>
</p>

---

## 이게 뭔가요?

**everything-copilot-cli**는 [GitHub Copilot CLI](https://github.com/github/copilot-cli)를 위한 에이전트, 재사용 가능한 스킬, 코딩 규칙, MCP 설정, 종합 가이드를 체계적으로 모아둔 커뮤니티 기반 컬렉션입니다.

처음에는 [everything-claude-code](https://github.com/anthropics/everything-claude-code)와 [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) 같은 커뮤니티 리소스에서 영감을 받아 시작했지만, 이제는 독자적인 정체성을 갖추게 되었습니다. Copilot CLI만의 강점 — **네이티브 GitHub 통합, 멀티 모델 유연성, 다른 AI 에이전트를 허브에서 조율하는 능력** — 에 집중합니다.

> **Multi-AI Orchestrator로 동작** — Claude Code, Codex CLI, Gemini CLI 등을 하나의 커맨드 라인에서 통합 조율합니다. _(커뮤니티 패턴 — [Multi-AI Orchestration](#multi-ai-orchestration-) 참고)_

---

## 왜 Copilot CLI인가?

GitHub Copilot CLI는 단일 벤더 코딩 에이전트 대비 **11가지 구조적 이점**을 가지고 있습니다:

| # | 장점 | 설명 |
|---|------|------|
| 1 | 🔗 **GitHub 네이티브 통합** | Issues, PR, Actions, 코드 검색 — 내장 MCP로 별도 설정 없이 바로 사용 |
| 2 | 🧠 **20개 이상 모델 선택** | GPT-5.x, Claude Sonnet/Opus 4.6, Gemini 3 Pro — 작업별로 최적의 모델 선택 |
| 3 | 🔄 **IDE ↔ CLI 원활한 전환** | VS Code, JetBrains, 터미널에서 동일한 Copilot 컨텍스트 유지 |
| 4 | 📋 **Plan Mode** | 구조화된 텍스트 플래닝 — 코드를 작성하기 전에 단계별 구현 계획을 수립 |
| 5 | 🤖 **Autopilot Mode** | 가드레일이 있는 자율 작업 실행 _(실험적 기능)_ |
| 6 | 👻 **Background Agents** | `&` 또는 `/delegate`로 클라우드 에이전트에 위임, `/resume`으로 재개 |
| 7 | ⚡ **Fleet Mode** | 병렬 에이전트 실행 — 여러 에이전트가 동시에 작업 분담 |
| 8 | 🗄️ **Session SQL Database** | 세션별 내장 SQLite — 구조화된 데이터, 할일 추적, 상태 관리 |
| 9 | 🧲 **Cross-Session Memory** | `session_store`를 통한 영속적 지식 — 세션 간 학습 |
| 10 | 🏗️ **LSP 퍼스트클래스 지원** | Language Server Protocol 통합으로 정밀한 코드 인텔리전스 |
| 11 | 🌐 **Multi-AI Orchestrator** | ★ Copilot을 메타 허브로 삼아 Claude Code, Codex, Gemini CLI를 통합 조율 |

---

## 빠른 시작

```bash
# 1. GitHub Copilot CLI 설치
npm install -g @github/copilot

# 2. 저장소 클론
git clone https://github.com/drvoss/everything-copilot-cli.git
cd everything-copilot-cli

# 3. 셋업 실행
npm install && npm run setup
```

이제 터미널에서 포함된 에이전트, 스킬, 규칙과 함께 Copilot CLI를 사용해보세요:

```bash
# 프로젝트 디렉토리에서 세션 시작
cd your-project
copilot

# planner 에이전트 사용 (세션 안에서)
> 사용자 관리 REST API를 설계해줘 — plan mode 사용

# TDD 워크플로우 실행
> TDD로 인증 모듈에 테스트 추가해줘

# 멀티 AI 오케스트레이션
> Claude가 아키텍처 추론, Codex가 구현, Copilot이 리뷰 — 적절히 위임해줘
```

> 📖 자세한 안내는 [빠른 시작 가이드](guides/)를 참고하세요.

---

## 저장소 구조

```
everything-copilot-cli/
├── agents/                        # 에이전트 정의 (8개 코어 에이전트)
│   ├── planner.md
│   ├── architect.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── tdd-guide.md
│   ├── build-error-resolver.md
│   ├── doc-updater.md
│   └── refactor-cleaner.md
│
├── skills/                        # 재사용 가능한 워크플로우 스킬 (40개)
│   ├── copilot-exclusive/         #   ★ Copilot 전용 스킬 (14개)
│   ├── development/               #   개발 스킬 (6개)
│   ├── documentation/             #   문서화 스킬 (3개)
│   ├── security/                  #   보안 스킬 (4개)
│   ├── testing/                   #   테스팅 스킬 (2개)
│   ├── workflow/                  #   워크플로우 스킬 (4개)
│   ├── product/                   #   프로덕트 스킬 (4개)
│   └── content/                   #   콘텐츠 & GEO 스킬 (2개)
│
├── rules/                         # 코딩 규칙 & 가이드라인
│   ├── common/                    #   범용 규칙 (5개)
│   └── languages/                 #   언어별 규칙: TS, Python, Go, C#, Java
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   10가지 오케스트레이션 패턴
│   ├── configs/                   #   MCP 브릿지 설정
│   ├── skills/                    #   오케스트레이션 스킬 (6개)
│   ├── templates/                 #   재사용 가능한 오케스트레이터 템플릿
│   └── examples/                  #   실전 예제 (5개)
│
├── guides/                        # 종합 가이드 (12개)
├── mcp-configs/                   # MCP 서버 설정 (4개)
├── examples/                      # 프로젝트별 copilot-instructions 예제
│   ├── nextjs-app/
│   ├── python-api/
│   ├── dotnet-webapp/
│   └── monorepo/
│
├── contexts/                      # 컨텍스트 프리셋
├── schemas/                       # 검증 스키마
├── scripts/                       # 셋업 & 마이그레이션 도구
└── tests/                         # 테스트 스위트
```

---

## 핵심 구성 요소

### 🤖 에이전트 (8개 코어)

역할, 시스템 프롬프트, 도구 세트가 사전 설정된 에이전트 정의입니다.

| 에이전트 | 역할 |
|----------|------|
| **planner** | 작업을 의존성 추적이 포함된 구조화된 계획으로 분해 |
| **architect** | 시스템 아키텍처와 컴포넌트 경계를 설계 |
| **code-reviewer** | 버그, 로직 오류, 보안 이슈에 대한 코드 리뷰 |
| **security-reviewer** | OWASP/CWE 분류 기반의 집중 보안 감사 |
| **tdd-guide** | Test-Driven Development 워크플로우 — red/green/refactor |
| **build-error-resolver** | 빌드/컴파일 에러 진단 및 수정 |
| **doc-updater** | 코드 변경에 맞춰 문서를 동기화 |
| **refactor-cleaner** | 안전한 리팩토링 기회를 식별하고 실행 |

### ⚙️ 스킬 (총 40개 · 8개 카테고리)

에이전트가 호출할 수 있는 재사용 가능하고 조합 가능한 워크플로우입니다. 모두 [agentskills.io](https://agentskills.io) 스펙을 따릅니다.

<details>
<summary><strong>★ Copilot 전용 스킬 (14개)</strong></summary>

GitHub Copilot CLI 고유 기능을 활용하는 스킬입니다:

| 스킬 | 설명 |
|------|------|
| `context-prime` | 세션 시작 시 README, 파일 트리, 커밋, 스택 로딩 |
| `session-management` | 내장 SQLite로 할일 추적 및 구조화된 상태 관리 |
| `plan-mode-mastery` | 승인 워크플로우가 포함된 구조화된 텍스트 플래닝 |
| `autopilot-patterns` | 가드레일이 있는 자율 실행 |
| `background-agent` | `&` / `/delegate`로 클라우드 에이전트에 위임 |
| `fleet-parallel` | `/fleet`으로 병렬 에이전트 실행 |
| `github-pr-workflow` | 내장 GitHub MCP를 통한 전체 PR 라이프사이클 |
| `github-issue-triage` | 이슈 대량 분류 및 트리아지 |
| `actions-debugging` | 네이티브 Actions 접근으로 CI 실패 디버깅 |
| `cross-session-memory` | 세션 간 지식 영속화 |
| `multi-model-strategy` | 작업별 최적 모델 선택 |
| `mcp-ecosystem` | 커스텀 MCP 서버로 기능 확장 |
| `ide-switching` | VS Code ↔ CLI 원활한 컨텍스트 공유 |
| `team-planner` | SQL 로스터 + `/fleet` 디스패치로 전문가 팀 구성 |
</details>

<details>
<summary><strong>개발 스킬 (6개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `tdd-workflow` | Red → Green → Refactor 사이클 |
| `code-review` | 심각도 수준이 포함된 구조화된 코드 리뷰 |
| `fix-github-issue` | 이슈 읽기 → 버그 위치 → 수정 → 테스트 → PR |
| `fix-build-errors` | 빌드 실패 진단 및 해결 |
| `pr-multi-perspective-review` | 6가지 관점 PR 리뷰: PM/Dev/QA/Security/DevOps/UX |
| `refactor-clean` | 동작 보존하며 데드 코드 제거 및 로직 단순화 |
</details>

<details>
<summary><strong>문서화 스킬 (3개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `add-to-changelog` | Keep a Changelog 형식, semver 버전 동기화 |
| `doc-update` | 구현 변경 시 문서 동기화 |
| `api-documentation` | 소스 코드에서 API 문서 생성 및 유지 |
</details>

<details>
<summary><strong>보안 스킬 (4개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `evaluate-repository` | 6개 차원 1~10점 보안 스코어카드 + 개선 계획 |
| `security-scan` | OWASP Top 10 + 의존성 감사 |
| `secret-detection` | 소스 및 git 히스토리에서 하드코딩된 시크릿 탐지 |
| `input-validation` | SQL/XSS/CSRF 인젝션 공격 방어 |
</details>

<details>
<summary><strong>워크플로우 스킬 (5개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `commit-workflow` | 컨벤셔널 커밋 + 이모지, 원자적 분할 가이드 |
| `release` | 태그 → GitHub Release → 배포 (npm/PyPI/Docker) |
| `sprint-workflow` | 전체 스프린트: 구상 → 계획 → 구축 → 리뷰 → 출시 |
| `security-audit` | OWASP Top 10 + STRIDE 위협 모델링 |
| `sprint-retro` | git 메트릭을 활용한 데이터 기반 회고 |
</details>

<details>
<summary><strong>프로덕트 스킬 (4개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `create-prd` | Jobs-to-be-Done 기반 PRD 템플릿 |
| `feature-prioritization` | 임팩트 × 신뢰도 × 노력 매트릭스 |
| `opportunity-solution-tree` | Teresa Torres의 OST 프레임워크 |
| `launch-strategy` | Alpha → Beta → GA 런치 체크리스트 |
</details>

<details>
<summary><strong>테스팅 스킬 (2개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `test-coverage` | 커버리지 갭 식별 및 타겟 테스트 작성 |
| `e2e-testing` | 핵심 사용자 경로 E2E 테스트 스캐폴딩 |
</details>

<details>
<summary><strong>콘텐츠 스킬 (2개)</strong></summary>

| 스킬 | 설명 |
|------|------|
| `ai-visibility` | GEO 최적화: llms.txt, AI 크롤러 접근 최적화 |
| `content-strategy` | 키워드 리서치, 토픽 클러스터, 콘텐츠 캘린더 |
</details>

### 📏 규칙

범위별로 정리된 코딩 규칙과 가이드라인입니다:

- **Common Rules** — 범용 모범 사례 (에러 처리, 로깅, 네이밍 컨벤션)
- **Language-Specific Rules** — TypeScript, Python, Go, C#, Java

### 🌐 오케스트레이션

Multi-AI Orchestration 시스템 (아래 [전용 섹션](#multi-ai-orchestration-) 참고).

---

## 가이드

| 가이드 | 설명 |
|--------|------|
| 📘 **빠른 시작** | 5분 안에 시작하기 |
| 📗 **숏폼 가이드** | 일상적 사용을 위한 간결한 레퍼런스 |
| 📕 **롱폼 가이드** | 모든 기능에 대한 심층 안내 |
| 🔒 **보안 가이드** | 보안 모범 사례 및 스캐닝 |
| ⭐ **Copilot 전용 기능** | Copilot CLI에서만 가능한 기능 |
| ⚖️ **Copilot vs Claude Code** | 기능별 상세 비교 |
| 🚚 **Claude Code에서 마이그레이션** | 개념 매핑과 단계별 마이그레이션 가이드 |
| 🪝 **Hooks to GitHub Actions** | Claude Code Hooks 대안 (Git Hooks / Actions / Prompt Guards) |
| 🌐 **오케스트레이션 가이드** ★ | Multi-AI 오케스트레이션 패턴 및 설정 |
| ✍️ **스킬 작성 모범 사례** | 실제로 동작하는 트리거 우선 description 작성법 |
| 🧪 **스킬 테스팅 가이드** | 프롬프트웨어의 트리거 정확도 및 출력 품질 테스트 |
| 🔍 **QA 에이전트 가이드** | 경계면 교차 비교 기반의 실질적인 QA 에이전트 설계 |

모든 가이드는 [`guides/`](guides/) 디렉토리에 있습니다.

---

## Multi-AI Orchestration ★

> **커뮤니티 패턴.** 이것은 GitHub Copilot CLI의 공식 내장 기능이 아닙니다 — 쉘 스크립팅, MCP, 파이프라인을 활용해 여러 AI 도구를 결합하는 커뮤니티 제안 워크플로 패턴입니다. Copilot CLI는 GitHub 통합과 멀티 모델 지원 덕분에 허브로 활용하기 적합합니다.

### 핵심 아이디어

모든 일을 가장 잘하는 단일 AI는 없습니다. Claude는 추론에, Codex는 빠른 구현에, Gemini는 멀티모달 이해에, Copilot은 GitHub 통합에 강합니다. 이 모든 것을 **한 곳에서** 쓸 수 있다면 어떨까요?

```
┌──────────────────────────────────────────────────┐
│              GitHub Copilot CLI                   │
│           (Orchestrator / 메타 허브)               │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Claude Code│  │ Codex CLI│  │Gemini CLI│  ...  │
│  │  (추론)   │  │  (구현)   │  │(멀티모달)│       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5가지 크로스-AI 오케스트레이션 패턴

| 패턴 | 동작 방식 | 적합한 상황 |
|------|-----------|-------------|
| 🐚 **Shell Execution** | Copilot이 셸 명령으로 다른 CLI를 생성 | 단순한 작업 위임 |
| 🔌 **MCP Bridge** | Model Context Protocol 서버를 통해 에이전트 연결 | 구조화된 도구 공유 |
| 💬 **Message IPC** | 파일/파이프를 통한 프로세스 간 통신 | 실시간 협업 |
| 🔗 **Pipeline** | 에이전트를 순차 연결 — 이전 출력이 다음 입력으로 | 다단계 워크플로우 |
| 🏛️ **Agent Council** | 여러 에이전트가 토론하고 결정에 투표 | 중요한 의사결정 |

### 5가지 팀 내부 오케스트레이션 패턴

| 패턴 | 동작 방식 | 적합한 상황 |
|------|-----------|-------------|
| ⚡ **Fan-Out Parallel** | 독립 서브태스크 동시 병렬 디스패치 | 배치 작업 |
| 🔁 **Producer-Reviewer** | 반복적 제작→리뷰 피드백 루프 | 아티팩트 품질 개선 |
| 🌲 **Hierarchical Delegation** | 중첩 오케스트레이터 (루트→도메인→전문가) | 대규모 멀티도메인 작업 |
| 🔄 **Iterative Refinement** | 측정 가능한 종료 기준 기반 자기 개선 루프 | 품질 민감한 생성 |
| 🤝 **Review Trio** | PR 외 아티팩트 (RFC, 스키마, 아키텍처) 3자 리뷰 | 배포 전 검토 |

### 도구별 강점 매트릭스

| 역량 | Copilot CLI | Claude Code | Codex CLI | Gemini CLI |
|------|:-----------:|:-----------:|:---------:|:----------:|
| GitHub 통합 | ★★★ | ★☆☆ | ★★☆ | ★☆☆ |
| 심층 추론 | ★★☆ | ★★★ | ★★☆ | ★★☆ |
| 빠른 구현 | ★★☆ | ★★☆ | ★★★ | ★★☆ |
| 멀티 모델 접근 | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ |
| 멀티모달 (이미지) | ★★☆ | ★★☆ | ★☆☆ | ★★★ |
| 오케스트레이션 | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ |

### 참고 프레임워크

오케스트레이션 시스템은 실전 검증된 멀티 에이전트 프레임워크들을 참고합니다:

- [microsoft/autogen](https://github.com/microsoft/autogen) — Microsoft AutoGen 프레임워크
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — CrewAI 역할 기반 에이전트
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — LangGraph 상태 머신
- [geekan/MetaGPT](https://github.com/geekan/MetaGPT) — MetaGPT 멀티 에이전트 SOP
- [openai/swarm](https://github.com/openai/swarm) — OpenAI Swarm 패턴

> 📖 구현 세부 사항은 [오케스트레이션 가이드](guides/)를 참고하세요.

---

## Copilot CLI vs Claude Code 비교

| 기능 | Copilot CLI | Claude Code |
|------|:-----------:|:-----------:|
| GitHub 네이티브 MCP (Issues, PR, Actions) | ✅ | ❌ |
| 멀티 모델 (20개 이상) | ✅ | ⚠️ 단일 벤더 |
| IDE ↔ CLI 공유 컨텍스트 | ✅ | ⚠️ VS Code 확장으로 가능 |
| Plan Mode (구조화된 텍스트 플래닝) | ✅ | ⚠️ 텍스트 전용 |
| Autopilot Mode _(실험적)_ | ✅ | ⚠️ `--dangerously-skip-permissions` |
| Background Agents | ✅ | ❌ |
| Fleet Mode (병렬 에이전트) | ✅ | ❌ |
| Session SQL Database | ✅ | ❌ |
| Cross-session Memory | ✅ | ⚠️ `CLAUDE.md`만 가능 |
| LSP 통합 | ✅ | ❌ |
| Multi-AI Orchestration | ✅ | ❌ |
| 심층 추론 (단일 모델) | ⚠️ 모델 의존적 | ✅ Opus |
| 커뮤니티 & 생태계 성숙도 | ⚠️ 성장 중 | ✅ 자리잡음 |
| 커스텀 슬래시 명령 | ⚠️ 플러그인 기반 | ✅ |

> ⚖️ 상세 분석은 [비교 가이드](guides/)를 참고하세요.

---

## Claude Code에서 마이그레이션

이미 Claude Code나 `everything-claude-code`를 사용하고 계신가요? 마이그레이션은 간단합니다 — 스킬 형식이 거의 동일합니다:

```
CLAUDE.md 규칙         →  .github/copilot-instructions.md
.claude/commands/      →  skills/
.claude/settings.json  →  mcp-configs/ & contexts/
Claude Code Hooks      →  Git Hooks / GitHub Actions / Prompt Guards
```

마이그레이션 스크립트가 대부분의 작업을 자동화합니다:

```bash
node scripts/migrate-from-claude.js --source /path/to/your/project
```

> 🚚 [마이그레이션 가이드](guides/migration-from-claude-code.md)와 [Hooks 대안 가이드](guides/hooks-to-github-actions.md)를 참고하세요.

---

## 기여하기

기여를 환영합니다! 다음과 같은 방법으로 참여할 수 있습니다:

1. **에이전트 추가** — `agents/`에 새로운 에이전트 역할 정의
2. **스킬 생성** — `skills/`에 재사용 가능한 워크플로우 구축
3. **규칙 작성** — `rules/`에 코딩 가이드라인 추가
4. **오케스트레이션 패턴 공유** — `orchestration/`에 기여
5. **가이드 개선** — `guides/`의 문서 보강
6. **예제 추가** — `examples/`에 실전 설정 공유

### 개발 환경

```bash
# 의존성 설치
npm install

# 설정 검증
npm run validate

# 테스트 실행
npm test

# 마크다운 린트
npm run lint:md
```

PR을 제출하기 전에 기존 가이드를 읽고 확립된 패턴을 따라주세요.

---

## 라이선스

[MIT](LICENSE) © Everything Copilot CLI Contributors

---

<p align="center">
  <sub>GitHub Copilot CLI 커뮤니티를 위해 제작 · <a href="https://github.com/anthropics/everything-claude-code">everything-claude-code</a>와 <a href="https://github.com/hesreallyhim/awesome-claude-code">awesome-claude-code</a>에서 영감을 받아</sub>
</p>
