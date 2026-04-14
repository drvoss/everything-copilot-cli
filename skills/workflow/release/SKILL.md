---
name: release
description: Use when a sprint or feature is complete and ready to ship — tags the version, generates GitHub Release notes, runs rollout or smoke verification, and publishes to npm/PyPI/Docker registries.
metadata:
  category: workflow
  agent_type: general-purpose
---

# Release

## When to Use

- After completing a sprint and CHANGELOG `[Unreleased]` section is ready
- When tagging a version for production deployment
- As the final step in the `commit-workflow` → `add-to-changelog` → **`release`** pipeline

## Prerequisites

- `CHANGELOG.md` has a populated `[Unreleased]` section
- All commits for this release are on the target branch (usually `main`)
- CI passes on the target branch

## Workflow

### 1. Confirm CHANGELOG is Ready

```powershell
# Review Unreleased changes
$changelog = Get-Content CHANGELOG.md
$unreleased = $changelog | Select-String -Pattern '\[Unreleased\]' -Context 0, 30
$unreleased.Context.PostContext

# Confirm there are actual changes
if ($unreleased -match 'Added|Changed|Fixed|Security|Removed|Deprecated') {
    Write-Host "✅ CHANGELOG has content — ready to release"
} else {
    Write-Host "⚠️  [Unreleased] section is empty — nothing to release"
}
```

### 2. Determine the Next Version

