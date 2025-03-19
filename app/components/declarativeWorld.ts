import h from "../../lib/JSX"; // Explicitly import your JSX factory
import "../style.css";

const SSR = (child) => {
  return `
    <declarative-button>
      <template shadowrootmode="open">
        <style>
          .declarative-button {
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
          .declarative-button:hover {
            opacity: 0.9;
            transform: scale(1.1);
          }
        </style>
        <button class="declarative-button">
          ${child}
        </button>
      </template>
    </declarative-button>
  `;
};

export const module = () => {
  console.log("module called");
  class DeclarativeButton extends HTMLElement {
    constructor() {
      super();

      const supportsDeclarative =
        HTMLElement.prototype.hasOwnProperty("attachInternals");
      const internals = supportsDeclarative
        ? this.attachInternals()
        : undefined;

      const toggle = () => {
        console.log("menu toggled!");
      };

      // check for a Declarative Shadow Root.
      let shadow = internals?.shadowRoot;

      // in either case, wire up our event listener:
      shadow.firstElementChild.addEventListener("click", toggle);
    }
  }

  customElements.define("declarative-button", DeclarativeButton);
};

export default SSR;
