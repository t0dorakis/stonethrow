import h from "./JSX";
import Stone from "./Stone";
import type { PageEvent } from "./types";
import { loadClientAssets } from "./client-assets";
import type { ClientAsset } from "./client-assets";
import { logger } from "./logging";

/**
 * Render the document head with meta tags, title, and client assets
 * @param clientAssets Array of client assets to include in head
 * @param clientEntry Path to the client entry script
 * @param title Page title
 * @returns Rendered head element
 */
function renderHead(
  clientAssets: ClientAsset[],
  clientEntry: string,
  title = "Stone Throw"
) {
  return (
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>

      {/* Include all client assets (CSS, preloads, etc.) */}
      {clientAssets.map((asset) => {
        // Add styles directly into the head
        if (asset.tag === "style") {
          return <style>{asset.children}</style>;
        }

        // Add links (CSS, preloads, etc.)
        if (asset.tag === "link" && asset.attrs?.href) {
          return <link key={asset.attrs.href} {...asset.attrs} />;
        }

        return null;
      })}

      <script type="module" src={clientEntry} defer />
    </head>
  );
}

/**
 * Render the framework initialization script
 * @returns Rendered script element
 */
function renderFrameworkScript() {
  return (
    <script type="module">
      {`
        window.FRAMEWORK = {
          componentsToRegister: ${JSON.stringify(
            Stone.getComponentsToRegister()
          )}
        };
      `}
    </script>
  );
}

/**
 * Render a complete HTML page with client assets and registry
 * @param PageComponent The component to render in the page
 * @param event The page event
 * @returns Rendered HTML string
 */
export async function renderPage(
  PageComponent: (event: PageEvent) => string,
  event: PageEvent
) {
  try {
    // Load client assets
    const { clientAssets, clientEntry } = await loadClientAssets();

    // Render the page with client assets and registry
    return (
      <html lang="en">
        {renderHead(clientAssets, clientEntry)}
        {/* Render the page component */}
        {PageComponent(event)}
        {/* Hand the serverside registry keys over to the client */}
        {renderFrameworkScript()}
      </html>
    );
  } catch (error) {
    logger.error("Error in renderPage:", error);
    return fallbackErrorPage(error);
  }
}

/**
 * Render a page with a custom error component
 * @param event The page event
 * @param ErrorComponent The error component to render
 * @param statusCode HTTP status code (defaults to 404)
 * @returns Rendered HTML string
 */
export async function renderErrorWithComponent(
  event: PageEvent,
  ErrorComponent: (event: PageEvent) => string,
  statusCode = 404
) {
  try {
    // Set status code on the response
    event.node.res.statusCode = statusCode;

    // Load client assets (to include stylesheets, etc.)
    const { clientAssets, clientEntry } = await loadClientAssets();

    // Create a title based on the status code
    const title =
      statusCode === 404
        ? "Not Found - Stone Throw"
        : `Error ${statusCode} - Stone Throw`;

    return (
      <html lang="en">
        {renderHead(clientAssets, clientEntry, title)}
        {/* Use the error component directly */}
        {ErrorComponent(event)}
        {/* Include framework initialization for components to work */}
        {renderFrameworkScript()}
      </html>
    );
  } catch (error) {
    logger.error("Failed to render custom error page:", error);
    // Fall back to basic error page
    return fallbackErrorPage(error);
  }
}

/**
 * Render a simple fallback error page when custom error pages fail
 */
export function fallbackErrorPage(error: unknown | Error) {
  return (
    <html lang="en">
      <body>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </body>
    </html>
  );
}
