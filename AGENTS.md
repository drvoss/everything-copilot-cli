# Agents Directory

> Catalog of all core agents in the everything-copilot-cli system.
> Each agent maps to a Copilot CLI agent type and has defined responsibilities, tools, and escalation paths.

---

## Agent Summary

| # | Agent | Purpose | Copilot Agent Type | Model |
|---|-------|---------|-------------------|-------|
| 1 | [planner](#1-planner) | Break down complex features, identify dependencies | `general-purpose` | claude-sonnet-4.6 |
| 2 | [architect](#2-architect) | System design, scalability decisions | `general-purpose` | claude-sonnet-4.6 |
| 3 | [code-reviewer](#3-code-reviewer) | Quality, maintainability, best practices | `code-review` | claude-sonnet-4.6 |
| 4 | [security-reviewer](#4-security-reviewer) | Vulnerability detection, hardened defaults | `code-review` | claude-sonnet-4.6 |
| 5 | [tdd-guide](#5-tdd-guide) | Test-driven development workflow | `general-purpose` | gpt-5-mini |
| 6 | [build-error-resolver](#6-build-error-resolver) | Fix build/compilation errors | `task` | gpt-5-mini |
| 7 | [doc-updater](#7-doc-updater) | Documentation sync | `general-purpose` | claude-haiku-4.5 |
| 8 | [refactor-cleaner](#8-refactor-cleaner) | Dead code removal, cleanup | `general-purpose` | gpt-5-mini |

---

## 1. Planner

**Purpose**: Break down complex features into implementable tasks, identify dependencies between work items, and create structured execution plans.

### When to Use

- A feature request spans multiple files, modules, or systems
- The task requires sequencing — some work must happen before other work
- You need a todo list with dependencies before starting implementation
- The user invokes Plan Mode or asks for a breakdown

### Agent Type Mapping

- **Copilot agent type**: `general-purpose`
- **Copilot mode**: Plan Mode (creates `plan.md`, uses `exit_plan_mode` for approval)
- **Fleet compatible**: Yes — planner creates the plan, fleet agents execute it

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Search codebase for dependencies |
| `glob` | ✅ Full | Discover file structure |
| `view` | ✅ Full | Read existing code and configs |
| `edit` | ❌ None | Planner does not modify code |
| `create` | ✅ Limited | Only for `plan.md` |
| `sql` | ✅ Full | Todo tracking with dependencies |
| `powershell` | ⚠️ Read-only | Inspect build state, test results |

### Model Recommendation

**claude-sonnet-4.6** — Strong reasoning for dependency analysis and task decomposition. For very large codebases, consider **claude-opus-4.6** for deeper analysis.

### Escalation

- Escalates to **architect** when design decisions are needed
- Escalates to **human** when requirements are ambiguous

---

## 2. Architect

**Purpose**: Make system design decisions, evaluate scalability trade-offs, define component boundaries, and establish technical direction.

### When to Use

- A new system or subsystem needs to be designed
- You need to decide between competing approaches (e.g., monolith vs. microservices)
- Performance, scalability, or reliability requirements must be evaluated
- Cross-cutting concerns need resolution (auth, logging, error handling)

### Agent Type Mapping

- **Copilot agent type**: `general-purpose`
- **Copilot mode**: Interactive or Plan Mode (often produces design documents)
- **Fleet compatible**: No — architecture decisions should be centralized

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Analyze existing patterns |
| `glob` | ✅ Full | Understand project structure |
| `view` | ✅ Full | Read all files |
| `edit` | ✅ Full | Create/update design docs |
| `create` | ✅ Full | New architecture documents |
| `powershell` | ⚠️ Read-only | Inspect dependencies, versions |
| `web_fetch` | ✅ Full | Research best practices, docs |

### Model Recommendation

**claude-sonnet-4.6** — Excellent for weighing trade-offs and producing structured design documents. For complex distributed systems, use **claude-opus-4.6**.

### Escalation

- Escalates to **human** for business-critical design decisions
- Collaborates with **security-reviewer** for security architecture
- Hands off to **planner** to break approved designs into tasks

---

## 3. Code Reviewer

**Purpose**: Review code for quality, maintainability, readability, and adherence to best practices. Focus on substantive issues, not style.

### When to Use

- A PR is ready for review
- Code changes need a second pair of eyes before merging
- You want to verify that changes follow project conventions
- Post-implementation quality check

### Agent Type Mapping

- **Copilot agent type**: `code-review`
- **Copilot mode**: Interactive (reviews are conversational)
- **Fleet compatible**: Yes — can review multiple files in parallel

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Search for patterns, anti-patterns |
| `glob` | ✅ Full | Find related files |
| `view` | ✅ Full | Read all code |
| `edit` | ❌ None | Reviewers don't modify code |
| `powershell` | ⚠️ Read-only | Check test results, build status |
| `github API` | ✅ Full | Read PR diffs, leave comments |

### Review Focus Areas

1. **Logic errors** — bugs, off-by-one, null handling
2. **API contracts** — breaking changes, missing validation
3. **Error handling** — uncaught exceptions, missing error paths
4. **Performance** — unnecessary allocations, N+1 queries
5. **Maintainability** — complexity, naming, dead code

### What This Agent Does NOT Review

- Code style and formatting (use linters)
- Import ordering (use auto-formatters)
- Trivial naming preferences

### Model Recommendation

**claude-sonnet-4.6** — High-quality reasoning for catching subtle bugs. For large PRs touching many files, consider splitting across fleet agents.

### Escalation

- Escalates to **security-reviewer** if potential vulnerabilities detected
- Escalates to **architect** if structural/design issues found
- Escalates to **human** for subjective quality decisions

---

## 4. Security Reviewer

**Purpose**: Detect security vulnerabilities, enforce hardened defaults, identify exposed secrets, and validate security-sensitive code paths.

### When to Use

- Code touches authentication, authorization, or session management
- Changes involve cryptography, hashing, or token generation
- User input is processed (injection risk)
- Dependencies are added or updated
- Infrastructure or deployment configurations change
- Any code handling PII or sensitive data

### Agent Type Mapping

- **Copilot agent type**: `code-review`
- **Copilot mode**: Interactive (security findings need discussion)
- **Fleet compatible**: Yes — can scan multiple files/components in parallel

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Search for vulnerability patterns |
| `glob` | ✅ Full | Find config files, env files |
| `view` | ✅ Full | Read all code and configs |
| `edit` | ❌ None | Reports findings, does not fix |
| `powershell` | ⚠️ Read-only | Check dependency versions, audit |
| `github API` | ✅ Full | Check Dependabot alerts, advisories |

### Security Checklist

- [ ] No hardcoded secrets, tokens, or API keys
- [ ] Input validation on all user-supplied data
- [ ] Parameterized queries (no SQL string concatenation)
- [ ] HTTPS enforced for all external communication
- [ ] Authentication tokens have expiration
- [ ] Dependencies free of known CVEs
- [ ] Error messages don't leak internal details
- [ ] File uploads validated and sandboxed
- [ ] CORS configured restrictively

### Model Recommendation

**claude-sonnet-4.6** — Strong at identifying subtle security issues and explaining their impact. For comprehensive security audits, use **claude-opus-4.6**.

### Escalation

- **Always escalates to human** for confirmed vulnerabilities
- Collaborates with **architect** for security design patterns
- Blocks merge if critical vulnerabilities found

---

## 5. TDD Guide

**Purpose**: Guide test-driven development workflows — write failing tests first, implement minimal code to pass, then refactor. Track test case status through the red-green-refactor cycle.

### When to Use

- Starting implementation of a new feature or module
- The user asks to follow TDD methodology
- Writing tests before implementation
- Ensuring comprehensive test coverage for critical paths

### Agent Type Mapping

- **Copilot agent type**: `general-purpose`
- **Copilot mode**: Interactive or Autopilot (iterative red-green-refactor cycles)
- **Fleet compatible**: Partially — test creation can parallelize, but the red-green cycle is sequential

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Find existing tests, patterns |
| `glob` | ✅ Full | Discover test file structure |
| `view` | ✅ Full | Read source and test files |
| `edit` | ✅ Full | Write tests and implementation |
| `create` | ✅ Full | New test files |
| `powershell` | ✅ Full | Run tests, check results |
| `sql` | ✅ Full | Track test case status |

### TDD Workflow

```text
1. RED    → Write a failing test that defines desired behavior
2. GREEN  → Write the minimal code to make the test pass
3. REFACTOR → Clean up while keeping tests green
4. REPEAT → Next test case
```

### Test Case Tracking

Uses the SQL `test_cases` table:

```sql
CREATE TABLE test_cases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'not_written'  -- not_written | failing | passing | skipped
);
```

### Model Recommendation

**gpt-5-mini** — Fast iteration speed is critical for TDD cycles. Strong at generating test cases and minimal implementations. Use **claude-sonnet-4.6** for complex test logic.

### Escalation

- Escalates to **architect** when test design reveals architectural issues
- Escalates to **human** when test requirements are unclear

---

## 6. Build Error Resolver

**Purpose**: Diagnose and fix build failures, compilation errors, dependency conflicts, and CI pipeline issues. Get the build green as fast as possible.

### When to Use

- Build or compilation fails
- CI pipeline reports errors
- Dependency installation fails
- Type errors or lint errors block progress
- A previously passing build starts failing

### Agent Type Mapping

- **Copilot agent type**: `task`
- **Copilot mode**: Autopilot (error resolution should be fast and autonomous)
- **Fleet compatible**: No — build errors are typically sequential (fix one, see if others resolve)

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Search for error patterns |
| `glob` | ✅ Full | Find config files |
| `view` | ✅ Full | Read source and config files |
| `edit` | ✅ Full | Fix errors in source/config |
| `powershell` | ✅ Full | Run builds, install deps, check versions |
| `github API` | ✅ Full | Check CI logs, Actions output |

### Resolution Strategy

1. **Read the error** — parse the full error message and stack trace
2. **Identify root cause** — distinguish symptom from cause
3. **Check recent changes** — `git log` and `git diff` for what changed
4. **Apply fix** — minimal change to resolve the error
5. **Verify** — rebuild and confirm the fix works
6. **Prevent regression** — suggest a test if the error was subtle

### Model Recommendation

**gpt-5-mini** — Fast turnaround for iterative fix-test-fix cycles. Excellent at parsing error messages and generating fixes. For complex dependency conflicts, use **claude-sonnet-4.6**.

### Escalation

- Escalates to **architect** if the error reveals a design problem
- Escalates to **human** if the fix requires breaking changes

---

## 7. Doc Updater

**Purpose**: Keep documentation in sync with code changes. Update READMEs, API docs, inline comments, and guide files when implementations change.

### When to Use

- Code changes affect documented behavior
- New features need documentation
- API signatures or configurations change
- README or guide content is outdated
- After a refactoring pass

### Agent Type Mapping

- **Copilot agent type**: `general-purpose`
- **Copilot mode**: Autopilot (doc updates are well-scoped)
- **Fleet compatible**: Yes — different docs can be updated in parallel

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Find references to changed APIs |
| `glob` | ✅ Full | Discover documentation files |
| `view` | ✅ Full | Read all files |
| `edit` | ✅ Full | Update documentation files |
| `create` | ✅ Full | New documentation files |
| `powershell` | ⚠️ Read-only | Check file structure, git history |

### Documentation Scope

| Type | Location | Format |
|------|----------|--------|
| Project README | `README.md` | Markdown |
| Agent catalog | `AGENTS.md` | Markdown with frontmatter |
| Usage guides | `guides/` | Markdown |
| API docs | Inline or `docs/` | JSDoc / docstrings |
| Copilot instructions | `.github/copilot-instructions.md` (runtime) and `COPILOT-INSTRUCTIONS.md` (full reference) | Markdown |

### Model Recommendation

**claude-haiku-4.5** — Documentation updates are typically straightforward and benefit from fast execution. Use **claude-sonnet-4.6** for complex technical writing.

### Escalation

- Escalates to **code-reviewer** to verify doc accuracy
- Escalates to **human** for tone and audience decisions

---

## 8. Refactor Cleaner

**Purpose**: Remove dead code, simplify complex logic, consolidate duplicates, and improve code organization without changing external behavior.

### When to Use

- Codebase has accumulated dead or unreachable code
- Duplicated logic exists across multiple files
- Functions or modules have grown too complex (high cyclomatic complexity)
- After a feature is complete and working — cleanup pass
- Technical debt reduction sprints

### Agent Type Mapping

- **Copilot agent type**: `general-purpose`
- **Copilot mode**: Plan Mode (refactoring should be planned) → Autopilot (execution)
- **Fleet compatible**: Yes — independent modules can be cleaned in parallel

### Tool Permissions

| Tool | Access | Notes |
|------|--------|-------|
| `grep` | ✅ Full | Find dead code, unused imports, duplicates |
| `glob` | ✅ Full | Understand project structure |
| `view` | ✅ Full | Read all source files |
| `edit` | ✅ Full | Remove/simplify code |
| `powershell` | ✅ Full | Run tests after each refactor step |
| `sql` | ✅ Full | Track refactoring tasks |

### Refactoring Rules

1. **Never change behavior** — refactoring must be transparent to callers
2. **Run tests after every change** — verify nothing broke
3. **Small commits** — one logical change per commit
4. **Preserve git blame** — prefer targeted edits over file rewrites
5. **Document removed code** — note what was removed and why in the commit message

### Refactoring Checklist

- [ ] Remove unused imports and variables
- [ ] Delete unreachable code paths
- [ ] Consolidate duplicated logic into shared functions
- [ ] Simplify deeply nested conditionals
- [ ] Extract long functions into smaller, named functions
- [ ] Remove commented-out code (it's in git history)
- [ ] Update tests to reflect simplified structure

### Model Recommendation

**gpt-5-mini** — Fast at identifying patterns and making targeted edits. For large-scale refactoring across many files, use **claude-sonnet-4.6** for better cross-file reasoning.

### Escalation

- Escalates to **code-reviewer** after refactoring for verification
- Escalates to **architect** if refactoring reveals structural issues
- Escalates to **tdd-guide** if tests need to be added before refactoring

---

## Agent Interaction Patterns

### Pipeline Pattern

Sequential handoff between agents:

```text
planner → architect → tdd-guide → code-reviewer → doc-updater
```

### Review Chain Pattern

Parallel review with merged feedback:

```text
                ┌→ code-reviewer ──┐
implementation ─┤                  ├→ merged feedback
                └→ security-reviewer┘
```

### Error Resolution Pattern

Triggered by failures:

```text
build fails → build-error-resolver → fix applied → tdd-guide (add regression test)
```

### Cleanup Pattern

Post-feature maintenance:

```text
feature complete → refactor-cleaner → code-reviewer → doc-updater
```
