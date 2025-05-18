import { logger } from "../utils/logging";

const log = logger.withTag("registryUtils");

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
 * @description: asynchronously initialize all registered custom elements by loading the modules
 */
export async function initializeCustomElements(
  stoneComponentRegistry: Record<
    string,
    () => Promise<{ default: { module: () => void } }>
  >
): Promise<void> {
  const serverRegistry = _getHandedOverRegistry(); // this is an array of component names
  log.info("initializeCustomElements", serverRegistry);
  if (serverRegistry) {
    for (const name of serverRegistry) {
      const loader =
        stoneComponentRegistry[name as keyof typeof stoneComponentRegistry];
      if (loader) {
        const mod = await loader();
        if (mod.default && mod.default.module) {
          mod.default.module();
        }
      } else {
        log.warn(`No client module found for component: ${name}`);
      }
    }
  }
}

// Example: dynamically load and register only needed components
export async function loadAndRegisterNeededComponents(
  componentNames: string[]
) {
  log.info("loadAndRegisterNeededComponents", componentNames);
  for (const name of componentNames) {
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
