# Error Handling Rules

Guidelines for robust, user-friendly error handling.

## Core Principles

- **Never silently swallow errors** — every error should be handled or propagated
- An empty `catch` block is almost always a bug
- If you intentionally ignore an error, add a comment explaining why
- Errors are part of the API contract — document them

## Error Types

- Use **typed or custom error classes** instead of generic errors
- Include machine-readable error codes alongside human-readable messages
- Distinguish between operational errors (expected) and programmer errors (bugs)
- Create an error hierarchy that maps to your domain

```
AppError
├── ValidationError
├── NotFoundError
├── AuthenticationError
├── AuthorizationError
└── ExternalServiceError
```

## Error Context

- **Log errors with context**: what operation failed, relevant IDs, input parameters
- Include timestamps, request IDs, and correlation IDs for tracing
- Preserve the original error when wrapping — don't lose the stack trace
- Use structured logging (JSON) for machine-parseable error records

## Fail Fast

- **Fail fast on unrecoverable errors** — don't let the system limp along in a bad state
- Validate inputs at the boundary (API entry points, function parameters)
- Assert preconditions at the start of functions
- Crash early in development; recover gracefully in production

## User-Facing Errors

- **Provide user-friendly error messages** — avoid jargon and stack traces
- Tell users what went wrong and what they can do about it
- Use appropriate HTTP status codes for API errors (400, 401, 403, 404, 500)
- Return consistent error response shapes across your API

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is invalid",
    "details": [{ "field": "email", "issue": "must be a valid email" }]
  }
}
```

## Development vs Production

- **Include stack traces in development** for fast debugging
- Strip stack traces and internal details in production responses
- Log full error details server-side regardless of environment
- Use source maps to map minified stack traces back to source

## Async & Concurrent Errors

- Always handle promise rejections — use `.catch()` or `try/catch` with `await`
- Set up global unhandled rejection handlers as a safety net
- Use timeouts for external calls — don't wait forever
- Implement retry logic with exponential backoff for transient failures

## Recovery & Resilience

- Use circuit breakers for external service calls
- Provide fallback behavior where appropriate (cached data, defaults)
- Design for partial failure — one failing component shouldn't crash everything
- Test error paths as thoroughly as happy paths
