import { existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type { H3Event } from "h3";

/**
 * Get the project root directory by finding the correct package.json
 * This approach is more reliable when the code is moved to a module
 */
function getProjectRoot() {
  try {
    // Start with direct path resolution from current file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // We know this file is in the lib directory, so go up one level
    const potentialRoot = resolve(__dirname, "..");

    // Verify that this is indeed our framework root by checking for app/pages
    if (existsSync(join(potentialRoot, "app", "pages"))) {
      return potentialRoot;
    }

    // Try to use package.json as a fallback
    const require = createRequire(import.meta.url);
    try {
      // First try to resolve package.json in the parent directory
      const pkgPath = require.resolve("../package.json");
      const root = dirname(pkgPath);

      // Verify this path has app/pages
      if (existsSync(join(root, "app", "pages"))) {
        return root;
      }
    } catch (e) {
      // If that fails, try using cwd
      console.warn("Could not find framework package.json, trying CWD");
    }

    // Final fallback - use current working directory
    const cwd = process.cwd();
    if (existsSync(join(cwd, "app", "pages"))) {
      return cwd;
    }

    console.warn("Could not reliably detect project root, using best guess");
    return potentialRoot;
  } catch (error) {
    console.error("Error detecting project root:", error);
    return process.cwd();
  }
}

// Get paths with proper project root detection
const PROJECT_ROOT = getProjectRoot();
const PAGES_DIR = resolve(PROJECT_ROOT, "app/pages");

console.log(`Project root detected: ${PROJECT_ROOT}`);
console.log(`Pages directory: ${PAGES_DIR}`);

/**
 * Loads a page component based on the URL path.
 *
 * Examples:
 * - "/" -> "/app/pages/Page.tsx"
 * - "/about" -> "/app/pages/about/Page.tsx"
 * - "/blog/post" -> "/app/pages/blog/post/Page.tsx"
 * TODO: Add support for dynamic segments
 */
export async function loadPageComponent(event: H3Event) {
  const path = event.path;

  // Default to root Page for root path
  if (path === "/" || path === "") {
    // For root path we can use a simple relative import
    return import("../app/pages/Page").then((module) => module.default);
  }

  // Split the path into segments
  const segments = path.split("/").filter(Boolean);

  // Construct the directory path from segments
  const dirPath = join(PAGES_DIR, ...segments);

  // Path to the Page.tsx file within that directory
  const pagePath = join(dirPath, "Page.tsx");

  // Check if the file exists
  if (!existsSync(pagePath)) {
    console.warn(`Page not found for path: ${path} (looking for ${pagePath})`);
    return null;
  }

  try {
    // Import using a predictable relative path pattern
    // This works better with bundlers than dynamic resolved paths
    const importPath = `../app/pages/${segments.join("/")}/Page`;
    console.log(
      `Loading page for path: ${path}, using import path: ${importPath}`
    );

    // Add vite-ignore to suppress the dynamic import warning
    const module = await import(/* @vite-ignore */ importPath);
    return module.default;
  } catch (error) {
    console.error(`Error loading page component for path ${path}:`, error);
    console.error(
      `Failed import path: ../app/pages/${segments.join("/")}/Page`
    );
    return null;
  }
}
