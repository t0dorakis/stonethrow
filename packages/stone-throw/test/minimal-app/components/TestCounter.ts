import { create } from "stone-throw/components";
import { useRerender } from "stone-throw/utils";

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

    // Function to attach event listeners (can be called multiple times)
    const attachListeners = () => {
      console.log("Attaching event listeners...");
      const button = element.querySelector('[data-testid="increment-btn"]');
      if (button) {
        button.addEventListener("click", () => {
          console.log("Button clicked, current count:", state.count.get());
          state.count.update((n: unknown) => (n as number) + 1);
          console.log("Count updated to:", state.count.get());
        });
      }
    };

    // Set up rerender with post-rerender callback
    useRerender([state.count], attachListeners);

    // Initial attachment of listeners
    attachListeners();
  },
});

export default TestCounter;
