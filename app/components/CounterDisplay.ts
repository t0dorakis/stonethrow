import { countSignal } from "./CounterContainer";

// Server-side rendered display for counter value
const CounterDisplay = () => {
  // Return styled HTML that matches what JavaScript would render
  return `
    <counter-display>
      <p>Count: <span id="count">${countSignal.get()}</span></p>
    </counter-display>
  `;
};

export const module = () => {
  class CounterDisplayElement extends HTMLElement {
    private countElement: HTMLSpanElement | null = null;

    // constructor() {
    //   super();
    //   // Don't use shadow DOM to enable progressive enhancement
    // }

    connectedCallback() {
      // Get the count span element
      this.countElement = this.querySelector("#count");

      if (this.countElement) {
        // Initialize with current value
        this.countElement.textContent = countSignal.get().toString();

        // Subscribe to count changes
        countSignal.effect((newCount) => {
          if (this.countElement) {
            // Update the display when the count changes
            this.countElement.textContent = newCount.toString();
          }
        });
      }
    }

    disconnectedCallback() {
      // Clean up subscriptions when the element is removed
    }
  }
  // Register the custom element
  if (!customElements.get("counter-display")) {
    customElements.define("counter-display", CounterDisplayElement);
  }
};

// For server-side rendering only
export default CounterDisplay;
