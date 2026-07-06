import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const RULES_DIR = join(ROOT, "rules");
const COMMON_DIR = join(RULES_DIR, "common");

const EXPECTED_COMMON_FILES = [
  "coding-style.md",
  "error-handling.md",
  "git-workflow.md",
  "security.md",
  "supply-chain-security.md",
  "testing.md",
];

function collectMarkdownFiles(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && extname(entry.name) === ".md") {
      results.push(join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return results;
}

const ruleFiles = collectMarkdownFiles(RULES_DIR);

describe("rules/ validation", () => {
  it("should contain at least one rule file", () => {
    assert.ok(ruleFiles.length > 0, "No .md files found in rules/");
  });

  for (const file of ruleFiles) {
    const filename = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");

    it(`${filename} should be valid non-empty markdown`, () => {
      const content = readFileSync(file, "utf-8").trim();
      assert.ok(content.length > 0, "Rule file is empty");
    });
  }

  it("rules/common/ should have all required files", () => {
    assert.ok(
      statSync(COMMON_DIR, { throwIfNoEntry: false })?.isDirectory(),
      "rules/common/ directory does not exist"
    );
    const existing = readdirSync(COMMON_DIR).filter((f) => extname(f) === ".md");
    for (const expected of EXPECTED_COMMON_FILES) {
      assert.ok(
        existing.includes(expected),
        `Missing required common rule: ${expected}`
      );
    }
  });
});
