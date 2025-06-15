# Gemini MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Google's Gemini AI models, designed for easy integration with MCP-compatible clients and tools.

**Core MCP Features:**
*   **`callGemini` Tool**: Send prompts to the Gemini API and receive AI-generated responses.
*   **Flexible Model Support**: Works with various Gemini models (e.g., gemini-1.5-flash-latest, gemini-pro).
*   **Customizable Generation**: Adjust parameters like temperature, token limits, etc.
*   **Multiple Transport Options**: Supports stdio (ideal for desktop clients) and HTTP for MCP communication.
*   **Simple Configuration**: Primarily requires a Gemini API key to get started.

## Quick Start for MCP

Get your Gemini MCP server running in minutes with these methods:

### Using NPX
The easiest way to run the server without installing anything locally. Ideal for quick setup with clients like Claude Desktop or VS Code.
```bash
npx -y @yourusername/gemini-mcp-server
```
*Ensure you have Node.js 18+ installed. Your `GEMINI_API_KEY` will need to be set as an environment variable or directly in your client configuration.*

### Using Docker (Stdio for Desktop Clients)
Run the server in a container, perfect for consistent environments and use with desktop MCP clients.
```bash
docker run -i --rm \
  -e GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE \
  yourusername/gemini-mcp-server:latest
```
*Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key. Docker should be installed.*

## Configuration

The server is configured primarily through environment variables:

*   **`GEMINI_API_KEY` (Required)**: Your Google Gemini API key. Obtain it from [Google AI Studio](https://aistudio.google.com/). This is essential for the server to communicate with the Gemini API.
*   `LOG_LEVEL`: (Optional) Set the logging level (e.g., `error`, `warn`, `info`, `debug`). Defaults to `info`.
*   `PORT`: (Optional) Port for the HTTP transport, if used. Defaults to `3000`.
*   `REQUEST_TIMEOUT_MS`: (Optional) Timeout for API requests in milliseconds. Defaults to `30000`.

## Integrating with MCP Clients

### Claude Desktop

To integrate this server with the Claude Desktop app, add the following configuration to the `"mcpServers"` section of your `claude_desktop_config.json`:

#### NPX Method

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": [
        "-y",
        "@yourusername/gemini-mcp-server"
      ],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY_HERE"
      }
    }
  }
}
```

#### Docker Method

```json
{
  "mcpServers": {
    "gemini": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE",
        "yourusername/gemini-mcp-server:latest"
      ]
    }
  }
}
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key.

### VS Code

Add the following JSON block to your User Settings (JSON) file (`Preferences: Open User Settings (JSON)`) or to a `.vscode/mcp.json` file in your workspace.

#### NPX Method

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "gemini_api_key",
        "description": "Your Google Gemini API Key",
        "password": true
      }
    ],
    "servers": {
      "gemini": {
        "command": "npx",
        "args": [
          "-y",
          "@yourusername/gemini-mcp-server"
        ],
        "env": {
          "GEMINI_API_KEY": "${input:gemini_api_key}"
        }
      }
    }
  }
}
```

#### Docker Method

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "gemini_api_key",
        "description": "Your Google Gemini API Key",
        "password": true
      }
    ],
    "servers": {
      "gemini": {
        "command": "docker",
        "args": [
          "run", 
          "-i", 
          "--rm",
          "yourusername/gemini-mcp-server:latest"
        ],
        "env": {
          "GEMINI_API_KEY": "${input:gemini_api_key}"
        }
      }
    }
  }
}
```

#### One-Click Installation for VS Code

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPX-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=gemini&inputs=%5B%7B%22type%22%3A%22promptString%22%2C%22id%22%3A%22gemini_api_key%22%2C%22description%22%3A%22Your%20Google%20Gemini%20API%20Key%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40yourusername%2Fgemini-mcp-server%22%5D%2C%22env%22%3A%7B%22GEMINI_API_KEY%22%3A%22%24%7Binput%3Agemini_api_key%7D%22%7D%7D)

