import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { delimiter, extname, isAbsolute, join, resolve } from "node:path";
import { tmpdir } from "node:os";

export const TOOL_TIMEOUT_DEFAULTS = Object.freeze({
  claude: 120_000,
  codex: 240_000,
  "cursor-agent": 240_000,
  agy: 360_000,
});

// Includes one transient retry plus a short retry delay. These values are based on
// one day of measurements, not an SLA, and remain configurable without code edits.
export const DEFAULT_GATE_TIMEOUT_MS = 725_000;
export const AGY_ARGV_THRESHOLD_UNITS = 24_000;
const RETRY_DELAY_MS = 250;
const WINDOWS_EXTENSION_PRIORITY = [".exe", ".cmd", ".bat", ".ps1"];
const ANSI_PATTERN = /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

const ADAPTERS = Object.freeze({
  claude: { command: "claude", args: ["-p"], channel: "stdin" },
  codex: { command: "codex", args: ["exec", "--skip-git-repo-check"], channel: "stdin" },
  "cursor-agent": { command: "cursor-agent", args: ["-f", "-p"], channel: "stdin" },
  agy: { command: "agy", args: [], channel: "agy" },
});

function fileKind(path, platform) {
  const extension = extname(path).toLowerCase();
  if (platform === "win32") {
    if (extension === ".cmd" || extension === ".bat") return "cmd-shim";
    if (extension === ".ps1") return "ps1-shim";
  }
  return "native-exe";
}

function safeStat(path, stat) {
  try {
    const value = stat(path);
    return value.isFile() ? value : null;
  } catch {
    return null;
  }
}

export function resolveLauncher(command, options = {}) {
  const platform = options.platform ?? process.platform;
  const stat = options.statSync ?? statSync;
  const pathDirs = options.pathDirs ?? String(options.pathValue ?? process.env.PATH ?? "").split(platform === "win32" ? ";" : delimiter);

  if (isAbsolute(command) || command.includes("/") || command.includes("\\")) {
    const resolvedPath = resolve(command);
    const info = safeStat(resolvedPath, stat);
    if (!info) return { kind: "not-found", resolvedPath: null };
    if (platform !== "win32" && (info.mode & 0o111) === 0) return { kind: "not-found", resolvedPath: null };
    return { kind: fileKind(resolvedPath, platform), resolvedPath };
  }

  if (platform === "win32") {
    const baseExtension = extname(command).toLowerCase();
    const extensions = baseExtension ? [""] : WINDOWS_EXTENSION_PRIORITY;
    for (const extension of extensions) {
      for (const pathDir of pathDirs.filter(Boolean)) {
        const candidate = resolve(pathDir, command + extension);
        if (safeStat(candidate, stat)) {
          return { kind: fileKind(candidate, platform), resolvedPath: candidate };
        }
      }
    }
    return { kind: "not-found", resolvedPath: null };
  }

  for (const pathDir of pathDirs.filter(Boolean)) {
    const candidate = resolve(pathDir, command);
    const info = safeStat(candidate, stat);
    if (info && (info.mode & 0o111) !== 0) return { kind: "native-exe", resolvedPath: candidate };
  }
  return { kind: "not-found", resolvedPath: null };
}

