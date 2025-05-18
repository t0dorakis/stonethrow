'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const rendering = require('./chunks/index2.cjs');
require('./chunks/registryUtils.cjs');
require('./chunks/logging.cjs');
require('consola');
require('vinxi/manifest');
require('unhead/server');



exports.fallbackErrorPage = rendering.fallbackErrorPage;
exports.handleError = rendering.handleError;
exports.loadErrorPage = rendering.loadErrorPage;
exports.renderErrorWithComponent = rendering.renderErrorWithComponent;
exports.renderPage = rendering.renderPage;
