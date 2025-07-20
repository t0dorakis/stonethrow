import { create, useRerender } from "stone-throw/client";

const TestCounter = create("test-counter", {
  state: () => ({ count: 0 }),

  // Clean server-side template - no magic handlers
  server: (state, props, children) => `
    <div>
      <div data-testid="count-display">${state.count.get()}</div>
      <button data-testid="increment-btn">+</button>
    </div>
  `,

  client: (element, state) => {
    const button = element.querySelector('[data-testid="increment-btn"]');

    const handleIncrement = (event: Event) => {
      state.count.update((n: unknown) => (n as number) + 1);
    };

    // Attach event listener once - smart diffing will preserve it
    button?.addEventListener("click", handleIncrement);

    // Setup reactivity with debug mode enabled
    useRerender([state.count], true);

    // Return cleanup function
    return () => {
      button?.removeEventListener("click", handleIncrement);
    };
  },
});

export default TestCounter;
