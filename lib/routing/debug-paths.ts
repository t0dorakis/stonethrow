import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { logger } from "../logging";

/**
 * Debug utility to check the file structure in Vercel deployment
 * This helps identify where files are actually located
 */
export function debugVercelPaths(): void {
	logger.info("🔍 DEBUG: Checking Vercel file paths");

	// Standard paths to check
	const pathsToCheck = [
		"/var/task",
		"/var/task/app",
		"/var/task/app/pages",
		"/var/task/.output",
		"/var/task/.output/server",
		"/var/task/.output/server/app",
		"/var/task/.output/server/app/pages",
		"/.output",
		"/.output/server",
		"/.output/server/app",
		"/.output/server/app/pages",
		process.cwd(),
		resolve(process.cwd(), "app"),
		resolve(process.cwd(), "app", "pages"),
		resolve(process.cwd(), ".output", "server", "app", "pages"),
	];

	// Check each path and log its contents if it exists
	for (const path of pathsToCheck) {
		if (existsSync(path)) {
			logger.success(`✅ Path exists: ${path}`);
			try {
				const contents = readdirSync(path, { withFileTypes: true });
				const files = contents
					.filter((item) => !item.isDirectory())
					.map((item) => `📄 ${item.name}`);
				const dirs = contents
					.filter((item) => item.isDirectory())
					.map((item) => `📁 ${item.name}`);

				logger.info(`Contents of ${path}:`);
				if (dirs.length) logger.info(`Directories: ${dirs.join(", ")}`);
				if (files.length) logger.info(`Files: ${files.join(", ")}`);

				// Special case: Look for Page.tsx/jsx/js files
				const pageFiles = contents.filter(
					(item) =>
						!item.isDirectory() &&
						(item.name === "Page.tsx" ||
							item.name === "Page.jsx" ||
							item.name === "Page.js" ||
							item.name === "Page.ts"),
				);

				if (pageFiles.length) {
					logger.success(
						`Found Page files in ${path}: ${pageFiles.map((f) => f.name).join(", ")}`,
					);
				}
			} catch (error) {
				logger.error(`Error reading directory ${path}:`, error);
			}
		} else {
			logger.warn(`❌ Path does not exist: ${path}`);
		}
	}
}

/**
 * Recursively search for Page.tsx files in a directory and its subdirectories
 */
export function findPageFilesRecursive(dir: string): string[] {
	logger.info(
		`🔍 DEBUG: Searching for Page files in ${dir} and subdirectories`,
	);

	if (!existsSync(dir)) {
		logger.warn(`Directory does not exist: ${dir}`);
		return [];
	}

	const results: string[] = [];

	try {
		const contents = readdirSync(dir, { withFileTypes: true });

		for (const item of contents) {
			const fullPath = resolve(dir, item.name);

			if (item.isDirectory()) {
				// Recursively search subdirectories
				const subResults = findPageFilesRecursive(fullPath);
				results.push(...subResults);
			} else if (
				item.name === "Page.tsx" ||
				item.name === "Page.jsx" ||
				item.name === "Page.js" ||
				item.name === "Page.ts"
			) {
				results.push(fullPath);
			}
		}
	} catch (error) {
		logger.error(`Error searching directory ${dir}:`, error);
	}

	return results;
}
