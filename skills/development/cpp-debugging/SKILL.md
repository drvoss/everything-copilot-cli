---
name: cpp-debugging
description: Use when a C++ failure involves memory lifetime, undefined behavior, native crashes, or debugger-only state — debug with symbols, sanitizers, and platform-native debuggers before patching symptoms
metadata:
  category: development
  agent_type: general-purpose
---

# C++ Debugging

`systematic-debugging` gives you the language-neutral method. This skill adds the
native C++ toolchain and runtime techniques that matter once the bug involves
crashes, corrupted memory, UB, or platform-specific debugger state.

## When to Use

- A C++ process crashes with a segmentation fault, access violation, or abort
- The bug depends on object lifetime, ownership, or move/copy behavior
- Behavior changes between debug and release builds
- AddressSanitizer, UndefinedBehaviorSanitizer, or a debugger is needed to see the failure clearly
- A native test hangs, deadlocks, or corrupts memory without a clear stack trace

## When NOT to Use

| Instead of cpp-debugging | Use |
|--------------------------|-----|
| You still do not have a stable reproduction or root-cause workflow | `systematic-debugging` |
| The failure is a build, compile, or link error | `fix-build-errors` |
| The issue is performance-only, not correctness | `performance-optimization` |

## Prerequisites

- A reproducible failing command, test, or executable
- A debug-capable build with symbols
- Access to the relevant debugger or sanitizer-enabled toolchain
- Enough context to tell whether the bug is runtime, lifetime, concurrency, or build-related

## Workflow

### 1. Rebuild for diagnosis, not speed

Start with a debuggable build before chasing the crash:

```powershell
# CMake
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build --config Debug

# Clang/GCC direct build example
clang++ -std=c++20 -g -O0 -Wall -Wextra -Wpedantic main.cpp -o app.exe
```

Guidelines:

- enable symbols (`-g`, `/Zi`)
- reduce or disable optimization while reproducing (`-O0`, `/Od`)
- keep warnings enabled
- reproduce with the same inputs that fail in CI or production-like runs

### 2. Capture the exact failing surface

```powershell
# Run the failing binary or test under the same conditions each time
ctest --test-dir build --output-on-failure

# Or run the specific executable directly
.\build\app.exe
```

Record:

1. exact command line
2. failing input or fixture
3. crash signal or exit code
4. first bad log line, assertion, or stack frame

### 3. Inspect runtime state with a native debugger

Use the platform-native debugger your team standardizes on. Common flows:

```powershell
# GDB
gdb --args .\build\app.exe <args>
# (gdb) run
# (gdb) bt
# (gdb) frame 0
# (gdb) info locals
# (gdb) p suspiciousVariable

# LLDB
lldb -- .\build\app.exe <args>
# (lldb) run
# (lldb) bt
# (lldb) frame variable
```

Focus on:

- the first frame where state becomes invalid
- moved-from or already-destroyed objects
- container bounds and iterator validity
- null or dangling pointers
- cross-thread ordering when the state only fails under load

### 4. Turn on sanitizers early

Sanitizers catch the class of bugs that ordinary logging often hides.

```powershell
# Clang/GCC
cmake -S . -B build-asan `
  -DCMAKE_BUILD_TYPE=Debug `
  -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer"
cmake --build build-asan
ctest --test-dir build-asan --output-on-failure
```

If your toolchain supports it, enable the equivalent native flags on Windows as well
(for example MSVC AddressSanitizer in supported versions).

Use sanitizer output to answer:

- which access was invalid
- which allocation/free site owned the memory
- whether UB happened before the visible crash

### 5. Use core dumps or crash artifacts when the bug is post-mortem

If the crash only appears outside the current shell, collect the artifact and inspect it:

```text
- preserve the crashing binary and symbols
- keep the exact build that produced the dump
- load the dump in the matching debugger
- compare the crashing frame with the last known good run
```

Do not "fix" a crash dump by guessing from the top frame alone. Trace ownership and state backwards.

### 6. Fix the root cause and harden the boundary

Typical C++ root causes:

- lifetime mismatch between owner and borrower
- invalid iterator or reference after container mutation
- double free or use-after-free
- missing synchronization around shared mutable state
- undefined behavior surfaced by a newer compiler or optimizer

After the fix:

- rerun the failing reproduction
- rerun sanitizer-enabled tests
- add a regression test where practical
- check nearby code for the same lifetime or ownership pattern

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "The debugger changes timing, so it is useless" | Timing-sensitive bugs still need debugger or sanitizer evidence. Use them to narrow the class of failure, then confirm in a normal run. |
| "Release-only crash means the optimizer is broken" | Most release-only failures are UB, data races, or lifetime bugs that debug mode accidentally masks. |
| "The stack trace is enough" | Native crashes often happen far from the real cause. Ownership history matters more than the final frame. |
| "I'll just add null checks" | Null checks do not fix dangling references, iterator invalidation, or races. |

## Red Flags

- The crash disappears when you add logging but no root cause is identified
- The only "fix" is changing optimization level
- You cannot say which object owns the failing memory
- The code mixes raw ownership, smart pointers, and borrowed references without clear boundaries
- No regression test or sanitizer rerun happened after the fix

## Verification

- [ ] A reproducible failing command or test exists
- [ ] A debug-symbol build was used during diagnosis
- [ ] Debugger or sanitizer output identifies the real failure class
- [ ] The final fix addresses ownership, bounds, synchronization, or UB at the source
- [ ] The targeted reproduction and relevant tests pass after the fix

## Tips

- Prefer smaller reproductions: isolate the failing target or test before debugging the whole system
- If the stack is noisy, break on the first thrown exception, failed assertion, or allocator error
- Compare debug and release compile flags when behavior diverges
- If the bug looks build-related after all, hand off to `fix-build-errors`

## See Also

- [`systematic-debugging`](../systematic-debugging/SKILL.md) — root-cause method before tool-specific work
- [`fix-build-errors`](../fix-build-errors/SKILL.md) — compile, link, and configuration failures
- [`tdd-workflow`](../tdd-workflow/SKILL.md) — add regression tests after the runtime bug is fixed
