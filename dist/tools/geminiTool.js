import { z } from 'zod';
import { callGeminiApi } from '../api/geminiClient.js';
import { logger } from '../utils/logger.js';
import { formatErrorForUser } from '../utils/errors.js';
/**
 * Input Schema for the Gemini Tool
 *
 * Defines the parameters that can be passed to the Gemini API,
 * with validation rules and descriptive documentation.
 */
export const geminiToolSchema = {
    /**
     * The Gemini model version to use
     */
    model: z.string()
        .describe("The Gemini model to use (e.g., 'gemini-1.5-flash-latest', 'gemini-pro')")
        .default("gemini-1.5-flash-latest"),
    /**
     * The text prompt to send to the model
     */
    prompt: z.string()
        .describe("The text prompt to send to the Gemini API")
        .min(1, "Prompt cannot be empty"),
    /**
     * Controls randomness in generation
     */
    temperature: z.number()
        .describe("Controls randomness of output. Lower is more deterministic.")
        .min(0, "Temperature must be at least 0")
        .max(1, "Temperature must be at most 1")
        .optional()
        .default(0.7),
    /**
     * Maximum length of the generated response
     */
    maxOutputTokens: z.number()
        .describe("Maximum number of tokens to generate")
        .int("Must be an integer")
        .positive("Must be positive")
        .max(8192, "Cannot exceed 8192 tokens")
        .optional()
        .default(2048),
    /**
     * Top-K sampling parameter
     */
    topK: z.number()
        .describe("Consider only the top-K tokens for sampling")
        .int("Must be an integer")
        .positive("Must be positive")
        .optional(),
    /**
     * Top-P (nucleus) sampling parameter
     */
    topP: z.number()
        .describe("Consider only the tokens comprising the top-P probability mass for sampling")
        .min(0, "Must be at least 0")
        .max(1, "Must be at most 1")
        .optional(),
    /**
     * Whether to enable web search grounding
     */
    enableGrounding: z.boolean()
        .describe("Enable grounding with web search capabilities")
        .optional()
        .default(true),
};
// Create the full Zod schema object for validation
const geminiToolInputSchema = z.object(geminiToolSchema);
/**
 * Registers the Gemini API tool with the MCP server
 *
 * This function creates and registers a tool that allows LLMs to interact
 * with Google's Gemini API through the Model Context Protocol.
 *
 * @param mcpServer - The MCP server instance to register the tool with
 */
export function registerGeminiTool(mcpServer) {
    logger.info('Registering Gemini API tool');
    mcpServer.tool(
    // Tool name used by LLMs to call this tool
    "callGemini", 
    // Description of what the tool does
    "Sends a prompt to the Google Gemini API and returns the generated response", 
    // Schema defining the parameters accepted by the tool
    geminiToolSchema, 
    // Tool options - metadata about the tool
    {
        // Human-friendly title for the tool
        title: "Gemini API",
        // Indicates this tool interacts with external systems
        openWorldHint: true,
        // Indicates this is a read-only operation with no side effects
        readOnlyHint: true,
        // Description targeted at human users
        descriptionForHuman: "Access Google's Gemini large language model capabilities",
    }, 
    // The tool implementation function
    async (args) => {
        // Log the tool invocation
        logger.info('Tool callGemini called', {
            model: args.model,
            promptLength: args.prompt.length,
            temperature: args.temperature,
            enableGrounding: args.enableGrounding
        });
        try {
            // Call the Gemini API through our client layer
            const response = await callGeminiApi({
                model: args.model,
                prompt: args.prompt,
                temperature: args.temperature,
                maxOutputTokens: args.maxOutputTokens,
                topK: args.topK,
                topP: args.topP,
                enableGrounding: args.enableGrounding
            });
            // Format the response for the MCP protocol
            const contentItems = [{
                    type: "text",
                    text: response.text
                }];
            // Create the result object
            const result = {
                content: contentItems,
            };
            // Metadata handling removed as the SDK doesn't provide usable grounding metadata
            return result;
        }
        catch (error) {
            // Log the error with full details for debugging
            logger.error('Error in callGemini tool', {
                error,
                errorMessage: error.message,
                stack: error.stack
            });
            // Return a user-friendly error message in the MCP format
            return {
                content: [{
                        type: "text",
                        text: `Error interacting with Gemini API: ${formatErrorForUser(error)}`
                    }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=geminiTool.js.map