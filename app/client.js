import { initializeCustomElements } from "./components/customElementRegistry";
import "./style.css"; // Import CSS directly for bundling

// Initialize all custom elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready, initializing custom elements");
  initializeCustomElements();
});

console.log("JS Client loaded");

// Additional client-side initialization code
