# 마이그레이션 타당성 검증 문서

> 작성 일시: 2026-03-29  
> 목적: awesome-claude-code → everything-copilot-cli 반영 계획의 타당성 근거 제시  
> 검증 대상: 무엇을(What), 왜(Why), 어떻게(How) 수정하려는가

---

## 1. 전제 검증: 두 AI 도구의 동등성

### Claude Code 핵심 개념과 Copilot CLI 대응

| Claude Code 개념 | Copilot CLI 대응 | 동등성 |
|-----------------|-----------------|--------|
| `/slash-command` (`.claude/commands/*.md`) | `skills/**/*.md` (스킬 파일) | **높음** — 둘 다 Markdown + 프롬프트 패턴 |
| `CLAUDE.md` | `.github/copilot-instructions.md` | **높음** — 동일 목적, 형식 유사 |
| Hooks (lifecycle) | GitHub Actions composite actions | **중간** — 개념 유사, 구현 다름 |
| `--print` 파이프 | orchestration/patterns/ | **높음** — 이미 반영됨 |

**결론**: slash-commands의 스킬 포팅은 개념적으로 타당하며 기술적으로 실행 가능하다.

---

## 2. 항목별 타당성 검증

---

### Phase 1: skills/workflow/, skills/product/ 디렉터리 신설

**현재 상태**:
- `skills/workflow/`는 존재하나 `security-audit`, `sprint-retro`, `sprint-workflow`만 있음
- `skills/product/`는 존재하나 `feature-prioritization`, `launch-strategy`, `opportunity-solution-tree`만 있음

**문제점**:
- 새로 포팅할 `commit`, `create-pr`, `release` 스킬이 들어갈 논리적 위치가 명확하지 않음
- `create-prd`, `create-jtbd`, `create-prp`는 product 카테고리이나 기존 스킬과 성격이 다름

**수정 내용**: 디렉터리 구조 변경 없음, README에 각 카테고리 정의 명문화

**타당성**: 
- ✅ 구조 변경 없이 기존 디렉터리 활용 가능
- ✅ README 업데이트로 카테고리 의도 명확화
- ✅ 향후 기여자가 스킬 배치를 결정할 기준 제공

---

### Phase 2-A: commit-workflow 스킬 신규 추가

**원본**: `resources/slash-commands/commit/commit.md` (7,577 bytes)

**현재 gap**: `everything-copilot-cli`에 커밋 자동화 스킬이 없음

**왜 이게 가치 있는가**:
1. **Conventional Commits 표준화**: 팀이 `feat:`, `fix:`, `docs:` 등 타입을 일관성 있게 사용
2. **원자적 커밋 분리**: diff를 분석해 논리적으로 독립된 변경사항을 여러 커밋으로 자동 분리 제안
3. **50+ 이모지 매핑**: gitmoji 스타일의 시각적 커밋 히스토리
4. **실전 검증됨**: awesome-claude-code에 기여된 실제 사용 패턴

**Copilot CLI 적응 방법**:
```markdown
# 변경 사항
- "$ARGUMENTS" → 직접 diff 분석으로 대체 (Copilot은 컨텍스트 인식)
- 프로젝트별 pre-commit 명령어 → 일반화 (`npm run lint`, `pre-commit run` 등)
- fish shell psub → PowerShell 호환 문법으로 변경
```

**파일 위치**: `skills/workflow/commit-workflow/SKILL.md`

**예상 frontmatter**:
```yaml
---
name: commit-workflow
description: Conventional commits with emoji, atomic split, and pre-commit validation
metadata:
  category: workflow
  agent_type: general-purpose
---
```

**타당성**: ✅ 높음 — 원본 내용의 80%가 그대로 적용 가능, 20%만 플랫폼 적응 필요

---

### Phase 2-B: pr-multi-perspective-review 스킬 신규 추가

**원본**: `resources/slash-commands/pr-review/pr-review.md` (3,820 bytes)

**현재 gap**: `skills/development/code-review/SKILL.md`는 기술적 관점만 다룸

**왜 이게 가치 있는가**:
1. **기존 스킬과 차별화**: 현재 `code-review`는 개발자 관점의 기술 리뷰만 수행
2. **비즈니스 가치 검증 포함**: PM 관점에서 비즈니스 가치, 전략적 정렬 평가
3. **완전성 보장**: QA, Security, DevOps, UX 관점까지 커버 → 리뷰 사각지대 제거
4. **즉시 처리 원칙**: "미래 개선사항"을 현재 PR에서 처리하도록 강제

