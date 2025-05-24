/**
 * Application configuration object with validated environment variables
 */
export declare const config: {
    geminiApiKey: string;
    port: number;
    requestTimeoutMs: number;
    logLevel: "error" | "warn" | "info" | "debug";
    serverInfo: {
        name: string;
        version: string;
    };
};
