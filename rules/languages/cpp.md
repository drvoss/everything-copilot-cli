# C++ Rules

C++-specific coding guidelines. Apply alongside the common rules.

## Modern C++ Defaults

- Prefer **standard library facilities** and value types before custom ownership or utility code
- Target a clearly stated language level (C++17 or newer for new code)
- Prefer `#pragma once` for project headers unless your toolchain requires traditional include guards
- Keep interfaces small and explicit; avoid macro-heavy APIs when normal language features work

## Ownership & Resource Management

- Use **RAII** for every owned resource: memory, file handles, locks, sockets, and threads
- Prefer `std::unique_ptr` for exclusive ownership; use `std::shared_ptr` only when shared lifetime is truly required
- Prefer stack allocation and standard containers over raw `new` / `delete`
- Follow the **Rule of Zero** first; only implement special member functions when ownership semantics require it
- Never let destructors throw

```cpp
// Good
class LogFile {
public:
    explicit LogFile(std::filesystem::path path)
        : stream_(std::move(path)) {}

private:
    std::ofstream stream_;
};

// Avoid
class LogFile {
public:
    explicit LogFile(const std::string& path) {
        stream_ = new std::ofstream(path);
    }

    ~LogFile() { delete stream_; }

private:
    std::ofstream* stream_{};
};
```

## API Design & Type Usage

- Be **const-correct by default** — mark member functions `const` when they do not mutate state
- Use references for non-null required parameters and pointers for optional parameters
- Prefer `std::string_view` for read-only string inputs and `std::span` for borrowed contiguous ranges
- Prefer `enum class` over unscoped enums
- Mark single-argument constructors `explicit` unless implicit conversion is intentional

## Special Members & Moves

- If a type owns resources directly, define or delete the copy/move operations intentionally
- Mark move constructors and move assignment `noexcept` when they cannot fail
- Prefer defaulted special members over handwritten ones when behavior is correct

## Error Handling

- Be consistent within a component: use exceptions or status-return types deliberately, not both at random
- Add context when propagating errors; do not lose the failing operation or input
- Use assertions for programmer errors and invariant checks, not user-facing error handling
- Do not swallow exceptions in destructors, cleanup paths, or background threads without reporting them

## Memory & Bounds Safety

- Prefer `std::array`, `std::vector`, and `std::span` over raw arrays and pointer arithmetic
- Avoid unchecked indexing when a bounds-safe alternative is available
- Minimize manual lifetime coupling between objects; make ownership visible in the type system
- Treat undefined behavior as a correctness bug even when it "works on your machine"

## Concurrency

- Guard shared mutable state with a clear synchronization strategy
- Prefer `std::jthread`, RAII lock types, and scoped synchronization helpers over manual thread lifetime management
- Avoid holding locks across I/O, callbacks, or user code
- Document thread-safety expectations on public types that may be shared across threads

## Build & Tooling

- Prefer **target-based CMake** usage (`target_link_libraries`, `target_include_directories`, `target_compile_features`)
- Keep warnings high and clean on the supported toolchains
- Use `clang-format` or an equivalent formatter consistently
- Enable sanitizers in debug/test configurations when the toolchain supports them

```cmake
add_executable(example main.cpp)
target_compile_features(example PRIVATE cxx_std_20)
target_compile_options(example PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4 /WX>
    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra -Wpedantic -Werror>
)
```

## Testing & Diagnostics

- Use unit tests for deterministic logic and integration tests for boundary behavior
- Add regression tests for every fixed crash, race, or lifetime bug
- Compile diagnostic builds with symbols enabled before debugging
- Reach for AddressSanitizer, UndefinedBehaviorSanitizer, and ThreadSanitizer early for suspicious native failures

## Performance

- Measure before optimizing; do not trade correctness or readability for imagined wins
- Prefer algorithmic improvements and data-structure choices over micro-optimizations
- Pass large objects by reference or move when ownership transfer is intended
