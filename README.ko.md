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
  <a href="#"><img src="https://img.shields.io/badge/models-18%2B-blueviolet" alt="18+ Models" /></a>
  <a href="#"><img src="https://img.shields.io/badge/agents-8-orange" alt="8 Agents" /></a>
  <a href="#"><img src="https://img.shields.io/badge/skills-30%2B-green" alt="30+ Skills" /></a>
  <a href="#multi-ai-orchestration-"><img src="https://img.shields.io/badge/★_Multi--AI-Orchestrator-ff6f00" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a>
</p>

---

## 이게 뭔가요?

**everything-copilot-cli**는 [everything-claude-code](https://github.com/anthropics/everything-claude-code)가 Claude Code에게 해주는 역할을 [GitHub Copilot CLI](https://githubnext.com/projects/copilot-cli/)에게 해주는 프로젝트입니다 — 에이전트, 재사용 가능한 스킬, 코딩 규칙, MCP 설정, 종합 가이드를 체계적으로 모아둔 커뮤니티 기반 컬렉션입니다.

하지만 여기서 한 발 더 나아갑니다. Copilot CLI는 GitHub 생태계 안에 있고 여러 제공사의 18개 이상 모델을 지원하기 때문에, 다른 어떤 코딩 에이전트도 할 수 없는 일을 할 수 있습니다:

> **Multi-AI Orchestrator로 동작** — Claude Code, Codex CLI, Gemini CLI 등을 하나의 커맨드 라인에서 통합 조율합니다.

---

## 왜 Copilot CLI인가?

GitHub Copilot CLI는 단일 벤더 코딩 에이전트 대비 **11가지 구조적 이점**을 가지고 있습니다:

| # | 장점 | 설명 |
|---|------|------|
| 1 | 🔗 **GitHub 네이티브 통합** | Issues, PR, Actions, 코드 검색 — 내장 MCP로 별도 설정 없이 바로 사용 |
| 2 | 🧠 **18개 이상 모델 선택** | GPT-5.x, Claude Sonnet/Opus 4.6, Gemini 3 Pro — 작업별로 최적의 모델 선택 |
| 3 | 🔄 **IDE ↔ CLI 원활한 전환** | VS Code, JetBrains, 터미널에서 동일한 Copilot 컨텍스트 유지 |
| 4 | 📋 **Plan Mode** | 시각적 승인 UI — 실행 전 모든 단계를 리뷰 |
| 5 | 🤖 **Autopilot Mode** | 가드레일이 있는 자율 작업 실행 |
| 6 | 👻 **Background Agents** | 실행 후 잊어도 되는 에이전트 — 완료 시 자동 알림 |
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
git clone https://github.com/anthropics/everything-copilot-cli.git
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
├── skills/                        # 재사용 가능한 워크플로우 스킬
│   ├── development/               #   개발 스킬 (TDD, 코드 리뷰 등)
│   ├── security/                  #   보안 스캐닝 & 검증
│   ├── documentation/             #   문서 생성 & 업데이트
│   ├── testing/                   #   테스트 커버리지 & E2E
│   └── copilot-exclusive/         #   ★ Copilot 전용 스킬 (12개)
│
├── rules/                         # 코딩 규칙 & 가이드라인
│   ├── common/                    #   범용 규칙
│   └── languages/                 #   언어별 규칙 (TS, Python, Go, C#, Java)
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   5가지 오케스트레이션 패턴
│   ├── configs/                   #   MCP 브릿지 설정
│   ├── skills/                    #   오케스트레이션 스킬
│   └── examples/                  #   실전 예제
│
├── guides/                        # 종합 가이드
├── mcp-configs/                   # MCP 서버 설정
├── examples/                      # 프로젝트별 예제
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

### ⚙️ 스킬 (20개 이상 코어 · 12개 Copilot 전용 · 오케스트레이션)

에이전트가 호출할 수 있는 재사용 가능하고 조합 가능한 워크플로우입니다.

<details>
<summary><strong>개발 스킬</strong></summary>

- TDD 워크플로우
- 코드 리뷰 체크리스트
- 리팩토링 패턴
- 의존성 업그레이드
- Git 워크플로우 자동화
</details>

<details>
<summary><strong>보안 스킬</strong></summary>

- 시크릿 스캐닝
- 의존성 감사
- SAST 분석
- 입력 유효성 검사
</details>

<details>
<summary><strong>문서화 스킬</strong></summary>

- API 문서 생성
- README 동기화
- 변경 로그 생성
- Architecture Decision Records
</details>

<details>
<summary><strong>테스팅 스킬</strong></summary>

- 단위 테스트 생성
- E2E 테스트 스캐폴딩
- 커버리지 분석
- 뮤테이션 테스팅
</details>

<details>
<summary><strong>★ Copilot 전용 스킬 (12개)</strong></summary>

GitHub Copilot CLI 고유 기능을 활용하는 스킬입니다:

1. **Fleet Parallel Execution** — 여러 에이전트에게 작업을 분배하여 병렬 실행
2. **Session SQL Tracking** — 내장 SQLite로 작업 관리
3. **Cross-Session Memory** — 세션 간 지식 영속화
4. **Background Agent Fire** — 실행 후 잊어도 되는 에이전트 실행
5. **Plan Mode Review** — 시각적 단계별 승인
6. **Model Selector** — 하위 작업별 최적 모델 자동 선택
7. **GitHub Issue Triage** — 내장 GitHub MCP로 이슈 자동 분류
8. **PR Review Pipeline** — 엔드투엔드 PR 리뷰 워크플로우
9. **Actions Debug** — 네이티브 Actions 접근으로 CI/CD 실패 디버깅
10. **LSP-Powered Refactor** — Language Server 인텔리전스를 활용한 리팩토링
11. **Copilot Space Query** — Copilot Spaces에서 팀 컨텍스트 조회
12. **Multi-AI Delegate** — 다른 AI 코딩 에이전트에게 하위 작업 위임
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
| ⚖️ **Copilot vs Claude Code** | 기능별 상세 비교 |
| 🚚 **Claude Code에서 마이그레이션** | 단계별 마이그레이션 가이드 |
| ⭐ **Copilot 전용 기능** | Copilot CLI에서만 가능한 기능 |
| 🌐 **오케스트레이션 가이드** ★ | Multi-AI 오케스트레이션 패턴 및 설정 |

모든 가이드는 [`guides/`](guides/) 디렉토리에 있습니다.

---

## Multi-AI Orchestration ★

> **킬러 피처.** GitHub Copilot CLI는 여러 AI 코딩 에이전트를 통합 조율하는 **메타 허브** 역할을 할 수 있습니다 — 각 에이전트의 고유한 강점을 살려서.

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

### 5가지 오케스트레이션 패턴

| 패턴 | 동작 방식 | 적합한 상황 |
|------|-----------|-------------|
| 🐚 **Shell Execution** | Copilot이 셸 명령으로 다른 CLI를 생성 | 단순한 작업 위임 |
| 🔌 **MCP Bridge** | Model Context Protocol 서버를 통해 에이전트 연결 | 구조화된 도구 공유 |
| 💬 **Message IPC** | 파일/파이프를 통한 프로세스 간 통신 | 실시간 협업 |
| 🔗 **Pipeline** | 에이전트를 순차 연결 — 이전 출력이 다음 입력으로 | 다단계 워크플로우 |
| 🏛️ **Agent Council** | 여러 에이전트가 토론하고 결정에 투표 | 중요한 의사결정 |

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
| 멀티 모델 (18개 이상) | ✅ | ⚠️ 단일 벤더 |
| IDE ↔ CLI 공유 컨텍스트 | ✅ | ❌ |
| Plan Mode (시각적 UI) | ✅ | ⚠️ 텍스트 전용 |
| Autopilot Mode | ✅ | ⚠️ `--dangerously-skip-permissions` |
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

이미 `everything-claude-code`를 사용하고 계신가요? 마이그레이션은 간단합니다:

```
CLAUDE.md 규칙        →  rules/common/ & rules/languages/
.claude/commands/     →  skills/
.claude/settings.json →  mcp-configs/ & contexts/
```

마이그레이션 스크립트가 대부분의 작업을 자동화합니다:

```bash
node scripts/migrate-from-claude.js --source /path/to/your/project
```

> 🚚 단계별 안내는 [마이그레이션 가이드](guides/)를 참고하세요.

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
  <sub><a href="https://github.com/anthropics/everything-claude-code">everything-claude-code</a>에서 영감을 받아 · GitHub Copilot CLI 커뮤니티를 위해 제작</sub>
</p>
