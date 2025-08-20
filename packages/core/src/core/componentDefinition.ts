import { markComponentForRegistration } from "./registryUtils";
import { signal } from "../state/sgnls";
import type { SignalType } from "../state/sgnls";
import { createRerenderScope } from "../hooks/useRerender";
import { deepClone } from "../utils/deepClone";
import type {
  ComponentOptions,
  Props,
  ComponentWithInternalProps,
} from "../types";
import { logger } from "../utils/logging";

const log = logger.withTag("componentDefinition");
/**
 * Validate a custom element name
 * Custom element names must contain a hyphen and start with a letter
 */
function validateElementName(input: string): string {
  let result = input;

  // If name doesn't contain a hyphen, add one
  if (!result.includes("-")) {
    result = `s-${result}`;
  }

  // Ensure name starts with a letter
  if (!/^[a-z]/i.test(result)) {
    result = `s-${result}`;
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
    : options.name || "s-component";

  // Validate the element name (custom elements must contain a hyphen)
  const name = validateElementName(initialName);

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

    // Render with the simplified API
    const renderedContent = options.server(
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
      private effectCleanups: Set<() => void>;
      private clientCleanup?: () => void;

      constructor() {
        super();
        // Create a fresh state instance for each DOM element
        const instanceState =
          typeof options.state === "function"
            ? options.state()
            : options.state
            ? deepClone(options.state)
            : {};

        this.stateSignals = Object.fromEntries(
          Object.entries(instanceState).map(([key, value]) => [
            key,
            signal(value),
          ])
        );

        this.effectCleanups = new Set();
      }

      connectedCallback() {
        createRerenderScope(
          {
            currentElement: this,
            renderFunction: (
              state: Record<string, SignalType<unknown>>,
              props: Props | undefined,
              children: string | undefined
            ) => {
              return options.server(state, props, children);
            },
            stateSignals: this.stateSignals,
            effectCleanups: this.effectCleanups,
          },
          () => {
            // Call user client function and store cleanup
            if (options.client) {
              this.clientCleanup = options.client(this, this.stateSignals);
            }
          }
        );
      }

      disconnectedCallback() {
        // Clean up all effects
        for (const cleanup of this.effectCleanups) {
          cleanup();
        }
        this.effectCleanups.clear();

        if (this.clientCleanup) {
          this.clientCleanup();
        }
      }
    }

    const componentName =
      (Component as ComponentWithInternalProps)._$$name || name;

    if (!customElements.get(componentName)) {
      customElements.define(componentName, CustomElement);
    }
  };

  Component.state = globalStateSignals;

  // Server-side rendering method (alias for the main function)
  Component.ssr = (props?: Props, children?: unknown) => {
    return Component(props, children);
  };

  return Component;
}
// short alias for createComponent
export const create = createComponent;
