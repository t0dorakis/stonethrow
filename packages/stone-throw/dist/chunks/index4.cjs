'use strict';

const fsRouter = require('vinxi/fs-router');

class PagesRouter extends fsRouter.BaseFileSystemRouter {
  constructor(options, router, app) {
    super(options, router, app);
    this.options = options;
  }
  toPath(filePath) {
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

exports.PagesRouter = PagesRouter;
exports.index = index;
