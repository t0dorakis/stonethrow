import { test, expect } from "@playwright/test";

test.describe("Stone Throw Input Binding functionality", () => {
	test("should handle input binding and update UI reactively", async ({
		page,
	}) => {
		// Go to the test page - baseURL is configured in playwright.config.js
		await page.goto("/");

		// Wait for client-side paint
		await page.waitForLoadState("networkidle");

		// Get elements
		const textInput = page.locator('[data-testid="text-input"]');
		const displayText = page.locator('[data-testid="display-text"]');
		const charCount = page.locator('[data-testid="char-count"]');
		const clearBtn = page.locator('[data-testid="clear-btn"]');

		// Verify initial state
		await expect(displayText).toHaveText("");
		await expect(charCount).toHaveText("0");
		await expect(textInput).toHaveValue("");

		// Test single character input
		await textInput.fill("H");
		await expect(displayText).toHaveText("H");
		await expect(charCount).toHaveText("1");

		// Test multiple characters in a row
		await textInput.fill("Hello");
		await expect(displayText).toHaveText("Hello");
		await expect(charCount).toHaveText("5");

		// Test progressive typing (simulating real user behavior)
		await textInput.fill("");
		await textInput.type("Hello World!");
		await expect(displayText).toHaveText("Hello World!");
		await expect(charCount).toHaveText("12");

		// Test clear functionality
		await clearBtn.click();
		await expect(displayText).toHaveText("");
		await expect(charCount).toHaveText("0");
		await expect(textInput).toHaveValue("");
	});

	test("should handle rapid typing and maintain reactivity", async ({
		page,
	}) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		const textInput = page.locator('[data-testid="text-input"]');
		const displayText = page.locator('[data-testid="display-text"]');
		const charCount = page.locator('[data-testid="char-count"]');

		// Test rapid character-by-character typing
		const testPhrase = "Quick typing test";

		for (let i = 0; i < testPhrase.length; i++) {
			const currentText = testPhrase.substring(0, i + 1);
			await textInput.fill(currentText);

			// Verify the UI updates correctly for each character
			await expect(displayText).toHaveText(currentText);
			await expect(charCount).toHaveText(currentText.length.toString());
		}

		// Final verification
		await expect(displayText).toHaveText(testPhrase);
		await expect(charCount).toHaveText(testPhrase.length.toString());
	});

	test("should handle edge cases like empty input and special characters", async ({
		page,
	}) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		const textInput = page.locator('[data-testid="text-input"]');
		const displayText = page.locator('[data-testid="display-text"]');
		const charCount = page.locator('[data-testid="char-count"]');

		// Test special characters
		const specialText = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
		await textInput.fill(specialText);
		await expect(displayText).toHaveText(specialText);
		await expect(charCount).toHaveText(specialText.length.toString());

		// Test clearing to empty
		await textInput.fill("");
		await expect(displayText).toHaveText("");
		await expect(charCount).toHaveText("0");

		// Test unicode characters
		const unicodeText = "🎉🚀✨ Unicode test! 你好世界";
		await textInput.fill(unicodeText);
		await expect(displayText).toHaveText(unicodeText);
		await expect(charCount).toHaveText(unicodeText.length.toString());
	});
});
