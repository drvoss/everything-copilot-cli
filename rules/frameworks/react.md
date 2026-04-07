# React Rules

Best practices for writing maintainable React applications.

## Component Design

- Prefer **small, single-purpose components** — if a component exceeds ~150 lines, split it
- Use **function components** exclusively — avoid class components in new code
- Co-locate component files with their styles and tests in the same directory
- Export one primary component per file; use named exports for utilities

## Hooks

- Follow the **Rules of Hooks**: only call hooks at the top level and in React functions
- Extract reusable logic into custom hooks (`use` prefix) rather than copying code
- Keep `useEffect` dependencies accurate — use `eslint-plugin-react-hooks` to enforce this
- Prefer `useReducer` over multiple related `useState` calls for complex state

## State Management

- Start with local state (`useState`) and lift only when necessary
- Use React Context for low-frequency global state (theme, auth); avoid it for high-frequency updates
- Introduce a state library (Zustand, Jotai) only when Context performance becomes a real issue

## Performance

- Memoize expensive computations with `useMemo`; wrap stable callbacks with `useCallback`
- Only memoize when profiling shows a real bottleneck — premature memoization adds complexity
- Use `React.lazy` + `Suspense` for route-level code splitting
- Avoid anonymous functions and objects in JSX props of heavily re-rendered components

## Accessibility

- Every interactive element must be keyboard-accessible and have an accessible label
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`) instead of `<div>` with event handlers
- Test with a screen reader periodically; run `axe` or `eslint-plugin-jsx-a11y`

## Key & List Rendering

- Never use array index as `key` in dynamic lists — use stable unique IDs
- Keep key values stable across re-renders to preserve component state
