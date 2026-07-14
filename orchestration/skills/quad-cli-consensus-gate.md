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

`scripts/quad-cli-orchestrate.mjs` uses these non-interactive commands. The diff-bearing prompt is sent over **stdin**, not argv — see "Why stdin, not argv" below.

| Tool | Non-interactive invocation | Notes |
|---|---|---|
| `claude` | `claude -p` (prompt on stdin) | Orchestrator/primary reasoning |
| `codex` | `codex exec --skip-git-repo-check` (prompt on stdin) | Codex's `exec` subcommand reads and reports a `<stdin>` input block when piped; this is expected, not an error |
| `cursor-agent` | `cursor-agent -f -p` (prompt on stdin) | `-f` (trust) is required or it exits with "Workspace Trust Required"; `--force` enables edits and is not needed for this read-only review |
| `agy` | `agy -p` (prompt on stdin, optionally `--sandbox`) | Antigravity CLI, multi-model backend — see "Model Family Voting" below |

Each CLI is spawned directly with `child_process.spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] })` (no shell), and the prompt is written to `child.stdin` and closed with `.end()`. Verify stdin-prompt support for your installed CLI versions with `--help`; if a given CLI does not support stdin prompts, add a file-based (`--file`/`@path`) fallback for that tool rather than reverting to argv.

### Why stdin, not argv

Passing the diff-bearing prompt as a single argv element is bounded by the OS argv limit (~32K characters on Windows) — and **`--max-lines` does not protect against this**, because it caps the changed-line *count*, not the prompt's *byte size*. A diff well under the line cap can still contain very long lines and blow past the argv limit. The orchestrator therefore:

1. Sends the prompt over stdin (no OS argv limit).
2. Additionally enforces `--max-prompt-bytes` (default `262144`, i.e. 256KB) as a defensive upper bound — if exceeded, the gate is skipped with a clear stderr warning and exit `0`, the same as the existing size caps.

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
| `--allow-zero-reviewers` | Allow a run with **zero** valid reviewers to exit `0` (marked `status: "no-reviewers"`) instead of exit `3`. Without this flag, zero reviewers always exits `3`, even under `--advisory-only` |
| `--timeout <ms>` | Per-runner timeout; default `120000`. On timeout the runner's entire process tree is terminated, not just the direct child |
| `--diff-file <path>` | Test-only convenience flag to read a unified diff from a file instead of git |

Mock/test execution is controlled solely by the `QUAD_CLI_MOCK_DIR` environment variable (see Usage Examples) — there is no separate test-mode flag to keep in sync with it.

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

The merged orchestrator output extends each finding with:

- `blocking: true | false` — `true` only if `effective_votes >= 2` **and** the finding is anchored to a real changed hunk
- `contributors: ["claude", "codex"]` — the raw CLI names that reported this finding
- `families: ["anthropic-claude", "openai-gpt"]` — the distinct model families among the contributors (see Model Family Voting)
- `effective_votes: 2` — `families.length`; this is what actually gates `blocking`, not `contributors.length`

The top-level report additionally carries, when relevant:

- `status: "advisory-degraded" | "no-reviewers"` — present only when reviewer count is below `--min-reviewers` or zero
- `reviewers_effective: N` — the number of CLIs that returned schema-valid output this run

Normalized matching uses repo-relative paths with forward slashes. Paths are **not blindly lowercased** by default — `rule_id` normalization **is** lowercased (via `schemas/rule-aliases.json` alias resolution), since rule identifiers are conventionally case-insensitive across tools while file paths are not.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Pass, skipped due to a size/byte cap, or a degraded-but-tolerated reviewer outage (`--advisory-only`, or zero reviewers with `--allow-zero-reviewers`) |
| `1` | Blocking consensus finding(s) found |
| `2` | The orchestrator itself failed before a trustworthy review run was possible (for example: bad arguments, git diff failure, unreadable repo state) |
| `3` | Fewer than `--min-reviewers` (default `2`) returned schema-valid output. **Zero reviewers always exits `3` unless `--allow-zero-reviewers` is set — this is not suppressed by `--advisory-only` alone**, to avoid a total CLI outage silently reporting as a pass |

With `--advisory-only`, a nonzero-but-below-minimum reviewer count exits `0` instead of `3` (with `status: "advisory-degraded"` in the report); a **zero**-reviewer outage still exits `3` unless `--allow-zero-reviewers` is also set.

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
- [Delegate to Antigravity](delegate-to-antigravity.md)
