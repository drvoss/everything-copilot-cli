# Rust General Security Reference

Load this note when the project is primarily Rust and no more specific security reference exists
for the active framework. The checkpoints below are independently derived from known Rust security
patterns; do **not** paste content from third-party security skill libraries directly.

## Focus Areas

### 1. `unsafe` Boundary — Minimise and Audit Every Block

Rust's safety guarantees break down inside `unsafe` blocks. Keep each block as narrow as possible
and document invariants that justify the use.

```bash
# Locate all unsafe blocks
grep -rn 'unsafe {' src/
grep -rn 'unsafe impl' src/
grep -rn 'unsafe fn' src/
```

Review points:

- Is the `unsafe` scope the smallest it can be?
- Are all pointer-safety invariants (`NonNull`, alignment, lifetime) documented with comments?
- Does the code avoid undefined behaviour (UB) — especially around raw pointer arithmetic and
  union field access?

### 2. Memory Safety — Dangling References and Use-After-Free

The borrow checker catches most memory issues at compile time, but FFI and certain `unsafe`
patterns can still produce dangling references or use-after-free.

```bash
# Raw pointer patterns that often accompany lifetime issues
grep -rn '\*mut \|*const ' src/ | grep -v '//'
grep -rn 'mem::transmute\|mem::forget\|ptr::read\|ptr::write' src/
```

Review points:

- Does any `'static` lifetime annotation paper over an actual shorter-lived reference?
- Are `Box::from_raw` or `ptr::drop_in_place` paired correctly with their corresponding
  allocation sites?
- Does `std::mem::forget` prevent a destructor that is required for resource cleanup?

### 3. Concurrency — Data Race and Deadlock

Rust prevents data races for `Send + Sync` types, but logic-level races and deadlocks are still
possible.

```bash
# Types shared across threads without proper synchronisation primitives
grep -rn 'Arc<Mutex\|Arc<RwLock\|Rc<RefCell' src/
# Thread spawns with captured environment
grep -rn 'thread::spawn\|tokio::spawn' src/
```

Review points:

- Are all types shared across threads `Send + Sync`? (`Rc`, `Cell`, `RefCell` are not.)
- Are lock acquisition orders consistent to prevent deadlocks? Prefer a single canonical order.
- Is `RwLock` read-lock starvation possible under high concurrent write load?

### 4. FFI Boundary — C Interoperability

Foreign function calls opt out of Rust's safety model entirely.

```bash
grep -rn 'extern "C"' src/
grep -rn '#\[no_mangle\]' src/
grep -rn 'CStr::from_ptr\|CString::from_raw' src/
```

Review points:

- Are all C-side pointers checked for null before dereferencing (`ptr.is_null()`)?
- Are struct layouts explicitly annotated with `#[repr(C)]` when passed across the FFI boundary?
- Does any Rust `panic!` unwind across an FFI boundary? Add `catch_unwind` at FFI entry points
  or compile with `panic = "abort"`.
- Are C strings (`*const c_char`) converted through `CStr::from_ptr` only when the caller
  guarantees the pointer is valid, non-null, and NUL-terminated?

### 5. Panic and Denial of Service — Hot Path Hardening

A `panic!` in a Rust binary terminates the process or unwinds the stack. In services and
libraries this can be a DoS vector.

```bash
# Common panic sources in production code
grep -rn '\.unwrap()\|\.expect(' src/
grep -rn 'index\[.*\]\|get_unchecked' src/
# Integer arithmetic that panics on overflow in debug builds
grep -rn 'checked_add\|checked_sub\|checked_mul\|wrapping_add\|saturating_' src/
```

Review points:

- Replace `.unwrap()` / `.expect()` in hot paths with `?`-propagation or explicit error handling.
- Use `checked_*` or `saturating_*` arithmetic where overflow is a plausible input condition.
- Avoid direct index operations on untrusted-length slices; use `.get(i)` instead.
- For library code, prefer `Result`/`Option` returns over panics at all public API boundaries.

### 6. Async Runtime — Blocking and Task Leaks

Mixing synchronous blocking calls into an async runtime can starve the executor and degrade
availability.

```bash
grep -rn 'std::thread::sleep\|std::fs::\|std::net::' src/ | grep -v 'test'
grep -rn 'block_on\|futures::executor' src/
grep -rn 'tokio::spawn\|task::spawn' src/
```

Review points:

- Are blocking I/O calls (`std::fs`, synchronous `std::net`) isolated inside
  `tokio::task::spawn_blocking` (or equivalent)?
- Are spawned tasks always awaited or detached intentionally? Leaked tasks can exhaust the
  runtime thread pool.
- Does any async function hold a `Mutex` guard across an `.await` point? Use `tokio::sync::Mutex`
  in async context, not `std::sync::Mutex`.

## Pair With

- [`../security-checklist.md`](../security-checklist.md)
- [`../../skills/security/security-scan/SKILL.md`](../../skills/security/security-scan/SKILL.md)
- relevant rules in `../../rules/languages/` when a Rust-specific rule file exists
