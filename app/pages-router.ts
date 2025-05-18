// TODO: this file should probably be abstracted away from the app and moved to the stone-throw package

import { eventHandler } from "vinxi/http";
import routes from "vinxi/routes";
// Use package imports
import { logger } from "stone-throw/utils";
import { renderPage, handleError } from "stone-throw/rendering";
import type { PageEvent, PageComponent } from "stone-throw/types";
import type { Meta } from "stone-throw/utils";

const log = logger.withTag("pages-router");

// Add this type
type PageComponentWithMeta = PageComponent & { Meta?: Meta };

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

// Function to import error pages
const importErrorPage = async (statusCode: number) => {
  try {
    if (statusCode === 404) {
      return import("./pages/404");
    }
    if (statusCode === 500) {
      return import("./pages/500");
    }
    return null;
  } catch (e) {
    console.error(`Error importing ${statusCode} page:`, e);
    return null;
  }
};

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
        return handleError(event, 404, undefined, importErrorPage);
      }

      // Import the full module including named exports
      const pageModule = await matchedRoute.$page.import();

      if (!pageModule.default) {
        logger.error(
          `Component default export not found for path: ${event.path}`
        );
        return handleError(event, 404, undefined, importErrorPage);
      }

      // Attach Meta to the default export function
      const PageComponent = pageModule.default;
      PageComponent.Meta = pageModule.Meta;

      // Render the page with the enhanced PageComponent
      return await renderPage(PageComponent, event);
    } catch (error) {
      logger.error("Fatal router error:", error);
      return handleError(event, 500, error, importErrorPage);
    }
  },
});
