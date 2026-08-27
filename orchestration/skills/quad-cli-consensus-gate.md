# Skill: Quad CLI Consensus Gate

> **When:** High-risk diffs, gated merges, pre-merge audits where you want multiple independent CLI reviewers and fewer one-off hallucination blocks

## Decision Matrix

| Signal | Use the consensus gate? |
|--------|:------------------------:|
| Significant PR before merge | ✅ Yes, as an **additive** signal alongside human review and SAST |
| Need to reduce single-reviewer bias | ✅ Yes |
| CI required check for protected branches | ⚠️ Allowed only **combined with** human review + SAST — see Security Handling |
| Security-sensitive or high-blast-radius change | ❌ Do not use as the sole/required gate — see Security Handling |
| Every local commit | ❌ Usually too expensive |
| Tiny typo/docs-only change | ❌ Skip it |
| Fast inner-loop feedback | ❌ Use one reviewer first |

## Concept

Run the same review prompt in parallel across four spoke CLIs:

- `claude`
- `codex`
- `cursor-agent`
- `agy`

The implementation lives in `scripts/quad-cli-orchestrate.mjs`. Each runner must return JSON matching `schemas/quad-cli-report.json`.
The orchestrator normalizes findings, injects `source_cli`, anchors each finding to the diff hunk that actually contains its
reported line (see "Consensus Anchoring" below), and only marks a finding as **blocking** when **at least 2 distinct model
families** (not CLI names — see `schemas/backend-families.json`) agree on the same path + normalized rule + changed hunk.

This is an ensemble/debate pattern: single-reviewer findings stay advisory, consensus findings fail the gate.

## Why Use It

- Reduce single-reviewer false positives
- Force independent agreement before blocking CI
- Combine complementary model strengths
- Keep the merge gate structured and machine-readable

## Cost Caveats

This runs **4 external CLIs in parallel**, so it is slower and more expensive than a single review. Prefer it for:

- protected-branch required checks (combined with human review, not standalone)
- major refactors
- release or migration gates

Do **not** run it on every tiny local iteration unless the extra cost is justified.

## Consensus Anchoring (hunk-based, not line buckets)

Findings are grouped for consensus by `(normalized path, normalized rule_id, changed-hunk id)`, where the hunk id is derived by parsing the diff's own `@@ -old +new,len @@` headers — **not** by rounding the reported line to a fixed-width bucket. This matters for two failure modes a naive bucket produces:

- **Missed agreement:** two CLIs reporting the same real bug at lines that straddle a bucket boundary (e.g. line 10 vs. line 11) would land in different buckets and never be recognized as consensus.
- **False agreement:** two CLIs reporting two *unrelated* bugs that happen to round into the same bucket would be merged into one finding and could become "blocking" together.

Hunk anchoring fixes both: any line inside the same changed hunk maps to the same hunk id (fixing missed agreement), while unrelated regions of a file — or different hunks — never share a hunk id (fixing false agreement).

**Findings with no `line`, or a `line` outside every changed hunk, can never be blocking.** There is no reliable location signal to justify treating them as the same issue as another finding, so each such finding is kept as its own separate advisory-only entry — it is never merged with anything else, no matter how many CLIs report the same rule_id.

## Invocation Contract

`scripts/quad-cli-orchestrate.mjs` resolves each command on `PATH` before spawning it. On Windows, launcher priority is `.exe` → `.cmd` → `.bat` → `.ps1`; command shims run through an explicit `cmd.exe` or PowerShell launcher, never `shell: true`.

| Tool | Non-interactive invocation | Prompt transport | Launcher notes |
|---|---|---|---|
| `claude` | `claude -p` | stdin | native executable or an explicitly resolved command shim |
| `codex` | `codex exec --skip-git-repo-check` | stdin | Do not add `--output-schema`; the report schema has optional finding fields that Codex's schema mode cannot represent |
| `cursor-agent` | `cursor-agent -f -p` | stdin | `-f` accepts workspace trust; `--force` is not needed for this read-only review |
| `agy` | `agy -p <prompt> --mode plan --sandbox --print-timeout <internal>` | argv for a native executable below 24,000 rendered UTF-16 units; otherwise an isolated file reference | A `.cmd`/`.ps1` shim always uses file-reference transport. Do not add `--json-schema`; default output is the compatible mode |

