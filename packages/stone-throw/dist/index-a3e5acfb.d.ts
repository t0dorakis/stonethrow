import { P as PageEvent, a as PageComponent } from './types-3e69760b.js';
import { M as Meta } from './setMeta-cd8a9e9c.js';

/**
 * Render a complete HTML page with client assets and registry
 * @param PageComponent The component to render in the page
 * @param event The page event
 * @returns Rendered HTML string
 */
declare function renderPage(PageComponent: (event: PageEvent) => string & {
    Meta?: Meta;
}, event: PageEvent): Promise<string>;
/**
 * Render a page with a custom error component
 * @param event The page event
 * @param ErrorComponent The error component to render, or null to use default error
 * @param statusCode HTTP status code (defaults to 404)
 * @returns Rendered HTML string
 */
declare function renderErrorWithComponent(event: PageEvent, ErrorComponent: ((event: PageEvent) => string) | null, statusCode?: number): Promise<string>;
/**
 * Render a simple fallback error page when custom error pages fail
 */
declare function fallbackErrorPage(error: unknown): string;

/**
 * Creates a flexible error handler that can use custom error pages
 */
declare function loadErrorPage(statusCode: number, importFunction?: (code: number) => Promise<any>): Promise<((event: PageEvent) => string) | null>;
/**
 * Handle errors by showing appropriate error pages
 * Tries to use custom error pages when available
 *
 * @param event The page event
 * @param statusCode HTTP status code
 * @param error Optional error object
 * @param importFunction Optional function to import custom error pages
 * @returns Rendered HTML string
 */
declare function handleError(event: PageEvent, statusCode: number, error?: unknown, importFunction?: (code: number) => Promise<any>): Promise<string>;

declare const index_renderPage: typeof renderPage;
declare const index_renderErrorWithComponent: typeof renderErrorWithComponent;
declare const index_fallbackErrorPage: typeof fallbackErrorPage;
declare const index_handleError: typeof handleError;
declare const index_loadErrorPage: typeof loadErrorPage;
declare const index_PageComponent: typeof PageComponent;
declare const index_Meta: typeof Meta;
declare namespace index {
  export {
    index_renderPage as renderPage,
    index_renderErrorWithComponent as renderErrorWithComponent,
    index_fallbackErrorPage as fallbackErrorPage,
    index_handleError as handleError,
    index_loadErrorPage as loadErrorPage,
    index_PageComponent as PageComponent,
    index_Meta as Meta,
  };
}

export { renderErrorWithComponent as a, fallbackErrorPage as f, handleError as h, index as i, loadErrorPage as l, renderPage as r };
