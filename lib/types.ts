import type signal from "./sgnls";
import type { H3Event } from "h3";

export type PageEvent = H3Event;

export interface ComponentWithInternalProps {
  (props?: Props, children?: unknown): string;
  module: () => void;
  state: Record<string, ReturnType<typeof signal>>;
  _$$name?: string;
  componentName?: string;
  ssr: (props?: Props, children?: unknown) => string;
  __setComponentName: (name: string) => ComponentWithInternalProps;
}

export type Props = Record<string, unknown>;
export type ElementHandler = (
  element: HTMLElement,
  state: Record<string, ReturnType<typeof signal>>
) => void;
export type StateFactory = () => Record<string, unknown>;
export type ComponentOptions = {
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
export type Child = string | number | boolean | null | undefined;
