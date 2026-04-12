#!/usr/bin/env node

/**
 * Validates agent, skill, and rule markdown files, plus MCP JSON configs.
 * Exit code 0 = all valid, 1 = errors found.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

let errors = 0;
let warnings = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectFiles(dir, ext = ".md") {
  const results = [];
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && extname(entry.name) === ext && entry.name !== "README.md") {
      results.push(join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      fields[key] = value;
    }
  }
  return fields;
}

function report(level, file, message) {
  const rel = file.replace(ROOT, "").replace(/^[\\/]/, "");
  if (level === "error") {
    errors++;
    console.error(`  ❌  [${rel}] ${message}`);
  } else {
    warnings++;
    console.warn(`  ⚠️  [${rel}] ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

function validateAgents() {
  console.log("\n📋  Validating agents/");
  const dir = join(ROOT, "agents");
  const files = collectFiles(dir);
  if (files.length === 0) {
    console.log("   (no agent files found)");
    return;
  }

  const validTypes = ["explore", "task", "general-purpose", "code-review"];
  const names = new Set();

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      report("error", file, "Missing YAML frontmatter (---...---)");
      continue;
    }
    for (const field of ["name", "description", "agent_type"]) {
      if (!fm[field]) report("error", file, `Missing required field: ${field}`);
    }
    if (fm.agent_type && !validTypes.includes(fm.agent_type)) {
      report("error", file, `Invalid agent_type "${fm.agent_type}". Must be one of: ${validTypes.join(", ")}`);
    }
    if (fm.name) {
      if (names.has(fm.name)) report("error", file, `Duplicate agent name: "${fm.name}"`);
      names.add(fm.name);
    }
  }
  console.log(`   Found ${files.length} agent(s)`);
}

function validateSkills() {
  console.log("\n📋  Validating skills/");
  const dir = join(ROOT, "skills");
  const files = collectFiles(dir);
  if (files.length === 0) {
    console.log("   (no skill files found)");
    return;
  }

  const validCategories = [
    "development", "testing", "security", "documentation", "copilot-exclusive",
    "workflow", "product", "content",
  ];
  const names = new Set();

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      report("error", file, "Missing YAML frontmatter (---...---)");
      continue;
    }
    for (const field of ["name", "description"]) {
      if (!fm[field]) report("error", file, `Missing required field: ${field}`);
    }
    // Category can be at top-level OR nested under metadata: (agentskills.io spec)
    const category = fm.category || fm["  category"];
    if (!category) {
      report("error", file, `Missing required field: metadata.category (known categories: ${validCategories.join(", ")})`);
    } else if (!validCategories.includes(category)) {
      report("error", file, `Unrecognized category "${category}". Known: ${validCategories.join(", ")}`);
    }
    if (fm.name) {
      if (names.has(fm.name)) report("error", file, `Duplicate skill name: "${fm.name}"`);
      names.add(fm.name);
    }
  }
  console.log(`   Found ${files.length} skill(s)`);
}

function validateRules() {
  console.log("\n📋  Validating rules/");
  const dir = join(ROOT, "rules");
  const files = collectFiles(dir);
  if (files.length === 0) {
    console.log("   (no rule files found)");
    return;
  }
  for (const file of files) {
    const content = readFileSync(file, "utf-8").trim();
    if (content.length === 0) {
      report("error", file, "Rule file is empty");
    }
  }
  console.log(`   Found ${files.length} rule(s)`);
}

function validateMcpConfigs() {
  console.log("\n📋  Validating mcp-configs/");
  const dir = join(ROOT, "mcp-configs");
  const files = collectFiles(dir, ".json");
  if (files.length === 0) {
    console.log("   (no MCP config files found)");
    return;
  }
  for (const file of files) {
    try {
      JSON.parse(readFileSync(file, "utf-8"));
    } catch (e) {
      report("error", file, `Invalid JSON: ${e.message}`);
    }
  }
  console.log(`   Found ${files.length} config(s)`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

console.log("🔍  Validating everything-copilot-cli configuration...");

validateAgents();
validateSkills();
validateRules();
validateMcpConfigs();

console.log("\n" + "─".repeat(50));
if (errors > 0) {
  console.error(`\n💥  ${errors} error(s), ${warnings} warning(s). Validation FAILED.\n`);
  process.exit(1);
} else {
  console.log(`\n✅  All checks passed (${warnings} warning(s)).\n`);
}
