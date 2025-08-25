import { initializeCustomElements } from "@stonethrow/core/client";
import { stoneComponentRegistry } from "./stone.generated";

// Initialize all custom elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.info(
    "DOM ready, initializing custom elements",
    stoneComponentRegistry
  );
  initializeCustomElements(stoneComponentRegistry);
});
