'use strict';

const registryUtils = require('./registryUtils.cjs');
const manifest = require('vinxi/manifest');
const logging = require('./logging.cjs');
const server = require('unhead/server');
const routes = require('vinxi/routes');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

const routes__default = /*#__PURE__*/_interopDefaultLegacy(routes);

async function loadClientAssets() {
  try {
    const clientManifest = manifest.getManifest("client");
    if (!clientManifest?.inputs || !clientManifest.handler) {
      logging.logger.warn("Client manifest is incomplete");
      return {
        clientAssets: [],
        clientEntry: "/_build/client.js"
      };
    }
    const clientEntry = clientManifest.inputs[clientManifest.handler]?.output?.path || "/_build/client.js";
    const clientAssets = await clientManifest.inputs[clientManifest.handler].assets();
    logging.logger.verbose("Client assets loaded:", clientAssets.length);
    return { clientAssets, clientEntry };
  } catch (error) {
    logging.logger.error("Failed to load client assets:", error);
    return {
      clientAssets: [],
      clientEntry: "/_build/client.js"
    };
  }
}

async function handleError(event, statusCode = 500, error) {
  event.node.res.statusCode = statusCode;
  const errorRoute = routes__default.find((r) => r.path === `/${statusCode}`);
  try {
    if (errorRoute?.$error?.import) {
      const errorModule = await errorRoute.$error.import();
      return await renderPage(errorModule.default, event);
    }
    return fallbackErrorPage(statusCode);
  } catch (fallbackError) {
    logging.logger.error("Error while rendering error page:", fallbackError);
    return fallbackErrorPage(statusCode);
  }
}
const fallbackErrorPage = (statusCode) => templateHtml(`
    <body>
      <h1> ${statusCode}</h1>
      <p>Something went wrong</p>
    </body>
  `);

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
  const head = server.createHead({
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
          componentsToRegister: ${JSON.stringify(registryUtils.getComponentsToRegister())}
        };
    <\/script>
  `;
}
const templateHtml = (...parts) => {
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
    const template = templateHtml(page, renderFrameworkScript());
    return await server.transformHtmlTemplate(head, template);
  } catch (error) {
    logging.logger.error("Error in renderPage:", error);
    return handleError(event, 500);
  }
}

const index = {
  __proto__: null,
  renderPage: renderPage,
  handleError: handleError
};

exports.handleError = handleError;
exports.index = index;
exports.renderPage = renderPage;
