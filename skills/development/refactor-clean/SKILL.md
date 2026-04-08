---
name: refactor-clean
description: Use when code has grown complex, duplicated, or cluttered — clean up structure and remove dead code without changing observable behavior
metadata:
  category: development
  agent_type: general-purpose
---

# Refactor & Clean Code

## When to Use
- Code is correct but hard to read, modify, or extend
- Duplicated logic exists across multiple files
- Functions or classes have grown too large
- Preparing code for a new feature that requires structural changes
- After a rapid prototype that needs production-quality cleanup

## Prerequisites
- Existing tests that cover the code to refactor (add tests first if missing)
- All tests passing before starting
- Code committed so you can revert if needed

## Workflow

### 1. Identify Code Smells
```powershell
# Find long files (likely doing too much)
Get-ChildItem -Recurse -Include *.ts,*.js,*.py,*.go | Where-Object { (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 300 } | Select-Object FullName, @{N='Lines';E={(Get-Content $_.FullName | Measure-Object -Line).Lines}}

# Find duplicated string patterns
grep -rn "pattern-you-suspect-is-duplicated" src/ --include="*.ts"

# Find functions with too many parameters (>4 is a smell)
grep -n "function.*,.*,.*,.*," src/**/*.ts
```

Common smells to look for:
- **Long functions** (>40 lines) — extract smaller functions
- **Duplicate code** — extract shared utility
- **Deep nesting** (>3 levels) — use early returns or extract
- **God objects** — split into focused classes/modules
- **Primitive obsession** — introduce domain types
- **Feature envy** — move logic to the class that owns the data

### 2. Establish a Safety Net
```powershell
# Run existing tests and record baseline
npm test 2>&1 | Tee-Object -Variable baseline
echo $baseline | Select-Object -Last 5

# If coverage is low, write characterization tests first
npm test -- --coverage --collectCoverageFrom="src/module-to-refactor.ts"
```

### 3. Plan the Refactoring
Before touching code, decide on the transformation:
- **Extract Function** — pull a block into a named function
- **Extract Module** — move related functions to a new file
- **Rename** — improve names for clarity
- **Inline** — remove unnecessary indirection
- **Replace Conditional with Polymorphism** — use strategy pattern
- **Introduce Parameter Object** — group related parameters

### 4. Make Small, Incremental Changes
Each change should be:
1. A single refactoring operation
2. Followed by running tests
3. Committed if tests pass

```powershell
# After each refactoring step
npm test 2>&1 | Select-Object -Last 10

# If tests break, revert and try a smaller step
git checkout -- src/module-to-refactor.ts
```

### 5. Verify Behavior is Preserved
```powershell
# Full test suite must still pass
npm test

# Compare coverage — it should not decrease
npm test -- --coverage
```

## Examples

### Extract Repeated Logic
```typescript
// BEFORE: duplicated validation in multiple handlers
function createUser(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  // ... create logic
}
function updateUser(data) {
  if (!data.email || !data.email.includes('@')) throw new Error('Invalid email');
  // ... update logic
}

// AFTER: extracted to a shared validator
function validateEmail(email: string): void {
  if (!email || !email.includes('@')) throw new Error('Invalid email');
}
function createUser(data) { validateEmail(data.email); /* ... */ }
function updateUser(data) { validateEmail(data.email); /* ... */ }
```

### Flatten Deep Nesting with Early Returns
```typescript
// BEFORE
function process(input) {
  if (input) {
    if (input.isValid) {
      if (input.data.length > 0) {
        return transform(input.data);
      }
    }
  }
  return null;
}

// AFTER
function process(input) {
  if (!input || !input.isValid || input.data.length === 0) return null;
  return transform(input.data);
}
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "I'm not sure what this code does, but it looks unused" | If you're not sure, don't remove it. Use `git blame` to understand the context first. (Chesterton's Fence) |
| "I'll add a feature while refactoring" | Separate refactoring from feature work. Mixing the two makes debugging impossible. |
| "Tests still pass, so the refactor is correct" | Tests must exist before refactoring to have any meaning. If not, write them first. |
| "TypeScript isn't warning, so it's safe to delete" | Dynamic imports, reflection, and external references are invisible to the type system. |

## Red Flags
- Refactoring commit contains feature changes
- Dead code removed without any tests
- Type errors suppressed with `// @ts-ignore` or `any` types
- No verification that the same tests pass before and after refactoring
- Complex code left with "clean up later" TODO and no action

## Verification
- [ ] `npm test` passes identically before and after the refactor
- [ ] Removed code confirmed as unused (`grep -rn` or IDE reference search)
- [ ] Complexity metrics improved (reduced function length, nesting depth)
- [ ] Refactor commit contains no feature changes (commit message: `refactor:`)
- [ ] PR describes the motivation for the refactor (why this code was cleaned up)

## Tips
- **Never refactor and add features in the same commit** — keep them separate
- Use `explore` agent to understand call graphs before renaming or moving functions
- Use `grep` to find all callers before changing a function signature
- If tests are missing, write them first — refactoring without tests is gambling
- Commit after every successful small refactoring — you can always squash later
- The best refactoring is deleting code: look for dead code with `grep` and remove it

