# Example: ASP.NET Core Web API

> **Reference `.github/copilot-instructions.md`** for an ASP.NET Core 9 CQRS project.

## What This Example Represents

A production ASP.NET Core application with Clean Architecture, MediatR, Entity Framework
Core, and FluentValidation. The instructions enforce layer boundaries (Domain has no
infrastructure references), CQRS command/query separation, and xUnit + Testcontainers
test patterns that AI assistants routinely violate.

## Project Structure (assumed)

```text
dotnet-webapp/
├── .github/
│   └── copilot-instructions.md   ← copy this to your project
├── src/
│   ├── Domain/                   # Entities, value objects, domain events (no deps)
│   ├── Application/              # Commands, Queries, Handlers, DTOs (refs Domain only)
│   │   ├── Features/
│   │   │   └── <Feature>/
│   │   │       ├── Commands/
│   │   │       └── Queries/
│   │   └── Common/               # Behaviours (validation, logging, auth pipelines)
│   ├── Infrastructure/           # EF Core, external services (refs Application)
│   │   ├── Persistence/
│   │   └── Services/
│   └── WebApi/                   # Controllers, middleware, DI registration
│       ├── Controllers/
│       └── Program.cs
├── tests/
│   ├── Domain.Tests/             # Pure unit tests
│   ├── Application.Tests/        # Handler tests with mock repos
│   └── Integration.Tests/        # Testcontainers (real PostgreSQL/SQL Server)
└── MyApp.sln
```

## How to Use This Example

1. **Copy** `.github/copilot-instructions.md` into your .NET project root
2. **Edit** the Tech Stack table to match your actual package versions
3. **Adjust** layer names if your solution uses different naming
4. **Add** project-specific rules (e.g., domain event patterns, saga orchestration)

```powershell
# Copy from this example into your project
Copy-Item examples/dotnet-webapp/.github/copilot-instructions.md `
  -Destination /path/to/your-project/.github/copilot-instructions.md
```

## Recommended Skills & Agents

| Task | Skill / Agent |
|------|--------------|
| Fix a GitHub Issue end-to-end | `skills/development/fix-github-issue/` |
| Multi-lens PR review | `skills/development/pr-multi-perspective-review/` |
| Security scan | `skills/security/security-scan/` |
| Release (.NET / tag-based) | `skills/workflow/release/` |
| Full security audit | `skills/workflow/security-audit/` |

## See Also

- [Migration guide](../../guides/migration-from-claude-code.md) — adapt from Claude Code
- [skills/README.md](../../skills/README.md) — full skill catalog
