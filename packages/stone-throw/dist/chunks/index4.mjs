import { BaseFileSystemRouter } from 'vinxi/fs-router';

class PagesRouter extends BaseFileSystemRouter {
  constructor(options, router, app) {
    super(options, router, app);
    this.options = options;
  }
  toPath(filePath) {
    const errorPageMatch = filePath.match(/\/(\d{3})\.(tsx|jsx|js|ts)$/);
    if (errorPageMatch) {
      return `/${errorPageMatch[1]}`;
    }
    let path = filePath.replace(/\.(tsx|jsx|js|ts)$/, "");
    const pagesDir = this.options.dir;
    if (path.startsWith(pagesDir)) {
      path = path.substring(pagesDir.length);
    }
    if (path.endsWith("/Page") || path.endsWith("\\Page")) {
      path = path.slice(0, -5);
    }
    path = path.replace(/\\/g, "/");
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    return path === "/Page" ? "/" : path;
  }
  toRoute(filePath) {
    const errorPageMatch = filePath.match(/\/(\d{3})\.(tsx|jsx|js|ts)$/);
    if (errorPageMatch) {
      const statusCode = Number.parseInt(errorPageMatch[1], 10);
      if (statusCode >= 400 && statusCode < 500 || statusCode >= 500 && statusCode < 600) {
        return {
          path: this.toPath(filePath),
          $error: {
            src: filePath,
            pick: ["default"],
            statusCode
          }
        };
      }
    }
    return {
      path: this.toPath(filePath),
      $page: {
        src: filePath,
        pick: ["default", "Meta"]
      }
    };
  }
}

const index = {
  __proto__: null,
  PagesRouter: PagesRouter
};

export { PagesRouter as P, index as i };
