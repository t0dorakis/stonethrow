import { BaseFileSystemRouter, FileSystemRouterConfig } from 'vinxi/fs-router';
import { P as PageEvent } from './types-3e69760b.js';

interface AppOptions {
    [key: string]: any;
}
/**
 * File System Routing
 * Example: /app/pages/about/Page.tsx -> /about
 * https://vinxi.vercel.app/guide/file-system-routing.html
 */
declare class PagesRouter extends BaseFileSystemRouter {
    protected options: FileSystemRouterConfig;
    constructor(options: FileSystemRouterConfig, router: unknown, app: AppOptions);
    toPath(filePath: string): string;
    toRoute(filePath: string): {
        path: string;
        $page: {
            src: string;
            pick: string[];
        };
    };
}

declare const index_PageEvent: typeof PageEvent;
type index_AppOptions = AppOptions;
type index_PagesRouter = PagesRouter;
declare const index_PagesRouter: typeof PagesRouter;
declare namespace index {
  export {
    index_PageEvent as PageEvent,
    index_AppOptions as AppOptions,
    index_PagesRouter as PagesRouter,
  };
}

export { AppOptions as A, PagesRouter as P, index as i };
