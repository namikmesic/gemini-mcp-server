# Codebase Loading Feature - Implementation Plan

## Overview

This document outlines the plan to add codebase loading functionality to the Gemini MCP Server, leveraging Gemini's 1M token context window and tree-sitter for intelligent code compression.

## Motivation

- **Context Window Utilization**: Gemini 2.0 Flash supports 1M tokens, far exceeding Claude's context
- **Whole Codebase Analysis**: Enable architectural reviews, security audits, and refactoring suggestions
- **Token Efficiency**: Use tree-sitter to compress code by 80%+ while preserving structure
- **Agentic Coding**: Allow AI assistants to understand entire codebases for better suggestions

## Architecture Overview

```
┌─────────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│   MCP Client        │────▶│  Gemini MCP Server │────▶│  Gemini API     │
│  (Claude Desktop)   │     │                    │     │  (1M context)   │
└─────────────────────┘     └────────────────────┘     └─────────────────┘
                                      │
                            ┌─────────┴──────────┐
                            │                    │
                    ┌───────▼────────┐  ┌───────▼────────┐
                    │ Tree-sitter    │  │ Codebase       │
                    │ Compression    │  │ Cache Manager  │
                    └────────────────┘  └────────────────┘
```

## Core Components

### 1. Tree-sitter Service
**Purpose**: Parse and compress code files using AST analysis

**Key Files**:
- `src/services/treeSitter/treeSitterService.ts`
- `src/services/treeSitter/languageQueries.ts`
- `src/services/treeSitter/compressionStrategies.ts`

**Responsibilities**:
- Initialize web-tree-sitter parser
- Load language-specific WASM files
- Apply compression queries to extract signatures
- Support multiple programming languages

### 2. Codebase Loader
**Purpose**: Intelligently load and format codebases for Gemini

**Key Files**:
- `src/services/codebaseLoader.ts`
- `src/services/fileCollector.ts`
- `src/services/tokenCounter.ts`

**Responsibilities**:
- Scan project directory
- Prioritize important files
- Apply compression based on token budget
- Format output in XML structure

### 3. Cache Manager
**Purpose**: Manage Gemini's context caching for performance

**Key Files**:
- `src/services/codebaseCacheManager.ts`
- `src/services/fileWatcher.ts`

**Responsibilities**:
- Create/update Gemini context caches
- Monitor file changes
- Invalidate stale caches
- Manage cache lifecycle

### 4. MCP Integration
**Purpose**: Expose codebase as MCP resource and enhance tool

**Key Files**:
- `src/resources/codebaseResource.ts`
- `src/tools/geminiTool.ts` (enhanced)

**Responsibilities**:
- Register codebase as MCP resource
- Add codebase parameters to Gemini tool
- Handle resource permissions

## Implementation Milestones

### MVP (Milestone 1) - Basic Codebase Loading
**Goal**: Minimal viable feature with TypeScript support only

**Deliverables**:
1. Basic tree-sitter setup for TypeScript
2. Simple file loader (no compression)
3. MCP resource registration
4. Enhanced Gemini tool with `includeCodebase` parameter

**Success Criteria**:
- Can load small TypeScript project (<100 files)
- Gemini can analyze the codebase structure
- Token count stays under 100k

**Code Example**:
```typescript
// Basic usage
const result = await callGemini({
  prompt: "What is the architecture of this codebase?",
  includeCodebase: true,
  codebasePath: "/path/to/project"
});
```

### Milestone 2 - Tree-sitter Compression
**Goal**: Add intelligent compression to fit larger codebases

**Deliverables**:
1. Implement compression strategies for TypeScript
2. Extract only signatures and structure
3. Add compression level parameter
4. Token counting and budgeting

**Success Criteria**:
- 80%+ token reduction on typical codebases
- Can handle projects with 1000+ files
- Preserves code relationships

**Code Example**:
```typescript
// Compressed loading
const result = await callGemini({
  prompt: "Find all API endpoints",
  includeCodebase: true,
  compressionLevel: "signatures", // Extract only signatures
  maxCodebaseTokens: 500000
});
```

### Milestone 3 - Multi-language Support
**Goal**: Expand beyond TypeScript

**Deliverables**:
1. Add support for Python, Go, Java
2. Language-specific compression strategies
3. Automatic language detection
4. Mixed-language project support

**Success Criteria**:
- Support 5+ popular languages
- Consistent compression across languages
- Handle polyglot repositories

### Milestone 4 - Caching & Performance
**Goal**: Optimize for repeated use and large codebases

**Deliverables**:
1. Integrate Gemini's context caching API
2. File watching for cache invalidation
3. Incremental updates
4. Background cache pre-warming