export function quoteWindowsArg(value) {
  const arg = String(value);
  if (arg.length > 0 && !/[\s"]/u.test(arg)) return arg;
  return `"${arg.replace(/(\\*)"/g, "$1$1\\\"").replace(/(\\+)$/g, "$1$1")}"`;
}

export function renderWindowsCommandLine(command, args) {
  return [command, ...args].map(quoteWindowsArg).join(" ");
}

export function commandLineUtf16Units(command, args, platform = process.platform) {
  const rendered = platform === "win32" ? renderWindowsCommandLine(command, args) : [command, ...args].join(" ");
  return rendered.length;
}

function quoteCmdToken(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function serializeCmdShimCommand(resolvedPath, args) {
  // cmd.exe /s /c requires an outer quote pair around a command whose executable
  // token is itself quoted. The resulting shape is: ""C:\path with space\x.cmd" "arg"".
  return `"${[resolvedPath, ...args].map(quoteCmdToken).join(" ")}"`;
}

export function buildSpawnSpec(launcher, args, platform = process.platform) {
  if (launcher.kind === "native-exe") {
    return { command: launcher.resolvedPath, args: [...args] };
  }
  if (launcher.kind === "cmd-shim") {
    // /s /c reparses everything after /c as one command string. Serialize that string
    // in one place so a shim path containing spaces is still the executable token.
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", serializeCmdShimCommand(launcher.resolvedPath, args)],
      windowsVerbatimArguments: true,
    };
  }
  if (launcher.kind === "ps1-shim") {
    return {
      command: "powershell.exe",
      args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", launcher.resolvedPath, ...args],
    };
  }
  return { command: null, args: [] };
}

function parsePositiveEnvironment(value, name) {
  if (value === undefined || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

export function resolveToolTimeout(tool, cliOverride = null, env = process.env) {
  if (!Object.hasOwn(TOOL_TIMEOUT_DEFAULTS, tool)) throw new Error(`Unsupported tool: ${tool}`);
  if (cliOverride !== null) return cliOverride;
  const specificName = `QUAD_CLI_TIMEOUT_${tool.toUpperCase().replace(/-/g, "_")}_MS`;
  return (
    parsePositiveEnvironment(env[specificName], specificName) ??
    parsePositiveEnvironment(env.QUAD_CLI_TIMEOUT_MS, "QUAD_CLI_TIMEOUT_MS") ??
    TOOL_TIMEOUT_DEFAULTS[tool]
  );
}

export function resolveGateTimeout(cliOverride = null, env = process.env) {
  if (cliOverride !== null) return cliOverride;
  return parsePositiveEnvironment(env.QUAD_CLI_GATE_TIMEOUT_MS, "QUAD_CLI_GATE_TIMEOUT_MS") ?? DEFAULT_GATE_TIMEOUT_MS;
}

function formatAgyInternalTimeout(externalTimeoutMs) {
  const internalMs = Math.max(1_000, externalTimeoutMs - 60_000);
  if (internalMs % 60_000 === 0) return `${internalMs / 60_000}m`;
  return `${Math.floor(internalMs / 1_000)}s`;
}

function createPromptReference(prompt, options = {}) {
  const tempRoot = options.tempRoot ?? tmpdir();
  const tempDir = mkdtempSync(join(tempRoot, "quad-cli-agy-"));
  const promptPath = join(tempDir, "prompt.txt");
  try {
    writeFileSync(promptPath, prompt, "utf8");
  } catch (error) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      error.message += `; temporary directory cleanup also failed: ${cleanupError.message}`;
    }
    throw error;
  }
  const bytes = Buffer.byteLength(prompt, "utf8");
  const digest = createHash("sha256").update(prompt).digest("hex");
  const bootstrap = [
    `Read the ENTIRE file ${promptPath} as your first action, then follow the instructions inside it exactly.`,
    `The file is ${bytes} bytes and its SHA-256 is ${digest}.`,
    "Do not summarize it; read all of it. Output only what it asks for.",
  ].join("\n");
  return {
    tempDir,
    promptPath,
    bootstrap,
    cleanup() {
      rmSync(tempDir, { recursive: true, force: true });
    },
  };
}

function adapterDefinition(tool, runtime = {}) {
  const adapter = ADAPTERS[tool];
  if (!adapter) throw new Error(`Unsupported tool: ${tool}`);
  const override = runtime.adapterOverrides?.[tool];
  return {
    ...adapter,
    command: override?.command ?? adapter.command,
    prefixArgs: override?.prefixArgs ?? [],
  };
}

export function buildInvocation(tool, prompt = "", options = {}) {
  const platform = options.platform ?? process.platform;
  const timeout = options.timeout ?? TOOL_TIMEOUT_DEFAULTS[tool];
  const adapter = adapterDefinition(tool, options.runtime);
  const launcher = options.launcher ?? resolveLauncher(adapter.command, { platform, ...options.resolveOptions });
  if (launcher.kind === "not-found") {
    return { tool, launcher, command: null, args: [], input: "", transport: "unavailable", units: 0, cleanup: null };
  }

  let args;
  let input = "";
  let transport;
  let promptReference = null;
  if (adapter.channel === "stdin") {
    args = [...adapter.prefixArgs, ...adapter.args];
    input = prompt;
    transport = "stdin";
  } else {
    const argvArgs = [
      ...adapter.prefixArgs,
      "-p",
      prompt,
      "--mode",
      "plan",
      "--sandbox",
      "--print-timeout",
      formatAgyInternalTimeout(timeout),
    ];
    const argvSpec = buildSpawnSpec(launcher, argvArgs, platform);
    const argvUnits = commandLineUtf16Units(argvSpec.command, argvSpec.args, platform);
    const useFileReference = options.forceFileReference || launcher.kind !== "native-exe" || argvUnits >= AGY_ARGV_THRESHOLD_UNITS;
    if (useFileReference) {
      promptReference = createPromptReference(prompt, options.runtime);
      args = [
        ...adapter.prefixArgs,
        "-p",
        promptReference.bootstrap,
        "--add-dir",
        promptReference.tempDir,
        "--mode",
        "plan",
        "--sandbox",
        "--print-timeout",
        formatAgyInternalTimeout(timeout),
      ];
      transport = "file-reference";
    } else {
      args = argvArgs;
      transport = "argv";
    }
  }

  const spawnSpec = buildSpawnSpec(launcher, args, platform);
  return {
    tool,
    launcher,
    ...spawnSpec,
    input,
    transport,
    units: spawnSpec.windowsVerbatimArguments
      ? [spawnSpec.command, ...spawnSpec.args].join(" ").length
      : commandLineUtf16Units(spawnSpec.command, spawnSpec.args, platform),
    windowsVerbatimArguments: Boolean(spawnSpec.windowsVerbatimArguments),
    tempDir: promptReference?.tempDir ?? null,
    promptPath: promptReference?.promptPath ?? null,
    cleanup: promptReference?.cleanup ?? null,
  };
}

export function killProcessTree(child, platform = process.platform) {
  const actions = [];
  if (!child?.pid) return { bestEffort: true, actions, error: "missing-pid" };
  if (platform === "win32") {
    try {
      const configuredRoot = process.env.SystemRoot || process.env.WINDIR;
      const systemRoot = configuredRoot && isAbsolute(configuredRoot) ? configuredRoot : "C:\\Windows";
      const taskkillPath = join(systemRoot, "System32", "taskkill.exe");
      execFileSync(taskkillPath, ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        timeout: 5_000,
      });
      actions.push(`taskkill-tree:${child.pid}`);
      return { bestEffort: true, actions, error: null };
    } catch (error) {
      actions.push(`taskkill-tree-failed:${child.pid}`);
      try {
        child.kill();
        actions.push(`child-kill:${child.pid}`);
      } catch {}
      return { bestEffort: true, actions, error: error.message };
    }
  }
  try {
    process.kill(-child.pid, "SIGKILL");
    actions.push(`process-group-kill:${child.pid}`);
    return { bestEffort: true, actions, error: null };
  } catch (error) {
    actions.push(`process-group-kill-failed:${child.pid}`);
    try {
      child.kill("SIGKILL");
      actions.push(`child-kill:${child.pid}`);
    } catch {}
    return { bestEffort: true, actions, error: error.message };
  }
}

function strictDecode(chunks) {
  return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
}

export function sanitizeReason(value, maxLength = 240) {
  const firstLine = (String(value ?? "").split(/\r?\n/, 1)[0] ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .trim();
  return firstLine.slice(0, maxLength);
}

const TRANSIENT_PATTERNS = [
  /\bEOF\b/i,
  /TLS/i,
  /timed? out/i,
  /timeout/i,
  /ECONN(?:RESET|REFUSED|ABORTED)/i,
  /connection (?:reset|refused|closed)/i,
  /network (?:error|failure|unreachable)/i,
  /Eligibility check failed.*(?:userinfo|oauth2)/i,
  /authentication failed or timed out/i,
];
const AUTHENTICATION_PATTERNS = [
  /invalid credentials?/i,
  /credentials? (?:were )?rejected/i,
  /unauthorized/i,
  /token (?:is )?expired/i,
  /not logged in/i,
  /login required/i,
];

export function classifyFailure(details = {}) {
  if (details.timedOut) return "timeout";
  if (details.errorCode === "ENOENT") return "unavailable";
  const message = `${details.stderr ?? ""}\n${details.error ?? ""}`;
  // Network evidence wins over broad authentication wording. In particular,
  // "authentication failed or timed out" and oauth2/userinfo EOF were observed
  // transient failures that succeeded on one retry.
  if (TRANSIENT_PATTERNS.some((pattern) => pattern.test(message))) return "transient";
  if (AUTHENTICATION_PATTERNS.some((pattern) => pattern.test(message))) return "authentication";
  if (["EINVAL", "ENAMETOOLONG"].includes(details.errorCode)) return "invocation";
  if (details.errorCode || (details.exitCode !== null && details.exitCode !== 0)) return "invocation";
  return "internal";
}

function spawnAttempt(invocation, timeout, runtime = {}) {
  const spawnImpl = runtime.spawn ?? spawn;
  const platform = runtime.platform ?? process.platform;
  const signal = runtime.signal;
  return new Promise((resolveAttempt) => {
    const started = Date.now();
    const stdoutChunks = [];
    const stderrChunks = [];
    let child;
    let settled = false;
    let timedOut = false;
    let killResult = null;
    let timer = null;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      let stdout = "";
      let decodeError = null;
      try {
        stdout = strictDecode(stdoutChunks);
      } catch (error) {
        decodeError = error.message;
      }
      const stderr = Buffer.concat(stderrChunks).toString("utf8");
      const base = {
        tool: invocation.tool,
        launcherKind: invocation.launcher.kind,
        resolvedPath: invocation.launcher.resolvedPath,
        transport: invocation.transport,
        units: invocation.units,
        ms: Date.now() - started,
        stdout,
        stderr,
        bytesOut: Buffer.concat(stdoutChunks).length,
        timedOut,
        killResult,
        decodeError,
        ...result,
      };
      if (decodeError) {
        resolveAttempt({ ...base, status: "error", class: "invalid-response", error: `stdout is not strict UTF-8: ${decodeError}` });
        return;
      }
      resolveAttempt(base);
    };

    const terminate = (reason) => {
      if (settled) return;
      timedOut = reason === "timeout";
      killResult = killProcessTree(child, platform);
      try { child.stdin.destroy(); } catch {}
      try { child.stdout.destroy(); } catch {}
      try { child.stderr.destroy(); } catch {}
      try { child.unref(); } catch {}
      finish({
        status: "error",
        class: "timeout",
        error: timedOut ? `Timed out after ${timeout}ms` : "Gate deadline exceeded",
        errorCode: null,
        exitCode: null,
        signal: null,
      });
    };
    const onAbort = () => terminate("deadline");

    try {
      child = spawnImpl(invocation.command, invocation.args, {
        cwd: runtime.cwd,
        env: runtime.env ?? process.env,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        windowsVerbatimArguments: invocation.windowsVerbatimArguments,
        detached: platform !== "win32",
      });
    } catch (error) {
      finish({
        status: "error",
        class: classifyFailure({ errorCode: error.code, error: error.message }),
        error: error.message,
        errorCode: error.code ?? null,
        exitCode: null,
        signal: null,
      });
      return;
    }

    timer = setTimeout(() => terminate("timeout"), timeout);
    signal?.addEventListener("abort", onAbort, { once: true });
    child.stdout.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));
    child.stdin.on("error", () => {});
    child.on("error", (error) => {
      finish({
        status: "error",
        class: classifyFailure({ errorCode: error.code, error: error.message }),
        error: error.message,
        errorCode: error.code ?? null,
        exitCode: null,
        signal: null,
      });
    });
    child.on("close", (exitCode, closeSignal) => {
      if (timedOut || signal?.aborted) {
        finish({ status: "error", class: "timeout", error: timedOut ? `Timed out after ${timeout}ms` : "Gate deadline exceeded", errorCode: null, exitCode, signal: closeSignal });
      } else if (exitCode !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString("utf8");
        finish({ status: "error", class: classifyFailure({ exitCode, stderr }), error: `Exited with code ${exitCode}${closeSignal ? ` (${closeSignal})` : ""}`, errorCode: null, exitCode, signal: closeSignal });
      } else {
        finish({ status: "ok", class: null, error: null, errorCode: null, exitCode, signal: closeSignal });
      }
    });
    try {
      child.stdin.end(invocation.input, "utf8");
    } catch (error) {
      finish({ status: "error", class: "invocation", error: error.message, errorCode: error.code ?? null, exitCode: null, signal: null });
    }
  });
}

