# Example: Migration Supervisor (Incremental Legacy Migration)

> **Scenario:** You are migrating a large legacy module (50+ files) incrementally. You need coordinated supervision to prevent regressions and keep rollback easy.

This example uses the **hierarchical-delegation pattern**:

- **Root orchestrator (Copilot CLI)**: plans + supervises batches
- **Supervisor loop**: selects safe work (dependency-aware) and dispatches workers
- **Workers**:
  - **Codex**: mechanical code transformations (renames, API rewrites, boilerplate)
  - **Claude**: complex refactors that require deep reasoning (state machines, concurrency, tricky invariants)

## The Setup

- Legacy module: `src/legacy/` (~50–120 KB total)
- Migration style: *strangler fig* (keep old + new side by side)
- Rollback: checkpoint commit per batch; reset on failure

## Step 1 — Root Orchestrator Creates Migration Plan (SQL)

Track work in a SQLite DB so the supervisor can reason about dependencies and progress.

```powershell
# Location for migration state
New-Item -ItemType Directory -Force .migration | Out-Null
$db = ".migration\\migration.db"

# Requires sqlite3 on PATH
sqlite3 $db @"
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS migration_files (
  file_path     TEXT PRIMARY KEY,
  status        TEXT NOT NULL CHECK (status IN ('pending','in_progress','done','blocked')) DEFAULT 'pending',
  complexity    TEXT NOT NULL CHECK (complexity IN ('low','high')) DEFAULT 'low',
  worker        TEXT NOT NULL CHECK (worker IN ('codex','claude')),
  batch_id      INTEGER,
  last_error    TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS migration_deps (
  file_path   TEXT NOT NULL,
  depends_on  TEXT NOT NULL,
  PRIMARY KEY (file_path, depends_on),
  FOREIGN KEY (file_path)  REFERENCES migration_files(file_path),
  FOREIGN KEY (depends_on) REFERENCES migration_files(file_path)
);

CREATE INDEX IF NOT EXISTS idx_migration_files_status ON migration_files(status);
"@

# Seed plan (example)
$legacyFiles = Get-ChildItem -Recurse src\\legacy -File | ForEach-Object { $_.FullName.Replace((Get-Location).Path + "\\", "") }

foreach ($f in $legacyFiles) {
    $worker = if ($f -match '(?i)(parser|scheduler|state|concurrency|transaction)') { 'claude' } else { 'codex' }
    $complexity = if ($worker -eq 'claude') { 'high' } else { 'low' }

    sqlite3 $db "INSERT OR IGNORE INTO migration_files(file_path, worker, complexity) VALUES('$f', '$worker', '$complexity');"
}

# Optional: declare dependencies (example)
# sqlite3 $db "INSERT OR IGNORE INTO migration_deps(file_path, depends_on) VALUES('src/legacy/orders.ts','src/legacy/db.ts');"
```

## Step 2 — Supervisor Loop: Select Next Safe Batch (No Blocking Deps)

A "safe" file is pending and has **no dependencies that are not done**.

```powershell
function Invoke-Sql {
    param([Parameter(Mandatory)] [string]$Query)
    sqlite3 $db $Query
}

function Get-ReadyBatch {
    param([int]$Limit = 5)

    $q = @"
SELECT f.file_path
FROM migration_files f
WHERE f.status = 'pending'
  AND NOT EXISTS (
    SELECT 1
    FROM migration_deps d
    JOIN migration_files dep ON dep.file_path = d.depends_on
    WHERE d.file_path = f.file_path
      AND dep.status != 'done'
  )
ORDER BY f.complexity DESC, f.file_path
LIMIT $Limit;
"@

    (Invoke-Sql -Query $q) -split "`n" | Where-Object { $_ -and $_.Trim() -ne '' }
}

$batchSize = 6
$batchId = 0

