---
name: the-beginner-skills-tutorial
description: Copy-paste tutorial for beginners to feel the difference between plain prompting and skill-guided prompting
category: guide
---

# The Beginner Skills Tutorial

> ⏱️ **Time: 20-30 minutes** | **Level: Beginner** | **Goal: Feel the difference between plain Copilot and skill-guided Copilot**

This tutorial answers one practical question:

If you install this collection, what actually changes when you use Copilot?

You will run the **same task twice**:

1. once with a plain prompt
2. once with an explicit skill or agent

That makes the difference much easier to see.

---

## What you will build

You will create a tiny Node.js practice project with one broken module:

- `divide()` returns the wrong value
- `total()` reads the wrong field name

Then you will compare:

- **plain prompt** vs **`systematic-debugging`**
- **plain prompt** vs **`tdd-workflow`**
- **plain prompt** vs **`planner`**

---

## Before you start

Make sure all of these are true:

- GitHub Copilot CLI is installed and logged in
- this repository is already cloned locally
- Node.js 18+ is installed

In the commands below, replace this path if needed:

```text
C:\copilot-lab
```

---

## Step 1: Create an empty lab folder

Run this from a new PowerShell window:

```powershell
New-Item -ItemType Directory -Force C:\copilot-lab\skills-lab-template | Out-Null
```

---

## Step 2: Install this collection into the lab

Run this from the `everything-copilot-cli` repository root:

```powershell
cd (git rev-parse --show-toplevel)
npm install
npm run setup -- --target C:\copilot-lab\skills-lab-template --profile recommended
```

You should see an install summary that includes:

- `.github/copilot-instructions.md`
- `.github/agents/`
- `.github/skills/`
- `.github/copilot/rules/`

`recommended` installs rules along with instructions, agents, and skills. The `full` profile also adds `.github/copilot/contexts/`.

---

## Step 3: Create the practice project files

Run this:

```powershell
cd C:\copilot-lab\skills-lab-template
npm init -y
npm pkg set scripts.test="node --test"
New-Item -ItemType Directory -Force src | Out-Null
```

Create the broken implementation:

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

Create the tests:

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

Run the tests:

```powershell
npm test
```

You should see failures. That is expected.

---

## Step 4: Verify Copilot sees the installed skills

Start Copilot in the template project:

```powershell
cd C:\copilot-lab\skills-lab-template
copilot
```

Inside Copilot, run:

```text
/skills
/agent
```

You are ready if:

- `/skills` shows project skills such as `systematic-debugging` and `tdd-workflow`
- `/agent` shows `planner`

Exit Copilot after the check.

---

## Step 5: Create two copies for side-by-side comparison

Run this:

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

Now both folders start from the same broken state.

---

## Exercise 1: Plain prompt vs `systematic-debugging`

### Folder A — plain prompt

Open Copilot in `skills-lab-plain`:

```powershell
cd C:\copilot-lab\skills-lab-plain
copilot
```

Paste this prompt:

```text
Tests are failing. Fix the bug.
```

Watch what Copilot does.

### Folder B — skill-guided prompt

Open another Copilot session in `skills-lab-guided`:

```powershell
cd C:\copilot-lab\skills-lab-guided
copilot
```

Paste this prompt:

```text
Tests are failing. Use the systematic-debugging skill. First reproduce the failure, isolate the root cause, explain the minimum failing case, and then fix it.
```

### What to compare

Look for these differences:

- Did Copilot reproduce the failure first?
- Did it explain the root cause before editing code?
- Did it work in a clearer sequence instead of jumping straight to edits?

---

## Exercise 2: Plain prompt vs `tdd-workflow`

First, reset both folders:

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

### Folder A — plain prompt

In `skills-lab-plain`, use:

```text
Update divide() so dividing by zero throws an error, and add tests.
```

### Folder B — skill-guided prompt

In `skills-lab-guided`, use:

```text
Update divide() so dividing by zero throws an error. Use the tdd-workflow skill: write a failing test first, make the minimal implementation pass, then refactor.
```

### What to compare

- Did Copilot write a failing test first?
- Did it make the smallest possible implementation change?
- Did the work feel more structured and easier to follow?

---

## Exercise 3: Plain prompt vs `planner`

Reset both folders again:

```powershell
Remove-Item C:\copilot-lab\skills-lab-plain -Recurse -Force
Remove-Item C:\copilot-lab\skills-lab-guided -Recurse -Force
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-plain -Recurse
Copy-Item C:\copilot-lab\skills-lab-template C:\copilot-lab\skills-lab-guided -Recurse
```

### Folder A — plain prompt

In `skills-lab-plain`, use:

```text
Add coupon support, tax calculation, and negative-price validation to this module.
```

### Folder B — planner-guided prompt

In `skills-lab-guided`, use:

```text
Use the planner agent and plan mode. Break this work into tasks with dependencies before editing code: add coupon support, tax calculation, and negative-price validation.
```

### What to compare

- Did Copilot start planning before editing?
- Did it identify dependencies and ordering?
- Did the plan expose missing details earlier?

---

## What "better" usually feels like

You are not looking for magic words. You are looking for a better workflow.

In most sessions, the guided version should feel:

- more structured
- easier to audit
- easier to repeat
- less likely to skip tests or planning

---

## Simple scorecard

After each exercise, write a quick note like this:

```text
[Exercise name]
- Plain prompt felt structured: 1-5
- Skill-guided prompt felt structured: 1-5
- Which one would I trust more?
- Which one would I use on a real task?
```

---

## If something looks wrong

If Copilot does not seem to see the installed collection:

1. run `/skills`
2. run `/agent`
3. confirm the project contains:
   - `.github/copilot-instructions.md`
   - `.github/skills/`
   - `.github/agents/`

If you only see built-in skills and no project agents, re-run:

```powershell
cd (git rev-parse --show-toplevel)
npm run setup -- --target C:\copilot-lab\skills-lab-template --profile recommended
```

---

## Next step

After this tutorial, continue with:

- [The Quickstart Guide](the-quickstart-guide.md)
- [The Shortform Guide](the-shortform-guide.md)
- [Skills Directory](../skills/)