async function runBuiltInvocation(invocation, timeout, runtime) {
  let result;
  try {
    result = await spawnAttempt(invocation, timeout, runtime);
  } finally {
    if (invocation.cleanup) {
      try {
        invocation.cleanup();
      } catch (error) {
        if (result) {
          result = { ...result, status: "error", class: "internal", cleanupError: error.message, error: `Temporary prompt cleanup failed: ${error.message}` };
        } else {
          throw error;
        }
      }
    }
  }
  return result;
}

export async function spawnRunner(tool, prompt, timeout, runtime = {}) {
  const launcher = runtime.launchers?.[tool] ?? resolveLauncher(adapterDefinition(tool, runtime).command, {
    platform: runtime.platform,
    pathDirs: runtime.pathDirs,
    statSync: runtime.statSync,
  });
  if (launcher.kind === "not-found") {
    return {
      tool,
      status: "error",
      class: "unavailable",
      error: `${tool} was not found on PATH`,
      errorCode: "ENOENT",
      exitCode: null,
      signal: null,
      stdout: "",
      stderr: "",
      launcherKind: "not-found",
      resolvedPath: null,
      transport: "unavailable",
      units: 0,
      ms: 0,
      bytesOut: 0,
      attempts: 1,
    };
  }

  let invocation = buildInvocation(tool, prompt, { launcher, timeout, platform: runtime.platform, runtime });
  let result = await runBuiltInvocation(invocation, timeout, runtime);
  if (tool === "agy" && invocation.transport === "argv" && result.errorCode === "ENAMETOOLONG") {
    invocation = buildInvocation(tool, prompt, { launcher, timeout, platform: runtime.platform, runtime, forceFileReference: true });
    result = await runBuiltInvocation(invocation, timeout, runtime);
    result.transportFallback = "ENAMETOOLONG->file-reference";
  }
  return result;
}

