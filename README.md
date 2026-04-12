# perp-dex-ui

Frontend for [xrpl-perp-dex](https://github.com/LemonTreeTechnologies/xrpl-perp-dex) — a perpetual futures DEX on XRPL with TEE (Intel SGX) computation and native XRP settlement.

## Quick Start

```sh
yarn install
yarn dev
```

## Documentation

| Document                                     | Description                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture — how the UI connects to orchestrator, enclave, and XRPL |
| [docs/BACKEND-API.md](docs/BACKEND-API.md)   | Full API reference — REST endpoints, WebSocket events, authentication        |
| [docs/PITCH.md](docs/PITCH.md)               | Product pitch — problem, solution, market, partnership with My Neobank       |
| [CLAUDE.md](CLAUDE.md)                       | Developer guidance for Claude Code                                           |

## Stack

- **[SvelteKit](https://svelte.dev/docs/kit)** with static adapter (prerendered)
- **[Svelte 5](https://svelte.dev/docs/svelte)** with runes (`$state`, `$derived`, `$effect`)
- **[Tailwind CSS v4](https://tailwindcss.com/)** with forms and typography plugins
- **TypeScript** in strict mode
- **Vitest** + **Playwright** for testing

## Commands

| Task       | Command       |
| ---------- | ------------- |
| Dev server | `yarn dev`    |
| Build      | `yarn build`  |
| Lint       | `yarn lint`   |
| Format     | `yarn format` |
| Type check | `yarn check`  |
| Test       | `yarn test`   |

Makefile shortcuts: `make fmt`, `make lint`, `make build`, `make all`.

## Docker Deployment

This project includes Docker support with automatic HTTPS via Caddy.

**Production deployment:**

```sh
# Build and run with automatic HTTPS
docker-compose --profile prod up -d

# Or use make
make docker-prod
```

**Development with Docker:**

```sh
docker-compose --profile dev up
```

The production deployment:

- Serves at **xperp.fi** and **www.xperp.fi**
- Automatic HTTPS with Let's Encrypt
- Auto-renewing SSL certificates
- Gzip compression and security headers

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

## Related Repositories

| Repo                                                   | Description                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| [xrpl-perp-dex](https://github.com/LemonTreeTechnologies/xrpl-perp-dex) | Rust orchestrator — trading API, order book, price feed, P2P replication |
| SGX Enclave (private)                                  | Margin engine, ECDSA key custody, DCAP attestation                       |
