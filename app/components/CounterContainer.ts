import CounterButton from "./CounterButton";
import CounterDisplay from "./CounterDisplay";
import Stone from "../../lib/Stone";
import signal from "../../lib/sgnls";

// Create a singleton signal that can be imported by other components
export const countSignal = signal(0);

// Server-side rendered container for counter components
const CounterContainer = () => {
  // Return styled HTML that matches what JavaScript would render
  return `
    <counter-container>
      <div class="counter-wrapper">
        ${Stone.createCustomElement("counter-button", CounterButton)}
        ${Stone.createCustomElement("counter-display", CounterDisplay)}
      </div>
    </counter-container>
  `;
};

export const module = () => {
  class CounterContainer extends HTMLElement {
    // constructor() {
    //   super();
    //   // Don't use shadow DOM to enable progressive enhancement
    // }

    connectedCallback() {
      console.log("Counter container initialized");
    }
  }
};

// For server-side rendering only
export default CounterContainer;
