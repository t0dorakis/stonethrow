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
  const mappedAssets = clientAssets
    .filter((asset) => asset.tag === "style" && asset.children)
    .map(
      (asset) => /*html*/ `
      <style>
        ${asset.children}
      </style>
    `
    );

  const mappedLinks = clientAssets
    .filter((asset) => asset.tag === "link" && asset.attrs?.href)
    .map(
      (asset) => /*html*/ `
      <link href="${asset.attrs.href}" ${
        asset.attrs.rel ? `rel="${asset.attrs.rel}"` : ""
      } ${asset.attrs.type ? `type="${asset.attrs.type}"` : ""} />
    `
    );

  return /*html*/ `
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      ${mappedAssets}
      ${mappedLinks}
      <script type="module" src=${clientEntry} defer ></script>
    </head>
  `;
}

/**
 * Render the framework initialization script
 * @returns Rendered script element
 */
function renderFrameworkScript() {
  return /*html*/ `
    <script type="module">
        window.FRAMEWORK = {
          componentsToRegister: ${JSON.stringify(
            Stone.getComponentsToRegister()
          )}
        };
    </script>
  `;
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
    return /*html*/ `
      <html lang="en">
        ${renderHead(clientAssets, clientEntry)}
        ${PageComponent(event)}
        ${renderFrameworkScript()}
      </html>
    `;
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

    return /*html*/ `
      <html lang="en">
        ${renderHead(clientAssets, clientEntry, title)}
        ${ErrorComponent(event)}
        ${renderFrameworkScript()}
      </html>
    `;
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
  return /*html*/ `
    <html lang="en">
      <body>
        <h1>Error</h1>
        <pre>${JSON.stringify(error, null, 2)}</pre>
      </body>
    </html>
  `;
}