while ($true) {
    $batch = Get-ReadyBatch -Limit $batchSize
    if ($batch.Count -eq 0) {
        Write-Host "No ready files. Migration may be complete or blocked by deps."
        break
    }

    $batchId++

    # Mark in_progress
    foreach ($f in $batch) {
        Invoke-Sql -Query "UPDATE migration_files SET status='in_progress', batch_id=$batchId, updated_at=datetime('now') WHERE file_path='$f';"
    }

    Write-Host "\n=== Batch $batchId ==="
    $batch | ForEach-Object { Write-Host " - $_" }

    # Create rollback checkpoint
    git add -A
    git commit -m "chore(migration): checkpoint batch $batchId" --no-verify | Out-Null

    # Dispatch workers for this batch
    # (Step 3)

    # Validation gate
    # (Step 4)

    # Progress report
    # (Step 5)
}
```

## Step 3 — Workers Process the Batch (Codex + Claude)

Dispatch per-file jobs. Codex handles mechanical transformations; Claude handles complex refactors.

```powershell
function Get-WorkerForFile {
    param([string]$File)
    Invoke-Sql -Query "SELECT worker FROM migration_files WHERE file_path='$File';"
}

$jobs = @()

foreach ($f in $batch) {
    $worker = (Get-WorkerForFile -File $f).Trim()

    if ($worker -eq 'codex') {
        $jobs += Start-Job -Name "codex:$f" -ScriptBlock {
            param($file)
            $code = Get-Content $file -Raw
            codex --quiet --approval-mode auto-edit @"
Migrate this legacy file incrementally.

Rules:
- Preserve behavior (no breaking changes)
- Prefer small, mechanical transforms (imports, API calls, types)
- Keep public interfaces stable

File path: $file

Current contents:
$code
"@
        } -ArgumentList $f
    } else {
        $jobs += Start-Job -Name "claude:$f" -ScriptBlock {
            param($file)
            $code = Get-Content $file -Raw

            # Claude emits a patch; you apply it with git apply.
            $patch = npx @anthropic-ai/claude-code --print @"
You are migrating a legacy module incrementally.

Refactor the file with extreme care:
- Preserve semantics
- Add guardrails (input validation, explicit error paths) only if behavior-neutral
- Keep diff minimal

Return ONLY a unified diff patch that applies cleanly with git apply.

FILE: $file

CODE:
$code
"@

            $patch
        } -ArgumentList $f
    }
}

$null = Wait-Job -Job $jobs -Timeout 600

# Apply patches from Claude workers, collect outputs/errors
foreach ($j in $jobs) {
    try {
        $out = Receive-Job $j -ErrorAction Stop

        if ($j.Name -like 'claude:*') {
            if ($out -match '^diff --git') {
                $out | git apply --whitespace=fix
            } else {
                throw "Claude did not return a patch"
            }
        }

        Write-Host "✅ $($j.Name) complete"
    } catch {
        Write-Host "❌ $($j.Name) failed: $($_.Exception.Message)"
        foreach ($f in $batch) {
            Invoke-Sql -Query "UPDATE migration_files SET status='blocked', last_error='worker failure: $($_.Exception.Message)', updated_at=datetime('now') WHERE file_path='$f' AND status='in_progress';"
        }
        throw
    }
}

Remove-Job -Job $jobs -Force
```

## Step 4 — Validation Gate (Tests) + Rollback on Failure

Run tests after each batch. If validation fails: rollback to the checkpoint and mark the batch as blocked.

```powershell
# Run your project’s test suite (adjust as needed)
$testOk = $true
try {
    npm test
} catch {
    $testOk = $false
}

if (-not $testOk) {
    Write-Host "❌ Tests failed — rolling back batch $batchId"

    # Roll back to the checkpoint commit (undo batch changes)
    git reset --hard HEAD~1

    foreach ($f in $batch) {
        Invoke-Sql -Query "UPDATE migration_files SET status='blocked', last_error='tests failed in batch $batchId', updated_at=datetime('now') WHERE file_path='$f';"
    }

    continue
}

# Mark done
foreach ($f in $batch) {
    Invoke-Sql -Query "UPDATE migration_files SET status='done', last_error=NULL, updated_at=datetime('now') WHERE file_path='$f';"
}

Write-Host "✅ Batch $batchId validated and marked done"
```

## Step 5 — Progress Reporting (Counts After Each Batch)

```powershell
$counts = Invoke-Sql -Query @"
SELECT status, COUNT(*)
FROM migration_files
GROUP BY status
ORDER BY status;
"@

Write-Host "\nMigration progress:"
$counts
```

## Notes / Tips

- Keep batch size small (3–8 files) to make test failures diagnosable.
- Encode dependencies aggressively; it prevents "half-migrated" states.
- If blocked items accumulate, run a dedicated unblock pass (often indicates an architectural dependency inversion is needed).
