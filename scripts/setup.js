#!/usr/bin/env node

/**
 * Setup script for everything-copilot-cli.
 * Verifies a cloned repo when run from the repo root, or copies selected
 * components into a target project when run from another directory.
 */

import {
  existsSync,
  mkdirSync,
  cpSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { createInterface } from "node:readline";

const ROOT = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);

function parseArgs(argv) {
  const parsed = {
    all: false,
    copyInstructions: false,
    help: false,
    target: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      return parsed;
    }

    if (arg === "--all") {
      parsed.all = true;
      parsed.copyInstructions = true;
      continue;
    }

    if (arg === "--copy-instructions") {
      parsed.copyInstructions = true;
      continue;
    }

    if (arg === "--target") {
      const value = argv[i + 1];
      if (!value) {
        console.error("❌  Missing value for --target");
        process.exit(1);
      }
      parsed.target = resolve(value);
      i++;
      continue;
    }

    if (arg.startsWith("--target=")) {
      const value = arg.slice("--target=".length);
      if (!value) {
        console.error("❌  Missing value for --target");
        process.exit(1);
      }
      parsed.target = resolve(value);
      continue;
    }

    console.error(`❌  Unknown argument: ${arg}`);
    process.exit(1);
  }

  return parsed;
}

const options = parseArgs(args);
const TARGET = options.target ?? process.cwd();

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

function printUsage() {
  console.log("Usage:");
  console.log("  npm run setup");
  console.log("  npm run setup -- --target <path-to-project>");
  console.log("  npm run setup -- --target <path-to-project> --all");
  console.log("");
  console.log("When run from the repo root, setup performs a quick repository verification.");
  console.log("When run with --target or from another directory, setup copies components");
  console.log("into the target project's .github\\copilot folder.");
  console.log("--all copies COPILOT-INSTRUCTIONS.md and all components without prompts.");
}

function verifyRequiredPaths(items, type) {
  let failures = 0;

  for (const item of items) {
    const path = join(ROOT, item);
    if (existsSync(path)) {
      console.log(`✅  Found ${type}: ${item}`);
    } else {
      console.error(`❌  Missing ${type}: ${item}`);
      failures++;
    }
  }

  return failures;
}

function verifyPackageScripts() {
  const packageJsonPath = join(ROOT, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const requiredScripts = ["setup", "test", "validate"];

  let failures = 0;
  for (const script of requiredScripts) {
    if (packageJson.scripts?.[script]) {
      console.log(`✅  package.json script present: ${script}`);
    } else {
      console.error(`❌  Missing package.json script: ${script}`);
      failures++;
    }
  }

  return failures;
}

function runRepoVerification() {
  console.log("🧪  Running repository verification\n");

  const requiredDirs = ["agents", "skills", "rules", "contexts", "scripts", "tests"];
  const requiredFiles = ["package.json", "COPILOT-INSTRUCTIONS.md", "README.md"];

  let failures = 0;
  failures += verifyRequiredPaths(requiredDirs, "directory");
  failures += verifyRequiredPaths(requiredFiles, "file");
  failures += verifyPackageScripts();

  if (failures > 0) {
    console.error(`\n❌  Repository setup verification failed (${failures} issue(s)).`);
    process.exit(1);
  }

  console.log("\n✅  Repository setup verified.");
  console.log("   Quick check passed for the documented clone + setup flow.\n");
  console.log("Next steps:");
  console.log("  1. Run: npm test");
  console.log("  2. Install into your project: npm run setup -- --target <path-to-project>");
  console.log("  3. In that project, run: copilot");
  console.log("");
}

function getTargetLabel() {
  return relative(ROOT, TARGET) || TARGET;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🚀  everything-copilot-cli setup\n");

  if (options.help) {
    printUsage();
    return;
  }

  checkPrerequisites();

  const isRepoRootRun = resolve(process.cwd()) === resolve(ROOT) && !options.target;
  if (isRepoRootRun) {
    runRepoVerification();
    return;
  }

  if (resolve(TARGET) === resolve(ROOT)) {
    console.error("❌  The install target cannot be the repository root.");
    console.error("   Use a separate project directory, or run without --target for repo verification.");
    process.exit(1);
  }

  console.log(`📁  Installing components into: ${getTargetLabel()}`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const copySample = options.all || options.copyInstructions
    ? "y"
    : await prompt(
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

  const components = [
    { name: "agents", dir: "agents" },
    { name: "skills", dir: "skills" },
    { name: "rules", dir: "rules" },
    { name: "contexts", dir: "contexts" },
  ];

  const copilotDir = join(TARGET, ".github", "copilot");

  for (const comp of components) {
    const answer = options.all
      ? "y"
      : await prompt(rl, `📦  Install ${comp.name}? (y/N) `);
    if (answer.toLowerCase() === "y") {
      const src = join(ROOT, comp.dir);
      const dest = join(copilotDir, comp.dir);
      const count = copyDir(src, dest);
      console.log(`   ✅  Copied ${count} ${comp.name} files → ${dest}`);
    }
  }

  rl.close();

  console.log("\n" + "─".repeat(50));
  console.log("✨  Setup complete!\n");
  console.log("Next steps:");
  console.log("  1. Edit COPILOT-INSTRUCTIONS.md for your project");
  console.log("  2. Review copied agents/skills/rules and customize");
  console.log("  3. Run: copilot");
  console.log("");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
