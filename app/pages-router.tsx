import { eventHandler } from "vinxi/http";
import routes from "vinxi/routes";
import type { PageEvent } from "../lib/types";
import { routerLogger as logger } from "../lib/logging";
import { renderPage } from "../lib/page-renderer";
import { handleError } from "../lib/error-handler";

// Define a type for the route structure based on Vinxi's routes
interface RouteModule {
  path: string;
  $page?: {
    import: () => Promise<{ default: (event: PageEvent) => string }>;
  };
}

export default eventHandler({
  handler: async (event: PageEvent) => {
    try {
      logger.info("Handling request for path:", event.path);

      // Find matching route
      const matchedRoute = routes.find((r) => r.path === event.path) as
        | RouteModule
        | undefined;

      // Handle missing routes with 404
      if (!matchedRoute || !matchedRoute.$page?.import) {
        logger.warn(`No valid route found for path: ${event.path}`);
        return handleError(event, 404);
      }

      // Import and render the page component
      const pageModule = await matchedRoute.$page.import();

      if (!pageModule.default) {
        logger.error(
          `Component default export not found for path: ${event.path}`
        );
        return handleError(event, 404);
      }

      // Render the page
      return await renderPage(pageModule.default, event);
    } catch (error) {
      logger.error("Fatal router error:", error);
      return handleError(event, 500, error);
    }
  },
});
