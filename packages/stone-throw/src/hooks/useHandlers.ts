import { useReactiveDom } from "./useReactiveDom";
import type { Signal } from "../state/sgnls";
import type { EventHandler } from "../components/types";

/**
 * Simple hook for handling reactive DOM updates with automatic handler binding
 * Works with the new architecture where handlers are passed to both render and init
 */
export function useHandlers(
	handlers: Record<string, EventHandler>,
	signals: Signal<unknown>[],
) {
	// Convert EventHandler to the simpler format useReactiveDom expects
	const simpleHandlers = Object.entries(handlers).reduce(
		(acc, [key, handler]) => {
			acc[key] = (event: Event) => {
				// We need to find the element and state - this is a simplification
				const element = event.target as HTMLElement;
				// For now, we'll pass empty state - this could be improved
				handler(event, element, {});
			};
			return acc;
		},
		{} as Record<string, (event: Event) => void>,
	);

	const { watch } = useReactiveDom(simpleHandlers);
	watch(signals);
}
