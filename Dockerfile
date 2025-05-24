FROM node:18-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the TypeScript code
RUN npm run build

# Use a smaller base image for the final image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose port for HTTP transport (if used)
EXPOSE 3000

# Default command runs stdio transport
CMD ["node", "dist/index.js"]

# Alternative command for HTTP transport can be specified at runtime with:
# docker run ... gemini-mcp-server node dist/http-server.js