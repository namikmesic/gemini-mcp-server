/**
 * Error handling utilities
 *
 * Defines custom error types and helpers for consistent error handling
 */
/**
 * Base custom error class
 */
export class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Error thrown when there's an issue with API configuration
 */
export class ConfigurationError extends BaseError {
    constructor(message) {
        super(`Configuration error: ${message}`);
    }
}
/**
 * Error thrown when an external API request fails
 */
export class ExternalApiError extends BaseError {
    statusCode;
    apiResponse;
    constructor(message, statusCode, apiResponse) {
        super(`External API error: ${message}`);
        this.statusCode = statusCode;
        this.apiResponse = apiResponse;
    }
}
/**
 * Error thrown when a tool is invoked with invalid arguments
 */
export class InvalidToolArgumentError extends BaseError {
    constructor(toolName, message) {
        super(`Invalid argument for tool '${toolName}': ${message}`);
    }
}
/**
 * Helper to create a user-friendly error message from any error
 * while sanitizing sensitive information
 */
export function formatErrorForUser(error) {
    if (error instanceof ExternalApiError) {
        // For API errors, provide statusCode but sanitize the raw response
        return `API request failed${error.statusCode ? ` (status ${error.statusCode})` : ''}: ${error.message}`;
    }
    else if (error instanceof Error) {
        return error.message;
    }
    else {
        return String(error);
    }
}
//# sourceMappingURL=errors.js.map