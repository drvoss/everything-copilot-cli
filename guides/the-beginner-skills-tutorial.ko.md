---
name: the-beginner-skills-tutorial
description: 설치한 스킬을 어떻게 체감하는지 입문자가 그대로 따라할 수 있는 복붙형 실습 가이드
category: guide
---

# 입문자용 스킬 실습 가이드

> ⏱️ **시간: 20-30분** | **난이도: 입문자** | **목표: 일반 프롬프트와 스킬/에이전트 지시 프롬프트의 차이를 직접 체감하기**

이 가이드는 이런 질문에 답하기 위한 문서입니다.

이 컬렉션을 설치하면 Copilot 사용이 실제로 뭐가 달라질까요?

핵심은 **같은 과제를 두 번 해보는 것**입니다.

1. 한 번은 일반 프롬프트로
2. 한 번은 스킬 또는 에이전트를 명시해서

이렇게 해야 차이가 가장 잘 보입니다.

---

## 무엇을 만들게 되나요?

아주 작은 Node.js 연습 프로젝트를 하나 만들고, 실습을 위해 일부러 버그를 심어 둔 모듈을 넣습니다.

- `divide()`는 잘못된 값을 반환합니다
- `total()`은 잘못된 필드 이름을 읽습니다

그다음 아래를 비교합니다.

- **일반 프롬프트** vs **`systematic-debugging`**
- **일반 프롬프트** vs **`tdd-workflow`**
- **일반 프롬프트** vs **`planner`**

---

## 시작 전 준비

다음이 준비되어 있어야 합니다.

- GitHub Copilot CLI 설치 및 로그인 완료
- 이 저장소를 로컬에 clone 해둠
- Node.js 18+ 설치

아래 명령에서는 필요하면 이 경로를 바꿔서 사용하세요.

```text
C:\copilot-lab
```

---

## 1단계: 빈 실습 폴더 만들기

새 PowerShell 창에서 실행하세요.

```powershell
New-Item -ItemType Directory -Force C:\copilot-lab\skills-lab-template | Out-Null
```

---

## 2단계: 이 컬렉션을 실습 폴더에 설치하기

`everything-copilot-cli` 저장소 루트에서 실행하세요.

```powershell
npm install
npm run setup -- --target C:\copilot-lab\skills-lab-template --profile recommended
```

설치 요약에 다음이 보이면 됩니다.

- `.github/copilot-instructions.md`
- `.github/agents/`
- `.github/skills/`
- `.github/copilot/rules/`

`recommended` 프로필은 instructions, agents, skills와 함께 rules도 설치합니다. `full` 프로필은 `.github/copilot/contexts/`도 추가합니다.

---

## 3단계: 연습 프로젝트 파일 만들기

먼저 이 명령을 실행하세요.

```powershell
cd C:\copilot-lab\skills-lab-template
npm init -y
npm pkg set scripts.test="node --test"
New-Item -ItemType Directory -Force src | Out-Null
```

버그를 일부러 심어 둔 구현 파일을 만듭니다.

```powershell
@'
function divide(a, b) {
  return 0;
}

function total(items) {
  return items.reduce((sum, item) => sum + item.cost, 0);
}

module.exports = { divide, total };
'@ | Set-Content src\calculator.js
```

테스트 파일을 만듭니다.

```powershell
@'
const test = require("node:test");
const assert = require("node:assert");
const { divide, total } = require("./calculator");

test("divide returns the quotient", () => {
  assert.equal(divide(10, 2), 5);
});

test("total sums item prices", () => {
  assert.equal(total([{ price: 10 }, { price: 5 }]), 15);
});
'@ | Set-Content src\calculator.test.js
```

테스트를 실행하세요.

```powershell
npm test
```

실패하면 정상입니다.

---

## 4단계: Copilot이 설치한 스킬을 인식하는지 확인하기

실습 템플릿 프로젝트에서 Copilot을 실행하세요.

```powershell
cd C:\copilot-lab\skills-lab-template
copilot
```

Copilot 안에서 다음을 실행하세요.

```text
/skills
/agent
```

다음이 보이면 준비 완료입니다.

- `/skills`에 `systematic-debugging`, `tdd-workflow` 같은 project skill이 보임
- `/agent`에 `planner`가 보임

확인 후 Copilot을 종료하세요.

---

## 5단계: 비교 실습용 폴더 2개 만들기

이 명령을 실행하세요.

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

이제 두 폴더는 완전히 같은 시작 상태입니다.

