import { useRerenderContext } from "./useRerender";

type EventHandler = (event: Event, element: HTMLElement) => void;

interface EventBinding {
	selector: string;
	eventType: string;
	handler: EventHandler;
}

/**
 * Hook that sets up event delegation to avoid reattaching listeners after rerenders
 * Events are attached to the component root and delegated to child elements
 * @param events - Object mapping selectors to event handlers
 */
export function useEvents(
	events: Record<string, EventHandler | Record<string, EventHandler>>,
): void {
	const context = useRerenderContext();

	if (!context) {
		throw new Error(
			"useEvents must be called within a component init function",
		);
	}

	const bindings: EventBinding[] = [];

	// Parse events object into bindings
	for (const [key, value] of Object.entries(events)) {
		if (typeof value === "function") {
			// Simple format: { "button": handler }
			bindings.push({
				selector: key,
				eventType: "click", // default to click
				handler: value,
			});
		} else {
			// Detailed format: { "button": { "click": handler, "mouseover": handler } }
			for (const [eventType, handler] of Object.entries(value)) {
				bindings.push({
					selector: key,
					eventType,
					handler,
				});
			}
		}
	}

	// Set up event delegation on the component root
	const setupEventDelegation = () => {
		const { currentElement } = context;

		// Group bindings by event type for efficiency
		const eventGroups = new Map<string, EventBinding[]>();

		for (const binding of bindings) {
			if (!eventGroups.has(binding.eventType)) {
				eventGroups.set(binding.eventType, []);
			}
			const group = eventGroups.get(binding.eventType);
			if (group) {
				group.push(binding);
			}
		}

		// Add event listeners to the component root for each event type
		for (const [eventType, eventBindings] of eventGroups) {
			const delegatedHandler = (event: Event) => {
				const target = event.target as HTMLElement;

				// Check each binding to see if the target matches
				for (const binding of eventBindings) {
					// Use closest to support event bubbling
					const matchingElement = target.closest(
						binding.selector,
					) as HTMLElement;

					if (matchingElement && currentElement.contains(matchingElement)) {
						binding.handler(event, matchingElement);
					}
				}
			};

			currentElement.addEventListener(eventType, delegatedHandler);

			// Store cleanup function
			context.effectCleanups.add(() => {
				currentElement.removeEventListener(eventType, delegatedHandler);
			});
		}
	};

	// Set up delegation immediately
	setupEventDelegation();
}
