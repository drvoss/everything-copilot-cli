---
name: secret-detection
description: Find and remove hardcoded secrets from source code and git history
metadata:
  category: security
  agent_type: general-purpose
---

# Secret Detection

## When to Use
- Auditing a codebase for accidentally committed credentials
- Before open-sourcing a private repository
- After a developer reports a potential secret leak
- As part of a regular security review cadence
- Setting up pre-commit hooks for secret prevention

## Prerequisites
- Access to the repository source code and git history
- Ability to rotate compromised credentials
- Access to a secrets manager or environment variable configuration

## Workflow

### 1. Scan Source Code for Secret Patterns
```powershell
# AWS Access Keys
grep -rn "AKIA[0-9A-Z]{16}" . --include="*.ts" --include="*.js" --include="*.py" --include="*.json"

# GitHub tokens
grep -rn "ghp_[a-zA-Z0-9]{36}\|github_pat_[a-zA-Z0-9_]{82}" .

# Generic API keys and secrets
grep -rni "api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9]" src/ --include="*.ts" --include="*.js"

# Private keys
grep -rn "BEGIN.*PRIVATE KEY" .

# Connection strings with credentials
grep -rni "mongodb\+srv://\|postgres://\|mysql://" . | grep -v "localhost\|example\|template"

# JWT secrets and signing keys
grep -rni "jwt[_]?secret\|signing[_]?key" src/ --include="*.ts" | grep -v "process\.env\|config\."
```

### 2. Check for Secret Files
```powershell
# Find committed secret files
git --no-pager ls-files | Select-String "\.pem$|\.key$|\.p12$|\.pfx$|id_rsa|\.env$"

# Check .gitignore covers sensitive patterns
Get-Content .gitignore 2>$null | Select-String "\.env|\.pem|\.key|secret"
```

### 3. Scan Git History
Secrets removed from code may still exist in git history:
```powershell
# Search recent commits for secret patterns
git --no-pager log --all -p --since="6 months ago" -S "AKIA" --oneline | Select-Object -First 20

# Search for common secret keywords in diffs
git --no-pager log --all -p -S "api_key" --oneline | Select-Object -First 20
```

### 4. Remediate Found Secrets

**Step 1: Rotate the credential immediately**
Any secret found in source code should be considered compromised.

**Step 2: Replace with environment variables**
```typescript
// BEFORE — hardcoded secret
const apiKey = 'sk-abc123def456';

// AFTER — environment variable
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY environment variable is required');
```

**Step 3: Add to .env.example (without values)**
```bash
# .env.example
API_KEY=
DATABASE_URL=
JWT_SECRET=
```

**Step 4: Update .gitignore**
```powershell
# Ensure .env is ignored
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.pem" >> .gitignore
echo "*.key" >> .gitignore
```

### 5. Prevent Future Leaks
```powershell
# Add a pre-commit check (example with grep)
# Create a simple pre-commit hook
```

```bash
#!/bin/sh
# .git/hooks/pre-commit
if git diff --cached | grep -qiE "AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|BEGIN.*PRIVATE KEY"; then
  echo "ERROR: Potential secret detected in staged changes. Aborting commit."
  exit 1
fi
```

## Examples

### Comprehensive Scan Script
```powershell
# Run all pattern checks and summarize
$patterns = @(
    "AKIA[0-9A-Z]{16}",
    "ghp_[a-zA-Z0-9]{36}",
    "BEGIN.*PRIVATE KEY",
    "password\s*=\s*['\"][^'\"]+['\"]"
)
foreach ($p in $patterns) {
    $matches = grep -rn $p src/ --include="*.ts" --include="*.js" 2>$null
    if ($matches) { Write-Host "FOUND: $p"; $matches }
}
```

### Migrating Secrets to Environment Variables
```powershell
# 1. Find all hardcoded values
grep -rn "const.*secret\|const.*key\|const.*password" src/ --include="*.ts" | grep -v "process.env"

# 2. For each finding, edit the file to use process.env
# 3. Add the variable to .env.example
# 4. Add the actual value to your deployment's environment config
```

## Tips
- **Rotate first, clean up second** — assume any committed secret is already compromised
- Use `explore` agent to trace how a secret is used before replacing it with env vars
- Common false positives: test fixtures, example configs, documentation — but always verify
- For removing secrets from git history, consider `git filter-repo` (destructive, requires coordination)
- Add secret scanning to your CI pipeline so this check runs automatically
- Store secrets in a dedicated manager (Vault, AWS SSM, GitHub Secrets) — not in `.env` files on servers
