'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const components = require('./chunks/index.cjs');
const registryUtils = require('./chunks/registryUtils.cjs');
require('./chunks/sgnls.cjs');
require('./chunks/logging.cjs');
require('consola');



exports.create = components.create;
exports.createComponent = components.createComponent;
exports.initializeCustomElements = registryUtils.initializeCustomElements;
