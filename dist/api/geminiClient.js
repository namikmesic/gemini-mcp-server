/**
 * Gemini API Client Module (Refactored with @google/genai)
 *
 * This module provides a clean interface for communicating with Google's Gemini API
 * using the official @google/genai SDK instead of raw HTTP requests.
 * It handles request formatting, error handling, and response parsing.
 */
import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { ExternalApiError } from '../utils/errors.js';
// Singleton client instance for better performance
let genAIClient = null;
/**
 * Gets or creates the Google GenAI client
 * @returns The GoogleGenAI client instance
 */
function getGenAIClient() {
    if (!genAIClient) {
        if (!config.geminiApiKey) {
            throw new ExternalApiError('Gemini API key not found in configuration', 401, 'Missing API key');
        }
        genAIClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
    }
    return genAIClient;
}
// List of supported Gemini models
const SUPPORTED_MODELS = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-pro-vision'
];
/**
 * Makes a request to the Gemini API using the @google/genai SDK
 *
 * This function formats the request according to the Gemini API specifications,
 * handles the SDK communication, and parses the response into a structured format.
 *
 * @param params - Request parameters for the Gemini API
 * @returns Promise resolving to the structured response from Gemini
 * @throws ExternalApiError if the request fails
 */
export async function callGeminiApi(params) {
    // Extract and set default values for parameters
    const { model, prompt, temperature = 0.7, maxOutputTokens = 2048, topK, topP, enableGrounding = false } = params;
    // Validate model name
    if (!SUPPORTED_MODELS.includes(model)) {
        logger.warn(`Potentially unsupported model: ${model}. Supported models are: ${SUPPORTED_MODELS.join(', ')}`);
    }
    logger.debug('Initializing Gemini API call with @google/genai SDK', {
        model,
        promptLength: prompt.length,
        temperature,
        maxOutputTokens,
        enableGrounding
    });
    try {
        // Get or initialize the Google GenAI client
        const ai = getGenAIClient();
        // Configure generation parameters
        const requestOptions = {
            model: model,
            contents: prompt,
        };
        // Add generation configuration
        const generationConfig = {
            temperature,
            maxOutputTokens,
        };
        // Add topK and topP if provided
        if (topK !== undefined)
            generationConfig.topK = topK;
        if (topP !== undefined)
            generationConfig.topP = topP;
        // Apply generation config
        requestOptions.generationConfig = generationConfig;
        // Add Google Search tool for grounding if enabled
        if (enableGrounding) {
            requestOptions.tools = [{ googleSearchRetrieval: {} }];
        }
        // Make the API call
        const response = await ai.models.generateContent(requestOptions);
        logger.debug('Gemini API response received', {
            responseAvailable: !!response,
            hasTextContent: !!response.text
        });
        // Extract response data
        const responseText = response.text;
        // Extract other metadata from the response
        const candidate = response.candidates?.[0];
        if (!candidate) {
            throw new ExternalApiError('No candidates found in Gemini response', 200, 'Empty candidates array');
        }
        const finishReason = candidate.finishReason;
        const safetyRatings = candidate.safetyRatings;
        if (responseText) {
            // Return the structured response
            return {
                text: responseText,
                finishReason,
                safetyRatings
            };
        }
        // Handle case where no text was returned
        logger.error('No text found in Gemini API response', {
            candidateKeys: candidate ? Object.keys(candidate).join(', ') : 'null'
        });
        throw new ExternalApiError('Could not parse Gemini response - missing text content', 200, JSON.stringify(response).substring(0, 200));
    }
    catch (error) {
        // Re-throw custom errors without wrapping
        if (error instanceof ExternalApiError) {
            throw error;
        }
        // Log the error with details for debugging
        logger.error('Error calling Gemini API with SDK', {
            error,
            errorMessage: error.message,
            stack: error.stack
        });
        // SDK-specific error handling
        if (error.code === 'DEADLINE_EXCEEDED') {
            throw new ExternalApiError(`Request timed out after ${config.requestTimeoutMs}ms`, 408, 'Request took too long to complete');
        }
        // Handle rate limiting errors
        if (error.code === 'RESOURCE_EXHAUSTED') {
            throw new ExternalApiError('Rate limit exceeded for Gemini API', 429, 'Too many requests');
        }
        // Handle other API errors
        if (error.details) {
            throw new ExternalApiError(`Gemini API error: ${error.message}`, error.code || 500, error.details);
        }
        // Fallback for unknown errors
        throw new ExternalApiError(error.message || 'Unknown error occurred calling Gemini API', 500, error.stack);
    }
}
//# sourceMappingURL=geminiClient.js.map