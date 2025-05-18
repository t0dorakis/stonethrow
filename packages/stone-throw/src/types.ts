import type { SignalType } from "./sgnls";

// TODO: import this from vinxi / H3, somehow the build is failing
export interface PageEvent {
  node: {
    req: any;
    res: {
      statusCode: number;
    };
  };
  context: Record<string, any>;
  path: string;
}
export type PageComponent = (event: PageEvent) => string;

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
    state: Record<string, SignalType<unknown>>,
    props?: Props,
    children?: string
  ) => string;

  // Client-side handlers with state parameter
  init?: ElementHandler;
  cleanup?: ElementHandler;
};

// Type for a renderable child
export type Child = string | number | boolean | null | undefined;
