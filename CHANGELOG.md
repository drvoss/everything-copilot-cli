# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). While the version is below 1.0.0, minor releases may
change behavior.

The version is kept in sync across `package.json`, `plugin.json`,
`.claude-plugin/plugin.json`, and the generated bundle manifests under `plugins/`.

## [Unreleased]

### Added

- Claude Code plugin and marketplace manifests (`.claude-plugin/`), including a manifest for the
  focused `copilot-native-workflows` bundle so `plugin update` keeps a stable version.
- README sections for using the skills in Claude Code, Cursor, and Antigravity, with a table of
  distribution channels, in English, Korean, Japanese, and Chinese.
- Tests that keep the Claude Code manifests in step with the skills and the bundle.

### Changed

- The Claude Code plugin ships skills only; the 8 Copilot-format agents stay Copilot-only because
  Claude Code, Cursor, and Antigravity do not load their tool names and model IDs.
- `stack-detector` explains how to work without shell access, and `plan-mode-mastery` states that
  its tooling is specific to Copilot CLI.
- Cursor docs now record the verified marketplace install: skills load in the local app and CLI,
  agents do not, and a registration is pinned to its commit, so refresh it with
  `marketplace remove` then `marketplace add` (no `--git-ref`).
- `eval-harness` was trimmed below 500 lines.
- `package.json` version aligned with the published plugin version, 0.1.0.

## [0.1.0]

### Added

- First published release: 109 skills across 8 categories, 8 core agents, rules, orchestration
  patterns, guides, and the `copilot-native-workflows` focused bundle.
- `license: MIT` in the frontmatter of every skill, and the skills.sh badge in the READMEs.
- Protection for `v*` tags through a repository ruleset.

[Unreleased]: https://github.com/drvoss/everything-copilot-cli/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/drvoss/everything-copilot-cli/releases/tag/v0.1.0
