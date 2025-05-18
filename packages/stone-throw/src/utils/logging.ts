import { createConsola } from "consola";

// Create a custom consola instance
export const logger = createConsola({
  // Use a higher level in production to ensure all logs are visible
  level: process.env.NODE_ENV === "production" ? 5 : 3,
  // Custom formatting for Stone Throw
  defaults: {
    tag: "STONE",
  },
});

// Add a special reporter for debug page that collects recent logs
const recentLogs: Array<{ type: string; message: string; timestamp: Date }> =
  [];
const MAX_RECENT_LOGS = 50;

logger.addReporter({
  log(logObj) {
    // Keep a record of recent logs for the debug page
    recentLogs.push({
      type: logObj.type,
      message: logObj.args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" "),
      timestamp: new Date(),
    });

    // Trim the logs array if it gets too large
    if (recentLogs.length > MAX_RECENT_LOGS) {
      recentLogs.shift();
    }
  },
});

// Export the recent logs for the debug page
export function getRecentLogs() {
  return [...recentLogs];
}
