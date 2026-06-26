---
name: sub-agent-sandboxing
description: Use when delegated work needs runtime guardrails — constrain sub-agents with loop detection, circuit breakers, and escalating sandbox levels before accepting their output
metadata:
  category: copilot-exclusive
  copilot_feature: "task delegation, read_agent lifecycle, worktree isolation, approval-gated validation"
  origin: adapted from bytedance/deer-flow middleware and sandbox patterns
---

# Sub-Agent Sandboxing

Sub-Agent Sandboxing protects the main workflow from delegated tasks that spiral, retry
indefinitely, or make changes in the wrong environment. It complements file-scope controls by
adding runtime guardrails around how a sub-agent is allowed to execute.

## Why This is Copilot-Exclusive

This pattern depends on Copilot CLI's delegated-agent workflow: separate `task()` execution lanes,
background lifecycle management, approval checkpoints, and the ability to route risky work into a
different checkout or environment before merging it back.

## When to Use

- A delegated task could loop on the same tool call or retry path
- The agent may need multiple execution environments as risk increases
- Generated output must be validated before it can touch the main working tree
- A failing sub-agent should cool down without blocking the entire orchestrator

## When NOT to Use

| Instead of sub-agent-sandboxing | Use |
|---------------------------------|-----|
| You only need a narrow writable path | `scope-guard` |
| You are designing tasks and contracts before execution starts | `agentic-engineering` |
| The task is read-only research | normal delegation or `fleet-parallel` |

## Read-Only Reviewer Constraint

Reviewer sub-agents must not modify the working tree.

When a reviewer edits files during review:

- Uncommitted reviewer changes can be orphaned in the worktree
- A subsequent merge or rebase may silently include reviewer edits as if they were author changes
- The boundary between "authored work" and "review annotations" collapses

Enforce read-only mode in review briefs:

```text
You are a reviewer. Your job is to evaluate the work, not change it.
Do not edit, create, or delete any files.
Return your findings as a report — do not apply fixes inline.
```

Orchestrator checks after a review pass:

```powershell
# Confirm the reviewer left no staged or unstaged changes
git diff --name-only       # no output expected
git diff --cached --name-only  # no output expected
```

If `git diff` shows reviewer-authored changes:

1. Stash or discard them
2. Revise the brief with an explicit read-only constraint
3. Re-run the review

When inline changes are genuinely needed (annotated suggestions):

- Have the reviewer write suggestions to a separate review-notes file
- Never commit those suggestions as if they were implementation changes
- Keep the review artifact on a separate branch or in a temp file

## The Three Guardrails

### 1. Loop Detection

Track repetition at the orchestrator boundary, not inside the agent prompt.

| Signal | Threshold | Response |
|--------|-----------|----------|
| Same tool + same arguments repeats | 3 times in a short window | Warn and inspect the prompt |
| Same tool + same arguments repeats | 5 times in a short window | Stop the sub-agent and escalate |
| Same tool appears regardless of args | 30 total calls | Treat as suspicious |
| Same tool appears regardless of args | 50 total calls | Hard-stop the run |

The exact window can vary by workflow. The important part is having a warning threshold and a hard
stop threshold before retries become invisible token burn.

### 2. LLM Circuit Breaker

Do not let a failing lane hammer the same provider indefinitely.

| Trigger | Threshold | Response |
|--------|-----------|----------|
| Timeout / empty result / validation failure cluster | 5 failures within 60 seconds | Open the breaker for that lane |
| Breaker re-entry after cooldown | 1 probe call | Close only if the probe succeeds |
| Repeated open states | 2+ cycles | Escalate to a human or reroute once |

Use a single bounded reroute only when the task is idempotent and policy allows a different model
or provider lane. Otherwise, keep the breaker open and surface the blocker.

### 3. Sandbox Escalation

Increase isolation as risk increases:

| Level | Environment | Use for |
|------|-------------|---------|
| **L1 Local** | Current checkout with strict validation | Small, low-risk delegated edits |
| **L2 Container** | Disposable Docker/devcontainer environment | Tooling drift, dependency installs, risky generation |
| **L3 Remote sandbox** | Provisioned Kubernetes or equivalent isolated runtime | Untrusted tasks, high side-effect risk, destructive experiments |

If the safer environment is not available, stop and report that limitation rather than silently
downgrading the isolation level.

## Workflow

### 1. Classify the delegated task

Before dispatch, write down:

- expected files or outputs
- validation step
- maximum acceptable side effects
- fallback if the run is stopped

### 2. Arm the guardrails

State the thresholds in the brief:

```text
Loop policy:
- warn after 3 repeated identical tool calls
- stop after 5
- stop if one tool exceeds 50 calls total

Circuit breaker:
- open after 5 failed attempts in 60 seconds
- allow one probe after cooldown, otherwise keep the lane blocked
```

### 3. Choose the minimum safe sandbox

Use the lightest level that still makes rollback easy. If the task can damage the current checkout,
move it to a worktree or higher-isolation environment first.

### 4. Validate before accepting output

Even successful sandboxed runs are only candidates. Review:

- touched files
- dependency changes
- test/build result
- schema or format constraints
- secrets or credential leaks in logs

### 5. Escalate cleanly

When the guardrail trips, return a useful blocker:

```text
BLOCKER: sub-agent stopped by loop detection after repeated identical tool calls.
Last safe state: sandbox output preserved in worktree X.
Next action: rewrite the brief or switch to a higher-isolation lane.
```

## Relationship to Other Skills

- `scope-guard` limits **where** edits may happen
- `sub-agent-sandboxing` limits **how** delegated execution behaves over time
- `agentic-engineering` defines the task contract before dispatch
- `using-git-worktrees` provides one practical isolation lane for L2/L3 style containment

## Verification Checklist

- [ ] Repetition thresholds are defined before the task starts
- [ ] Breaker policy says when to stop retrying
- [ ] Sandbox level matches the real blast radius
- [ ] Output is validated before merge or apply
- [ ] The failure path reports a blocker instead of silently retrying forever
- [ ] Reviewer agents have explicit read-only constraints in their briefs
- [ ] `git diff` is clean after any review pass

## Tips

- Start with worktree isolation before reaching for heavier infrastructure
- Preserve the sandbox output so a stopped run is inspectable
- Separate "tool repeated because it is working" from "tool repeated because the agent is stuck"
- If one lane is unstable, keep the rest of the orchestration moving while that lane cools down

## See Also

- [`scope-guard`](../scope-guard/SKILL.md) — constrain writable scope
- [`agentic-engineering`](../agentic-engineering/SKILL.md) — define explicit delegated task contracts
- [`fleet-parallel`](../fleet-parallel/SKILL.md) — coordinate multiple delegated lanes safely
- [`using-git-worktrees`](../../workflow/using-git-worktrees/SKILL.md) — isolate risky work in a separate checkout
- [`orchestration/patterns/sub-agent-sandboxing`](../../../orchestration/patterns/sub-agent-sandboxing.md) — deeper orchestration pattern reference