Use [Semantic Versioning](https://semver.org/):

| Change type | Version bump | Example |
|-------------|-------------|---------|
| Bug fixes only | PATCH | `1.2.3` → `1.2.4` |
| New features (backwards-compatible) | MINOR | `1.2.3` → `1.3.0` |
| Breaking changes | MAJOR | `1.2.3` → `2.0.0` |

```powershell
# Get current version
$currentTag = git --no-pager describe --tags --abbrev=0 2>$null
if (-not $currentTag) { $currentTag = "v0.0.0" }
Write-Host "Current: $currentTag"

# Decide next version
$nextVersion = "1.3.0"  # Set this based on the change type above
```

### 3. Promote CHANGELOG [Unreleased] to Versioned Section

```powershell
$version = $nextVersion  # e.g. "1.3.0"
$date = Get-Date -Format "yyyy-MM-dd"

$changelog = Get-Content CHANGELOG.md -Raw

# Replace [Unreleased] header with versioned section and add new empty [Unreleased]
$newContent = $changelog -replace '## \[Unreleased\]', "## [Unreleased]`n`n## [$version] - $date"
Set-Content CHANGELOG.md $newContent

# Add version comparison link at bottom (optional but recommended)
$repoUrl = git remote get-url origin -replace '\.git$', ''
$prevVersion = $currentTag -replace '^v', ''
"`n[$version]: $repoUrl/compare/v$prevVersion...v$version" | Add-Content CHANGELOG.md
```

### 4. Sync Version in Package Manifest

**Node.js (package.json):**

```powershell
$pkg = Get-Content package.json | ConvertFrom-Json
$pkg.version = $version
$pkg | ConvertTo-Json -Depth 10 | Set-Content package.json

# Commit the version bump
git add CHANGELOG.md package.json
git commit -m "🔖 chore(release): bump version to v$version"
```

**Python (pyproject.toml):**

```powershell
(Get-Content pyproject.toml) -replace 'version = ".*"', "version = `"$version`"" |
  Set-Content pyproject.toml

git add CHANGELOG.md pyproject.toml
git commit -m "🔖 chore(release): bump version to v$version"
```

**Go (no manifest version — tag only):**

```powershell
# Go uses git tags as the version source — skip manifest update
git add CHANGELOG.md
git commit -m "🔖 chore(release): update changelog for v$version"
```

### 5. Create and Push the Git Tag

```powershell
$tag = "v$version"

# Annotated tag (preferred — shows up in GitHub Releases)
git tag -a $tag -m "Release $tag"

# Push commits and tag
git push origin main
git push origin $tag
```

### 6. Create GitHub Release

**Via `gh` CLI (recommended):**

```powershell
# Extract release notes from CHANGELOG
$changelog = Get-Content CHANGELOG.md -Raw
# Match the current version section content
$pattern = "## \[$version\][^\n]*\n([\s\S]*?)(?=\n## \[)"
$match = [regex]::Match($changelog, $pattern)
$releaseNotes = $match.Groups[1].Value.Trim()

# Create the GitHub Release
gh release create $tag `
  --title "Release $tag" `
  --notes $releaseNotes `
  --target main
```

**Via GitHub MCP (Copilot-native):**

```text
> Create a GitHub Release for tag v1.3.0 on drvoss/my-app.
> Use the following release notes from CHANGELOG.md:
> [paste the version section content]
```

### 7. Run Rollout or Smoke Verification

After the tag and GitHub Release exist, verify the release in the smallest safe blast radius.

**For deployed services or apps:**

Use [`deployment-canary`](../deployment-canary/SKILL.md) before broad rollout:

```text
> Start a canary for release [version].
> Define the watch window, primary signals, and rollback thresholds.
> Tell me whether to PROMOTE, HOLD, or ROLLBACK.
```

**For libraries and CLIs with no runtime rollout:**

Run the narrowest possible smoke verification before public publish:

```powershell
# Example: install the package tarball in a clean temp folder
npm pack
$tarball = Get-ChildItem -Filter "*.tgz" | Select-Object -First 1

New-Item -ItemType Directory -Force -Path ".release-smoke" | Out-Null
Push-Location ".release-smoke"
npm init -y
npm install "..\$($tarball.Name)"
Pop-Location
```

If the verification fails, fix the issue before public promotion.

### 8. Publish Package (If Applicable)

**npm:**

```powershell
npm publish
# For scoped packages: npm publish --access public
```

**PyPI:**

```powershell
python -m build
twine upload dist/*
```

**Docker:**

```powershell
docker build -t myimage:$version -t myimage:latest .
docker push myimage:$version
docker push myimage:latest
```

## Examples

### Full Node.js Release

```powershell
$version = "2.1.0"
$date = Get-Date -Format "yyyy-MM-dd"

# 1. Promote changelog
$cl = Get-Content CHANGELOG.md -Raw
$cl -replace '## \[Unreleased\]', "## [Unreleased]`n`n## [$version] - $date" |
  Set-Content CHANGELOG.md

# 2. Bump package.json
$pkg = Get-Content package.json | ConvertFrom-Json
$pkg.version = $version
$pkg | ConvertTo-Json -Depth 10 | Set-Content package.json

# 3. Commit, tag, push
git add CHANGELOG.md package.json
git commit -m "🔖 chore(release): bump version to v$version"
git tag -a "v$version" -m "Release v$version"
git push origin main && git push origin "v$version"

# 4. GitHub Release
gh release create "v$version" --generate-notes --title "Release v$version"
```

### Minimal Tag-Only Release (Go / CLI tools)

```powershell
# Just tag and push — GoProxy and GitHub handle the rest
git tag -a "v1.2.0" -m "Release v1.2.0"
git push origin "v1.2.0"
gh release create "v1.2.0" --generate-notes
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'll fill in the CHANGELOG after release" | Writing the CHANGELOG post-release requires interpreting commit history. Write it before releasing. |
| "Just patch it without bumping the version" | Without a version bump, you can't tell which version is running in production. |
| "Tests already passed" | There may be changes merged since the last test run. Execute a full test run immediately before release. |
| "It's a hotfix, skip the process" | Especially for hotfixes, follow the process. Panicked changes create more problems. |

## Red Flags

- Deploying directly to main without a version tag
- CHANGELOG filled only with vague entries like "various fixes"
- No canary or smoke verification before wider rollout
- Semantic versioning violations (bumping patch version for a breaking change)

## Verification

- [ ] `npm test` (or CI) fully passes
- [ ] CHANGELOG records this version's changes (breaking changes explicitly noted)
- [ ] Git tag created in `v{version}` format
- [ ] GitHub Release notes written
- [ ] Canary or smoke verification completed for the release type
- [ ] npm/PyPI/Registry publish confirmed successful

## Tips

- **`--generate-notes` is your friend**: `gh release create` can auto-generate notes from merged PRs since the last tag — combine with CHANGELOG for best results
- **Annotated tags > lightweight tags**: annotated tags appear in GitHub Releases and `git describe`
- **Tag before publishing**: always push the tag before publishing to npm/PyPI — the tag is the source of truth for the version
- **Check CI first**: confirm the branch is green before tagging (`gh pr view` or check Actions)
- **Release is not the end**: for runtime systems, promotion should be gated by a canary, not by hope
- **Hotfix releases**: for patch fixes, create from a release branch, not main — `git checkout -b release/1.2.x v1.2.0`

## See Also

- [`add-to-changelog`](../../documentation/add-to-changelog/SKILL.md) — prepare CHANGELOG before releasing
- [`commit-workflow`](../commit-workflow/SKILL.md) — the start of the pipeline
- [`deployment-canary`](../deployment-canary/SKILL.md) — monitor the release before broad rollout
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases docs](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
