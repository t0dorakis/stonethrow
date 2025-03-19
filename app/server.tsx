/// <reference types="vinxi/types/server" />
import { defineWebSocket, eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import h from "../lib/JSX"; // Explicitly import your JSX factory
import DeclarativeButton from "./components/declarativeButton";
import CustomElementButton from "./components/customElementButton";

export default eventHandler({
  handler: async (event) => {
    const clientManifest = getManifest("client");
    const assets = await clientManifest.inputs[clientManifest.handler].assets();
    const events = {};
    const clientHandler = await clientManifest;
    event.node.res.setHeader("Content-Type", "text/html");

    return (
      <html lang="en">
        <head>
          <title>Web Component SSR</title>
          <script type="module" src="./app/client.js"></script>
          <link rel="stylesheet" href="./app/style.css"></link>
        </head>
        <body>
          <my-component>
            <h1 slot="text">Stone Throw</h1>
          </my-component>
          {DeclarativeButton(`<span>Click me</span>`)}
          {CustomElementButton()}
        </body>
      </html>
    );
  },
});
