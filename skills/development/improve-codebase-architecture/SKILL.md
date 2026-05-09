---
name: improve-codebase-architecture
description: Use when a codebase feels hard to change, test, or navigate — surface architectural friction, identify deeper module seams, and walk one candidate into a concrete refactoring direction.
metadata:
  category: development
  agent_type: general-purpose
  origin: adapted from mattpocock/skills improve-codebase-architecture
---

# Improve Codebase Architecture

Use this skill when local cleanup is not enough and the problem is architectural shape:
too many shallow modules, leaky seams, or a design that is hard to test through the
public interface.

## When to Use

- The codebase is correct enough to run, but hard to extend safely
- Understanding one concept requires bouncing across too many tiny modules
- Tests are brittle because the interesting behavior leaks across current seams
- A refactor candidate needs architectural reasoning before code changes start

## When NOT to Use

| Instead of improve-codebase-architecture | Use |
|------------------------------------------|-----|
| You only need a bigger-picture map of one area | [`zoom-out`](../zoom-out/SKILL.md) |
| The architecture is fine and you just need safe cleanup | [`refactor-clean`](../refactor-clean/SKILL.md) |
| You are defining a new feature before coding | [`spec-driven-development`](../spec-driven-development/SKILL.md) |

## Prerequisites

- Access to the project's README, architecture docs, glossary, ADRs, or equivalent guidance
- Enough codebase access to inspect callers, collaborators, and tests
- Willingness to stop at a candidate list first instead of jumping straight into rewrites

## Working Vocabulary

Use these terms consistently while reviewing the design:

| Term | Meaning |
|------|---------|
| **Module** | Any unit with an interface and implementation: function, class, package, or slice |
| **Interface** | Everything a caller must know: types, invariants, ordering, config, and error modes |
| **Depth** | How much behavior a module hides behind a small interface |
| **Seam** | The place where behavior can change without editing every caller |

## Workflow

### 1. Load the project's language first

Read the domain vocabulary and architecture decisions before suggesting anything.
Prefer the project's own names for subsystems and workflows instead of inventing new
terminology.

### 2. Explore for architectural friction

Look for places where:

- the interface is nearly as complicated as the implementation
- behavior is scattered across many pass-through modules
- tests mostly exercise wiring because the real logic has no stable seam
- bug fixes require touching several files that conceptually belong together

Apply a quick deletion test: if deleting the module would only move the same complexity
to every caller, it is earning its keep; if complexity largely disappears, the module is
probably shallow.

### 3. Present deepening opportunities

Return a short numbered list of candidates before proposing exact interfaces.
Use this shape:

```markdown
1. **Candidate:** Order intake module
   - **Files:** `src/...`
   - **Problem:** Callers know too much about validation and retries
   - **Suggested seam:** Consolidate workflow behind one module
   - **Why it helps:** Better locality, simpler tests, fewer cross-file edits
```

### 4. Grill the chosen candidate

Once the user picks a candidate, walk the design tree with them:

- what behavior belongs behind the new seam
- what stays outside
- which dependencies become adapters
- what the new test surface should look like
- whether any ADR or glossary term needs updating

Do not rewrite half the codebase in one jump. The goal is one clear architectural move.

### 5. Capture the decision

When the direction is clear, record it in the right durable place:

- ADR for a structural decision that future contributors must not re-litigate
- spec or plan for an approved refactor
- issue or backlog item if the work is valuable but deferred

## Examples

### Example: Thin pass-through module

If three controllers each validate, transform, and retry the same workflow with slightly
different glue code, propose a deeper module that owns the workflow and leaves controllers
with parameter collection plus response mapping.

### Example: Testability problem

If a feature only seems testable through large integration tests because the important
logic is spread across helpers and callers, propose a seam that centralizes decisions and
makes public behavior testable in one place.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "We should just rewrite the whole area" | Rewrites hide the real design problem. Find one load-bearing seam first. |
| "Small files mean good architecture" | Splitting code is not the same as creating depth. Shallow modules still leak complexity. |
| "We can decide the interface later" | The interface is the real design work; skipping it postpones the hard part. |

## Red Flags

- Proposed modules are named after implementation details instead of domain concepts
- Every candidate requires a sweeping rewrite instead of an incremental move
- The same ADR conflict appears, but no one states whether it should be reopened
- Tests get harder because the design introduces more wiring than leverage

## Verification

- [ ] The review produced a short candidate list before detailed design work
- [ ] Each candidate names affected files, the current problem, and the expected leverage
- [ ] The chosen direction defines a clearer seam and a simpler test surface
- [ ] Any ADR or glossary conflict is called out explicitly instead of ignored

## Tips

- Use the project's real vocabulary; architecture advice is weaker when the language drifts
- Prefer one strong candidate over a long generic list
- Pair this skill with [`grill-with-docs`](../../workflow/grill-with-docs/SKILL.md)
  when design language and existing decisions must stay aligned
