import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildHunkIndex,
  findHunkId,
  mergeFindings,
  loadRuleAliases,
  loadBackendFamilies,
  normalizePath,
  createReport,
  validateRawReport,
} from "../scripts/quad-cli-orchestrate.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const SCRIPT = resolve(ROOT, "scripts", "quad-cli-orchestrate.mjs");
const FIXTURES_DIR = resolve(ROOT, "tests", "fixtures", "quad-cli");
const MOCK_DIR = resolve(FIXTURES_DIR, "mock-responses");

function runScript(args, env = {}) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], {
      cwd: ROOT,
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { stdout, code: 0 };
  } catch (error) {
    return { stdout: error.stdout ?? "", code: error.status };
  }
}

describe("quad-cli-orchestrate exit codes (mock reviewers, --diff-file fixture)", () => {
  it("exit 1 when a hunk-anchored finding reaches 2+ distinct model families (blocking)", () => {
    const result = runScript(["--diff-file", resolve(FIXTURES_DIR, "sample.diff")], {
      QUAD_CLI_MOCK_DIR: MOCK_DIR,
    });
    assert.equal(result.code, 1);
    const report = JSON.parse(result.stdout);
    const expected = JSON.parse(readFileSync(resolve(FIXTURES_DIR, "expected-report.json"), "utf8"));
    assert.deepEqual(report, expected);
  });

  it("exit 0 when the diff is empty", () => {
    const emptyDiffPath = resolve(FIXTURES_DIR, "empty.diff");
    const result = runScript(["--diff-file", emptyDiffPath], { QUAD_CLI_MOCK_DIR: MOCK_DIR });
    assert.equal(result.code, 0);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.findings, []);
  });

  it("exit 2 on orchestrator-level argument errors", () => {
    const result = runScript(["--staged", "--base", "main", "--head", "HEAD"], { QUAD_CLI_MOCK_DIR: MOCK_DIR });
    assert.equal(result.code, 2);
  });

  it("exit 3 when fewer than --min-reviewers (default 2) return schema-valid output", () => {
    const result = runScript(["--diff-file", resolve(FIXTURES_DIR, "sample.diff")], {
      QUAD_CLI_MOCK_DIR: resolve(FIXTURES_DIR, "mock-responses-single"),
    });
    assert.equal(result.code, 3);
  });

  it("--advisory-only downgrades the below-minimum (but nonzero) case to exit 0", () => {
    const result = runScript(["--diff-file", resolve(FIXTURES_DIR, "sample.diff"), "--advisory-only"], {
      QUAD_CLI_MOCK_DIR: resolve(FIXTURES_DIR, "mock-responses-single"),
    });
    assert.equal(result.code, 0);
    const report = JSON.parse(result.stdout);
    assert.equal(report.status, "advisory-degraded");
    assert.equal(report.reviewers_effective, 1);
  });

  it("zero valid reviewers exits 3 EVEN under --advisory-only (N2: no silent total-outage pass)", () => {
    const result = runScript(["--diff-file", resolve(FIXTURES_DIR, "sample.diff"), "--advisory-only"], {
      QUAD_CLI_MOCK_DIR: resolve(FIXTURES_DIR, "mock-responses-empty"),
    });
    assert.equal(result.code, 3);
  });

  it("zero valid reviewers exits 0 with status no-reviewers when --allow-zero-reviewers is set", () => {
    const result = runScript(
      ["--diff-file", resolve(FIXTURES_DIR, "sample.diff"), "--advisory-only", "--allow-zero-reviewers"],
      { QUAD_CLI_MOCK_DIR: resolve(FIXTURES_DIR, "mock-responses-empty") }
    );
    assert.equal(result.code, 0);
    const report = JSON.parse(result.stdout);
    assert.equal(report.status, "no-reviewers");
    assert.equal(report.reviewers_effective, 0);
  });

  it("merged report's core finding fields validate against schemas/quad-cli-report.json (via validateRawReport)", () => {
    const result = runScript(["--diff-file", resolve(FIXTURES_DIR, "sample.diff")], {
      QUAD_CLI_MOCK_DIR: MOCK_DIR,
    });
    const report = JSON.parse(result.stdout);
    // The raw schema models a single reviewer's report (no blocking/contributors/families),
    // so validate the shared base shape (schema_version/generated_by + core finding fields)
    // using the orchestrator's own schema validator rather than pulling in a new JSON Schema
    // dependency.
    const baseFindingKeys = ["path", "rule_id", "severity", "message", "line", "snippet"];
    for (const finding of report.findings) {
      const baseFinding = Object.fromEntries(
        baseFindingKeys.filter((key) => key in finding).map((key) => [key, finding[key]])
      );
      const validation = validateRawReport({
        schema_version: report.schema_version,
        generated_by: report.generated_by,
        findings: [baseFinding],
      });
      assert.equal(validation.ok, true, `finding failed schema validation: ${JSON.stringify(finding)}`);
    }
  });
});

