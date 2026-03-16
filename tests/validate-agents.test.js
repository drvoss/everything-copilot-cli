import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const AGENTS_DIR = join(ROOT, "agents");
const VALID_TYPES = ["explore", "task", "general-purpose", "code-review"];

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return fields;
}

function collectMarkdownFiles(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && extname(e.name) === ".md")
    .map((e) => join(dir, e.name));
}

const agentFiles = collectMarkdownFiles(AGENTS_DIR);

describe("agents/ validation", () => {
  it("should contain at least one agent file", () => {
    assert.ok(agentFiles.length > 0, "No .md files found in agents/");
  });

  for (const file of agentFiles) {
    const filename = file.replace(ROOT + "\\", "").replace(ROOT + "/", "");

    it(`${filename} should be valid markdown with frontmatter`, () => {
      const content = readFileSync(file, "utf-8");
      assert.ok(content.length > 0, "File is empty");
      const fm = parseFrontmatter(content);
      assert.ok(fm, "Missing YAML frontmatter (---...---)");
    });

    it(`${filename} should have required fields (name, description, agent_type)`, () => {
      const content = readFileSync(file, "utf-8");
      const fm = parseFrontmatter(content);
      assert.ok(fm, "No frontmatter");
      assert.ok(fm.name, 'Missing "name" field');
      assert.ok(fm.description, 'Missing "description" field');
      assert.ok(fm.agent_type, 'Missing "agent_type" field');
    });

    it(`${filename} should have a valid agent_type`, () => {
      const content = readFileSync(file, "utf-8");
      const fm = parseFrontmatter(content);
      assert.ok(fm?.agent_type, "No agent_type");
      assert.ok(
        VALID_TYPES.includes(fm.agent_type),
        `Invalid agent_type "${fm.agent_type}". Must be one of: ${VALID_TYPES.join(", ")}`
      );
    });
  }

  it("should have no duplicate agent names", () => {
    const names = [];
    for (const file of agentFiles) {
      const fm = parseFrontmatter(readFileSync(file, "utf-8"));
      if (fm?.name) names.push(fm.name);
    }
    const unique = new Set(names);
    assert.equal(names.length, unique.size, `Duplicate names found: ${names.filter((n, i) => names.indexOf(n) !== i).join(", ")}`);
  });
});
