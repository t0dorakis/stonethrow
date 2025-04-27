# Custom Light DOM Web Component Framework with Vinxi

This is a framework for building web applications using custom web components with server-side rendering (SSR) and progressive enhancement, powered by [Vinxi](https://github.com/nksaraf/vinxi).

## Architecture

- **Server-side rendering** of web components using JSX
- **Progressive enhancement** with light DOM custom elements (not shadow DOM)
- **Component registry** to transfer component information from server to client

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

## Production Mode

When running in production (`vinxi build` and `vinxi start`):

1. Client code is bundled, optimized, and hashed for proper caching
2. Assets are included in the production manifest
3. The setup works without the development-only script injections
4. Server automatically handles routing based on router priorities

## Development Workflow

1. Start the development server:

```bash
npx vinxi dev
```

2. The server renders components on the server side
3. The client adds interactivity through progressive enhancement

## References

- [Vinxi Documentation](https://vinxi.vercel.app/)
- [Vinxi Examples](https://github.com/nksaraf/vinxi/tree/main/examples)
- [Web Components - MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
