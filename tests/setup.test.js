import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const SETUP_SCRIPT = join(ROOT, "scripts", "setup.js");

function runSetup({ cwd, args = [], input = "" } = {}) {
  return spawnSync(process.execPath, [SETUP_SCRIPT, ...args], {
    cwd,
    input,
    encoding: "utf-8",
  });
}

describe("setup script", () => {
  it("should verify the cloned repository when run from the repo root", () => {
    const result = runSetup({ cwd: ROOT });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Repository setup verified\./);
    assert.match(result.stdout, /Run: npm test/);
    assert.match(result.stdout, /npm run setup -- --target <path-to-project>/);
  });

  it("should install into a target project directory when --target is provided", () => {
    const target = mkdtempSync(join(tmpdir(), "everything-copilot-cli-setup-"));

    try {
      const result = runSetup({
        cwd: ROOT,
        args: ["--target", target, "--all"],
      });

      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(target, "COPILOT-INSTRUCTIONS.md")));
      assert.ok(existsSync(join(target, ".github", "copilot", "agents")));
      assert.match(result.stdout, /Setup complete!/);
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });
});
