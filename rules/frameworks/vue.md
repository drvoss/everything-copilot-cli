# Vue Rules

Best practices for writing maintainable Vue 3 applications.

## Component Design

- Use the **Composition API** with `<script setup>` for new components — avoid the Options
  API except when maintaining legacy code
- Prefer **small, single-purpose components** — extract a child component once a template
  exceeds ~150 lines or mixes unrelated concerns
- Co-locate a component's script, template, and scoped styles in a single `.vue` file
  unless the script grows large enough to warrant a separate composable

## Composition API

- Extract reusable reactive logic into **composables** (`use*` prefix) instead of mixins
- Keep composables side-effect-aware: clean up subscriptions/timers in `onUnmounted`
- Prefer `computed` over methods for derived state — methods recompute on every render call,
  `computed` caches until a dependency changes
- Destructure props with `toRefs` (or `defineProps` + individual `computed`) to keep
  reactivity when passing prop values into composables

## Reactivity

- Use `ref` for primitives and `reactive` for objects; avoid mixing both for the same value
- Never destructure a `reactive` object directly — it breaks reactivity; use `toRefs` first
- Prefer `computed` for values derived from state; use `watch`/`watchEffect` only for side
  effects (fetching data, syncing external systems), not for deriving new state
- Use `shallowRef`/`shallowReactive` for large objects or third-party class instances where
  deep reactivity is unnecessary overhead

## State Management

- Start with local component state (`ref`/`reactive`) and lift only when multiple
  components genuinely need to share it
- Use **Pinia** for cross-component/global state — it is the official replacement for Vuex
  and integrates natively with the Composition API and devtools
- Keep Pinia stores focused by domain (one store per bounded concept); avoid one giant store
- Access store state through `storeToRefs()` in components to preserve reactivity when
  destructuring

## Routing (Vue Router)

- Use route-level code splitting (`component: () => import('./View.vue')`) for every
  non-trivial route
- Guard routes with `beforeEnter` (route-scoped) or global `router.beforeEach` (cross-cutting
  concerns like auth) — do not duplicate the same guard logic in each view
- Keep route params typed and validated; do not trust `route.params` without parsing

## Testing

- Use `@vue/test-utils` with Vitest (see `rules/frameworks/vitest.md`) for component tests
- Test component behavior through rendered output and emitted events, not internal state
- With `@vue/test-utils`, query by `data-testid` (`wrapper.find('[data-testid="..."]')`)
  rather than CSS classes, which are style-coupled and break on refactors
- For accessible-role queries (`getByRole`, `getByLabelText`), use `@testing-library/vue`
  instead of `@vue/test-utils` — the two are complementary, not interchangeable
- Mock composables and store instances at the boundary rather than mocking Vue internals

## Performance

- Use `v-memo` only after profiling shows a real re-render bottleneck in a large list
- Prefer `v-show` for elements toggled frequently; use `v-if` for elements rarely shown or
  expensive to render
- Always provide a stable, unique `:key` in `v-for` — never use the array index when the
  list can reorder or filter

## Accessibility

- Use semantic HTML elements and ARIA attributes consistently across components
- Ensure every interactive custom component forwards `tabindex`, keyboard handlers, and
  accessible labels — Vue does not add these automatically for custom elements
