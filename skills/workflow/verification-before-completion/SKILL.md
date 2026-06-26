---
name: verification-before-completion
description: Use before claiming any task is done — run the exact command that proves the fix works, read the output, and only then report success.
metadata:
  category: workflow
  agent_type: general-purpose
  origin: ported and adapted from obra/superpowers verification-before-completion
---

# Verification Before Completion

Do not claim a task is complete until you have fresh evidence from the command that
proves the claim. Memory, prior runs, and "it should work" are not evidence.

## When to Use

- Before saying a bug is fixed
- Before reporting that tests pass
- Before marking a PR ready for review
- Before saying "done", "resolved", or "working"
- When an agent sounds confident without showing current output

## When NOT to Use

| Instead of verification-before-completion | Use |
|------------------------------------------|-----|
| Exploring a hypothesis during debugging | `systematic-debugging` |
| Evaluating an LLM pipeline or agent output | `eval-harness` |
| Running the red/green cycle for a new feature | `tdd-workflow` |

## Prerequisites

- You know the exact claim you want to make
- You know the command that would prove or falsify that claim
- You can inspect the full output and exit code

## Pre-flight Plan Check

Before starting any task, validate the plan itself — not just after the work is done.

Ask:

- Does any step in the plan conflict with another (e.g., two steps that modify the same file in incompatible ways)?
- Does the plan match the stated objective, or has scope crept in?
- Are there hidden dependencies the plan does not account for?

Run the plan check **before the first tool call**, not after the work is in progress.

```text
Pre-flight checklist:
[ ] Objective matches the actual request
[ ] No step conflicts with another
[ ] Scope matches what was authorized — no undeclared additions
[ ] Dependencies between steps are accounted for
```

If a conflict is found at pre-flight, resolve it with the user before proceeding.
Fixing a wrong plan mid-execution costs more than catching it upfront.

## Workflow

### 1. Identify the proving command

Ask: "What command would directly prove this claim right now?"

| Claim | Proving command |
|------|-----------------|
| Tests pass | `npm test -- --testPathPattern="<target>"` or the project equivalent |
| Build succeeds | `npm run build` |
| Bug is fixed | The original reproduction command or failing test |
| API works | A real HTTP request such as `curl` |
| Migration succeeded | Direct state verification such as `SELECT COUNT(*) ...` |

### 2. Run it now

Never rely on an earlier run when the code or environment may have changed.

```text
Run the exact command that proves the claim.
Do not summarize the result until the command finishes.
```

### 3. Read the full result

Check:

- Exit code
- Final status line
- Warnings or partial failures
- Whether the output actually matches the claim

### 4. Compare output to the claim

Do not over-claim.

| Output says | Valid claim |
|------------|-------------|
| One targeted test passed | "The targeted test passed" |
| Full suite passed | "The full suite passed" |
| Build completed with warnings | "The build passed with warnings" |
| Reproduction no longer fails | "The reproduced failure no longer occurs" |

### 4-A. When work is tracked in git

If the claim is about a commit, PR, or patch series, use git evidence to scope the claim
correctly — but never treat a diff or commit by itself as proof that the work works.

Check:

- the actual diff matches the change you are claiming
- the proving command output is newer than the last relevant edit or commit
- the changed files and commit message do not imply a broader success than the command proved
- if runtime evidence and git evidence disagree, hold the report until they line up

Git evidence can prove **what changed**. It cannot prove **that the change succeeded**
without fresh execution or state verification.

### 5. Only then report completion

Good:

```text
I reran `npm test -- --testPathPattern="auth"` and it passed, so the auth fix is ready.
```

Bad:

```text
This should be fixed now.
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "It should work" | "Should" is not evidence. Run the command. |
| "I already checked earlier" | Earlier output may no longer match the current state. |
| "The code change is obvious" | Obvious changes still regress or fail in integration. |
| "The test was passing before" | If you did not rerun it after the change, it proves nothing. |

## Red Flags

- You are about to say "probably fixed"
- You are summarizing without quoting the command you ran
- You only checked part of the output
- You are reusing output from before the last edit
- You are claiming a broader success than the command proved

## Single-Pass Review Model

When a task requires both spec compliance and quality review, combine them into one reviewer pass instead of two separate passes.

Two-pass review problems:

- The first reviewer may flag issues the second reverses
- Running two sequential reviewers doubles context cost for the same artifact
- Separate passes can give conflicting verdicts with no clear tie-breaker

Single-pass review framing:

```text
Review this [artifact] against:
1. Spec compliance — does it do what was asked?
2. Quality — is it correct, maintainable, and free of regressions?

Return a single verdict. Do not approve unless both checks pass.
```

## Definition of Done Check

Before reporting a task complete, apply the DoD (Definition of Done) framing:
two questions that must both be answered affirmatively.

| Question | Category |
|----------|----------|
| **"Did we build the right thing?"** | Correctness, Integration |
| **"Is it ready?"** | Quality, Documentation, Ship-readiness |

Five DoD categories:

| Category | Covers |
|----------|--------|
| **Correctness** | Does the output do what was specified? Edge cases handled? |
| **Quality** | Is it maintainable? Are there regressions? Tests pass? |
| **Integration** | Does it work with the rest of the system? No broken interfaces? |
| **Documentation** | Is affected documentation updated? Is the change understandable to the next reader? |
| **Ship-readiness** | Is it safe to deploy? No known blocking issues? |

Do not substitute "I'm satisfied with the code" for a real DoD check.

## Zero-Output Phase Detection (Scope Escape)

A phase that **was expected to produce file changes** but reports success with zero
target-file modifications is a false positive. Treat it as suspicious.

Valid zero-output phases exist (verification passes, read-only audits, linting that finds
no issues). This check applies only to phases whose stated purpose was to create or modify files.

Watch for:

- "14/14 steps PASSED" with no files modified — when file changes were expected
- A build or test reports success on a stale artifact
- An agent returns "done" but `git diff` shows nothing changed

When a file-producing phase produces zero outputs:

1. Do not count it as completed
2. Inspect whether the phase was scoped to the right target
3. Verify the phase was not silently skipped or short-circuited
4. Re-run with explicit output confirmation before proceeding

```text
Scope escape check:
[ ] At least one expected file was created or modified
[ ] The changed files match the stated scope
[ ] No "PASSED" phase has zero net changes to target files
```

## Verification

- [ ] Pre-flight plan check passed before any tool calls began
- [ ] The exact proving command was identified before reporting success
- [ ] The command was run after the latest relevant change
- [ ] Exit code and output were read, not assumed
- [ ] The reported claim matches the evidence exactly
- [ ] DoD check: "did we build the right thing?" AND "is it ready?"
- [ ] No phase reported success with zero output changes

## Tips

- Pair this with `tdd-workflow` so every fix has a reproducible test
- Pair this with `commit-workflow` before committing or opening a PR
- If the command output is ambiguous, tighten the claim instead of overstating success

## See Also

- [`tdd-workflow`](../../development/tdd-workflow/SKILL.md) — test-first development loop
- [`systematic-debugging`](../../development/systematic-debugging/SKILL.md) — hypothesis-driven debugging
- [`commit-workflow`](../commit-workflow/SKILL.md) — final cleanup and pre-commit checks
