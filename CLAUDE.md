# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend for a perpetual futures DEX on XRPL mainnet with TEE (Intel SGX) computation and RLUSD
settlement. Built with SvelteKit, Svelte 5 (runes mode), Tailwind CSS v4, and TypeScript strict mode.
Uses Vite for bundling and `@sveltejs/adapter-static` for static site generation.

**Backend:** [xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex) — Rust orchestrator + SGX enclave
**API base:** `https://api-perp.ph18.io` | **Market:** `XRP-RLUSD-PERP`

## Key Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system architecture and how the UI fits in
- [docs/BACKEND-API.md](docs/BACKEND-API.md) — full API reference (REST + WebSocket + auth)

## Commands

**Package manager: Yarn**

| Task                           | Command          |
| ------------------------------ | ---------------- |
| Install dependencies           | `yarn install`   |
| Dev server                     | `yarn dev`       |
| Build                          | `yarn build`     |
| Preview production build       | `yarn preview`   |
| Lint (prettier check + eslint) | `yarn lint`      |
| Format code                    | `yarn format`    |
| Type check                     | `yarn check`     |
| Run tests                      | `yarn test`      |
| Run tests in watch mode        | `yarn test:unit` |

Makefile shortcuts: `make fmt`, `make lint`, `make build`, `make all` (fmt + lint + build).

## Architecture

- **Routing:** SvelteKit file-based routing in `src/routes/`. Routes: `/` (landing), `/trade` (trading interface), `/verify` (enclave attestation).
- **Shared code:** `src/lib/` — accessible via the `$lib` alias. Components, utilities, stores, and API client go here.
- **API client:** `src/lib/api/client.ts` — typed wrappers for all backend endpoints. Public (`api.*`) and authenticated (`authApi.*`). Configurable via `VITE_API_URL` / `VITE_WS_URL` env vars.
- **Stores:** `walletStore` (wallet connection), `marketDataStore` (WebSocket-driven real-time market data), `currentPrice` (derived best price).
- **Trade components:** `src/lib/components/trade/` — OrderBook, OrderForm, PositionsTable, OrdersTable, PriceChart, TradesTable.
- **Prerendering:** Enabled globally in `src/routes/+layout.ts` — this is a fully static site.
- **Svelte 5 runes:** Forced on for all non-node_modules files in `svelte.config.js`. Use `$state`, `$derived`, `$effect` etc.
- **Theme:** Dark theme with XRP brand colors. CSS variables in `src/routes/layout.css`. Inter font (UI), JetBrains Mono (numbers/addresses).
- **Testing:** Vitest with two project configs — client tests use jsdom, server tests use node environment. Playwright available for browser tests.

## Code Style

- **Indentation:** Tabs (not spaces)
- **Quotes:** Single quotes
- **Trailing commas:** None
- **Print width:** 100 characters
- **Tailwind classes:** Auto-sorted by prettier-plugin-tailwindcss
- CI enforces formatting and linting on all PRs and pushes to main

## Environment

- Node.js 20+ required (`engine-strict=true`)
- Nix shell available (`shell.nix`) providing Node 22 + corepack + Rust toolchain
- ES modules only (`"type": "module"` in package.json)
- Environment variables use `VITE_` prefix for client-side access
- `VITE_API_URL` — override API base URL (default: `https://api-perp.ph18.io`)
- `VITE_WS_URL` — override WebSocket URL (default: `wss://api-perp.ph18.io/ws`)

## Backend Integration Notes

- **Auth:** All trading endpoints require XRPL secp256k1 signature (4 headers: Address, PublicKey, Signature, Timestamp). See [docs/BACKEND-API.md](docs/BACKEND-API.md#authentication).
- **Number format:** All prices/sizes are FP8 strings — exactly 8 decimal places (e.g. `"0.55000000"`). Server rejects numeric values.
- **WebSocket:** `wss://api-perp.ph18.io/ws` — auto-subscribed to public channels on connect. Subscribe to `user:rXXX` for per-user events. Stateless — re-subscribe on every reconnect.
- **Deposits:** Users send XRPL Payment to escrow address. Orchestrator auto-credits balance. No deposit API call from UI.
- **Leverage:** 1–20x. Order types: `limit`, `market`. Time in force: `gtc`, `ioc`, `fok`.
- **Vaults:** Market Making (low risk), Delta Neutral (medium risk), Delta One (higher risk, not yet live). See [docs/BACKEND-API.md](docs/BACKEND-API.md#vault-api-planned).
- **Market params:** XRP-RLUSD-PERP — max 20x leverage, 0.05% taker fee, 0% maker fee, 0.5% maintenance margin, 8h funding interval. See [docs/BACKEND-API.md](docs/BACKEND-API.md#market-parameters-xrp-rlusd-perp) for formulas.

## Upstream Documentation

Backend docs in [xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex):

- [docs/frontend-api-guide.md](https://github.com/77ph/xrpl-perp-dex/blob/master/docs/frontend-api-guide.md) — canonical API guide with signing examples (Python, Node.js, browser)
- [docs/vault-design-spec.md](https://github.com/77ph/xrpl-perp-dex/blob/master/docs/vault-design-spec.md) — vault type design, strategy parameters, revenue streams
- [docs/vault-design-followup.md](https://github.com/77ph/xrpl-perp-dex/blob/master/docs/vault-design-followup.md) — open design questions (share accounting, DB sync, orderbook persistence)
- [docs/vault-requirements.md](https://github.com/77ph/xrpl-perp-dex/blob/master/docs/vault-requirements.md) — vault API contract (user, operator, admin endpoints)
- [DEPLOYMENT.md](https://github.com/77ph/xrpl-perp-dex/blob/master/DEPLOYMENT.md) — architecture overview, port summary, endpoint whitelist
