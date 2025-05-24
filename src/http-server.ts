/**
 * Gemini MCP Server - HTTP Transport Entry Point
 * 
 * This file is the main entry point for the Gemini MCP server using HTTP transport.
 * It sets up an Express server with a StreamableHTTPServerTransport to handle
 * MCP protocol messages over HTTP.
 */
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { config } from './config.js';
import { registerGeminiTool } from './tools/geminiTool.js';
import { logger } from './utils/logger.js';
import { randomUUID } from 'crypto';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

/**
 * Server instructions for LLMs using this MCP server
 */
const SERVER_INSTRUCTIONS = `
This server provides tools to interact with the Google Gemini API.

Available tools:
- callGemini: Sends a prompt to the Gemini API and returns the generated response.
  You can specify parameters like model, temperature, and maxOutputTokens.
`;

// Store active transports with session tracking
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Create Express app
const app = express();
app.use(express.json());

// Add basic request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when the response is complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      sessionId: req.headers['mcp-session-id'] || 'none'
    });
  });
  
  next();
});

// Create MCP server
const mcpServer = new McpServer(
  config.serverInfo,
  {
    capabilities: {
      tools: {},
      logging: {},
    },
    instructions: SERVER_INSTRUCTIONS
  }
);

// Register the Gemini tool
registerGeminiTool(mcpServer);

// Set up error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Express error handler', { 
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message 
  });
});

// Handle MCP requests (POST, GET, DELETE)
app.all('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  try {
    if (sessionId && transports[sessionId]) {
      // Existing session
      transport = transports[sessionId];
    } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
      // New session initialization
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = transport;
          logger.info('Session initialized', { sessionId: newSessionId });
        }
      });

      transport.onclose = () => {
        if (transport.sessionId && transports[transport.sessionId]) {
          delete transports[transport.sessionId];
          logger.info('Session closed', { sessionId: transport.sessionId });
        }
      };
      
      // Connect to the MCP server
      await mcpServer.connect(transport);
    } else {
      // Invalid request
      logger.warn('Invalid MCP request', { 
        sessionId, 
        method: req.method, 
        isInit: req.method === 'POST' && isInitializeRequest(req.body) 
      });
      
      res.status(400).json({ error: "Invalid MCP request" });
      return;
    }

    // Handle the request with the appropriate transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    logger.error('Error handling MCP request', { 
      error: (error as Error).message,
      sessionId 
    });
    
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * Set up graceful shutdown handlers
 */
function setupGracefulShutdown() {
  // Handle process termination signals
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    handleShutdown();
  });
  
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
  });
}

/**
 * Handle server shutdown
 */
async function handleShutdown() {
  logger.info('Shutting down HTTP server...');
  
  // Close all active transports
  for (const sessionId in transports) {
    try {
      await transports[sessionId].close();
      logger.debug('Closed transport', { sessionId });
    } catch (error) {
      logger.warn('Error closing transport', { 
        sessionId, 
        error: (error as Error).message 
      });
    }
  }
  
  try {
    await mcpServer.close();
    logger.info('MCP server closed successfully');
  } catch (error) {
    logger.error('Error closing MCP server', { error: (error as Error).message });
  }
  
  // Exit with success code
  process.exit(0);
}

// Set up graceful shutdown
setupGracefulShutdown();

// Start the server
const port = config.port;
app.listen(port, () => {
  logger.info(`${config.serverInfo.name} HTTP server listening on port ${port}`);
});