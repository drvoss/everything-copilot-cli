---
name: the-beginner-skills-tutorial
description: インストールした skill の違いを初心者がそのまま体験できるコピペ中心のチュートリアル
category: guide
---

# Beginner Skills Tutorial

> ⏱️ **所要時間: 20-30分** | **レベル: 初心者** | **目的: 通常の prompt と skill / agent を明示した prompt の違いを体感する**

このガイドは次の疑問に答えるためのものです。

このコレクションをインストールすると、Copilot の使い方は実際にどう変わるのでしょうか。

やることはシンプルです。**同じ課題を 2 回**やります。

1. 1 回目は普通の prompt
2. 2 回目は skill または agent を明示した prompt

こうすると違いが一番わかりやすくなります。

---

## このチュートリアルで作るもの

とても小さな Node.js の練習プロジェクトを作り、意図的に壊れたモジュールを入れます。

- `divide()` は間違った値を返します
- `total()` は間違った field 名を読みます

そのあと次を比較します。

- **通常の prompt** vs **`systematic-debugging`**
- **通常の prompt** vs **`tdd-workflow`**
- **通常の prompt** vs **`planner`**

---

## 始める前に

次が揃っていることを確認してください。

- GitHub Copilot CLI がインストール済みでログイン済み
- このリポジトリをローカルに clone 済み
- Node.js 18+ がインストール済み

以下のコマンドでは必要に応じてこの path を置き換えてください。

```text
C:\copilot-lab
```

---

## Step 1: 空の lab folder を作る

新しい PowerShell window で実行します。

```powershell
New-Item -ItemType Directory -Force C:\copilot-lab\skills-lab-template | Out-Null
```

---

## Step 2: このコレクションを lab にインストールする

`everything-copilot-cli` の repository root で実行します。

```powershell
npm install
npm run setup -- --target C:\copilot-lab\skills-lab-template --profile recommended
```

インストール結果に次が含まれていれば OK です。

- `.github/copilot-instructions.md`
- `.github/agents/`
- `.github/skills/`
- `.github/copilot/rules/`

`recommended` profile では instructions・agents・skills に加えて rules も入ります。`full` profile では `.github/copilot/contexts/` も追加されます。

---

## Step 3: 練習用 project file を作る

まず次を実行します。

```powershell
cd C:\copilot-lab\skills-lab-template
npm init -y
npm pkg set scripts.test="node --test"
New-Item -ItemType Directory -Force src | Out-Null
```

壊れた実装 file を作ります。

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

test file を作ります。

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

test を実行します。

```powershell
npm test
```

失敗していれば正常です。

---

## Step 4: Copilot がインストールした skill を見えているか確認する

template project で Copilot を起動します。

```powershell
cd C:\copilot-lab\skills-lab-template
copilot
```

Copilot の中で次を実行します。

```text
/skills
/agent
```

次が見えれば準備完了です。

- `/skills` に `systematic-debugging` や `tdd-workflow` などの project skill がある
- `/agent` に `planner` がある

確認したら Copilot を終了してください。

---

## Step 5: 比較用の folder を 2 つ作る

次を実行します。

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

これで 2 つの folder は同じ壊れた初期状態になります。

---

## Exercise 1: 通常の prompt vs `systematic-debugging`

### Folder A — 通常の prompt

`skills-lab-plain` で Copilot を起動します。

```powershell
cd C:\copilot-lab\skills-lab-plain
copilot
```

次の prompt を貼り付けます。

```text
Tests are failing. Fix the bug.
```

Copilot がどの順番で進めるかを見てください。

### Folder B — skill を明示した prompt

`skills-lab-guided` で Copilot を起動します。

```powershell
cd C:\copilot-lab\skills-lab-guided
copilot
```

次の prompt を貼り付けます。

```text
Tests are failing. Use the systematic-debugging skill. First reproduce the failure, isolate the root cause, explain the minimum failing case, and then fix it.
```

### 比較ポイント

- まず失敗を再現したか
- 編集前に root cause を説明したか
- いきなり直すのではなく、より明確な順序で進んだか

---

## Exercise 2: 通常の prompt vs `tdd-workflow`

まず 2 つの folder を初期状態に戻します。

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

### Folder A — 通常の prompt

`skills-lab-plain` で次を使います。

```text
Update divide() so dividing by zero throws an error, and add tests.
```

### Folder B — skill を明示した prompt

`skills-lab-guided` で次を使います。

```text
Update divide() so dividing by zero throws an error. Use the tdd-workflow skill: write a failing test first, make the minimal implementation pass, then refactor.
```

### 比較ポイント

- failing test を先に書いたか
- 実装変更が最小だったか
- 作業の流れがより構造的に見えたか

---

## Exercise 3: 通常の prompt vs `planner`

もう一度 2 つの folder を初期状態に戻します。

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

### Folder A — 通常の prompt

`skills-lab-plain` で次を使います。

```text
Add coupon support, tax calculation, and negative-price validation to this module.
```

### Folder B — `planner` を使う prompt

`skills-lab-guided` で次を使います。

```text
Use the planner agent and plan mode. Break this work into tasks with dependencies before editing code: add coupon support, tax calculation, and negative-price validation.
```

### 比較ポイント

- 編集前に計画から始めたか
- 依存関係や順序を表に出したか
- 抜けている要件を早めに見つけやすくなったか

---

## 「よかった」と感じるポイント

大事なのは魔法のような答えではありません。  
**作業の進め方がよくなったか**を見ることです。

多くの session では、skill / agent を明示した方が次のように感じられるはずです。

- より構造的
- 監査しやすい
- 繰り返しやすい
- test や planning を飛ばしにくい

---

## かんたんな記録テンプレート

各 exercise のあとに次のようにメモしてください。

```text
[Exercise name]
- Plain prompt felt structured: 1-5
- Skill-guided prompt felt structured: 1-5
- Which one would I trust more?
- Which one would I use on a real task?
```

---

## うまくいかないとき

Copilot がインストールした collection を認識していないようなら:

1. `/skills` を実行
2. `/agent` を実行
3. project に次があるか確認
   - `.github/copilot-instructions.md`
   - `.github/skills/`
   - `.github/agents/`

built-in skill しか見えず project agent もない場合は、`everything-copilot-cli` の repository root に戻って、次を再実行してください。

```powershell
npm run setup -- --target C:\copilot-lab\skills-lab-template --profile recommended
```

---

## 次に読むもの

このチュートリアルの後は次に進んでください。

- [The Quickstart Guide](the-quickstart-guide.md)
- [The Shortform Guide](the-shortform-guide.md)
- [Skills Directory](../skills/)
