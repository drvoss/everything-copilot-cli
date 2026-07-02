---
name: implement
description: >
  Use when starting implementation work from a PRD, spec, or set of issues — to follow
  a structured TDD → validate → review → commit loop.
metadata:
  category: development
  agent_type: general-purpose
  origin: mattpocock/skills
keep-coding-instructions: true
---

# Implement

A structured five-step loop for turning a specification (PRD, issue, or design doc) into
committed, reviewed code. Complements [`tdd-workflow`](../tdd-workflow/SKILL.md) (which focuses
on the Red→Green→Refactor micro-cycle) and
[`verification-before-completion`](../../workflow/verification-before-completion/SKILL.md)
(which enforces proof before claiming done). This skill governs the **macro** flow: from
spec to commit.

## When to Use

- You have a PRD, issue, or spec and need a repeatable path from "start" to "merged"
- You want to enforce `/code-review` and type-checking as gates before every commit
- You need a structured sequence that doesn't skip test coverage or review under deadline pressure

## When NOT to Use

| Instead of implement | Use |
|----------------------|-----|
| Red→Green micro-cycle for a single function | `tdd-workflow` |
| Verifying a claim before saying "done" | `verification-before-completion` |
| Full sprint across multiple features | `sprint-workflow` |

## Prerequisites

- A PRD, spec file, or set of linked issues is available and understood
- Test framework installed and runnable (`npm test`, `pytest`, `cargo test`, etc.)
- Type checker available when the language supports it (`tsc --noEmit`, `mypy`, etc.)

## The Five-Step Loop

### Step 1: TDD — Write a Failing Test First

Before touching implementation, write the test that will prove the spec is met.

```text
> Write a failing test for [behavior from PRD]. Keep it to the thinnest observable behavior.
```

Run it and confirm it **fails**:

```bash
# JavaScript / TypeScript
npm test -- --testPathPattern="<target>"

# Python
pytest tests/test_<target>.py

# Rust
cargo test <test_name>
```

If no test framework exists yet, create the simplest one before writing any source code.

### Step 2: Implement — Minimal Code to Pass

Write the minimum code to turn the failing test green. Do not add features beyond the test.

```text
[Autopilot Mode]
> Implement the minimum code to pass the test in step 1.
```

Re-run the test and confirm it **passes**. If it doesn't, iterate before moving to Step 3.

### Step 3: Type-Check — Compile-Time Correctness

After tests pass, run the type checker to surface inference gaps and implicit `any` / `unknown`
types before they become runtime bugs.

```bash
# TypeScript
npx tsc --noEmit

# Python (mypy)
mypy src/

# Rust (already type-checked by cargo build)
cargo build 2>&1 | grep -E '^error'
```

Fix all type errors before continuing. A type error in Step 3 often reveals a missing edge case
that warrants a new test in Step 1.

### Step 4: Full Test Suite — No Regressions

Run the **entire** test suite, not just the targeted test, to confirm no existing behaviour
was broken.

```bash
# Full suite — adapt to your stack
npm test
pytest
cargo test
```

Address every failing test. If unrelated tests break, understand why before committing —
do not suppress them.

### Step 5: Code Review → Commit

Invoke `/review` (or the equivalent code-review agent) before committing. Only commit after
review concerns are resolved.

```text
/review
```

Once review passes:

```bash
git add -A
git commit -m "feat(<scope>): <what the PRD required>"
```

Use conventional commit format. Reference the issue or PRD in the commit body if the change
is non-trivial.

## Full Example

```text
# PRD: "Users can reset their password via email"

# Step 1 — TDD
> Write a failing test: POST /auth/reset-password with valid email returns 202 and
  queues a reset email. Confirm the test fails.

# Step 2 — Implement
[Autopilot Mode]
> Implement the password reset endpoint to pass the test.

# Step 3 — Type-check
npx tsc --noEmit

# Step 4 — Full suite
npm test

# Step 5 — Review → Commit
/review
git commit -m "feat(auth): add password reset via email"
```

## Iteration

After committing, check the PRD for remaining uncovered behaviors and restart at Step 1
for the next slice. Prefer many small commits over one large commit per feature.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "Type errors can be fixed later" | Type errors in step 3 often reveal spec gaps that should produce new failing tests. |
| "Skip /review — I wrote clean code" | `/review` finds issues invisible to the author. It takes seconds. |
| "Run only the targeted test" | Regressions in unrelated tests are real bugs that must be caught before commit. |
| "Write tests after implementation" | Tests written after the fact rarely start in a Red state and miss edge cases. |

## Red Flags

- Implementation committed before a failing test was written
- Type errors suppressed with `@ts-ignore`, `# type: ignore`, or `unsafe`
- `/review` skipped because "it's a small change"
- Full suite not run after implementing (only targeted test re-run)
- Multiple unrelated features lumped into one commit

## Verification

- [ ] Failing test written before any implementation code
- [ ] Test confirmed green after implementation
- [ ] Type checker exits with zero errors
- [ ] Full test suite passes with no regressions
- [ ] `/review` run and all blockers addressed
- [ ] Commit message follows conventional commit format and references the spec

## See Also

- [`tdd-workflow`](../tdd-workflow/SKILL.md) — Red→Green→Refactor micro-cycle
- [`verification-before-completion`](../../workflow/verification-before-completion/SKILL.md) — proving a task is done
- [`sprint-workflow`](../../workflow/sprint-workflow/SKILL.md) — full Think→Plan→Build→Review→Test→Ship→Monitor cycle
- [`pr-multi-perspective-review`](../pr-multi-perspective-review/SKILL.md) — deeper review before opening a PR