**Success Criteria**:
- 10x faster repeated queries
- Automatic cache updates on file changes
- Reduced API costs through caching

### Milestone 5 - Advanced Features
**Goal**: Production-ready features

**Deliverables**:
1. Focused analysis modes (security, architecture, etc.)
2. Dependency graph extraction
3. Cross-file reference tracking
4. Export compressed codebase for sharing

**Success Criteria**:
- Specialized analysis capabilities
- Handle enterprise-scale codebases
- Export/import functionality

## Code References

### Tree-sitter Query Example (from repomix)
```typescript
// TypeScript query for extracting signatures
export const queryTypescript = `
(function_declaration
  name: (identifier) @name.definition.function) @definition.function

(class_declaration
  name: (type_identifier) @name.definition.class) @definition.class

(interface_declaration
  name: (type_identifier) @name.definition.interface) @definition.interface
`;
```

### Compression Strategy Example
```typescript
interface CompressionStrategy {
  compressFile(content: string, ast: Parser.Tree): string;
  estimateTokenReduction(content: string): number;
}

class TypeScriptCompressionStrategy implements CompressionStrategy {
  compressFile(content: string, ast: Parser.Tree): string {
    const query = this.getQuery();
    const captures = query.captures(ast.rootNode);
    
    return captures
      .map(capture => this.extractSignature(capture, content))
      .join('\n');
  }
}
```

### Codebase Format Example
```xml
<codebase root="/path/to/project" compressed="true">
  <metadata>
    <files>156</files>
    <original_tokens>250000</original_tokens>
    <compressed_tokens>45000</compressed_tokens>
    <languages>typescript,javascript,json</languages>
  </metadata>
  
  <file path="src/index.ts">
    <compressed>
      export class Application
      constructor(config: AppConfig)
      async start(): Promise<void>
      private initializeServices(): void
    </compressed>
  </file>
  
  <file path="src/services/userService.ts">
    <compressed>
      export interface User
      export class UserService
      async createUser(data: CreateUserDto): Promise<User>
      async findUser(id: string): Promise<User | null>
    </compressed>
  </file>
</codebase>
```

### MCP Resource Registration
```typescript
mcpServer.resource({
  uri: "codebase://current",
  name: "Current Codebase",
  description: "Compressed view of the current codebase",
  mimeType: "application/x-codebase+xml",
  
  async read(): Promise<string> {
    const loader = new CodebaseLoader();
    const compressed = await loader.loadAndCompress(process.cwd());
    return compressed;
  }
});
```

## Technical Decisions

### Code Architecture Principles
1. **Dependency Injection**: All services receive dependencies through constructor
2. **Single Responsibility**: Each class has one clear purpose
3. **Interface Segregation**: Small, focused interfaces over large ones
4. **Testability First**: Design for unit testing from the start
5. **Async by Default**: All I/O operations return Promises

### Error Handling Strategy
```typescript
// All errors extend BaseError
export class CodebaseLoadError extends BaseError {
  constructor(
    message: string,
    public readonly code: 'FILE_ACCESS' | 'PARSE_ERROR' | 'TOKEN_LIMIT',
    public readonly details?: any
  ) {
    super(message);
  }
}

// Consistent error handling pattern
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new CodebaseLoadError(
    'Human-friendly message',
    'ERROR_CODE',
    { originalError: error }
  );
}
```

### Module Organization
```
src/
├── services/
│   ├── codebase/           # Codebase loading logic
│   │   ├── index.ts        # Public exports
│   │   ├── codebaseLoader.ts
│   │   ├── fileCollector.ts
│   │   ├── tokenCounter.ts
│   │   └── codebaseFormatter.ts
│   │
│   └── treeSitter/         # Tree-sitter integration
│       ├── index.ts        # Public exports
│       ├── treeSitterService.ts
│       ├── compressionStrategy.ts
│       ├── languages/      # Language-specific logic
│       │   ├── typescript.ts
│       │   ├── python.ts
│       │   └── ...
│       └── strategies/     # Compression strategies
│           ├── baseStrategy.ts
│           ├── typescriptStrategy.ts
│           └── ...
│
├── resources/              # MCP resources
│   └── codebaseResource.ts
│
└── types/                  # Shared type definitions
    └── codebase.ts
```

### Implementation Details

#### WASM Loading Strategy
```typescript
// Lazy load WASM files only when needed
class WASMLoader {
  private cache = new Map<string, Parser.Language>();
  
  async loadLanguage(name: string): Promise<Parser.Language> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }
    
    const wasmPath = require.resolve(`tree-sitter-${name}/tree-sitter-${name}.wasm`);
    const language = await Parser.Language.load(wasmPath);
    this.cache.set(name, language);
    return language;
  }
}
```

