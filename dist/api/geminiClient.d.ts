export interface GeminiApiParams {
    model: string;
    prompt: string;
    temperature?: number;
    maxOutputTokens?: number;
    topK?: number;
    topP?: number;
    enableGrounding?: boolean;
}
export interface GeminiApiResponse {
    text: string;
    finishReason?: string;
    safetyRatings?: any[];
}
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
export declare function callGeminiApi(params: GeminiApiParams): Promise<GeminiApiResponse>;
