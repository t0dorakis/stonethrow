import type { ChildProcess } from "node:child_process";

declare global {
	var __TEST_SERVER__: ChildProcess | undefined;
}

async function globalTeardown(): Promise<void> {
	console.log("🛑 Stopping test server...");

	const server = global.__TEST_SERVER__;

	if (server) {
		server.kill();
		console.log("✅ Test server stopped");
	} else {
		console.log("⚠️ No test server found to stop");
	}
}

export default globalTeardown;
