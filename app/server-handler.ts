// TODO: this file should probably be abstracted away from the app and moved to the stone-throw package

import { eventHandler } from "vinxi/http";
import routes from "vinxi/routes";
import { logger } from "stone-throw/utils";
import { renderPage } from "stone-throw/rendering";
import type { PageEvent, RouteModule } from "stone-throw/routing";
import { handleError } from "stone-throw/rendering";
const log = logger.withTag("pages-router");

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
        return handleError(event, 404, undefined);
      }

      // Import the full module including named exports
      const pageModule = await matchedRoute.$page.import();

      if (!pageModule.default) {
        logger.error(
          `Component default export not found for path: ${event.path}`
        );
        return handleError(event, 404, undefined);
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
