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

- [x] **Page Routing**

  - Server-side routing with no client-side navigation
  - Route parameters and dynamic routes
  - Nested routes and layouts
  - Leveraging Vinxi for auto-generating file-based routes

- [x] **Async Component Loading**

  - On-demand loading to reduce bundle size

- [x] **Streamlined Component Creation**

  - Less boilerplate for defining components
  - Simplified API for common patterns
  - Auto-registration of components

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

### Router Configuration

The order and configuration of routers in `app.config.js` is critical:

```js
{
  name: "client",
  type: "client",
  handler: "./app/client.js",
  base: "/_build",
  target: "browser",
  plugins: () => [tailwindcss(), stoneAutoRegistry({
    componentsDir: "app/components",
    output: "app/stone.generated.ts",
  })],
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
window.__STONE__ = {
  componentsToRegister: ${JSON.stringify(componentsToRegister)}
};
```

## Progressive Enhancement with Custom Elements

Unlike traditional frameworks that use hydration to "reconnect" server-rendered HTML to a virtual DOM:

- Our custom elements work with the Light DOM (not Shadow DOM).
- On the server, only the components actually rendered for a page are registered for enhancement.
- On the client, a small registry (auto-generated at build time) enables **on-demand, per-page loading** of only the components actually used in the SSR HTML.
- This means:
  - **No global hydration**: Only the components present in the SSR output are enhanced.
  - **No manual registry maintenance**: The Vite plugin scans your components and generates the registry automatically.
  - **Tree-shakable and efficient**: Only the code for components used on a page is loaded.

### How It Works

1. **Component Usage**

   - Use your components in pages as before:

     ```typescript
     import Card from "../../components/Card";
     import MiniCounter from "../../components/MiniCounter";
     ...
     ${Card({ title: "Demo" }, MiniCounter())}
     ```

2. **Automatic Registration**

   - When a component is rendered on the server, it is automatically marked for enhancement.
   - The server passes a list of used component names to the client via `window.__STONE__`.

3. **Auto-Generated Registry**

   - A Vite plugin scans your components directory and generates a registry mapping component names (e.g. `s-card`, `mini-counter`) to dynamic import functions.
   - Example (auto-generated):

     ```typescript
     // app/stone.generated.ts
     export const stoneComponentRegistry = {
       "s-card": () => import("./components/Card"),
       "mini-counter": () => import("./components/MiniCounter"),
       ...
     } as const;
     ```

4. **Progressive Enhancement**
   - On the client, only the components present in the SSR HTML are dynamically imported and enhanced.
   - No hydration of unused components, no global registry bloat.

### Example: Client Enhancement

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

## References

- [Vinxi Documentation](https://vinxi.vercel.app/)
- [Vinxi Examples](https://github.com/nksaraf/vinxi/tree/main/examples)
- [Web Components - MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Nitro Documentation](https://nitro.unjs.io/)

## Acknowledgments

Special thanks to [Robin Löffel](https://github.com/robinloeffel) for the [sgnls](https://github.com/robinloeffel/sgnls) library that powers our reactive state management.

# Stone Throw Framework

A lightweight web component framework focused on server-side rendering and progressive enhancement.

## Key Features

- Server-side rendered custom elements
- Progressive enhancement as a core principle
- Lightweight client-side hydration
- File-based routing

## File-Based Routing

Stone Throw includes a folder-based routing system powered by Vinxi:

### How It Works

Pages are automatically mapped from URL paths to folder structures:

- `/` → `app/pages/Page.ts`
- `/about` → `app/pages/about/Page.ts`
- `/blog/post` → `app/pages/blog/post/Page.ts`

Each route corresponds to a `Page.ts` file within a directory matching the URL path.

### Creating Pages

1. Create a folder structure in `app/pages` that matches your URL path
2. Add a `Page.ts` file inside each folder
3. For nested routes, create nested directories

Example page component:

```typescript
import Card from "../../components/Card";

const Page = () => {
  return /*html*/ `
    <body>
      <div class="container">
        <h1>About Stone Throw</h1>
        <div class="section">
          <p>This is an about page.</p>
          ${Card({ title: "Welcome" }, "Card content here")}
        </div>
      </div>
    </body>
  `;
};

export default Page;
```

### Nested Routes

For nested routes like `/blog/post`:

1. Create the directory structure: `app/pages/blog/post/`
2. Add a `Page.ts` file inside that directory

This approach makes the routing structure intuitive and visually match the URL paths.

## Running the Framework

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Philosophy

Stone Throw shares philosophical alignment with the Enhance framework in its focus on SSR-rendered custom elements without client-side hydration, but embraces more of the React ecosystem and modern tooling like Vinxi and Tailwind.

## Core Concepts

- **Server-first rendering**: Components are rendered on the server and then enhanced on the client
- **Progressive enhancement**: Works without JavaScript, but gets better with it
- **Minimal API**: Simple, concise component definitions
- **Auto-registration**: Components register themselves when used
- **Per-instance state**: Each component instance maintains its own state

## Component API

Create components with a clean, declarative API:

```typescript
import { create } from "stone-throw/components";

// The component tag name is derived from the variable name
// Counter -> <s-counter>, MiniButton -> <mini-button>
const Counter = create("counter", {
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
- Adds an 's-' prefix if the name doesn't contain a hyphen
- Creates per-instance state for each component
- Wraps your render output with the component tag
- Registers components when they're used
- Handles client-side initialization

## Usage in Pages

Use components in your pages with template literals:

```typescript
import Counter from "./components/Counter";
import Card from "./components/Card";

export default () => /*html*/ `
  <body>
    <!-- Basic usage -->
    ${Counter({ title: "My Counter" })}

    <!-- With children -->
    ${Counter(
      { title: "Counter with Info" },
      `
      <div class="info">Counter info here</div>
      `
    )}

    <!-- Component composition -->
    ${Card({ title: "Card Title" }, Counter({ title: "Nested Counter" }))}
  </body>
`;
```

## Client Registry

Register components for client-side initialization:

```typescript
// clientRegistry.ts
import Counter from "./components/Counter";

export const clientRegistry = new Map([["counter-name", Counter.module]]);
```

## Meta Tags

The framework includes a `Meta` type and helper function for setting meta tags on pages:

_Server-Side_:

```typescript
import { setMeta } from "./lib/setMeta";

export Meta = setMeta({
  title: "My Page Title",
  metaTags: [
    { name: "description", content: "My Page Description" },
    { name: "keywords", content: "My Page Keywords" },
    ...
  ],
});
```

_Client-Side_:

# TODO: check if client-side head manipulation works correctly

Under the hood, we use [unhead](https://unhead.dev/) to set the meta tags.
