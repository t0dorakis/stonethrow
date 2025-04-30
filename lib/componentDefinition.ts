import { markComponentForRegistration } from "./registryUtils";
import signal from "./sgnls";
import { kebabCase } from "scule";

type Props = Record<string, unknown>;
type ElementHandler = (
  element: HTMLElement,
  state: Record<string, ReturnType<typeof signal>>
) => void;
type StateFactory = () => Record<string, unknown>;
type ComponentOptions = {
  // Optional explicit name (otherwise derived from assignment)
  name?: string;

  // Component state factory to create fresh state for each instance
  state?: StateFactory | Record<string, unknown>;

  /**
   * Server-side render function with state parameter
   * @param state - The state of the component
   * @param props - The props of the component
   * @param children - The children of the component
   * @returns The HTML string of the component
   */
  render: (
    state: Record<string, ReturnType<typeof signal>>,
    props?: Props,
    children?: string
  ) => string;

  // Client-side handlers with state parameter
  init?: ElementHandler;
  cleanup?: ElementHandler;
};

// Type for a renderable child
type Child = string | number | boolean | null | undefined;

/**
 * Validate a custom element name
 * Custom element names must contain a hyphen and start with a letter
 */
function validateElementName(input: string): string {
  let result = input;

  // If name doesn't contain a hyphen, add one
  if (!result.includes("-")) {
    result = `x-${result}`;
  }

  // Ensure name starts with a letter
  if (!/^[a-z]/i.test(result)) {
    result = `x-${result}`;
  }

  return result;
}

/**
 * Process children for rendering
 * Handles arrays, primitives, and objects with toString methods
 */
function processChildren(children: unknown): string {
  if (children == null) {
    return "";
  }

  // If children is an array, process each item and join them
  if (Array.isArray(children)) {
    return children.map((child) => processChildren(child)).join("");
  }

  // If it's a string, return as is
  if (typeof children === "string") {
    return children;
  }

  // If it's a number, boolean, or other primitive, convert to string
  return String(children);
}

/**
 * Create a component with a clean, declarative API
 * Name will be derived from the variable it's assigned to, or can be explicitly provided.
 */
export function createComponent(
  nameOrOptions: string | ComponentOptions,
  optionsParam?: ComponentOptions
) {
  // Handle both string and options object
  const isStringName = typeof nameOrOptions === "string";

  // Extract options
  const options =
    isStringName && optionsParam
      ? optionsParam
      : (nameOrOptions as ComponentOptions);

  // Set name (will be replaced by variable name if not provided)
  const initialName = isStringName
    ? (nameOrOptions as string)
    : options.name || "x-component";

  // Validate the element name (custom elements must contain a hyphen)
  let name = validateElementName(initialName);

  // Create a global state instance for SSR
  const initialState =
    typeof options.state === "function" ? options.state() : options.state || {};

  const globalStateSignals = Object.fromEntries(
    Object.entries(initialState).map(([key, value]) => [key, signal(value)])
  );

  // Helper to wrap content with component tag if not already wrapped
  const wrapWithTag = (content: string): string => {
    const trimmed = content.trim();
    // If content already starts with the component tag, return as is
    if (trimmed.startsWith(`<${name}`)) {
      return trimmed;
    }
    // Otherwise wrap it with the component tag
    return `<${name}>${trimmed}</${name}>`;
  };

  // Create the component function - auto-registers when called
  const Component = (props?: Props, children?: unknown) => {
    // Auto-register the component when called on the server
    markComponentForRegistration(name);

    // Process children (arrays, primitives, etc.)
    const processedChildren = processChildren(children);

    // Render and automatically wrap with component tag if needed
    const renderedContent = options.render(
      globalStateSignals,
      props,
      processedChildren
    );
    return wrapWithTag(renderedContent);
  };

  // Add client-side initialization
  Component.module = () => {
    class CustomElement extends HTMLElement {
      private stateSignals: Record<string, ReturnType<typeof signal>>;

      constructor() {
        super();
        // Create a fresh state instance for each DOM element
        const instanceState =
          typeof options.state === "function"
            ? options.state()
            : options.state
            ? JSON.parse(JSON.stringify(options.state)) // Deep clone to avoid sharing
            : {};

        this.stateSignals = Object.fromEntries(
          Object.entries(instanceState).map(([key, value]) => [
            key,
            signal(value),
          ])
        );
      }

      connectedCallback() {
        if (options.init) {
          options.init(this, this.stateSignals);
        }
      }

      disconnectedCallback() {
        if (options.cleanup) {
          options.cleanup(this, this.stateSignals);
        }
      }
    }

    // Register the custom element
    if (!customElements.get(name)) {
      customElements.define(name, CustomElement);
    }
  };

  // Expose global state for SSR
  Component.state = globalStateSignals;

  // Component identifier
  Component.componentName = name;

  // Server-side rendering method (alias for the main function)
  Component.ssr = (props?: Props, children?: unknown) => {
    return Component(props, children);
  };

  // Store function to update component name during assignment
  Component.__setComponentName = (derivedName: string) => {
    name = validateElementName(kebabCase(derivedName));
    Component.componentName = name;
    return Component;
  };

  return Component;
}

/**
 * Create component proxy that captures the variable name it's assigned to
 */
export const create = new Proxy(createComponent, {
  apply(target, thisArg, args) {
    // Create the component without final name
    const comp = target.apply(thisArg, args);

    // Return a proxy that will capture the variable name during assignment
    return new Proxy(comp, {
      // This runs when the component is assigned to a variable
      set(obj, prop, value) {
        if (prop === "name" && typeof value === "string") {
          // When the name property is set during variable assignment
          obj.__setComponentName(value);
        }
        return Reflect.set(obj, prop, value);
      },
      get(target, prop, receiver) {
        // Make sure the componentName property is not optimized away in production
        if (prop === "componentName") {
          // Force access to prevent removal during minification
          console.debug("Component name accessed:", target.componentName);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  },
});
