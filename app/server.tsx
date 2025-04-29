/// <reference types="vinxi/types/server" />
import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import h from "../lib/JSX"; // Explicitly import your JSX factory
import Stone from "../lib/Stone";
import HomePage from "./pages/HomePage";
export default eventHandler({
  handler: async (event) => {
    const clientManifest = getManifest("client");

    // Find all client assets to include
    const clientAssets = await clientManifest.inputs[
      clientManifest.handler
    ].assets();

    const clientEntry =
      clientManifest.inputs[clientManifest.handler].output.path;

    return (
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
        {HomePage()}
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
  },
});
