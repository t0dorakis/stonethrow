import { test, expect } from "@playwright/test";

test.describe("Stone Throw useRerender functionality", () => {
  test("should server-render component and handle client-side rerenders", async ({
    page,
  }) => {
    // Go to the test page - baseURL is configured in playwright.config.js
    await page.goto("/");

    // Verify server-side rendering worked
// packages/stone-throw/e2e/useRerender.test.js

// …earlier setup…

// Update these assertions to use #id selectors instead of data-testid
await expect(page.locator('#count-display')).toHaveText("0");
await expect(page.locator('#increment-btn')).toBeVisible();

// …other code…

// Update these locators as well
const countDisplay = page.locator('#count-display');
const incrementBtn  = page.locator('#increment-btn');

// …rest of test…

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
});
