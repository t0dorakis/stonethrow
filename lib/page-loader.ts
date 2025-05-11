import { existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { H3Event } from "h3";
import { BaseFileSystemRouter } from "vinxi/fs-router";
import type { PageComponent, PageEvent } from "./types";
import { pageLoaderLogger as logger } from "./logging";

// Define types for Vinxi router and app objects
type RouterObject = Record<string, unknown>;
type AppObject = Record<string, unknown>;

/**
 * Find the pages directory based on the environment
 * This is crucial for both local development and Vercel deployment
 */
function getPagesDir(): string | null {
  try {
    // Get current file location
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    logger.info("Current __dirname:", __dirname);
    logger.info("Current cwd:", process.cwd());
    logger.info("NODE_ENV:", process.env.NODE_ENV);
    logger.info("VERCEL:", process.env.VERCEL);

    // First check if we're running on Vercel
    // Vercel Functions have a specific file structure
    if (process.env.VERCEL) {
      // On Vercel, the app is deployed to one of these locations
      const vercelPaths = [
        "/var/task/app/pages",
        "/var/task/.output/server/app/pages",
        "/.output/server/app/pages",
        resolve(process.cwd(), "app", "pages"),
        resolve(process.cwd(), ".output", "server", "app", "pages"),
      ];

      logger.info("Checking Vercel paths:", vercelPaths);

      for (const path of vercelPaths) {
        if (existsSync(path)) {
          // Check if the path actually contains Page.tsx files
          try {
            // Look for at least one Page.tsx in the directory or subdirectories
            const hasPageFiles = findPageFiles(path);
            if (hasPageFiles.length > 0) {
              logger.success(
                "Found Vercel pages directory with Page.tsx files at:",
                path
              );
              logger.debug("Found Page files:", hasPageFiles);
              return path;
            }

            logger.warn(
              "Directory exists but contains no Page.tsx files:",
              path
            );
          } catch (err) {
            logger.error("Error checking for Page.tsx files:", err);
          }

          // Even if no Page.tsx files found, still use the directory if it exists
          logger.success("Found Vercel pages directory at:", path);
          return path;
        }
      }

      // Last resort: try to list directories to debug
      try {
        const rootDirs = readdirSync("/var/task");
        logger.debug("Contents of /var/task:", rootDirs);

        if (existsSync("/var/task/.output")) {
          const outputDirs = readdirSync("/var/task/.output");
          logger.debug("Contents of /var/task/.output:", outputDirs);

          if (existsSync("/var/task/.output/server")) {
            const serverDirs = readdirSync("/var/task/.output/server");
            logger.debug("Contents of /var/task/.output/server:", serverDirs);
          }
        }
      } catch (err) {
        logger.error("Error listing directories:", err);
      }
    }

    // Try various potential locations for local development
    const localPaths = [
      resolve(__dirname, "..", "app", "pages"), // ../app/pages from lib
      resolve(process.cwd(), "app", "pages"), // CWD/app/pages
    ];

    logger.info("Checking local paths:", localPaths);
    for (const path of localPaths) {
      if (existsSync(path)) {
        logger.success("Found local pages directory at:", path);
        return path;
      }
    }

    logger.warn("Could not find pages directory, using default path");
    return resolve(process.cwd(), "app", "pages");
  } catch (error) {
    logger.error("Error detecting pages directory:", error);
    return null;
  }
}

/**
 * Recursively find all Page.tsx files in a directory
 */
function findPageFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    return files;
  }

  try {
    const dirContents = readdirSync(dir, { withFileTypes: true });

    for (const item of dirContents) {
      const fullPath = resolve(dir, item.name);

      if (item.isDirectory()) {
        findPageFiles(fullPath, files);
      } else if (
        item.name === "Page.tsx" ||
        item.name === "Page.jsx" ||
        item.name === "Page.js" ||
        item.name === "Page.ts"
      ) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    logger.warn(`Error reading directory ${dir}:`, err);
  }

  return files;
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

      // First check: Do any of the possible files actually exist?
      let anyFileExists = false;
      for (const path of possiblePaths) {
        const exists = this.fileExists(path);
        logger.debug(`  - ${path}: ${exists ? "EXISTS" : "NOT FOUND"}`);
        if (exists) {
          anyFileExists = true;
        }
      }

      // If no files exist for this route at all, return null immediately
      if (!anyFileExists) {
        logger.warn(`No Page files exist for route: ${urlPath}`);
        return null;
      }

      // Get the routes from Vinxi's router
      logger.debug("Getting routes from Vinxi router");
      const routes: Route[] = await this.getRoutes();

      // Debug routes for better visibility
      logger.debug("Available routes:", routes.map((r) => r.path).join(", "));
      logger.debug("All routes with details:", routes);

      // Find matching route
      const route = routes.find((r) => r.path === urlPath);
      if (!route) {
        logger.warn("No route found for path:", urlPath);

        // Check which routes are close to the requested path
        const closeRoutes = routes
          .filter((r) => r.path.includes(urlPath) || urlPath.includes(r.path))
          .map((r) => r.path);

        if (closeRoutes.length > 0) {
          logger.info("Similar routes that might match:", closeRoutes);
        }

        return null;
      }

      // Get the page module information
      const pageInfo = route.$page;
      if (!pageInfo) {
        logger.warn("Route has no $page property:", urlPath);
        return null;
      }

      const componentPath = pageInfo.src;
      logger.info("Loading component from:", componentPath);

      // Check if the file actually exists
      const fileExists = this.fileExists(componentPath);
      logger.debug(`Component file ${componentPath} exists: ${fileExists}`);

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

      // Import the component
      try {
        logger.debug("Importing from:", componentPath);
        const module = await import(/* @vite-ignore */ componentPath);
        logger.debug("Module keys:", Object.keys(module).join(", "));

        const component = module[pageInfo.pick[0]];

        if (!component) {
          logger.error(
            "Component not found in module for path:",
            urlPath,
            "Module content:",
            module
          );
          return null;
        }

        // Cache the result
        this.routeCache.set(urlPath, component);
        logger.success("Successfully loaded component for path:", urlPath);
        return component;
      } catch (importError) {
        logger.error("Error importing component:", importError);

        // Try alternative import strategies if the standard one fails
        for (const alternativePath of possiblePaths) {
          if (alternativePath !== componentPath) {
            try {
              logger.debug("Trying alternative import from:", alternativePath);
              const altModule = await import(
                /* @vite-ignore */ alternativePath
              );
              if (altModule.default) {
                logger.success(
                  "Found component via alternative path:",
                  alternativePath
                );
                this.routeCache.set(urlPath, altModule.default);
                return altModule.default;
              }
            } catch (e) {
              // Ignore errors for alternative paths
            }
          }
        }

        return null;
      }
    } catch (error) {
      logger.error("Error loading component for path:", urlPath, error);
      return null;
    }
  }

  /**
   * Check if a file actually exists at the given path
   * This helps diagnose file path resolution issues in production
   */
  fileExists(componentPath: string): boolean {
    try {
      return existsSync(componentPath);
    } catch (error) {
      logger.error("Error checking file existence:", error);
      return false;
    }
  }

  /**
   * Get all possible file paths for a route
   * This helps diagnose file path resolution issues in production
   */
  getPossiblePaths(urlPath: string): string[] {
    const paths = [];
    const pagesDir = this.options.dir;

    // Basic path with Page.tsx
    const basicPath =
      urlPath === "/"
        ? `${pagesDir}/Page.tsx`
        : `${pagesDir}${urlPath}/Page.tsx`;
    paths.push(basicPath);

    // Alternate file extensions
    for (const ext of this.options.extensions) {
      if (ext !== "tsx") {
        // Already added above
        const extPath =
          urlPath === "/"
            ? `${pagesDir}/Page.${ext}`
            : `${pagesDir}${urlPath}/Page.${ext}`;
        paths.push(extPath);
      }
    }

    // Try directly as file (no /Page suffix)
    for (const ext of this.options.extensions) {
      const directPath =
        urlPath === "/"
          ? `${pagesDir}/index.${ext}`
          : `${pagesDir}${urlPath}.${ext}`;
      paths.push(directPath);
    }

    return paths;
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
export async function loadPageComponent(
  event: H3Event
): Promise<PageComponent | null> {
  const path = event.path || "/";
  logger.info("loadPageComponent called for path:", path);
  return router.loadComponent(path);
}
