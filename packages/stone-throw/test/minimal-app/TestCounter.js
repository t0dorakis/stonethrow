import { create, useRerender } from "../../dist/index.mjs";

const TestCounter = create("test-counter", {
	state: () => ({ count: 0 }),
	render: (state) => `
    <div>
      <div data-testid="count-display">${state.count.get()}</div>
      <button data-testid="increment-btn">+</button>
    </div>
  `,
	init: (element, state) => {
		console.log("TestCounter init called");
		console.log("Initial count:", state.count.get());

		// Use the rerender hook
		console.log("Setting up useRerender...");
		useRerender([state.count]);
		console.log("useRerender setup complete");

		// Set up button click handler
		const button = element.querySelector('[data-testid="increment-btn"]');
		console.log("Button found:", !!button);

		if (button) {
			button.addEventListener("click", () => {
				console.log("Button clicked, current count:", state.count.get());
				state.count.update((n) => n + 1);
				console.log("Count updated to:", state.count.get());
			});
		}
	},
});

export default TestCounter;
