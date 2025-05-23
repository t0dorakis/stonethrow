import type { PageEvent } from "../types";
import { logger } from "../utils/logging";
import { renderPage, templateHtml } from "./pageRenderer";
import type { RouteModule } from "../routing/types";
import routes from "vinxi/routes";

/**
 * Handle an error by rendering an error page or using a fallback handler.
 * @param event - The page event object.
 * @param statusCode - The HTTP status code to set on the response.
 * @param error - The error object to render.
 * @param fallbackHandler - A fallback handler to use if no error page is found.
 */
export async function handleError(
  event: PageEvent,
  statusCode = 500,
  error?: Error
): Promise<string> {
  // Set the status code on the event response
  event.node.res.statusCode = statusCode;

  // Find error page based on status code
  const errorRoute = routes.find((r) => r.path === `/${statusCode}`) as
    | RouteModule
    | undefined;

  try {
    // If we have a matching error page route, use it
    if (errorRoute?.$error?.import) {
      const errorModule = await errorRoute.$error.import();
      return await renderPage(errorModule.default, event);
    }

    // Last resort: simple error message
    return fallbackErrorPage(statusCode);
  } catch (fallbackError) {
    logger.error("Error while rendering error page:", fallbackError);
    return fallbackErrorPage(statusCode);
  }
}

const fallbackErrorPage = (statusCode: number) =>
  templateHtml(/*html*/ `
    <body>
      <h1> ${statusCode}</h1>
      <p>Something went wrong</p>
    </body>
  `);
