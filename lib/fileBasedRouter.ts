import { BaseFileSystemRouter } from "vinxi/fs-router";
import type { FileSystemRouterConfig } from "vinxi/fs-router";

/**
 * File System Routing
 * Example: /app/pages/about/Page.tsx -> /about
 * https://vinxi.vercel.app/guide/file-system-routing.html
 */
export class PagesRouter extends BaseFileSystemRouter {
  // Explicitly declare the options property with the correct type
  protected options: FileSystemRouterConfig;

  constructor(options: FileSystemRouterConfig, router: unknown, app: unknown) {
    super(options, router, app);
    this.options = options; // Store options explicitly
  }

  toPath(filePath: string): string {
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

  toRoute(filePath: string) {
    return {
      path: this.toPath(filePath),
      $page: {
        src: filePath,
        pick: ["default", "Meta"],
      },
    };
  }
}
