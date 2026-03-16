# Java Rules

Java-specific coding guidelines. Apply alongside the common rules.

## Records & Immutability

- Use **records** for immutable data carriers (Java 16+)
- Records replace boilerplate POJOs — use them for DTOs, value objects, and events
- For mutable state, use classes with private fields and explicit getters/setters
- Use `List.of()`, `Map.of()`, `Set.of()` for immutable collections

```java
// Good — concise, immutable, with equals/hashCode/toString
public record UserDto(String name, String email, Role role) {}

// Avoid — boilerplate POJO for simple data
public class UserDto {
    private String name;
    private String email;
    // ... getters, setters, equals, hashCode, toString
}
```

## Null Handling

- Use **`Optional`** for return values that may be absent — never return `null` from public methods
- Do not use `Optional` for fields or method parameters
- Use `Optional.map()` and `Optional.flatMap()` for chaining — avoid `Optional.get()`
- Use `@Nullable`/`@NonNull` annotations for clear API contracts

## Stream API

- Use the **Stream API** for collection transformations — it's declarative and readable
- Prefer streams over manual loops for filter/map/reduce patterns
- Keep stream pipelines short — extract complex operations into named methods
- Use parallel streams only for CPU-intensive operations on large datasets

```java
// Good
var activeEmails = users.stream()
    .filter(User::isActive)
    .map(User::email)
    .toList();
```

## Resource Management

- Use **try-with-resources** for all `AutoCloseable` resources
- Never manage resource lifecycle manually with try/finally
- Implement `AutoCloseable` for custom resources that need cleanup

```java
// Good
try (var conn = dataSource.getConnection();
     var stmt = conn.prepareStatement(sql)) {
    // use connection
}
```

## Lombok

- Use **Lombok sparingly** — prefer records and standard Java features
- Acceptable uses: `@Slf4j`, `@Builder` (for complex objects), `@RequiredArgsConstructor`
- Avoid `@Data` on JPA entities (it breaks equals/hashCode for proxies)
- Document Lombok usage in the project README for team awareness

## Dependency Injection

- Use **constructor injection** — avoid field injection with `@Autowired`
- Make dependencies `final` — enforce immutability
- Keep constructors focused; if >4 dependencies, consider splitting the class
- Use `@Qualifier` or custom annotations for disambiguating implementations

## Error Handling

- Use **checked exceptions** for recoverable conditions, unchecked for programming errors
- Create a domain exception hierarchy rooted in a common base
- Never catch `Exception` or `Throwable` broadly — be specific
- Include context in exception messages: what failed and why

## Testing

- Use **JUnit 5** (`@Test`, `@ParameterizedTest`, `@Nested`) as the test framework
- Use **Mockito** for mocking dependencies — prefer `@ExtendWith(MockitoExtension.class)`
- Use `@ParameterizedTest` with `@CsvSource` or `@MethodSource` for data-driven tests
- Use **AssertJ** for fluent, readable assertions
- Use **Testcontainers** for integration tests with real databases/services

## Naming & Style

- Follow **Google Java Style Guide** or team-agreed conventions
- Use `PascalCase` for classes, `camelCase` for methods and variables
- Use `UPPER_SNAKE_CASE` for constants
- Run **Checkstyle** and **SpotBugs** in CI for consistent quality
