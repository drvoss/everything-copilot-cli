# 원본 저장소 스냅샷: hesreallyhim/awesome-claude-code

> 분석 일시: 2026-03-29  
> 커밋 SHA: ca3bf521c2fef4b1dd2f480ed7b4bb66481ec63f  
> URL: https://github.com/hesreallyhim/awesome-claude-code

---

## 저장소 개요

**awesome-claude-code**는 Claude Code를 위한 curated 리소스 모음으로,
실제 사용자들이 기여한 slash-commands, CLAUDE.md 파일, 워크플로우 가이드, 훅(hooks),
상태 표시줄 설정, 도구(tooling) 등을 카탈로그 형태로 모아놓은 저장소다.

---

## 디렉터리 구조

```
awesome-claude-code/
├── .claude/
│   └── commands/
│       └── evaluate-repository.md        ← 저장소 보안/품질 감사 명령어
├── resources/
│   ├── claude.md-files/                  ← 도메인별 CLAUDE.md 예시 (22개 프로젝트)
│   │   ├── AI-IntelliJ-Plugin/
│   │   ├── AWS-MCP-Server/
│   │   ├── Basic-Memory/
│   │   ├── LangGraphJS/
│   │   ├── Perplexity-MCP/
│   │   └── ...
│   ├── slash-commands/                   ← 핵심 slash-command 파일들 (22개)
│   │   ├── act/
│   │   ├── add-to-changelog/
│   │   ├── clean/
│   │   ├── commit/
│   │   ├── context-prime/
│   │   ├── create-hook/
│   │   ├── create-jtbd/
│   │   ├── create-pr/
│   │   ├── create-prd/
│   │   ├── create-prp/
│   │   ├── create-pull-request/
│   │   ├── create-worktrees/
│   │   ├── fix-github-issue/
│   │   ├── husky/
│   │   ├── initref/
│   │   ├── load-llms-txt/
│   │   ├── optimize/
│   │   ├── pr-review/
│   │   ├── release/
│   │   ├── testing_plan_integration/
│   │   ├── todo/
│   │   ├── update-branch-name/
│   │   └── update-docs/
│   ├── official-documentation/
│   └── workflows-knowledge-guides/
│       ├── Blogging-Platform-Instructions/
│       └── Design-Review-Workflow/
├── templates/
│   ├── categories.yaml                   ← 전체 카테고리 정의 (단일 진실 소스)
│   ├── README_AWESOME.template.md
│   ├── README_EXTRA.template.md
│   └── resource-overrides.yaml
├── data/
├── docs/
├── scripts/
└── tools/
```

---

## 카테고리 체계 (templates/categories.yaml 발췌)

| ID | 이름 | 아이콘 | 설명 |
|----|------|--------|------|
| `skills` | Agent Skills | 🤖 | 특화 작업을 위한 모델 제어 설정 파일 |
| `workflows` | Workflows & Knowledge Guides | 🧠 | 프로젝트 특화 Claude Code 네이티브 리소스 묶음 |
| `tooling` | Tooling | 🧰 | Claude Code 위에 구축된 애플리케이션 |
| `statusline` | Status Lines | 📊 | 상태 표시줄 커스터마이제이션 |
| `hooks` | Hooks | 🪝 | 에이전트 생명주기 이벤트 기반 훅 |
| `slash-commands` | Slash-Commands | 🔪 | 특정 작업 수행을 위한 정제된 프롬프트 |
| `claude-md-files` | CLAUDE.md Files | 📂 | 프로젝트별 AI 지침 파일 |
| `alternative-clients` | Alternative Clients | 📱 | 대체 UI/프론트엔드 |
| `official-documentation` | Official Documentation | 🏛️ | Anthropic 공식 문서 링크 |

---

## 핵심 Slash Commands 내용 (원문 발췌)

### 1. `/commit` (resources/slash-commands/commit/commit.md)

**목적**: 관행적 커밋 메시지 + 이모지 자동 생성, 원자적 커밋 분리

**주요 기능**:
- `--no-verify` 옵션: pre-commit 체크 건너뜀
- 스테이징된 파일이 없으면 `git add` 자동 실행
- diff 분석 후 논리적으로 분리 가능한 변경사항이 있으면 여러 커밋으로 분리 제안
- Conventional Commit 형식: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`
- 각 타입별 이모지 매핑 (✨ feat, 🐛 fix, 📝 docs, ♻️ refactor, ⚡️ perf 등 50+ 이모지)

**주요 원칙**:
- 명령형 현재 시제 ("add feature" not "added feature")
- 첫 줄 72자 이내
- 커밋 분리 기준: 다른 관심사, 다른 변경 유형, 파일 패턴, 논리적 그룹, 크기

---

### 2. `/pr-review` (resources/slash-commands/pr-review/pr-review.md)

**목적**: 6가지 관점의 체계적 PR 리뷰

**6개 리뷰 태스크**:
1. **Product Manager Review** — 비즈니스 가치, 사용자 경험, 전략적 정렬
2. **Developer Review** — 코드 품질, 유지보수성, 성능, 모범 사례
3. **Quality Engineer Review** — 테스트 커버리지, 버그/엣지케이스, 회귀 위험
4. **Security Engineer Review** — 취약점, 데이터 처리, 컴플라이언스
5. **DevOps Review** — CI/CD 통합, 인프라/설정, 모니터링
6. **UI/UX Designer Review** — 시각적 일관성, 사용성/접근성, 인터랙션 흐름

**특징**: "미래 개선사항"은 즉시 처리 원칙 (no deferrals)

---

### 3. `/fix-github-issue` (resources/slash-commands/fix-github-issue/fix-github-issue.md)

**원문**:
```
Please analyze and fix the GitHub issue: $ARGUMENTS.

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
```

---

### 4. `/context-prime` (resources/slash-commands/context-prime/context-prime.md)

**원문**:
```
Read README.md, THEN run `git ls-files | grep -v -f (sed 's|^|^|; s|$|/|' .cursorignore | psub)` 
to understand the context of the project
```

**목적**: 작업 시작 전 프로젝트 컨텍스트를 AI에 로딩

---

### 5. `/add-to-changelog` (resources/slash-commands/add-to-changelog/add-to-changelog.md)

**목적**: Keep a Changelog 형식으로 CHANGELOG.md 업데이트

**사용법**: `/add-to-changelog <version> <change_type> <message>`

**change_type**: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`

