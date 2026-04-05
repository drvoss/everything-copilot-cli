---
name: add-to-changelog
description: Use when you've shipped a feature, fix, or breaking change and need to update CHANGELOG.md — follows Keep a Changelog format and syncs version numbers across package manifests.
metadata:
  category: documentation
  agent_type: general-purpose
---

# Add to Changelog

## When to Use

- After completing a feature, fix, or breaking change ready for release
- Before tagging a new version — to ensure CHANGELOG is current
- During release prep — to create a new version section with today's date
- As part of `commit-workflow` → `add-to-changelog` → `release` pipeline

## Prerequisites

- Git repository with meaningful commit history
- `CHANGELOG.md` exists or will be created
- Version follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`)

## Workflow

### 1. Locate or Create CHANGELOG.md

```powershell
# Check if CHANGELOG exists
if (-not (Test-Path CHANGELOG.md)) {
    # Create with standard header
    @"
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
"@ | Set-Content CHANGELOG.md
}
```

### 2. Determine the Change Type

| Type | Use for |
|------|---------|
| `Added` | New features, new capabilities |
| `Changed` | Changes to existing functionality |
| `Deprecated` | Features that will be removed in a future release |
| `Removed` | Features that were removed in this release |
| `Fixed` | Bug fixes |
| `Security` | Vulnerability fixes |

### 3. Add Entry to the Right Section

**Option A — Add to `[Unreleased]` (staging for next release):**

```powershell
# Read current CHANGELOG
$changelog = Get-Content CHANGELOG.md -Raw

# Insert under [Unreleased] → Added section
$entry = "- Your change description here"
$changelog = $changelog -replace '(## \[Unreleased\]\s*\n)', "`$1`n### Added`n$entry`n"
Set-Content CHANGELOG.md $changelog
```

**Option B — Create a new versioned section:**

```powershell
$version = "1.2.0"
$date = Get-Date -Format "yyyy-MM-dd"
$newSection = @"

## [$version] - $date

### Added
- New feature description

"@

$changelog = Get-Content CHANGELOG.md -Raw
$changelog = $changelog -replace '(## \[Unreleased\])', "$newSection`$1"
Set-Content CHANGELOG.md $changelog
```

### 4. Sync Version in Package Manifests

```powershell
$version = "1.2.0"

# Node.js
if (Test-Path package.json) {
    $pkg = Get-Content package.json | ConvertFrom-Json
    $pkg.version = $version
    $pkg | ConvertTo-Json -Depth 10 | Set-Content package.json
}

# Python (pyproject.toml)
if (Test-Path pyproject.toml) {
    (Get-Content pyproject.toml) -replace 'version = ".*"', "version = `"$version`"" |
      Set-Content pyproject.toml
}
```

### 5. Commit the Changelog Update

```powershell
git add CHANGELOG.md package.json  # or pyproject.toml
git commit -m "📝 docs(changelog): add v$version release notes"
```

## Examples

### Full Release Entry

```markdown
## [2.1.0] - 2026-03-29

### Added
- Conventional commit workflow skill with emoji mapping
- Multi-perspective PR review (PM / Dev / QA / Security / DevOps / UX)
- Context priming skill for session initialization

### Changed
- Migration guide updated: Hooks terminology corrected to "alternative" not "equivalent"

### Fixed
- Incorrect frontmatter category in security-scan skill

### Security
- Evaluate-repository skill now enforces read-only analysis mode by default
```

### Keep Changelog Format

```markdown
## [Unreleased]           ← work in progress, no date
## [2.1.0] - 2026-03-29  ← released version with date
## [2.0.0] - 2026-01-15
```

## Tips

- **Write for humans, not machines**: CHANGELOG entries should explain *what changed for users*, not internal implementation details
- **One entry per user-visible change**: don't combine unrelated fixes in one bullet
- **Link versions**: add `[2.1.0]: https://github.com/owner/repo/compare/v2.0.0...v2.1.0` at the bottom for diff links
- **Unreleased as staging area**: keep changes in `[Unreleased]` until a version is cut
- **Automation option**: `git cliff` or `conventional-changelog` can auto-generate entries from Conventional Commits

## See Also

- [`commit-workflow`](../../workflow/commit-workflow/SKILL.md) — write good commit messages first
- [`doc-update`](../doc-update/SKILL.md) — update broader documentation
- [Keep a Changelog](https://keepachangelog.com/)
- *Inspired by: [awesome-claude-code/resources/slash-commands/add-to-changelog](https://github.com/hesreallyhim/awesome-claude-code)*
