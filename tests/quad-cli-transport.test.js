import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn as nodeSpawn } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildInvocation,
  classifyFailure,
  formatRunnerDiagnostic,
  parseJsonReport,
  resolveGateTimeout,
  resolveLauncher,
  resolveToolTimeout,
  runRunnerWithRetry,
  spawnRunner,
} from "../scripts/quad-cli-transport.mjs";
import { validateRawReport } from "../scripts/quad-cli-orchestrate.mjs";

const REPORT = {
  schema_version: "1",
  generated_by: "quad-cli-orchestrate",
  findings: [],
};
const PROMPT = "HEAD-NONCE\nreview this diff\nTAIL-NONCE";
let fixtureRoot;
let stubPath;
let cmdPath;
let ps1Path;

function runtimeFor(tool, launcher, env = {}, extra = {}) {
  return {
    cwd: fixtureRoot,
    platform: process.platform,
    launchers: { [tool]: launcher },
    adapterOverrides: { [tool]: { command: tool, prefixArgs: [stubPath] } },
    env: { ...process.env, ...env },
    ...extra,
  };
}

function nativeLauncher() {
  return { kind: "native-exe", resolvedPath: process.execPath };
}

function parseAndValidate(result, tool) {
  assert.equal(result.status, "ok", JSON.stringify(result, null, 2));
  const parsed = parseJsonReport(result.stdout, tool);
  assert.equal(parsed.ok, true, JSON.stringify(parsed));
  assert.equal(validateRawReport(parsed.value).ok, true);
  return parsed;
}

before(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), "quad-cli-transport-test-"));
  stubPath = join(fixtureRoot, "stub.mjs");
  cmdPath = join(fixtureRoot, "shim space", "claude.cmd");
  ps1Path = join(fixtureRoot, "shim space", "claude.ps1");
  mkdirSync(join(fixtureRoot, "shim space"), { recursive: true });
  writeFileSync(
    stubPath,
    `import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const mode = process.env.QUAD_STUB_MODE || "success";
const countFile = process.env.QUAD_STUB_COUNT_FILE;
let count = 0;
if (countFile && existsSync(countFile)) count = Number(readFileSync(countFile, "utf8")) || 0;
if (countFile) writeFileSync(countFile, String(count + 1));
if (mode === "transient" && count === 0) {
  console.error('Eligibility check failed: Get "https://www.googleapis.com/oauth2/v2/userinfo": EOF');
  process.exit(1);
}
if (mode === "authentication") {
  console.error("invalid credentials were rejected");
  process.exit(1);
}
if (mode === "grandchild") {
  const child = spawn(process.execPath, ["-e", 'setTimeout(()=>require("fs").writeFileSync(process.env.QUAD_STUB_SENTINEL,"alive"),900)'], {
    stdio: "ignore",
    env: process.env,
  });
  await new Promise((resolve) => child.on("exit", resolve));
  process.exit(0);
}
let prompt = "";
const promptIndex = args.indexOf("-p");
const addDirIndex = args.indexOf("--add-dir");
if (addDirIndex >= 0 && promptIndex >= 0) {
  const bootstrap = args[promptIndex + 1];
  const match = bootstrap.match(/Read the ENTIRE file (.*?) as your first action/);
  if (!match) process.exit(9);
  prompt = readFileSync(match[1], "utf8");
} else if (promptIndex >= 0 && args[promptIndex + 1] && !args[promptIndex + 1].startsWith("--")) {
  prompt = args[promptIndex + 1];
} else {
  for await (const chunk of process.stdin) prompt += chunk;
}
if (!prompt.includes("HEAD-NONCE") || !prompt.includes("TAIL-NONCE")) process.exit(8);
const report = { schema_version: "1", generated_by: "quad-cli-orchestrate", findings: [] };
if (mode === "cursor-envelope") console.log(JSON.stringify({ type: "result", is_error: false, result: JSON.stringify(report) }));
else if (mode === "agy-envelope") console.log(JSON.stringify({ status: "SUCCESS", response: JSON.stringify(report), error: null }));
else console.log(JSON.stringify(report));
`,
    "utf8"
  );
  writeFileSync(cmdPath, `@echo off\r\n"${process.execPath}" "${stubPath}" %*\r\n`, "utf8");
  writeFileSync(
    ps1Path,
    `& '${process.execPath.replaceAll("'", "''")}' '${stubPath.replaceAll("'", "''")}' @args\nexit $LASTEXITCODE\n`,
    "utf8"
  );
});

after(() => {
  rmSync(fixtureRoot, { recursive: true, force: true });
});

