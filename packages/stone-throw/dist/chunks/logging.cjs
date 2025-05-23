'use strict';

const consola = require('consola');

const logger = consola.createConsola({
  level: process.env.NODE_ENV === "production" ? 5 : 3,
  defaults: {
    tag: "STONE"
  }
});
const recentLogs = [];
const MAX_RECENT_LOGS = 50;
logger.addReporter({
  log(logObj) {
    recentLogs.push({
      type: logObj.type,
      message: logObj.args.map(
        (arg) => typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      ).join(" "),
      timestamp: new Date()
    });
    if (recentLogs.length > MAX_RECENT_LOGS) {
      recentLogs.shift();
    }
  }
});

exports.logger = logger;
