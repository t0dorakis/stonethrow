import { initializeCustomElements } from "stone-throw/components";
import { logger } from "stone-throw/utils";
import "./style.css";
import { createHead } from "unhead/client";
import { stoneComponentRegistry } from "./stone.generated";

const log = logger.withTag("client.ts");
// Initialize Unhead on the client
window.__UNHEAD__ = createHead();

// Initialize all custom elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  log.info("DOM ready, initializing custom elements", stoneComponentRegistry);
  initializeCustomElements(stoneComponentRegistry);
});
