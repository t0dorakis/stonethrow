import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { smartUpdateElement } from "../smartDiff";

describe("smartDiff", () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.appendChild(container);
	});

	afterEach(() => {
		document.body.removeChild(container);
	});

	describe("Text-only changes (fast path)", () => {
		it("should detect and apply text-only changes", () => {
			container.innerHTML =
				'<div><span data-testid="count">0</span><button>+</button></div>';

			const result = smartUpdateElement(
				container,
				'<div><span data-testid="count">1</span><button>+</button></div>',
				{
					debugMode: true,
				},
			);

			expect(result.type).toBe("text");
			expect(result.changesCount).toBe(1);
			expect(
				container.querySelector('[data-testid="count"]')?.textContent,
			).toBe("1");
		});

		it("should preserve event listeners during text updates", () => {
			container.innerHTML =
				'<div><span data-testid="count">0</span><button data-testid="btn">+</button></div>';

			const button = container.querySelector(
				'[data-testid="btn"]',
			) as HTMLElement;
			const clickHandler = vi.fn();
			button.addEventListener("click", clickHandler);

			smartUpdateElement(
				container,
				'<div><span data-testid="count">5</span><button data-testid="btn">+</button></div>',
			);

			// Event listener should still be attached
			button.click();
			expect(clickHandler).toHaveBeenCalled();
			expect(
				container.querySelector('[data-testid="count"]')?.textContent,
			).toBe("5");
		});

		it("should handle multiple text changes", () => {
			container.innerHTML =
				'<div><span data-testid="count">0</span><span data-testid="total">10</span></div>';

			const result = smartUpdateElement(
				container,
				'<div><span data-testid="count">5</span><span data-testid="total">15</span></div>',
			);

			expect(result.type).toBe("text");
			expect(result.changesCount).toBe(2);
			expect(
				container.querySelector('[data-testid="count"]')?.textContent,
			).toBe("5");
			expect(
				container.querySelector('[data-testid="total"]')?.textContent,
			).toBe("15");
		});
	});

	describe("Attribute changes (medium path)", () => {
		it("should detect and apply attribute changes", () => {
			container.innerHTML =
				'<div><button class="btn" data-testid="btn">Click</button></div>';

			const result = smartUpdateElement(
				container,
				'<div><button class="btn active" data-testid="btn">Click</button></div>',
				{
					debugMode: true,
				},
			);

			expect(result.type).toBe("attributes");
			expect(result.changesCount).toBeGreaterThan(0);
			expect(container.querySelector('[data-testid="btn"]')?.className).toBe(
				"btn active",
			);
		});

		it("should handle attribute removal", () => {
			container.innerHTML =
				'<div><button class="btn active" data-testid="btn">Click</button></div>';

			smartUpdateElement(
				container,
				'<div><button class="btn" data-testid="btn">Click</button></div>',
			);

			expect(container.querySelector('[data-testid="btn"]')?.className).toBe(
				"btn",
			);
		});

		it("should handle new attributes", () => {
			container.innerHTML =
				'<div><button data-testid="btn">Click</button></div>';

			smartUpdateElement(
				container,
				'<div><button class="btn" data-testid="btn">Click</button></div>',
			);

			expect(container.querySelector('[data-testid="btn"]')?.className).toBe(
				"btn",
			);
		});

		it("should preserve event listeners during attribute updates", () => {
			container.innerHTML =
				'<div><button class="btn" data-testid="btn">Click</button></div>';

			const button = container.querySelector(
				'[data-testid="btn"]',
			) as HTMLElement;
			const clickHandler = vi.fn();
			button.addEventListener("click", clickHandler);

			smartUpdateElement(
				container,
				'<div><button class="btn active" data-testid="btn">Click</button></div>',
			);

			// Event listener should still be attached
			button.click();
			expect(clickHandler).toHaveBeenCalled();
			expect(button.className).toBe("btn active");
		});
	});

	describe("Structural changes (slow path)", () => {
		it("should detect and apply structural changes", () => {
			container.innerHTML = "<div><p>Hello</p></div>";

			const result = smartUpdateElement(
				container,
				"<div><p>Hello</p><p>World</p></div>",
				{
					debugMode: true,
				},
			);

			expect(result.type).toBe("structure");
			expect(result.changesCount).toBeGreaterThan(0);
			expect(container.children[0].children).toHaveLength(2);
			expect(container.children[0].children[1].textContent).toBe("World");
		});

		it("should handle element removal", () => {
			container.innerHTML = "<div><p>Hello</p><p>World</p></div>";

			smartUpdateElement(container, "<div><p>Hello</p></div>");

			expect(container.children[0].children).toHaveLength(1);
			expect(container.children[0].children[0].textContent).toBe("Hello");
		});

		it("should handle element type changes", () => {
			container.innerHTML = "<div><p>Text</p></div>";

			smartUpdateElement(container, "<div><span>Text</span></div>");

			expect(container.children[0].children[0].tagName).toBe("SPAN");
			expect(container.children[0].children[0].textContent).toBe("Text");
		});

		it("should handle complex structural changes", () => {
			container.innerHTML = "<div><ul><li>Item 1</li></ul></div>";

			smartUpdateElement(
				container,
				"<div><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></div>",
			);

			const list = container.querySelector("ul");
			expect(list?.children).toHaveLength(3);
			expect(list?.children[0].textContent).toBe("Item 1");
			expect(list?.children[1].textContent).toBe("Item 2");
			expect(list?.children[2].textContent).toBe("Item 3");
		});
	});

	describe("No changes", () => {
		it("should detect when no changes are needed", () => {
			container.innerHTML =
				'<div><span data-testid="count">5</span><button>+</button></div>';

			const result = smartUpdateElement(
				container,
				'<div><span data-testid="count">5</span><button>+</button></div>',
			);

			expect(result.type).toBe("none");
			expect(result.changesCount).toBe(0);
		});
	});

	describe("Performance tracking", () => {
		it("should track performance metrics", () => {
			container.innerHTML = '<div><span data-testid="count">0</span></div>';

			const result = smartUpdateElement(
				container,
				'<div><span data-testid="count">1</span></div>',
			);

			expect(result.performance.startTime).toBeGreaterThan(0);
			expect(result.performance.endTime).toBeGreaterThan(
				result.performance.startTime,
			);
			expect(result.performance.duration).toBeGreaterThanOrEqual(0);
		});
	});

	describe("Focus preservation", () => {
		it("should preserve focus during updates", () => {
			container.innerHTML =
				'<div><input data-testid="input" value="test" /><span data-testid="count">0</span></div>';

			const input = container.querySelector(
				'[data-testid="input"]',
			) as HTMLInputElement;
			input.focus();

			expect(document.activeElement).toBe(input);

			smartUpdateElement(
				container,
				'<div><input data-testid="input" value="test" /><span data-testid="count">1</span></div>',
				{
					preserveFocus: true,
				},
			);

			// Focus should be preserved
			expect(document.activeElement).toBe(input);
		});
	});

	describe("Edge cases", () => {
		it("should handle empty elements", () => {
			container.innerHTML = "<div></div>";

			const result = smartUpdateElement(
				container,
				"<div><p>New content</p></div>",
			);

			expect(result.type).toBe("structure");
			expect(container.children[0].children).toHaveLength(1);
			expect(container.children[0].children[0].textContent).toBe("New content");
		});

		it("should handle whitespace-only text changes", () => {
			container.innerHTML = "<div><span>  </span></div>";

			const result = smartUpdateElement(
				container,
				"<div><span>   </span></div>",
			);

			// Should detect this as no meaningful change
			expect(result.changesCount).toBe(0);
		});

		it("should handle mixed content types", () => {
			container.innerHTML = "<div>Text<span>Element</span>More text</div>";

			smartUpdateElement(
				container,
				"<div>New text<span>New element</span>Final text</div>",
			);

			expect(container.children[0].textContent).toBe(
				"New textNew elementFinal text",
			);
		});
	});

	describe("Real-world scenarios", () => {
		it("should handle counter component updates", () => {
			container.innerHTML = `
				<div>
					<div data-testid="count-display">0</div>
					<button data-testid="increment-btn">+</button>
				</div>
			`;

			const button = container.querySelector(
				'[data-testid="increment-btn"]',
			) as HTMLElement;
			const clickHandler = vi.fn();
			button.addEventListener("click", clickHandler);

			// Simulate count updates
			for (let i = 1; i <= 5; i++) {
				const result = smartUpdateElement(
					container,
					`
					<div>
						<div data-testid="count-display">${i}</div>
						<button data-testid="increment-btn">+</button>
					</div>
				`,
				);

				expect(result.type).toBe("text");
				expect(
					container.querySelector('[data-testid="count-display"]')?.textContent,
				).toBe(i.toString());

				// Event listener should still work
				button.click();
				expect(clickHandler).toHaveBeenCalledTimes(i);
			}
		});

		it("should handle form component with dynamic validation", () => {
			container.innerHTML = `
				<form>
					<input data-testid="email" type="email" />
					<button type="submit">Submit</button>
				</form>
			`;

			// Add validation error
			smartUpdateElement(
				container,
				`
				<form>
					<input data-testid="email" type="email" class="error" />
					<div class="error-message">Invalid email</div>
					<button type="submit">Submit</button>
				</form>
			`,
			);

			expect(container.querySelector('[data-testid="email"]')?.className).toBe(
				"error",
			);
			expect(container.querySelector(".error-message")?.textContent).toBe(
				"Invalid email",
			);
		});

		it("should handle dynamic list updates", () => {
			container.innerHTML = `
				<ul>
					<li data-id="1">Item 1</li>
					<li data-id="2">Item 2</li>
				</ul>
			`;

			// Add new item
			smartUpdateElement(
				container,
				`
				<ul>
					<li data-id="1">Item 1</li>
					<li data-id="2">Item 2</li>
					<li data-id="3">Item 3</li>
				</ul>
			`,
			);

			const list = container.querySelector("ul");
			expect(list?.children).toHaveLength(3);
			expect(list?.children[2].textContent).toBe("Item 3");
		});
	});
});
