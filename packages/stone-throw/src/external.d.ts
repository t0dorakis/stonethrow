declare module "stone-throw" {
  export interface StoneComponent {
    name: string;
    template: string;
  }

  // Add the Stone export
  export const Stone: {
    init: (componentRegistry: Record<string, any>) => void;
    getComponentsToRegister: () => Record<string, any>;
  };
}

declare module "stone-throw/utils" {
  export const logger: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    withTag: (tag: string) => {
      info: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      error: (...args: any[]) => void;
    };
  };

  export interface Meta {
    title?: string;
    metaTags?: Array<Record<string, string>>;
  }

  export const setMeta: (meta: Meta) => Meta;
  export const signal: <T>(initialValue: T) => any;
}

declare module "stone-throw/rendering" {
  import { PageEvent } from "stone-throw/types";

  export const renderPage: (
    PageComponent: (event: PageEvent) => string & { Meta?: any },
    event: PageEvent
  ) => Promise<string>;

  export const handleError: (
    event: PageEvent,
    statusCode: number,
    error?: unknown,
    importFunction?: (code: number) => Promise<any>
  ) => Promise<string>;
}

declare module "stone-throw/types" {
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
}

declare module "stone-throw/routing" {
  export class PagesRouter {
    constructor(
      options: {
        dir: string;
        extensions: string[];
        ignore: string[];
      },
      router: unknown,
      app: unknown
    );
  }
}
