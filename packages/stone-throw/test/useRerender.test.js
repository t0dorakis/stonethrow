import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_PORT = 3000;
const TEST_URL = `http://localhost:${TEST_PORT}`;

test.describe("Stone Throw useRerender functionality", () => {
  let server;

  test.beforeAll(async () => {
    // Start the test app server
    const appDir = join(__dirname, "minimal-app");

    server = spawn("npx", ["vinxi", "dev", "--port", TEST_PORT.toString()], {
      cwd: appDir,
      stdio: "pipe",
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      let output = "";
      const timeout = setTimeout(
        () => reject(new Error("Server start timeout")),
        15000
      );

      server.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;
        console.log("Server output:", text);
        if (
          text.includes("Local:") ||
          text.includes(`localhost:${TEST_PORT}`)
        ) {
          clearTimeout(timeout);
          resolve();
        }
      });

      server.stderr.on("data", (data) => {
        console.error("Server error:", data.toString());
      });
    });
  });

  test.afterAll(async () => {
    if (server) {
      server.kill();
    }
  });

  test("should server-render component and handle client-side rerenders", async ({
    page,
  }) => {
    // Go to the test page
    await page.goto(TEST_URL);

    // Verify server-side rendering worked

    await expect(page.locator('[data-testid="count-display"]')).toHaveText("0");
    await expect(page.locator('[data-testid="increment-btn"]')).toBeVisible();

    // Wait for client-side paint
    await page.waitForLoadState("networkidle");

    // Test client-side rerender functionality
    const countDisplay = page.locator('[data-testid="count-display"]');
    const incrementBtn = page.locator('[data-testid="increment-btn"]');

    // Click button and verify automatic rerender
    await incrementBtn.click();
    await expect(countDisplay).toHaveText("1");

    // Click again to verify it keeps working
    await incrementBtn.click();
    await expect(countDisplay).toHaveText("2");

    // Click multiple times
    await incrementBtn.click();
    await incrementBtn.click();
    await incrementBtn.click();
    await expect(countDisplay).toHaveText("5");
  });

  test("should verify console logs for debugging", async ({ page }) => {
    const consoleLogs = [];
    page.on("console", (msg) => consoleLogs.push(msg.text()));

    await page.goto(TEST_URL);
    await page.waitForLoadState("networkidle");

    // Verify init was called
    expect(
      consoleLogs.some((log) => log.includes("TestCounter init called"))
    ).toBeTruthy();

    // Click and verify logs
    await page.locator('[data-testid="increment-btn"]').click();

    // Wait a bit for logs
    await page.waitForTimeout(100);

    expect(
      consoleLogs.some((log) => log.includes("Button clicked"))
    ).toBeTruthy();
    expect(
      consoleLogs.some((log) => log.includes("Count updated to: 1"))
    ).toBeTruthy();
  });
});
