import { module as counterContainerModule } from "./components/CounterContainer";
import { module as counterDisplayModule } from "./components/CounterDisplay";
import { module as counterButtonModule } from "./components/CounterButton";

// TODO: this should be done asynchronously ( to reduce bundle size )
// TODO: this could mabybe be done more elegantly and automatically

export const clientRegistry = new Map([
  ["counter-container", counterContainerModule],
  ["counter-display", counterDisplayModule],
  ["counter-button", counterButtonModule],
]);
