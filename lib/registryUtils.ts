/**
 * @context: client-side
 * @description: get the registry from the window object
 */
const _getHandedOverRegistry = (): string[] | undefined => {
  // get the registry from the window object
  if (typeof window !== "undefined") {
    return window?.__STONE__?.componentsToRegister;
  }
};

/**
 * @context: client-side
 * @description: initialize all registered custom elements
 */
export function initializeCustomElements(
  clientRegistry: Map<string, () => void>
): void {
  const serverRegistry = _getHandedOverRegistry(); // this is an array of component names

  console.log("initializeCustomElements");
  if (serverRegistry) {
    for (const componentName of serverRegistry) {
      const moduleInit = clientRegistry.get(componentName);
      if (moduleInit) {
        console.log("initializing module", componentName);
        moduleInit();
      } else {
        console.warn(`Module not found for component: ${componentName}`);
      }
    }
  }
}

/**
 * @context: server-side
 * @description: registry of component initializers
 */
export const componentsToRegister: Set<string> = new Set();

/**
 * @context: server-side
 * @description: mark the component for registration
 */
export const markComponentForRegistration = (name: string): void => {
  componentsToRegister.add(name);
};

/**
 * @context: server-side
 * @description: get the components to register
 */
export const getComponentsToRegister = (): string[] => {
  return Array.from(componentsToRegister);
};
