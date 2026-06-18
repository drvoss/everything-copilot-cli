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

## Verification

- [ ] The exact proving command was identified before reporting success
- [ ] The command was run after the latest relevant change
- [ ] Exit code and output were read, not assumed
- [ ] The reported claim matches the evidence exactly

## Tips

- Pair this with `tdd-workflow` so every fix has a reproducible test
- Pair this with `commit-workflow` before committing or opening a PR
- If the command output is ambiguous, tighten the claim instead of overstating success

## See Also

- [`tdd-workflow`](../../development/tdd-workflow/SKILL.md) — test-first development loop
- [`systematic-debugging`](../../development/systematic-debugging/SKILL.md) — hypothesis-driven debugging
- [`commit-workflow`](../commit-workflow/SKILL.md) — final cleanup and pre-commit checks