**Copilot CLI 적응 방법**:
```markdown
# 변경 사항
- "$ARGUMENTS" (PR 링크/번호) → Copilot의 GitHub MCP 도구로 대체
- GitHub PR 코멘트 작성 → github-mcp-server 도구 사용
- 6개 Task를 6개 서브-에이전트로 병렬 실행 가능 (fleet 패턴)
```

**파일 위치**: `skills/development/pr-multi-perspective-review/SKILL.md`

**타당성**: ✅ 높음 — Copilot의 GitHub MCP 통합이 오히려 더 강력한 PR 리뷰를 가능하게 함

---

### Phase 2-C: fix-github-issue 스킬 신규 추가

**원본**: `resources/slash-commands/fix-github-issue/fix-github-issue.md` (463 bytes)

**현재 gap**: GitHub 이슈 → 코드 수정 → 테스트 → 커밋의 end-to-end 스킬 없음

**왜 이게 가치 있는가**:
- `gh issue view` → 코드베이스 검색 → 수정 → 테스트 → 커밋의 표준 워크플로우
- Copilot은 `github-mcp-server` 도구를 통해 이슈 읽기/쓰기 네이티브 지원 → **원본보다 강력**

**Copilot CLI 강화 방법**:
```markdown
# 원본보다 개선될 부분
- gh CLI 대신 github-mcp-server 도구 직접 사용 (더 안정적)
- 이슈 레이블/마일스톤 자동 업데이트
- 수정 완료 후 자동 PR 생성까지 연결
- 관련 이슈 cross-reference 자동 추가
```

**파일 위치**: `skills/development/fix-github-issue/SKILL.md`

**타당성**: ✅ 매우 높음 — Copilot의 GitHub 네이티브 통합으로 원본 능가 가능

---

### Phase 2-D: create-prd 스킬 신규 추가

**원본**: `resources/slash-commands/create-prd/create-prd.md`

**현재 gap**: `skills/product/`에는 기능 우선순위, 출시 전략 스킬은 있으나 PRD 생성 없음

**왜 이게 가치 있는가**:
- Product Manager 역할의 AI 스킬 — PM 없는 팀에서 AI가 PRD 초안 작성
- Jobs-to-be-Done(JTBD) 연계 → 사용자 관점 중심의 요구사항 문서화
- 기존 `feature-prioritization`, `launch-strategy`와 연결되는 PM 워크플로우 완성

**Copilot CLI 적응 방법**:
```markdown
# 변경 사항
- 하드코딩된 경로 (`product-development/`) → 프로젝트 내 자동 탐지
- 특정 파일 의존성 → 자유 형식 컨텍스트 로딩으로 일반화
- JTBD.md → JTBD 스킬 연계 (나중에 create-jtbd 스킬 추가 가능)
```

**파일 위치**: `skills/product/create-prd/SKILL.md`

**타당성**: ✅ 높음 — 기존 product 스킬 3개를 보완하는 핵심 빠진 조각

---

### Phase 2-E: add-to-changelog 스킬 신규 추가

**원본**: `resources/slash-commands/add-to-changelog/add-to-changelog.md`

**현재 gap**: `skills/documentation/`에 CHANGELOG 관리 스킬 없음

**왜 이게 가치 있는가**:
- Keep a Changelog + Semantic Versioning 표준 강제
- 버전 섹션 자동 탐지 및 생성
- `package.json`, `__init__.py` 등 버전 파일 자동 동기화

**타당성**: ✅ 높음 — 릴리즈 워크플로우의 필수 구성 요소

---

### Phase 2-F: release 스킬 신규 추가

**원본**: `resources/slash-commands/release/`

**현재 gap**: 릴리즈 자동화 스킬 없음

**왜 이게 가치 있는가**:
- `add-to-changelog` → 버전 태그 → GitHub Release 생성 → 알림 의 완전한 릴리즈 파이프라인
- Copilot의 GitHub MCP 통합으로 Release 생성 자동화 가능

**타당성**: ✅ 높음 — Copilot은 `gh release create`보다 더 스마트한 릴리즈 노트 생성 가능

---

### Phase 2-G: context-prime 스킬 신규 추가

**원본**: `resources/slash-commands/context-prime/context-prime.md`

**내용**:
```
Read README.md, THEN run git ls-files to understand the context of the project
```

**왜 이게 가치 있는가**:
- 새 세션 시작 시 AI가 프로젝트를 빠르게 파악하는 표준 절차
- `skills/copilot-exclusive/`에 배치하면 Copilot 특화 컨텍스트 로딩 예시 제공

**Copilot CLI 강화 방법**:
```markdown
- README.md 읽기
- git ls-files로 파일 목록 파악
- .github/copilot-instructions.md 읽기
- 최근 커밋 3-5개 확인 (현재 개발 방향 파악)
- package.json / pyproject.toml 읽기 (기술 스택 파악)
```

