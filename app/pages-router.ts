import { eventHandler } from "vinxi/http";
import routes from "vinxi/routes";
import type { PageEvent } from "../lib/types";
import { logger } from "../lib/logging";
import { renderPage } from "../lib/pageRenderer";
import { handleError } from "../lib/errorHandler";
import { Meta } from "../lib/setMeta";

const log = logger.withTag("pages-router");

// Add this type
type PageComponentWithMeta = ((event: PageEvent) => string) & { Meta?: any };

// Define a type for the route structure based on Vinxi's routes
interface RouteModule {
  path: string;
  $page?: {
    import: () => Promise<{
      default: PageComponentWithMeta;
      Meta?: Meta;
    }>;
  };
}

export default eventHandler({
  handler: async (event: PageEvent) => {
    try {
      log.info("Handling request for path:", event.path);

      // Find matching route
      const matchedRoute = routes.find((r) => r.path === event.path) as
        | RouteModule
        | undefined;

      // Handle missing routes with 404
      if (!matchedRoute || !matchedRoute.$page?.import) {
        logger.warn(`No valid route found for path: ${event.path}`);
        return handleError(event, 404);
      }

      // Import the full module including named exports
      const pageModule = await matchedRoute.$page.import();

      if (!pageModule.default) {
        logger.error(
          `Component default export not found for path: ${event.path}`
        );
        return handleError(event, 404);
      }

      // Attach Meta to the default export function
      const PageComponent = pageModule.default;
      PageComponent.Meta = pageModule.Meta;

      // Render the page with the enhanced PageComponent
      return await renderPage(PageComponent, event);
    } catch (error) {
      logger.error("Fatal router error:", error);
      return handleError(event, 500, error);
    }
  },
});
