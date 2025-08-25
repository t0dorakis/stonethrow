import { BaseFileSystemRouter } from "vinxi/fs-router";
import type { FileSystemRouterConfig } from "vinxi/fs-router";

// Define an interface for the app parameter
export interface AppOptions {
  // Add properties as needed
  [key: string]: unknown;
}

/**
 * File System Routing
 * Example: /app/pages/about/Page.tsx -> /about
 * https://vinxi.vercel.app/guide/file-system-routing.html
 */
export class PagesRouter extends BaseFileSystemRouter {
  // Explicitly declare the options property with the correct type
  protected options: FileSystemRouterConfig;

  constructor(
    options: FileSystemRouterConfig,
    router: unknown,
    app: AppOptions
  ) {
    super(options, router, app);
    this.options = options; // Store options explicitly
  }

  toPath(filePath: string): string {
    // Handle error pages (e.g., 404.tsx, 500.tsx)
    const errorPageMatch = filePath.match(/\/(\d{3})\.(tsx|jsx|js|ts)$/);
    if (errorPageMatch) {
      return `/${errorPageMatch[1]}`;
    }

    // Extract the route path from the file path
    // Example: /app/pages/about/Page.ts -> /about
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

  toRoute(filePath: string) {
    // Handle error pages specially
    const errorPageMatch = filePath.match(/\/(\d{3})\.(tsx|jsx|js|ts)$/);
    if (errorPageMatch) {
      const statusCode = Number.parseInt(errorPageMatch[1], 10);
      // Check if this is a 4xx or 5xx error
      if (
        (statusCode >= 400 && statusCode < 500) ||
        (statusCode >= 500 && statusCode < 600)
      ) {
        return {
          path: this.toPath(filePath),
          $error: {
            src: filePath,
            pick: ["default"],
            statusCode,
          },
        };
      }
    }

    // Regular route handling
    return {
      path: this.toPath(filePath),
      $page: {
        src: filePath,
        pick: ["default", "Meta"],
      },
    };
  }
}
