# System Architecture

This document describes how the UI fits into the overall xrpl-perp-dex system.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  This repo: perp-dex-ui (SvelteKit static site)            │
│  ├── Trading interface (order entry, order book, positions) │
│  ├── Market data display (ticker, trades, charts)           │
│  ├── Vault management (deposit, withdraw, share prices)     │
│  ├── XRPL wallet integration (secp256k1 signing)           │
│  └── WebSocket real-time feed                               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS + WSS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator (Rust) — api-perp.ph18.io                     │
│  ├── Order book (CLOB, price-time priority matching)        │
│  ├── XRPL signature authentication                          │
│  ├── Binance XRP/USDT price feed (5s interval)              │
│  ├── XRPL deposit monitoring (1s interval)                  │
│  ├── Liquidation scanner (10s interval)                     │
│  ├── Funding rate application (every 8 hours)               │
│  ├── P2P replication (libp2p gossipsub)                     │
│  └── WebSocket server (trades, orderbook, ticker, fills)    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (localhost only)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  SGX Enclave (C/C++) — separate repo                        │
│  ├── Margin engine (11 ecalls)                              │
│  ├── ECDSA key custody                                      │
│  ├── DCAP remote attestation                                │
│  ├── XRPL multisig signing (2-of-3)                         │
│  └── Sealed state persistence                               │
└────────────────────┬────────────────────────────────────────┘
                     │ XRPL native multisig
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  XRPL Testnet (mainnet planned)                              │
│  ├── RLUSD collateral (SignerListSet escrow)                │
│  ├── P&L settlement                                         │
│  └── Deposit / withdrawal transactions                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Properties

- **Anti-MEV** _(planned, not yet implemented)_: order encryption with enclave's attested public key. Currently orders are plaintext over HTTPS — the operator can see order contents.
- **RLUSD-native**: all collateral, settlement, and fees denominated in RLUSD on XRPL
- **DCAP Attestation**: Intel-signed proof that enclave runs genuine, untampered code
- **XRPL Multisig**: 2-of-3 SignerListSet — no single operator can steal funds
- **No sidechain**: settles directly on XRPL L1

## Implementation status

| Feature                                      | Route        | Status                                                            |
| -------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| Wallet connect (GemWallet, Crossmark, Xaman) | `/`          | Done                                                              |
| Verify Enclave (DCAP attestation)            | `/verify`    | Done                                                              |
| How It Works (about page)                    | `/about`     | Done — architecture diagram, multisig, DCAP, escrow link          |
| Trading page layout                          | `/trade`     | Done — 3-col layout (chart, orderbook, form) + bottom tabs        |
| Price chart (Binance XRPUSDT candles)        | `/trade`     | Done — 500-min SVG chart, 30s refresh, funding rate display       |
| Order book (real-time bids/asks)             | `/trade`     | Done — top 10 levels, depth bars, size/value toggle               |
| Trade history (recent market trades)         | `/trade`     | Done — last 20 trades from WebSocket                              |
| Order form (long/short, limit/market)        | `/trade`     | Done — UI complete, **auth TODO**                                 |
| Positions table                              | `/trade`     | Done — UI complete, **auth TODO**                                 |
| Open orders table                            | `/trade`     | Done — UI complete, **auth TODO**                                 |
| Portfolio (balance, deposit, withdraw)       | `/portfolio` | Done — balance display, XRP deposit instructions, withdrawal form |
| XRPL signature auth                          | —            | Done — `src/lib/utils/xrplAuth.ts` (Crossmark + GemWallet)        |
| Markets page                                 | `/markets`   | Placeholder                                                       |
| Vault management                             | —            | Not started                                                       |

## Frontend architecture

### API layer (`src/lib/api/client.ts`)

Typed API client wrapping all backend endpoints:

- **`api.*`** — public endpoints (no auth): `getOrderBook`, `getTicker`, `getTrades`, `getMarkets`, `getFundingRate`
- **`authApi.*`** — authenticated endpoints: `getBalance`, `getOrders`, `submitOrder`, `cancelOrder`, `cancelAllOrders`, `withdraw`, `getTransactions`
- **`createWebSocket()`** — WebSocket connection factory
- **`toFP8()` / `fromFP8()`** — FP8 string conversion helpers

