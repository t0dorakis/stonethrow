/**
 * @author: @t0dorakis (Theodor Hillmann)
 */

import {
  initializeCustomElements,
  getComponentsToRegister,
  markComponentForRegistration,
  componentsToRegister,
} from "./registryUtils";
import { create } from "./componentDefinition";
import type { SignalType } from "./types";

// Define custom interface for component types to include internal properties
declare global {
  interface StoneComponent {
    (props?: Record<string, unknown>, children?: unknown): string;
    module: () => void;
    state: Record<string, SignalType<unknown>>;
    componentName: string;
    _$$name?: string;
    ssr: (props?: Record<string, unknown>, children?: unknown) => string;
    __setComponentName: (name: string) => StoneComponent;
  }
}

export default {
  init: initializeCustomElements,
  create,
  getComponentsToRegister,
  markComponentForRegistration,
  componentsToRegister,
};
export { create };
