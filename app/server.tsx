/// <reference types="vinxi/types/server" />
import { defineWebSocket, eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import h from "../lib/JSX"; // Explicitly import your JSX factory
import homePage from "./pages/home";
import Stone from "../lib/Stone";

export default eventHandler({
  handler: async (event) => {
    const clientManifest = getManifest("client");

    // Find all client assets to include
    const assets = await clientManifest.inputs[clientManifest.handler].assets();

    // In development mode, we need to find the correct client entry
    const isDev = process.env.NODE_ENV !== "production";
    const clientEntry = isDev
      ? clientManifest.inputs[clientManifest.handler].output.path
      : clientManifest.handler;

    console.log("Client entry path:", clientEntry);

    event.node.res.setHeader("Content-Type", "text/html");

    // for now this needs to be called before the registry is set to the window
    const page = homePage();

    return (
      <html lang="en">
        <head>
          <title>Web Component SSR</title>
          {/* Include all client assets (CSS, preloads, etc.) */}
          {/* TODO: is this really needed? */}
          {assets.map((asset) => {
            if (asset.tag === "script" && asset.attrs?.src) {
              return <script key={asset.attrs.src} {...asset.attrs}></script>;
            }
            if (asset.tag === "link" && asset.attrs?.href) {
              return <link key={asset.attrs.href} {...asset.attrs}></link>;
            }
            return null;
          })}

          {/* Directly include your client entry in development mode */}
          {isDev && <script type="module" src={clientEntry} defer></script>}

          <link rel="stylesheet" href="/app/style.css"></link>

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
        </head>
        {page}
      </html>
    );
  },
});
