# Contributing to Everything Copilot CLI

Thank you for your interest in contributing! This project aims to be the definitive guide and configuration system for GitHub Copilot CLI.

## How to Contribute

### Adding a New Agent

1. Create a markdown file in `agents/` with YAML frontmatter:

   ```yaml
   ---
   name: my-agent
   description: What this agent does
   agent_type: explore | task | general-purpose | code-review
   model: recommended-model
   tools:
     - list of tools
   ---
   ```

2. Include sections: Purpose, When to Use, How It Works, Examples
3. Run `npm run validate && npm run lint:md && npm test` to validate

### Adding a New Skill

1. Create a markdown file in the appropriate `skills/` subdirectory
2. Include YAML frontmatter with `name`, `description`, and `metadata.category`
3. Valid categories: `development`, `testing`, `security`, `documentation`, `copilot-exclusive`, `workflow`, `product`, `content`
4. Run `npm run validate && npm run lint:md && npm test` to validate

### Adding a New Rule

1. Create a markdown file in `rules/common/` (universal) or `rules/languages/` (language-specific)
2. Keep rules concise and actionable (40-80 lines)
3. Run `npm run validate && npm run lint:md && npm test` to validate

### Adding an Orchestration Pattern

1. Create a markdown file in `orchestration/patterns/`
2. Include: overview, setup, code examples, pros/cons, references

## Development

```bash
# Install dependencies
npm install

# Run validation tests
npm test

# Lint markdown
npm run lint:md

# Validate all configurations
npm run validate
```

## Guidelines

- Keep content practical with real, runnable examples
- Reference Copilot CLI tools by name (powershell, grep, glob, edit, create, etc.)
- Use YAML frontmatter for all agent and skill files
- Follow conventional commits (feat:, fix:, docs:, etc.)
- Both English and Korean content welcome

## Code of Conduct

Be respectful, constructive, and inclusive. We're building tools for everyone.
