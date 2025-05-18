'use strict';

const logging = require('./logging.cjs');

const log = logging.logger.withTag("registryUtils");
const _getHandedOverRegistry = () => {
  if (typeof window !== "undefined") {
    return window?.__STONE__?.componentsToRegister;
  }
};
async function initializeCustomElements(stoneComponentRegistry) {
  const serverRegistry = _getHandedOverRegistry();
  log.info("initializeCustomElements", serverRegistry);
  if (serverRegistry) {
    for (const name of serverRegistry) {
      const loader = stoneComponentRegistry[name];
      if (loader) {
        const mod = await loader();
        if (mod.default && mod.default.module) {
          mod.default.module();
        }
      } else {
        log.warn(`No client module found for component: ${name}`);
      }
    }
  }
}
const componentsToRegister = /* @__PURE__ */ new Set();
const markComponentForRegistration = (name) => {
  componentsToRegister.add(name);
};
const getComponentsToRegister = () => {
  return Array.from(componentsToRegister);
};

exports.getComponentsToRegister = getComponentsToRegister;
exports.initializeCustomElements = initializeCustomElements;
exports.markComponentForRegistration = markComponentForRegistration;
