import { existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../logging";

/**
 * Find all Page.tsx files in a directory recursively
 */
export function findPageFiles(dir: string, files: string[] = []): string[] {
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

/**
 * Find the pages directory based on the environment
 * This is crucial for both local development and Vercel deployment
 */
export function getPagesDir(): string | null {
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
				"/var/task/.vercel/output/functions/__nitro.func/app/pages",
				"/var/task/.vercel/output/static/_build/app/pages",
				resolve(
					process.cwd(),
					".vercel",
					"output",
					"functions",
					"__nitro.func",
					"app",
					"pages",
				),
				resolve(
					process.cwd(),
					".vercel",
					"output",
					"static",
					"_build",
					"app",
					"pages",
				),
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
								path,
							);
							logger.debug("Found Page files:", hasPageFiles);
							return path;
						}

						logger.warn(
							"Directory exists but contains no Page.tsx files:",
							path,
						);
					} catch (err) {
						logger.error("Error checking for Page.tsx files:", err);
					}

					// Even if no Page.tsx files found, still use the directory if it exists
					logger.success("Found Vercel pages directory at:", path);
					return path;
				}
			}

			// Additional deep search for directories ending with "pages"
			try {
				const startDirs = [
					"/var/task",
					"/var/task/.vercel",
					"/var/task/.output",
					process.cwd(),
					resolve(process.cwd(), ".vercel"),
					resolve(process.cwd(), ".output"),
				];

				for (const startDir of startDirs) {
					if (existsSync(startDir)) {
						logger.info(`Searching for pages directory in ${startDir}`);
						const pagesDir = findPagesDir(startDir);
						if (pagesDir) {
							logger.success(
								`Found pages directory through deep search: ${pagesDir}`,
							);
							return pagesDir;
						}
					}
				}
			} catch (err) {
				logger.error("Error during deep search for pages directory:", err);
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

				if (existsSync("/var/task/.vercel")) {
					const vercelDirs = readdirSync("/var/task/.vercel");
					logger.debug("Contents of /var/task/.vercel:", vercelDirs);

					if (existsSync("/var/task/.vercel/output")) {
						const outputDirs = readdirSync("/var/task/.vercel/output");
						logger.debug("Contents of /var/task/.vercel/output:", outputDirs);

						if (existsSync("/var/task/.vercel/output/functions")) {
							const funcDirs = readdirSync(
								"/var/task/.vercel/output/functions",
							);
							logger.debug(
								"Contents of /var/task/.vercel/output/functions:",
								funcDirs,
							);

							if (
								existsSync("/var/task/.vercel/output/functions/__nitro.func")
							) {
								const nitroDirs = readdirSync(
									"/var/task/.vercel/output/functions/__nitro.func",
								);
								logger.debug(
									"Contents of /var/task/.vercel/output/functions/__nitro.func:",
									nitroDirs,
								);
							}
						}

						if (existsSync("/var/task/.vercel/output/static")) {
							const staticDirs = readdirSync("/var/task/.vercel/output/static");
							logger.debug(
								"Contents of /var/task/.vercel/output/static:",
								staticDirs,
							);
						}
					}
				}
			} catch (err) {
				logger.error("Error listing directories:", err);
			}
		}

		// Try various potential locations for local development
		const localPaths = [
			resolve(__dirname, "..", "..", "app", "pages"), // ../../app/pages from lib/routing
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
 * Recursively search for a directory that ends with 'pages'
 */
function findPagesDir(startDir: string, maxDepth = 5): string | null {
	if (maxDepth <= 0) return null;

	try {
		const entries = readdirSync(startDir, { withFileTypes: true });

		// First check for directories ending with pages
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const fullPath = resolve(startDir, entry.name);

				if (entry.name === "pages" || entry.name.endsWith("pages")) {
					// Look for Page.tsx files
					const pageFiles = findPageFiles(fullPath);
					if (pageFiles.length > 0) {
						return fullPath;
					}
				}
			}
		}

		// If not found, recursively search subdirectories
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const fullPath = resolve(startDir, entry.name);
				const result = findPagesDir(fullPath, maxDepth - 1);
				if (result) return result;
			}
		}
	} catch (err) {
		logger.debug(`Error searching in directory ${startDir}:`, err);
	}

	return null;
}

/**
 * Check if a file exists at the given path
 */
export function fileExists(path: string): boolean {
	try {
		return existsSync(path);
	} catch (error) {
		logger.error("Error checking file existence:", error);
		return false;
	}
}

/**
 * Generate possible file paths for a route
 */
export function getPossiblePaths(
	urlPath: string,
	pagesDir: string,
	extensions: string[],
): string[] {
	const paths = [];

	// Basic path with Page.tsx
	const basicPath =
		urlPath === "/" ? `${pagesDir}/Page.tsx` : `${pagesDir}${urlPath}/Page.tsx`;
	paths.push(basicPath);

	// Alternate file extensions
	for (const ext of extensions) {
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
	for (const ext of extensions) {
		const directPath =
			urlPath === "/"
				? `${pagesDir}/index.${ext}`
				: `${pagesDir}${urlPath}.${ext}`;
		paths.push(directPath);
	}

	return paths;
}