Launcher resolution produces one of `native-exe`, `cmd-shim`, `ps1-shim`, or `not-found`. Native executables run directly. Command shims run as `cmd.exe /d /s /c <serialized command>`; PowerShell shims run as `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <path>`. Missing commands are reported as `unavailable` without a retry.

### Why transport differs by tool

Claude, Codex, and Cursor Agent accept the diff-bearing prompt on stdin. Antigravity's `-p` flag requires the prompt as its value and does not consume the prompt from stdin.
A native Antigravity executable therefore uses argv only below 24,000 rendered UTF-16 code units. This is intentionally below Windows' command-line ceiling; an unexpected `ENAMETOOLONG` immediately falls back once to file-reference transport rather than retrying the same invocation.

File-reference transport creates a dedicated temporary directory containing only one prompt file. The bootstrap includes that file's absolute path, UTF-8 byte count, and SHA-256 and grants Antigravity access only to that directory.
Cleanup runs on success, failure, retry, and timeout; cleanup failures are reported rather than hidden. The prompt file is never placed in the repository and the system temp root is never granted wholesale.

`--max-prompt-bytes` (default `262144`, or 256KB) remains the defensive payload cap. It bounds actual UTF-8 prompt bytes, while the Antigravity argv decision separately measures the fully serialized Windows command line in UTF-16 units.

### Verified scope

The transport behavior was verified on Windows on 2026-08-20, not on macOS or Linux.

| Host | Node | CLI inventory used for the measurement |
|---|---|---|
| Four-CLI measurement host | `v26.4.0` | Claude `2.1.237`, Codex `0.146.1`, Antigravity `1.1.15`, Cursor Agent current as of 2026-08-20 |
| npm-shim regression host | `v22.23.1` | Codex `0.148.0`; Claude, Cursor Agent, and Antigravity absent |

Large Antigravity prompts use file-reference transport and can take substantially longer; the observed maximum was 219 seconds. These measurements are compatibility evidence, not a latency SLA.

> **Release note:** restoring additional valid reviewers can increase the number of model-family pairs and therefore produce more BLOCKING findings; the repaired gate can be stricter than the degraded two-reviewer behavior.

## Model Family Voting (B2)

CLI names are not the same as independent opinions: some spoke CLIs are multi-model and can be configured to run on the same underlying model as another spoke. `agy` (Antigravity CLI) in particular can run on Gemini, Claude, or GPT-OSS depending on configuration.

`schemas/backend-families.json` maps each CLI to its effective model family. Consensus is counted by **distinct family**, not
distinct CLI name — two CLIs sharing a family count as **one effective vote**, exposed in the merged report as `effective_votes`.
The default mapping conservatively assumes `agy` shares `claude`'s family (`anthropic-claude`) unless you have pinned `agy` to a
different `--model` and updated the config accordingly. If you want true 4-way diversity, pin `agy` to `--model gemini` or
`--model gpt-oss` and `cursor-agent` to a non-Claude model, then update `schemas/backend-families.json` to match your actual
configuration.

## Input Diff Contract

Supported diff sources:

- `--base <ref> --head <ref>` → review `git diff <base>...<head>`
- `--staged` → review `git diff --cached`
- default when neither is provided: `origin/main...HEAD`

Not supported as the default:

- unstaged plain `git diff` (too ambiguous for a gate)

Filtering and caps:

- binary diffs are omitted from the prompt body and replaced with a path-only notice
- rename-only diffs are omitted from the prompt body and replaced with a path-only notice
- untracked files are excluded by default
- `--include-untracked` adds untracked file **path notices only**
- `--max-lines <n>` defaults to `4000` (bounds changed-line **count**, not prompt byte size)
- `--max-files <n>` defaults to `60`
- `--max-prompt-bytes <n>` defaults to `262144` (bounds the actual prompt **byte size** sent over stdin; see "Why stdin, not argv")