#### Token Counting Algorithm
```typescript
// More accurate token counting based on Gemini's tokenization
class GeminiTokenCounter {
  // Gemini uses ~4 characters per token on average
  private readonly CHARS_PER_TOKEN = 4;
  
  // Language-specific adjustments
  private readonly LANGUAGE_MULTIPLIERS = {
    'typescript': 0.9,  // More verbose
    'python': 1.1,      // More concise
    'go': 1.0,
    'java': 0.85        // Very verbose
  };
  
  estimateTokens(content: string, language?: string): number {
    const baseEstimate = Math.ceil(content.length / this.CHARS_PER_TOKEN);
    const multiplier = language ? 
      this.LANGUAGE_MULTIPLIERS[language] || 1.0 : 1.0;
    return Math.ceil(baseEstimate * multiplier);
  }
}
```

#### Compression Chunking Strategy
```typescript
// Smart chunking to preserve context
class ChunkingStrategy {
  chunk(nodes: ASTNode[], maxTokensPerChunk: number): ASTNode[][] {
    const chunks: ASTNode[][] = [];
    let currentChunk: ASTNode[] = [];
    let currentTokens = 0;
    
    for (const node of nodes) {
      const nodeTokens = this.estimateNodeTokens(node);
      
      if (currentTokens + nodeTokens > maxTokensPerChunk && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentTokens = 0;
      }
      
      currentChunk.push(node);
      currentTokens += nodeTokens;
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
}
```

### Why Tree-sitter?
- **Language agnostic**: Single parser for many languages
- **AST-based**: Understands code structure, not just text
- **WASM-based**: Runs in Node.js without native dependencies
- **Battle-tested**: Used by GitHub, Neovim, and repomix

### Why XML Format?
- **LLM-friendly**: Clear boundaries and structure
- **Self-documenting**: Tags explain content
- **Flexible**: Easy to add metadata
- **Proven**: Works well with Claude and Gemini

### Compression Levels
1. **none**: Full source code (baseline)
2. **signatures**: Function/class signatures only (80% reduction)
3. **minimal**: Just class and function names (90% reduction)
4. **aggressive**: Only top-level exports (95% reduction)

## Testing Strategy

### Unit Tests
- Tree-sitter parser initialization
- Compression strategies for each language
- Token counting accuracy
- File collection and filtering

### Integration Tests
- Full codebase loading pipeline
- MCP resource serving
- Gemini API calls with compressed context
- Cache management lifecycle

### Performance Tests
- Large codebase handling (10k+ files)
- Compression speed benchmarks
- Memory usage monitoring
- Token counting accuracy

### Test Codebases
1. This MCP server (small TypeScript)
2. Express.js (medium JavaScript)
3. Kubernetes (large Go)
4. Spring Boot (large Java)

## Dependencies

### Required NPM Packages
```json
{
  "dependencies": {
    "web-tree-sitter": "^0.24.7",
    "tree-sitter-wasms": "^0.1.11",
    "chokidar": "^3.5.3"
  }
}
```

### Language Support Priority
1. TypeScript/JavaScript (MVP)
2. Python
3. Go
4. Java
5. Rust
6. C/C++
7. Ruby
8. PHP

## Security Considerations

1. **File Access**: Respect .gitignore and security patterns
2. **Sensitive Data**: Never include .env, keys, or secrets
3. **Path Traversal**: Validate all file paths
4. **Resource Limits**: Cap maximum files/tokens
5. **Caching**: Don't cache sensitive codebases

## Performance Targets

- **Compression Speed**: <5 seconds for 1000 files
- **Memory Usage**: <500MB for large codebases
- **Token Reduction**: 80%+ compression rate
- **Cache Hit Rate**: 90%+ for unchanged files
- **API Latency**: <2s additional overhead

## Future Enhancements

1. **Streaming Support**: Stream large codebases
2. **Differential Updates**: Send only changes
3. **Remote Repository Support**: Load from GitHub
4. **Custom Queries**: User-defined extraction rules
5. **Multi-model Support**: Optimize for different LLMs

## Success Metrics

1. **Adoption**: Used in 50+ projects
2. **Performance**: Handle 10k+ file codebases
3. **Token Efficiency**: Average 85% compression
4. **User Satisfaction**: Positive feedback on analysis quality
5. **API Cost Reduction**: 70% reduction through caching

## References

- [Repomix Repository](https://github.com/yamadashy/repomix)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [Gemini Context Caching](https://ai.google.dev/api/context-caching)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Web-tree-sitter Guide](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web)

---

This plan provides a clear roadmap from MVP to full implementation, with concrete milestones and success criteria for the codebase loading feature.