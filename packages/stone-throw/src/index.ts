// Direct exports of commonly used APIs
export { createComponent, create } from "./componentDefinition";
export { renderPage } from "./pageRenderer";
export { handleError } from "./errorHandler";
export { setMeta } from "./setMeta";
export type { Meta } from "./setMeta";
export { signal } from "./sgnls";

// Export types that users need
export type {
  PageEvent,
  PageComponent,
  ComponentOptions,
  Props,
} from "./types";

// Named exports for specific sub-modules
export * as components from "./components";
export * as rendering from "./rendering";
export * as routing from "./routing";
export * as utils from "./utils";
