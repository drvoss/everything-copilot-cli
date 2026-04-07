# NestJS Rules

Best practices for building scalable server-side applications with NestJS.

## Module Structure

- Follow the **feature module** pattern: one module per domain (e.g., `UsersModule`, `AuthModule`)
- Use `CoreModule` (imported once in `AppModule`) for global singletons (logger, config, DB)
- Use `SharedModule` for utilities reused across feature modules
- Never import `AppModule` into other modules

## Dependency Injection

- Always use constructor injection — avoid property injection except for optional deps
- Mark optional dependencies explicitly with `@Optional()`
- Use `@Injectable({ scope: Scope.REQUEST })` only when truly needed; prefer singleton scope

## Controllers & Routes

- Keep controllers thin — delegate all business logic to services
- Use DTOs (Data Transfer Objects) with `class-validator` for every request body and query param
- Apply `ValidationPipe` globally with `whitelist: true` and `forbidNonWhitelisted: true`
- Return meaningful HTTP status codes via `@HttpCode()` or `HttpException` subclasses

## Security

- Apply `ThrottlerModule` for rate limiting on all public endpoints
- Use `@UseGuards(JwtAuthGuard)` on protected routes, or apply globally and whitelist public routes
- Never expose stack traces in production responses — use a global exception filter
- Validate and sanitize all input before it reaches service logic

## Configuration

- Use `@nestjs/config` with a validated config schema (Joi or zod)
- Access config only via `ConfigService` — never reference `process.env` directly in services
- Keep environment-specific values in `.env` files; commit `.env.example`

## Testing

- Unit test services with mocked dependencies using `jest.fn()` or `@golevelup/ts-jest`
- Use `Test.createTestingModule()` for integration tests
- Test each guard, pipe, and interceptor independently
