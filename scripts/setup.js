#!/usr/bin/env node

/**
 * Setup script for everything-copilot-cli.
 * Verifies a cloned repo when run from the repo root, or installs a starter
 * Copilot configuration into a target project.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { createInterface } from "node:readline";

const ROOT = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const VALID_PROFILES = ["minimal", "recommended", "full", "custom"];
const STARTER_INSTRUCTIONS = `# Project Instructions

> Update this file with the conventions GitHub Copilot should follow in this project.

## Project Context

- Project type and stack:
- Key directories and ownership:
- Important runtime or deployment constraints:

## Working Agreements

- Follow the repository's existing patterns before introducing new abstractions.
- Run the project's existing checks after meaningful changes.
- Update docs and tests when behavior changes.

## Team Preferences

- Package manager / build tool:
- Test commands:
- Style or linting rules:
- Architecture or layering rules:
`;

const COMPONENTS = [
  {
    key: "instructions",
    label: "starter instructions",
    destination: ".github/copilot-instructions.md",
    description: "Project-specific Copilot guidance loaded automatically every session.",
    recommended: true,
    install: installInstructions,
    summary: "Starter project instructions",
  },
  {
    key: "agents",
    label: "agents",
    sourceDir: "agents",
    destination: ".github/copilot/agents/",
    description: "8 specialist personas such as planner, architect, and code-reviewer.",
    recommended: true,
    install: installDirectory,
    summary: "Specialist agent definitions",
  },
  {
    key: "skills",
    label: "skills",
    sourceDir: "skills",
    destination: ".github/copilot/skills/",
    description: "Reusable workflows for development, testing, security, docs, and GitHub tasks.",
    recommended: true,
    install: installDirectory,
    summary: "Reusable workflow skills",
  },
  {
    key: "rules",
    label: "rules",
    sourceDir: "rules",
    destination: ".github/copilot/rules/",
    description: "Shared coding and review rules that keep Copilot aligned with project standards.",
    recommended: true,
    install: installDirectory,
    summary: "Rule sets and guardrails",
  },
  {
    key: "contexts",
    label: "contexts",
    sourceDir: "contexts",
    destination: ".github/copilot/contexts/",
    description: "Execution context presets for advanced or multi-workspace setups.",
    recommended: false,
    install: installDirectory,
    summary: "Context presets",
  },
];

function parseArgs(argv) {
  const parsed = {
    all: false,
    copyInstructions: false,
    help: false,
    profile: null,
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
      parsed.profile = "full";
      continue;
    }

    if (arg === "--copy-instructions") {
      parsed.copyInstructions = true;
      continue;
    }

    if (arg === "--profile") {
      const value = argv[i + 1];
      if (!value) {
        console.error("❌  Missing value for --profile");
        process.exit(1);
      }
      parsed.profile = normalizeProfile(value);
      i++;
      continue;
    }

    if (arg.startsWith("--profile=")) {
      const value = arg.slice("--profile=".length);
      if (!value) {
        console.error("❌  Missing value for --profile");
        process.exit(1);
      }
      parsed.profile = normalizeProfile(value);
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

function normalizeProfile(profile) {
  const normalized = profile.toLowerCase();
  if (!VALID_PROFILES.includes(normalized)) {
    console.error(
      `❌  Invalid profile "${profile}". Use one of: ${VALID_PROFILES.join(", ")}`
    );
    process.exit(1);
  }
  return normalized;
}

const options = parseArgs(args);
const TARGET = options.target ?? process.cwd();

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

function countEntries(path) {
  if (!existsSync(path)) return 0;
  return readdirSync(path, { recursive: true }).length;
}

function installDirectory(component) {
  const src = join(ROOT, component.sourceDir);
  const dest = join(TARGET, ...component.destination.split("/").filter(Boolean));

  if (!existsSync(src)) {
    throw new Error(`Source not found: ${src}`);
  }

  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });

  return {
    path: component.destination,
    detail: `${component.summary} (${countEntries(src)} entries)`,
    state: "installed",
  };
}

function installInstructions(component) {
  const dest = join(TARGET, ".github", "copilot-instructions.md");
  mkdirSync(join(TARGET, ".github"), { recursive: true });

  if (existsSync(dest)) {
    return {
      path: component.destination,
      detail: "Starter project instructions already existed",
      state: "existing",
    };
  }

  writeFileSync(dest, STARTER_INSTRUCTIONS, "utf-8");
  return {
    path: component.destination,
    detail: component.summary,
    state: "installed",
  };
}

function printUsage() {
  console.log("Usage:");
  console.log("  npm run setup");
  console.log("  npm run setup -- --target <path-to-project>");
  console.log("  npm run setup -- --target <path-to-project> --profile recommended");
  console.log("  npm run setup -- --target <path-to-project> --all");
  console.log("");
  console.log("When run from the repo root, setup performs a quick repository verification.");
  console.log("When run with --target, setup installs a starter Copilot configuration");
  console.log("into the target project's .github/ directory.");
  console.log("--profile supports: minimal, recommended, full, custom.");
  console.log("--all is an alias for --profile full.");
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

function verifyInstructionTemplate() {
  const candidates = [
    join(ROOT, "COPILOT-INSTRUCTIONS.md"),
    join(ROOT, ".github", "copilot-instructions.md"),
  ];

  if (candidates.some((candidate) => existsSync(candidate))) {
    console.log("✅  Found instructions template");
    return 0;
  }

  console.error("❌  Missing instructions template");
  return 1;
}

function runRepoVerification() {
  console.log("🧪  Running repository verification\n");

  const requiredDirs = ["agents", "skills", "rules", "contexts", "scripts", "tests"];
  const requiredFiles = ["package.json", "README.md"];

  let failures = 0;
  failures += verifyRequiredPaths(requiredDirs, "directory");
  failures += verifyRequiredPaths(requiredFiles, "file");
  failures += verifyInstructionTemplate();
  failures += verifyPackageScripts();

  if (failures > 0) {
    console.error(`\n❌  Repository setup verification failed (${failures} issue(s)).`);
    process.exit(1);
  }

  console.log("\n✅  Repository setup verified.");
  console.log("   Quick check passed for the documented clone + setup flow.\n");
  console.log("Next steps:");
  console.log("  1. Run: npm test");
  console.log("  2. Install into your project:");
  console.log("     npm run setup -- --target <path-to-project> --profile recommended");
  console.log("  3. In that project, run: copilot");
  console.log("");
}

function getTargetLabel() {
  return relative(ROOT, TARGET) || TARGET;
}

async function promptYesNo(rl, component) {
  const defaultLabel = component.recommended ? "Y/n" : "y/N";

  console.log(`\n📦  Install ${component.label}? ${component.recommended ? "[recommended]" : "[optional]"}`);
  console.log(`     → ${component.destination}`);
  console.log(`     ${component.description}`);

  const answer = (await prompt(rl, `     Install? (${defaultLabel}) `)).trim().toLowerCase();
  if (!answer) return component.recommended;
  return answer === "y" || answer === "yes";
}

async function promptForProfile(rl) {
  console.log("\n📦  Choose an install profile:\n");
  console.log("  [1] minimal      Starter instructions only");
  console.log("                   → .github/copilot-instructions.md");
  console.log("");
  console.log("  [2] recommended  Starter instructions + agents + skills + rules");
  console.log("                   → Best default for most projects");
  console.log("");
  console.log("  [3] full         Everything");
  console.log("                   → Includes contexts for advanced setups");
  console.log("");
  console.log("  [4] custom       Choose each component interactively");

  const answer = (await prompt(rl, "\nEnter 1-4 [2]: ")).trim() || "2";
  const mapping = {
    "1": "minimal",
    "2": "recommended",
    "3": "full",
    "4": "custom",
  };

  if (!mapping[answer]) {
    console.error(`❌  Invalid selection: ${answer}`);
    process.exit(1);
  }

  return mapping[answer];
}

function profileSelections(profile) {
  switch (profile) {
    case "minimal":
      return {
        instructions: true,
        agents: false,
        skills: false,
        rules: false,
        contexts: false,
      };
    case "recommended":
      return {
        instructions: true,
        agents: true,
        skills: true,
        rules: true,
        contexts: false,
      };
    case "full":
      return {
        instructions: true,
        agents: true,
        skills: true,
        rules: true,
        contexts: true,
      };
    default:
      throw new Error(`Unknown profile: ${profile}`);
  }
}

async function determineSelections(rl, profile) {
  if (profile !== "custom") {
    return profileSelections(profile);
  }

  const selections = {};
  for (const component of COMPONENTS) {
    selections[component.key] = await promptYesNo(rl, component);
  }
  return selections;
}

function printSummary(results, profile) {
  console.log("\n" + "─".repeat(50));
  console.log("✨  Setup complete!\n");
  console.log(`Profile: ${profile}`);
  console.log("");
  console.log("Installed:");

  for (const result of results) {
    const status = result.state === "installed" ? "✅" : result.state === "existing" ? "ℹ️" : "⏭️";
    const suffix = result.detail ?? "skipped";
    console.log(`  ${status} ${result.path.padEnd(32)} ${suffix}`);
  }

  console.log("\nNext steps:");
  if (results.some((result) => result.key === "instructions" && result.state !== "skipped")) {
    console.log("  1. Customize .github/copilot-instructions.md for your project");
    console.log("     Copilot reads this automatically on every session.");
  } else {
    console.log("  1. Add project instructions later with:");
    console.log("     npm run setup -- --target <path-to-project> --profile minimal");
  }

  console.log("  2. Start a session in your project:");
  console.log(`     cd ${TARGET}`);
  console.log("     copilot");
  console.log("  3. Inside Copilot, verify the installed configuration:");
  console.log("     /instructions");
  console.log("     /skills");
  console.log("");
}

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
  const chosenProfile = options.profile ?? (options.all ? "full" : await promptForProfile(rl));
  const selections = await determineSelections(rl, chosenProfile);

  if (options.copyInstructions) {
    selections.instructions = true;
  }

  rl.close();

  console.log(`\nUsing profile: ${chosenProfile}`);

  const results = [];
  for (const component of COMPONENTS) {
    if (!selections[component.key]) {
      results.push({
        key: component.key,
        path: component.destination,
        detail: "not selected",
        state: "skipped",
      });
      continue;
    }

    const installResult = component.install(component);
    results.push({
      key: component.key,
      path: installResult.path,
      detail: installResult.detail,
      state: installResult.state ?? "installed",
    });
  }

  printSummary(results, chosenProfile);
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
