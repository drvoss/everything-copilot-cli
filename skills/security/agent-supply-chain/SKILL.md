---
name: agent-supply-chain
description: >
  Use when auditing an AI agent plugin, skill bundle, or MCP tool package for supply
  chain integrity — generate deterministic SHA-256 manifests, detect modified or
  untracked files, flag unpinned dependencies, and gate promotion to production.
metadata:
  category: security
  agent_type: general-purpose
  origin: adapted from github/awesome-copilot agent-supply-chain (MIT)
---

# Agent Supply Chain

Verify that agent plugins, skill bundles, and MCP packages have not drifted between
review, testing, and deployment.

## When to Use

- Before promoting an agent plugin or MCP bundle from dev to staging or production
- When reviewing third-party skills, plugins, or local MCP servers before adoption
- When a repository needs deterministic integrity evidence instead of "looks unchanged"
- When dependency pinning and manifest checks should become part of a release gate

## When NOT to Use

| Instead of agent-supply-chain | Use |
|-------------------------------|-----|
| Generic codebase vulnerability review | `security-scan` |
| Repository-wide trust scoring and hygiene review | `evaluate-repository` |
| GitHub Actions workflow exploit review | `gha-security-review` |

## Workflow

### 1. Define the review boundary

Decide exactly what should be covered by the integrity check:

- the plugin or skill directory itself
- its manifest files
- related config such as `.mcp.json`, `package.json`, `requirements.txt`
- any local action or helper scripts that ship with the package

Exclude generated artifacts and cache directories so the manifest stays deterministic.

### 2. Generate a deterministic manifest

Create an `INTEGRITY.json` file with SHA-256 hashes for every tracked source file.

```powershell
$root = "path\\to\\plugin"
$excludeDirs = @(".git", "node_modules", "__pycache__", ".venv", ".pytest_cache")
$excludeFiles = @("INTEGRITY.json", ".DS_Store", "Thumbs.db")

$files = Get-ChildItem -Path $root -Recurse -File |
  Where-Object {
    $relative = $_.FullName.Substring((Resolve-Path $root).Path.Length + 1)
    -not ($excludeFiles -contains $_.Name) -and
    -not ($excludeDirs | Where-Object { ($relative -split '[\\/]') -contains $_ })
  } |
  Sort-Object FullName

$manifestFiles = @{}
foreach ($file in $files) {
  $relative = $file.FullName.Substring((Resolve-Path $root).Path.Length + 1).Replace('\', '/')
  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToLower()
  $manifestFiles[$relative] = $hash
}

$chain = [System.Security.Cryptography.SHA256]::Create()
$joined = ($manifestFiles.Keys | Sort-Object | ForEach-Object { $manifestFiles[$_] }) -join ""
$manifestHash = [Convert]::ToHexString($chain.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($joined))).ToLower()

$manifest = [ordered]@{
  plugin_name = Split-Path $root -Leaf
  generated_at = (Get-Date).ToUniversalTime().ToString("o")
  algorithm = "sha256"
  file_count = $manifestFiles.Count
  files = $manifestFiles
  manifest_hash = $manifestHash
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $root "INTEGRITY.json")
```

### 3. Verify integrity before trusting the package

Re-hash current files and compare them against `INTEGRITY.json`.

Classify mismatches into:

- `MODIFIED` — file exists but hash changed
- `MISSING` — file was recorded but no longer exists
- `UNTRACKED` — new file exists but is not part of the manifest

```powershell
$root = "path\\to\\plugin"
$manifest = Get-Content -Raw (Join-Path $root "INTEGRITY.json") | ConvertFrom-Json -AsHashtable
$errors = @()

foreach ($entry in $manifest.files.GetEnumerator()) {
  $path = Join-Path $root $entry.Key
  if (-not (Test-Path -LiteralPath $path)) {
    $errors += "MISSING: $($entry.Key)"
    continue
  }

  $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToLower()
  if ($actual -ne $entry.Value) {
    $errors += "MODIFIED: $($entry.Key)"
  }
}
```

Do not treat a package as promotion-ready until the manifest matches and untracked files
are explained.

### 4. Audit dependency pinning

The manifest proves what files exist. It does not prove those files resolve to stable
dependencies.

Check for:

- `package.json` ranges like `^`, `~`, `*`, or `latest`
- `requirements.txt` lower bounds with no upper bound
- MCP launch arguments that pull `@latest`
- missing lock files for ecosystems that rely on them

```powershell
git --no-pager grep -n "\"\\^|\"~|\"\\*|latest" -- "package.json"
git --no-pager grep -n ">=.*$" -- "requirements.txt" "pyproject.toml"
git --no-pager grep -n "@latest" -- ".mcp.json" "*.json" "*.yaml" "*.yml"
```

### 5. Gate promotion with explicit criteria

