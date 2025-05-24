/**
 * Gemini Tool Module
 *
 * This module implements an MCP tool that provides access to Google's Gemini API.
 * It allows LLMs to generate text responses, with optional grounding capabilities.
 *
 * Features:
 * - Parameter validation using Zod schema
 * - Type-safe interfaces
 * - Support for all Gemini model parameters
 * - Web grounding capability (search retrieval)
 * - Error handling and formatting
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
/**
 * Input Schema for the Gemini Tool
 *
 * Defines the parameters that can be passed to the Gemini API,
 * with validation rules and descriptive documentation.
 */
export declare const geminiToolSchema: {
    /**
     * The Gemini model version to use
     */
    model: z.ZodDefault<z.ZodString>;
    /**
     * The text prompt to send to the model
     */
    prompt: z.ZodString;
    /**
     * Controls randomness in generation
     */
    temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    /**
     * Maximum length of the generated response
     */
    maxOutputTokens: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    /**
     * Top-K sampling parameter
     */
    topK: z.ZodOptional<z.ZodNumber>;
    /**
     * Top-P (nucleus) sampling parameter
     */
    topP: z.ZodOptional<z.ZodNumber>;
    /**
     * Whether to enable web search grounding
     */
    enableGrounding: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
declare const geminiToolInputSchema: z.ZodObject<{
    /**
     * The Gemini model version to use
     */
    model: z.ZodDefault<z.ZodString>;
    /**
     * The text prompt to send to the model
     */
    prompt: z.ZodString;
    /**
     * Controls randomness in generation
     */
    temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    /**
     * Maximum length of the generated response
     */
    maxOutputTokens: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    /**
     * Top-K sampling parameter
     */
    topK: z.ZodOptional<z.ZodNumber>;
    /**
     * Top-P (nucleus) sampling parameter
     */
    topP: z.ZodOptional<z.ZodNumber>;
    /**
     * Whether to enable web search grounding
     */
    enableGrounding: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    model: string;
    prompt: string;
    temperature: number;
    maxOutputTokens: number;
    enableGrounding: boolean;
    topK?: number | undefined;
    topP?: number | undefined;
}, {
    prompt: string;
    model?: string | undefined;
    temperature?: number | undefined;
    maxOutputTokens?: number | undefined;
    topK?: number | undefined;
    topP?: number | undefined;
    enableGrounding?: boolean | undefined;
}>;
export type GeminiToolInput = z.infer<typeof geminiToolInputSchema>;
/**
 * Registers the Gemini API tool with the MCP server
 *
 * This function creates and registers a tool that allows LLMs to interact
 * with Google's Gemini API through the Model Context Protocol.
 *
 * @param mcpServer - The MCP server instance to register the tool with
 */
export declare function registerGeminiTool(mcpServer: McpServer): void;
export {};
