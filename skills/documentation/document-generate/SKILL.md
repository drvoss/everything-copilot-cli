---
name: document-generate
description: >
  Use when a feature, module, or whole project needs missing documentation created
  from scratch - read the codebase, map the public surface with Diataxis
  (tutorial/how-to/reference/explanation), and generate the missing docs with
  cross-links.
metadata:
  category: documentation
  agent_type: general-purpose
  origin: adapted from garrytan/gstack document-generate
---

# Document Generate

Document Generate creates missing documentation for a codebase from the implementation
up. It is for greenfield documentation coverage, not small doc touch-ups.

The organizing frame is Diataxis:

- **Tutorial** - get to a first successful result
- **How-to** - complete a specific task
- **Reference** - factual interface details
- **Explanation** - why the design works this way

## When to Use

- A shipped feature has little or no documentation
- A module or subsystem needs first-pass docs from the source code
- A project needs documentation coverage beyond one README paragraph
- You need to decide which entities deserve tutorial, how-to, reference, and explanation docs

## When NOT to Use

| Instead of document-generate | Use |
|------------------------------|-----|
| Updating docs after a code change | `doc-update` |
| Generating only deep API or interface reference docs, with no tutorial/how-to/explanation coverage | `api-documentation` |
| Creating VS Code CodeTour onboarding files | `code-tour` |

## Workflow

### 1. Define the scope and output mode

Choose one:

- one feature
- one module
- one subsystem
- the whole project

Then choose where the docs should land:

- inline updates to existing docs
- standalone docs in `docs/`
- both

If the scope is large, recommend starting with one feature or module first.

### 2. Do codebase archaeology before writing

Read enough source to understand reality:

- entry points and exported surface
- implementation files
- tests
- README, architecture docs, and contribution docs
- comments that explain design intent

The point is to document the code that exists, not the code you assume exists.

### 3. Partition the surface with Diataxis

Not every entity needs all four document types.

Use this rule of thumb:

| Entity type | Tutorial | How-to | Reference | Explanation |
|------------|----------|--------|-----------|-------------|
| End-user feature | Maybe | Yes | Maybe | Yes |
| CLI flag or config option | No | Yes | Yes | No |
| Public API or interface | No | Maybe | Yes | Maybe |
| Internal design concept | No | No | Maybe | Yes |

Write down the coverage plan before generating files.

### 4. Write reference first

Reference documentation sets the vocabulary for the rest:

- names
- signatures
- defaults
- allowed values
- examples

Keep it factual. If you want to explain why something exists, that belongs in the
explanation doc.

### 5. Write explanation second

Capture:

- the problem being solved
- the chosen design
- tradeoffs
- rejected alternatives
- operational or maintenance implications

Explanation tells future readers why the current shape is reasonable.

### 6. Write how-to guides for concrete tasks

A how-to guide should include:

- prerequisites
- exact steps
- expected result
- verification
- troubleshooting

It should help an experienced user accomplish one specific job.

### 7. Write tutorials for the first successful outcome

Tutorials are for first success, not exhaustive coverage.

Good tutorial rules:

- target one happy-path outcome
- keep the step count low
- end with "what you built" or equivalent payoff
- link out to reference docs for deeper detail

### 8. Cross-link for discoverability

Make the docs navigable:

- tutorial -> how-to/reference
- how-to -> reference
- explanation -> reference and related concepts
- README or index -> newly created docs

### 9. Run a quality review before stopping

Check:

- no broken links
- no duplicate docs saying the same thing
- the docs reflect current behavior
- each document has one clear job

## Output Template

```markdown
## Documentation Plan

| Entity | Tutorial | How-to | Reference | Explanation |
|--------|----------|--------|-----------|-------------|
| ... | ... | ... | ... | ... |

## Generated Files

- path - quadrant - purpose

## Coverage Gaps

- ...
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "README is enough." | A README cannot carry tutorial, task guide, reference, and design rationale all at once. |
| "I'll just write the API docs." | Users also need onboarding and task-level guidance. |
| "Docs can be added later." | The source context is clearest while the feature is still fresh. |

## Red Flags

- Writing docs from filenames without reading implementation
- Repeating the same content in tutorial, how-to, and explanation
- Treating reference docs like narrative essays
- Ending without updating discoverability links

## Verification

- [ ] The source code and tests were read before drafting
- [ ] Each generated doc has a clear Diataxis role
- [ ] `document-generate` is not being used for a small incremental doc sync
- [ ] `document-generate` is not being used for API-only reference work that belongs in `api-documentation`
- [ ] Cross-links and index or README discoverability were updated

## See Also

- [`doc-update`](../doc-update/SKILL.md) - sync existing docs after code changes
- [`api-documentation`](../api-documentation/SKILL.md) - write API and interface reference docs from source
- [`architecture-decisions`](../architecture-decisions/SKILL.md) - capture hard-to-reverse design choices as ADRs
