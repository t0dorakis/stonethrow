// Server-side rendered custom element button that changes its color on click

const SSR = () => {
  // Return styled HTML that matches what JavaScript would render
  return `
    <custom-element-button>
      <button class="custom-element-button">Click me</button>
      <style>
        .custom-element-button {
          background-color: black;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .custom-element-button:hover {
          opacity: 0.9;
          transform: scale(1.1);
        }
      </style>
    </custom-element-button>
  `;
};

export const module = () => {
  class CustomElementButton extends HTMLElement {
    private button: HTMLButtonElement | null = null;

    constructor() {
      super();
      console.log("CustomElementButton constructor");
      // Don't use shadow DOM to enable progressive enhancement
      // We'll work with the light DOM instead
    }

    connectedCallback() {
      console.log("CustomElementButton connectedCallback");
      // Get the button that was server-rendered or create one if it doesn't exist
      this.button = this.querySelector("button");

      if (!this.button) {
        // If no server-rendered button exists, create it
        this.button = document.createElement("button");
        this.button.textContent = "Click me";
        this.button.className = "custom-element-button";
        this.appendChild(this.button);
      }

      // Add the click event listener to the button
      this.button.addEventListener("click", () => {
        if (this.button) {
          // Toggle between black and red background
          const currentBg = getComputedStyle(this.button).backgroundColor;
          this.button.style.backgroundColor =
            currentBg === "rgb(255, 0, 0)" ? "black" : "red";
        }
      });
    }
  }

  // Register the custom element if it's not already defined
  if (!customElements.get("custom-element-button")) {
    customElements.define("custom-element-button", CustomElementButton);
  }
};

// For server-side rendering only
export default SSR;