If any cap is exceeded, the gate is **skipped with a warning on stderr** and exits `0`.

## Security Handling

- This gate is a **best-effort, additive** signal for reducing single-reviewer false positives. **It is not a security guarantee and must never be the sole or required check for security-sensitive or protected-branch changes** — pair it with human review and existing SAST/security tooling, which it does not replace.
- Because a lone finding is deliberately downgraded to advisory (see Consensus Anchoring), this gate is structurally biased toward false negatives over false positives. Do not interpret "no blocking findings" as "no issues" — it means "no *cross-model-family agreement*", which is a weaker claim.
- The diff is treated as **untrusted data**: the prompt wraps it in clear `<diff>...</diff>` delimiters and explicitly instructs each reviewer to treat it as data, not instructions. This reduces, but does not eliminate, prompt-injection risk — a sufficiently adversarial diff could still influence multiple reviewers correlated by shared training data or shared backend model (see Model Family Voting).
- Reviewers are required to return JSON only, and the orchestrator enforces schema validation.
- The orchestrator never executes shell commands suggested by a runner's output.
- Raw diff content is **not written to logs**.
- Returned snippets are minimized before they are emitted in the merged report.
- **Policy decision needed:** whether to allow this gate as a protected-branch required check is a team policy decision, not a tooling decision. The recommended default is: allowed only when combined with human review and SAST as required checks in the same branch protection rule, and never as the sole gate for security-sensitive changes.

## Flags

| Flag | Meaning |
|------|---------|
| `--base <ref>` | Base ref for `git diff <base>...<head>` |
| `--head <ref>` | Head ref for `git diff <base>...<head>` |
| `--staged` | Review `git diff --cached` instead of a base/head range |
| `--include-untracked` | Add untracked file path notices |
| `--max-lines <n>` | Skip gate above this changed-line count (does not bound prompt byte size — see `--max-prompt-bytes`) |
| `--max-files <n>` | Skip gate above this changed-file count |
| `--max-prompt-bytes <n>` | Skip gate above this prompt byte size; default `262144` |
| `--advisory-only` | Never fail the gate outright for below-minimum reviewers; still exits `3` on total (zero-reviewer) outage unless `--allow-zero-reviewers` is also set |
| `--min-reviewers <n>` | Minimum valid reviewers required to trust consensus; default `2`. Below this, the report is marked `status: "advisory-degraded"` |
| `--artifact <path>` | Write the final validated report object to the given JSON file as well as stdout; omitted by default |
| `--allow-zero-reviewers` | Allow a run with **zero** valid reviewers to exit `0` (marked `status: "no-reviewers"`) instead of exit `3`. Without this flag, zero reviewers always exits `3`, even under `--advisory-only` |
| `--timeout <ms>` | Override every per-runner timeout. Defaults are Claude `120000`, Codex `240000`, Cursor Agent `240000`, and Antigravity `360000`; `QUAD_CLI_TIMEOUT_<TOOL>_MS` or `QUAD_CLI_TIMEOUT_MS` can override them without code changes |
| `--gate-timeout <ms>` | Whole parallel gate deadline including one transient retry; default `725000`, also configurable with `QUAD_CLI_GATE_TIMEOUT_MS` |
| `--diff-file <path>` | Test-only convenience flag to read a unified diff from a file instead of git |

Mock/test execution is controlled solely by the `QUAD_CLI_MOCK_DIR` environment variable (see Usage Examples) — there is no separate test-mode flag to keep in sync with it.

> `--min-reviewers` defaults to `2` and stays there. Four reviewers running successfully does not
> raise the bar, because reviewer *availability* fails for reasons unrelated to review quality —
> expired OAuth, transient network, a launcher that is not on this machine. Measurement supports
> rejecting `4` as a gate threshold; it does not establish that any specific higher number is better.
> What the contract requires instead is that a run records **which reviewers were declared, which
> were effective, and why the rest dropped out**, so a degraded run is never mistaken for a healthy one.

