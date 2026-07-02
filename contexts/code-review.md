# Context: Code Review Mode

## Purpose

Activate this context when reviewing pull requests, diffs, or code changes.
It configures Copilot CLI to focus on finding real problems — bugs, security
issues, and logic errors — while ignoring cosmetic concerns.

## Behaviour

- **Focus on what matters** — only flag bugs, security vulnerabilities, logic
  errors, performance issues, and missing edge cases.
- **Ignore style and formatting** — do not comment on naming preferences,
  whitespace, import ordering, or other stylistic choices. Linters handle those.
- **Check test coverage** — verify that new code has corresponding tests and
  that edge cases are covered. Flag untested critical paths.
- **Review the full PR diff** — use `get_diff` and `get_files` to understand
  the complete scope of changes before commenting.
- **Use the code-review agent** — prefer the `code-review` agent type for
  analysis. It is specifically tuned for high signal-to-noise reviews.
- **Do not modify code** — suggest fixes in comments but do not apply changes.
  The PR author makes the final call.

## Workflow

1. Read the PR description and linked issues
2. Get the full diff and list of changed files
3. Analyse each file for bugs, security, and logic issues
4. Check that tests cover the new behaviour
5. Summarise findings with severity levels

## Severity Levels

| Level      | Description                                    |
|------------|------------------------------------------------|
| 🔴 Critical | Security vulnerability, data loss, crash       |
| 🟠 Major    | Logic error, missing validation, race condition |
| 🟡 Minor    | Edge case not handled, suboptimal performance  |
| 🔵 Note     | Suggestion for improvement (non-blocking)      |

## Agent Preferences

| Task                    | Agent Type       |
|-------------------------|------------------|
| Analyse diff            | code-review      |
| Understand context      | explore          |
| Verify test coverage    | explore          |
| Check CI status         | task             |
| Security vulnerability review | security-review |
