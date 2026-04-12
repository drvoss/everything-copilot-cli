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
    assert.match(
      result.stdout,
      /npm run setup -- --target <path-to-project> --profile recommended/
    );
  });

  it("should install the minimal profile into .github/copilot-instructions.md", () => {
    const target = mkdtempSync(join(tmpdir(), "everything-copilot-cli-minimal-"));

    try {
      const result = runSetup({
        cwd: ROOT,
        args: ["--target", target, "--profile", "minimal"],
      });

      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(target, ".github", "copilot-instructions.md")));
      assert.ok(!existsSync(join(target, "COPILOT-INSTRUCTIONS.md")));
      assert.ok(!existsSync(join(target, ".github", "copilot", "agents")));
      assert.match(result.stdout, /Profile: minimal/);
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });

  it("should install the recommended profile with agents, skills, and rules", () => {
    const target = mkdtempSync(join(tmpdir(), "everything-copilot-cli-recommended-"));

    try {
      const result = runSetup({
        cwd: ROOT,
        args: ["--target", target, "--profile", "recommended"],
      });

      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(target, ".github", "copilot-instructions.md")));
      assert.ok(existsSync(join(target, ".github", "copilot", "agents")));
      assert.ok(existsSync(join(target, ".github", "copilot", "skills")));
      assert.ok(existsSync(join(target, ".github", "copilot", "rules")));
      assert.ok(!existsSync(join(target, ".github", "copilot", "contexts")));
      assert.match(result.stdout, /Profile: recommended/);
      assert.match(result.stdout, /Copilot reads this automatically on every session\./);
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });

  it("should install every component when using --all", () => {
    const target = mkdtempSync(join(tmpdir(), "everything-copilot-cli-full-"));

    try {
      const result = runSetup({
        cwd: ROOT,
        args: ["--target", target, "--all"],
      });

      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(target, ".github", "copilot-instructions.md")));
      assert.ok(existsSync(join(target, ".github", "copilot", "agents")));
      assert.ok(existsSync(join(target, ".github", "copilot", "skills")));
      assert.ok(existsSync(join(target, ".github", "copilot", "rules")));
      assert.ok(existsSync(join(target, ".github", "copilot", "contexts")));
      assert.match(result.stdout, /Profile: full/);
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });
});
