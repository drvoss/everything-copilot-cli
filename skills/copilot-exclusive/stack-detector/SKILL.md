---
name: stack-detector
description: Scan the current project's tech stack (package.json, config files, lockfiles) and recommend the most relevant skills and rules from this collection for the detected technologies.
metadata:
  category: copilot-exclusive
  copilot_feature: "File system inspection, git ls-files, package.json analysis"
---

# Stack Detector

## Why This is Copilot-Exclusive

Copilot CLI has direct access to the workspace file system and can run shell commands
to inspect project files at session start. This skill orchestrates that access to build
a tech-stack fingerprint and map it to the skill/rule collection in this repository.

## When to Use

- At the start of a session on an unfamiliar codebase
- Before running `context-prime` — run this first to know which additional skills to load
- When onboarding a new contributor and recommending which skills to study
- When auditing a project to suggest missing tooling or practices

## Workflow

### 1. Detect Runtime & Package Manager

```powershell
# Check for Node.js project
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "Node.js project detected"
    Write-Host "Name: $($pkg.name)"
}

# Detect package manager from lockfile
$lockfiles = @{
    "pnpm-lock.yaml"    = "pnpm"
    "yarn.lock"         = "yarn"
    "package-lock.json" = "npm"
    "bun.lockb"         = "bun"
}
foreach ($file in $lockfiles.Keys) {
    if (Test-Path $file) { Write-Host "Package manager: $($lockfiles[$file])"; break }
}

# Python
if ((Test-Path "pyproject.toml") -or (Test-Path "requirements.txt")) {
    Write-Host "Python project detected"
}

# Go
if (Test-Path "go.mod") { Write-Host "Go project detected" }

# Java / Kotlin
if ((Test-Path "build.gradle") -or (Test-Path "pom.xml")) {
    Write-Host "JVM project detected"
}
```

### 2. Detect Frameworks & Libraries

```powershell
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    $deps = @()
    if ($pkg.dependencies)    { $deps += $pkg.dependencies.PSObject.Properties.Name }
    if ($pkg.devDependencies) { $deps += $pkg.devDependencies.PSObject.Properties.Name }

    $frontendMap = @{
        "next"     = "Next.js"
        "react"    = "React"
        "vue"      = "Vue"
        "nuxt"     = "Nuxt"
        "@angular" = "Angular"
        "svelte"   = "Svelte"
        "astro"    = "Astro"
    }
    foreach ($key in $frontendMap.Keys) {
        if ($deps -match $key) { Write-Host "Framework: $($frontendMap[$key])" }
    }

    $backendMap = @{
        "express"  = "Express"
        "@nestjs"  = "NestJS"
        "hono"     = "Hono"
        "fastify"  = "Fastify"
    }
    foreach ($key in $backendMap.Keys) {
        if ($deps -match $key) { Write-Host "Backend: $($backendMap[$key])" }
    }

    $dbMap = @{
        "prisma"    = "Prisma"
        "drizzle"   = "Drizzle ORM"
        "@supabase" = "Supabase"
        "typeorm"   = "TypeORM"
    }
    foreach ($key in $dbMap.Keys) {
        if ($deps -match $key) { Write-Host "Database/ORM: $($dbMap[$key])" }
    }

    $testingMap = @{
        "vitest"     = "Vitest"
        "playwright" = "Playwright"
        "jest"       = "Jest"
        "cypress"    = "Cypress"
    }
    foreach ($key in $testingMap.Keys) {
        if ($deps -match $key) { Write-Host "Testing: $($testingMap[$key])" }
    }

    $cloudMap = @{
        "wrangler"  = "Cloudflare Workers"
        "vercel"    = "Vercel"
        "@aws-sdk"  = "AWS SDK"
    }
    foreach ($key in $cloudMap.Keys) {
        if ($deps -match $key) { Write-Host "Cloud: $($cloudMap[$key])" }
    }
}
```

### 3. Detect Config Files

```powershell
$configMap = @{
    "next.config.*"       = "Next.js"
    "vite.config.*"       = "Vite"
    "tailwind.config.*"   = "Tailwind CSS"
    "vitest.config.*"     = "Vitest"
    "playwright.config.*" = "Playwright"
    "wrangler.toml"       = "Cloudflare Workers"
    "vercel.json"         = "Vercel"
    "astro.config.*"      = "Astro"
    "drizzle.config.*"    = "Drizzle ORM"
    "tsconfig.json"       = "TypeScript"
}

foreach ($pattern in $configMap.Keys) {
    if (Get-ChildItem -Filter $pattern -ErrorAction SilentlyContinue) {
        Write-Host "Config detected: $($configMap[$pattern])"
    }
}
```

### 4. Recommend Skills & Rules

Based on the detected stack, recommend the following from this repository:

| Detected Technology  | Recommended Skills                       | Recommended Rules                                                   |
|----------------------|------------------------------------------|---------------------------------------------------------------------|
| TypeScript           | `tdd-workflow`, `code-review`            | `rules/languages/typescript.md`                                     |
| Next.js              | `commit-workflow`, `release`             | `rules/frameworks/nextjs.md`                                        |
| React                | `code-review`, `refactor-clean`          | `rules/frameworks/react.md`                                         |
| Prisma / Drizzle     | `evaluate-repository`                    | `rules/frameworks/prisma.md`                                        |
| Playwright           | `test-coverage`, `e2e-testing`           | `rules/frameworks/playwright.md`                                    |
| Vitest               | `tdd-workflow`, `eval-harness`           | `rules/frameworks/vitest.md`                                        |
| NestJS / Express     | `security-scan`, `input-validation`      | `rules/frameworks/nestjs.md`                                        |
| Cloudflare Workers   | `cost-audit`                             | `rules/frameworks/cloudflare-workers.md`                            |
| Any project          | `supply-chain-security`                  | `rules/common/supply-chain-security.md`                             |
| Next.js + Prisma     | `nextjs-prisma`                          | `rules/frameworks/nextjs.md`, `rules/frameworks/prisma.md`          |
| React + Vitest       | `react-vitest`                           | `rules/frameworks/react.md`, `rules/frameworks/vitest.md`           |
| NestJS + Prisma      | `nestjs-prisma`                          | `rules/frameworks/nestjs.md`, `rules/frameworks/prisma.md`          |

> **Note**: See `README.md` for the current full list of available skills and rules.

### 5. Output Summary

```powershell
Write-Host ""
Write-Host "=== Stack Detection Complete ==="
Write-Host "Recommended skills for this project:"
Write-Host "  /context-prime      -- load live project context"
Write-Host "  /commit-workflow    -- if Git workflow needed"
Write-Host "  /security-scan      -- if security audit needed"
Write-Host "(Add detected framework-specific skills as available)"
```

## Notes

- This skill reads files only — it makes no changes to the project
- Combine with `context-prime` for a complete session initialization
- The recommendation table above is updated as new framework-specific rules and combo skills
  are added in later phases of this repository's roadmap
