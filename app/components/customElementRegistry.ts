// Registry to track and initialize all custom elements
type CustomElementModule = () => void;

// Client-side registry of component initializers
const registry: Map<string, CustomElementModule> = new Map();

/**
 * Register a custom element module with the registry
 * This should be called in client-side code for each component
 */
export function registerCustomElement(
  name: string,
  module: CustomElementModule
): void {
  console.log("registerCustomElement", name, module);
  registry.set(name, module);
}

/**
 * Initialize all registered custom elements on the client
 */
export function initializeCustomElements(): void {
  console.log("initializeCustomElements");
  registry.forEach((moduleInit) => {
    console.log("initializing module", moduleInit);
    moduleInit();
  });
}

/**
 * This is used on the server-side to create the SSR function
 * but the registration part will only work client-side when this module is imported
 */
export function createCustomElement(
  name: string,
  ssrRenderer: () => string,
  moduleInit: CustomElementModule
): () => string {
  // Only register if we're in a browser environment
  if (typeof window !== "undefined") {
    registerCustomElement(name, moduleInit);
  }

  // Return the SSR function
  return ssrRenderer;
}

/**
 * Alternative approach: manually register components on the client side
 */
export function registerComponents(
  components: Record<string, CustomElementModule>
): void {
  Object.entries(components).forEach(([name, moduleInit]) => {
    registerCustomElement(name, moduleInit);
  });
}
