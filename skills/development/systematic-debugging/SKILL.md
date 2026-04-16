---
name: systematic-debugging
description: "Applies a 4-phase root cause analysis — reproduces the issue, traces execution, identifies the root cause, and applies a verified fix with regression tests. Use when a bug is non-obvious, has resisted quick fixes, appears intermittently, or keeps recurring after previous patches. Covers debugging, errors, crashes, failing tests, broken builds, exceptions, and troubleshooting."
metadata:
  version: 1.0.0
  category: development
  agent_type: general-purpose
---

# Systematic Debugging

A structured 4-phase methodology for diagnosing and fixing non-obvious bugs. Prevents
the common failure modes of "shotgun debugging" (random changes hoping something sticks)
and "symptom patching" (fixing the visible error without understanding the cause).

## When to Use

- A bug has resisted one or more quick-fix attempts
- The bug only appears in certain environments (prod but not dev, intermittent)
- The cause is unclear after an initial look
- A "fixed" bug keeps coming back
- Multiple engineers have looked at it without resolution

## When NOT to Use

| Instead of systematic-debugging | Use |
|---------------------------------|-----|
| Obvious typo or off-by-one | Fix directly |
| Build/compilation failure | `fix-build-errors` skill |
| Performance problem (not a bug) | profiling tools |
| Security vulnerability | `security-scan` skill |

## The 4-Phase Process

### Phase 1 — Reproduce

A bug you cannot reproduce reliably cannot be debugged reliably.

**Goal**: Get a 100% reproducible test case that triggers the bug on demand.

```powershell
# 1. Note the exact symptoms: error message, stack trace, request/response
# 2. Identify the minimum inputs that trigger it
# 3. Write a failing test that captures the reproduction

# Find the code path involved
Select-String -Path "src\\**\\*.ts" -Pattern "<error keyword>"

# Check recent changes
git --no-pager log --oneline -20
git --no-pager diff HEAD~5 -- <suspect file>
```

**Reproduction criteria:**

- [ ] Bug triggers on demand with a specific input or sequence
- [ ] Bug does NOT trigger with a slightly different (correct) input
- [ ] Reproduction is encoded as a failing test

If you cannot reproduce it in < 15 minutes, move to Phase 2 anyway — understanding
the system often reveals the trigger.

### Phase 2 — Understand the System

```powershell
# Read the code path end-to-end, not just the error location
# Follow data from entry point to crash point

# Trace the call stack
Select-String -Path "src\\**\\*.ts" -Pattern "<function name>"

# Check state at each step — add temporary logs if needed
# Never modify production behavior during debugging
```

**Questions to answer:**

1. What is the **expected** behavior? (From spec, tests, or docs)
2. What is the **actual** behavior? (From error, logs, or reproduction)
3. Where exactly does the actual diverge from expected? (Specific line or state)
4. What **assumptions** does this code make? Which one is violated?

**Tools:**

```powershell
# Read the function signature and its callers
Select-String -Path "src\\**\\*.ts" -Pattern "functionName"

# Check what data looks like going in
# Add a temporary debug log (remember to remove before committing)
# console.log('[DEBUG]', JSON.stringify(input, null, 2));

# Check recent git changes to the file
git --no-pager log --follow -p -- src/path/to/file.ts | Select-Object -First 80
```

### Phase 3 — Hypothesize and Verify

Generate one specific hypothesis about the root cause, then verify or falsify it.
Do **not** try multiple fixes simultaneously — you will not know which one worked.

**Hypothesis template:**

```text
Hypothesis: The bug is caused by [specific condition].
Prediction: If I [specific change], then [specific observable outcome].
Test: [How I will verify the prediction]
```

**Example:**

```text
Hypothesis: The JWT expiry check compares Unix timestamp (seconds) to Date.now() (ms).
Prediction: If I divide Date.now() by 1000, the check will pass for valid tokens.
Test: The reproduction test case will pass with this change.
```

**Verify with a targeted change:**

```powershell
# Make only the minimal change needed to test the hypothesis
# Run the reproduction test
npm test -- --testPathPattern="reproduction-test"

# If the test passes: hypothesis confirmed → write a proper fix
# If the test fails: hypothesis falsified → form a new hypothesis
```

**Repeat until a hypothesis is confirmed.** Do not patch symptoms.

### Phase 4 — Fix and Prevent Recurrence

The root cause is confirmed. Now fix it properly and prevent it from returning.

```powershell
# 1. Write the real fix (not the hypothesis test hack)
# 2. Ensure the reproduction test passes with the fix

# 3. Write additional regression tests for edge cases
# 4. Run the full test suite — no regressions
npm test

# 5. Remove any temporary debug logs
Select-String -Path "src\\**\\*.ts" -Pattern "\\[DEBUG\\]"

# 6. Write a clear commit message explaining root cause
git commit -m "fix: <what was wrong and why>

Root cause: <explanation of the actual bug>
Fix: <what was changed and why it resolves the root cause>
Regression test: <name of the test that now covers this>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

**Prevention checklist:**

- [ ] Root cause is documented in the commit message
- [ ] At least one regression test covers the specific scenario
- [ ] Related code paths are checked for the same pattern
- [ ] If the bug was a class of error (e.g., "timestamp unit mismatch"), check for other instances

## Red Flags

- More than 3 changes attempted without a confirmed hypothesis
- Bug "disappeared" without a clear explanation
- Fix makes the test pass but the reason is unclear
- Same bug has been "fixed" before
- No regression test added after the fix

## Escalation — The Rule of Three

If you have made 3 or more hypothesis-driven fix attempts without resolution:

1. **Stop making further fixes**
2. **Collect the evidence** — record each hypothesis, the test you ran, and why it was falsified
3. **Escalate to architectural review** using the `council` skill:
   - Architect — is the design itself creating the failure?
   - Skeptic — what assumption is everyone making without checking?
   - Pragmatist — what is the fastest path back to a working system?
   - Critic — would a redesign be cheaper than more incremental fixes?

> The Rule of Three usually means the problem is architectural, not an implementation detail.
> A fourth fix attempt without escalation is often just another symptom patch.

## Verification

- [ ] Bug is reproducible with a specific test case
- [ ] Root cause is identified (not just the symptom)
- [ ] Fix addresses the root cause, not the symptom
- [ ] Regression test exists and passes
- [ ] Full test suite passes with no new failures
- [ ] Commit message explains the root cause

## Tips

- **Binary search the bug**: use `git bisect` to find the commit that introduced it

  ```powershell
  git bisect start
  git bisect bad HEAD
  git bisect good <last-known-good-commit>
  # git bisect will check out commits for you to test
  ```

- **Rubber duck debugging**: explain the bug out loud (or to an agent). The act of
  articulating often reveals the assumption you didn't know you were making.
- **Check the obvious last**: timestamp units, off-by-one errors, null vs undefined,
  async/await missing, wrong environment variable — these are common root causes.
- **Use the `explore` agent** to trace a call path across many files simultaneously.

## See Also

- [`fix-build-errors`](../fix-build-errors/SKILL.md) — compilation and build failures
- [`tdd-workflow`](../tdd-workflow/SKILL.md) — write regression tests as part of the fix
- [`security-scan`](../../security/security-scan/SKILL.md) — if the bug is security-related
- [`council`](../../workflow/council/SKILL.md) — escalate persistent failures to a structured architectural review
