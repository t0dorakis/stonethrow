import Card from "./components/Card";
import MiniCounter from "./components/MiniCounter";

// TODO: this should be done asynchronously ( to reduce bundle size )
// TODO: this could mabybe be done more elegantly and automatically

// Register components in the client registry
export const clientRegistry = new Map([
  // Components with their auto-derived and validated names
  ["x-card", Card.module], // Card -> x-card (adding x- prefix since it needs a hyphen)
  ["mini-counter", MiniCounter.module], // MiniCounter -> mini-counter (already has hyphen)
]);