Promote only when all of the following are true:

- `INTEGRITY.json` exists
- all recorded files verify
- no unexplained untracked files remain
- dependency versions are pinned or intentionally constrained
- required metadata files exist (`README.md`, plugin manifest, license if needed)

Use a simple status table in review notes:

| Check | Status | Notes |
|-------|--------|-------|
| Integrity manifest present | ✅ / ❌ | |
| Manifest verification clean | ✅ / ❌ | |
| No unpinned dependencies | ✅ / ❌ | |
| Required metadata present | ✅ / ❌ | |
| Ready for promotion | ✅ / ❌ | |

### Cryptographic Provenance Verification

SHA-256 manifest integrity proves files have not drifted. Cryptographic provenance adds a
stronger guarantee: it binds the publisher's identity to the artifact at signing time.

This addresses OWASP AST01 (Skill Supply Chain Integrity) and AST02 (Unauthorized Skill Modification).

#### Publisher Identity Binding

When a skill or plugin is published, the publisher signs the manifest with an asymmetric key.
Consumers verify the signature before trusting the package.

Minimum requirements:

- The signing key is associated with the publisher's verified identity (e.g., GitHub identity, GPG key)
- The signature covers the manifest hash (not individual files)
- The signature and public key fingerprint are shipped alongside `INTEGRITY.json`

```text
INTEGRITY.json
INTEGRITY.sig         # detached signature over the manifest hash
INTEGRITY.pubkey.asc  # publisher's public key fingerprint (for offline verification)
```

Verification checklist (cryptographic):

- [ ] Signature file is present alongside `INTEGRITY.json`
- [ ] Signature was produced by the expected publisher key
- [ ] The signed data matches `manifest_hash` in `INTEGRITY.json`
- [ ] The public key fingerprint is pinned in your trust store, not fetched dynamically

Verification example using `gpg` (detached signature):

```powershell
# Import the publisher's key (once, pinned to fingerprint)
gpg --import INTEGRITY.pubkey.asc

# Verify the detached signature against the manifest
gpg --verify INTEGRITY.sig INTEGRITY.json
# Expected: "Good signature from <publisher identity>"
```

Or with `cosign` for container-registry-style trust chains:

```powershell
cosign verify-blob --key publisher.pub --signature INTEGRITY.sig INTEGRITY.json
```

#### Revocation Infrastructure

A signed package that is later compromised must be revocable. Check that the publisher provides:

- A revocation list or endpoint (e.g., `REVOKED.json`, CRL, or OCSP-equivalent)
- A documented process for how consumers are notified when a package is revoked
- A timestamp on the revocation so consumers know when it took effect

Revocation check before promotion:

```text
1. Fetch the publisher's revocation list
2. Confirm the package version + manifest_hash is not listed as revoked
3. Record the revocation check timestamp in your promotion notes
```

If a revocation infrastructure does not exist for a third-party skill, treat the package as
lower-trust and apply stricter sandbox isolation (see `sub-agent-sandboxing`).

#### AST01 / AST02 Alignment

| OWASP Risk | Mitigation |
|-----------|-----------|
| **AST01** — Supply chain compromise via unverified source | Publisher identity binding + signed manifest |
| **AST02** — Unauthorized modification after publish | SHA-256 manifest diff + signature re-verification before each use |

Do not substitute "we downloaded it from an official source" for a signature check.
Official sources can be compromised; the signature proves the publisher's key was used.

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The files were reviewed, so integrity is implied." | Post-review edits, generated artifacts, or local tampering can still change what ships. |
| "Only one helper script changed." | A one-line helper change can become the whole attack path. |
| "Version ranges are fine because the package manager resolves them." | Range-based installs mean production can receive code that was never reviewed. |

## Red Flags

- `INTEGRITY.json` is missing or regenerated after review without explanation
- Extra files appear in the package directory after the manifest was created
- Dependencies use `*`, `latest`, or broad semver ranges in production paths
- MCP server install args depend on floating tags
- The package cannot show a clean path from reviewed source to deployed artifact

## Verification

- [ ] The manifest excludes caches, vendored dependencies, and generated files
- [ ] All manifest entries hash cleanly with SHA-256
- [ ] Modified, missing, and untracked files are classified explicitly
- [ ] Dependency manifests were checked for floating versions
- [ ] Promotion is blocked when integrity or pinning checks fail
- [ ] Publisher signature is verified against a pinned key fingerprint
- [ ] Revocation list was consulted before promotion

## See Also

- [`gha-security-review`](../gha-security-review/SKILL.md) - review GitHub Actions workflows that build or promote packages
- [`agent-owasp-check`](../agent-owasp-check/SKILL.md) - audit agent systems against OWASP ASI risks
- [`evaluate-repository`](../evaluate-repository/SKILL.md) - broader repository trust and configuration review
