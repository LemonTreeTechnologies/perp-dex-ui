# Multi-stage build for optimal image size

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Build arguments for environment-specific configuration
ARG VITE_API_URL=https://api-dev.xperp.fi
ARG VITE_WS_URL=wss://api-dev.xperp.fi/ws

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Export build args as environment variables for Vite
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# Build the application
RUN yarn build

# Stage 2: Production image with Caddy
FROM caddy:2-alpine AS production

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/caddy

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose ports 80 and 443
EXPOSE 80 443

# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]

# Stage 3: Development image (optional)
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
