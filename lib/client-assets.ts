import { getManifest } from "vinxi/manifest";
import { logger } from "./logging";

// Define the client asset type
export interface ClientAsset {
  tag: string;
  attrs?: Record<string, string>;
  children?: string;
}

/**
 * Load client assets from the manifest
 * @returns An object containing clientAssets and clientEntry path
 */
export async function loadClientAssets() {
  try {
    const clientManifest = getManifest("client");

    if (!clientManifest?.inputs || !clientManifest.handler) {
      logger.warn("Client manifest is incomplete");
      return {
        clientAssets: [],
        clientEntry: "/_build/client.js",
      };
    }

    // Get the client entry path
    const clientEntry =
      clientManifest.inputs[clientManifest.handler]?.output?.path ||
      "/_build/client.js";

    // Load client assets using the assets() function
    const clientAssets = await clientManifest.inputs[
      clientManifest.handler
    ].assets();
    logger.verbose("Client assets loaded:", clientAssets.length);

    return { clientAssets, clientEntry };
  } catch (error) {
    logger.error("Failed to load client assets:", error);
    return {
      clientAssets: [],
      clientEntry: "/_build/client.js",
    };
  }
}
