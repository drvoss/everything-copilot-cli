import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const SCRIPT = resolve(ROOT, "scripts", "quad-cli-smoke.mjs");
const TOOLS = ["claude", "codex", "cursor-agent", "agy"];
const VALID_RESPONSE = JSON.stringify({
  schema_version: "1",
  generated_by: "quad-cli-orchestrate",
  findings: [],
});

function withMockReviewers(missingTool, callback) {
  const tempDir = mkdtempSync(join(tmpdir(), "quad-cli-smoke-test-"));
  const mockDir = join(tempDir, "mocks");
  mkdirSync(mockDir);
  try {
    for (const tool of TOOLS) {
      if (tool !== missingTool) writeFileSync(join(mockDir, `${tool}.json`), VALID_RESPONSE, "utf8");
    }
    callback(mockDir);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function runSmoke(args, mockDir) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, QUAD_CLI_MOCK_DIR: mockDir },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("quad CLI live smoke wrapper (mock reviewers)", () => {
  it("smoke:quad exits 0 when all four reviewers are valid", () => {
    withMockReviewers(null, (mockDir) => {
      const result = runSmoke([], mockDir);
      assert.equal(result.code, 0);
      assert.deepEqual(JSON.parse(result.stdout).reviewers.effective, TOOLS);
    });
  });

  it("smoke:quad exits 1 and names a missing reviewer", () => {
    withMockReviewers("agy", (mockDir) => {
      const result = runSmoke([], mockDir);
      assert.equal(result.code, 1);
      assert.match(`${result.stdout}\n${result.stderr}`, /agy/);
    });
  });

  it("smoke:quad:available exits 4 with degraded status and a missing-reviewer list", () => {
    withMockReviewers("cursor-agent", (mockDir) => {
      const result = runSmoke(["--available"], mockDir);
      assert.equal(result.code, 4);
      assert.match(result.stderr, /status="degraded"/);
      assert.match(`${result.stdout}\n${result.stderr}`, /cursor-agent/);
    });
  });

  it("smoke:quad:available exits 0 when all four reviewers are valid", () => {
    withMockReviewers(null, (mockDir) => {
      const result = runSmoke(["--available"], mockDir);
      assert.equal(result.code, 0);
    });
  });
});
