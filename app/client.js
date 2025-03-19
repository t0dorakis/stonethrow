// import "./components/helloWorld";
import { module as declarativeButtonModule } from "./components/declarativeButton";
import { module as customElementButtonModule } from "./components/customElementButton";
import {
  initializeCustomElements,
  registerCustomElement,
} from "./components/customElementRegistry";

// Explicitly register all components used in your application
registerCustomElement("custom-element-button", customElementButtonModule);
registerCustomElement("declarative-button", declarativeButtonModule);

// Initialize all custom elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready, initializing custom elements");
  initializeCustomElements();
});

console.log("JS Client loaded");

// Additional client-side initialization code