Base URL: `VITE_API_URL` env var or `https://api-perp.ph18.io` default.
WebSocket: `VITE_WS_URL` env var or `wss://api-perp.ph18.io/ws` default.

### Stores

| Store             | File                           | Purpose                                                                                                                                     |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `walletStore`     | `src/lib/stores/wallet.ts`     | Wallet connection state (address, publicKey, isConnected)                                                                                   |
| `marketDataStore` | `src/lib/stores/marketData.ts` | WebSocket-driven real-time market data (ticker, trades, orderbook, connection status). Also fetches initial orderbook via REST as fallback. |
| `currentPrice`    | `src/lib/stores/marketData.ts` | Derived store — best available price (mark > mid > last trade)                                                                              |

### Auth utility (`src/lib/utils/xrplAuth.ts`)

Generates `X-XRPL-*` auth headers for authenticated API calls. Signs with the connected wallet (Crossmark or GemWallet). Uses `@noble/hashes` for SHA-256 hashing. Key exports:

- **`generateAuthHeaders(method, pathOrBody)`** — core function, returns all 4 auth headers
- **`generateGetAuthHeaders(path)`** — convenience wrapper for GET requests
- **`generatePostAuthHeaders(body)`** — convenience wrapper for POST/DELETE requests

### Trade components (`src/lib/components/trade/`)

| Component               | Data source                                                                | Auth required         |
| ----------------------- | -------------------------------------------------------------------------- | --------------------- |
| `PriceChart.svelte`     | Binance API (XRPUSDT klines) + `api.getFundingRate()`, 30s poll            | No                    |
| `OrderBook.svelte`      | `marketDataStore.orderbook` (WebSocket) + REST fallback, size/value toggle | No                    |
| `TradesTable.svelte`    | `marketDataStore.trades` (WebSocket)                                       | No                    |
| `OrderForm.svelte`      | `walletStore` + `currentPrice`                                             | Yes — uses `xrplAuth` |
| `PositionsTable.svelte` | `authApi.getBalance`                                                       | Yes — uses `xrplAuth` |
| `OrdersTable.svelte`    | `authApi.getOrders`                                                        | Yes — uses `xrplAuth` |

### Theme

Dark theme with XRP brand colors. CSS variables defined in `src/routes/layout.css`:

- Primary: `#00AAE4` (XRP blue), dark backgrounds `#0A0A0A` / `#121212` / `#1A1A1A`
- Fonts: Inter (UI), JetBrains Mono (addresses/numbers)
- Glow effects: `.xrp-glow` (text), `.xrp-glow-box` (containers)

## What the UI still needs

### XRPL signature authentication (main blocker)

Two auth methods are available — **session token is recommended** for browser wallets:

1. **Session token (recommended):** Call `POST /v1/auth/login` once with Crossmark/GemWallet signature → get a Bearer token valid 30 min → use `Authorization: Bearer <token>` on all subsequent requests. No more signing needed until token expires.
2. **Per-request signing:** Sign every request with 4 XRPL headers (SHA-256 + ECDSA). Server accepts both direct SHA-256 and SHA-512Half-wrapped signatures (Crossmark/GemWallet compatible).

See [BACKEND-API.md](BACKEND-API.md#authentication) for full details and code examples.

### Deposit flow

- User sends XRPL Payment to the escrow address
- Orchestrator auto-detects and credits balance (no API call needed from UI)
- UI polls `GET /v1/account/balance` or listens for `position_changed` WS events

### Vault management

Not started — see [BACKEND-API.md](BACKEND-API.md#vault-api-planned) for planned endpoints.

## Related repositories

| Repo                                                                   | Description                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------- |
| [xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex)                 | Orchestrator (Rust) — trading API, order book, P2P |
| [xrpl-perp-dex-enclave](https://github.com/77ph/xrpl-perp-dex-enclave) | SGX enclave — margin engine, key custody, DCAP     |
