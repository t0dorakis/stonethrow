// Direct exports of commonly used APIs
export { createComponent, create } from "./core/componentDefinition";
export { renderPage } from "./rendering/pageRenderer";
export { handleError } from "./rendering/errorHandler";
export { setMeta } from "./head/setMeta";
export type { Meta } from "./head/types";
export { signal } from "./state/sgnls";
export { useRerender } from "./hooks/useRerender";

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
export * as hooks from "./hooks";
