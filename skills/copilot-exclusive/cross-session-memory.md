---
name: cross-session-memory
description: Build persistent knowledge across sessions with resume, search, and artifacts
category: copilot-exclusive
copilot_feature: Session resume (/resume), session store (session_store database), session artifacts
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

```
/resume
```

This lists your recent sessions. Select one to continue with full context restored,
including conversation history, file state, and session database.

### 2. Search Across Sessions

Query the `session_store` database to find past work:

```sql
-- Search for sessions where you worked on authentication
sql(database: "session_store",
    query: "SELECT * FROM sessions WHERE content MATCH 'authentication'")
```

The `session_store` includes FTS5 (full-text search) for fast, fuzzy searching
across all your historical sessions.

### 3. Access Session Artifacts

Files created during sessions are stored in the session's `files/` directory:

```
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

```
Session 1: "Analyze the codebase architecture and create a summary"
           → Produces architecture analysis in session artifacts

Session 2: /resume → "Update the architecture doc with the new payment module
                       we added last week"
           → Builds on previous analysis

Session 3: /resume → "Add the performance benchmarks we ran yesterday"
           → Continues evolving the document
```

#### Pattern: Progressive Refactoring

```
Session 1: Plan the refactoring (todos created in SQL)
Session 2: /resume → Execute Phase 1 (update todo statuses)
Session 3: /resume → Execute Phase 2 (pick up from SQL state)
Session 4: /resume → Final verification and cleanup
```

## Examples

### Multi-Day Feature Development

```
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

```
You: "Last month I set up a Redis caching layer for something.
      Search my past sessions for how I configured it."

sql(database: "session_store",
    query: "SELECT * FROM sessions WHERE content MATCH 'redis cache config'")
```

Copilot finds the relevant session and extracts the configuration approach.

### Reusing Analysis

```
You: "I did a security audit of the auth module a few weeks ago.
      Find that analysis and check if the issues were fixed."

# Search past sessions
# Find the security audit
# Compare findings against current code
# Report which issues are resolved vs still open
```

### Session Artifact Workflow

```
# Session 1: Generate a report
You: "Analyze test coverage gaps and create a report"
→ Report saved to session files/

# Session 2: Act on the report
/resume
You: "Now implement the missing tests from our coverage analysis"
→ Reads the report from session artifacts, generates tests
```

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
- **Search before you start**: Before tackling a problem, search past sessions
  to see if you've solved something similar. Build on past work, don't repeat it.
