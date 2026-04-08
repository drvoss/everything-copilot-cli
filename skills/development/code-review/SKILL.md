---
name: code-review
description: Use when reviewing code changes for quality, correctness, and security — runs a structured checklist with severity-rated findings
metadata:
  category: development
  agent_type: code-review
---

# Code Review

## When to Use
- Reviewing pull requests before merge
- Auditing code changes after a feature branch is complete
- Self-reviewing your own changes before committing
- Investigating code quality concerns raised by teammates

## Prerequisites
- Changes are committed or staged in git
- Access to the repository and its test suite
- Understanding of the project's coding standards

## Workflow

### 1. Understand the Scope
```powershell
# See what files changed
git --no-pager diff --stat main...HEAD

# Get a summary of the diff
git --no-pager diff main...HEAD --shortstat
```

For PR reviews, use the `code-review` agent type which is purpose-built for this:
```
task agent_type: "code-review"
prompt: "Review the staged changes in this repository"
```

### 2. Review Checklist
Evaluate each changed file against these categories:

| Priority | Category | What to Check |
|----------|----------|---------------|
| 🔴 Critical | **Correctness** | Logic errors, off-by-one, null handling, race conditions |
| 🔴 Critical | **Security** | Injection, auth bypass, secret exposure, unsafe deserialization |
| 🟡 Important | **Error handling** | Missing try/catch, unhandled promise rejections, error propagation |
| 🟡 Important | **Edge cases** | Empty inputs, large inputs, unicode, concurrent access |
| 🟢 Minor | **Performance** | N+1 queries, unnecessary re-renders, missing indexes |
| 🟢 Minor | **Maintainability** | Dead code, unclear naming, missing types |

### 3. Investigate Suspicious Patterns
```powershell
# Find TODO/FIXME/HACK left in changed files
git --no-pager diff main...HEAD | Select-String "TODO|FIXME|HACK"

# Check for console.log or debug statements
git --no-pager diff main...HEAD | Select-String "console\.log|debugger|print\("
```

### 4. Verify Tests
```powershell
# Ensure tests exist for changed source files
git --no-pager diff --name-only main...HEAD | Select-String "\.(ts|js|py|go)$"

# Run the test suite
npm test 2>&1 | Select-Object -Last 20
```

### 5. Severity Levels for Findings
- **🔴 Blocker** — Must fix before merge (bugs, security issues, data loss)
- **🟡 Warning** — Should fix, but not a merge blocker (error handling gaps, missing tests)
- **🟢 Suggestion** — Nice to have (naming, style, minor optimization)
- **💡 Nitpick** — Optional, low priority (formatting, comment wording)

### 6. Check for Breaking Changes
```powershell
# Look for changed function signatures or removed exports
git --no-pager diff main...HEAD -- "*.ts" | Select-String "^[-+].*(export|public|function)"

# Check for changed API routes or database schemas
grep -rn "router\.\|app\.\|migration" --include="*.ts" src/
```

## Examples

### Quick Self-Review Before Commit
```powershell
# Stage changes and review
git add -A
git --no-pager diff --cached --stat
git --no-pager diff --cached
```

### PR Review with code-review Agent
The `code-review` agent provides high signal-to-noise analysis — it only surfaces
issues that genuinely matter (bugs, security, logic errors), never style or formatting.

```
task agent_type: "code-review"
prompt: "Review changes between main and the current branch. Focus on correctness and security."
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "LGTM, 간단한 변경이라서" | 단순해 보이는 변경도 암묵적 의존성을 깰 수 있다. (Hyrum's Law) |
| "테스트가 통과했으니 됐다" | 테스트는 명시된 케이스만 검증한다. 리뷰는 명시되지 않은 케이스를 잡는다. |
| "작성자를 믿는다" | 리뷰는 불신이 아니라 두 번째 눈이다. 본인도 자신의 버그를 발견하지 못한다. |
| "큰 PR이라 빠르게 훑겠다" | 큰 PR일수록 더 꼼꼼한 리뷰가 필요하다. 크기 자체가 첫 번째 피드백이다. |
| "보안은 나중에 보안팀이 할 것이다" | 개발 단계에서 잡는 비용 < 프로덕션에서 잡는 비용 × 100 |

## Red Flags
- 500줄 PR에 2분 만에 "LGTM" 승인
- 모든 리뷰 코멘트가 스타일/포맷 관련 (로직 검토 없음)
- 인증/결제 코드 변경에 아무 지적이 없음
- "내가 짠 코드라서 리뷰 생략"
- 테스트 없이 비즈니스 로직이 추가됨

## Verification
- [ ] 변경된 모든 파일을 실제로 열어봄 (git diff --stat만 본 게 아님)
- [ ] 🔴 Critical 항목이 있으면 Blocker로 명시됨
- [ ] 인증/인가 코드는 보안 관점으로 별도 검토됨
- [ ] 새로 추가된 로직에 대응하는 테스트가 존재함
- [ ] `git --no-pager diff main...HEAD` 전체를 검토함

## Tips
- Review tests first — they document the intended behavior
- Read the PR description/issue before the code to understand intent
- Check the **boundaries** between changed and unchanged code
- For large PRs, review file-by-file using `view` tool rather than reading raw diffs
- Use `explore` agent to understand unfamiliar code paths before commenting
- If a change is too large to review effectively, that itself is feedback worth giving
