// Client-only exports - no server dependencies
export { createComponent, create } from "../core/componentDefinition";
export { useRerender } from "../hooks/useRerender";
export { signal } from "../state/sgnls";
export { initializeCustomElements } from "../core/registryUtils";

// Export only client-safe types
export type {
	ComponentOptions,
	Props,
} from "../types";
