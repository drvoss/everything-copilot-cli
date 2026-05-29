---
name: qa-review
description: >
  Use when reviewing or planning QA strategy for a feature, PR, or release so
  test coverage, test quality, reliability, and defect reporting are handled as
  a coherent engineering discipline instead of ad hoc checks.
metadata:
  category: testing
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot qa-engineering-best-practices.instructions.md (MIT)
---

# QA Review

Review quality strategy the way a strong QA engineer would: choose the right test
layers, verify the tests are readable and deterministic, and make failures easy
to act on.

## When to Use

- A feature or PR needs a QA-oriented review before merge or release
- Test coverage exists, but you are not sure it is at the right pyramid level
- A team needs a repeatable checklist for API, UI, regression, or performance coverage
- Bug reports or CI failures are noisy and need better quality standards

## When NOT to Use

| Instead of qa-review | Use |
|----------------------|-----|
| Writing one failing test before implementation | `tdd-workflow` |
| Building an LLM or agent evaluation suite | `eval-harness` |
| Writing or debugging browser automation for a specific flow | `e2e-testing` or `browser-devtools` |
| General UX or usability critique | `ux-audit` |

## QA Model

Balance the test pyramid first:

| Layer | Goal | Typical share |
|-------|------|---------------|
| Unit | business logic, edge cases, fast feedback | 60-70% |
| Integration | module boundaries, DB, API, contracts | 20-30% |
| End-to-end | critical user journeys and smoke flows | 5-10% |

If a change leans too heavily on slow end-to-end tests or skips contract-level
checks entirely, treat that as a QA design issue, not just a missing test.

## Workflow

### 1. Define the quality risk

Before reading tests, ask:

1. what can break for the user or operator?
2. which layer should catch it first?
3. what would make a failure actionable in CI?

Use that to decide whether you primarily need unit, integration, E2E, or
performance evidence.

### 2. Inspect the current test surface

```powershell
rg -n "describe\\(|test\\(|it\\(" . -g "*.{test,spec}.{js,jsx,ts,tsx}"
rg -n "def test_|class Test" . -g "*_test.py" -g "test_*.py"
rg -n "@playwright/test|cypress|selenium" .
```

Check whether the tests already map to the right layer or whether important paths
are covered only indirectly.

### 3. Review test case quality

Prefer names that read as standalone behavior statements:

- `should return 404 when product id does not exist`
- `given an expired token, when the user calls /me, then it returns 401`

Flag names like `test1`, `works`, or implementation-detail phrasing that makes
failures harder to interpret.

For assertions:

- prefer exact expected values over truthiness
- prefer specific matchers over generic equality
- keep one logical behavior per test when practical
- check both exception type and message for failure-path tests

### 4. Review data isolation and mocks

Look for:

- factories or builders instead of repeated raw fixture blobs
- minimal test data shaped only around the behavior under review
- unique IDs or reset hooks to prevent shared-state collisions
- mocking at the boundary (HTTP client, DB adapter, queue), not deep inside the core logic

Treat random sleeps, global state reuse, and order-dependent tests as reliability
bugs.

### 5. Review boundary coverage

For APIs, verify:

- status code
- response schema
- headers
- authn/authz cases
- boundary inputs
- error-body consistency
- idempotency where relevant

For UI or E2E coverage, verify:

- user-visible behavior rather than implementation details
- accessible selectors first (`role`, `label`, then `test-id`)
- explicit waits instead of fixed sleeps
- isolated and stable execution environment

For performance-sensitive work, verify:

- explicit SLOs or target latency/throughput expectations
- realistic data volume
- distinction between load, stress, and soak concerns
- regression tracking over time instead of one-off anecdotes

### 6. Review CI and bug reporting readiness

A strong QA pass should leave behind:

- fast tests on every commit
- slower suites on PR, merge, or scheduled gates
- visible failure output with the exact broken test and reason
- retained artifacts such as traces, screenshots, JUnit XML, or coverage output

Bug reports should include:

1. precise title
2. environment
3. numbered repro steps
4. expected result
5. actual result
6. severity
7. relevant attachments

## Output Template

```markdown
## QA Review

### Coverage Shape
- ...

### Test Quality
- ...

### Reliability Risks
- ...

### Missing Cases
- ...

### CI / Reporting Gaps
- ...

### Recommended Next Step
1. ...
2. ...
3. ...
```

## Review Checklist

- [ ] The changed behavior is covered at the right test-pyramid layer
- [ ] Test names are readable and behavior-focused
- [ ] Tests are deterministic and isolated
- [ ] Mocks are boundary-level and reset between tests
- [ ] API or UI boundary cases are covered where relevant
- [ ] CI output and artifacts would make a failure actionable

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The E2E test covers everything already." | Slow end-to-end coverage does not replace unit or contract coverage. |
| "This assertion is good enough." | Vague assertions create vague failures. |
| "A little sleep makes the test stable." | Arbitrary waits hide race conditions instead of fixing them. |
| "Coverage is high, so QA is done." | Coverage percentages do not prove critical paths or edge cases were tested well. |

## See Also

- [`tdd-workflow`](../../development/tdd-workflow/SKILL.md) - write the first failing tests before implementation
- [`eval-harness`](../eval-harness/SKILL.md) - evaluate LLM or agent workflows with tracked test cases
- [`e2e-testing`](../e2e-testing/SKILL.md) - build and run critical user-flow automation
- [`test-coverage`](../test-coverage/SKILL.md) - measure and close structural coverage gaps
