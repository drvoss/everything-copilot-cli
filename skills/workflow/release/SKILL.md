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

The examples below use `v`-prefixed tags (`v1.3.0`). If the repository tags releases another way
(`1.3.0`, `release-1.3.0`), substitute its pattern everywhere a tag appears; step 5 derives it.

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

Use the versioning policy the repository already declares — `CONTRIBUTING.md`, a `RELEASING.md`,
release tooling config (changesets, release-please), or the existing tag pattern. Do not impose
SemVer, CalVer, or a shared catalog version on a repository that declares something else.
If nothing is declared, propose [Semantic Versioning](https://semver.org/) and confirm it first:

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

### 5. Approval Gate — Before Anything Leaves Your Machine

Up to here every change is local and reviewable — including the version-bump commit from step 4,
which has not been pushed. Tagging, pushing, and publishing are not reversible in the same way.

1. Check the proposed tag locally **and** on the remote. A collision is a blocker — never overwrite it.
2. Present one proposal: the exact version changes, tag, release title, full notes, the validation
   evidence (test run, smoke result), and the commands you will run.
3. Wait for explicit approval of **that exact proposal**, then present it again if anything changes:
   - the version changed → set the new `$version` and re-run the block below (it recomputes `$tag`
     and re-checks for collisions); correct the step 3–4 edits in place — do not promote
     `[Unreleased]` a second time or add another commit; stage the files and run
     `git commit --amend -m "<step 4 message with the new version>"`, stopping if
     `$LASTEXITCODE` is not 0
   - only the tag, title, or notes changed → leave the commit alone; they are not in it

```powershell
$version = "1.3.0"   # the version from step 2
# Reuse the prefix in front of the version in the nearest tag ("v", "release-", "node18-v", or none).
# git describe picks the nearest tag reachable from HEAD — check it is the release line you mean.
$lastTag = git --no-pager describe --tags --abbrev=0 2>$null
if ($LASTEXITCODE -ne 0 -or -not $lastTag) { throw "No existing tags — confirm the tag pattern first" }
if ($lastTag -notmatch '^(?<prefix>.*?)\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$') {
  throw "Cannot derive a tag pattern from '$lastTag' — ask before tagging"
}
$tag = "$($Matches['prefix'])$version"

$localHit = git tag --list $tag
if ($LASTEXITCODE -ne 0) { throw "Could not list local tags" }
if ($localHit) { throw "Tag already exists locally: $tag" }
$remoteHit = git ls-remote --tags origin "refs/tags/$tag"
if ($LASTEXITCODE -ne 0) { throw "Could not query origin for tags" }
if ($remoteHit) { throw "Tag already exists on origin: $tag" }
"Proposed tag: $tag"
```

### 6. Create and Push the Git Tag

```powershell
# Keep the approved $tag from step 5; in a new session, set it to that exact value first
if (-not $tag) { throw 'Set $tag to the tag approved in step 5' }

# Annotated tag (preferred — shows up in GitHub Releases). On a resumed run the local tag may
# already exist: reuse it only if it points at HEAD.
git rev-parse -q --verify "refs/tags/$tag" | Out-Null
if ($LASTEXITCODE -eq 0) {
  if ((git rev-parse "$tag^{commit}") -ne (git rev-parse HEAD)) { throw "Local $tag points at another commit — stop" }
  "Local $tag already on HEAD — resuming at push"
} else {
  git tag -a $tag -m "Release $tag"
  if ($LASTEXITCODE -ne 0) { throw "git tag failed — nothing was pushed" }
}

# Push commits, then the tag — stop on the first failure and check the remote before retrying
git push origin main
if ($LASTEXITCODE -ne 0) { throw "Pushing main failed — the tag was not pushed" }
git push origin $tag
if ($LASTEXITCODE -ne 0) { throw "Pushing $tag failed — see Red Flags before retrying" }
```

### 7. Create GitHub Release

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

### 8. Run Rollout or Smoke Verification

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

### 9. Publish Package (If Applicable)

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

These condensed examples assume `v`-prefixed tags and leave out the step 5 approval gate, the
collision checks, and the exit-code checks. In a real release, run steps 5–6 as written and use the
`$tag` step 5 produced wherever a tag appears below.

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
- A version bump that breaks the repository's declared policy (with SemVer, a patch bump for a breaking change)
- Retrying a tag push or `gh release create` that returned an uncertain result without first checking
  what the remote already has — check `git ls-remote --tags origin` and `gh release view $tag`, report
  the partial state, and resume only the missing step. Never create a duplicate, and never delete or
  move a published tag without explicit approval (approval gate and recovery rules adapted from
  `levnikolaevich/claude-code-skills` `ln-62-release-publisher`, MIT)

## Verification

- [ ] `npm test` (or CI) fully passes
- [ ] CHANGELOG records this version's changes (breaking changes explicitly noted)
- [ ] The user approved the exact tag, title, notes, and commands before anything was pushed
- [ ] Git tag created in the format the repository declares (`v{version}` when nothing is declared)
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
