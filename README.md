# Gemini MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Google's Gemini AI models.

## Features

* **callGemini**: Send prompts to the Gemini API and receive AI-generated responses
* Support for multiple Gemini models (gemini-1.5-flash-latest, gemini-pro, etc.)
* Customizable generation parameters (temperature, tokens, etc.)
* Comprehensive error handling and logging
* Multiple transport options (stdio and HTTP)

## Prerequisites

* Node.js 18 or later
* npm (usually comes with Node.js)
* A Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

## Installation

Your server can be run directly using NPX, by cloning the repository, or via Docker.

### Using NPX

The easiest way to run the server without installing anything locally:

```bash
npx -y @yourusername/gemini-mcp-server
```

### Using Docker

If you prefer Docker, you can use the pre-built image or build it yourself.

#### Pull Pre-built Image

```bash
docker pull yourusername/gemini-mcp-server:latest
```

#### Run with Docker

For stdio transport (for use with Claude Desktop):

```bash
docker run -i --rm \
  -e GEMINI_API_KEY=your_api_key_here \
  yourusername/gemini-mcp-server:latest
```

For HTTP transport:

```bash
docker run -p 3000:3000 --rm \
  -e GEMINI_API_KEY=your_api_key_here \
  yourusername/gemini-mcp-server:latest \
  node dist/http-server.js
```

### By Cloning the Repository

```bash
git clone https://github.com/yourusername/gemini-mcp-server.git
cd gemini-mcp-server
npm install
npm run build
npm start
```

### Building Docker Image Locally

If you want to build the Docker image yourself:

```bash
git clone https://github.com/yourusername/gemini-mcp-server.git
cd gemini-mcp-server
docker build -t gemini-mcp-server .
```

### Using Docker Compose

For easier deployment, a `docker-compose.yml` file is included that defines both stdio and HTTP transport servers:

```bash
# Create a .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the HTTP server
docker-compose up gemini-mcp-http

# Or start the stdio server (for use with Claude Desktop)
docker-compose up gemini-mcp-stdio
```

## Configuration

This server requires the following environment variables:

* `GEMINI_API_KEY`: Your Google Gemini API key. Obtain it from [Google AI Studio](https://aistudio.google.com/).
* `PORT`: (Optional) Port for HTTP transport. Defaults to `3000`.
* `REQUEST_TIMEOUT_MS`: (Optional) Timeout for API requests in milliseconds. Defaults to `30000`.
* `LOG_LEVEL`: (Optional) Logging level (error, warn, info, debug). Defaults to `info`.

### Usage with Claude Desktop

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
        "GEMINI_API_KEY": "YOUR_ACTUAL_GEMINI_API_KEY_HERE"
      }
    }
  }
}
```

#### Local Clone Method

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": [
        "/path/to/gemini-mcp-server/dist/index.js"
      ],
      "env": {
        "GEMINI_API_KEY": "YOUR_ACTUAL_GEMINI_API_KEY_HERE"
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
        "-e", "GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE",
        "yourusername/gemini-mcp-server:latest"
      ]
    }
  }
}
```

Replace `YOUR_ACTUAL_GEMINI_API_KEY_HERE` with your actual Gemini API key.

### Usage with VS Code

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

### Client Examples

#### Using NPX

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const client = new Client({ name: 'MyClient', version: '1.0.0' });
  
  // For NPX method
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@yourusername/gemini-mcp-server'],
    env: {
      'GEMINI_API_KEY': 'your-api-key-here'
    }
  });
  
  await client.connect(transport);
  
  const result = await client.callTool({
    name: 'callGemini',
    arguments: {
      model: 'gemini-1.5-flash-latest',
      prompt: 'Explain what MCP is in simple terms.',
      temperature: 0.3,
    }
  });
  
  console.log(result.content[0].text);
  await client.close();
}

main();
```

#### Using Docker

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const client = new Client({ name: 'MyClient', version: '1.0.0' });
  
  // For Docker method
  const transport = new StdioClientTransport({
    command: 'docker',
    args: [
      'run', 
      '-i', 
      '--rm',
      '-e', 'GEMINI_API_KEY=your-api-key-here',
      'yourusername/gemini-mcp-server:latest'
    ]
  });
  
  await client.connect(transport);
  
  const result = await client.callTool({
    name: 'callGemini',
    arguments: {
      model: 'gemini-1.5-flash-latest',
      prompt: 'Explain what MCP is in simple terms.',
      temperature: 0.3,
    }
  });
  
  console.log(result.content[0].text);
  await client.close();
}

main();
```

## Development and Customization

### Building from Source

```bash
git clone https://github.com/yourusername/gemini-mcp-server.git
cd gemini-mcp-server
npm install
npm run build
```

### Available Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the stdio transport server
- `npm run start:http`: Run the HTTP transport server
- `npm test`: Run the test client

### Adding New Tools

You can extend the server with additional tools by:

1. Creating a new tool definition in the `src/tools` directory
2. Registering the tool in the server setup (`src/index.ts` and `src/http-server.ts`)

See the [MCP Best Practices](./mcp-best-practices.md) document for implementation guidelines.

## Troubleshooting

- **API Key Issues**: Ensure your Gemini API key is valid and correctly entered in the `.env` file or passed via environment variables
- **Connection Errors**: Check that the server is running before connecting
- **HTTP Transport**: Verify the port is not in use by another application
- **Memory Usage**: Consider adjusting `maxOutputTokens` to limit large responses

## License

MIT

## Contributing

Contributions are welcome! Please follow our coding standards and submit pull requests for new features or bug fixes.