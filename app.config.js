import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";
import FrameWorkPlugin from "./framework.plugin.ts";

export default createApp({
  server: {
    preset: "vercel", //  https://nitro.build/deploy/providers/vercel
  },
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
      handler: "./app/client.ts",
      base: "/_build",
      target: "browser",
      plugins: () => [FrameWorkPlugin()],
      build: {
        target: "browser",
        outDir: "./.vinxi/build/client",
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    },
    {
      name: "ssr",
      type: "http",
      target: "server",
      handler: "./app/server.tsx",
      plugins: () => [FrameWorkPlugin()],
    },
    // serverFunctions.router({
    //   middleware: "./app/middleware.tsx",
    // }),
  ],
});
