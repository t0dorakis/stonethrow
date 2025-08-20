import type { SignalType } from "../state/sgnls";

export interface ComponentWithInternalProps {
  (props?: Props, children?: unknown): string;
  module: () => void;
  state: Record<string, SignalType<unknown>>;
  _$$name?: string;
  componentName?: string;
  ssr: (props?: Props, children?: unknown) => string;
}

export type Props = Record<string, unknown>;

export type ElementHandler = (
  element: HTMLElement,
  state: Record<string, SignalType<unknown>>
) => void;

export type StateFactory = () => Record<string, unknown>;

export type EventHandler = (
  event: Event,
  element: HTMLElement,
  state: Record<string, SignalType<unknown>>
) => void;

// Helper type that provides event-specific handler references for templates
export type HandlerRefs<T extends Record<string, EventHandler>> = {
  [K in keyof T]: Record<string, string>;
};

export type ComponentOptions = {
  // Optional explicit name (otherwise derived from assignment)
  name?: string;

  // Component state factory to create fresh state for each instance
  state?: StateFactory | Record<string, unknown>;

  /**
   * Server-side render function
   * @param state - The state of the component
   * @param props - The props of the component
   * @param children - The children of the component
   * @returns The HTML string of the component
   */
  server: (
    state: Record<string, SignalType<unknown>>,
    props: Props | undefined,
    children: string | undefined
  ) => string;

  /**
   * Client-side initialization - like connectedCallback in web components
   * @param element - The component's DOM element
   * @param state - The component's reactive state
   * @returns Optional cleanup function (called when component is removed)
   */
  client?: (
    element: HTMLElement,
    state: Record<string, SignalType<unknown>>
  ) => (() => void) | undefined;
};

// Type for a renderable child
export type Child = string | number | boolean | null | undefined;