---

## 실습 1: 일반 프롬프트 vs `systematic-debugging`

### 폴더 A — 일반 프롬프트

`skills-lab-plain`에서 Copilot을 실행하세요.

```powershell
cd C:\copilot-lab\skills-lab-plain
copilot
```

아래 프롬프트를 그대로 붙여넣으세요.

```text
Tests are failing. Fix the bug.
```

Copilot이 어떤 순서로 작업하는지 봅니다.

### 폴더 B — 스킬 명시 프롬프트

`skills-lab-guided`에서 Copilot을 실행하세요.

```powershell
cd C:\copilot-lab\skills-lab-guided
copilot
```

아래 프롬프트를 그대로 붙여넣으세요.

```text
Tests are failing. Use the systematic-debugging skill. First reproduce the failure, isolate the root cause, explain the minimum failing case, and then fix it.
```

### 비교 포인트

다음을 비교해보세요.

- 먼저 실패를 재현했는가?
- 코드를 바꾸기 전에 원인을 설명했는가?
- 그냥 바로 수정하기보다 더 분명한 순서로 진행했는가?

---

## 실습 2: 일반 프롬프트 vs `tdd-workflow`

먼저 두 폴더를 초기 상태로 되돌립니다.

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

### 폴더 A — 일반 프롬프트

`skills-lab-plain`에서 이 프롬프트를 사용하세요.

```text
Update divide() so dividing by zero throws an error, and add tests.
```

### 폴더 B — 스킬 명시 프롬프트

`skills-lab-guided`에서 이 프롬프트를 사용하세요.

```text
Update divide() so dividing by zero throws an error. Use the tdd-workflow skill: write a failing test first, make the minimal implementation pass, then refactor.
```

### 비교 포인트

- 실패하는 테스트를 먼저 작성했는가?
- 구현을 최소 변경으로 끝냈는가?
- 작업 흐름이 더 구조적으로 보였는가?

---

## 실습 3: 일반 프롬프트 vs `planner`

다시 두 폴더를 초기 상태로 되돌립니다.

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

### 폴더 A — 일반 프롬프트

`skills-lab-plain`에서 이 프롬프트를 사용하세요.

```text
Add coupon support, tax calculation, and negative-price validation to this module.
```

### 폴더 B — planner 사용 프롬프트

`skills-lab-guided`에서 이 프롬프트를 사용하세요.

```text
Use the planner agent and plan mode. Break this work into tasks with dependencies before editing code: add coupon support, tax calculation, and negative-price validation.
```

### 비교 포인트

- 코드를 고치기 전에 먼저 계획을 세웠는가?
- 의존성과 작업 순서를 드러냈는가?
- 빠질 수 있는 요구사항을 더 빨리 드러냈는가?

---

## 무엇이 좋아졌다고 느끼면 되나요?

중요한 것은 "마법 같은 답변"이 아닙니다.  
**작업 방식이 더 좋아졌는지**를 보는 것입니다.

보통 스킬/에이전트를 명시한 쪽은 다음처럼 느껴져야 합니다.

- 더 구조적이다
- 검토하기 쉽다
- 반복하기 쉽다
- 테스트나 계획을 빼먹을 가능성이 줄어든다

---

## 간단한 기록 템플릿

각 실습이 끝날 때마다 이렇게 짧게 적어보세요.

```text
[실습 이름]
- 일반 프롬프트가 구조적이었다: 1~5
- 스킬/에이전트 사용 프롬프트가 구조적이었다: 1~5
- 어느 쪽이 더 믿을 만했는가?
- 실제 업무에서는 어느 쪽을 다시 쓰고 싶은가?
```

---

## 뭔가 이상해 보인다면

Copilot이 설치한 컬렉션을 못 읽는 것 같다면:

1. `/skills` 실행
2. `/agent` 실행
3. 프로젝트에 다음이 있는지 확인
   - `.github/copilot-instructions.md`
   - `.github/skills/`
   - `.github/agents/`

built-in skills만 보이고 project agents가 안 보이면 `everything-copilot-cli` 저장소 루트로 돌아가서 아래를 다시 실행하세요.

```powershell
npm run setup -- --target C:\copilot-lab\skills-lab-template --profile recommended
```

---

## 다음 읽을거리

이 실습을 마쳤다면 다음 문서로 이어가세요.

- [빠른 시작 가이드](the-quickstart-guide.md)
- [요약 가이드](the-shortform-guide.md)
- [스킬 디렉터리](../skills/)
