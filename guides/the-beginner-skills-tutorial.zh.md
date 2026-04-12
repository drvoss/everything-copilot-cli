---
name: the-beginner-skills-tutorial
description: 面向初学者的复制粘贴式教程，帮助你实际感受到安装后 skill 的差异
category: guide
---

# Beginner Skills Tutorial

> ⏱️ **时间: 20-30 分钟** | **级别: 初学者** | **目标: 亲自感受普通 prompt 和显式指定 skill / agent 的 prompt 有什么不同**

这个教程要回答的是一个很实际的问题：

安装这套集合之后，我用 Copilot 到底会有什么变化？

方法很简单：**同一个任务做两遍**。

1. 第一遍只用普通 prompt
2. 第二遍明确指定 skill 或 agent

这样最容易看出差异。

---

## 你将要做什么

你会创建一个很小的 Node.js 练习项目，并故意放入一个有问题的模块。

- `divide()` 会返回错误的值
- `total()` 会读取错误的字段名

然后你会比较：

- **普通 prompt** vs **`systematic-debugging`**
- **普通 prompt** vs **`tdd-workflow`**
- **普通 prompt** vs **`planner`**

---

## 开始前准备

请确认下面这些条件都已经满足：

- GitHub Copilot CLI 已安装并已登录
- 这个仓库已经 clone 到本地
- 已安装 Node.js 18+

下面命令里的这个路径如果需要可以自行替换：

```text
C:\work-copilot\test
```

---

## 第 1 步：创建一个空的实验目录

在新的 PowerShell 窗口里运行：

```powershell
New-Item -ItemType Directory -Force C:\work-copilot\test\skills-lab-template | Out-Null
```

---

## 第 2 步：把这个集合安装到实验目录

在 `everything-copilot-cli` 仓库根目录运行：

```powershell
cd C:\work-copilot\everything-copilot-cli
npm install
npm run setup -- --target C:\work-copilot\test\skills-lab-template --profile recommended
```

如果安装摘要里出现下面这些路径，就说明成功了：

- `.github/copilot-instructions.md`
- `.github/agents/`
- `.github/skills/`

---

## 第 3 步：创建练习项目文件

先运行：

```powershell
cd C:\work-copilot\test\skills-lab-template
npm init -y
npm pkg set scripts.test="node --test"
New-Item -ItemType Directory -Force src | Out-Null
```

创建有问题的实现文件：

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

创建测试文件：

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

运行测试：

```powershell
npm test
```

看到失败是正常的。

---

## 第 4 步：确认 Copilot 能看到已安装的 skill

在模板项目里启动 Copilot：

```powershell
cd C:\work-copilot\test\skills-lab-template
copilot
```

在 Copilot 内运行：

```text
/skills list
/agent
```

如果出现下面这些内容，就说明准备好了：

- `/skills list` 中能看到 `systematic-debugging`、`tdd-workflow` 这类 project skill
- `/agent` 中能看到 `planner`

检查完后退出 Copilot。

---

## 第 5 步：复制出两个对比目录

运行：

```powershell
Remove-Item C:\work-copilot\test\skills-lab-plain -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item C:\work-copilot\test\skills-lab-guided -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-plain -Recurse
Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-guided -Recurse
```

现在两个目录都处于完全相同的初始状态。

---

## 练习 1：普通 prompt vs `systematic-debugging`

### 目录 A — 普通 prompt

在 `skills-lab-plain` 中启动 Copilot：

```powershell
cd C:\work-copilot\test\skills-lab-plain
copilot
```

粘贴这个 prompt：

```text
Tests are failing. Fix the bug.
```

观察 Copilot 的工作顺序。

### 目录 B — 指定 skill 的 prompt

在 `skills-lab-guided` 中启动 Copilot：

```powershell
cd C:\work-copilot\test\skills-lab-guided
copilot
```

粘贴这个 prompt：

```text
Tests are failing. Use the systematic-debugging skill. First reproduce the failure, isolate the root cause, explain the minimum failing case, and then fix it.
```

### 对比重点

- 它是否先复现了失败？
- 它是否在修改代码前解释了根因？
- 它是否按更清晰的步骤推进，而不是直接动手改？

---

## 练习 2：普通 prompt vs `tdd-workflow`

先把两个目录重置回初始状态：

```powershell
Remove-Item C:\work-copilot\test\skills-lab-plain -Recurse -Force
Remove-Item C:\work-copilot\test\skills-lab-guided -Recurse -Force
Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-plain -Recurse
Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-guided -Recurse
```

### 目录 A — 普通 prompt

在 `skills-lab-plain` 里使用：

```text
Update divide() so dividing by zero throws an error, and add tests.
```

### 目录 B — 指定 skill 的 prompt

在 `skills-lab-guided` 里使用：

```text
Update divide() so dividing by zero throws an error. Use the tdd-workflow skill: write a failing test first, make the minimal implementation pass, then refactor.
```

### 对比重点

- 它是否先写了失败测试？
- 它是否只做了最小实现改动？
- 整个过程是否更有结构、更容易跟上？

---

## 练习 3：普通 prompt vs `planner`

再次把两个目录重置回初始状态：

```powershell
Remove-Item C:\work-copilot\test\skills-lab-plain -Recurse -Force
Remove-Item C:\work-copilot\test\skills-lab-guided -Recurse -Force
Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-plain -Recurse
Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-guided -Recurse
```

### 目录 A — 普通 prompt

在 `skills-lab-plain` 里使用：

```text
Add coupon support, tax calculation, and negative-price validation to this module.
```

### 目录 B — 使用 `planner` 的 prompt

在 `skills-lab-guided` 里使用：

```text
Use the planner agent and plan mode. Break this work into tasks with dependencies before editing code: add coupon support, tax calculation, and negative-price validation.
```

### 对比重点

- 它是否在修改代码前先开始规划？
- 它是否暴露了依赖关系和先后顺序？
- 它是否更早暴露出缺失的信息？

---

## 你应该感受到什么

你不是在找“魔法般的回答”。  
你是在看 **工作流是否变得更好**。

通常来说，显式指定 skill / agent 的那一边应该更像这样：

- 更有结构
- 更容易审查
- 更容易复现
- 更不容易跳过测试或规划

---

## 简单记录模板

每个练习结束后，可以简单记下这些内容：

```text
[Exercise name]
- Plain prompt felt structured: 1-5
- Skill-guided prompt felt structured: 1-5
- Which one would I trust more?
- Which one would I use on a real task?
```

---

## 如果哪里不对劲

如果 Copilot 看起来没有识别到你安装的 collection：

1. 运行 `/skills list`
2. 运行 `/agent`
3. 确认项目里存在：
   - `.github/copilot-instructions.md`
   - `.github/skills/`
   - `.github/agents/`

如果你只能看到 built-in skills，看不到 project agents，请重新运行：

```powershell
cd C:\work-copilot\everything-copilot-cli
npm run setup -- --target C:\work-copilot\test\skills-lab-template --profile recommended
```

---

## 下一步

做完这个教程后，可以继续看：

- [The Quickstart Guide](the-quickstart-guide.md)
- [The Shortform Guide](the-shortform-guide.md)
- [Skills Directory](../skills/)
