---
name: ux-audit
description: Use when a page or component needs a structured UX audit — quick scan applies 6 Krug-inspired usability checks; deep audit covers 15 design dimensions with Jobs/Ive philosophy
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

## Audit Modes

Choose the depth of review based on what you need:

| Mode | Checks | Best for |
|------|--------|----------|
| **Quick scan** (default) | 6 Krug usability checks | Navigation/copy confusion, pre-handoff spot checks |
| **Deep audit** | 15-dimension Jobs/Ive framework | Major redesigns, premium quality bar, comprehensive UI review |

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

0. **Choose your audit mode**: Quick Scan (6 checks, default) or Deep Audit (15 dimensions) — see Audit Modes table above.
1. Inspect the live page or rendered component
2. Record evidence for each check (Quick Scan) or each dimension (Deep Audit)
3. Mark each check/dimension as pass, concern, or fail
4. Separate structural issues from copy polish
5. Prioritize fixes that reduce confusion on the main user path

If runtime inspection is needed, pair this skill with `browser-devtools`.

## Output Format — Quick Scan

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

> For Deep Audit output, see the **Phased Plan Output** template in the Deep Audit section below.

## Tips

- Judge the page from a first-visit perspective, not from implementation knowledge
- Prefer concrete evidence ("two CTAs compete above the fold") over taste-based critique
- Fix structural confusion before refining tone or visual polish
- Re-run the audit after major IA, copy, or navigation changes

## Deep Audit — Jobs/Ive 15 Dimensions

Use for major redesigns, premium quality assessment, or when the quick scan surfaces systemic issues. Review every screen across all 15 dimensions before writing any recommendations.

### The 15 Dimensions

| Dimension | Key Questions |
|-----------|---------------|
| **Visual Hierarchy** | Does the eye land where it should? Most important = most prominent? Understandable in 2 seconds? |
| **Spacing & Rhythm** | Whitespace consistent and intentional? Elements breathe or cramped? Vertical rhythm harmonious? |
| **Typography** | Clear size hierarchy? Too many competing weights/sizes? Calm or chaotic? |
| **Color** | Used with restraint and purpose? Guides attention or scatters it? Sufficient contrast? |
| **Alignment & Grid** | Consistent grid? Anything off by 1–2px? Every element locked into layout? |
| **Components** | Similar elements styled identically? Interactive elements obviously interactive? All states covered? |
| **Iconography** | Consistent style, weight, size? From one cohesive set or mixed? Support meaning or just decorate? |
| **Motion** | Transitions natural and purposeful? Motion that exists for no reason? Feels responsive? |
| **Empty States** | Every screen with no data — intentional or broken? User guided toward first action? |
| **Loading States** | Skeletons/spinners consistent? App feels alive while waiting or frozen? |
| **Error States** | Styled consistently? Helpful and clear or hostile and technical? |
| **Dark Mode** | Actually designed or just inverted? Tokens, shadows, contrast hold up? |
| **Density** | Anything removable without losing meaning? Redundant elements? Every element earning its place? |
| **Responsiveness** | Works at mobile/tablet/desktop? Touch targets sized for thumbs? Adapts fluidly, not just at breakpoints? |
| **Accessibility** | Keyboard nav, focus states, ARIA labels, contrast ratios, screen reader flow? |

### Jobs Filter — Apply to Every Element

For each screen element, ask:

1. "Would a user need to be told this exists?" → If yes, redesign until obvious
2. "Can this be removed without losing meaning?" → If yes, remove it
3. "Does this feel inevitable, like no other design was possible?" → If no, it is not done
4. "Is this detail as refined as the details users will never see?" → The back of the fence must be painted too

**The test**: Remove until it breaks. Then add back the last thing.

### Phased Plan Output

After completing all 15 dimensions, compile a phased plan before making any changes:

```markdown
DEEP AUDIT RESULTS:

Overall Assessment: [1–2 sentences on current state]

PHASE 1 — Critical (hierarchy, usability, responsiveness issues that actively hurt UX)
- [Screen/Component]: [what's wrong] → [what it should be] → [why this matters]

PHASE 2 — Refinement (spacing, typography, color, alignment that elevate quality)
- [Screen/Component]: [what's wrong] → [what it should be] → [why this matters]

PHASE 3 — Polish (micro-interactions, empty/loading/error states, dark mode, subtle details)
- [Screen/Component]: [what's wrong] → [what it should be] → [why this matters]

DESIGN SYSTEM UPDATES:
- [New tokens, colors, spacing, or component changes required]
```

> Do not implement until the plan is approved. Execute phase by phase, presenting results before advancing.

### Scope Discipline

Deep audit covers visual design, layout, spacing, typography, color, interaction, motion, and accessibility. It **does not** touch application logic, state management, API calls, or feature behavior. If a design improvement would require a functional change, flag it rather than implementing it.

## See Also

- [`browser-devtools`](../browser-devtools/SKILL.md) — inspect runtime DOM, network, and accessibility state
- [`e2e-testing`](../e2e-testing/SKILL.md) — automate critical user journeys after the UX issues are understood
