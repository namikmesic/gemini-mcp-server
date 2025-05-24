/**
 * Structured logger that respects configured log level
 */
export declare const logger: {
    /**
     * Log an error message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    error: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log a warning message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    warn: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log an informational message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    info: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log a debug message
     * @param message The main log message
     * @param meta Optional metadata for the log
     */
    debug: (message: string, meta?: Record<string, unknown>) => void;
};
