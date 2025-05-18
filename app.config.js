import { createApp } from "vinxi";
import { resolve } from "node:path";
import { PagesRouter } from "stone-throw/routing";
import tailwindcss from "@tailwindcss/vite";
import stoneAutoRegistry from "vite-plugin-stone-auto-registry";

const getPreset = () => {
  if (process.env.VERCEL === "1") {
    return {
      preset: "vercel", // https://nitro.build/deploy/providers/vercel
    };
  }
  return {};
};

// Create a shared plugin config for consistency
const stoneRegistryConfig = {
  componentsDir: "app/components",
  output: "app/stone.generated.ts", // Match the exact import path
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
      plugins: () => [tailwindcss(), stoneAutoRegistry(stoneRegistryConfig)],
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
      handler: "./app/pages-router.ts",
      plugins: () => [tailwindcss(), stoneAutoRegistry(stoneRegistryConfig)],
      // https://vinxi.vercel.app/guide/file-system-routing.html
      routes: (router, app) => {
        return new PagesRouter(
          {
            dir: resolve("./app/pages"),
            extensions: ["js", "ts"],
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
