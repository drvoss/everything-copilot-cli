import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve, basename, dirname, posix as pathPosix } from "node:path";
import {
  VALID_SKILL_CATEGORIES,
  getNonStringMetadataEntries,
  getSkillCategory,
  parseFrontmatter,
} from "../scripts/skill-metadata.js";

const ROOT = resolve(import.meta.dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");
const README_PATH = join(SKILLS_DIR, "README.md");

function collectMarkdownFiles(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && extname(entry.name) === ".md" && entry.name !== "README.md") {
      results.push(join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return results;
}

const skillFiles = collectMarkdownFiles(SKILLS_DIR);

describe("skills/ validation", () => {
  it("should contain at least one skill file", () => {
    assert.ok(skillFiles.length > 0, "No .md files found in skills/");
  });

  for (const file of skillFiles) {
    const filename = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");

    it(`${filename} should be valid markdown with frontmatter`, () => {
      const content = readFileSync(file, "utf-8");
      assert.ok(content.length > 0, "File is empty");
      const fm = parseFrontmatter(content);
      assert.ok(fm, "Missing YAML frontmatter (---...---)");
    });

    it(`${filename} should have required fields (name, description)`, () => {
      const content = readFileSync(file, "utf-8");
      const fm = parseFrontmatter(content);
      assert.ok(fm, "No frontmatter");
      assert.ok(fm.name, 'Missing "name" field');
      assert.ok(fm.description, 'Missing "description" field');
    });

    it(`${filename} should have a valid category`, () => {
      const content = readFileSync(file, "utf-8");
      const category = getSkillCategory(content);
      assert.ok(category, "No category (set at top-level or under metadata.category)");
      assert.ok(
        VALID_SKILL_CATEGORIES.includes(category),
        `Invalid category "${category}". Must be one of: ${VALID_SKILL_CATEGORIES.join(", ")}`
      );
    });

    it(`${filename} name should match its directory name`, () => {
      const content = readFileSync(file, "utf-8");
      const fm = parseFrontmatter(content);
      const dirName = basename(dirname(file));
      assert.equal(
        fm?.name,
        dirName,
        `frontmatter name "${fm?.name}" must equal directory name "${dirName}"`
      );
    });

    it(`${filename} category should match its parent folder`, () => {
      const content = readFileSync(file, "utf-8");
      const category = getSkillCategory(content);
      const folderName = basename(dirname(dirname(file)));
      assert.equal(
        category,
        folderName,
        `category "${category}" must equal parent folder "${folderName}"`
      );
    });
  }

  it("should have no duplicate skill names", () => {
    const names = [];
    for (const file of skillFiles) {
      const fm = parseFrontmatter(readFileSync(file, "utf-8"));
      if (fm?.name) names.push(fm.name);
    }
    const unique = new Set(names);
    assert.equal(
      names.length,
      unique.size,
      `Duplicate names found: ${names.filter((n, i) => names.indexOf(n) !== i).join(", ")}`
    );
  });
});

describe("skills/README.md catalog", () => {
  const readmeContent = readFileSync(README_PATH, "utf-8");

  // e.g. skills/README.md linking to `category/skill-name/SKILL.md`
  const linkPattern = /\(([\w-]+\/[\w-]+\/SKILL\.md)\)/g;
  const linkedPaths = new Set(
    [...readmeContent.matchAll(linkPattern)].map((m) => m[1])
  );

  // Path on disk relative to skills/, using posix separators for comparison.
  const diskPaths = new Set(
    skillFiles.map((file) =>
      file
        .slice(SKILLS_DIR.length + 1)
        .split(/[\\/]/)
        .join(pathPosix.sep)
    )
  );

  it("should link at least one skill", () => {
    assert.ok(linkedPaths.size > 0, "No SKILL.md links found in skills/README.md");
  });

  for (const linkedPath of linkedPaths) {
    it(`linked catalog entry ${linkedPath} should exist on disk`, () => {
      assert.ok(
        diskPaths.has(linkedPath),
        `skills/README.md links to "${linkedPath}" but no such SKILL.md exists on disk`
      );
    });
  }

  for (const diskPath of diskPaths) {
    it(`${diskPath} should be listed in skills/README.md catalog`, () => {
      assert.ok(
        linkedPaths.has(diskPath),
        `${diskPath} exists on disk but is not linked anywhere in skills/README.md`
      );
    });
  }
});

describe("metadata values", () => {
  for (const [fixture, expectedType] of [
    ["metadata-array.md", "array"],
    ["metadata-object.md", "object"],
    ["metadata-boolean.md", "boolean"],
    ["metadata-number.md", "number"],
  ]) {
    it(`rejects ${expectedType} metadata values`, () => {
      const content = readFileSync(join(ROOT, "tests", "fixtures", fixture), "utf-8");
      assert.deepEqual(getNonStringMetadataEntries(content), [
        { key: "invalid", type: expectedType },
      ]);
    });
  }

  it("accepts quoted scalar metadata values", () => {
    const content = `---\nname: valid\ndescription: valid fixture\nmetadata:\n  category: testing\n  literal: "[]"\n---`;
    assert.deepEqual(getNonStringMetadataEntries(content), []);
  });
});
