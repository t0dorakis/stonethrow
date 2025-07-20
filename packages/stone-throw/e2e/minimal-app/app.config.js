import { createApp } from "vinxi";
import stoneAutoRegistry from "vite-plugin-stone-auto-registry";

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
      handler: "./client.ts",
      plugins: () => [
        stoneAutoRegistry({
          componentsDir: "components",
          output: "stone.generated.ts", // Match the exact import path
        }),
      ],
      build: {
        target: "browser",
        outDir: "./.vinxi/build/client",
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
      base: "/_build",
      target: "browser",
    },
    {
      name: "server",
      type: "http",
      target: "server",
      handler: "./server.ts",
    },
  ],
});