**파일 위치**: `skills/copilot-exclusive/context-prime/SKILL.md`

**타당성**: ✅ 높음 — Copilot에서 세션 시작을 표준화하는 중요한 패턴

---

### Phase 3: evaluate-repository 스킬 포팅

**원본**: `.claude/commands/evaluate-repository.md` (4,331 bytes)

**현재 gap**: `skills/security/`에 저장소 수준의 종합 감사 스킬 없음

**왜 이게 가치 있는가**:
1. **5개 차원 스코어링**: Code Quality, Security, Documentation, Functionality, Repository Hygiene
2. **정적 분석만 사용**: 코드 실행 없이 안전하게 평가 가능
3. **Red Flag 스캔**: 악성 코드, 암묵적 실행, 미공개 사이드 이펙트 탐지
4. **Copilot CLI 맥락 재작성 필요**: 
   - Claude Code hooks → GitHub Actions hooks로 체크리스트 항목 변경
   - MCP 서버 실행 위험성 → Copilot 도구 권한 관점으로 변경

**Copilot CLI 체크리스트 변경 사항**:
```markdown
원본 (Claude Code 특화):
- Hooks 정의 여부 (stop, lifecycle)
- Hooks의 셸 스크립트 실행 여부

포팅 후 (Copilot CLI 맥락):
- GitHub Actions workflow 정의 여부
- 셸 스크립트 실행 권한 요구 여부
- MCP 서버 설정의 네트워크 접근 여부
- devcontainer 설정의 권한 요청 수준
```

**파일 위치**: `skills/security/evaluate-repository/SKILL.md`

**타당성**: ✅ 높음 — 보안 스킬 디렉터리에 가장 고수준의 감사 도구가 추가됨

---

### Phase 4: 다중 AI 오케스트레이션 패턴 강화

#### 신규: fan-out-parallel 패턴

**현재 상태**: `orchestration/patterns/pipeline.md`는 직렬 순차만 다룸

**왜 필요한가**:
- 독립적인 작업 3개를 Claude/Codex/Gemini가 **동시에** 처리하면 3배 빠름
- Copilot이 orchestrator 역할로 결과를 취합

**예시 시나리오**:
```
사용자 요청: "인증 모듈 구현"

Copilot (플래너):
  → Claude: "JWT 토큰 로직 설계 및 구현"     ← 병렬 실행
  → Codex:  "비밀번호 해싱 유틸리티 구현"    ← 병렬 실행
  → Gemini: "인증 미들웨어 구현"             ← 병렬 실행

Copilot (취합자): 세 결과를 통합, 충돌 해결, PR 생성
```

**타당성**: ✅ 매우 높음 — 기존 agent-council.md가 개념은 있으나 구체적 구현 패턴 없음

---

#### 신규: review-trio 패턴

**현재 상태**: `code-reviewer`, `security-reviewer` 에이전트는 단독으로만 작동

**왜 필요한가**:
- Copilot: GitHub 통합 (PR 댓글 작성, 레이블 설정)
- Claude Code: 200K 컨텍스트, 심층 코드 분석
- Gemini: 사실 확인, 문서 정확성 검증

```
PR 변경사항
  → Copilot  → GitHub PR에 리뷰 구조 작성
  → Claude   → 코드 로직 심층 분석 (200K 컨텍스트)
  → Gemini   → 문서/API 일관성 검증

결과 취합 → Copilot이 종합 리뷰 코멘트로 게시
```

**타당성**: ✅ 높음 — 세 도구의 강점이 상호 보완적

---

### Phase 5: CLAUDE.md → Copilot Instructions 템플릿 갤러리

**현재 상태**: `examples/` 4개 디렉터리 있으나 copilot-instructions 충실도 미확인

**왜 필요한가**:
- awesome-claude-code의 22개 CLAUDE.md 예시는 도메인별 AI 지침의 best practice
- Copilot 사용자가 `.github/copilot-instructions.md`를 어떻게 작성해야 할지 참조할 수 있음

**신규 추가 예시**:
- `examples/aws-mcp-server/` (새 폴더): AWS MCP 서버 개발 특화 지침
  - Infrastructure as Code 컨텍스트
  - AWS SDK 사용 패턴
  - IAM 권한 최소화 원칙

**타당성**: ✅ 중간 — 직접적인 이점은 있으나 Priority는 낮음

---

### Phase 6: guides/hooks-to-github-actions.md 신규

**현재 상태**: 마이그레이션 가이드에 Hooks 섹션 없음

