// Server-side registry of component initializers
export const componentsToRegister: Set<string> = new Set();

/**
 * Register a custom element module with the registry
 * This is used on the server-side to mark the component for registration
 */
export function markComponentForRegistration(name: string): void {
  console.log("markComponentForRegistration", name);
  componentsToRegister.add(name);
  console.log("componentsToRegister", componentsToRegister);
}

/**
 * This is used on the server-side to create a rendered component
 */
export function createCustomElement(
  name: string,
  ssrComponent: () => string
): string {
  markComponentForRegistration(name);
  return ssrComponent();
}
