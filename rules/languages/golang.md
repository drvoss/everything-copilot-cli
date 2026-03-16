# Go Rules

Go-specific coding guidelines. Apply alongside the common rules.

## Error Handling

- **Handle all errors explicitly** — never ignore a returned error
- Use `fmt.Errorf("context: %w", err)` to wrap errors with context
- Check errors immediately after the call that returns them
- Use `errors.Is()` and `errors.As()` for error comparison — not string matching

```go
// Good
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doing something: %w", err)
}

// Never
result, _ := doSomething()
```

## Interfaces

- Use **interfaces for abstraction** — define them where they're consumed, not where they're implemented
- Keep interfaces small: 1–3 methods is ideal (the Go standard library averages ~2)
- Accept interfaces, return concrete types
- Use the `io.Reader`/`io.Writer` pattern as a model for your own interfaces

## Testing

- Use **table-driven tests** for functions with multiple input/output scenarios
- Name test cases clearly in the table
- Use `t.Run()` for subtests — they enable parallel execution and better failure reporting
- Use `t.Helper()` in test helper functions for accurate line reporting

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 1, 2, 3},
        {"with zero", 0, 5, 5},
        {"negative numbers", -1, -2, -3},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            if got := Add(tt.a, tt.b); got != tt.expected {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.expected)
            }
        })
    }
}
```

## Package Design

- **No `init()` functions** unless absolutely necessary (e.g., registering drivers)
- Keep package names short, lowercase, single-word
- Avoid package-level mutable state — pass dependencies explicitly
- Use internal packages to hide implementation details

## Concurrency

- Use **`context.Context`** for cancellation, deadlines, and request-scoped values
- Pass `ctx` as the first parameter to functions that accept it
- Don't store `context.Context` in structs
- Use `errgroup` for managing groups of goroutines with error handling

## Composition & Design

- **Prefer composition over inheritance** — embed structs and interfaces
- Use functional options pattern for complex constructors
- Keep structs focused — one responsibility per struct
- Use constructor functions (`NewXxx`) to enforce invariants

## Naming & Style

- Follow **Effective Go** naming conventions
- Use `MixedCaps` (exported) and `mixedCaps` (unexported)
- Acronyms should be all caps: `HTTPClient`, `userID`
- Run `gofmt` and `go vet` — they're non-negotiable

## Dependencies & Modules

- Use **Go modules** (`go.mod`) for dependency management
- Run `go mod tidy` regularly to clean up unused dependencies
- Vendor dependencies for reproducible builds in critical services
- Minimize external dependencies — the standard library is excellent
