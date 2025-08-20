import { createContext } from "unctx";
import type { Signal } from "../state/sgnls";
import type { ComponentOptions, Props } from "../types";
import { smartUpdateElement } from "../utils/smartDiff";

interface RerenderContext {
	currentElement: HTMLElement;
	renderFunction: (
		state: Record<string, Signal<unknown>>,
		props: Props | undefined,
		children: string | undefined,
	) => string;
	stateSignals: Record<string, Signal<unknown>>;
	effectCleanups: Set<() => void>;
}

// Create context using unctx for robust context management
const rerenderContext = createContext<RerenderContext>();

export function useRerenderContext(): RerenderContext | null {
	return rerenderContext.tryUse();
}

export function createRerenderScope<T>(
	context: RerenderContext,
	callback: () => T,
): T {
	return rerenderContext.call(context, callback);
}

/**
 * Hook that intelligently rerenders components using smart diffing
 * @param deps - Array of signals to watch for changes
 * @param debugMode - Enable debug logging for diffing process
 */
export function useRerender(deps: Signal<unknown>[], debugMode = false): void {
	const context = useRerenderContext();

	if (!context) {
		throw new Error(
			"useRerender must be called within a component init function",
		);
	}

	// Set up effects for each dependency
	for (const signal of deps) {
		signal.effect(() => {
			rerenderComponent(context, debugMode);
		});

		// Store cleanup function (signals have their own cleanup via .stop())
		context.effectCleanups.add(() => signal.stop());
	}
}

/**
 * Intelligently rerender the component using smart diffing
 */
function rerenderComponent(context: RerenderContext, debugMode: boolean): void {
	const { currentElement, renderFunction, stateSignals } = context;

	// Generate new HTML
	const newHTML = renderFunction(stateSignals, undefined, undefined);

	// Use smart diffing to update efficiently
	const result = smartUpdateElement(currentElement, newHTML, {
		preserveEventListeners: true,
		preserveFocus: true,
		debugMode,
	});

	if (debugMode || result.type !== "none") {
		console.log(
			`🧠 Smart rerender: ${result.type} update with ${result.changesCount} changes in ${result.performance.duration.toFixed(2)}ms`,
		);
	}
}
