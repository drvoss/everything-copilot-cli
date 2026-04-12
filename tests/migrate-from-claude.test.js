import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const MIGRATE_SCRIPT = join(ROOT, "scripts", "migrate-from-claude.js");

function runMigrate(target) {
  return spawnSync(process.execPath, [MIGRATE_SCRIPT, target], {
    cwd: ROOT,
    encoding: "utf-8",
  });
}

describe("migrate-from-claude script", () => {
  it("should migrate instructions and skills into Copilot CLI locations", () => {
    const target = mkdtempSync(join(tmpdir(), "everything-copilot-cli-migrate-"));

    try {
      mkdirSync(join(target, ".claude", "skills"), { recursive: true });
      writeFileSync(
        join(target, "CLAUDE.md"),
        "# Claude Instructions\n\nUse Claude for this project.\n",
        "utf-8"
      );
      writeFileSync(
        join(target, ".claude", "skills", "legacy-checklist.md"),
        "Legacy skill body\n",
        "utf-8"
      );

      const result = runMigrate(target);

      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(target, ".github", "copilot-instructions.md")));
      assert.ok(!existsSync(join(target, "COPILOT-INSTRUCTIONS.md")));
      assert.ok(existsSync(join(target, ".github", "skills", "legacy-checklist", "SKILL.md")));
      assert.ok(!existsSync(join(target, ".github", "copilot", "skills", "migrated", "legacy-checklist.md")));
      assert.match(result.stdout, /\.github\/copilot-instructions\.md/);
      assert.match(result.stdout, /\.github\/skills\/legacy-checklist\/SKILL\.md/);

      const migrated = readFileSync(
        join(target, ".github", "copilot-instructions.md"),
        "utf-8"
      );
      assert.match(migrated, /Migrated from CLAUDE\.md/);
      assert.match(migrated, /Copilot CLI/);

      const migratedSkill = readFileSync(
        join(target, ".github", "skills", "legacy-checklist", "SKILL.md"),
        "utf-8"
      );
      assert.match(migratedSkill, /name: legacy-checklist/);
      assert.match(migratedSkill, /Legacy skill body/);
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });
});
