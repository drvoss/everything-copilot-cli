#!/usr/bin/env node

/**
 * Migration tool: converts a Claude Code project setup into Copilot CLI format.
 *
 * Reads:
 *   - CLAUDE.md → generates copilot-instructions.md
 *   - .claude/ directory → scans for settings
 *   - Claude Code hooks → maps to Copilot equivalents
 *
 * Outputs a migration report with any unsupported features flagged.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  cpSync,
  statSync,
} from "node:fs";
import { join, resolve, extname, basename } from "node:path";

const TARGET = process.argv[2] ? resolve(process.argv[2]) : process.cwd();
const OUTPUT = join(TARGET, ".github", "copilot");

const report = { converted: [], warnings: [], skipped: [] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, "utf-8");
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// CLAUDE.md → COPILOT-INSTRUCTIONS.md
// ---------------------------------------------------------------------------

function migrateInstructions() {
  const candidates = ["CLAUDE.md", "claude.md", ".claude/instructions.md"];
  let source = null;
  let sourcePath = null;

  for (const candidate of candidates) {
    const full = join(TARGET, candidate);
    const content = readIfExists(full);
    if (content) {
      source = content;
      sourcePath = candidate;
      break;
    }
  }

  if (!source) {
    report.skipped.push("No CLAUDE.md or .claude/instructions.md found — skipping instructions migration.");
    return;
  }

  // Transform Claude-specific language to Copilot-equivalent
  let transformed = source;

  // Replace Claude-specific terminology
  const replacements = [
    [/\bClaude\b/g, "Copilot CLI"],
    [/\bclaude\b/g, "copilot"],
    [/\bAnthropic\b/gi, "GitHub"],
    [/\bsonnet\b/gi, "the configured model"],
    [/\bopus\b/gi, "a premium model"],
    [/\bhaiku\b/gi, "a fast model"],
  ];

  for (const [pattern, replacement] of replacements) {
    transformed = transformed.replace(pattern, replacement);
  }

  // Add header
  const header = `# Copilot Instructions\n\n> Migrated from ${sourcePath} by migrate-from-claude.js\n\n`;
  transformed = header + transformed;

  const destPath = join(TARGET, "COPILOT-INSTRUCTIONS.md");
  if (existsSync(destPath)) {
    report.warnings.push("COPILOT-INSTRUCTIONS.md already exists — writing to COPILOT-INSTRUCTIONS.migrated.md instead.");
    writeFileSync(join(TARGET, "COPILOT-INSTRUCTIONS.migrated.md"), transformed, "utf-8");
  } else {
    writeFileSync(destPath, transformed, "utf-8");
  }
  report.converted.push(`${sourcePath} → COPILOT-INSTRUCTIONS.md`);
}

// ---------------------------------------------------------------------------
// .claude/ settings scan
// ---------------------------------------------------------------------------

function migrateSettings() {
  const claudeDir = join(TARGET, ".claude");
  if (!existsSync(claudeDir) || !statSync(claudeDir).isDirectory()) {
    report.skipped.push("No .claude/ directory found — skipping settings migration.");
    return;
  }

  const entries = readdirSync(claudeDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(claudeDir, entry.name);

    if (entry.name === "settings.json") {
      const settings = JSON.parse(readFileSync(fullPath, "utf-8"));
      report.warnings.push(
        `Found .claude/settings.json with ${Object.keys(settings).length} key(s). ` +
        "Review manually — Copilot CLI uses COPILOT-INSTRUCTIONS.md and agent files instead."
      );
      continue;
    }

    if (entry.name === "hooks" || entry.name === "hooks.json") {
      migrateHooks(fullPath, entry);
      continue;
    }

    // Copy markdown files that might be useful as skills or context
    if (entry.isFile() && extname(entry.name) === ".md" && entry.name !== "instructions.md") {
      ensureDir(join(OUTPUT, "migrated"));
      cpSync(fullPath, join(OUTPUT, "migrated", entry.name));
      report.converted.push(`.claude/${entry.name} → .github/copilot/migrated/${entry.name}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Hooks migration
// ---------------------------------------------------------------------------

function migrateHooks(hookPath, entry) {
  const hookMapping = {
    "pre-commit": "Supported — use git hooks or CI instead",
    "post-commit": "Supported — use git hooks or CI instead",
    "pre-push": "Supported — use git hooks or CI instead",
    "on-file-change": "⚠️ Not directly supported — use task agents with file watchers",
    "on-error": "⚠️ Not directly supported — use error-handling skills instead",
    "before-tool-call": "⚠️ Not supported — Copilot CLI handles tool calls internally",
    "after-tool-call": "⚠️ Not supported — Copilot CLI handles tool calls internally",
  };

  let hooks;
  try {
    if (entry.isFile()) {
      hooks = JSON.parse(readFileSync(hookPath, "utf-8"));
    } else if (entry.isDirectory()) {
      hooks = {};
      for (const f of readdirSync(hookPath)) {
        hooks[basename(f, extname(f))] = readIfExists(join(hookPath, f));
      }
    }
  } catch {
    report.warnings.push("Could not parse hooks configuration — skipping.");
    return;
  }

  if (!hooks) return;

  for (const hookName of Object.keys(hooks)) {
    const mapping = hookMapping[hookName];
    if (mapping) {
      report.warnings.push(`Hook "${hookName}": ${mapping}`);
    } else {
      report.warnings.push(`Hook "${hookName}": Unknown hook — review manually.`);
    }
  }
  report.converted.push("Hooks reviewed and mapped (see warnings)");
}

// ---------------------------------------------------------------------------
// Compatible skills
// ---------------------------------------------------------------------------

function migrateSkills() {
  const skillsDirs = [
    join(TARGET, ".claude", "skills"),
    join(TARGET, ".claude", "commands"),
  ];

  for (const dir of skillsDirs) {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;

    const files = readdirSync(dir, { withFileTypes: true, recursive: true });
    ensureDir(join(OUTPUT, "skills", "migrated"));

    for (const file of files) {
      if (!file.isFile() || extname(file.name) !== ".md") continue;
      const src = join(file.parentPath ?? file.path, file.name);
      let content = readFileSync(src, "utf-8");

      // Add frontmatter if missing
      if (!content.startsWith("---")) {
        const name = basename(file.name, ".md");
        const frontmatter = `---\nname: ${name}\ndescription: Migrated from Claude Code\ncategory: development\n---\n\n`;
        content = frontmatter + content;
      }

      const dest = join(OUTPUT, "skills", "migrated", file.name);
      writeFileSync(dest, content, "utf-8");
      report.converted.push(`Skill: ${file.name} → .github/copilot/skills/migrated/${file.name}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("\n🔄  Migrating Claude Code configuration to Copilot CLI...\n");
  console.log(`   Source: ${TARGET}\n`);

  migrateInstructions();
  migrateSettings();
  migrateSkills();

  // Print report
  console.log("─".repeat(50));
  console.log("\n📊  Migration Report\n");

  if (report.converted.length > 0) {
    console.log("✅  Converted:");
    for (const item of report.converted) console.log(`   • ${item}`);
  }

  if (report.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const item of report.warnings) console.log(`   • ${item}`);
  }

  if (report.skipped.length > 0) {
    console.log("\n⏭️  Skipped:");
    for (const item of report.skipped) console.log(`   • ${item}`);
  }

  const total = report.converted.length + report.warnings.length + report.skipped.length;
  if (total === 0) {
    console.log("   No Claude Code configuration found to migrate.");
  }

  console.log("\n" + "─".repeat(50));
  console.log("✨  Migration complete. Review the output and adjust as needed.\n");
}

main();
