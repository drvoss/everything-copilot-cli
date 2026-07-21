---
name: scope-guard
description: Use when a task must stay inside a narrow file or directory boundary, or when risky commands need an explicit stop rule — define the writable surface first so the agent does not drift.
metadata:
  category: copilot-exclusive
  copilot_feature: "Plan Mode approval, task delegation, prompt-scoped ownership"
  origin: ported and adapted from garrytan/gstack /guard, /freeze, /careful, /unfreeze
---

# Scope Guard

Scope Guard is a Copilot-native way to reduce blast radius. It combines explicit file ownership,
prompt-level boundaries, and approval checkpoints so the agent treats one area as writable and
everything else as read-only unless you reopen the scope.

## Why This is Copilot-Exclusive

Copilot CLI now has native `preToolUse`/`postToolUse` hooks that can allow/deny tool calls (see
[`guides/hooks-to-github-actions.md`](../../../guides/hooks-to-github-actions.md)), but scope-guard
is still the right pattern when you want a boundary enforced through the planning/approval flow
itself rather than a separate hook script. It combines several useful primitives:

- **Plan Mode approval** before execution starts
- **Task delegation** where each agent gets its own brief
- **Prompt-scoped ownership** for exact paths, files, and stop conditions

This skill packages those primitives into a repeatable guardrail pattern for risky or tightly
scoped work.

## When to Use

- Production code, infrastructure, migrations, auth, billing, or other high-risk surfaces
- Refactors that should stay inside one directory or file set
- Parallel agent work where each agent must own a separate writable area
- Tasks that may involve destructive commands and need a pause before execution

## When NOT to Use

| Instead of scope-guard | Use |
|------------------------|-----|
| You need full branch- or filesystem-level isolation | `workflow/using-git-worktrees` |
| You want broad autonomous execution after the plan is approved | `copilot-exclusive/autopilot-patterns` |
| The task is read-only research with no file edits | Do a normal explore pass or use `context-prime` to load the relevant files first |

## Prerequisites

- Know the exact writable path or file list
- Decide what counts as a risky command for this task
- Have a rollback path if the work matters enough to isolate further

## Modes

| Mode | Intent | Behavior |
|------|--------|----------|
| **Careful** | Risk warning | The agent must stop and ask before running destructive or high-impact commands |
| **Freeze** | Path lock | The agent may read broadly, but may only edit inside the named path or file list |
| **Guard** | Careful + Freeze | The agent stays inside the approved writable surface and pauses before risky commands |

## Workflow

### 1. Define the writable surface

Name the exact path, file set, or ownership boundary before any edits begin:

```text
Only modify files under src/payments/.
You may read other files for context, but do not edit, create, or delete anything outside that path.
```

If the task spans multiple owned areas, list them explicitly.

### 2. Choose the mode

**Careful** when the surface is broad but the commands are risky:

```text
Work across the approved files normally, but stop and ask before any destructive command,
dependency change, schema migration, force push, or file deletion.
```

Treat wrapper-prefixed commands as the same risk as the underlying command. `env ...`,
`sudo ...`, `watch ...`, `ionice ...`, and `setsid ...` do not make a risky action safe.
Likewise, treat `find -exec` and `find -delete` as explicit stop-and-review cases, not routine
discovery commands.

**Freeze** when the path boundary matters more than the command type:

```text
You may only write to docs/api/.
Read other files if needed, but do not edit outside docs/api/.
```

**Guard** when both constraints matter:

```text
Use Guard mode for this task.
Writable surface: infra/terraform/.
Stop and ask before any delete, rename, state import, or other destructive infrastructure action.
```

### 3. Add a plan checkpoint for risky work

For high-risk changes, review the plan before execution:

```text
Enter Plan Mode first.
List every file you expect to touch and any risky commands you might need.
Do not execute until that scope is approved.
```

This turns the plan itself into the first guardrail.

Approval scope is now enforced per location by the CLI itself. In a repository that means the
current repo root, so if you switch repos with `/cd`, command approvals do not carry over —
re-approve in the new repo instead of assuming the previous boundary still applies.

### 4. Re-brief each delegated agent separately

Do not assume one agent's scope automatically applies to another. Restate the ownership boundary
for every background or parallel agent:

```text
Owned path: packages/billing/
Do not touch shared CI, lockfiles, or docs.
If the fix requires an out-of-scope edit, stop and report the blocker.
```

### 5. Remove the guard explicitly

When the restriction is no longer needed, say so plainly:

```text
Scope restriction removed. You may now edit any necessary files for the next task.
```

Do not rely on the agent to infer that the boundary changed.

## Practical Guardrails

- Name both the **allowed paths** and the **forbidden shared surfaces**
- Tell the agent what to do on a scope violation: **stop and report**
- Pair large or destructive tasks with a branch or worktree
- Review the diff before merging, even when the guard held
- Write risky-command rules in terms of the real action, not only the first token. For example,
  `sudo rm -rf`, `env NODE_ENV=prod npm run migrate`, and `find . -delete` should all follow the
  same pause rules as their underlying destructive command

## Related Skills

- [`plan-mode-mastery`](../plan-mode-mastery/SKILL.md) — approve file scope before execution
- [`autopilot-patterns`](../autopilot-patterns/SKILL.md) — run autonomously after the boundary is clear
- [`fleet-parallel`](../fleet-parallel/SKILL.md) — assign separate writable surfaces per agent
- [`using-git-worktrees`](../../workflow/using-git-worktrees/SKILL.md) — move from logical scope limits to physical checkout isolation
