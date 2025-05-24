# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Run
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run the MCP server (stdio transport)
npm start

# Run the HTTP server
npm run start:http

# Development mode (with ts-node)
npm run dev          # stdio transport
npm run dev:http     # HTTP transport

# Test the client
npm test
```

### Docker Commands
```bash
# Build Docker image
docker build -t gemini-mcp-server .

# Run with Docker (stdio)
docker run -i --rm -e GEMINI_API_KEY=your_key gemini-mcp-server:latest

# Run with Docker (HTTP)
docker run -p 3000:3000 --rm -e GEMINI_API_KEY=your_key gemini-mcp-server:latest node dist/http-server.js

# Using Docker Compose
docker-compose up gemini-mcp-http    # HTTP server
docker-compose up gemini-mcp-stdio   # STDIO server
```

## Code Architecture

### Transport Layer
The server supports dual transports:
- **STDIO Transport** (`src/index.ts`): Uses standard I/O streams for CLI integration
- **HTTP Transport** (`src/http-server.ts`): Express server with session management for web clients

### MCP Tool Implementation
- Single tool: `callGemini` in `src/tools/geminiTool.ts`
- Uses Zod schemas for parameter validation
- Supports all Gemini API parameters including web grounding

### API Client Architecture
- `src/api/geminiClient.ts`: Singleton pattern using Google's official `@google/genai` SDK
- Handles model initialization, request execution, and error mapping
- Supports web grounding via `googleSearchRetrieval` tool

### Error Handling Strategy
- Custom error hierarchy in `src/utils/errors.ts`:
  - `BaseError`: Abstract base class
  - `ExternalApiError`: For Gemini API failures
  - `ConfigurationError`: For missing/invalid config
- User-friendly error formatting with `formatErrorForUser()`

### Configuration Pattern
- Environment variables validated at startup using Zod (`src/config.ts`)
- Required: `GEMINI_API_KEY`
- Optional: `PORT` (3000), `REQUEST_TIMEOUT_MS` (30000), `LOG_LEVEL` (info)
- Fails fast with detailed error messages for invalid configuration

### Logging System
- Structured JSON logging in `src/utils/logger.ts`
- Automatic sensitive data redaction (API keys, tokens)
- Configurable log levels: error, warn, info, debug

### Session Management (HTTP only)
- UUID-based session tracking
- Transport lifecycle management per session
- Proper cleanup on disconnect

## Key Design Decisions

1. **Official SDK**: Uses Google's `@google/genai` SDK instead of raw HTTP for reliability
2. **Type Safety**: TypeScript with Zod runtime validation throughout
3. **Singleton Client**: Reuses GenAI client instance for performance
4. **Dual Transport**: Supports both CLI tools and web applications
5. **Grounding Support**: Enables web search capabilities through Google Search