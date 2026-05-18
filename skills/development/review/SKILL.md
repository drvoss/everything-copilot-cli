---
name: review
description: Use when you want to check whether a code change follows the repository's documented conventions (Standards) and aligns with the originating issue or PRD (Spec) — compared against a pinned git reference
metadata:
  category: development
  agent_type: code-review
  origin: adapted from mattpocock/skills review
---

# Review

Review compares the diff between `HEAD` and a pinned git reference along two deliberately separate
axes:

- **Standards** - does the change follow this repository's documented conventions?
- **Spec** - does the change match the originating issue, PRD, or spec?

Run the two axes in separate agent sessions in parallel, then report them side by side. Keeping them
independent prevents coding-standard findings from hiding scope or requirement mismatches, and vice
versa.

## When to Use

- The user asks to "review since X", review a branch, or compare work against a commit, branch, tag,
  or `HEAD~N`
- You need to verify both repository conventions and requirement alignment, not just general code
  quality
- A branch looks plausible, but you need to separate "implemented correctly" from "implemented as
  requested"
- You want a review artifact that distinguishes standards violations from spec drift

## When NOT to Use

| Instead of review | Use |
|-------------------|-----|
| You only need a general quality or correctness pass | `code-review` |
| You want a broad 6-lens PR review across PM, QA, Security, DevOps, and UX | `pr-multi-perspective-review` |
| The task is to verify a delegated implementation against a handoff or task file item-by-item after it landed | `implementation-review` |

## Workflow

### 1. Pin the reference first

Do not review against a fuzzy baseline. Use exactly what the user supplied: a commit SHA, branch,
tag, `main`, `HEAD~5`, or another explicit git reference.

If the user did not specify one, stop and ask what to compare against.

Use one stable comparison for both axes:

```text
git --no-pager diff <reference>...HEAD
git --no-pager log <reference>..HEAD --oneline
```

Use the same diff and commit list for both review axes so the findings stay comparable.

### 2. Find the spec source

Look for the originating spec in this order:

1. Issue or ticket references in commit messages
2. A path the user provided directly
3. A matching doc under `docs/`, `specs/`, or `.scratch/`

If you still cannot find one, ask the user where the spec lives. If there is no spec, skip the
Spec axis explicitly and report that no spec source was available.

### 3. Find the standards sources

Collect the repo's documented conventions before reviewing the diff. Common sources include:

- `COPILOT.md`, `.github/copilot-instructions.md`, `AGENTS.md`, `CONTRIBUTING.md`
- `CONTEXT.md`, `CONTEXT-MAP.md`, and context-specific `CONTEXT.md` files
- `docs/adr/`, `STYLE.md`, `STANDARDS.md`, `STYLEGUIDE.md`
- `.editorconfig`, `eslint.config.*`, `biome.json`, `prettier.config.*`, `tsconfig.json`

Note machine-enforced standards, but do not spend review effort rediscovering violations the tooling
already proves.

### 4. Run the two review axes in parallel

Spawn two separate agent sessions so their findings do not contaminate each other.

#### Standards axis brief

- Read the standards sources first
- Read the pinned diff second
- Report every place the diff violates a documented standard
- Cite the rule source for each finding
- Separate hard violations from judgement calls
- Skip checks already enforced by tooling

#### Spec axis brief

- Read the spec first
- Read the pinned diff second
- Report requirements that are missing or partial
- Report behavior that was not requested
- Report requirements that appear implemented incorrectly
- Quote the relevant spec line or requirement for each finding

### 5. Aggregate without merging the axes

Present the results in two separate sections:

```markdown
## Standards
- ...

## Spec
- ...
```

Do not collapse them into one ranked list. End with a one-line summary that states the finding count
per axis and the worst issue, if any.

## Why Two Axes Matter

Either axis can pass while the other fails:

- A change can match the spec but break local standards
- A change can follow local standards but implement the wrong thing

Keeping the reports separate makes both failure modes obvious.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "A normal code review already covers this." | General quality review often misses whether the change actually matches the originating spec. |
| "If tests pass, the spec must be satisfied." | Tests can pass while the wrong requirement was implemented. |
| "Standards and spec are basically the same thing." | One governs how the repo wants code written; the other governs what the change was meant to do. |

## Red Flags

- The review starts before the comparison point is pinned
- Findings mention standards without citing where the standard is documented
- The spec axis silently disappears instead of explicitly reporting "no spec available"
- The final report mixes standards and spec findings into one merged severity list

## Verification

- [ ] A pinned git reference was supplied or confirmed
- [ ] Both axes reviewed the same diff and commit range
- [ ] Standards findings cite repository guidance
- [ ] Spec findings cite the original issue, PRD, or spec when available
- [ ] The final output keeps `## Standards` and `## Spec` separate

## See Also

- [`code-review`](../code-review/SKILL.md) - single-pass review for correctness, quality, and security
- [`pr-multi-perspective-review`](../pr-multi-perspective-review/SKILL.md) - six-lens PR review
- [`implementation-review`](../../workflow/implementation-review/SKILL.md) - post-implementation review against a task spec or handoff
