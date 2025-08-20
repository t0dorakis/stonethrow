import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { FullConfig } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_PORT = 3003;

declare global {
	var __TEST_SERVER__: ChildProcess | undefined;
}

async function globalSetup(config: FullConfig): Promise<void> {
	console.log("🚀 Starting test server for all tests...");

	const appDir = join(__dirname, "minimal-app");

	const server = spawn(
		"npx",
		["vinxi", "dev", "--port", TEST_PORT.toString()],
		{
			cwd: appDir,
			stdio: "pipe",
		},
	);

	// Store server reference globally so teardown can access it
	global.__TEST_SERVER__ = server;

	// Wait for server to start and capture the actual port
	await new Promise<void>((resolve, reject) => {
		let output = "";
		let serverReady = false;
		const timeout = setTimeout(
			() => {
				if (!serverReady) {
					console.log("❌ Server start timeout. Output so far:");
					console.log(output);
					reject(new Error("Server start timeout"));
				}
			},
			45000, // Increased timeout
		);

		server.stdout?.on("data", (data) => {
			const text = data.toString();
			output += text;
			console.log("📋 Server output:", text.trim());

			// Look for various server ready indicators
			const localMatch = text.match(/Local:\s*http:\/\/localhost:(\d+)/);
			const networkMatch = text.match(/Network:\s*http:\/\/localhost:(\d+)/);
			const urlMatch = text.match(/http:\/\/localhost:(\d+)/);
			const readyMatch = text.includes("Local:") && text.includes("localhost");

			const portMatch = localMatch || networkMatch || urlMatch;

			if (portMatch && !serverReady) {
				serverReady = true;
				const actualPort = portMatch[1];
				const actualURL = `http://localhost:${actualPort}`;

				// Store the actual URL for tests to use
				process.env.PLAYWRIGHT_BASE_URL = actualURL;

				clearTimeout(timeout);
				console.log("✅ Test server started successfully");
				console.log(`📍 Server URL: ${actualURL}`);
				resolve();
			} else if (readyMatch && !serverReady) {
				// Fallback: if we see "Local:" with localhost but can't parse port, use the specified port
				serverReady = true;
				const fallbackURL = `http://localhost:${TEST_PORT}`;
				process.env.PLAYWRIGHT_BASE_URL = fallbackURL;

				clearTimeout(timeout);
				console.log(
					"✅ Test server started successfully (using fallback port detection)",
				);
				console.log(`📍 Server URL: ${fallbackURL}`);
				resolve();
			}
		});

		server.stderr?.on("data", (data) => {
			const errorText = data.toString();
			console.log("📋 Server stderr:", errorText.trim());
			// Don't treat all stderr as fatal errors - some build info goes there
		});

		server.on("error", (error) => {
			console.error("❌ Server process error:", error);
			clearTimeout(timeout);
			reject(error);
		});

		server.on("exit", (code, signal) => {
			if (code !== 0 && code !== null && !serverReady) {
				console.error(
					`❌ Server process exited with code ${code}, signal ${signal}`,
				);
				clearTimeout(timeout);
				reject(new Error(`Server process exited with code ${code}`));
			}
		});
	});
}

export default globalSetup;
