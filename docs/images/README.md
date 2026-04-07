# docs/images

Static image assets for README.md and README.ko.md.

## Files

| File | Description |
|------|-------------|
| `copilot.svg` | GitHub Copilot icon (from primer/octicons) |
| `badge-license.svg` | MIT License badge |
| `badge-copilot-cli-ready.svg` | "Copilot CLI ready" badge |
| `badge-models.svg` | Model count badge |
| `badge-agents.svg` | Agent count badge |
| `badge-skills.svg` | Skill count badge |
| `badge-multi-ai.svg` | Multi-AI Orchestrator badge |
| `multi-ai-orchestration.svg` | Multi-AI Orchestration architecture diagram (Copilot CLI as hub with Claude Code, Codex CLI, Gemini CLI) |

## Updating a badge

When the skill count or agent count changes, regenerate the relevant badge:

```powershell
# Example: update skill count to 50
$svg = Invoke-WebRequest -Uri "https://img.shields.io/badge/skills-50-green" -UseBasicParsing
$svg.Content | Set-Content docs/images/badge-skills.svg -Encoding UTF8
```

Then update the `alt` attribute in README.md and README.ko.md to match.

## Why local?

External image URLs (shields.io, raw.githubusercontent.com) can change or become
temporarily unavailable. Storing images in the repo ensures the README always
renders correctly — on GitHub, in offline previews, and in forks.
