import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { H3Event } from "h3";
import { BaseFileSystemRouter } from "vinxi/fs-router";
import type { PageComponent, PageEvent } from "./types";

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

		// First check if we're running on Vercel
		// Vercel Functions have a specific file structure
		if (process.env.VERCEL) {
			// On Vercel, the app is deployed to one of these locations
			const vercelPaths = [
				"/var/task/app/pages",
				"/var/task/.output/server/app/pages",
				resolve(process.cwd(), "app", "pages"),
			];

			for (const path of vercelPaths) {
				if (existsSync(path)) {
					console.log(`Found Vercel pages directory at: ${path}`);
					return path;
				}
			}
		}

		// Try various potential locations for local development
		const localPaths = [
			resolve(__dirname, "..", "app", "pages"), // ../app/pages from lib
			resolve(process.cwd(), "app", "pages"), // CWD/app/pages
		];

		for (const path of localPaths) {
			if (existsSync(path)) {
				console.log(`Found local pages directory at: ${path}`);
				return path;
			}
		}

		console.warn("Could not find pages directory, using default path");
		return resolve(process.cwd(), "app", "pages");
	} catch (error) {
		console.error("Error detecting pages directory:", error);
		return null;
	}
}

// Detect the pages directory
const pagesDir = getPagesDir();
if (!pagesDir) {
	console.warn(
		"Could not find pages directory, routing may not work correctly",
	);
}

// The router options with detected pages dir
const routerOptions = {
	dir: pagesDir || "./app/pages", // Use found dir or default
	extensions: ["tsx", "jsx", "js", "ts"],
	ignore: ["**/_*.*"], // Ignore files/folders starting with underscore
};

console.log(`Using pages directory: ${pagesDir || "./app/pages"}`);

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
		app: AppObject,
	) {
		super(options, router, app);
		this.options = options;
	}

	/**
	 * Convert file path to route path
	 * Example: /app/pages/about/Page.tsx -> /about
	 */
	toPath(filePath: string): string {
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
		return path === "/Page" ? "/" : path;
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
	 * Works in both development and production environments
	 */
	async loadComponent(urlPath: string): Promise<PageComponent | null> {
		try {
			// Use cache if available
			if (this.routeCache.has(urlPath)) {
				return this.routeCache.get(urlPath);
			}

			console.log(`Attempting to load component for path: ${urlPath}`);

			// Get the routes from Vinxi's router
			const routes: Route[] = await this.getRoutes();

			// Debug routes for better visibility
			console.log(`Available routes: ${routes.map((r) => r.path).join(", ")}`);

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

			const componentPath = pageInfo.src;
			console.log(`Loading component from: ${componentPath}`);

			// Import the component
			const module = await import(/* @vite-ignore */ componentPath);
			const component = module[pageInfo.pick[0]];

			if (!component) {
				console.warn(`Component not found in module for path: ${urlPath}`);
				return null;
			}

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
export async function loadPageComponent(
	event: H3Event,
): Promise<PageComponent | null> {
	const path = event.path || "/";
	console.log(`loadPageComponent called for path: ${path}`);
	return router.loadComponent(path);
}
