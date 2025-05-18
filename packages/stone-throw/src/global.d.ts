import { createHead } from "unhead/client";

declare global {
  interface Window {
    __UNHEAD__?: ReturnType<typeof createHead>;
    __STONE__?: {
      componentsToRegister?: string[];
    };
  }
}
