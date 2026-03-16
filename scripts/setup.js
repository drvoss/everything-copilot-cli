#!/usr/bin/env node

/**
 * Setup script for everything-copilot-cli.
 * Copies selected components into the user's project.
 */

import { existsSync, mkdirSync, cpSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";

const ROOT = resolve(import.meta.dirname, "..");
const TARGET = process.cwd();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function checkPrerequisites() {
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 18) {
    console.error("❌  Node.js 18+ is required. Current:", process.version);
    process.exit(1);
  }
  console.log("✅  Node.js", process.version);
}

function prompt(rl, question) {
  return new Promise((res) => rl.question(question, res));
}

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.warn(`⚠️  Source not found, skipping: ${src}`);
    return 0;
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  const count = readdirSync(dest, { recursive: true }).length;
  return count;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🚀  everything-copilot-cli setup\n");
  checkPrerequisites();

  if (resolve(TARGET) === resolve(ROOT)) {
    console.error("❌  Run this script from your project directory, not from the repo itself.");
    process.exit(1);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  // Copy copilot-instructions.md
  const copySample = await prompt(
    rl,
    "\n📄  Copy sample COPILOT-INSTRUCTIONS.md to your project? (y/N) "
  );
  if (copySample.toLowerCase() === "y") {
    const src = join(ROOT, "COPILOT-INSTRUCTIONS.md");
    const dest = join(TARGET, "COPILOT-INSTRUCTIONS.md");
    if (existsSync(dest)) {
      console.log("   ⚠️  COPILOT-INSTRUCTIONS.md already exists, skipping.");
    } else if (existsSync(src)) {
      cpSync(src, dest);
      console.log("   ✅  Copied COPILOT-INSTRUCTIONS.md");
    }
  }

  // Component selection
  const components = [
    { name: "agents", dir: "agents" },
    { name: "skills", dir: "skills" },
    { name: "rules", dir: "rules" },
    { name: "contexts", dir: "contexts" },
  ];

  const copilotDir = join(TARGET, ".github", "copilot");

  for (const comp of components) {
    const answer = await prompt(rl, `📦  Install ${comp.name}? (y/N) `);
    if (answer.toLowerCase() === "y") {
      const src = join(ROOT, comp.dir);
      const dest = join(copilotDir, comp.dir);
      const count = copyDir(src, dest);
      console.log(`   ✅  Copied ${count} ${comp.name} files → ${dest}`);
    }
  }

  rl.close();

  // Summary
  console.log("\n" + "─".repeat(50));
  console.log("✨  Setup complete!\n");
  console.log("Next steps:");
  console.log("  1. Edit COPILOT-INSTRUCTIONS.md for your project");
  console.log("  2. Review copied agents/skills/rules and customize");
  console.log("  3. Run: npx copilot  (to start using Copilot CLI)");
  console.log("");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
