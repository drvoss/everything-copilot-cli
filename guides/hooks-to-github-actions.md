# Hooks to GitHub Actions (and Alternatives)

> **Claude Code → Copilot CLI 마이그레이션 가이드: Hooks 편**

Claude Code의 **Hooks**는 AI 세션 내 이벤트에 실행되는 스크립트입니다.
Copilot CLI에는 동일한 세션 내 훅 시스템이 없지만, 목적에 따라 세 가지 대안이 있습니다.

---

## Claude Code Hooks 개요

Claude Code는 다음 이벤트에 훅을 지원합니다:

| 훅 타입 | 실행 시점 |
|---------|----------|
| `PreToolUse` | AI가 도구(파일 수정, 명령 실행 등)를 사용하기 직전 |
| `PostToolUse` | AI가 도구를 사용한 직후 |
| `Notification` | AI 세션이 주의를 요청할 때 |
| `Stop` | AI 세션이 완료될 때 |
| `SubagentStop` | 서브에이전트가 완료될 때 |

**핵심 차이**: Claude Code Hooks는 *AI 세션 생명주기* 이벤트에 응답합니다.
Copilot CLI에는 이에 직접 대응하는 메커니즘이 없습니다.

---

## 대안 매핑 (대응이 아닌 대안)

아래 표는 Claude Code Hooks의 *목적*에 따라 Copilot 생태계에서 유사한 효과를 낼 수 있는 방법을 보여줍니다.

