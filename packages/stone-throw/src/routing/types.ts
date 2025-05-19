import type { Meta } from "../head/types";

export type PageComponent = (event: PageEvent) => string;

export interface PageEvent {
  node: {
    req: unknown;
    res: {
      statusCode: number;
    };
  };
  context: Record<string, unknown>;
  path: string;
}

export type PageComponentWithMeta = PageComponent & { Meta?: Meta };

// Define a type for the route structure based on Vinxi's routes
export interface RouteModule {
  path: string;
  $page?: {
    import: () => Promise<{
      default: PageComponentWithMeta;
      Meta?: Meta;
    }>;
  };
  $error?: {
    import: () => Promise<{
      default: PageComponentWithMeta;
      Meta?: Meta;
    }>;
    statusCode: number;
  };
}
