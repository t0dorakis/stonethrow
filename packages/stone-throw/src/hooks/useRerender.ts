import { createContext } from "unctx";
import type { Signal } from "../state/sgnls";
import type { ComponentOptions } from "../types";

interface RerenderContext {
  currentElement: HTMLElement;
  renderFunction: ComponentOptions["render"];
  stateSignals: Record<string, Signal<unknown>>;
  effectCleanups: Set<() => void>;
  postRerenderCallback?: () => void; // Function to call after rerender
}

// Create context using unctx for robust context management
const rerenderContext = createContext<RerenderContext>();

export function useRerenderContext(): RerenderContext | null {
  return rerenderContext.tryUse();
}

export function createRerenderScope<T>(
  context: RerenderContext,
  callback: () => T
): T {
  return rerenderContext.call(context, callback);
}

/**
 * Hook that rerenders the entire component when dependencies change
 * @param deps - Array of signals to watch for changes
 * @param postRerenderCallback - Optional callback to run after each rerender (for reattaching listeners)
 */
export function useRerender(
  deps: Signal<unknown>[],
  postRerenderCallback?: () => void
): void {
  const context = useRerenderContext();

  if (!context) {
    throw new Error(
      "useRerender must be called within a component init function"
    );
  }

  // Store the post-rerender callback
  if (postRerenderCallback) {
    context.postRerenderCallback = postRerenderCallback;
  }

  // Set up effects for each dependency
  for (const signal of deps) {
    signal.effect(() => {
      rerenderComponent(context);
    });

    // Store cleanup function (signals have their own cleanup via .stop())
    context.effectCleanups.add(() => signal.stop());
  }
}

/**
 * Actually rerender the component by updating its innerHTML
 */
function rerenderComponent(context: RerenderContext): void {
  const { currentElement, renderFunction, stateSignals, postRerenderCallback } =
    context;

  const newHTML = renderFunction(stateSignals);

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = newHTML;

  const componentElement = tempDiv.firstElementChild;
  if (componentElement) {
    // Update the component's innerHTML while preserving the outer tag
    currentElement.innerHTML = componentElement.innerHTML;

    // Run post-rerender callback to reattach event listeners
    if (postRerenderCallback) {
      console.log("Running post-rerender callback...");
      postRerenderCallback();
    }
  }
}
