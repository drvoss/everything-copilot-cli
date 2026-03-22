# ASP.NET Core Web API — Copilot Instructions

## Project Overview

This is an **ASP.NET Core 9 Web API** built with C# 13, Entity Framework Core,
MediatR, and FluentValidation. It follows Clean Architecture with strict layer
boundaries and a CQRS pattern for request handling.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | ASP.NET Core 9                      |
| Language       | C# 13                               |
| ORM            | Entity Framework Core 9              |
| Mediator       | MediatR 12.x                        |
| Validation     | FluentValidation 11.x               |
| Database       | SQL Server / PostgreSQL              |
| Auth           | ASP.NET Identity + JWT Bearer        |
| Logging        | Serilog                             |
| Mapping        | Mapster                             |
| Testing        | xUnit + NSubstitute + Testcontainers |
| Deployment     | Azure App Service                    |

## Architecture & Conventions

### Solution Structure (Clean Architecture)

```
src/
├── Domain/                  # Enterprise business rules
│   ├── Entities/            # Domain entities (anemic or rich)
│   ├── ValueObjects/        # Immutable value objects
│   ├── Enums/               # Domain enumerations
│   ├── Events/              # Domain events
│   └── Exceptions/          # Domain-specific exceptions
├── Application/             # Use cases and business logic
│   ├── Common/
│   │   ├── Behaviours/      # MediatR pipeline behaviours
│   │   ├── Interfaces/      # Abstractions (IRepository, IUnitOfWork)
│   │   └── Models/          # DTOs and result wrappers
│   ├── Features/
│   │   ├── Users/
│   │   │   ├── Commands/    # CreateUser, UpdateUser, DeleteUser
│   │   │   └── Queries/     # GetUser, ListUsers
│   │   └── Products/
│   │       ├── Commands/
│   │       └── Queries/
│   └── DependencyInjection.cs
├── Infrastructure/          # External concerns
│   ├── Persistence/         # EF Core DbContext, configurations
│   ├── Services/            # Email, file storage, caching
│   ├── Identity/            # Authentication & authorization
│   └── DependencyInjection.cs
└── Api/                     # Presentation layer
    ├── Controllers/         # Thin API controllers
    ├── Filters/             # Exception filters, action filters
    ├── Middleware/           # Custom middleware
    └── Program.cs           # App entry point and configuration
```

### Key Rules

1. **Nullable reference types enabled** — all projects use `<Nullable>enable</Nullable>`.
   Never suppress nullable warnings without a documented reason.
2. **Records for DTOs** — use `record` types for all data transfer objects, commands,
   queries, and API response models. Use `class` only for entities with identity.
3. **CQRS via MediatR** — every API action dispatches a command or query through
   MediatR. Controllers never call services directly.
4. **Validation in pipeline** — use FluentValidation validators registered as MediatR
   pipeline behaviours. Controllers assume validated requests.
5. **Dependency rule** — dependencies point inward. Domain has zero dependencies.
   Application depends only on Domain. Infrastructure implements Application interfaces.

### Naming Conventions

- Interfaces: `I` prefix (e.g., `IUserRepository`, `IEmailService`)
- Commands: `{Verb}{Entity}Command` (e.g., `CreateUserCommand`)
- Queries: `Get{Entity}Query`, `List{Entity}Query`
- Handlers: `{Command/Query}Handler` (e.g., `CreateUserCommandHandler`)
- Validators: `{Command/Query}Validator`
- API endpoints: RESTful nouns (`/api/users`, `/api/products/{id}`)

### Error Handling

- Domain exceptions for business rule violations (e.g., `InsufficientFundsException`).
- `Result<T>` pattern for expected failures — avoid exceptions for control flow.
- Global exception filter maps exceptions to problem details (RFC 7807).
- Use Serilog structured logging with correlation IDs.

## Testing Strategy

- **Unit tests** (xUnit + NSubstitute): test handlers, validators, and domain logic
  in isolation. Mock repository interfaces.
- **Integration tests** (Testcontainers): spin up real SQL Server in Docker.
  Test full request pipeline from controller to database.
- **Architecture tests** (NetArchTest): enforce layer dependency rules at build time.
- Run: `dotnet test --verbosity normal`

## Environment & Deployment

- Config: `appsettings.json` + `appsettings.{Environment}.json` + environment vars.
- Migrations: `dotnet ef migrations add` locally, auto-applied on startup.
- CI/CD: GitHub Actions → build → test → publish → deploy to Azure App Service.
- Environments: Development → Staging (Azure slot) → Production (swap).
- Health checks: `/health` endpoint with database and dependency checks.

## Copilot CLI Tips

- Use **explore** agents to navigate the Clean Architecture layers and trace request
  flow from controller → MediatR → handler → repository.
- Use **task** agents for `dotnet build`, `dotnet test`, or EF migrations.
- When adding a feature, create: Entity → Command/Query → Handler → Validator →
  Controller endpoint, in that order.
- For NuGet package issues, check version compatibility across all projects in the solution.
