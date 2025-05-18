import { getComponentsToRegister } from "./registryUtils";
import type { PageEvent } from "./types";
import { loadClientAssets } from "./clientAssets";
import { logger } from "./logging";
import { createHead, transformHtmlTemplate } from "unhead/server";
import { type Meta } from "./setMeta";
/**
 * Render the document head with meta tags, title, and client assets
 * @param clientAssets Array of client assets to include in head
 * @param clientEntry Path to the client entry script
 * @param title Page title
 * @returns Rendered head element
 */
async function getHead(metaSate?: Meta) {
  const { clientAssets, clientEntry } = await loadClientAssets();

  const { title, metaTags } = metaSate || {
    title: "Stone Throw",
    metaTags: [
      {
        name: "description",
        content:
          "Stone Throw is a web framework for building web applications with TypeScript and Tailwind CSS.",
      },
    ],
  };

  // TODO: Somehow these links are only added in production. Figure out why.
  const links = clientAssets
    .filter((asset) => asset.tag === "link" && asset.attrs?.href)
    .map((asset) => ({
      rel: asset.attrs?.rel,
      href: asset.attrs?.href,
      type: asset.attrs?.type,
    }));

  // TODO: these appear only in development. Figure out why.
  const styles = clientAssets
    .filter((asset) => asset.tag === "style" && asset.children)
    .map((asset) => {
      if (asset.children) {
        return asset.children;
      }
    });

  const head = createHead({
    init: [
      {
        htmlAttrs: {
          lang: "en",
        },
      },
      {
        title,
        meta: [
          { charset: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          ...(metaTags || []),
        ],
        link: links,
        script: [
          {
            src: clientEntry,
            type: "module",
            defer: true,
          },
        ],
        style: styles,
      },
    ],
  });
  return head;
}

/**
 * Render the framework initialization script
 * @returns Rendered script element
 */
function renderFrameworkScript() {
  return /*html*/ `
    <script type="module">
        window.__STONE__ = {
          componentsToRegister: ${JSON.stringify(getComponentsToRegister())}
        };
    </script>
  `;
}

/**
 *
 * @param parts Takes a list of strings and and combines them to the HTML Page with a head
 */
const _templateHtml = (...parts: string[]) => {
  return /*html*/ `
    <!DOCTYPE html>
    <html>
      <head>
        <!--head-tags-->
      </head>
      <body>
        ${parts.join("\n")}
      </body>
    </html>
  `;
};

/**
 * Render a complete HTML page with client assets and registry
 * @param PageComponent The component to render in the page
 * @param event The page event
 * @returns Rendered HTML string
 */
export async function renderPage(
  PageComponent: (event: PageEvent) => string & { Meta?: Meta },
  event: PageEvent
) {
  try {
    // Access the Meta export if it exists and validate it
    let metaValue: Meta | undefined = undefined;

    if ("Meta" in PageComponent && PageComponent.Meta) {
      // Validate it's a proper Meta object
      const maybeMeta = PageComponent.Meta;
      if (typeof maybeMeta === "object" && maybeMeta !== null) {
        // It's a valid Meta object
        metaValue = maybeMeta as Meta;
      }
    }

    const head = await getHead(metaValue);
    const page = PageComponent(event);

    const template = _templateHtml(page, renderFrameworkScript());

    return await transformHtmlTemplate(head, template);
  } catch (error) {
    logger.error("Error in renderPage:", error);
    return fallbackErrorPage(error);
  }
}

/**
 * Render a page with a custom error component
 * @param event The page event
 * @param ErrorComponent The error component to render, or null to use default error
 * @param statusCode HTTP status code (defaults to 404)
 * @returns Rendered HTML string
 */
export async function renderErrorWithComponent(
  event: PageEvent,
  ErrorComponent: ((event: PageEvent) => string) | null,
  statusCode = 404
) {
  try {
    // Set status code on the response
    event.node.res.statusCode = statusCode;

    const head = await getHead({
      title: `Error ${statusCode}`,
    });

    if (!ErrorComponent) throw new Error("ErrorComponent is required");
    const template = _templateHtml(ErrorComponent(event));

    return transformHtmlTemplate(head, template);
  } catch (error) {
    logger.error("Failed to render custom error page:", error);
    // Fall back to basic error page
    return fallbackErrorPage(error);
  }
}

/**
 * Render a simple fallback error page when custom error pages fail
 */
export function fallbackErrorPage(error: unknown): string {
  let errorContent = "Unknown error";

  try {
    if (error instanceof Error) {
      errorContent = `${error.name}: ${error.message}`;
    } else if (error) {
      errorContent = JSON.stringify(error, null, 2);
    }
  } catch {
    // If JSON.stringify fails, use a simple message
    errorContent = "Error cannot be displayed";
  }

  return _templateHtml(/*html*/ `
    <div class="fallback-error">
      <h1>Error</h1>
      <pre>${errorContent}</pre>
    </div>`);
}
