import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";

// Lightweight, zero-dependency internal Markdown link checker. markdownlint (lint:md) does
// NOT validate that relative link targets actually exist -- that gap is exactly how several
// broken links (delegate-to-cursor.md, migration-from-gemini-cli.md, a stale
// delegate-to-gemini.md reference) shipped undetected in earlier rounds of this repo's
// history. This test closes that gap by resolving every relative Markdown link against the
// filesystem and failing if the target is missing.

const ROOT = resolve(import.meta.dirname, "..");
const EXCLUDED_DIR_NAMES = new Set(["node_modules", "_tmp", ".git"]);
const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function collectMarkdownFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && extname(entry.name) === ".md") {
      results.push(fullPath);
    }
  }
  return results;
}

function isExternalOrNonFileLink(target) {
  return (
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("mailto:") ||
    target.startsWith("#") || // in-page anchor only; anchor validation is out of scope here
    target.startsWith("//")
  );
}

function stripFencedCodeBlocks(content) {
  // Skip ``` fenced blocks (illustrative examples, e.g. templates showing sample link syntax
  // that isn't meant to resolve against this repository's actual files). Replace each block
  // with an equal number of blank lines so line numbers for reported errors elsewhere in the
  // file stay accurate.
  return content.replace(/```[\s\S]*?```/g, (block) => "\n".repeat((block.match(/\n/g) ?? []).length));
}

function findBrokenLinks(filePath) {
  const content = stripFencedCodeBlocks(readFileSync(filePath, "utf8"));
  const broken = [];
  let match;

  // Reset lastIndex since LINK_PATTERN is a shared module-level regex with the `g` flag.
  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(content)) !== null) {
    const rawTarget = match[1];
    if (isExternalOrNonFileLink(rawTarget)) continue;

    // Strip an in-file anchor fragment (e.g. "guide.md#section") before resolving the path;
    // this checker validates the FILE exists, not that the anchor/heading exists within it.
    const [pathPart] = rawTarget.split("#");
    if (!pathPart) continue; // pure "#anchor" links are covered by isExternalOrNonFileLink already

    const resolvedTarget = resolve(dirname(filePath), pathPart);
    if (!existsSync(resolvedTarget)) {
      const lineNumber = content.slice(0, match.index).split("\n").length;
      broken.push({ line: lineNumber, target: rawTarget });
    }
  }

  return broken;
}

const markdownFiles = collectMarkdownFiles(ROOT);

describe("internal Markdown link integrity", () => {
  it("should find at least one Markdown file to check", () => {
    assert.ok(markdownFiles.length > 0, "No .md files found under the repository root");
  });

  for (const file of markdownFiles) {
    const relativePath = file.slice(ROOT.length + 1).replace(/\\/g, "/");

    it(`${relativePath} should have no broken relative links`, () => {
      const broken = findBrokenLinks(file);
      assert.deepEqual(
        broken,
        [],
        broken
          .map((entry) => `${relativePath}:${entry.line} -> broken link target "${entry.target}"`)
          .join("\n")
      );
    });
  }
});
