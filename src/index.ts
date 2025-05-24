/**
 * Gemini MCP Server - Stdio Transport Entry Point
 * 
 * This file is the main entry point for the Gemini MCP server
 * using stdio transport (for command-line usage).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './config.js';
import { registerGeminiTool } from './tools/geminiTool.js';
import { logger } from './utils/logger.js';

/**
 * Server instructions for LLMs using this MCP server
 */
const SERVER_INSTRUCTIONS = `
This server provides tools to interact with the Google Gemini API.

Available tools:
- callGemini: Sends a prompt to the Gemini API and returns the generated response.
  You can specify parameters like model, temperature, and maxOutputTokens.
`;

/**
 * Creates and initializes the MCP server with stdio transport
 */
async function main() {
  try {
    logger.info(`Starting ${config.serverInfo.name} v${config.serverInfo.version} with stdio transport`);
    
    // Create the MCP server
    const mcpServer = new McpServer(
      config.serverInfo,
      {
        capabilities: {
          tools: {}, // Indicate this server supports tools
          logging: {}, // Support logging capabilities
        },
        instructions: SERVER_INSTRUCTIONS
      }
    );
    
    // Register the Gemini tool
    registerGeminiTool(mcpServer);
    
    // Set up graceful shutdown
    setupGracefulShutdown(mcpServer);

    // Initialize stdio transport
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
    await mcpServer.connect(transport);
    
    logger.info(`${config.serverInfo.name} connected and ready to use`);
  } catch (error) {
    logger.error('Error starting MCP server', { error: (error as Error).message });
    process.exit(1);
  }
}

/**
 * Set up handlers for graceful shutdown
 */
function setupGracefulShutdown(mcpServer: McpServer) {
  // Handle process termination signals
  process.on('SIGINT', () => handleShutdown(mcpServer, 'SIGINT'));
  process.on('SIGTERM', () => handleShutdown(mcpServer, 'SIGTERM'));
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    handleShutdown(mcpServer, 'uncaughtException');
  });
  
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    handleShutdown(mcpServer, 'unhandledRejection');
  });
}

/**
 * Handle server shutdown
 */
async function handleShutdown(mcpServer: McpServer, signal: string) {
  logger.info(`Received ${signal}, shutting down...`);
  
  try {
    await mcpServer.close();
    logger.info('Server closed successfully');
  } catch (error) {
    logger.error('Error during shutdown', { error: (error as Error).message });
  }
  
  // Exit with success code
  process.exit(0);
}

// Start the server
main();