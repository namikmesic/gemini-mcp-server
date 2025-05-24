/**
 * Test client for the Gemini MCP server
 * 
 * This script creates an MCP client that connects to the Gemini MCP server
 * and tests the callGemini tool.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ES modules to get __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Basic logging setup
const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data ? data : ''),
  error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data ? data : ''),
  success: (message: string) => console.log(`[SUCCESS] ${message}`),
  divider: () => console.log('----------------------------------------------------')
};

/**
 * Run a test using the Gemini MCP Server
 */
async function runGeminiTest() {
  logger.info('Starting Gemini MCP test client...');
  
  // Create a client instance with clear identification
  const client = new Client({
    name: 'GeminiTestClient',
    version: '1.0.0',
  });

  // Path to the server script (relative to this script)
  const serverPath = path.join(__dirname, 'index.js');
  let transport: StdioClientTransport | null = null;
  
  try {
    // Create a transport that runs our server as a child process
    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath]
      // Note: timeout is not supported in StdioClientTransport parameters
    });

    // Connect to the server
    logger.info('Connecting to MCP server...');
    await client.connect(transport);
    logger.success('Connected to MCP server');
    
    // Get server information
    const serverInfo = client.getServerVersion();
    if (serverInfo) {
      logger.info(`Server: ${serverInfo.name} v${serverInfo.version}`);
    } else {
      logger.info('Server information not available');
    }
    
    // List available capabilities and tools
    const capabilities = client.getServerCapabilities();
    logger.info('Server capabilities', capabilities);
    
    // Get available tools
    const toolsList = await client.listTools();
    logger.info('Available tools:', toolsList.tools.map(t => t.name).join(', '));

    // Find and test the Gemini tool
    const geminiTool = toolsList.tools.find(t => t.name === 'callGemini');
    
    if (geminiTool) {
      logger.info('Found callGemini tool. Testing now...');
      logger.divider();
      
      // Log the tool details
      logger.info('Tool description:', geminiTool.description);
      
      // Log tool arguments if they exist and are in the expected format
      if (geminiTool.arguments && Array.isArray(geminiTool.arguments)) {
        const argStrings = geminiTool.arguments.map((a: any) => 
          `${a.name}${a.required ? ' (required)' : ''}: ${a.description || 'No description'}`
        ).join('\n  - ');
        
        logger.info('Tool arguments:', argStrings);
      }
      
      // Call the Gemini tool with appropriate parameters
      logger.info('Calling Gemini API...');
      const result = await client.callTool({
        name: 'callGemini',
        arguments: {
          model: 'gemini-1.5-flash-latest',
          prompt: 'Explain what MCP (Model Context Protocol) is in one paragraph.',
          temperature: 0.3,
        }
      });
      
      // Process and display the result
      logger.success('Received response from Gemini API');
      logger.divider();
      logger.info('Gemini API Response:');
      
      if (result.isError) {
        logger.error('Tool returned an error', result);
      } else if (result.content && Array.isArray(result.content) && result.content.length > 0) {
        const content = result.content[0] as any;
        if (content && typeof content.text === 'string') {
          console.log(content.text);
        } else {
          logger.error('Unexpected content format', content);
        }
      } else {
        logger.error('Unexpected response format', result);
      }
      
      logger.divider();
    } else {
      logger.error('callGemini tool not found in the server tools list!');
    }
  } catch (error) {
    logger.error('Error occurred during test:', (error as Error).message);
    // More detailed error for debugging
    console.error(error);
  } finally {
    // Cleanup: always close the client connection
    if (client) {
      logger.info('Disconnecting client...');
      await client.close();
      logger.success('Client disconnected successfully');
    }
  }
}

// Run the test with proper error handling
runGeminiTest().catch(error => {
  logger.error('Unhandled error in test execution:', (error as Error).message);
  process.exit(1);
});