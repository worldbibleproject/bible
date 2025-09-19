# Use Node.js 18 Debian image for better Prisma compatibility
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies for native modules and Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (skip TypeScript for now)
# RUN npm run build

# Keep tsx for runtime (needed for direct TypeScript execution)
RUN npm prune --omit=dev --keep=tsx

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Start the application
CMD ["sh", "./start.sh"]


