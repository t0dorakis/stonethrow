import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";
import FrameWorkPlugin from "./framework.plugin.ts";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "client",
      type: "client",
      handler: "./app/client.js",
      base: "/_build", // This ensures client assets are served from /_build
      plugins: () => [FrameWorkPlugin()],
    },
    {
      name: "ssr",
      type: "http",
      // base: "/",
      plugins: () => [FrameWorkPlugin()],
      handler: "./app/server.tsx",
    },
    // serverFunctions.router({
    //   middleware: "./app/middleware.tsx",
    // }),
  ],
});
