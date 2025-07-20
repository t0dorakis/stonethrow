import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	testDir: "./e2e",
	timeout: 30000,
	fullyParallel: false, // Run tests sequentially to avoid port conflicts
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1, // Single worker to avoid port conflicts
	reporter: "null", // No file output, just console status
	globalSetup: join(__dirname, "e2e/global-setup.ts"),
	globalTeardown: join(__dirname, "e2e/global-teardown.ts"),
	use: {
		// Use dynamic baseURL from global setup
		baseURL: process.env.PLAYWRIGHT_BASE_URL,
		trace: "off", // Disable trace recording
		screenshot: "off", // Disable screenshots
		video: "off", // Disable video recording
	},
});
