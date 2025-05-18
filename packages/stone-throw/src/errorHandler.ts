import type { PageEvent } from "./types";
import { logger } from "./logging";
import { renderErrorWithComponent, fallbackErrorPage } from "./pageRenderer";

/**
 * Creates a flexible error handler that can use custom error pages
 */
export async function loadErrorPage(
  statusCode: number,
  importFunction?: (code: number) => Promise<any>
): Promise<((event: PageEvent) => string) | null> {
  try {
    // If an import function is provided, use it to try to dynamically import the error page
    if (importFunction) {
      try {
        const module = await importFunction(statusCode);
        return module.default;
      } catch (e) {
        logger.info(
          `No custom ${statusCode} page found, will use default error page`
        );
        return null;
      }
    }

    // No import function provided, return null
    return null;
  } catch (error) {
    logger.warn(`Failed to load error page for status ${statusCode}:`, error);
    return null;
  }
}

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
export async function handleError(
  event: PageEvent,
  statusCode: number,
  error?: unknown,
  importFunction?: (code: number) => Promise<any>
) {
  event.node.res.statusCode = statusCode;

  try {
    // Try to load a custom error page for this status code
    const errorPage = await loadErrorPage(statusCode, importFunction);
    // If we have a custom error page, use it
    return await renderErrorWithComponent(event, errorPage, statusCode);
  } catch (fallbackError) {
    // If even our error handling fails, return the simplest possible error page
    logger.error("Error in error handler:", fallbackError);
    return fallbackErrorPage(error);
  }
}