**왜 필요한가**:
- Claude Code 사용자가 가장 어려워하는 마이그레이션 항목이 Hooks
- `create-hook`, `husky` slash-command는 Copilot에서 다른 방식으로 달성

**매핑 테이블** (가이드에 들어갈 내용):

| Claude Code Hook | 용도 | Copilot CLI 대응 |
|-----------------|------|-----------------|
| `PreToolUse` | 도구 실행 전 체크 | GitHub Actions pre-step |
| `PostToolUse` | 도구 실행 후 처리 | GitHub Actions post-step |
| `Stop` | 세션 종료 시 | GitHub Actions 마지막 job |
| `husky pre-commit` | 커밋 전 lint/test | `.husky/pre-commit` (동일) |
| `create-hook` 슬래시 커맨드 | 훅 파일 생성 | GitHub Actions composite action |

**타당성**: ✅ 높음 — Claude Code에서 넘어오는 사용자에게 필수 정보

---

## 3. 변경하지 않을 항목 및 이유

| 항목 | 유지 이유 |
|------|----------|
| `skills/development/code-review/SKILL.md` | 기술적 리뷰는 이미 충분, pr-multi-perspective가 보완 |
| `skills/security/security-scan/SKILL.md` | OWASP 기반 스캔 이미 양호, evaluate-repository가 상위 레벨 추가 |
| `orchestration/patterns/pipeline.md` | 이미 좋은 내용, Gemini 예시만 보강 필요 |
| `guides/migration-from-claude-code.md` | 기존 내용 유지하며 섹션 추가만 |
| 에이전트 정의 8개 | 변경 불필요 |

---

## 4. 우선순위 매트릭스

| 작업 | 임팩트 | 노력 | 우선순위 |
|------|--------|------|----------|
| fix-github-issue 스킬 | ⭐⭐⭐ 높음 | 🟢 낮음 | **P0** |
| commit-workflow 스킬 | ⭐⭐⭐ 높음 | 🟡 중간 | **P0** |
| pr-multi-perspective 스킬 | ⭐⭐⭐ 높음 | 🟡 중간 | **P0** |
| evaluate-repository 스킬 | ⭐⭐ 중간 | 🟡 중간 | **P1** |
| add-to-changelog 스킬 | ⭐⭐ 중간 | 🟢 낮음 | **P1** |
| create-prd 스킬 | ⭐⭐ 중간 | 🟡 중간 | **P1** |
| context-prime 스킬 | ⭐⭐ 중간 | 🟢 낮음 | **P1** |
| fan-out-parallel 패턴 | ⭐⭐⭐ 높음 | 🔴 높음 | **P2** |
| review-trio 패턴 | ⭐⭐ 중간 | 🔴 높음 | **P2** |
| hooks-to-github-actions 가이드 | ⭐⭐ 중간 | 🟡 중간 | **P2** |
| AWS MCP 서버 예시 | ⭐ 낮음 | 🔴 높음 | **P3** |

---

## 5. 리스크 및 완화 방안

| 리스크 | 설명 | 완화 방안 |
|--------|------|----------|
| 플랫폼 차이 | fish shell 문법, Cursor 특화 기능 등 일부 원본 내용은 Copilot에서 직접 사용 불가 | 포팅 시 PowerShell/bash 호환 문법으로 변경 |
| 하드코딩된 경로 | 일부 slash-command는 특정 프로젝트 구조를 가정 | 일반화된 패턴으로 변환, 예시 경로는 주석 처리 |
| 저작권 | 기여자별 라이선스 상이 가능 | awesome-claude-code는 MIT 라이선스, 출처 명시 |
| 기존 스킬과 중복 | `doc-update`와 `update-docs`, `code-review`와 `pr-multi-perspective` 등 | 차별점을 When to Use 섹션에 명확히 기재 |
| 검증 실패 | 새 스킬이 `npm run validate` 통과 못할 가능성 | 기존 스킬 frontmatter 형식 그대로 준수 |

---

## 6. 검증 체크리스트

아래 항목을 각 새 파일 생성 후 확인:

- [ ] YAML frontmatter에 `name`, `description`, `metadata.category`, `metadata.agent_type` 포함
- [ ] `## When to Use` 섹션 있음
- [ ] `## Workflow` 섹션에 PowerShell/bash 코드 블록 있음
- [ ] `npm run validate` 통과
- [ ] `npm run lint:md` 통과
- [ ] 기존 스킬과 중복되지 않거나 차별점 명시됨
- [ ] Claude Code 특화 문법 (Bash 도구, psub, fish shell 등) 제거됨
- [ ] 출처(awesome-claude-code) 주석 또는 See Also 섹션에 언급됨
