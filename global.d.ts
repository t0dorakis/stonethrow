import type { createHead } from "unhead/client";
declare global {
  interface Window {
    __UNHEAD__?: ReturnType<typeof createHead>;
    __STONE__?: {
      componentsToRegister?: string[];
    };
  }
}

// biome-ignore lint/complexity/noUselessEmptyExport: something is wrong with the type inference here
export {};