[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=docker&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=gemini&inputs=%5B%7B%22type%22%3A%22promptString%22%2C%22id%22%3A%22gemini_api_key%22%2C%22description%22%3A%22Your%20Google%20Gemini%20API%20Key%22%2C%22password%22%3Atrue%7D%5D&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22yourusername%2Fgemini-mcp-server%3Alatest%22%5D%2C%22env%22%3A%7B%22GEMINI_API_KEY%22%3A%22%24%7Binput%3Agemini_api_key%7D%22%7D%7D)

### Programmatic Usage (SDK)
You can also interact with the Gemini MCP server programmatically using the MCP SDK. This is useful for building custom applications or scripts that leverage Gemini models.

**Example (using NPX server):**
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const client = new Client({ name: 'MyClient', version: '1.0.0' });

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@yourusername/gemini-mcp-server'],
    env: {
      'GEMINI_API_KEY': 'YOUR_GEMINI_API_KEY_HERE' // Replace with your actual key
    }
  });

  await client.connect(transport);

  try {
    const result = await client.callTool({
      name: 'callGemini',
      arguments: {
        model: 'gemini-1.5-flash-latest',
        prompt: 'Explain what MCP is in simple terms.',
        temperature: 0.3,
      }
    });
    console.log(result.content[0].text);
  } catch (error) {
    console.error('Error calling tool:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
```
*Ensure your `GEMINI_API_KEY` is correctly set in the environment or client configuration. This example uses NPX; similar approaches apply for Docker by adjusting the transport configuration.*

## Using the Gemini Tool

### Tool Parameters

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| model | string | The Gemini model to use | gemini-1.5-flash-latest | No |
| prompt | string | The text prompt to send to Gemini | - | Yes |
| temperature | number | Controls randomness (0.0-1.0) | 0.7 | No |
| maxOutputTokens | number | Maximum tokens to generate | 2048 | No |
| topK | number | Consider only top-K tokens | - | No |
| topP | number | Consider tokens in top-P probability mass | - | No |

## Advanced Installation & Development

### Alternative Installation Methods
*   **Clone the repository**: `git clone https://github.com/yourusername/gemini-mcp-server.git; cd gemini-mcp-server; npm install; npm run build`
*   **Build Docker image locally**: `docker build -t gemini-mcp-server .` (after cloning)
*   **Run HTTP server with Docker**: `docker run -p 3000:3000 --rm -e GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE yourusername/gemini-mcp-server:latest node dist/http-server.js`
*   **Use Docker Compose**: Create a `.env` file with `GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE`, then run `docker-compose up gemini-mcp-http` (for HTTP) or `docker-compose up gemini-mcp-stdio` (for stdio). This is useful for easily running pre-configured HTTP or stdio versions.

### Development
Key scripts for development:
*   `npm run build`: Compile TypeScript to JavaScript.
*   `npm start`: Run the stdio transport server (after building).
*   `npm run start:http`: Run the HTTP transport server (after building).
*   `npm test`: Run the test client.

### Adding New Tools
To extend the server with new tools, see the [MCP Best Practices](./mcp-best-practices.md) document.

## Troubleshooting

*   **API Key Issues**:
    *   Ensure your `GEMINI_API_KEY` is valid and correctly set as an environment variable or in your client's configuration.
    *   Verify the key has access to the Gemini API.
*   **Server Not Running/Connection Errors**:
    *   **NPX/Docker**: Make sure the `npx` or `docker run` command was successful and the server is running before attempting to connect from a client. Check for error messages in the terminal where you started the server.
    *   **Claude Desktop/VS Code**: Double-check the command and arguments in your client configuration match one of the Quick Start methods.
*   **Incorrect Model Name**: Ensure the `model` parameter in your tool call (e.g., `gemini-1.5-flash-latest`) is a valid and available model.
*   **Docker Issues**: Ensure Docker Desktop is running. If using `docker run`, check that the image `yourusername/gemini-mcp-server:latest` is available locally or can be pulled.
*   For more detailed logs, set the `LOG_LEVEL` environment variable to `debug`.

## License

MIT

## Contributing

Contributions are welcome! Please follow our coding standards and submit pull requests for new features or bug fixes.