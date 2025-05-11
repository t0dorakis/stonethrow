import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BaseFileSystemRouter } from "vinxi/fs-router";
import type { PageComponent, PageEvent } from "./types";

// Define types for Vinxi router and app objects
type RouterObject = Record<string, unknown>;
type AppObject = Record<string, unknown>;

// Find the pages directory
function getPagesDir(): string | null {
  try {
    // Get current file location
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Try various potential locations
    const potentialPaths = [
      resolve(__dirname, "..", "app", "pages"), // ../app/pages from lib
      resolve(process.cwd(), "app", "pages"), // CWD/app/pages
      "/var/task/app/pages", // Vercel standard path
      "/var/task/.output/app/pages", // Vercel with Nitro
      "/app/pages", // Root-relative path
    ];

    for (const path of potentialPaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null; // Couldn't find pages directory
  } catch (error) {
    console.error("Error detecting pages directory:", error);
    return null;
  }
}

// Detect the pages directory
const pagesDir = getPagesDir();
if (!pagesDir) {
  console.warn(
    "Could not find pages directory, routing may not work correctly"
  );
}

// The router options with detected pages dir
const routerOptions = {
  dir: pagesDir || "./app/pages", // Use found dir or default
  extensions: ["tsx", "jsx", "js", "ts"],
  ignore: ["**/_*.*"], // Ignore files/folders starting with underscore
};

console.log(`Pages directory: ${pagesDir || "Using default ./app/pages"}`);

// Define interface for route objects
interface Route {
  path: string;
  $page?: {
    src: string;
    pick: string[];
  };
  [key: string]: unknown;
}

/**
 * Stone Throw implementation of Vinxi's file system router
 * Takes advantage of Vinxi's built-in routing capabilities
 */
class StoneRouter extends BaseFileSystemRouter {
  private routeCache = new Map<string, PageComponent>();
  options: typeof routerOptions;

  constructor(
    options: typeof routerOptions,
    router: RouterObject,
    app: AppObject
  ) {
    super(options, router, app);
    this.options = options;
  }

  /**
   * Convert file path to route path
   * Example: /app/pages/about/Page.tsx -> /about
   */
  toPath(filePath: string): string {
    // Remove file extension and Page suffix
    let path = filePath.replace(/\.(tsx|jsx|js|ts)$/, "");

    // Extract the part after the pages directory
    const pagesPath = this.options.dir;
    if (path.startsWith(pagesPath)) {
      path = path.substring(pagesPath.length);
    }

    // Special case for root Page
    if (path.endsWith("/Page") || path.endsWith("\\Page")) {
      path = path.slice(0, -5); // Remove "/Page"
      return path === "" ? "/" : path;
    }

    return "/";
  }

  /**
   * Convert file path to route configuration
   */
  toRoute(filePath: string): Route {
    return {
      path: this.toPath(filePath),
      $page: {
        src: filePath,
        pick: ["default"],
      },
    };
  }

  /**
   * Load a component for a route path
   */
  async loadComponent(urlPath: string): Promise<PageComponent | null> {
    try {
      // Use cache if available
      if (this.routeCache.has(urlPath)) {
        return this.routeCache.get(urlPath);
      }

      // Get the routes from Vinxi's router
      const routes: Route[] = await this.getRoutes();

      // Find matching route
      const route = routes.find((r) => r.path === urlPath);
      if (!route) {
        console.warn(`No route found for path: ${urlPath}`);
        return null;
      }

      // Get the page module information
      const pageInfo = route.$page;
      if (!pageInfo) {
        console.warn(`Route has no $page property: ${urlPath}`);
        return null;
      }

      // Load the component using relative path
      let relativePath: string;
      if (pageInfo.src.startsWith("/")) {
        // Convert absolute path to relative path for importing
        const pathAfterPages = pageInfo.src.substring(this.options.dir.length);
        relativePath = `../app/pages${pathAfterPages}`;
      } else {
        relativePath = pageInfo.src;
      }

      console.log(
        `Loading page for path: ${urlPath}, using import: ${relativePath}`
      );

      // Import the component
      const module = await import(/* @vite-ignore */ relativePath);
      const component = module[pageInfo.pick[0]];

      // Cache the result
      this.routeCache.set(urlPath, component);

      return component;
    } catch (error) {
      console.error(`Error loading component for path ${urlPath}:`, error);
      return null;
    }
  }
}

// Create empty router and app objects for BaseFileSystemRouter
const emptyRouter: RouterObject = {};
const emptyApp: AppObject = {};

// Create router instance
const router = new StoneRouter(routerOptions, emptyRouter, emptyApp);

/**
 * Loads a page component based on the URL path.
 *
 * Examples:
 * - "/" -> "/app/pages/Page.tsx"
 * - "/about" -> "/app/pages/about/Page.tsx"
 * - "/blog/post" -> "/app/pages/blog/post/Page.tsx"
 */
export async function loadPageComponent(event: PageEvent) {
  const path = event.path || "/";
  return router.loadComponent(path);
}
