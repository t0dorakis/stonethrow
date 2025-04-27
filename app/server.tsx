/// <reference types="vinxi/types/server" />
import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import h from "../lib/JSX"; // Explicitly import your JSX factory
import HomePage from "./pages/HomePage";
import Stone from "../lib/Stone";

export default eventHandler({
  handler: async (event) => {
    const clientManifest = getManifest("client");

    // Find all client assets to include
    const clientAssets = await clientManifest.inputs[
      clientManifest.handler
    ].assets();

    const clientEntry =
      clientManifest.inputs[clientManifest.handler].output.path;

    event.node.res.setHeader("Content-Type", "text/html");

    // for now this needs to be called before the registry is set to the window
    const page = HomePage();

    return (
      <html lang="en">
        <head>
          <title>
            Stone Throw – A simple framework for building web components with
            server-side rendering
          </title>

          {/* Include all client assets (CSS, preloads, etc.) */}
          {clientAssets.map((asset) => {
            if (asset.tag === "link" && asset.attrs?.href) {
              return <link key={asset.attrs.href} {...asset.attrs} />;
            }
            return null;
          })}

          <script type="module" src={clientEntry} defer />

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
