/**
 * Error handling utilities
 *
 * Defines custom error types and helpers for consistent error handling
 */
/**
 * Base custom error class
 */
export declare class BaseError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when there's an issue with API configuration
 */
export declare class ConfigurationError extends BaseError {
    constructor(message: string);
}
/**
 * Error thrown when an external API request fails
 */
export declare class ExternalApiError extends BaseError {
    statusCode?: number;
    apiResponse?: string;
    constructor(message: string, statusCode?: number, apiResponse?: string);
}
/**
 * Error thrown when a tool is invoked with invalid arguments
 */
export declare class InvalidToolArgumentError extends BaseError {
    constructor(toolName: string, message: string);
}
/**
 * Helper to create a user-friendly error message from any error
 * while sanitizing sensitive information
 */
export declare function formatErrorForUser(error: unknown): string;
