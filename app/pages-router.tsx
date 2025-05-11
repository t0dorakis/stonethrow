import { eventHandler } from "vinxi/http";
import routes from "vinxi/routes";
import type { PageEvent } from "../lib/types";
import { routerLogger as logger } from "../lib/logging";
import NotFoundPage from "./pages/404";
import * as renderer from "../lib/page-renderer";

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

      if (!matchedRoute) {
        logger.warn("No matching route found for path:", event.path);
        return await renderer.renderErrorWithComponent(event, NotFoundPage);
      }

      try {
        // Get component import function
        const componentImport = matchedRoute.$page?.import;

        if (!componentImport) {
          logger.warn("Route has no import function:", event.path);
          return await renderer.renderErrorWithComponent(event, NotFoundPage);
        }

        // Import the component
        const pageModule = await componentImport();
        const PageComponent = pageModule.default;

        if (!PageComponent) {
          logger.error(
            `Component default export not found for path: ${event.path}`
          );
          return await renderer.renderErrorWithComponent(event, NotFoundPage);
        }

        // Render the page with the component, client assets, and registry
        return await renderer.renderPage(PageComponent, event);
      } catch (error) {
        logger.error("Error loading or rendering page component:", error);
        event.node.res.statusCode = 500;
        return renderer.renderErrorPage(
          `Error rendering page: ${
            error instanceof Error ? error.message : String(error)
          }`,
          500
        );
      }
    } catch (error) {
      logger.error("Fatal error in router:", error);
      event.node.res.statusCode = 500;
      return renderer.renderErrorPage(
        `Server error: ${
          error instanceof Error ? error.message : String(error)
        }`,
        500
      );
    }
  },
});
