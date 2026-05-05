---
name: cross-session-memory
description: Use when you need to recover context, decisions, or artifacts across multiple Copilot CLI sessions — search prior session history and resume with the right files, notes, and state.
metadata:
  category: copilot-exclusive
  copilot_feature: "Session resume (/resume), session store (session_store database), session artifacts"
---

# Cross-Session Memory & Continuity

## Why This is Copilot-Exclusive

Copilot CLI maintains a **cross-session history store** — a read-only SQLite database
(`session_store`) that contains conversation history, file references, and full-text search
across all your past sessions. Combined with `/resume` to continue previous sessions and
session artifacts stored in `files/`, this creates persistent memory across your development
workflow. Claude Code sessions are ephemeral — when a session ends, its context is gone.

## When to Use

- Resuming work on a multi-day task
- Searching past sessions for how you solved a similar problem before
- Building on artifacts (plans, analyses, configs) from previous sessions
- Maintaining context continuity across terminal restarts
- Reviewing what you accomplished in past sessions

## Workflow

### 1. Resume a Previous Session

Use the `/resume` command to pick up where you left off:

```text
/resume
```

This lists your recent sessions. Select one to continue with full context restored,
including conversation history, file state, and session database.

### 2. Search Across Sessions

Query the `session_store` database to find past work:

```sql
-- Prefer the search index for text lookup, then join back to sessions
sql(database: "session_store",
    query: "
      SELECT s.id, s.summary, si.source_type
      FROM search_index si
      JOIN sessions s ON s.id = si.session_id
      WHERE search_index MATCH 'authentication OR auth OR login'
      ORDER BY s.updated_at DESC
      LIMIT 10
    ")
```

The `session_store` includes FTS5 (full-text search) for fast, fuzzy searching
across all your historical sessions.

Start broad, then narrow:

1. search `search_index` with expanded keywords
2. identify the relevant session IDs
3. read the corresponding turns, checkpoints, or files in that session

If you query `sessions` directly, use it for structured metadata such as repository, branch, or
date range — not as your primary full-text search surface.

### 3. Access Session Artifacts

Files created during sessions are stored in the session's `files/` directory:

```text
~/.copilot/session-state/<session-id>/files/
```

These persist after the session ends and can be referenced in future sessions.

### 4. Session Database Continuity

When you resume a session, its SQL database is restored:

```sql
-- Check where you left off
SELECT id, title, status FROM todos ORDER BY updated_at DESC;

-- Continue from your last in-progress todo
SELECT * FROM todos WHERE status = 'in_progress';
```

### 5. Building Knowledge Over Time

#### Pattern: Evolving Architecture Documents

```text
Session 1: "Analyze the codebase architecture and create a summary"
           → Produces architecture analysis in session artifacts

Session 2: /resume → "Update the architecture doc with the new payment module
                       we added last week"
           → Builds on previous analysis

Session 3: /resume → "Add the performance benchmarks we ran yesterday"
           → Continues evolving the document
```

#### Pattern: Progressive Refactoring

```text
Session 1: Plan the refactoring (todos created in SQL)
Session 2: /resume → Execute Phase 1 (update todo statuses)
Session 3: /resume → Execute Phase 2 (pick up from SQL state)
Session 4: /resume → Final verification and cleanup
```

## Examples

### Multi-Day Feature Development

```text
# Day 1 - Monday
You: "Plan the new notification system"
Copilot: Creates plan, SQL todos, architecture notes

# Day 2 - Tuesday
/resume
You: "Continue with the notification system. Where did we leave off?"
Copilot: Reads SQL todos, sees Phase 1 is done, starts Phase 2

# Day 3 - Wednesday
/resume
You: "Let's finish the notification system and write tests"
Copilot: Picks up from Phase 2 completion, writes tests
```

### Finding Past Solutions

```text
You: "Last month I set up a Redis caching layer for something.
      Search my past sessions for how I configured it."

sql(database: "session_store",
    query: "
      SELECT s.id, s.summary
      FROM search_index si
      JOIN sessions s ON s.id = si.session_id
      WHERE search_index MATCH 'redis OR cache OR redis-cache OR caching'
      ORDER BY s.updated_at DESC
      LIMIT 5
    ")
```

Copilot finds the relevant session and extracts the configuration approach.

### Reusing Analysis

```text
You: "I did a security audit of the auth module a few weeks ago.
      Find that analysis and check if the issues were fixed."

# Search past sessions
# Find the security audit
# Compare findings against current code
# Report which issues are resolved vs still open
```

### Session Artifact Workflow

```text
# Session 1: Generate a report
You: "Analyze test coverage gaps and create a report"
→ Report saved to session files/

# Session 2: Act on the report
/resume
You: "Now implement the missing tests from our coverage analysis"
→ Reads the report from session artifacts, generates tests
```

### Durable Knowledge in a Worktree

For research notes or reference material that should outlive a single session but stay isolated from
active code edits, keep them in a dedicated docs or notes worktree instead of mixing them into the
main checkout.

Good uses:

- durable architecture summaries
- long-lived comparison notes
- reproducible research snapshots

Guardrails:

- treat that worktree as a read-mostly knowledge store
- verify the expected remote or target path before writing into it
- redact credentials, tokens, or connection URLs before saving logs or copied config

## Tips

- **Use /resume for continuity**: Don't re-explain context. Resume picks up
  your full conversation and state.
- **Name your sessions**: Use descriptive first messages so sessions are easy
  to find later. "Set up payment processing" is better than "help me code."
- **SQL todos survive sessions**: Your `todos` table persists when you resume.
  Use it as a persistent task tracker across days.
- **Session store is read-only**: You can search `session_store` but not write
  to it. It's automatically populated from your session history.
- **Artifacts for important outputs**: When Copilot generates something you'll
  need later (reports, configs, plans), it can save to session files.
- **Use worktrees for durable reference sets**: If the material should persist beyond one session
  and stay separate from product code edits, keep it in a dedicated worktree.
- **Prefer structured retrieval over memory**: search `search_index`, then inspect matching turns
  or checkpoints instead of guessing from titles alone.
- **Search before you start**: Before tackling a problem, search past sessions
  to see if you've solved something similar. Build on past work, don't repeat it.
