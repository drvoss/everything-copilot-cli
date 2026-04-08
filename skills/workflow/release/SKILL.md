---
name: release
description: Use when a sprint or feature is complete and ready to ship — tags the version, generates GitHub Release notes, and publishes to npm/PyPI/Docker registries.
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

```
> Create a GitHub Release for tag v1.3.0 on drvoss/my-app.
> Use the following release notes from CHANGELOG.md:
> [paste the version section content]
```

### 7. Publish Package (If Applicable)

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
| "CHANGELOG는 나중에 채우겠다" | 릴리즈 후 CHANGELOG 작성은 커밋 히스토리를 해석해야 한다. 릴리즈 전에 작성한다. |
| "버전을 올릴 필요 없이 패치만 배포한다" | 버전 없이 배포하면 어떤 버전이 프로덕션에 있는지 알 수 없다. |
| "테스트는 이미 다 통과했다" | 마지막 테스트 이후 머지된 변경사항이 있을 수 있다. 릴리즈 전 full test run을 실행한다. |
| "Hotfix라서 프로세스를 생략한다" | Hotfix일수록 프로세스를 따른다. 패닉 상태의 변경이 더 많은 문제를 만든다. |

## Red Flags
- 버전 태그 없이 main에 바로 배포
- CHANGELOG가 "various fixes"처럼 모호한 내용으로만 채워짐
- 릴리즈 전 smoke test 없음
- Semantic versioning 규칙 위반 (breaking change인데 patch 버전 올림)

## Verification
- [ ] `npm test` (또는 CI) 전체 통과 확인
- [ ] CHANGELOG에 이번 버전 변경사항 기록됨 (breaking change 명시)
- [ ] git tag가 `v{version}` 형식으로 생성됨
- [ ] GitHub Release 노트 작성 완료
- [ ] npm/PyPI/Registry 배포 성공 확인

## Tips

- **`--generate-notes` is your friend**: `gh release create` can auto-generate notes from merged PRs since the last tag — combine with CHANGELOG for best results
- **Annotated tags > lightweight tags**: annotated tags appear in GitHub Releases and `git describe`
- **Tag before publishing**: always push the tag before publishing to npm/PyPI — the tag is the source of truth for the version
- **Check CI first**: confirm the branch is green before tagging (`gh pr view` or check Actions)
- **Hotfix releases**: for patch fixes, create from a release branch, not main — `git checkout -b release/1.2.x v1.2.0`

## See Also

- [`add-to-changelog`](../../documentation/add-to-changelog/SKILL.md) — prepare CHANGELOG before releasing
- [`commit-workflow`](./commit-workflow/SKILL.md) — the start of the pipeline
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases docs](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
