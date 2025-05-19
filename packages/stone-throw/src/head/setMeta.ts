import type { Meta } from "./types";
/**
 * Simple helper to set the meta tags for the page
 * @param meta The meta tags to set
 * @returns The meta tags
 */
export const setMeta = (meta: Meta) => {
  return {
    title: meta.title,
    metaTags: meta.metaTags,
  };
};