| Claude Code Hook | 주요 사용 사례 | Copilot 대안 1 | Copilot 대안 2 | Copilot 대안 3 |
|-----------------|---------------|---------------|---------------|---------------|
| `PreToolUse` | 변경 전 린트/검증 실행 | [Git Pre-commit Hook](#1-git-pre-commit-hooks) | [GitHub Actions (PR)](#2-github-actions) | [Pre-task Checklist in Prompt](#3-prompt-level-guards) |
| `PostToolUse` | 변경 후 테스트/포맷 실행 | [Git Post-commit Hook](#1-git-pre-commit-hooks) | [GitHub Actions (push)](#2-github-actions) | — |
| `Stop` | AI 세션 완료 후 요약 생성 | GitHub Actions (PR 생성 시) | Manual | — |
| `Notification` | 알림 발송 | GitHub Actions (Slack/Email) | `gh` CLI notification | — |
| `SubagentStop` | 서브에이전트 결과 집계 | [Fleet + GitHub Actions](#2-github-actions) | Orchestration pattern | — |

---

## 대안 1: Git Pre-commit Hooks

**적합한 경우**: `PreToolUse`처럼 커밋 직전에 코드 품질을 강제하고 싶을 때

### Husky + lint-staged (Node.js)

```powershell
# 설치
npm install --save-dev husky lint-staged
npx husky init

# .husky/pre-commit 파일 생성
@"
npx lint-staged
"@ | Set-Content .husky/pre-commit

# package.json에 lint-staged 설정 추가
# {
#   "lint-staged": {
#     "*.{ts,js}": ["eslint --fix", "prettier --write"],
#     "*.md": ["markdownlint --fix"]
#   }
# }
```

### pre-commit (Python/범용)

```powershell
# 설치
pip install pre-commit

# .pre-commit-config.yaml 생성
@"
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
"@ | Set-Content .pre-commit-config.yaml

pre-commit install
```

**장점**: 로컬에서 즉시 실행, 네트워크 불필요
**단점**: 팀원이 훅을 설치해야 함 (`pre-commit install`)

---

## 대안 2: GitHub Actions

**적합한 경우**: PR 게이트, 배포 검증, 알림 발송처럼 CI/CD 수준의 자동화가 필요할 때

### PR Gate (PreToolUse의 CI 대응물)

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

### Post-Merge Notification (Stop Hook의 CI 대응물)

```yaml
# .github/workflows/notify-on-merge.yml
name: Notify on Merge

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  notify:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.26.0
        with:
          channel-id: '#deployments'
          slack-message: "✅ PR #${{ github.event.number }} merged: ${{ github.event.pull_request.title }}"
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

### Fleet Agent Results Aggregation (SubagentStop 대응물)

```yaml
# .github/workflows/multi-agent-review.yml
name: Multi-Agent Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  security-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Security Scan
        run: npm run security:scan > security-results.txt
      - uses: actions/upload-artifact@v4
        with:
          name: security-results
          path: security-results.txt

  quality-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Quality Analysis
        run: npm run quality:check > quality-results.txt
      - uses: actions/upload-artifact@v4
        with:
          name: quality-results
          path: quality-results.txt

  aggregate-results:
    needs: [security-review, quality-review]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - name: Post Aggregated Review
        run: |
          echo "## Automated Review Results" >> review.md
          cat security-results/security-results.txt >> review.md
          cat quality-results/quality-results.txt >> review.md
          gh pr comment ${{ github.event.number }} --body-file review.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**장점**: 모든 팀원에게 자동 적용, 인프라로 관리
**단점**: CI/CD 파이프라인 이벤트에만 반응 (AI 세션 이벤트 아님)

---

## 대안 3: Prompt-Level Guards

**적합한 경우**: AI가 실행하기 전에 특정 검사를 수행하도록 지시할 때 (`PreToolUse`의 프롬프트 대응물)

### `.github/copilot-instructions.md`에 규칙 추가

```markdown
## Before Making Changes

Before modifying any file:
1. Run `npm run lint` and fix any existing errors first
2. Check `git status` — do not work on uncommitted changes from a previous session
3. For security-sensitive files (auth/, config/), read the file completely before editing

## After Making Changes

After any code changes:
1. Run the relevant test suite: `npm test -- --testPathPattern="<changed-file>"`
2. Verify `npm run build` succeeds before committing
3. Update CHANGELOG.md if the change is user-visible
```

### 세션 시작 시 체크리스트 프롬프트

```
> Before we start today's work:
> 1. Run npm run lint and show me any errors
> 2. Run npm test and show me the pass/fail summary
> 3. Show me the last 3 commits
> Then proceed with the task.
```

**장점**: 별도 설치 불필요, 즉시 적용
**단점**: AI가 지침을 무시할 수 있음 (강제성 없음)

---

## 사용 사례별 권고 대안

| 목적 | 권고 대안 | 이유 |
|-----|----------|------|
| 커밋 전 린트 강제 | Git Pre-commit Hook (Husky) | 즉시 로컬 실행, 설정 간단 |
| PR 머지 전 테스트 게이트 | GitHub Actions | 팀 전체 강제 적용 |
| AI 작업 전 컨텍스트 체크 | Prompt-Level Guard | 별도 인프라 불필요 |
| 배포 후 알림 | GitHub Actions | 안정적, 재사용 가능 |
| 병렬 에이전트 결과 집계 | GitHub Actions + Fleet | Copilot Fleet + CI 결합 |

---

## Claude Code Hooks에서의 마이그레이션 예시

### 원본: Claude Code `Stop` Hook

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo 'Session complete' | notify-send"
      }]
    }]
  }
}
```

### Copilot 대안 A: GitHub Actions (Push 시 Slack 알림)

```yaml
on:
  push:
    branches: [main]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Push to main completed"
      # Slack notification step here
```

### Copilot 대안 B: Prompt Guard (세션 종료 전 체크리스트)

```markdown
## Session Wrap-Up (copilot-instructions.md)
At the end of each task:
1. Run the test suite
2. Commit all changes with conventional commit format
3. Update CHANGELOG.md [Unreleased] section
```

---

## 관련 가이드

- [`migration-from-claude-code.md`](./migration-from-claude-code.md) — 전체 마이그레이션 개요
- [`context-prime`](../skills/copilot-exclusive/context-prime/SKILL.md) — 세션 시작 시 컨텍스트 로딩
- [`commit-workflow`](../skills/workflow/commit-workflow/SKILL.md) — 커밋 자동화
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Husky 공식 문서](https://typicode.github.io/husky/)
