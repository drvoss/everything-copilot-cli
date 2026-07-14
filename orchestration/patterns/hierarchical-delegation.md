---
name: hierarchical-delegation
type: hierarchical
agents:
  - copilot
  - claude
  - codex
  - agy
---

# Pattern: Hierarchical Delegation

> **Complexity: High** | **Setup: SQL state tracking** | **Best for: Large tasks with natural domain decomposition**

Hierarchical Delegation is a **nested orchestration** pattern: instead of one orchestrator fanning out directly to many workers, the top-level orchestrator delegates to **domain orchestrators**, which then delegate to **specialist workers**. Think of it as a tree: work flows *down* as delegation, and results flow *up* as summaries.

This is distinct from:

- **[Fan-Out Parallel](fan-out-parallel.md)** (flat, single-level dispatch)
- **[Pipeline](pipeline.md)** (linear stages)
- **[Agent Council](agent-council.md)** (peer routing / consensus)

## How It Works

A three-level hierarchy (root → domain orchestrators → specialists):

```text
Root Orchestrator (Copilot)
├─ Security Domain Orchestrator
│  ├─ Specialist: threat-model + auth review
│  ├─ Specialist: dependency / secrets scan
│  └─ Specialist: permissions / sandbox review
├─ Performance Domain Orchestrator
│  ├─ Specialist: hot-path profiling plan
│  ├─ Specialist: query/index review
│  └─ Specialist: caching / concurrency review
└─ Architecture Domain Orchestrator
   ├─ Specialist: module boundaries review
   ├─ Specialist: API contracts review
   └─ Specialist: refactor roadmap

(Results bubble back up: specialists → domain summary → root synthesis)
```

## Implementation

Below is a practical PowerShell-style sketch for a **large codebase audit** that decomposes into three domain orchestrators:

- `security-domain`
- `performance-domain`
- `architecture-domain`

Each domain orchestrator then spawns its own specialist workers and writes progress into Copilot CLI's **built-in SQL session database**.

> **Syntax note:** Lines containing `task(...)` and `sql(...)` are **Copilot CLI tool invocations** — they are not valid PowerShell syntax. All `$var`, loops, and string operations are standard PowerShell.

```text
# -------------------------------
# Root Orchestrator
# -------------------------------

$rootJobId = "audit-" + (Get-Date -Format "yyyyMMdd-HHmmss")

# 1) Create hierarchy tracking table (Copilot CLI sql tool)
sql(description="Create hierarchical job table", query=@'
CREATE TABLE IF NOT EXISTS hierarchical_jobs (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  level INTEGER NOT NULL,         -- 0=root, 1=domain orchestrator, 2=specialist
  name TEXT NOT NULL,
  agent_type TEXT,               -- explore|task|general-purpose|code-review|research|security-review
  model TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  summary TEXT,
  result TEXT,
  FOREIGN KEY(parent_id) REFERENCES hierarchical_jobs(id)
);
CREATE INDEX IF NOT EXISTS idx_hjobs_parent_id ON hierarchical_jobs(parent_id);
CREATE INDEX IF NOT EXISTS idx_hjobs_status ON hierarchical_jobs(status);
'@)

# 2) Insert the root job + domain orchestrators
sql(description="Seed root + domain orchestrators", query=@"
INSERT INTO hierarchical_jobs (id, parent_id, level, name, agent_type, status, started_at)
VALUES
  ('$rootJobId', NULL, 0, 'root-audit', 'general-purpose', 'in_progress', datetime('now'));

INSERT INTO hierarchical_jobs (id, parent_id, level, name, agent_type, model, status)
VALUES
  ('$rootJobId-security',      '$rootJobId', 1, 'security-domain',      'general-purpose', 'claude-sonnet-4.6', 'pending'),
  ('$rootJobId-performance',   '$rootJobId', 1, 'performance-domain',   'general-purpose', 'gemini-3.1-pro-preview', 'pending'),
  ('$rootJobId-architecture',  '$rootJobId', 1, 'architecture-domain',  'general-purpose', 'claude-sonnet-4.6', 'pending');
"@)

# 3) Dispatch domain orchestrators (mid-level), NOT leaf workers
#    Each domain orchestrator is responsible for creating + tracking its specialist jobs.

task(agent_type="general-purpose", name="security-orchestrator", model="claude-sonnet-4.6", prompt=@"
You are the Security Domain Orchestrator for a full codebase audit.

Your responsibilities:
1) Mark your domain job in SQL as in_progress.
2) Create specialist child jobs in hierarchical_jobs (level=2, parent_id='$rootJobId-security').
3) Spawn specialists (code-review/task/explore) to execute those child jobs.
4) Record a short summary + result per specialist job.
5) Synthesize a domain-level report and write it to your own (level=1) SQL row.

SQL conventions:
- status: pending | in_progress | done | blocked
- Always set started_at/finished_at.

Do the work using nested task(...) calls.
"@)

task(agent_type="general-purpose", name="performance-orchestrator", model="gemini-3.1-pro-preview", prompt=@"
You are the Performance Domain Orchestrator for a full codebase audit.

Create specialist child jobs (level=2, parent_id='$rootJobId-performance') for:
- runtime hot paths
- data access (N+1, indexing)
- concurrency/caching

Run those specialists, then write a domain summary back to SQL.
"@)

task(agent_type="general-purpose", name="architecture-orchestrator", model="claude-sonnet-4.6", prompt=@"
You are the Architecture Domain Orchestrator for a full codebase audit.

Create specialist child jobs (level=2, parent_id='$rootJobId-architecture') for:
- module boundaries + dependency direction
- API contracts + error handling consistency
- refactor roadmap + sequencing

Run those specialists, then write a domain summary back to SQL.
"@)

# 4) Root collects domain results and closes out the root row
$domainSummaries = sql(description="Fetch domain summaries", query=@"
SELECT name, status, summary
FROM hierarchical_jobs
WHERE parent_id = '$rootJobId' AND level = 1
ORDER BY name;
"@)

# Root synthesis prompt is usually short and cross-domain.
task(agent_type="general-purpose", name="root-synthesis", model="claude-sonnet-4.6", prompt=@"
Synthesize these domain summaries into one prioritized audit report.

$domainSummaries

Output:
- Top 10 findings (ranked)
- Cross-cutting themes
- Suggested execution plan (first week / first month)
"@)

sql(description="Mark root done", query=@"
UPDATE hierarchical_jobs
SET status = 'done', finished_at = datetime('now')
WHERE id = '$rootJobId';
"@)


# -------------------------------
# Mid-Level Domain Orchestrator (example sketch)
# -------------------------------

# Inside the security domain orchestrator, you typically:
# - create specialist jobs in SQL
# - run specialists
# - persist results

sql(description="Security domain start", query=@"
UPDATE hierarchical_jobs
SET status='in_progress', started_at=datetime('now')
WHERE id = '$rootJobId-security';
"@)

sql(description="Seed security specialists", query=@"
INSERT INTO hierarchical_jobs (id, parent_id, level, name, agent_type, model, status)
VALUES
  ('$rootJobId-security-auth', '$rootJobId-security', 2, 'auth-and-threat-model', 'code-review', 'claude-opus-4.6', 'pending'),
  ('$rootJobId-security-deps', '$rootJobId-security', 2, 'dependency-risk-scan',  'task',       'gpt-5-mini',      'pending'),
  ('$rootJobId-security-secrets', '$rootJobId-security', 2, 'secrets-exposure-scan','explore',   'claude-haiku-4.5', 'pending');
"@)

task(agent_type="code-review", name="auth-and-threat-model", model="claude-opus-4.6", prompt=@"
Do a security review focused on authentication, authorization boundaries, and threat model.

Return:
- Findings (severity: critical/high/medium/low)
- Concrete remediation steps
- Files/areas to inspect next
"@)

task(agent_type="task", name="dependency-risk-scan", model="gpt-5-mini", prompt=@"
Run dependency/security checks available in this repo (if any), summarize results.
If no tooling exists, state that clearly and recommend the next best check.
"@)

task(agent_type="explore", name="secrets-exposure-scan", model="claude-haiku-4.5", prompt=@"
Search the repo for likely secrets or unsafe patterns (tokens, keys, .env committed).
List matches with file paths + context.
"@)

# Persist specialist results (examples)
sql(description="Persist security auth findings", query=@"
UPDATE hierarchical_jobs
SET status='done', started_at=COALESCE(started_at, datetime('now')),
    finished_at=datetime('now'),
    summary='Auth/threat-model review completed',
    result='(paste findings or store a short pointer to a file artifact)'
WHERE id = '$rootJobId-security-auth';
"@)

# Domain summary
sql(description="Finish security domain", query=@"
UPDATE hierarchical_jobs
SET status='done', finished_at=datetime('now'),
    summary='Security domain complete: key auth risks + dependency posture + secrets scan.'
WHERE id = '$rootJobId-security';
"@)
```

