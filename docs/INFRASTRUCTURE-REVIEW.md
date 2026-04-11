# Infrastructure Review — Documentation vs Reality

Review date: 2026-04-11 (Hack the Block Paris)

This document flags differences between what the UI documentation describes and what is actually deployed and working right now. Use it to avoid showing users claims that aren't backed by running code.

---

## Currently Working (confirmed live)

| Component | Status |
|---|---|
| Orchestrator (Rust) on Hetzner | Running, sequencer |
| SGX Enclave on Hetzner | Running (SGX enabled, but no DCAP attestation on this hardware) |
| 3 Azure DCsv3 enclaves (node-1, node-2, node-3) | All 3 running, reachable via SSH tunnels |
| DCAP attestation | Working — proxied from Hetzner nginx to Azure node-1 |
| 2-of-3 multisig withdrawal | Working — Hetzner collects signatures from Azure enclaves |
| XRPL testnet deposit monitoring | Working — auto-credits on Payment to escrow |
| Order book (CLOB) | Working — 3-level pyramid (38/76/152 XRP) |
| Market Making vault (vault:mm) | Running |
| Delta Neutral vault (vault:dn) | Running |
| WebSocket (trades, orderbook, ticker) | Working |
| XRPL wallet signing (Crossmark/GemWallet) | Working — server supports SHA-512Half dual-mode verification |
| Funding rate application (8h interval) | Working |
| Liquidation scanner | Working |

---

## Issues Found in Documentation

### 1. "XRPL Mainnet" — actually testnet

**File:** `docs/ARCHITECTURE.md`, line 43

The architecture diagram says "XRPL Mainnet". We are currently running on **XRPL Testnet**. The escrow address `r33cKcGyCZH6x2RRxmSkVfcjKHX3Z3pPEh` is a testnet address.

**Impact:** Users might think real funds are at stake. The UI should clearly indicate testnet mode.

### 2. "Anti-MEV: orders encrypted with enclave's attested public key" — not implemented

**File:** `docs/ARCHITECTURE.md`, line 51

Order encryption is a planned feature. Currently, orders are submitted in plaintext over HTTPS. The enclave does not yet have an order encryption ecall.

**Impact:** Do not advertise MEV protection in user-facing UI copy. The HTTPS transport layer provides basic confidentiality, but the operator (orchestrator) can see order contents before they reach the enclave.

### 3. Signing examples use raw private key — Crossmark doesn't expose it

**File:** `docs/BACKEND-API.md`, lines 43-64

The JavaScript signing example uses `ethers.SigningKey(PRIVATE_KEY)`, but browser wallet extensions (Crossmark, GemWallet) do not expose the private key. They provide a `sign()` method that internally applies SHA-512Half before ECDSA.

The server has been patched to accept both:
- **Mode 1:** SHA-256 direct (Python/CLI clients with raw private key access)
- **Mode 2:** SHA-512Half wrapped (browser wallets — Crossmark `sdk.methods.signInAndWait()`)

A Crossmark-specific signing example should be added to the docs.

### 4. "Attestation Commitment" endpoint — does not exist

**File:** `docs/BACKEND-API.md`, lines 155-158

```
GET /v1/attestation/commitment
```

This endpoint is not implemented in the orchestrator. It is a leftover from the original SGX_project (Ethereum Sepolia on-chain state proof). Remove from documentation or mark as "not implemented".

### 5. "Collateral: RLUSD (100% LTV) + XRP (90% LTV)" — XRP collateral not implemented

**File:** `docs/BACKEND-API.md`, line 414

Currently only RLUSD deposits are supported (send XRP Payment to escrow, credited as margin). XRP as a separate collateral type with 90% LTV haircut is planned but not yet implemented in the enclave.

**Impact:** The UI should only show RLUSD deposit flow for now. Do not build XRP collateral UI yet.

### 6. Vault REST API — not implemented (internal only)

**File:** `docs/BACKEND-API.md`, lines 319-404

The vault endpoints (`/vaults/*`) are documented as "planned" — this is correct. The vaults run internally as automated strategies (vault:mm and vault:dn place orders on the CLOB), but there are no user-facing REST endpoints for vault deposits, withdrawals, or balance queries yet.

**Impact:** The vault pages in the UI should show vault performance data (readable from orderbook/trades), but deposit/withdraw functionality cannot be wired up until the API exists.

---

## Summary for UI Development

**Safe to build and wire up now:**
- Wallet connect (Crossmark, GemWallet) with SHA-512Half signing
- Deposit page (send XRPL Payment to `r33cKcGyCZH6x2RRxmSkVfcjKHX3Z3pPEh`, poll balance)
- Trading (submit order, cancel, positions, open orders)
- Order book display (real-time via WebSocket)
- Price chart (Binance feed + mark/index from ticker WebSocket)
- Verify Enclave page (DCAP attestation — already implemented)
- Withdrawal (POST /v1/withdraw with multisig)

**Not ready for UI yet:**
- XRP collateral (only RLUSD works)
- Vault user deposits/withdrawals (no REST API)
- Order encryption / anti-MEV
- Attestation commitment (Sepolia proof)
