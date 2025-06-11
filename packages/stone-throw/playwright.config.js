import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 30000,
  fullyParallel: false, // Run tests sequentially to avoid port conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid port conflicts
  reporter: null,
  use: {
    baseURL: "http://localhost:3003",
    trace: "off",
  },
});
