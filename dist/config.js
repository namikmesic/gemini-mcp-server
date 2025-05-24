/**
 * Configuration module for the Gemini MCP Server
 *
 * Loads and validates environment variables, providing typed access
 * to application configuration.
 */
import dotenv from 'dotenv';
import { z } from 'zod';
// Load environment variables from .env file
dotenv.config();
/**
 * Environment variable schema with strong validation
 */
const envSchema = z.object({
    // API key validation with informative error message
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required')
        .refine(key => key !== 'YOUR_ACTUAL_GEMINI_API_KEY_HERE', {
        message: 'Please replace the placeholder with your actual Gemini API key'
    }),
    // Port validation with type conversion
    PORT: z.string()
        .transform(val => parseInt(val, 10))
        .pipe(z.number().int().positive().max(65535))
        .optional()
        .default('3000'),
    // Optional timeout configuration
    REQUEST_TIMEOUT_MS: z.string()
        .transform(val => parseInt(val, 10))
        .pipe(z.number().int().positive().max(60000))
        .optional()
        .default('30000'),
    // Log level configuration
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
});
// Parse and validate environment variables
const envParse = envSchema.safeParse(process.env);
if (!envParse.success) {
    console.error('Environment validation failed:');
    console.error(envParse.error.format());
    process.exit(1);
}
/**
 * Application configuration object with validated environment variables
 */
export const config = {
    geminiApiKey: envParse.data.GEMINI_API_KEY,
    port: envParse.data.PORT,
    requestTimeoutMs: envParse.data.REQUEST_TIMEOUT_MS,
    logLevel: envParse.data.LOG_LEVEL,
    serverInfo: {
        name: 'GeminiMcpServer',
        version: '1.0.0',
    },
};
//# sourceMappingURL=config.js.map