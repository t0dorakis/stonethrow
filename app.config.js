import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";
import { BaseFileSystemRouter } from "vinxi/fs-router";
import { resolve, join } from "node:path";
import FrameWorkPlugin from "./framework.plugin.ts";

// Define our file system routing strategy
class PagesRouter extends BaseFileSystemRouter {
  constructor(options, router, app) {
    super(options, router, app);
    this.options = options; // Store options explicitly
  }

  toPath(filePath) {
    // Extract the route path from the file path
    // Example: /app/pages/about/Page.tsx -> /about

    // Remove extension
    let path = filePath.replace(/\.(tsx|jsx|js|ts)$/, "");

    // Extract the part after pages directory
    const pagesDir = this.options.dir;
    if (path.startsWith(pagesDir)) {
      path = path.substring(pagesDir.length);
    }

    // Handle Page suffix
    if (path.endsWith("/Page") || path.endsWith("\\Page")) {
      path = path.slice(0, -5); // Remove "/Page"
    }

    // Normalize path separators and ensure leading slash
    path = path.replace(/\\/g, "/");
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    // Special case for root path
    return path === "/Page" ? "/" : path;
  }

  toRoute(filePath) {
    return {
      path: this.toPath(filePath),
      $page: {
        src: filePath,
        pick: ["default"],
      },
    };
  }
}

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
      routes: (router, app) => {
        return new PagesRouter(
          {
            dir: resolve("./app/pages"),
            extensions: ["tsx", "jsx", "js", "ts"],
            ignore: ["**/_*.*"], // Ignore files/folders starting with underscore
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
