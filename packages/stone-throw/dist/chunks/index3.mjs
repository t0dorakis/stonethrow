import { l as logger } from './logging.mjs';
import { s as signal } from './sgnls.mjs';

const setMeta = (meta) => {
  return {
    title: meta.title,
    metaTags: meta.metaTags
  };
};

const index = {
  __proto__: null,
  logger: logger,
  setMeta: setMeta,
  signal: signal
};

export { index as i, setMeta as s };
