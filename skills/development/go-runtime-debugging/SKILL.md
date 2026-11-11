---
name: go-runtime-debugging
license: MIT
description: Use when a Go program panics, hangs, deadlocks, leaks goroutines or memory, reports a data race, or slows down without explanation — reproduce it, then diagnose with the race detector, goroutine dumps, pprof, execution traces, and Delve before patching.
metadata:
  category: development
  agent_type: general-purpose
---

# Go Runtime Debugging

`systematic-debugging` gives you the language-neutral method. This skill adds the Go toolchain and
runtime techniques that matter once the bug involves goroutines, channels, the scheduler, or the
garbage collector — failures that do not show up in a stack trace from a single panic.

## When to Use

- A process or test hangs, or the runtime reports `fatal error: all goroutines are asleep - deadlock!`
- The goroutine count or memory use grows over time until the service is restarted or OOM-killed
- `go test -race` reports a data race, or a test fails only some of the time
- Latency rises with no CPU or dependency explanation
- A panic's stack trace points into code that looks correct

## When NOT to Use

| Instead of go-runtime-debugging | Use |
|---------------------------------|-----|
| A compile or `go vet` error | `fix-build-errors` |
| A logic bug that reproduces deterministically in one goroutine | `systematic-debugging` |
| Native crashes in cgo or C/C++ libraries | `cpp-debugging` |
| A logic bug where a failing regression test can be written before any runtime diagnosis | `tdd-workflow` first, then this skill if runtime behavior is involved |

## Prerequisites

- A Go toolchain that satisfies the module's `go` requirement and any `toolchain` directive
  (`go version`, `go env GOVERSION GOTOOLCHAIN`)
- A command that reproduces the symptom, even intermittently
- For running services: a way to reach a debug endpoint or send a signal to the process

## Workflow

### 1. Reproduce and Pin the Environment

Record `go version`, `GOOS`/`GOARCH`, `GOMAXPROCS`, and the exact command. Turn an intermittent
failure into a repeatable one before reading code:

```bash
go test -run TestOrderFlow -count=200 -failfast ./internal/orders/
go test -run TestOrderFlow -count=50 -cpu=1,4,16 ./internal/orders/
```

### 2. Run the Race Detector First

```bash
go test -race -run TestOrderFlow -count=20 ./internal/orders/
```

A race report names two goroutines and the memory they share. Fix the ownership (a mutex, a
channel handoff, or no sharing), not the symptom. A clean `-race` run only covers the paths the run
executed — it does not prove the code race-free.

### 3. Dump Goroutines for Hangs and Leaks

- Test hangs: `go test -v -timeout 30s -run TestOrderFlow ./internal/orders/` prints every
  goroutine's stack when the timeout fires; target the hanging package so unrelated output stays out
- Running process: read `/debug/pprof/goroutine?debug=2` when `net/http/pprof` is enabled. As a last
  resort, `SIGQUIT` (Unix) prints a stack dump and terminates the process under Go's default signal
  handling — check that the program does not intercept or ignore `SIGQUIT`

Group stacks by the line they are blocked on. Many goroutines parked on the same channel send,
receive, `sync.WaitGroup.Wait`, or `select` point to a missing close, a missing receiver, or a
context that is never cancelled.

### 4. Profile Memory, CPU, and Blocking

```bash
go test -run TestOrderFlow -memprofile mem.out -cpuprofile cpu.out ./internal/orders/
go tool pprof -top mem.out
go tool pprof -top cpu.out
```

For a service with `net/http/pprof`, capture two steady-state heap profiles minutes apart with
`/debug/pprof/heap?gc=1` (which runs a GC first) and compare them with
`go tool pprof -diff_base=heap1.pb.gz heap2.pb.gz`. Retained growth identifies leak candidates;
confirm the objects are retained unintentionally (not a bounded cache) before calling it a leak. Use the
`block` and `mutex` profiles for contention; they are off until the program sets
`runtime.SetBlockProfileRate` and `runtime.SetMutexProfileFraction`.

### 5. Trace Scheduling and Latency

```bash
go test -run TestOrderFlow -trace trace.out ./internal/orders/
go tool trace trace.out
```

The trace shows when goroutines were runnable but not running, GC pauses, and syscall blocking.
Use it when profiles look flat but requests are slow.

### 6. Step Through with Delve When State Matters

```bash
dlv test ./internal/orders/ -- -test.run TestOrderFlow
```

Delve starts paused: set a breakpoint (`break orders.go:42`) and `continue` to run to it or to the
failure. Then `goroutines` lists every goroutine and `goroutine <id> bt` shows its stack. Attach
to a running process with `dlv attach <pid>` only where pausing it is acceptable.

## Common Rationalizations

| Rationalization | Reality |
|-----------------|---------|
| "The test is flaky, retry it" | Intermittent Go failures are usually races or ordering bugs; `-count` and `-race` find them |
| "Add a `time.Sleep` so the goroutine finishes" | Sleeps hide ordering bugs and fail under load; synchronize explicitly |
| "Memory grows because Go's GC is lazy" | Growth that survives repeated GC is a leak or intentional retention; inspect what retains it and the expected cache bounds |
| "-race passed, so it's safe" | The detector only sees executed paths; cover the concurrent path in the run |

## Red Flags

- The fix adds a buffer to a channel without explaining who drains it
- A goroutine is started without a way to stop it (no context, no done channel, no close)
- `recover()` is added to silence a panic instead of fixing its cause
- Profiles are read from a build with different flags or Go version than production

## Verification

- [ ] The original reproduction command now passes with a high `-count` (for example 200)
- [ ] `go test -race ./...` passes for the affected packages
- [ ] `go vet ./...` passes
- [ ] For leaks: goroutine count and heap stay flat across the reproduction workload
- [ ] A regression test covers the failing interleaving or input

If the patch introduces a new race, leak, or slowdown in these checks, revert it, keep the profiles
and the reproduction command in the issue, and form the next hypothesis from them.

## Tips

- `GOTRACEBACK=all` prints all goroutines on a fatal panic, not just the crashing one
- `GODEBUG=gctrace=1` prints one line per GC cycle — a quick check on heap growth
- Keep `net/http/pprof` on an internal-only listener; never expose it publicly
