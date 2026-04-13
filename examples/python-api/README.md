# Example: Python FastAPI

> **Reference `.github/copilot-instructions.md`** for a FastAPI REST API project.

## What This Example Represents

A production FastAPI application with async SQLAlchemy, Alembic, Pydantic v2, and JWT
auth. The instructions prevent AI from generating synchronous SQLAlchemy patterns, using
`db.Session` instead of `AsyncSession`, or skipping Alembic migrations.

## Project Structure (assumed)

```text
python-api/
├── .github/
│   └── copilot-instructions.md   ← copy this to your project
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/        # FastAPI routers
│   │       └── deps.py           # Dependency injection (get_db, get_current_user)
│   ├── core/
│   │   ├── config.py             # Pydantic Settings
│   │   └── security.py           # JWT utilities
│   ├── db/
│   │   ├── base.py               # SQLAlchemy declarative base
│   │   └── session.py            # AsyncSession factory
│   ├── models/                   # SQLAlchemy ORM models
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── services/                 # Business logic
│   └── main.py
├── alembic/
│   ├── versions/
│   └── env.py
├── tests/
│   ├── conftest.py               # pytest fixtures (async_client, db_session)
│   └── api/
├── Dockerfile
└── pyproject.toml
```

## How to Use This Example

1. **Copy** `.github/copilot-instructions.md` into your Python project root
2. **Edit** the Tech Stack table to match your versions
3. **Adjust** the Architecture section for your layer naming
4. **Add** domain-specific rules (e.g., background task patterns, external API clients)

```powershell
# Copy from this example into your project
Copy-Item examples/python-api/.github/copilot-instructions.md `
  -Destination /path/to/your-project/.github/copilot-instructions.md
```

## Recommended Skills & Agents

| Task | Skill / Agent |
|------|--------------|
| Fix a GitHub Issue end-to-end | `skills/development/fix-github-issue/` |
| Add to CHANGELOG | `skills/documentation/add-to-changelog/` |
| Release (Python / pyproject.toml) | `skills/workflow/release/` |
| Security scan | `skills/security/security-scan/` |
| Sprint retrospective | `skills/workflow/sprint-retro/` |

## See Also

- [Migration guide](../../guides/migration-from-claude-code.md) — adapt from Claude Code
- [skills/README.md](../../skills/README.md) — full skill catalog
