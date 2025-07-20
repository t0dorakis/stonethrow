import { create, useRerender } from "stone-throw/client";

const TestInput = create("test-input", {
	state: () => ({ inputValue: "", displayText: "" }),

	server: (state, props, children) => `
		<div>
			<h3>Input Binding Test</h3>
			<div>
				<input 
					type="text" 
					id="text-input"
					data-testid="text-input"
					placeholder="Type something..."
				/>
				
				<button id="clear-btn" data-testid="clear-btn">Clear</button>
			</div>
						<div>
				<p>Display: <span id="display-text" data-testid="display-text">${state.inputValue.get()}</span></p>
				<p>Character count: <span id="char-count" data-testid="char-count">${
					(state.inputValue.get() as string).length
				}</span></p>
			</div>
		</div>
	`,

	client: (element, state) => {
		console.log("TestInput client called");

		useRerender([state.inputValue], true);

		const inputElement = element.querySelector(
			"#text-input",
		) as HTMLInputElement;
		const clearButton = element.querySelector(
			"#clear-btn",
		) as HTMLButtonElement;

		console.log("inputElement", inputElement);
		const handleInput = (event: Event) => {
			const newValue = (event.target as HTMLInputElement).value;
			console.log("newValue", newValue);
			state.inputValue.update(() => newValue);
		};

		const handleClear = (event: Event) => {
			state.inputValue.update(() => "");
			// Also clear the actual input element
			if (inputElement) {
				inputElement.value = "";
			}
		};

		// Add event listeners - using 'input' instead of 'keyup' for better compatibility
		inputElement?.addEventListener("input", handleInput);
		clearButton?.addEventListener("click", handleClear);

		// Return cleanup function
		return () => {
			inputElement?.removeEventListener("input", handleInput);
			clearButton?.removeEventListener("click", handleClear);
		};
	},
});

export default TestInput;
