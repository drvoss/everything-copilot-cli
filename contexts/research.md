# Context: Research & Exploration Mode

## Purpose

Activate this context when investigating a codebase, understanding architecture,
or researching how something works. This mode is read-only — no code is modified.

## Behaviour

- **Use explore agents** for codebase understanding — they are fast, parallelisable,
  and designed for search and synthesis tasks.
- **Summarise findings clearly** — after exploration, produce a structured summary
  with file paths, key patterns, and relationships.
- **Do not modify code** — this mode is strictly for reading and understanding.
  If changes are needed, switch to development context.
- **Document architecture decisions** — when researching design approaches, capture
  options, trade-offs, and recommendations in a structured format.
- **Use grep/glob efficiently** — start with broad glob patterns to locate relevant
  files, then use grep for specific patterns. Batch related searches.

## Workflow

1. Define the question or area to investigate
2. Use glob to find relevant files by pattern
3. Use explore agents to read and understand the code
4. Synthesise findings into a clear summary
5. Identify follow-up questions if the picture is incomplete

## Tips for Effective Research

- **Batch questions** — launch multiple explore agents in parallel with related
  questions rather than asking one at a time.
- **Start broad, then narrow** — begin with directory listings and file patterns,
  then drill into specific files.
- **Trace data flow** — follow the path of data from entry point (API route,
  event handler) through to storage (database, file system).
- **Map dependencies** — understand what depends on what before proposing changes.

## Agent Preferences

| Task                    | Agent Type       |
|-------------------------|------------------|
| Search for patterns     | explore          |
| Understand architecture | explore          |
| Read specific files     | (use view tool)  |
| Synthesise findings      | general-purpose  |
| Check dependencies      | explore          |
| Web / cross-repo research | research       |