Timeout cleanup targets the runner's process tree (`taskkill /T /F` on Windows and a detached process group on POSIX). This is best-effort: PID reuse and process-snapshot races mean the orchestrator records what it attempted but does not claim that every descendant was certainly terminated.
Antigravity's internal `--print-timeout` stays shorter than its outer timeout (five minutes under the default six-minute outer timeout), so diagnostics can distinguish which layer stopped the run.

## Structured Output Contract

Each raw reviewer must emit JSON matching `schemas/quad-cli-report.json`:

```json
{
  "schema_version": "1",
  "generated_by": "quad-cli-orchestrate",
  "findings": [
    {
      "path": "src/routes/user.js",
      "rule_id": "missing-null-check",
      "severity": "critical",
      "message": "response.data may be null before property access",
      "line": 24,
      "snippet": "const userId = response.data.profile.id;"
    }
  ]
}
```

The parser accepts one complete JSON value, one complete outer JSON Markdown fence, or a measured successful Cursor Agent/Antigravity envelope. It never guesses by slicing from the first `{` to the last `}`; narration containing a schema-valid fake report is rejected.
Unknown top-level metadata is ignored and reported, while every finding remains strict—one malformed finding invalidates that reviewer's entire report.

Each runner emits exactly one bounded stderr diagnostic with its resolved launcher, status, failure class, exit code, elapsed time, rendered command-line units, output bytes, and a sanitized reason. Only observed transient network failures receive one retry.
Missing launchers, invalid invocations, authentication rejection, timeouts, and invalid/schema-invalid responses do not retry; Antigravity `ENAMETOOLONG` is a transport fallback rather than a retry.

The merged orchestrator output extends each finding with:

- `blocking: true | false` — `true` only if `effective_votes >= 2` **and** the finding is anchored to a real changed hunk
- `contributors: ["claude", "codex"]` — the raw CLI names that reported this finding
- `families: ["anthropic-claude", "openai-gpt"]` — the distinct model families among the contributors (see Model Family Voting)
- `effective_votes: 2` — `families.length`; this is what actually gates `blocking`, not `contributors.length`

The top-level report additionally carries, when relevant:

- `status: "advisory-degraded" | "no-reviewers"` — present only when reviewer count is below `--min-reviewers` or zero
- `reviewers_effective: N` — the number of CLIs that returned schema-valid output this run

The following two fields are **only** populated when the caller passes `--artifact <path>` — unlike
`status`/`reviewers_effective`, which are always present when relevant, these carry an additional
per-tool CLI re-invocation cost (see below) that is not paid on a default run:

- `reviewers` — the declared and effective tool names, transport-integrity nonce status per declared
  tool (see Transport-Integrity Nonce), plus structured stage/cause diagnostics for every dropped reviewer
- `environment` — the orchestrator commit, OS/architecture, Node version, and per-tool CLI versions

> **Cost of `--artifact`:** populating `environment.cli_versions` re-invokes every declared CLI with
> `--version` (up to four sequential, 10-second-capped `spawnSync` calls) even for tools that already
> ran successfully in the main review. This happens **after** the gate-timeout-bounded review phase, so
> it can add up to ~40s of wall-clock time that is **not** covered by `--gate-timeout`. Mock runs
> (`QUAD_CLI_MOCK_DIR`) skip the real spawn and resolve instantly.

## Transport-Integrity Nonce

A schema-valid JSON response only proves a reviewer returned *some* well-formed report — it does not
prove the reviewer actually received and processed the *entire* prompt this run sent it. A truncated
transport, a stale cached response, or a model silently working from a partial prompt can all still
produce schema-valid JSON.

Each run generates a random per-run token (`transport_nonce`, 16 hex characters) and instructs every
reviewer to echo it back verbatim as a top-level `transport_nonce` string field. The instruction and
token are placed **after** the `<diff>...</diff>` block in the prompt, not before it — the realistic
failure mode is tail truncation of the (usually large) diff body, not truncation of the short
instructions header, so the token is only reachable once the reviewer has received the whole diff. Any
truncation before that point yields `not-echoed`, never a false `confirmed`.

The orchestrator compares the echoed value against the token it issued and records one of four states
per declared tool in `reviewers.nonce_status` (only present under `--artifact`, alongside the rest of
`reviewers`):

