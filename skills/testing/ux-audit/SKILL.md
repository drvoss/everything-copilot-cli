---
name: ux-audit
description: Use when a page or component feels confusing and you need a structured UX audit — applies 6 Krug-inspired usability checks and returns prioritized findings
metadata:
  category: testing
  agent_type: general-purpose
  origin: adapted from garrytan/gstack ux-audit and aligned to this repository's skill format
---

# UX Audit

Run a structured usability review based on Steve Krug's *Don't Make Me Think*.
Use it to inspect page structure, copy, navigation, and interaction friction before
or alongside design review.

## When to Use

- Before a design review or frontend handoff
- When users report confusion but the failure mode is still unclear
- When navigation, headings, or calls to action feel noisy or ambiguous
- During UI quality sweeps after major layout or copy changes

## When NOT to Use

| Instead of ux-audit | Use |
|---------------------|-----|
| Accessibility conformance or ARIA debugging | `browser-devtools` |
| End-to-end flow automation | `e2e-testing` |
| Performance bottleneck analysis | `browser-devtools` or `performance-optimization` |
| Pure visual polish critique | manual design review |

## The 6 Usability Checks

Run all six checks in sequence. A page with repeated failures across these categories
needs structural revision, not copy-only cleanup.

### 1. Trunk Test

> "If I dropped you in the middle of this page with no context, where are you?"

Check:

- Site or product identity is visible quickly
- A page-level heading makes the purpose obvious
- Navigation exists and is easy to locate
- Current location is indicated with active nav or breadcrumbs

### 2. 3-Second Scan

> "What does this page do?"

Check:

- The primary action or value proposition is visible without hunting
- Heading hierarchy is scannable
- One primary call to action clearly wins attention

### 3. Page Area Test

> "Can you tell what each part of this page is for?"

Check:

- Major regions such as header, main content, sidebar, and footer are distinct
- Headings introduce real content instead of stacking without explanation
- Section purpose is clear before reading full paragraphs

### 4. Happy Talk Detection

> "Is the page making me read obvious or low-value copy?"

Look for:

- Generic welcome copy that says little
- Repetitive marketing filler above the real action
- Links or buttons with vague labels like `Click here` or `Learn more`

### 5. Mindless Choice Audit

> "Does every click require extra thought?"

Check:

- Links describe destinations clearly
- Form fields use real labels, not placeholder-only hints
- Options are named so users can choose quickly

### 6. Goodwill Reservoir

> "Is the page wasting the user's time or patience?"

Check:

- Body text is comfortably readable
- Errors explain how to recover
- Media or overlays do not interrupt the task unexpectedly

## Hard Fail Signals

Escalate findings when any of these appear:

- Placeholder text used as the only field label
- Missing, generic, or low-signal primary heading
- Floating headings with no supporting content
- Visited and unvisited links are visually indistinguishable
- Body text is too small to read comfortably

## Suggested Workflow

1. Inspect the live page or rendered component
2. Record evidence for each of the six checks
3. Mark each check as pass, concern, or fail
4. Separate structural issues from copy polish
5. Prioritize fixes that reduce confusion on the main user path

If runtime inspection is needed, pair this skill with `browser-devtools`.

## Output Format

Default to a short human-readable report:

```markdown
## UX Audit: [page or component]

- **Trunk Test**: Pass | Concern | Fail - [reason]
- **3-Second Scan**: Pass | Concern | Fail - [reason]
- **Page Area Test**: Pass | Concern | Fail - [reason]
- **Happy Talk**: Pass | Concern | Fail - [reason]
- **Mindless Choice**: Pass | Concern | Fail - [reason]
- **Goodwill Reservoir**: Pass | Concern | Fail - [reason]

**Hard Fail Signals**
- [issue or "None"]

**Top Fixes**
1. [highest-priority change]
2. [next change]
3. [next change]
```

If another workflow needs structured output, you may additionally emit JSON, but
human-readable findings remain the primary deliverable.

## Tips

- Judge the page from a first-visit perspective, not from implementation knowledge
- Prefer concrete evidence ("two CTAs compete above the fold") over taste-based critique
- Fix structural confusion before refining tone or visual polish
- Re-run the audit after major IA, copy, or navigation changes

## See Also

- [`browser-devtools`](../browser-devtools/SKILL.md) — inspect runtime DOM, network, and accessibility state
- [`e2e-testing`](../e2e-testing/SKILL.md) — automate critical user journeys after the UX issues are understood
