---
name: fix-build-errors
description: Systematic approach to diagnosing and resolving build errors
metadata:
  category: development
  agent_type: task
---

# Fix Build Errors

## When to Use
- Build or compilation fails after code changes
- CI pipeline reports build failures
- TypeScript, ESLint, or other static analysis errors
- Dependency resolution failures after package updates
- Build works locally but fails in CI (or vice versa)

## Prerequisites
- Access to the build command and its output
- The project's build toolchain is installed
- Source control so you can compare against a known-good state

## Workflow

### 1. Capture the Full Error Output
```powershell
# Run the build and capture output — use task agent to keep context clean
npm run build 2>&1 | Out-String
```

Or use the `task` agent for long builds:
```
task agent_type: "task"
prompt: "Run 'npm run build' and report all errors"
```

### 2. Categorize the Errors
Read errors from **top to bottom** — later errors are often caused by earlier ones.

| Error Type | Example | Typical Fix |
|-----------|---------|-------------|
| **Import/Module** | `Cannot find module 'x'` | Install dependency, fix path |
| **Type** | `Type 'string' not assignable to 'number'` | Fix type annotation or cast |
| **Syntax** | `Unexpected token` | Fix syntax error, check for missing brackets |
| **Lint** | `no-unused-vars` | Remove unused variable or disable rule |
| **Config** | `Invalid tsconfig option` | Fix config file |
| **Dependency** | `Peer dependency not met` | Install or update package |

### 3. Fix the Root Cause (Not Symptoms)
```powershell
# Find the first error — it's usually the root cause
npm run build 2>&1 | Select-String "error" | Select-Object -First 5

# Navigate to the file and line
# Use view tool to see context around the error
```

For import errors:
```powershell
# Check if the module exists
glob pattern="**/*moduleName*"

# Check if it's installed
npm ls module-name 2>&1
```

For type errors:
```powershell
# See the full type definition
grep -rn "interface|type" --include="*.ts" -A 5 src/ | Select-String "TypeName"
```

### 4. Apply the Fix
Use `edit` for surgical changes to specific lines:
```
edit path: "src/broken-file.ts"
old_str: "const x: string = 42;"
new_str: "const x: number = 42;"
```

### 5. Verify the Fix
```powershell
# Rebuild — should succeed now
npm run build 2>&1 | Select-Object -Last 10

# Run tests to ensure the fix didn't break behavior
npm test 2>&1 | Select-Object -Last 10
```

### 6. Handle Cascading Errors
If fixing one error reveals more:
1. Rebuild after each fix
2. Address new errors from top to bottom
3. If the error count isn't decreasing, you may be fixing symptoms — step back and find the root cause

## Examples

### Missing Dependency
```powershell
# Error: Cannot find module 'lodash'
npm install lodash
npm install --save-dev @types/lodash  # for TypeScript

npm run build
```

### TypeScript Strict Mode Errors After Upgrade
```powershell
# Find all strictNullChecks errors
npx tsc --noEmit 2>&1 | Select-String "possibly 'null'" | Measure-Object -Line

# Fix them one file at a time, starting with leaf modules (no imports from your code)
npx tsc --noEmit 2>&1 | Select-String "possibly 'null'" | Select-Object -First 3
```

### CI vs Local Mismatch
```powershell
# Check Node/npm version differences
node --version
npm --version

# Check for OS-specific path issues
grep -rn "\\\\" src/ --include="*.ts"  # Windows backslashes in code

# Check for missing environment variables
grep -rn "process.env" src/ --include="*.ts" | Select-String -NotMatch "NODE_ENV"
```

## Tips
- **Fix the first error first** — many later errors are caused by earlier ones
- Use `task` agent to run builds — it returns brief output on success, full output on failure
- After fixing, always run the full test suite, not just the build
- If a dependency update caused the break, check its changelog for breaking changes
- For persistent issues, compare against the last known-good commit:
  ```powershell
  git --no-pager log --oneline -10
  git --no-pager diff <last-good-commit> -- src/
  ```
- Keep `tsconfig.json` / build configs in source control so you can diff changes
