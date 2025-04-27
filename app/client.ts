import Stone from "../lib/Stone";
import { clientRegistry } from "./clientRegistry";
import "./style.css";

// Initialize all custom elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready, initializing custom elements");
  Stone.init(clientRegistry);
});
