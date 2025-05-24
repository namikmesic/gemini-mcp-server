/**
 * Logger module for structured logging
 *
 * Provides a consistent logging interface throughout the application
 * with support for different log levels.
 */
import { config } from '../config.js';
// Define log levels and their priority
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
// Get configured log level
const configuredLevel = config.logLevel;
const enabledLevel = LOG_LEVELS[configuredLevel];
/**
 * Structured logger that respects configured log level
 */
export const logger = {
    /**
     * Log an error message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    error: (message, meta) => {
        if (enabledLevel >= LOG_LEVELS.error) {
            logToConsole('ERROR', message, meta);
        }
    },
    /**
     * Log a warning message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    warn: (message, meta) => {
        if (enabledLevel >= LOG_LEVELS.warn) {
            logToConsole('WARN', message, meta);
        }
    },
    /**
     * Log an informational message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    info: (message, meta) => {
        if (enabledLevel >= LOG_LEVELS.info) {
            logToConsole('INFO', message, meta);
        }
    },
    /**
     * Log a debug message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    debug: (message, meta) => {
        if (enabledLevel >= LOG_LEVELS.debug) {
            logToConsole('DEBUG', message, meta);
        }
    },
};
/**
 * Helper function to format and output log messages
 */
function logToConsole(level, message, meta) {
    const timestamp = new Date().toISOString();
    const logData = {
        timestamp,
        level,
        message,
        ...sanitizeMetadata(meta),
    };
    console.log(JSON.stringify(logData));
}
/**
 * Sanitize metadata to prevent logging sensitive information
 */
function sanitizeMetadata(meta) {
    if (!meta)
        return {};
    const sanitized = { ...meta };
    // Remove sensitive keys
    const sensitiveKeys = ['api_key', 'apiKey', 'key', 'password', 'secret', 'token'];
    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        }
    }
    return sanitized;
}
//# sourceMappingURL=logger.js.map