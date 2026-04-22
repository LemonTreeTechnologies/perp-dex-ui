# Environment Configuration

## Overview

The application supports environment-specific API URLs for development and production environments.

## Environment Variables

- **VITE_API_URL**: Base URL for the API endpoints
- **VITE_WS_URL**: WebSocket URL for real-time connections

## Default Values

### Development

- `VITE_API_URL=https://api-dev.xperp.fi`
- `VITE_WS_URL=wss://api-dev.xperp.fi/ws`

### Production

- `VITE_API_URL=https://api.xperp.fi`
- `VITE_WS_URL=wss://api.xperp.fi/ws`

## Docker Usage

### Using Docker Compose

#### Development Environment

```bash
# Uses dev API URLs (set in docker-compose.yml as environment variables)
make docker-dev
# or
docker compose --profile dev up
```

#### Production Environment

```bash
# Uses prod API URLs (set in docker-compose.yml as build args)
make docker-prod
# or
docker compose --profile prod up -d --build
```

### Using Docker Build Directly

#### Build for Development

```bash
make docker-build-dev
# or
docker build --target production \
  --build-arg VITE_API_URL=https://api-dev.xperp.fi \
  --build-arg VITE_WS_URL=wss://api-dev.xperp.fi/ws \
  -t perp-dex-ui:dev .
```

#### Build for Production

```bash
make docker-build-prod
# or
docker build --target production \
  --build-arg VITE_API_URL=https://api.xperp.fi \
  --build-arg VITE_WS_URL=wss://api.xperp.fi/ws \
  -t perp-dex-ui:prod .
```

### Custom Environment

To use custom API URLs:

```bash
docker build --target production \
  --build-arg VITE_API_URL=https://your-custom-api.com \
  --build-arg VITE_WS_URL=wss://your-custom-api.com/ws \
  -t perp-dex-ui:custom .
```

## Local Development (Non-Docker)

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then modify the values as needed:

```env
VITE_API_URL=https://api-dev.xperp.fi
VITE_WS_URL=wss://api-dev.xperp.fi/ws
```

Run the development server:

```bash
yarn dev
```

## How It Works

1. **Dockerfile**: Accepts `ARG` build arguments that default to dev URLs
2. **Build Time**: ARG values are converted to ENV variables during the `yarn build` step
3. **Vite**: Reads the `VITE_*` environment variables and embeds them in the build
4. **docker-compose.yml**: Passes appropriate build args based on the profile (dev/prod)
5. **src/lib/config.ts**: Uses `import.meta.env.VITE_API_URL` to access the configured URL

## Notes

- Environment variables must be prefixed with `VITE_` to be exposed to the client-side code
- Values are embedded at build time, not runtime (this is a Vite/SvelteKit limitation)
- For development with hot reloading, environment variables are passed directly to the container
- For production, environment variables are baked into the build during the Docker build process