**기능**:
1. CHANGELOG.md 없으면 생성
2. 버전 섹션 있으면 추가, 없으면 오늘 날짜로 신규 섹션 생성
3. Keep a Changelog 규약 준수
4. 변경 커밋 제안

---

### 6. `/create-pull-request` (resources/slash-commands/create-pull-request/create-pull-request.md)

**목적**: GitHub CLI를 사용한 PR 생성 표준화

**주요 내용**:
- `gh pr create --draft --title "✨(scope): title" --body-file .github/pull_request_template.md`
- Conventional commit 형식 + 실제 이모지 문자 사용
- 영문 PR 제목/설명 강제
- PR 템플릿 섹션 정확히 준수
- pr_agent 섹션 유지 (`pr_agent:summary`, `pr_agent:walkthrough`)
- 작업 중엔 Draft PR, 완료 시 `gh pr ready`

---

### 7. `/create-prd` (resources/slash-commands/create-prd/create-prd.md)

**목적**: Product Requirements Document 생성

**워크플로우**:
1. `product-development/resources/product.md` 읽기 (제품 이해)
2. `product-development/current-feature/feature.md` 읽기 (기능 아이디어)
3. `product-development/current-feature/JTBD.md` 읽기 (Jobs-to-be-Done)
4. PRD 템플릿 기반으로 PRD 문서 생성 → `product-development/current-feature/PRD.md`

---

## `.claude/commands/evaluate-repository.md` (전체 구조)

**목적**: Claude Code 생태계 내 저장소의 정적 보안/품질 감사

**평가 기준 (각 1-10점)**:
1. **Code Quality** — 구조, 가독성, 정확성, 내부 일관성
2. **Security & Safety** — 암묵적 실행, 파일시스템/네트워크 접근, 자격증명 처리
3. **Documentation & Transparency** — 동작 정확성, 부작용 공개
4. **Functionality & Scope** — 명시된 범위 내 기능 동작 여부
5. **Repository Hygiene & Maintenance** — 유지보수성, 라이선스, 발행 품질

**Claude Code 특화 체크리스트**:
- [ ] Hooks 정의 여부 (stop, lifecycle)
- [ ] Hooks의 셸 스크립트 실행 여부
- [ ] 명령어의 셸/외부 도구 실행 여부
- [ ] 영속적 로컬 상태 파일 작성 여부
- [ ] 상태 파일이 실행 흐름 제어에 사용 여부
- [ ] 명시적 확인 없는 암묵적 실행 여부
- [ ] 훅/명령어 부작용 문서화 여부
- [ ] 안전한 기본값 포함 여부
- [ ] 명확한 비활성화/취소 메커니즘 여부

**권고 분류**: Recommend / Recommend with caveats / Needs further manual review / Definitely reject

---

## CLAUDE.md 파일 예시 목록 (resources/claude.md-files/)

| 프로젝트명 | 도메인 |
|------------|--------|
| AI-IntelliJ-Plugin | IDE 통합 |
| AVS-Vibe-Developer-Guide | 음성 서비스 |
| AWS-MCP-Server | 클라우드 인프라 |
| Basic-Memory | 메모리/지식 관리 |
| Comm | 커뮤니케이션 |
| Course-Builder | 교육 플랫폼 |
| Cursor-Tools | 도구 통합 |
| DroidconKotlin | Android 개발 |
| EDSL | DSL 설계 |
| Giselle | 워크플로우 빌더 |
| Guitar | 음악/창작 |
| JSBeeb | BBC Micro 에뮬레이터 |
| Lamoom-Python | Python AI 프레임워크 |
| LangGraphJS | LangGraph JS |
| Network-Chronicles | 네트워킹 게임 |
| Note-Companion | Obsidian 플러그인 |
| Pareto-Mac | 맥 생산성 앱 |
| Perplexity-MCP | MCP 서버 |
| SG-Cars-Trends-Backend | 데이터 분석 백엔드 |
| SPy | Python 보안 |
| TPL | 템플릿 엔진 |
| claude-code-mcp-enhanced | MCP 강화 |

---

## 요약: 이 저장소에서 얻을 수 있는 핵심 인사이트

1. **실전 검증된 프롬프트 패턴**: 수십 명의 기여자가 실제 사용하며 검증한 slash-commands
2. **다중 관점 리뷰 패턴**: PR을 PM/Dev/QA/Security/DevOps/UX 관점으로 나눠 검토하는 체계적 접근
3. **도메인별 AI 지침 파일 구조**: 22개 실제 프로젝트의 CLAUDE.md 파일에서 공통 패턴 추출 가능
4. **Hooks 개념**: Claude Code 생명주기 이벤트 기반 자동화 패턴
5. **저장소 감사 도구**: 정적 분석 기반의 보안/품질 평가 방법론
6. **분류 체계**: 명확하게 정의된 카테고리 taxonomy (categories.yaml)
