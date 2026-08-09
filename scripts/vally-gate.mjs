#!/usr/bin/env node
/**
 * vally-gate — runs the same lint that github/awesome-copilot's external-plugin
 * quality gate runs, and enforces a ratchet against a checked-in baseline.
 *
 *   node scripts/vally-gate.mjs                       # gate skills/ against the baseline
 *   node scripts/vally-gate.mjs --update              # rewrite the baseline (review the diff!)
 *   node scripts/vally-gate.mjs --root plugins/x/skills --strict-all
 *                                                     # gate a plugin bundle: every skill must pass
 *
 * Upstream parity: awesome-copilot imports `runLint` from @microsoft/vally in
 * eng/external-plugin-quality-gates.mjs. We call the same entry point, so a pass
 * here is evidence about the same checks, not an approximation.
 */
import { runLint } from "@microsoft/vally";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const has = (flag) => process.argv.includes(flag);

const rootArg = arg("--root", "skills");
const baselinePath = resolve(ROOT, arg("--baseline", "tests/fixtures/vally-baseline.json"));
const strictAll = has("--strict-all");
const update = has("--update");
const lintRoot = resolve(ROOT, rootArg);

if (!existsSync(lintRoot)) {
  console.error(`vally-gate: lint root not found: ${lintRoot}`);
  process.exit(1);
}

const result = await runLint({ rootPath: lintRoot });

/** name -> sorted list of failing grader names */
const failing = new Map();
for (const r of result.skillResults) {
  if (r.passed) continue;
  const graders = (r.graderResults ?? [])
    .filter((g) => !g.passed)
    .map((g) => g.name)
    .sort();
  failing.set(r.skill.name, graders);
}

const total = result.skillResults.length;
const passed = total - failing.size;
console.log(`vally-gate: ${rootArg} — ${total} skill(s) linted, ${passed} passed, ${failing.size} failed`);

for (const e of result.discoveryErrors ?? []) {
  console.error(`vally-gate: discovery error: ${JSON.stringify(e)}`);
}

if (strictAll) {
  if (failing.size === 0) process.exit(0);
  console.error(`\nvally-gate: --strict-all requires every skill to pass. Failing:`);
  for (const [name, graders] of [...failing].sort()) {
    console.error(`  x ${name} — ${graders.join(", ")}`);
  }
  process.exit(1);
}

if (update) {
  mkdirSync(dirname(baselinePath), { recursive: true });
  const payload = {
    note: "Known-failing skills for `vally lint`. Ratchet only: entries may be removed, never added without review.",
    root: rootArg,
    total,
    failing: Object.fromEntries([...failing].sort()),
  };
  writeFileSync(baselinePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`vally-gate: baseline written — ${failing.size} known-failing skill(s) → ${baselinePath}`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error(`vally-gate: baseline missing at ${baselinePath}. Run with --update once and commit it.`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8")).failing ?? {};
const errors = [];

for (const [name, graders] of failing) {
  if (!(name in baseline)) {
    errors.push(`NEW FAILURE   ${name} — ${graders.join(", ")}`);
  } else if (baseline[name].join(",") !== graders.join(",")) {
    errors.push(`CHANGED       ${name} — baseline [${baseline[name].join(", ")}] → now [${graders.join(", ")}]`);
  }
}
for (const name of Object.keys(baseline)) {
  if (!failing.has(name)) {
    errors.push(`FIXED         ${name} — now passes; remove it from the baseline (\`--update\`)`);
  }
}

if (errors.length === 0) {
  console.log(`vally-gate: OK — ${Object.keys(baseline).length} known failure(s), no drift.`);
  process.exit(0);
}

console.error("\nvally-gate: baseline drift\n");
for (const e of errors.sort()) console.error(`  ${e}`);
console.error(
  "\nA NEW FAILURE means a skill just became ineligible for the awesome-copilot quality gate.\n" +
    "Fix the skill. Do not run --update to silence it.\n"
);
process.exit(1);
