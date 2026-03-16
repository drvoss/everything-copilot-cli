# Coding Style Rules

Guidelines for writing clean, readable, and maintainable code.

## File Size & Structure

- **Ideal file size: 200–400 lines**; absolute maximum: 800 lines
- If a file exceeds 800 lines, split it into focused modules
- Group related functionality together; one concept per file
- Order: imports → constants → types → main logic → helpers

## Nesting & Control Flow

- **No deep nesting** — max 4 levels of indentation
- Use **early returns** (guard clauses) instead of deeply nested conditions
- Extract complex conditions into named boolean variables or functions
- Prefer `switch`/`match` over long `if-else` chains

## Naming

- Use **meaningful, descriptive names** — no single-letter variables (except loop counters)
- Functions should describe what they do: `calculateTotal()`, not `calc()`
- Booleans should read as questions: `isValid`, `hasPermission`, `canEdit`
- Be consistent with naming conventions within a project

## Functions & Methods

- Follow the **Single Responsibility Principle** — each function does one thing
- Keep functions short: 20–30 lines is ideal, 50 lines is a warning sign
- Limit parameters to 3–4; use an options/config object for more
- Pure functions are preferred — minimize side effects

## Immutability & State

- **Prefer immutability** — use `const`, `readonly`, `final` by default
- Only use mutable state when there's a clear performance or clarity reason
- Avoid global mutable state; pass dependencies explicitly
- Use immutable data structures where the language supports them

## DRY & Abstraction

- **DRY (Don't Repeat Yourself)** — but not at the cost of readability
- The Rule of Three: abstract only after the third repetition
- Prefer clear, slightly duplicated code over a clever but obscure abstraction
- Name abstractions by what they do, not how they're implemented

## Comments & Documentation

- Write **self-documenting code** — comments explain *why*, not *what*
- Document public APIs, interfaces, and non-obvious behavior
- Remove commented-out code — that's what version control is for
- Keep comments up to date; stale comments are worse than no comments

## Formatting

- Use consistent formatting enforced by automated tools (Prettier, Black, gofmt)
- One blank line between logical sections; two between top-level declarations
- Keep lines under 100–120 characters
- Use trailing commas in multi-line structures (where the language allows)
