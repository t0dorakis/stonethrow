import { useRerenderContext } from "./useRerender";
import type { Signal } from "../state/sgnls";

type EventHandler = (event: Event) => void;

/**
 * Provides explicit control over DOM reactivity with automatic event persistence
 * Solves the event listener reattachment problem with a clean API
 * Now supports React-like handler binding from data attributes
 */
export function useReactiveDom(handlers?: Record<string, EventHandler>) {
  const context = useRerenderContext();

  if (!context) {
    throw new Error(
      "useReactiveDom must be called within a component init function"
    );
  }

  const eventHandlers = new Map<string, EventHandler>();

  // Store handlers from the handlers object if provided
  if (handlers) {
    for (const [name, handler] of Object.entries(handlers)) {
      eventHandlers.set(`[data-onclick="${name}"]`, handler);
    }
  }

  // Return a rerender function for explicit control
  const rerender = () => {
    const { currentElement, renderFunction, stateSignals } = context;

    const newHTML = renderFunction(stateSignals, undefined, undefined);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newHTML;
    const componentElement = tempDiv.firstElementChild;

    if (componentElement) {
      currentElement.innerHTML = componentElement.innerHTML;

      // Reattach all stored event handlers (including from onClick)
      for (const [selector, handler] of eventHandlers) {
        const element = currentElement.querySelector(selector);
        if (element) {
          element.addEventListener("click", handler);
        }
      }
    }
  };

  // Helper to add event handlers that survive rerenders
  const onClick = (selector: string, handler: EventHandler) => {
    eventHandlers.set(selector, handler);

    // Attach immediately
    const element = context.currentElement.querySelector(selector);
    if (element) {
      element.addEventListener("click", handler);
    }
  };

  // Initial binding of handlers from data attributes
  if (handlers) {
    for (const [name, handler] of Object.entries(handlers)) {
      const selector = `[data-onclick="${name}"]`;
      const element = context.currentElement.querySelector(selector);
      if (element) {
        element.addEventListener("click", handler);
      }
    }
  }

  // Return both the rerender function and helpers
  return {
    rerender,
    onClick,

    // Helper to watch specific signals and rerender when they change
    watch: (signals: Signal<unknown>[]) => {
      for (const signal of signals) {
        signal.effect(() => {
          rerender();
        });
        context.effectCleanups.add(() => signal.stop());
      }
    },
  };
}
