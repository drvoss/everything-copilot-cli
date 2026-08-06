---
name: react-vitest
description: Use when adding or improving tests in a React project that uses Vitest — covers component testing with Testing Library, mocking hooks, and coverage configuration.
metadata:
  category: development
  agent_type: general-purpose
  combo: "react, vitest"
---

# React + Vitest Combo Skill

## When to Use

- Setting up Vitest in a React (Vite-based) project for the first time
- Writing component tests using React Testing Library
- Mocking context providers, hooks, or module dependencies in tests
- Configuring coverage thresholds for CI enforcement

## Workflow

### 1. Setup

```bash
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: { lines: 80, branches: 70 },
    },
  },
})
```

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom"
```

### 2. Component Test Pattern

```typescript
// src/components/Button.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./Button"

describe("Button", () => {
  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)

    await userEvent.click(screen.getByRole("button", { name: "Submit" }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### 3. Wrapping with Providers

```typescript
// src/test/utils.tsx
import { render, RenderOptions } from "@testing-library/react"
import { ReactElement } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options })
```

### 4. Mocking Modules

```typescript
// Mock a module at the top of the test file
vi.mock("@/lib/api", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Alice" }),
}))
```

### 5. Running Tests

```bash
# Watch mode (development)
pnpm vitest

# Single run + coverage (CI)
pnpm vitest run --coverage

# UI mode
pnpm vitest --ui
```

## Rules Applied

- `rules/frameworks/react.md` — component design, hooks, accessibility
- `rules/frameworks/vitest.md` — test structure, assertions, mocking, coverage
- `rules/common/testing.md` — general test principles
