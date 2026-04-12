---
name: performance-optimization
description: Use when performance is a real concern — measure first, isolate the bottleneck, and prove the improvement instead of guessing
metadata:
  category: development
  agent_type: general-purpose
  origin: ported and adapted from addyosmani/agent-skills
---

# Performance Optimization

Do not optimize by instinct. Start with measurement, change one thing at a time, and confirm the
result with the same metric you used at the beginning.

## When to Use

- A user or monitoring system reports a slow page, endpoint, query, or job
- A new feature needs a performance baseline before release
- You suspect a regression and need evidence before changing code
- A hot path is doing real work at scale and latency or throughput matters

## When NOT to Use

| Instead of performance-optimization | Use |
|------------------------------------|-----|
| Obvious correctness bug | `systematic-debugging` |
| General frontend inspection without a clear perf question | `browser-devtools` |
| Micro-tuning without user impact | leave it alone |
| "Feels slow" with no measurement plan | define a measurable target first |

## Workflow

### 1. Define the metric that matters

Pick the metric before touching code:

- **Web UI**: LCP, INP, CLS, bundle size, render time
- **API**: p50 / p95 / p99 latency, throughput, error rate
- **Database**: query duration, rows scanned, lock wait time
- **Background jobs**: wall-clock duration, queue time, memory growth

Write the target in one line:

```text
Goal: reduce p95 /search latency from 850ms to under 400ms.
```

### 2. Capture a baseline

Measure the current state using the closest native tool:

```powershell
# Node.js CPU profiling
node --prof server.js

# Frontend runtime inspection
# Use browser devtools / Lighthouse and record the before numbers

# Database query analysis
# EXPLAIN ANALYZE <query>
```

Keep the baseline numbers in the task notes, PR, or issue.

### 3. Find the dominant bottleneck

Look for the one thing consuming most of the time:

- Repeated expensive work
- N+1 queries or redundant network calls
- Heavy rendering or oversized bundles
- Serialization / parsing cost
- Synchronous work on the critical path

Use the 80/20 rule: fix the dominant bottleneck before touching minor inefficiencies.

### 4. Form one optimization hypothesis

```text
Hypothesis: caching the normalized search filters will reduce repeated query-building work and cut p95 latency by ~30%.
Test: add the cache, rerun the same benchmark, compare p95 latency.
Rollback: remove the cache if latency does not improve or invalidation gets messy.
```

One hypothesis, one change, one measurement.

### 5. Re-measure with the same test

After each change:

1. Re-run the same benchmark or profiling flow
2. Compare against the original baseline
3. Keep or revert based on evidence

If performance improves but correctness or maintainability regresses sharply, it is not a win.

### 6. Document the result

Record:

- Baseline metric
- Final metric
- What changed
- Why the change helped
- Any tradeoff introduced (memory, complexity, cache invalidation, eventual consistency)

## Practical Targets

| Area | Healthy target |
|------|----------------|
| LCP | <= 2.5s |
| INP | <= 200ms |
| CLS | <= 0.1 |
| API p95 latency | Fits product SLO; usually far below 1s for interactive endpoints |
| Slow DB query | Moves from table scan / many-row scan toward indexed, explainable execution |

## Optimization Order

1. Remove unnecessary work
2. Fix algorithmic complexity
3. Eliminate duplication or N+1 patterns
4. Parallelize or pipeline safe independent work
5. Cache with explicit invalidation rules
6. Leave micro-optimizations for last

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Optimizing before measuring | Record a baseline first |
| Changing five things at once | Make one testable change at a time |
| Chasing average latency only | Track tail latency (`p95` / `p99`) too |
| Adding a cache without invalidation strategy | Define freshness, eviction, and rollback before shipping |
| Keeping a "faster" change that hurts readability for no user-visible gain | Revert it |

## Verification

- [ ] Baseline metric was recorded before optimization
- [ ] The dominant bottleneck was identified with data, not intuition
- [ ] Each optimization had a written hypothesis
- [ ] Final measurement used the same method as the baseline
- [ ] Performance improved without breaking correctness

## See Also

- [`browser-devtools`](../../testing/browser-devtools/SKILL.md) — inspect runtime behavior in the browser
- [`systematic-debugging`](../systematic-debugging/SKILL.md) — root-cause workflow for non-performance bugs
- [`test-coverage`](../../testing/test-coverage/SKILL.md) — protect the optimized path with regression tests
