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
│  XRPL Mainnet                                               │
│  ├── RLUSD collateral (SignerListSet escrow)                │
│  ├── P&L settlement                                         │
│  └── Deposit / withdrawal transactions                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Properties

- **Anti-MEV**: orders encrypted with enclave's attested public key; operator sees only ciphertext
- **RLUSD-native**: all collateral, settlement, and fees denominated in RLUSD on XRPL
- **DCAP Attestation**: Intel-signed proof that enclave runs genuine, untampered code
- **XRPL Multisig**: 2-of-3 SignerListSet — no single operator can steal funds
- **No sidechain**: settles directly on XRPL L1

## Implementation status

| Feature                                      | Route     | Status      |
| -------------------------------------------- | --------- | ----------- |
| Wallet connect (GemWallet, Crossmark, Xaman) | `/`       | Done        |
| Verify Enclave (DCAP attestation)            | `/verify` | Done        |
| Trading interface                            | —         | Not started |
| Market data display                          | —         | Not started |
| Portfolio / positions                        | —         | Not started |
| Vault management                             | —         | Not started |

## What the UI needs to implement

### Authentication flow

1. User has an XRPL secp256k1 keypair (seed → private key + public key → r-address)
2. For each API request, sign the body (POST) or path (GET) with SHA-256 + ECDSA
3. Include `X-XRPL-Address`, `X-XRPL-PublicKey`, `X-XRPL-Signature`, `X-XRPL-Timestamp` headers
4. Timestamp must be within 30 seconds of server time

### Real-time data

- Connect to `wss://api-perp.ph18.io/ws` for live market data
- Default channels: `trades`, `orderbook`, `ticker`, `liquidations`
- Subscribe to `user:rXXX` for fills, order updates, position changes
- Re-subscribe on every reconnect (server is stateless across connections)

### Deposit flow

- User sends XRPL Payment to the escrow address
- Orchestrator auto-detects and credits balance (no API call needed from UI)
- UI polls `GET /v1/account/balance` or listens for `position_changed` WS events

### Trading

- Market: `XRP-RLUSD-PERP`
- All prices/sizes in FP8 string format (8 decimal places)
- Leverage: 1–20x
- Order types: limit, market
- Time in force: GTC, IOC, FOK

## Related repositories

| Repo                                                                   | Description                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------- |
| [xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex)                 | Orchestrator (Rust) — trading API, order book, P2P |
| [xrpl-perp-dex-enclave](https://github.com/77ph/xrpl-perp-dex-enclave) | SGX enclave — margin engine, key custody, DCAP     |
