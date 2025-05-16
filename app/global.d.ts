import { createHead } from "unhead/client";

interface Window {
  __UNHEAD__?: ReturnType<typeof createHead>;
  __STONE__?: {
    componentsToRegister?: string[];
  };
}
