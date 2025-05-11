import { existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { H3Event } from "h3";
import { BaseFileSystemRouter } from "vinxi/fs-router";
import type { PageComponent, PageEvent } from "./types";
import { pageLoaderLogger as logger } from "./logging";
import {
  getPagesDir,
  fileExists as fsFileExists,
  getPossiblePaths as getRoutePaths,
  findPageFiles,
} from "./routing/file-system";
import {
  debugVercelPaths,
  findPageFilesRecursive,
} from "./routing/debug-paths";

// Define types for Vinxi router and app objects
type RouterObject = Record<string, unknown>;
type AppObject = Record<string, unknown>;

// Run debug paths on Vercel to help diagnose deployment issues
if (process.env.VERCEL === "1") {
  logger.info("🔍 Running Vercel path diagnostics");
  debugVercelPaths();

  // Try to find page files in known locations
  const taskDir = "/var/task";
  if (existsSync(taskDir)) {
    const pageFiles = findPageFilesRecursive(taskDir);
    if (pageFiles.length > 0) {
      logger.success(
        `✅ Found ${pageFiles.length} Page files in Vercel deployment:`
      );
      for (const path of pageFiles) {
        logger.info(`- ${path}`);
      }
    } else {
      logger.warn("❌ No Page files found in Vercel deployment");
    }
  }
}

// Detect the pages directory
const pagesDir = getPagesDir();
if (!pagesDir) {
  logger.warn("Could not find pages directory, routing may not work correctly");
}

// The router options with detected pages dir
const routerOptions = {
  dir: pagesDir || "./app/pages", // Use found dir or default
  extensions: ["tsx", "jsx", "js", "ts"],
  ignore: ["**/_*.*"], // Ignore files/folders starting with underscore
};

logger.info("Using pages directory:", pagesDir || "./app/pages");

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
    logger.info("StoneRouter initialized with options:", options);
  }

  /**
   * Convert file path to route path
   * Example: /app/pages/about/Page.tsx -> /about
   */
  toPath(filePath: string): string {
    logger.debug("toPath called with:", filePath);
    // Remove file extension
    let path = filePath.replace(/\.(tsx|jsx|js|ts)$/, "");

    // Extract the part after the pages directory
    const pagesPath = this.options.dir;
    if (path.startsWith(pagesPath)) {
      path = path.substring(pagesPath.length);
    }

    // Handle Page suffix for all paths
    if (path.endsWith("/Page") || path.endsWith("\\Page")) {
      path = path.slice(0, -5); // Remove "/Page"
    }

    // Normalize path separators and ensure leading slash
    path = path.replace(/\\/g, "/");
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    // Special case for root path
    const result = path === "/Page" ? "/" : path;
    logger.debug("toPath result:", result);
    return result;
  }

  /**
   * Convert file path to route configuration
   */
  toRoute(filePath: string): Route {
    logger.debug("toRoute called with:", filePath);
    const result = {
      path: this.toPath(filePath),
      $page: {
        src: filePath,
        pick: ["default"],
      },
    };
    logger.debug("toRoute result:", result);
    return result;
  }

  /**
   * Load a component for a route path
   * Works in both development and production environments
   */
  async loadComponent(urlPath: string): Promise<PageComponent | null> {
    try {
      // Use cache if available
      if (this.routeCache.has(urlPath)) {
        logger.debug("Route cache hit for:", urlPath);
        return this.routeCache.get(urlPath);
      }

      logger.info("Attempting to load component for path:", urlPath);

      // Check file existence before even trying to load routes
      const possiblePaths = this.getPossiblePaths(urlPath);

      logger.debug("Checking possible file paths for:", urlPath);
      for (const path of possiblePaths) {
        logger.debug(
          `  - ${path}: ${this.fileExists(path) ? "FOUND" : "NOT FOUND"}`
        );
      }

      // Normalize the current path to match our routing convention
      // Different environments may use different path formats
      const normalizedPath = urlPath === "/" ? "/" : urlPath.replace(/\/$/, "");

      // Find a component path
      const componentPath = this.findComponentPath(normalizedPath);
      if (!componentPath) {
        logger.warn("No component path found for:", normalizedPath);
        return null;
      }

      logger.info("Found component path:", componentPath);

      // Check if the file exists
      const fileExists = this.fileExists(componentPath);
      logger.info(
        `Component file exists at path: ${componentPath} - ${fileExists}`
      );

      if (!fileExists) {
        logger.warn(`Component file does not exist at path: ${componentPath}`);
        logger.info(
          "This might be a path resolution issue in Vercel environment"
        );

        // If the suggested path doesn't exist, try one of our possible paths that does exist
        const existingPath = possiblePaths.find((path) =>
          this.fileExists(path)
        );
        if (existingPath) {
          logger.info(
            `Found alternative path that does exist: ${existingPath}`
          );

          try {
            logger.debug("Trying import from alternative path:", existingPath);
            const altModule = await import(/* @vite-ignore */ existingPath);
            if (altModule.default) {
              logger.success(
                "Found component via alternative path:",
                existingPath
              );
              this.routeCache.set(urlPath, altModule.default);
              return altModule.default;
            }
          } catch (e) {
            logger.error("Error importing from alternative path:", e);
          }
        }

        return null;
      }

      try {
        logger.debug("Importing component from path:", componentPath);
        const comp = await import(/* @vite-ignore */ componentPath);
        logger.debug("Import result:", comp);

        if (comp.default) {
          logger.success("Successfully loaded component for:", urlPath);
          this.routeCache.set(urlPath, comp.default);
          return comp.default;
          // biome-ignore lint/style/noUselessElse: this is more readable
        } else
          logger.warn(
            "Component does not have a default export:",
            componentPath
          );
      } catch (error) {
        logger.error("Error importing component:", error);
      }

      return null;
    } catch (error) {
      logger.error("Error loading component for path:", urlPath, error);
      return null;
    }
  }

  /**
   * Check if a file exists
   * Safely handles errors
   */
  fileExists(componentPath: string): boolean {
    try {
      return fsFileExists(componentPath);
    } catch (error) {
      logger.error("Error checking file existence:", error);
      return false;
    }
  }

  /**
   * Get all possible paths for a route
   */
  getPossiblePaths(urlPath: string): string[] {
    const extensions = this.options.extensions;
    return getRoutePaths(urlPath, this.options.dir, extensions);
  }

  /**
   * Find the path to a component from a URL path
   */
  findComponentPath(urlPath: string): string | null {
    // Get all possible paths for this route
    const possiblePaths = this.getPossiblePaths(urlPath);

    // Try each path in order
    for (const path of possiblePaths) {
      if (this.fileExists(path)) {
        return path;
      }
    }

    return null;
  }
}

/**
 * Router singleton instance
 */
const router = new StoneRouter(routerOptions, {}, {});

/**
 * Load a page component for a route path
 * This is the main public API for the page loader
 */
export async function loadPageComponent(
  event: H3Event
): Promise<PageComponent | null> {
  try {
    logger.info("loadPageComponent called for path:", event.path);
    const component = await router.loadComponent(event.path);
    return component;
  } catch (error) {
    logger.error("Error loading page component:", error);
    return null;
  }
}