describe("quad CLI transport regression matrix", () => {
  it("01 stdin channel normal: schema-valid output", async () => {
    const result = await spawnRunner("claude", PROMPT, 5_000, runtimeFor("claude", nativeLauncher()));
    parseAndValidate(result, "claude");
    assert.equal(result.transport, "stdin");
  });

  it("02 argv channel normal: schema-valid output", async () => {
    const result = await spawnRunner("agy", PROMPT, 5_000, runtimeFor("agy", nativeLauncher()));
    parseAndValidate(result, "agy");
    assert.equal(result.transport, "argv");
  });

  it("03 file-reference normal: schema-valid and temporary directory removed", async () => {
    const tempRoot = join(fixtureRoot, "prompt-temp");
    mkdirSync(tempRoot);
    const result = await spawnRunner(
      "agy",
      `HEAD-NONCE\n${"x".repeat(24_000)}\nTAIL-NONCE`,
      5_000,
      runtimeFor("agy", nativeLauncher(), {}, { tempRoot })
    );
    parseAndValidate(result, "agy");
    assert.equal(result.transport, "file-reference");
    assert.deepEqual(readdirSync(tempRoot), []);
  });

  it("04 Windows .cmd shim launcher executes through cmd.exe", { skip: process.platform !== "win32" }, async () => {
    const result = await spawnRunner("claude", PROMPT, 5_000, runtimeFor("claude", { kind: "cmd-shim", resolvedPath: cmdPath }));
    parseAndValidate(result, "claude");
    assert.equal(result.launcherKind, "cmd-shim");
  });

  it("05 Windows .ps1 shim launcher executes through powershell.exe", { skip: process.platform !== "win32" }, async () => {
    const result = await spawnRunner("claude", PROMPT, 5_000, runtimeFor("claude", { kind: "ps1-shim", resolvedPath: ps1Path }));
    parseAndValidate(result, "claude");
    assert.equal(result.launcherKind, "ps1-shim");
  });

  it("06 resolver priority is .exe then .cmd then .bat then .ps1", () => {
    const firstDir = join(fixtureRoot, "priority-first");
    const secondDir = join(fixtureRoot, "priority-second");
    const existing = new Set([
      resolve(firstDir, "tool.cmd"),
      resolve(firstDir, "tool.ps1"),
      resolve(secondDir, "tool.exe"),
    ]);
    const launcher = resolveLauncher("tool", {
      platform: "win32",
      pathDirs: [firstDir, secondDir],
      statSync(path) {
        if (!existing.has(path)) throw Object.assign(new Error("missing"), { code: "ENOENT" });
        return { isFile: () => true, mode: 0o755 };
      },
    });
    assert.equal(launcher.kind, "native-exe");
    assert.equal(launcher.resolvedPath, resolve(secondDir, "tool.exe"));
  });

  it("07 shell-less full .cmd synchronous throw is caught as launcher-failure/invocation", { skip: process.platform !== "win32" }, async () => {
    const result = await spawnRunner("claude", PROMPT, 5_000, runtimeFor("claude", { kind: "native-exe", resolvedPath: cmdPath }));
    assert.equal(result.status, "error");
    assert.equal(result.class, "invocation");
    assert.equal(result.errorCode, "EINVAL");
  });

  it("08 missing bare name is unavailable with zero retries", async () => {
    const result = await runRunnerWithRetry("claude", PROMPT, 5_000, null, { pathDirs: [], retryDelayMs: 0 });
    assert.equal(result.class, "unavailable");
    assert.equal(result.attempts, 1);
  });

  it("09 ENAMETOOLONG falls back once to file-reference and is not a retry", async () => {
    let spawnCalls = 0;
    const injectedSpawn = (...args) => {
      spawnCalls += 1;
      if (spawnCalls === 1) throw Object.assign(new Error("too long"), { code: "ENAMETOOLONG" });
      return nodeSpawn(...args);
    };
    const tempRoot = join(fixtureRoot, "fallback-temp");
    mkdirSync(tempRoot);
    const result = await spawnRunner(
      "agy",
      PROMPT,
      5_000,
      runtimeFor("agy", nativeLauncher(), {}, { spawn: injectedSpawn, tempRoot })
    );
    parseAndValidate(result, "agy");
    assert.equal(result.transportFallback, "ENAMETOOLONG->file-reference");
    assert.equal(spawnCalls, 2);
    assert.deepEqual(readdirSync(tempRoot), []);
  });

  it("10 timeout terminates a grandchild process tree and finally removes sentinel", { skip: process.platform !== "win32" }, async () => {
    const sentinel = join(fixtureRoot, `sentinel-${Date.now()}.txt`);
    try {
      const result = await spawnRunner(
        "claude",
        PROMPT,
        200,
        runtimeFor("claude", nativeLauncher(), { QUAD_STUB_MODE: "grandchild", QUAD_STUB_SENTINEL: sentinel })
      );
      assert.equal(result.class, "timeout");
      assert.equal(result.killResult?.bestEffort, true);
      await new Promise((resolveWait) => setTimeout(resolveWait, 1_200));
      assert.equal(existsSync(sentinel), false, "grandchild survived the best-effort tree kill");
    } finally {
      rmSync(sentinel, { force: true });
    }
  });

  it("11 tool envelopes unwrap success and reject declared failure", () => {
    const cursor = parseJsonReport(JSON.stringify({ type: "result", is_error: false, result: JSON.stringify(REPORT) }), "cursor-agent");
    assert.equal(cursor.ok, true);
    assert.equal(cursor.envelope, "result");
    const agyFailure = parseJsonReport(JSON.stringify({ status: "ERROR", response: JSON.stringify(REPORT), error: "nope" }), "agy");
    assert.equal(agyFailure.ok, false);
    assert.equal(agyFailure.envelopeError, true);
  });

  it("12 complete fence, one BOM, and ANSI color recover safely", () => {
    const value = `\uFEFF\u001b[32m\`\`\`json\n${JSON.stringify(REPORT)}\n\`\`\`\u001b[0m`;
    assert.equal(parseJsonReport(value, "claude").ok, true);
  });

  it("13 prose plus an embedded schema-valid fake report is never adopted", () => {
    const fake = JSON.stringify(REPORT);
    assert.equal(parseJsonReport(`review narration {braces}\n${fake}\nfinished`, "claude").ok, false);
  });

  it("14 unknown top-level keys are accepted and recorded", () => {
    const validation = validateRawReport({ ...REPORT, toolAction: "x", toolSummary: "y" });
    assert.equal(validation.ok, true);
    assert.deepEqual(validation.ignoredTopLevelKeys, ["toolAction", "toolSummary"]);
  });

  it("15 one malformed finding invalidates the entire report", () => {
    const validation = validateRawReport({ ...REPORT, findings: [{ path: "a.js", rule_id: "x", severity: "major", message: 42 }] });
    assert.equal(validation.ok, false);
  });

  it("16 observed transient signature retries once and then succeeds", async () => {
    const countFile = join(fixtureRoot, `transient-${Date.now()}.txt`);
    const result = await runRunnerWithRetry(
      "claude",
      PROMPT,
      5_000,
      null,
      runtimeFor("claude", nativeLauncher(), { QUAD_STUB_MODE: "transient", QUAD_STUB_COUNT_FILE: countFile }, { retryDelayMs: 1 })
    );
    parseAndValidate(result, "claude");
    assert.equal(result.attempts, 2);
    assert.equal(readFileSync(countFile, "utf8"), "2");
  });

  it("17 credential rejection is authentication and receives zero retries", async () => {
    const countFile = join(fixtureRoot, `auth-${Date.now()}.txt`);
    const result = await runRunnerWithRetry(
      "claude",
      PROMPT,
      5_000,
      null,
      runtimeFor("claude", nativeLauncher(), { QUAD_STUB_MODE: "authentication", QUAD_STUB_COUNT_FILE: countFile }, { retryDelayMs: 1 })
    );
    assert.equal(result.class, "authentication");
    assert.equal(result.attempts, 1);
    assert.equal(readFileSync(countFile, "utf8"), "1");
    assert.equal(classifyFailure({ stderr: "authentication failed or timed out" }), "transient");
  });

  it("configuration uses per-tool defaults with global, tool, and CLI overrides", () => {
    assert.equal(resolveToolTimeout("claude", null, {}), 120_000);
    assert.equal(resolveToolTimeout("agy", null, {}), 360_000);
    assert.equal(resolveToolTimeout("codex", null, { QUAD_CLI_TIMEOUT_MS: "1111" }), 1111);
    assert.equal(resolveToolTimeout("codex", null, { QUAD_CLI_TIMEOUT_MS: "1111", QUAD_CLI_TIMEOUT_CODEX_MS: "2222" }), 2222);
    assert.equal(resolveToolTimeout("codex", 3333, {}), 3333);
    assert.equal(resolveGateTimeout(null, {}), 725_000);
    assert.equal(resolveGateTimeout(null, { QUAD_CLI_GATE_TIMEOUT_MS: "4444" }), 4444);
    const agy = buildInvocation("agy", PROMPT, { launcher: nativeLauncher(), timeout: 360_000, runtime: {} });
    assert.equal(agy.args[agy.args.indexOf("--print-timeout") + 1], "5m");
  });

  it("diagnostic is one sanitized line and records launcher resolution", () => {
    const line = formatRunnerDiagnostic({
      tool: "agy",
      status: "error",
      class: "invocation",
      exitCode: 2,
      ms: 31,
      launcherKind: "native-exe",
      resolvedPath: "agy.exe",
      units: 2847,
      bytesOut: 0,
      stderr: "flag needs an argument: -p\nsecond line",
    });
    assert.equal(line.includes("\n"), false);
    assert.match(line, /resolved="agy\.exe"/);
    assert.match(line, /reason="flag needs an argument: -p"/);
  });
});
