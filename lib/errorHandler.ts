import type { PageEvent } from "./types";
import { logger } from "./logging";
import { renderErrorWithComponent, fallbackErrorPage } from "./pageRenderer";

/**
 * Attempt to import a custom error page component
 * Falls back gracefully if the page doesn't exist
 */
export async function loadErrorPage(
  statusCode: number
): Promise<((event: PageEvent) => string) | null> {
  try {
    // Try to dynamically import the error page based on status code
    if (statusCode === 404) {
      // Import the 404 page dynamically
      const module = await import("../app/pages/404");
      return module.default;
    }

    if (statusCode === 500) {
      // Try to import a custom 500 page if it exists
      try {
        // Use dynamic import with a specific path that TypeScript won't complain about
        const modulePath = `../app/pages/${statusCode}`;
        const module = await import(/* @vite-ignore */ modulePath);
        return module.default;
      } catch (e) {
        logger.info("No custom 500 page found, will use default error page");
        return null;
      }
    }

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
 * @returns Rendered HTML string
 */
export async function handleError(
  event: PageEvent,
  statusCode: number,
  error?: unknown
) {
  event.node.res.statusCode = statusCode;

  try {
    // Try to load a custom error page for this status code
    const errorPage = await loadErrorPage(statusCode);
    // If we have a custom error page, use it
    return await renderErrorWithComponent(event, errorPage, statusCode);
  } catch (fallbackError) {
    // If even our error handling fails, return the simplest possible error page
    logger.error("Error in error handler:", fallbackError);
    return fallbackErrorPage(error);
  }
}
