import Stone from "../lib/Stone";
import { clientRegistry } from "./clientRegistry";
import "./style.css";
import { createHead } from "unhead/client";
import { logger } from "../lib/logging";

// Initialize Unhead on the client
window.__UNHEAD__ = createHead();

// Initialize all custom elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  logger.info("DOM ready, initializing custom elements", clientRegistry);
  Stone.init(clientRegistry);
});
