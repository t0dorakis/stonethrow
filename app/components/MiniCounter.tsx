import { create } from "../../lib/Stone";
import h from "../../lib/JSX";

// Minimal counter component - name will be derived from variable name (MiniCounter -> mini-counter)
const MiniCounter = create({
  // Define component state
  state: () => ({
    count: 0,
  }),

  // Render function with instance state
  render: (state) => (
    <div className="mini-counter">
      <span>{state.count.get()}</span>
      <button type="button">+</button>
    </div>
  ),

  // Client initialization with instance state
  init: (el, state) => {
    const display = el.querySelector("span");
    const button = el.querySelector("button");

    // Update display when count changes
    state.count.effect((value) => {
      if (display) display.textContent = String(value);
    });

    // Increment count on click
    if (button) {
      button.addEventListener("click", () => {
        state.count.update((n) => (n as number) + 1);
      });
    }
  },
});

export default MiniCounter;
