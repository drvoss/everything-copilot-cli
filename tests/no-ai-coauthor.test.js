import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve, relative } from "node:path";

// Project policy: commits in this repository carry no AI co-author, and the repository's own
// content must not teach or show one. This test fails if any text file mentions the
// co-author trailer at all or contains the Copilot bot account id, so the guidance cannot creep back in
// through a new skill, rule, or example. The literals are split so this file does not match.

const ROOT = resolve(import.meta.dirname, "..");
const EXCLUDED_DIR_NAMES = new Set(["node_modules", "_tmp", ".git"]);
const TRAILER = new RegExp("co-" + "authored-by", "i");
const COPILOT_ACCOUNT_ID = "2235" + "56219";

// Every file, whatever its extension (LICENSE, .gitignore, fixtures); binary files are skipped
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("no AI co-author guidance", () => {
  const offenders = [];
  for (const file of collectFiles(ROOT)) {
    const bytes = readFileSync(file);
    if (bytes.subarray(0, 8192).includes(0)) continue;
    const text = bytes.toString("utf8");
    if (TRAILER.test(text) || text.includes(COPILOT_ACCOUNT_ID)) {
      offenders.push(relative(ROOT, file).replace(/\\/g, "/"));
    }
  }

  it("no file mentions the co-author trailer or contains the Copilot account id", () => {
    assert.deepEqual(offenders, [], `remove co-author guidance from: ${offenders.join(", ")}`);
  });
});