describe("B1 regression: hunk anchoring replaces fixed-width line buckets", () => {
  const diffBody = [
    "diff --git a/src/a.js b/src/a.js",
    "@@ -10,3 +10,6 @@",
    " context",
    "+added one",
    "+added two",
    " context",
    "diff --git a/src/b.js b/src/b.js",
    "@@ -50,2 +50,2 @@",
    " context",
    " context",
  ].join("\n");

  it("buildHunkIndex captures the changed-line range per hunk", () => {
    const index = buildHunkIndex(diffBody);
    assert.deepEqual(index.get("src/a.js"), [{ start: 10, end: 15, id: "src/a.js@10,6" }]);
    assert.equal(findHunkId(index, "src/a.js", 12), "src/a.js@10,6");
    assert.equal(findHunkId(index, "src/a.js", 9), null, "line just before the hunk must not match");
    assert.equal(findHunkId(index, "src/a.js", 16), null, "line just after the hunk must not match");
  });

  it("two findings that straddle the old bucket boundary but share one hunk ARE merged and CAN block", () => {
    // Old Math.round(line/3)*3 bucket logic put line 11 in bucket 12 and line 13 in bucket
    // 12 too by coincidence, but line 10 -> bucket 9 vs line 11 -> bucket 12 would have
    // missed a real agreement. With hunk anchoring both land in the same real hunk (10-15).
    const hunkIndex = buildHunkIndex(diffBody);
    const ruleAliases = loadRuleAliases();
    const backendFamilies = loadBackendFamilies();
    const findings = [
      { path: "a/src/a.js", rule_id: "x", severity: "major", message: "m1", line: 11, source_cli: "claude" },
      { path: "b/src/a.js", rule_id: "x", severity: "major", message: "m2", line: 13, source_cli: "codex" },
    ];

    const merged = mergeFindings(findings, ruleAliases, hunkIndex, backendFamilies);
    assert.equal(merged.length, 1, "same-hunk findings must merge into a single entry");
    assert.equal(merged[0].blocking, true);
    assert.equal(merged[0].effective_votes, 2);
  });

  it("two unrelated same-rule findings with NO line are never merged and never block", () => {
    const hunkIndex = buildHunkIndex(diffBody);
    const ruleAliases = loadRuleAliases();
    const backendFamilies = loadBackendFamilies();
    const findings = [
      { path: "a/src/a.js", rule_id: "x", severity: "critical", message: "unrelated issue 1", source_cli: "claude" },
      { path: "a/src/a.js", rule_id: "x", severity: "critical", message: "unrelated issue 2", source_cli: "codex" },
    ];

    const merged = mergeFindings(findings, ruleAliases, hunkIndex, backendFamilies);
    assert.equal(merged.length, 2, "unanchored findings must never be collapsed into one entry");
    for (const finding of merged) {
      assert.equal(finding.blocking, false, "unanchored findings must never be blocking");
    }
  });

  it("a finding whose line falls outside every changed hunk is advisory-only even with 2 CLIs agreeing on path+rule+line", () => {
    const hunkIndex = buildHunkIndex(diffBody);
    const ruleAliases = loadRuleAliases();
    const backendFamilies = loadBackendFamilies();
    const findings = [
      { path: "a/src/a.js", rule_id: "x", severity: "major", message: "out of range", line: 999, source_cli: "claude" },
      { path: "a/src/a.js", rule_id: "x", severity: "major", message: "out of range", line: 999, source_cli: "codex" },
    ];

    const merged = mergeFindings(findings, ruleAliases, hunkIndex, backendFamilies);
    for (const finding of merged) {
      assert.equal(finding.blocking, false, "findings outside every changed hunk must stay advisory");
    }
  });

  it("same-family CLIs (e.g. claude + agy, both default to anthropic-claude) count as ONE vote (B2)", () => {
    const hunkIndex = buildHunkIndex(diffBody);
    const ruleAliases = loadRuleAliases();
    const backendFamilies = loadBackendFamilies();
    const findings = [
      { path: "a/src/a.js", rule_id: "x", severity: "major", message: "m", line: 11, source_cli: "claude" },
      { path: "b/src/a.js", rule_id: "x", severity: "major", message: "m", line: 12, source_cli: "agy" },
    ];

    const merged = mergeFindings(findings, ruleAliases, hunkIndex, backendFamilies);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].effective_votes, 1, "claude and agy share the anthropic-claude family by default");
    assert.equal(merged[0].blocking, false, "1 effective vote must not be blocking");
  });
});

describe("normalizePath", () => {
  it("normalizes backslashes and strips a/ b/ diff prefixes", () => {
    assert.equal(normalizePath("a/src\\routes\\user.js"), "src/routes/user.js");
    assert.equal(normalizePath("b/src/utils/logger.js"), "src/utils/logger.js");
    assert.equal(normalizePath("./src/x.js"), "src/x.js");
  });
});

describe("createReport", () => {
  it("omits status/reviewers_effective when not provided (backward compatible shape)", () => {
    const report = createReport([]);
    assert.ok(!("status" in report));
    assert.ok(!("reviewers_effective" in report));
  });
});