## When to Use

- **Multi-repo migration**: one root orchestrator per program; domain orchestrators per repo or per platform (CI, infra, app), each delegating to specialists.
- **Full-system audit**: split by domain (security/perf/arch) where each domain requires multiple distinct specialist passes.
- **Large documentation overhaul**: domain orchestrators per doc set (API docs, tutorials, reference), each delegating to translation/accuracy/tone specialists.

## When NOT to Use

- A **single-level fan-out** is enough → use [Fan-Out Parallel](fan-out-parallel.md).
- The work is naturally **sequential** (output of step N is required for step N+1) → use [Pipeline](pipeline.md).
- You mainly need multiple opinions on the *same* prompt → use [Agent Council](agent-council.md).

If the task has <5 independent chunks, hierarchical delegation usually adds overhead (more orchestration than execution).

## State Management

A minimal SQL schema for tracking hierarchical state in Copilot's session database:

```sql
CREATE TABLE hierarchical_jobs (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  level INTEGER NOT NULL,         -- 0=root, 1=domain orchestrator, 2=specialist
  name TEXT NOT NULL,
  agent_type TEXT,               -- explore|task|general-purpose|code-review|research|security-review
  model TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  summary TEXT,
  result TEXT,
  FOREIGN KEY(parent_id) REFERENCES hierarchical_jobs(id)
);

CREATE INDEX idx_hjobs_parent_id ON hierarchical_jobs(parent_id);
CREATE INDEX idx_hjobs_status ON hierarchical_jobs(status);
```

Useful queries:

```sql
-- Find all runnable work (pending leaf specialists)
SELECT *
FROM hierarchical_jobs
WHERE level = 2 AND status = 'pending'
ORDER BY parent_id, name;

-- Roll up progress by domain
SELECT parent.name AS domain, child.status, COUNT(*) AS count
FROM hierarchical_jobs child
JOIN hierarchical_jobs parent ON parent.id = child.parent_id
WHERE child.level = 2
GROUP BY parent.name, child.status
ORDER BY parent.name, child.status;
```

## See Also

- [Pattern: Fan-Out Parallel](fan-out-parallel.md)
- [Pattern: Pipeline](pipeline.md)
- [Pattern: Agent Council](agent-council.md)
