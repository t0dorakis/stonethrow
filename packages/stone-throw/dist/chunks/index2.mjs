import { g as getComponentsToRegister } from './registryUtils.mjs';
import { getManifest } from 'vinxi/manifest';
import { l as logger } from './logging.mjs';
import { transformHtmlTemplate, createHead } from 'unhead/server';

async function loadClientAssets() {
  try {
    const clientManifest = getManifest("client");
    if (!clientManifest?.inputs || !clientManifest.handler) {
      logger.warn("Client manifest is incomplete");
      return {
        clientAssets: [],
        clientEntry: "/_build/client.js"
      };
    }
    const clientEntry = clientManifest.inputs[clientManifest.handler]?.output?.path || "/_build/client.js";
    const clientAssets = await clientManifest.inputs[clientManifest.handler].assets();
    logger.verbose("Client assets loaded:", clientAssets.length);
    return { clientAssets, clientEntry };
  } catch (error) {
    logger.error("Failed to load client assets:", error);
    return {
      clientAssets: [],
      clientEntry: "/_build/client.js"
    };
  }
}

async function getHead(metaSate) {
  const { clientAssets, clientEntry } = await loadClientAssets();
  const { title, metaTags } = metaSate || {
    title: "Stone Throw",
    metaTags: [
      {
        name: "description",
        content: "Stone Throw is a web framework for building web applications with TypeScript and Tailwind CSS."
      }
    ]
  };
  const links = clientAssets.filter((asset) => asset.tag === "link" && asset.attrs?.href).map((asset) => ({
    rel: asset.attrs?.rel,
    href: asset.attrs?.href,
    type: asset.attrs?.type
  }));
  const styles = clientAssets.filter((asset) => asset.tag === "style" && asset.children).map((asset) => {
    if (asset.children) {
      return asset.children;
    }
  });
  const head = createHead({
    init: [
      {
        htmlAttrs: {
          lang: "en"
        }
      },
      {
        title,
        meta: [
          { charset: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          ...metaTags || []
        ],
        link: links,
        script: [
          {
            src: clientEntry,
            type: "module",
            defer: true
          }
        ],
        style: styles
      }
    ]
  });
  return head;
}
function renderFrameworkScript() {
  return `
    <script type="module">
        window.__STONE__ = {
          componentsToRegister: ${JSON.stringify(getComponentsToRegister())}
        };
    <\/script>
  `;
}
const _templateHtml = (...parts) => {
  return `
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
async function renderPage(PageComponent, event) {
  try {
    let metaValue = void 0;
    if ("Meta" in PageComponent && PageComponent.Meta) {
      const maybeMeta = PageComponent.Meta;
      if (typeof maybeMeta === "object" && maybeMeta !== null) {
        metaValue = maybeMeta;
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
async function renderErrorWithComponent(event, ErrorComponent, statusCode = 404) {
  try {
    event.node.res.statusCode = statusCode;
    const head = await getHead({
      title: `Error ${statusCode}`
    });
    if (!ErrorComponent)
      throw new Error("ErrorComponent is required");
    const template = _templateHtml(ErrorComponent(event));
    return transformHtmlTemplate(head, template);
  } catch (error) {
    logger.error("Failed to render custom error page:", error);
    return fallbackErrorPage(error);
  }
}
function fallbackErrorPage(error) {
  let errorContent = "Unknown error";
  try {
    if (error instanceof Error) {
      errorContent = `${error.name}: ${error.message}`;
    } else if (error) {
      errorContent = JSON.stringify(error, null, 2);
    }
  } catch {
    errorContent = "Error cannot be displayed";
  }
  return _templateHtml(`
    <div class="fallback-error">
      <h1>Error</h1>
      <pre>${errorContent}</pre>
    </div>`);
}

async function loadErrorPage(statusCode, importFunction) {
  try {
    if (importFunction) {
      try {
        const module = await importFunction(statusCode);
        return module.default;
      } catch (e) {
        logger.info(
          `No custom ${statusCode} page found, will use default error page`
        );
        return null;
      }
    }
    return null;
  } catch (error) {
    logger.warn(`Failed to load error page for status ${statusCode}:`, error);
    return null;
  }
}
async function handleError(event, statusCode, error, importFunction) {
  event.node.res.statusCode = statusCode;
  try {
    const errorPage = await loadErrorPage(statusCode, importFunction);
    return await renderErrorWithComponent(event, errorPage, statusCode);
  } catch (fallbackError) {
    logger.error("Error in error handler:", fallbackError);
    return fallbackErrorPage(error);
  }
}

const index = {
  __proto__: null,
  renderPage: renderPage,
  renderErrorWithComponent: renderErrorWithComponent,
  fallbackErrorPage: fallbackErrorPage,
  handleError: handleError,
  loadErrorPage: loadErrorPage
};

export { renderErrorWithComponent as a, fallbackErrorPage as f, handleError as h, index as i, loadErrorPage as l, renderPage as r };
