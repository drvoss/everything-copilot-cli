# Python FastAPI — Copilot Instructions

## Project Overview

This is a **FastAPI REST API** built with Python 3.12+, SQLAlchemy, and Pydantic.
It follows clean architecture principles with clear separation between routers,
services, and repositories.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | FastAPI 0.110+                      |
| Language     | Python 3.12+                        |
| ORM          | SQLAlchemy 2.x (async)              |
| Validation   | Pydantic v2                         |
| Database     | PostgreSQL 15+ (asyncpg driver)     |
| Migrations   | Alembic                             |
| Auth         | python-jose (JWT) + passlib         |
| Task Queue   | Celery + Redis                      |
| Testing      | pytest + httpx + factory_boy        |
| Deployment   | Docker + AWS ECS (Fargate)          |

## Architecture & Conventions

### Directory Structure

```
src/
├── api/
│   ├── v1/
│   │   ├── routes/        # Route definitions (thin controllers)
│   │   │   ├── users.py
│   │   │   ├── posts.py
│   │   │   └── auth.py
│   │   └── dependencies.py # Dependency injection
│   └── middleware/         # CORS, auth, logging middleware
├── core/
│   ├── config.py           # Settings via pydantic-settings
│   ├── security.py         # JWT, password hashing
│   └── exceptions.py       # Custom exception classes
├── models/                 # SQLAlchemy ORM models
├── schemas/                # Pydantic request/response schemas
├── services/               # Business logic layer
├── repositories/           # Data access layer
├── tasks/                  # Celery async tasks
└── tests/
    ├── conftest.py         # Fixtures, test database setup
    ├── factories/          # factory_boy model factories
    ├── unit/               # Unit tests for services
    ├── integration/        # API integration tests
    └── e2e/                # End-to-end test scenarios
```

### Key Rules

1. **Type hints everywhere** — every function parameter, return type, and variable
   annotation must be typed. Use `from __future__ import annotations` in all files.
2. **Async/await by default** — all I/O-bound operations (database, HTTP, file)
   must use async. Use `asyncio.gather()` for concurrent operations.
3. **Pydantic models for all boundaries** — request bodies, response bodies, config,
   and inter-service data transfer must use Pydantic models.
4. **Thin routes, thick services** — routes handle HTTP concerns only (status codes,
   headers). Business logic lives in services; data access in repositories.
5. **Dependency injection** — use FastAPI's `Depends()` for database sessions,
   current user, and service instances. Never instantiate services directly.

### Naming Conventions

- Files/modules: `snake_case.py`
- Classes: `PascalCase` (e.g., `UserService`, `PostRepository`)
- Functions: `snake_case` with verb prefix (e.g., `get_user_by_id`, `create_post`)
- Pydantic schemas: `{Model}{Action}` (e.g., `UserCreate`, `UserResponse`)
- Constants: `UPPER_SNAKE_CASE`

### Error Handling

- Raise domain-specific exceptions (e.g., `UserNotFoundError`, `InsufficientPermissionsError`).
- Catch and translate to HTTP responses in exception handlers, not in routes.
- Always return structured error responses: `{"detail": "...", "code": "..."}`.

## Testing Strategy

- **Unit tests**: test services in isolation with mocked repositories.
- **Integration tests**: test API endpoints with httpx `AsyncClient` and a test DB.
- **Factories**: use factory_boy for consistent test data generation.
- Run: `pytest -v --cov=src --cov-report=term-missing`

## Environment & Deployment

- Config: `pydantic-settings` with `.env` file and environment variable overrides.
- Database: `alembic upgrade head` for migrations. Auto-run in Docker entrypoint.
- Docker: multi-stage build — `python:3.12-slim` base, non-root user, health check.
- CI/CD: GitHub Actions → ECR push → ECS rolling deployment.
- Staging: `develop` branch → staging ECS cluster.
- Production: tagged releases → production ECS cluster.

## Copilot CLI Tips

- Use **explore** agents to trace request flow from route to repository.
- Use **task** agents to run `pytest`, `alembic`, or `docker compose` commands.
- When adding endpoints, create schema → service → repository → route in order.
- For async debugging, check event loop and connection pool configuration.
