'use strict';

const logging = require('./logging.cjs');
const sgnls = require('./sgnls.cjs');

const setMeta = (meta) => {
  return {
    title: meta.title,
    metaTags: meta.metaTags
  };
};

const index = {
  __proto__: null,
  logger: logging.logger,
  setMeta: setMeta,
  signal: sgnls.signal
};

exports.index = index;
exports.setMeta = setMeta;
