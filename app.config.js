import { createApp } from "vinxi";
import { resolve } from "node:path";
import FrameWorkPlugin from "./framework.plugin.ts";
import { PagesRouter } from "./lib/fileBasedRouter.ts";

const getPreset = () => {
  if (process.env.VERCEL === "1") {
    return {
      preset: "vercel", // https://nitro.build/deploy/providers/vercel
    };
  }
  return {};
};

export default createApp({
  ...getPreset(),
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
      name: "pages",
      type: "http",
      target: "server",
      handler: "./app/pages-router.tsx",
      plugins: () => [FrameWorkPlugin()],
      // https://vinxi.vercel.app/guide/file-system-routing.html
      routes: (router, app) => {
        return new PagesRouter(
          {
            dir: resolve("./app/pages"),
            extensions: ["tsx", "jsx", "js", "ts"],
            ignore: ["**/_*.*"],
          },
          router,
          app
        );
      },
    },
    // serverFunctions.router({
    //   middleware: "./app/middleware.tsx",
    // }),
  ],
});
