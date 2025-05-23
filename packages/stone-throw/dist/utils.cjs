'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const logging = require('./chunks/logging.cjs');
const utils = require('./chunks/index3.cjs');
const sgnls = require('./chunks/sgnls.cjs');
require('consola');



exports.logger = logging.logger;
exports.setMeta = utils.setMeta;
exports.signal = sgnls.signal;
