---
name: doc-update
description: Use when code has changed and documentation may be out of date — identifies stale docs, finds gaps between implementation and docs, and applies targeted updates.
metadata:
  category: documentation
  agent_type: general-purpose
---

# Documentation Update

## When to Use
- After making code changes that affect documented behavior
- During periodic documentation maintenance
- When onboarding reveals gaps or inaccuracies in docs
- Before a release to ensure docs match the current state
- When users report confusing or incorrect documentation

## Prerequisites
- Access to the project's documentation files (README, docs/, wiki)
- Understanding of recent code changes or current behavior
- Ability to run the project to verify documented examples

## Workflow

### 1. Inventory Existing Documentation
```powershell
# Find all documentation files
glob pattern="**/*.md"

# Find inline documentation (JSDoc, docstrings)
grep -rn "/\*\*" src/ --include="*.ts" | Measure-Object -Line
grep -rn '"""' src/ --include="*.py" | Measure-Object -Line

# List docs by last modified date
Get-ChildItem -Recurse -Include *.md | Sort-Object LastWriteTime | Select-Object LastWriteTime, FullName
```

### 2. Identify Stale Documentation
```powershell
# Find docs that reference renamed or deleted files
grep -rn "import.*from\|require(" docs/ --include="*.md" 2>$null

# Find docs referencing old function names or APIs
grep -rn "function_name\|ClassName\|/api/v1" docs/ --include="*.md"

# Compare documented CLI flags with actual implementation
grep -rn "\-\-[a-z]" README.md | Select-Object -First 20
```

Use the `explore` agent for deeper analysis:
```
task agent_type: "explore"
prompt: "Compare the README.md setup instructions with the actual package.json scripts and config files. Identify any mismatches."
```

### 3. Update Content
For each stale section:

1. **Read the current code** to understand actual behavior
2. **Update the doc** to match reality using `edit`
3. **Test any code examples** to verify they work

```powershell
# Verify a documented command still works
npm run documented-command 2>&1 | Select-Object -First 5
```

### 4. Check Links
```powershell
# Find all markdown links
grep -rn "\[.*\](.*)" docs/ --include="*.md" | Select-String "http"

# Find internal links and verify targets exist
grep -rn "\[.*\](\./\|\.\./" docs/ --include="*.md"
```

### 5. Improve Structure
- Add a table of contents for long documents
- Break monolithic docs into focused pages
- Add "Last updated" dates to critical docs
- Ensure consistent formatting and heading levels

### 6. Validate the Update
```powershell
# Check for broken markdown syntax
grep -rn "]\s*$" docs/ --include="*.md"  # Unclosed links

# Verify code blocks have language tags
grep -n '```$' docs/**/*.md  # Code blocks without language specifier

# Run any doc-specific tests or linters
npx markdownlint docs/ 2>&1 | Select-Object -First 20
```

## Examples

### Update README After API Change
```powershell
# 1. Find what changed
git --no-pager log --oneline -10 -- src/api/

# 2. Check if README references the changed API
grep -n "api\|endpoint\|route" README.md

# 3. Update the relevant section
# Use edit tool to modify the specific outdated section
```

### Sync JSDoc with Implementation
```powershell
# Find functions where JSDoc params don't match actual params
grep -B 5 "function " src/utils.ts | Select-String "@param|function"

# Update JSDoc to match the current signature
```

### Bulk Fix Renamed References
```powershell
# If a module was renamed from 'utils' to 'helpers'
grep -rn "utils" docs/ --include="*.md"
# Use edit tool on each file to update references
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The code is the documentation" | Code explains *what*. Documentation explains *why*. They're complementary, not interchangeable. |
| "Too busy, I'll update docs later" | Context is lost by the next PR. Update docs alongside the change. |
| "It's an internal API, no docs needed" | Your future self in 3 months is also an internal API consumer. |
| "The README is already up to date" | Compare the last README update timestamp to the last code change. |

## Red Flags
- Code change PRs with no documentation update
- README examples that don't match the current API
- Breaking changes not recorded in the CHANGELOG
- Removed features still present in the documentation

## Verification
- [ ] Documentation update exists for every changed public API
- [ ] README code examples run successfully on the current version
- [ ] Breaking changes are recorded in the CHANGELOG
- [ ] New environment variables or configuration options are documented

## Tips
- Update docs **in the same PR** as code changes — don't defer it
- Write docs for your audience: READMEs for users, inline docs for developers
- Include **working** code examples — broken examples are worse than no examples
- Use `task` agent to run documented commands and verify they produce expected output
- Keep a CHANGELOG.md updated with each release
- If a doc is consistently wrong, consider generating it from code (e.g., API docs from schemas)

