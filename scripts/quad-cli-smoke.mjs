import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ORCHESTRATOR = join(__dirname, "quad-cli-orchestrate.mjs");
const DIFF_FIXTURE = join(ROOT, "tests", "fixtures", "quad-cli", "smoke.diff");
const DECLARED_TOOLS = ["claude", "codex", "cursor-agent", "agy"];

export function runSmoke(argv = process.argv.slice(2), runtime = {}) {
  const availableMode = parseArgs(argv);
  const tempDir = mkdtempSync(join(tmpdir(), "quad-cli-smoke-"));
  const artifactPath = join(tempDir, "report.json");

  try {
    const child = (runtime.spawnSync ?? spawnSync)(
      process.execPath,
      [ORCHESTRATOR, "--diff-file", DIFF_FIXTURE, "--min-reviewers", "4", "--artifact", artifactPath],
      { cwd: ROOT, env: process.env, encoding: "utf8", windowsHide: true }
    );

    if (child.stderr) process.stderr.write(child.stderr);
    if (!child.stdout?.trim()) {
      console.error(`quad-cli-smoke: orchestrator produced no report (exit ${child.status ?? "unknown"}).`);
      return 1;
    }

    let report;
    try {
      report = JSON.parse(child.stdout);
    } catch {
      console.error("quad-cli-smoke: orchestrator stdout was not a JSON report.");
      return 1;
    }

    const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
    if (JSON.stringify(artifact) !== JSON.stringify(report)) {
      console.error("quad-cli-smoke: stdout and artifact report differed.");
      return 1;
    }

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    const effective = new Set(report.reviewers?.effective ?? []);
    const missing = DECLARED_TOOLS.filter((tool) => !effective.has(tool));
    if (missing.length === 0) {
      console.error('quad-cli-smoke: status="ok"; all declared reviewers returned schema-valid output.');
      return 0;
    }

    const droppedByTool = new Map((report.reviewers?.dropped ?? []).map((entry) => [entry.tool, entry]));
    for (const tool of missing) {
      const dropped = droppedByTool.get(tool);
      console.error(
        `quad-cli-smoke: missing tool=${tool} stage=${dropped?.stage ?? "unknown"} cause=${dropped?.primary_cause ?? "unknown"} reason=${JSON.stringify(dropped?.observed_failure ?? "not reported")}`
      );
    }

    if (availableMode) {
      console.error('quad-cli-smoke: status="degraded"; one or more declared reviewers were unavailable or invalid.');
      return 4;
    }
    console.error('quad-cli-smoke: status="failed"; strict mode requires every declared reviewer.');
    return 1;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function parseArgs(argv) {
  if (argv.length === 0) return false;
  if (argv.length === 1 && argv[0] === "--available") return true;
  throw new Error(`Unknown argument: ${argv[0]}`);
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    process.exit(runSmoke());
  } catch (error) {
    console.error(`quad-cli-smoke: ${error.message}`);
    process.exit(1);
  }
}
