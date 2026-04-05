# Skill Testing Guide

This guide explains how to test whether skills work correctly in the **everything-copilot-cli** repository.

Skills are **promptware**: Markdown prompt files that shape model behavior, rather than deterministic code. That means “testing” is less like unit testing and more like structured evaluation.

## 1. Why Testing Skills Is Different

Skills are Markdown prompt files, not deterministic code. So “does it work?” really means:

- Does it **trigger at the right time**?
- Does it produce **useful, correct output** for the intended task?
- Does it avoid **false positives** (triggering when it shouldn’t)?

Because model behavior is probabilistic and context-dependent, skills aren’t purely unit-testable. Instead, testing combines human evaluation, structured comparisons, and trigger coverage.

## 2. Three Testing Dimensions

### Trigger Testing (most important)

Trigger testing ensures the skill activates when it should, and stays out of the way when it shouldn’t.

- **Should-trigger queries**: prompts that SHOULD invoke this skill
- **Should-NOT-trigger queries**: prompts that should NOT invoke this skill (prevents false positives)

How to test:

1. Run the query **with the skill installed**.
2. Run the same query **without the skill installed**.
3. Compare:
   - Did the assistant follow the skill’s intended workflow when installed?
   - Did the assistant avoid that workflow (or behave differently) without the skill?

If “with skill” looks identical to “without skill,” the skill may not be triggering or may not be adding value.

### Output Quality Testing

Output quality testing checks whether the skill improves the *result*, not just whether it triggered.

- **Baseline comparison**: run the task without the skill (raw AI), then with the skill — compare structure, completeness, and correctness
- **Checklist method**: define expected output elements (sections, format, specific content) and verify they’re present

Simple scoring rubric (1–5 scale):

1. **Trigger accuracy** (did it activate appropriately?)
2. **Output structure** (clear sections, consistent formatting)
3. **Actionability** (concrete next steps, commands, checklists, decisions)
4. **No hallucinations** (facts grounded in the repo/context; uncertainty stated)

Tip: Keep the evaluation prompts and the compared outputs side-by-side so reviewers can score quickly.

### Regression Testing

Regression testing ensures skill edits don’t silently degrade behavior.

- Keep a `_workspace/` dir (gitignored) per skill for test artifacts
- Re-run the baseline comparison after editing a skill’s description or workflow

Focus regression testing on:

- Trigger behavior changes (new false positives / missed triggers)
- Output format drift (skill claims it outputs X, but produces Y)
- Accuracy regressions (new incorrect claims, missing safety checks)

## 3. `_workspace/` Layout Convention

Use this per-skill sandbox to store test prompts, before/after outputs, and evaluator notes.

```
skills/<category>/<skill-name>/
  SKILL.md
  _workspace/          ← gitignored test sandbox
    baseline.md        ← output WITHOUT skill
    with-skill.md      ← output WITH skill
    test-queries.md    ← should-trigger + should-not-trigger list
    notes.md           ← evaluator observations
```

Add `_workspace/` to `.gitignore` (already present in repo).

## 4. Grader Agent Pattern

For repeatable evaluation, use a “Grader” agent prompt to score outputs consistently. This is inspired by a Grader/Comparator/Analyzer style pattern, but kept pragmatic for day-to-day work.

```
You are evaluating whether a Copilot CLI skill output is high quality.

Skill name: [skill-name]
Skill description: [description field]
User query: [the original user prompt]

Output to evaluate:
---
[output]
---

Score 1–5 on each dimension. Return structured JSON only:
{
  "trigger_accuracy": { "score": 1-5, "reasoning": "..." },
  "output_structure": { "score": 1-5, "reasoning": "..." },
  "actionability": { "score": 1-5, "reasoning": "..." },
  "accuracy": { "score": 1-5, "reasoning": "..." },
  "overall": 1-5
}
```

Notes:

- Keep the grader prompt stable over time so scores remain comparable.
- Provide the same user query and the full output you want graded.
- If needed, add a short “repo context” block (but keep it consistent across runs).

## 5. Quick Checklist (before shipping a skill)

- [ ] At least 8–10 should-trigger queries written and tested (aim for diversity: different phrasings, contexts, urgency levels)
- [ ] At least 8–10 should-NOT-trigger queries verified (no false positives), including **near-miss queries**
- [ ] Description field follows `skill-writing-best-practices.md` (trigger-first pattern)
- [ ] Output format section in `SKILL.md` matches what the skill actually produces
- [ ] Tested in at least one real project context (not just synthetic examples)

### Near-Miss Query Design

A near-miss is a query that *sounds like* it should trigger the skill but shouldn't — because a simpler or more specific skill is the right choice.

**How to design near-misses:**
1. Take a valid trigger query and weaken/reframe it: change scope ("just one file" vs "the whole repo"), reduce specificity ("check for issues" vs "run a full security scan"), or shift to a different skill's domain.
2. Verify the near-miss does NOT trigger the skill (if it does, tighten the `NOT when…` clause in the description).

**Example near-miss pairs (for `security-scan`):**

| Trigger (should fire) | Near-miss (should NOT fire) |
|---|---|
| "Run a full security scan before our release" | "Is this function safe?" → use `code-review` |
| "Check all dependencies for CVEs" | "What does this package do?" → use chat |
| "Audit our auth module for OWASP issues" | "Review this PR for security" → use `pr-multi-perspective-review` |

## 6. Testing the `description:` Field Specifically

Reference `guides/skill-writing-best-practices.md`. The description is the highest-leverage field to test.

Method:

- Paste the description into a blank chat and ask: **“Given this description, when would you use this skill?”**
- If the AI’s answer doesn’t match your intended triggers → revise the description

This catches the most common failure mode: a well-written workflow that rarely triggers (or triggers too broadly).

## See Also

- `guides/skill-writing-best-practices.md` — description quality guide
- `orchestration/patterns/producer-reviewer.md` — iterative refinement for skill output
