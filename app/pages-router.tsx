import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import { loadPageComponent } from "../lib/page-loader";
import Stone from "../lib/Stone";
import h from "../lib/JSX";
import NotFoundPage from "./pages/404";
import type { PageEvent } from "../lib/types";
import { routerLogger as logger } from "../lib/logging";

export default eventHandler({
  handler: async (event: PageEvent) => {
    logger.info("Handling request for path:", event.path);
    logger.debug("Request headers:", event.node.req.headers);
    logger.debug("NODE_ENV:", process.env.NODE_ENV);
    logger.debug("VERCEL:", process.env.VERCEL);

    try {
      // Check for invalid paths immediately to prevent waste of resources
      const validPathPattern = /^\/([a-zA-Z0-9_-]+\/?)*$/;
      if (event.path !== "/" && !validPathPattern.test(event.path)) {
        logger.warn("Invalid path format:", event.path);
        return NotFoundPage(event);
      }

      logger.info("Getting client manifest");
      const clientManifest = getManifest("client");

      if (!clientManifest) {
        logger.warn("Client manifest not found");
        return NotFoundPage(event);
      }

      logger.debug("Client manifest found:", clientManifest);

      if (
        !clientManifest.inputs ||
        !clientManifest.handler ||
        !clientManifest.inputs[clientManifest.handler]
      ) {
        logger.warn("Client manifest missing inputs or handler");
        return NotFoundPage(event);
      }

      const clientAssets = await clientManifest.inputs[
        clientManifest.handler
      ].assets();
      const clientEntry =
        clientManifest.inputs[clientManifest.handler].output.path;

      logger.debug("Client assets count:", clientAssets.length);
      logger.debug("Client entry:", clientEntry);

      logger.info("Loading page component for path:", event.path);
      // Load the correct page component based on the path
      const PageComponent = await loadPageComponent(event);

      // Return 404 if page not found
      if (!PageComponent) {
        logger.warn(
          "No page component found for path:",
          event.path,
          "returning 404"
        );

        return NotFoundPage(event);
      }

      logger.info("Rendering page component for path:", event.path);
      // Render the page with the appropriate layout

      try {
        const pageOutput = (
          <html lang="en">
            <head>
              <title>Stone Throw</title>
              <meta
                name="description"
                content="A simple framework for building web components with
                server-side rendering"
              />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              {/* Include all client assets (CSS, preloads, etc.) */}
              {clientAssets.map((asset) => {
                // bang the style directly into the head
                if (asset.tag === "style") {
                  return <style>{asset.children}</style>;
                }

                if (asset.tag === "link" && asset.attrs?.href) {
                  return <link key={asset.attrs.href} {...asset.attrs} />;
                }
                return null;
              })}

              <script type="module" src={clientEntry} defer />
            </head>
            {/* Render the page component */}
            {PageComponent(event)}
            {/* Hand the serverside registry keys over to the client */}
            <script type="module">
              {`
                  window.FRAMEWORK = {
                    componentsToRegister: ${JSON.stringify(
                      Stone.getComponentsToRegister()
                    )}
                  };
                `}
            </script>
          </html>
        );

        logger.success("Successfully rendered page");
        return pageOutput;
      } catch (renderError) {
        logger.error("Error rendering page:", renderError);
        return NotFoundPage(event);
      }
    } catch (error) {
      logger.error("Fatal error in router:", error);
      return NotFoundPage(event);
    }
  },
});
