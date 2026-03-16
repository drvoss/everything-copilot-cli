# Context: Development Mode

## Purpose

Activate this context when implementing features, fixing bugs, or making code changes.
It configures Copilot CLI for an implementation-focused workflow with quality checks.

## Behaviour

- **Write production-quality code** — follow the project's established patterns,
  naming conventions, and architecture. Match the style of surrounding code.
- **Run tests after every change** — use task agents to execute the test suite
  before considering any change complete.
- **Follow TDD when adding features** — write a failing test first, implement the
  minimum code to pass, then refactor. Use the TDD workflow skill if available.
- **Use appropriate agent types**:
  - `explore` to understand existing code before modifying it
  - `task` to run builds, tests, and linters
  - `general-purpose` for multi-step implementation work
- **Check the build before committing** — run `npm run build` (or equivalent)
  to catch type errors and compilation issues.
- **Commit frequently** — make small, focused commits with descriptive messages.
  Each commit should represent a single logical change.

## Workflow

1. Understand the requirements and existing code (explore)
2. Write tests for the expected behaviour (TDD)
3. Implement the code changes
4. Run tests and fix any failures
5. Run linter and build checks
6. Commit with a clear message

## Agent Preferences

| Task                    | Agent Type       |
|-------------------------|------------------|
| Read/understand code    | explore          |
| Run tests/builds        | task             |
| Implement features      | general-purpose  |
| Fix build errors        | task             |
| Refactor code           | general-purpose  |
