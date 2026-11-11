---
name: design-to-code
license: MIT
description: Use when a design (a Figma frame, a screenshot, or a handoff spec) must become production UI in an existing codebase — collect every state and breakpoint, map the design to the project's tokens and components, implement only that scope, and compare the result to the design at each width before calling it done.
metadata:
  category: development
  agent_type: general-purpose
---

# Design to Code

A design file shows one or a few states at one or a few widths. Production UI needs all of them,
built from the components and tokens the project already has. This skill turns a design into code
that matches it where the design is specific, follows the design system where it is not, and says
plainly what could not be verified.

## When to Use

- You have a Figma URL or frame, a screenshot, or a written handoff for a component or page
- The UI must ship in an existing app with its own design tokens and component library
- A reviewer will compare the result against the design

## When NOT to Use

| Instead of design-to-code | Use |
|---------------------------|-----|
| A throwaway mock to answer one product question | `prototype` |
| Reviewing an existing UI for usability or accessibility problems | `ux-audit` |
| Debugging a layout bug in running code | `browser-devtools` |
| Testing a finished flow end to end | `e2e-testing` |

## Prerequisites

- Read access to the design: a Figma MCP server or export, or image files of every frame
- The project's design tokens (colors, spacing, type, radius) and component library location
- A way to run the app or a component preview (Storybook, a dev route) and take screenshots

## Workflow

### 1. Inventory the Design

List every frame you received and what it represents. For each, note:

- Breakpoints shown (for example 375, 768, 1280 px)
- States shown: default, hover, focus, disabled, loading, empty, error, long content
- Interactions the design implies but does not draw (menus opening, validation messages)

Write down the states and widths the design does **not** show. Those are decisions to make with the
design system's conventions or to ask about — not to invent silently.

### 2. Map to Tokens and Components

Before writing markup, map each visual value to what the codebase already has:

| In the design | Map to |
|---------------|--------|
| A color, spacing, radius, or font value | The nearest design token; flag values with no token |
| A button, input, card, or dialog | The existing component and its props |
| A new pattern | A composition of existing components, or a new component if none fits |

Do not hardcode raw hex values or pixel sizes when a token exists. When a design value has no token,
list it for the reviewer instead of adding a one-off value.

### 3. Implement Only the Scope

Build the component or page with the mapped pieces. Keep to the frames you received:

- Leave data fetching and backend wiring as clearly marked stubs if they are out of scope
- Do not restyle neighbouring components to make the new one fit
- Implement the required missing states from step 1 with established component behavior; ask, or
  mark the work blocked, when no safe convention exists

### 4. Compare at Every Width

Run the app or preview and capture a screenshot at each breakpoint from step 1. Compare each one to
its frame and record differences item by item (spacing, alignment, type, color, truncation). Fix
differences that come from the implementation; list differences that come from a token or
component the design deviates from.

If you cannot run the UI or take screenshots in this environment, say so and mark visual fidelity as
unverified rather than claiming a match.

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "Close enough to the mock" | Reviewers compare side by side; record each difference or fix it |
| "The design didn't show an error state, so there isn't one" | Users still hit errors; use the design system's pattern and note it |
| "A raw hex value is faster than finding the token" | One-off values drift from the theme and break dark mode |
| "I'll match the desktop frame and mobile will follow" | Layouts break between breakpoints; check each width |

## Red Flags

- New colors, font sizes, or spacing values appear in the diff that are not tokens
- A component from the library is copied and modified instead of used with props
- The change touches files unrelated to the designed component
- The pull request claims a visual match with no screenshots

## Verification

- [ ] A screenshot at every breakpoint in the inventory, next to its design frame
- [ ] Every required state is implemented, or the requester explicitly agreed it is out of scope
- [ ] The project's build, lint, type check, and component tests pass
- [ ] Keyboard focus order and visible focus work; text contrast meets the project's standard
      (check with `ux-audit` if unsure)
- [ ] Design values with no matching token are listed for the reviewer

If verification shows the change broke another component, revert the unrelated part and keep the
diff to the designed scope.

## Tips

- With a Figma MCP server connected, read component names and token references from the frame
  instead of eyeballing pixel values
- Ask for the missing states before building them when a designer is available — a one-line
  question is cheaper than a second review round
