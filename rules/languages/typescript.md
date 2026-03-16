# TypeScript Rules

TypeScript-specific coding guidelines. Apply alongside the common rules.

## Strict Mode & Configuration

- **Always enable strict mode** in `tsconfig.json` (`"strict": true`)
- Enable `noUncheckedIndexedAccess` for safer array/object access
- Enable `exactOptionalPropertyTypes` when practical
- Target the latest ES version your runtime supports

## Type Safety

- **Never use `any`** — use `unknown` if the type is truly unknown, then narrow it
- Prefer **interfaces** over type aliases for object shapes (they produce better error messages and are extensible)
- Use type aliases for unions, intersections, and utility types
- Use `as const` for literal types and exhaustive checks with `satisfies`

```typescript
// Good
interface UserConfig {
  name: string;
  role: "admin" | "user";
}

// Avoid
type UserConfig = any;
```

## Async Patterns

- Use **`async`/`await`** over raw `.then()` chains
- Always handle promise rejections with try/catch
- Use `Promise.all()` for independent concurrent operations
- Avoid mixing callbacks and promises in the same module

## Enums & Constants

- Prefer **`as const` objects** or string literal unions over enums
- If using enums, prefer string enums over numeric enums for readability
- Export constants from a dedicated file for shared values

## Null & Undefined

- Use **strict null checks** — handle `null`/`undefined` explicitly
- Prefer `undefined` over `null` for consistency (unless interfacing with APIs that use `null`)
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of manual checks
- Avoid non-null assertions (`!`) — narrow the type instead

## Validation & Parsing

- Use **Zod, Valibot, or similar** for runtime validation of external data (API inputs, env vars, configs)
- Validate at the boundary; trust validated types inside the application
- Derive TypeScript types from schemas: `type User = z.infer<typeof UserSchema>`

## React (if applicable)

- Use proper **error boundaries** for graceful failure handling
- Prefer function components with hooks over class components
- Type component props with interfaces; export them for reuse
- Use `React.FC` sparingly — prefer explicit return types

## Module & Import Patterns

- Use **ES module** syntax (`import`/`export`), not CommonJS (`require`)
- Use barrel files (`index.ts`) sparingly — they can cause circular dependencies
- Prefer named exports over default exports for better refactoring support
- Keep import paths relative within a package; use path aliases for cross-package

## Tooling

- Use **ESLint** with `@typescript-eslint` for linting
- Use **Prettier** for formatting — don't argue about style
- Run `tsc --noEmit` in CI to catch type errors without building
- Use `ts-expect-error` over `ts-ignore` for suppressing known issues
