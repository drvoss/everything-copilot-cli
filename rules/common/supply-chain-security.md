# Supply Chain Security Rules

Rules for protecting the project from dependency-based supply chain attacks.
Apply these whenever adding, upgrading, or auditing third-party packages.

## Dependency Version Pinning

- **Never use flexible version specifiers** (`^`, `~`) in production dependencies
- Pin exact versions in `package.json`, `requirements.txt`, `go.mod`, etc.
- Use lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`) and always commit them
- Treat lockfile diffs as security-relevant — review them carefully in PRs

## New Package Vetting

- **Wait at least 1 day** after a package is published before installing it
  (typosquatting and malicious publishes are caught fastest in the first 24 hours)
- Verify the package on its registry page (npmjs.com, pypi.org, etc.) before installing
  — check download count, publish date, maintainer history, and README
- Never run `npm install <package>` blindly from a tutorial or AI suggestion without vetting

## Upgrade Discipline

- **Do not run bulk upgrade commands** (`npm update`, `pip install --upgrade`, `go get -u ./...`)
  without reviewing each dependency individually
- Review the changelog and release notes of each dependency before upgrading
- Prefer upgrading one package at a time so regressions are easy to isolate

## Installation Scripts

- **Disable install scripts** where possible:
  ```bash
  # npm / pnpm
  npm install --ignore-scripts
  # or set in .npmrc:
  ignore-scripts=true
  ```
- Audit `postinstall`, `preinstall` scripts in `node_modules` for suspicious behavior
- Use tools like `socket.dev` or `npm audit` to flag packages with install-time side effects

## Integrity Verification

- Use Subresource Integrity (SRI) hashes for any CDN-loaded assets
- Prefer importing from local `node_modules` over CDN URLs in production code
- Periodically run `npm audit` / `pip-audit` / `govulncheck` to detect known CVEs

## CI/CD Hardening

- Pin GitHub Actions to a specific commit SHA, not a tag:
  ```yaml
  # Bad
  uses: actions/checkout@v4
  # Good
  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
  ```
- Restrict workflow permissions to the minimum required (`contents: read`, etc.)
- Use `CODEOWNERS` to require review of workflow file changes

## AI Agent-Specific Rules

When an AI agent (Copilot, Codex, Claude, etc.) suggests installing a package:
- Do **not** run the install command without human review
- Verify the package name carefully — AI agents can hallucinate package names
- Cross-check suggested packages against known registries before accepting
