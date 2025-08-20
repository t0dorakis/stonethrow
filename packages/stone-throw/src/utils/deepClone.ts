import { logger } from "./logging";

const log = logger.withTag("deepClone");

/**
 * Deep clone an object using the most appropriate method available
 * Uses structuredClone (modern standard) with intelligent fallback to JSON approach
 */
export function deepClone<T>(obj: T): T {
  if (obj == null) {
    return obj;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  // Use structuredClone if available (modern browsers, Node 17+)
  if (typeof structuredClone !== "undefined") {
    try {
      return structuredClone(obj);
    } catch (error) {
      // structuredClone fails on functions, DOM nodes, and some other types
      if (error instanceof DOMException && error.name === "DataCloneError") {
        log.warn(
          "structuredClone failed due to unsupported types (functions, DOM nodes, etc.). Falling back to JSON clone. Some data may be lost:",
          error.message
        );
      } else {
        log.warn(
          "structuredClone failed unexpectedly, falling back to JSON clone:",
          error
        );
      }
    }
  }

  // Fallback: JSON clone (has limitations but works for simple objects)
  // Note: This approach loses functions, converts Dates to strings, and fails on circular refs
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    log.error(
      "Failed to clone state object. State may contain circular references or unsupported types:",
      error
    );
    throw new Error(
      "Unable to clone component state. Ensure state contains only serializable values (no functions, DOM nodes, or circular references)."
    );
  }
}
