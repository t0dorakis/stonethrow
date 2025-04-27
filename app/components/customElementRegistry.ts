import { clientRegistry } from "./clientRegistry";

/**
 * We are registering to our regestry on the server-side
 */

export function getHandedOverRegistry(): string[] | undefined {
  // get the registry from the window object
  if (typeof window !== "undefined") {
    return window?.FRAMEWORK?.componentsToRegister;
  }
}

/**
 * Initialize all registered custom elements on the client
 */
export function initializeCustomElements(): void {
  const serverRegistry = getHandedOverRegistry(); // this is an array of component names

  console.log("initializeCustomElements");
  serverRegistry?.forEach((componentName) => {
    const moduleInit = clientRegistry.get(componentName);
    if (moduleInit) {
      console.log("initializing module", componentName);
      moduleInit();
    } else {
      console.warn(`Module not found for component: ${componentName}`);
    }
  });
}
