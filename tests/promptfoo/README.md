# Promptfoo Skill Eval Coverage

This directory holds Promptfoo test cases for `npm run eval` (see `scripts/run-promptfoo-eval.js`
and `promptfooconfig.yaml`). Each `<skill>/cases.yaml` loads one `SKILL.md` via
`scripts/promptfoo-skill-prompt.js` and checks the model's response against `llm-rubric` and
string assertions.

## Three-Tier Coverage Model

addyosmani/agent-skills PR #342 (07-07, `evals/` directory) frames skill evaluation as three
distinct tiers. Use this table to place new test cases and to see what this repo currently covers:

| Tier | Question it answers | Our coverage |
|------|---------------------|--------------|
| **Trigger** | Does the skill activate on realistic phrasing, and stay silent when it shouldn't? | Partial — `skill-creator`'s "4-A. Audit activation and collision risk" step covers this at authoring time (manual prompt simulation), but no automated Promptfoo case asserts on activation/silence directly |
| **Routing** | When two adjacent skills could plausibly apply, does the agent pick the right one? Tested with pairwise negative cases. | **Gap** — no current `cases.yaml` pits two skills against each other. `mcp-ecosystem/cases.yaml` tests one skill's own in-scope/out-of-scope boundary, which is adjacent but not pairwise routing between two distinct skills |
| **Behavior** | Given the skill is loaded, is the output actually correct and complete? | Covered — `create-prd/cases.yaml` and `feature-prioritization/cases.yaml` assert on output structure and content quality with `llm-rubric` + `contains-all`/`contains-any` |

## Adding a Routing-Tier Case

A routing case should present a query that could plausibly route to either of two adjacent skills
and assert the response matches the correct one. Example shape (not yet automated — this repo's
harness loads one `skill_path` per case, so a true pairwise routing case needs a second prompt
variant that offers the model both skill descriptions and asks it to choose):

```yaml
- description: "Ambiguous review request routes to review, not code-review"
  vars:
    skill_path: skills/development/review/SKILL.md
    query: "Compare my branch against main — does it match repo conventions and the linked issue?"
  assert:
    - type: llm-rubric
      value: "The response separates Standards and Spec findings into two sections, rather than a single merged code-quality pass."
```

Until the harness supports offering multiple candidate `SKILL.md` files in one prompt, treat
single-skill boundary cases (like the one above and `mcp-ecosystem/cases.yaml`) as the practical
stand-in for the routing tier, and prioritize a true multi-skill harness change if routing
regressions are actually observed in practice.

## See Also

- [`skill-creator`](../../skills/development/skill-creator/SKILL.md) — "4-A. Audit activation and
  collision risk" for the manual/authoring-time version of the trigger + routing checks
- [`references/testing-patterns.md`](../../references/testing-patterns.md) — general test
  structure patterns (AAA, assertions, mocking) unrelated to skill eval