| Status | Meaning |
|--------|---------|
| `confirmed` | The reviewer echoed the exact token — positive proof it received this run's full, unmodified prompt. |
| `mismatch` | The reviewer echoed a *different* value. This is unambiguous: the transport or the reviewer altered the prompt, so the report is dropped from consensus even though its JSON was otherwise schema-valid (`stage: "response"`, `primary_cause: "transport-integrity"`). |
| `not-echoed` | No `transport_nonce` field was present. This is **deliberately not a failure** — an older CLI or a model that never echoes unrecognized fields is indistinguishable, from the orchestrator's side, from one that silently ignored the instruction. Recorded for observability only; does not affect `reviewers_effective` or `blocking`. |
| `unavailable` | The reviewer never produced a parseable response at all (resolve/spawn/transport failure) — there was nothing to check the nonce against. |

`QUAD_CLI_TRANSPORT_NONCE` overrides the generated token for deterministic test fixtures; it is
test-only and must never be set for a production run (a fixed token defeats the transport-integrity
guarantee the mechanism exists to provide).

Normalized matching uses repo-relative paths with forward slashes. Paths are **not blindly lowercased** by default — `rule_id` normalization **is** lowercased (via `schemas/rule-aliases.json` alias resolution), since rule identifiers are conventionally case-insensitive across tools while file paths are not.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Pass, skipped due to a size/byte cap, or a degraded-but-tolerated reviewer outage (`--advisory-only`, or zero reviewers with `--allow-zero-reviewers`) |
| `1` | Blocking consensus finding(s) found |
| `2` | The orchestrator itself failed before a trustworthy review run was possible (for example: bad arguments, git diff failure, unreadable repo state) |
| `3` | Fewer than `--min-reviewers` (default `2`) returned schema-valid output. **Zero reviewers always exits `3` unless `--allow-zero-reviewers` is set — this is not suppressed by `--advisory-only` alone**, to avoid a total CLI outage silently reporting as a pass |

With `--advisory-only`, a nonzero-but-below-minimum reviewer count exits `0` instead of `3` (with `status: "advisory-degraded"` in the report); a **zero**-reviewer outage still exits `3` unless `--allow-zero-reviewers` is also set.

## Live Smoke Preflight

The smoke scripts run a fixed small diff through the orchestrator. They are local preflight commands and are intentionally not part of `npm test` or CI.

| Command | Code | Meaning |
|---------|------|---------|
| `npm run smoke:quad` | `0` | All four declared reviewers returned schema-valid output |
| `npm run smoke:quad` | `1` | At least one declared reviewer was unavailable, unauthenticated, or non-compliant |
| `npm run smoke:quad:available` | `0` | All four declared reviewers were available and returned schema-valid output |
| `npm run smoke:quad:available` | `4` | At least one declared reviewer was missing or invalid; the command prints `status="degraded"` and names each dropped tool |

## Usage Examples

### Base/Head Range

```powershell
node scripts/quad-cli-orchestrate.mjs --base origin/main --head HEAD
```

### Staged Diff

```powershell
node scripts/quad-cli-orchestrate.mjs --staged
```

### Test Mode with Mock Reviewers

```powershell
$env:QUAD_CLI_MOCK_DIR = "tests/fixtures/quad-cli/mock-responses"
node scripts/quad-cli-orchestrate.mjs `
  --diff-file tests/fixtures/quad-cli/sample.diff
```

## CI Example

Use the script as a required GitHub Actions check — **combined with** human review and SAST, per the Security Handling policy above:

```yaml
- name: Quad CLI consensus gate
  run: node scripts/quad-cli-orchestrate.mjs --base origin/${{ github.base_ref }} --head HEAD
```

Treat exit `1` as the required-check failure for blocking consensus findings.

## See Also

- [Delegate to Claude](delegate-to-claude.md)
- [Delegate to Codex](delegate-to-codex.md)
- [Delegate to Cursor](delegate-to-cursor.md)
- [Delegate to Antigravity](delegate-to-antigravity.md)