export async function runRunnerWithRetry(tool, prompt, timeout, mockDir, runtime = {}) {
  if (mockDir) return runMockRunner(tool, mockDir);
  let result = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    if (runtime.signal?.aborted) {
      return result ?? { tool, status: "error", class: "timeout", error: "Gate deadline exceeded", attempts: attempt - 1 };
    }
    result = await spawnRunner(tool, prompt, timeout, runtime);
    result.attempts = attempt;
    if (result.status === "ok" || result.class !== "transient") return result;
    if (attempt === 1) await new Promise((resolveDelay) => setTimeout(resolveDelay, runtime.retryDelayMs ?? RETRY_DELAY_MS));
  }
  return result;
}

export function runMockRunner(tool, mockDir) {
  const filePath = join(mockDir, `${tool}.json`);
  if (!existsSync(filePath)) {
    return { tool, status: "error", class: "internal", error: `Mock response not found: ${filePath}`, attempts: 1 };
  }
  const stdout = readFileSync(filePath, "utf8");
  return {
    tool,
    status: "ok",
    class: null,
    stdout,
    stderr: "",
    exitCode: 0,
    signal: null,
    errorCode: null,
    launcherKind: "mock",
    resolvedPath: filePath,
    transport: "mock",
    units: 0,
    ms: 0,
    bytesOut: Buffer.byteLength(stdout),
    attempts: 1,
  };
}

function parseNormalizedJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

function unwrapEnvelope(value, tool) {
  if (tool === "cursor-agent" && value?.type === "result" && typeof value.is_error === "boolean") {
    if (value.is_error !== false || typeof value.result !== "string") return { ok: false, envelope: "result", envelopeError: true };
    const inner = parseNormalizedJson(value.result.trim());
    return inner.ok ? { ...inner, envelope: "result" } : { ok: false, envelope: "result" };
  }
  if (tool === "agy" && ["SUCCESS", "ERROR"].includes(value?.status)) {
    if (value.status !== "SUCCESS" || typeof value.response !== "string") return { ok: false, envelope: "response", envelopeError: true };
    const inner = parseNormalizedJson(value.response.trim());
    return inner.ok ? { ...inner, envelope: "response" } : { ok: false, envelope: "response" };
  }
  return null;
}

export function parseJsonReport(stdout, tool = null) {
  let text;
  try {
    text = Buffer.isBuffer(stdout) || stdout instanceof Uint8Array ? new TextDecoder("utf-8", { fatal: true }).decode(stdout) : String(stdout);
  } catch {
    return { ok: false, failureClass: "invalid-response", reason: "stdout is not strict UTF-8" };
  }
  text = text.replace(ANSI_PATTERN, "").trim();
  if (text.startsWith("\uFEFF")) text = text.slice(1);
  let parsed = parseNormalizedJson(text);
  let fenced = false;
  if (!parsed.ok) {
    const fence = text.match(/^```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i);
    if (fence) {
      parsed = parseNormalizedJson(fence[1].trim());
      fenced = parsed.ok;
    }
  }
  if (!parsed.ok) return { ok: false, failureClass: "invalid-response", reason: "stdout is not one complete JSON value" };
  const envelope = unwrapEnvelope(parsed.value, tool);
  if (envelope) return { ...envelope, fenced };
  return { ok: true, value: parsed.value, envelope: null, fenced };
}

export function formatRunnerDiagnostic(result) {
  const reason = sanitizeReason(result.reason || result.stderr || result.error || "-");
  const parts = [
    `tool=${result.tool}`,
    `status=${result.status}`,
    `class=${result.class ?? "-"}`,
    `exit=${result.exitCode ?? "-"}`,
    `ms=${result.ms ?? 0}`,
    `launcher=${result.launcherKind ?? "-"}`,
    `resolved=${JSON.stringify(result.resolvedPath ?? "-")}`,
    `units=${result.units ?? 0}`,
    `bytes_out=${result.bytesOut ?? 0}`,
  ];
  if (Number.isInteger(result.findingsCount)) parts.push(`findings=${result.findingsCount}`);
  if (result.ignoredTopLevelKeys?.length) parts.push(`ignored_keys=${result.ignoredTopLevelKeys.join(",")}`);
  parts.push(`reason=${JSON.stringify(reason || "-")}`);
  return parts.join(" ");
}
