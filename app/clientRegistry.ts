import Card from "./components/Card";
import MiniCounter from "./components/MiniCounter";

// TODO: this should be done asynchronously ( to reduce bundle size )
// TODO: this could mabybe be done more elegantly and automatically

// Create an interface that includes the component name properties
interface ComponentWithName {
	componentName: string;
	module: () => void;
}

// Cast components to the interface with componentName
const cardComponent = Card as unknown as ComponentWithName;
const miniCounterComponent = MiniCounter as unknown as ComponentWithName;

// Register components in the client registry
export const clientRegistry = new Map([
	// Components with their auto-derived names
	[cardComponent.componentName, Card.module],
	[miniCounterComponent.componentName, MiniCounter.module],
]);

// Force the component names to be retained in production
console.log(
	"Registered components:",
	Array.from(clientRegistry.keys())
		.map(
			(name) =>
				`${name} -> ${clientRegistry.get(name) ? "registered" : "not found"}`,
		)
		.join(", "),
);
