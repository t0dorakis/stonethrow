# ADR-0001: Reactive DOM Updates with Hook-Based Approach

## Status

**✅ IMPLEMENTED** (January 2025)

## Context

Stone Throw components require manual DOM updates when state changes:

```typescript
init: (element, state) => {
  button?.addEventListener("click", () => {
    state.count.update((n: unknown) => (n as number) + 1);
    if (display) display.textContent = String(state.count.get()); // Manual update
  });
}
```

This creates boilerplate and is error-prone. We need automatic DOM updates while maintaining SSR compatibility and the framework's lightweight philosophy.

## Decision

Implemented a React-style `useRerender` hook using:

1. **unctx** for context management
2. **Signal effects** for change detection  
3. **Post-rerender callbacks** for event listener reattachment
4. **Component-scoped contexts** to prevent interference

## Implementation

### Core Hook

```typescript
export function useRerender(deps: Signal<unknown>[], postRerenderCallback?: () => void): void {
  const context = useRerenderContext();
  
  if (postRerenderCallback) {
    context.postRerenderCallback = postRerenderCallback;
  }

  for (const signal of deps) {
    signal.effect(() => rerenderComponent(context));
    context.effectCleanups.add(() => signal.stop());
  }
}
```

### Usage Examples

**Simple (most common):**

```typescript
init: (element, state) => {
  useRerender([state.count]); // Automatic DOM updates
  
  button?.addEventListener("click", () => {
    state.count.update(n => (n as number) + 1);
  });
}
```

**With event listener reattachment:**

```typescript
init: (element, state) => {
  const attachListeners = () => {
    const button = element.querySelector("button");
    button?.addEventListener("click", () => {
      state.count.update(n => (n as number) + 1);
    });
  };

  useRerender([state.count], attachListeners);
  attachListeners(); // Initial setup
}
```

## Key Innovation: Post-Rerender Callbacks

**Problem**: `innerHTML` updates destroy DOM elements and their event listeners.

**Solution**: Optional callback runs after each rerender to reattach listeners.

## Lessons Learned

1. **Server Import Issue**: Accidentally bundled server dependencies (fast-glob) in client. Fixed with proper export paths.
2. **Single Rerender Bug**: Initial implementation only worked once due to destroyed event listeners. Solved with callback pattern.
3. **Context Complexity**: Manual context management was error-prone. Upgraded to unctx for robustness.

## Testing & Validation

E2E tests with Playwright validate:

- Server-side rendering works correctly
- Multiple clicks properly update DOM (0→1→2→3)
- Event listeners persist across rerenders

## Trade-offs

**✅ Benefits:**

- Familiar React-style API
- Automatic DOM updates reduce boilerplate
- Explicit dependency control
- Full TypeScript support

**⚠️ Costs:**

- innerHTML replacement vs surgical updates
- Learning curve for callback pattern
- Requires unctx dependency

## Future Evolution: Automatic Dependency Tracking

Inspired by [Ryan Solid's minimal reactive system](https://github.com/ryansolid/dom-expressions), we could evolve toward automatic dependency tracking:

```typescript
// Current: Explicit dependencies
useRerender([state.count, state.user]);

// Future: Auto-tracking  
useAutoRerender(() => {
  // Automatically tracks any signals accessed
  display.innerHTML = `${state.count.get()} - ${state.user.get()}`;
});
```

**Benefits**: Zero boilerplate, impossible to forget dependencies, perfect performance.

**Implementation**: Global observer pattern where signals auto-subscribe during effect execution.

**Assessment**: Natural evolution that maintains Stone Throw's lightweight philosophy while eliminating dependency bugs.

## Migration Guide

**Before:**

```typescript
state.count.update(n => (n as number) + 1);
if (display) display.textContent = String(state.count.get());
```

**After:**

```typescript
useRerender([state.count]);
state.count.update(n => (n as number) + 1); // DOM updates automatically
```

## Dependencies

- Added `unctx: ^2.4.1` for context management

## Conclusion

Successfully implemented React-style hooks that reduce boilerplate while maintaining Stone Throw's SSR-first, lightweight approach. The `useRerender` hook provides familiar API with automatic DOM updates and proper cleanup.
