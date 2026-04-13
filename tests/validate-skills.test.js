import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { VALID_SKILL_CATEGORIES, getSkillCategory, parseFrontmatter } from "../scripts/skill-metadata.js";

const ROOT = resolve(import.meta.dirname, "..");
const SKILLS_DIR = join(ROOT, "skills");

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
