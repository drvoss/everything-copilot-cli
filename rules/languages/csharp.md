# C# Rules

C#-specific coding guidelines. Apply alongside the common rules.

## Nullable Reference Types

- **Enable nullable reference types** project-wide (`<Nullable>enable</Nullable>`)
- Annotate all reference types: use `string?` when null is valid, `string` when not
- Handle nullable values explicitly — don't suppress warnings with `!`
- Use null-conditional (`?.`) and null-coalescing (`??`, `??=`) operators

```csharp
// Good — explicit about nullability
public User? FindUser(string email) { ... }
public User GetUser(string email) => FindUser(email)
    ?? throw new NotFoundException($"User '{email}' not found");
```

## Async/Await Patterns

- Use **`async`/`await`** for all I/O-bound operations
- Suffix async methods with `Async`: `GetUserAsync()`, `SaveAsync()`
- Never use `.Result` or `.Wait()` — they cause deadlocks
- Use `ConfigureAwait(false)` in library code
- Return `Task` or `ValueTask`, not `void` (except event handlers)

## Records & DTOs

- Use **records** for immutable data transfer objects and value objects
- Use `record struct` for small, stack-allocated value types
- Prefer `init`-only properties for immutable configuration objects
- Use `with` expressions for creating modified copies

```csharp
public record UserDto(string Name, string Email, string Role);
public record CreateUserRequest(string Name, string Email);
```

## Dependency Injection

- Use **constructor injection** — avoid service locator pattern
- Register services with appropriate lifetimes: `Transient`, `Scoped`, `Singleton`
- Depend on abstractions (interfaces), not concrete implementations
- Keep constructors focused — if >4 dependencies, the class may be doing too much

## LINQ

- Use **LINQ over manual loops** when it improves readability
- Prefer method syntax for complex queries, query syntax for simple ones
- Avoid LINQ in hot paths where performance matters — benchmark first
- Use `Any()` instead of `Count() > 0` for existence checks

## Resource Management

- Implement **`IDisposable`** for classes that hold unmanaged resources
- Use `using` declarations (C# 8+) for concise disposal
- Use `IAsyncDisposable` and `await using` for async cleanup
- Always dispose `HttpClient` via `IHttpClientFactory`, not direct instantiation

```csharp
// Good
using var connection = new SqlConnection(connectionString);
await using var stream = File.OpenRead(path);
```

## Error Handling

- Use **exceptions for exceptional cases**, not control flow
- Create custom exception types for domain-specific errors
- Use `when` clause in catch for conditional handling
- Include relevant context in exception messages
- Use `ExceptionDispatchInfo` to rethrow without losing stack trace

## Naming & Style

- Follow **.NET naming conventions**: `PascalCase` for public members, `_camelCase` for private fields
- Use `I` prefix for interfaces: `IUserRepository`
- Use `Async` suffix for async methods
- Run **dotnet format** and analyzers (Roslyn, SonarAnalyzer) in CI

## Testing

- Use **xUnit** or **NUnit** with **Moq** or **NSubstitute** for mocking
- Use `[Theory]` with `[InlineData]` for parameterized tests
- Use **FluentAssertions** for readable assertions
- Test controllers with `WebApplicationFactory<T>` for integration tests
