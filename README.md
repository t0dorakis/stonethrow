[![Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/) ![Vercel Deploy](https://deploy-badge.vercel.app/vercel/stone-throw)

# Custom Light DOM Web Component Framework with Vinxi

This is a framework for building web applications using custom web components with server-side rendering (SSR) and progressive enhancement, powered by [Vinxi](https://github.com/nksaraf/vinxi).

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm run start
```

## Architecture

- **Server-side rendering** of web components using JSX
- **Progressive enhancement** with light DOM custom elements (not shadow DOM)
- **Component registry** to transfer component information from server to client

## Framework Roadmap

- [x] **Server-side Rendered Light DOM Web Components**

  - Fully functional SSR with progressive enhancement

- [x] **Component Composition**

  - Components that compose and nest within each other

- [x] **State Management with Signals**

  - Reactive state with cross-component communication

- [ ] **Page Routing**

  - Server-side routing with no client-side navigation
  - Route parameters and dynamic routes
  - Nested routes and layouts
  - Leveraging Vinxi for auto-generating file-based routes

- [ ] **Async Component Loading**

  - On-demand loading to reduce bundle size

- [ ] **Streamlined Component Creation**

  - Less boilerplate for defining components
  - Simplified API for common patterns
  - Auto-registration of components

- [ ] **Component Abstractions**

  - Higher-level patterns and reusable logic

- [ ] **Developer Experience**

  - Simplified configuration and better abstractions
  - Better error messages and debugging

- [ ] **Testing**
  - Unit and integration tests for basic functionality

## Key Learnings

### Client-Side Asset Loading

One of the most important aspects of a Vinxi application is understanding how client assets are loaded. There are several key points:

1. In Vinxi, the `client` router type processes browser code, transpiling TypeScript to JavaScript.

2. The client entry point (specified in `app.config.js`) must be properly imported from the server:

```js
const clientManifest = getManifest("client");
const assets = await clientManifest.inputs[clientManifest.handler].assets();
```

3. When the server tries to directly reference `.ts` files in paths or imports, they won't be processed by Vinxi and will cause browser errors:

```
Loading failed for the module with source "http://localhost:3000/app/clientRegistry.ts"
```

### Router Configuration

The order and configuration of routers in `app.config.js` is critical:

```js
{
  name: "client",
  type: "client",
  handler: "./app/client.js",
  base: "/_build",
  target: "browser",
  plugins: () => [FrameWorkPlugin()],
}
```

- The `base` path determines where assets are served from
- The `handler` must point to the actual client entry file
- The `target: "browser"` ensures code is processed for browser compatibility

### Router Priority

Vinxi has a built-in router priority system that handles requests in this order:

1. **Static routers** (highest priority) - for serving static files
2. **Client routers** - for serving built client assets
3. **HTTP/SSR routers** (lowest priority) - for server-side rendering

When configured correctly, this handles all routing automatically:

- Requests to `/public/...` are handled by the static router
- Requests to `/_build/...` are handled by the client router
- All other requests fall through to your SSR handler

This separation of concerns keeps your server component focused purely on rendering, not on routing decisions.

### Server Component

In the server component, we need to:

1. Properly inject client assets and the correct client script:

```js
const assets = await clientManifest.inputs[clientManifest.handler].assets();
// Map all assets to render them in the head
```

2. Transfer server-side registry data to the client:

```js
window.FRAMEWORK = {
  componentsToRegister: ${JSON.stringify(componentsToRegister)}
};
```

### Progressive Enhancement with Custom Elements

Unlike traditional frameworks that use hydration to "reconnect" server-rendered HTML to a virtual DOM:

1. Our custom elements work with the Light DOM (not Shadow DOM):

```js
constructor() {
  super();
  // Don't use shadow DOM to enable progressive enhancement
  // We'll work with the light DOM instead
}
```

2. In `connectedCallback()`, elements check if server-rendered content exists:

```js
connectedCallback() {
  // Get the button that was server-rendered or create one if it doesn't exist
  this.button = this.querySelector("button");
  if (!this.button) {
    // If no server-rendered button exists, create it
    this.button = document.createElement("button");
    // ...
  }
}
```

This approach means the components:

- Work without JavaScript
- Progressively enhance with JavaScript when available
- Don't require a full client-side hydration process

### Debugging Tips

When troubleshooting Vinxi applications:

1. Check the server logs for the assets being found and loaded
2. Use browser dev tools to see what scripts are being requested and potentially failing
3. Check the network tab to see if `.ts` files are being requested directly (they shouldn't be)
4. Make sure all imports in client code use relative paths without file extensions

## Common Issues & Solutions

### 1. TypeScript Files Requested Directly

**Problem:** Browser tries to load `.ts` files directly, resulting in errors.

**Solution:**

- Make sure import statements don't include `.ts` extensions
- Ensure the client router is correctly set up with `type: "client"`
- Check that all files are imported from the client entry point

### 2. Client Assets Not Found

**Problem:** Server responds with HTML when client assets are requested.

**Solution:**

- Make sure client router has the correct `base` path
- Properly configure router priorities in `app.config.js`
- Ensure router types and order follow Vinxi's priority system

### 3. Custom Element Registry Transfer

**Problem:** Component registry isn't available on the client.

**Solution:**

- Pass component registry from server to client using `window.FRAMEWORK`
- Use a consistent naming convention for components

## References

- [Vinxi Documentation](https://vinxi.vercel.app/)
- [Vinxi Examples](https://github.com/nksaraf/vinxi/tree/main/examples)
- [Web Components - MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## Acknowledgments

Special thanks to [Robin Löffel](https://github.com/robinloeffel) for the [sgnls](https://github.com/robinloeffel/sgnls) library that powers our reactive state management.

# Stone Framework

A lightweight progressive-enhancement framework for building server-first web applications with client-side interactivity.

## Core Concepts

- **Server-first rendering**: Components are rendered on the server and then enhanced on the client
- **Progressive enhancement**: Works without JavaScript, but gets better with it
- **Minimal API**: Simple, concise component definitions
- **Auto-registration**: Components register themselves when used
- **Per-instance state**: Each component instance maintains its own state

## Component API

Create components with a clean, declarative API:

```typescript
import { create } from "./lib/Stone";

// The component tag name is derived from the variable name
// Counter -> <x-counter>, MiniButton -> <mini-button>
const Counter = create({
  // Component state (unique for each instance)
  state: () => ({
    count: 0,
    isActive: false,
  }),

  // Server-side render function (no need to specify component tag)
  render: (state, props, children) => `
    <div class="counter">
      <div>Count: ${state.count.get()}</div>
      <button>Increment</button>
      ${children || ""}
    </div>
  `,

  // Client-side initialization with instance state
  init: (element, state) => {
    const button = element.querySelector("button");

    // React to state changes
    state.count.effect((newCount) => {
      console.log(`Count updated to: ${newCount}`);
    });

    // Update state on events
    if (button) {
      button.addEventListener("click", () => {
        state.count.update((n) => n + 1);
      });
    }
  },

  // Optional cleanup when component is removed
  cleanup: (element, state) => {
    // Clean up event listeners, subscriptions, etc.
  },
});

// For backward compatibility or explicit naming:
import { create } from "./lib/Stone";

const ExplicitComponent = create("custom-name", {
  // Component options...
});
```

### Children Support

The framework supports multiple ways to pass children to components:

```typescript
// Single component as child
Card({ title: "Single Child" }, Counter());

// Array of components
Card({ title: "Multiple Children" }, [Counter(), Counter(), Counter()]);

// Mixed content (strings and components)
Card({ title: "Mixed Content" }, [
  "<p>Text content</p>",
  Counter(),
  "<div class='separator'></div>",
  Counter(),
]);

// Dynamic list rendering
Card(
  { title: "Dynamic List" },
  items.map((item) => ItemComponent({ item }))
);

// Nested components
Card({ title: "Nested" }, [Card({ title: "Inner Card" }, Counter())]);
```

### Component Name Rules

Custom element names must follow these rules:

- Must contain a hyphen (-) character
- Must start with a letter

The framework automatically:

- Derives the component tag name from the variable name (converted to kebab-case)
- Adds an 'x-' prefix if the name doesn't contain a hyphen
- Creates per-instance state for each component
- Wraps your render output with the component tag
- Registers components when they're used
- Handles client-side initialization

## Usage in Pages

Use components in your pages:

```tsx
import h from "../lib/JSX";
import Counter from "./components/Counter";
import Card from "./components/Card";

// Components auto-register themselves when used
export default () => (
  <body>
    {/* Basic usage */}
    {Counter.ssr({ title: "My Counter" })}

    {/* With children */}
    {Counter.ssr(
      { title: "Counter with Info" },
      `
      <div class="info">Counter info here</div>
    `
    )}

    {/* Component composition */}
    {Card.ssr(
      { title: "Card Title" },
      Counter.ssr({ title: "Nested Counter" })
    )}
  </body>
);
```

## Client Registry

Register components for client-side initialization:

```typescript
// clientRegistry.ts
import Counter from "./components/Counter";

export const clientRegistry = new Map([["counter-name", Counter.module]]);
```

## Examples

See the `app/pages/CleanDemo.tsx` for examples of component usage patterns.
