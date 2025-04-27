import { countSignal } from "./CounterContainer";

// Server-side rendered button that increments the counter
const CounterButton = () => {
  // Return styled HTML that matches what JavaScript would render
  return `
    <counter-button>
      <button class="btn-primary">Increment</button>
    </counter-button>
  `;
};

export const module = () => {
  class CounterButtonElement extends HTMLElement {
    private button: HTMLButtonElement | null = null;

    constructor() {
      super();
      // Don't use shadow DOM to enable progressive enhancement
    }

    connectedCallback() {
      // Get the button element
      this.button = this.querySelector(".btn-primary");

      if (this.button) {
        // Add click event listener to increment the count
        this.button.addEventListener("click", () => {
          // Increment the count using the signal's update method
          countSignal.update((count) => count + 1);
          console.log("Count incremented to:", countSignal.get());
        });
      }
    }
  }

  // Register the custom element
  if (!customElements.get("counter-button")) {
    customElements.define("counter-button", CounterButtonElement);
  }
};

// For server-side rendering only
export default CounterButton;
