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

export default {
  init: initializeCustomElements,
  create,
  getComponentsToRegister,
  markComponentForRegistration,
  componentsToRegister,
};
export { create };
