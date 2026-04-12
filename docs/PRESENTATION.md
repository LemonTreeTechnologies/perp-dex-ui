---
marp: true
theme: default
paginate: true
backgroundColor: #111112
color: #e0e0e1
style: |
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  h1 {
    color: #00AAE4;
    font-size: 1.8em;
  }
  h2 {
    color: #00AAE4;
    font-size: 1.6em;
  }
  strong {
    color: #ffffff;
  }
  a {
    color: #4da6ff;
  }
  code {
    background: #1a1a2e;
    color: #00AAE4;
  }
  pre {
    background: #1e1e28 !important;
    color: #b0b0c0;
  }
  pre code {
    background: transparent !important;
    color: #b0b0c0;
  }
  blockquote {
    border-left: 4px solid #00AAE4;
    background: #232325;
    padding: 0.5em 1em;
    font-style: normal;
    color: #a2a2a4;
    font-size: 0.85em;
  }
  table {
    font-size: 0.95em;
  }
  th {
    background: #1a1a2e;
    color: #00AAE4;
  }
  td {
    background: #111118;
  }
  section.lead h1 {
    font-size: 2.8em;
    text-align: center;
  }
  section.lead p {
    text-align: center;
    font-size: 1.2em;
  }
  section.lead img {
    display: block;
    margin: 0 auto;
    max-height: none;
  }
  em {
    color: #aaaacc;
    font-style: normal;
  }
---

<!-- _class: lead -->

<div style="text-align: center;">
<img src="https://xperp.fi/logo.svg" alt="XPerp" width="480" />
</div>

**The First Perpetual Futures DEX on XRPL**

_Hack the Block · Paris · April 2026_

---

# The Problem

Those who want leverage -> Leave the Ledger.

**The demand exists, leaving the community no choice but to let their liquidity leave the ledger.**

---

# The Market

**Perpetual futures are the single largest product in crypto.**

| Metric                    | Value                        |
| ------------------------- | ---------------------------- |
| Total perp volume (2025)  | **$92.9 trillion**           |
| Decentralized perp volume | **$6.7 trillion** (346% YoY) |
| XRPL's share              | **0%**                       |

Every major chain has its perps DEX:

| Ethereum | Solana  | Custom L1                   | **XRPL**                |
| -------- | ------- | --------------------------- | ----------------------- |
| dYdX     | Jupiter | Hyperliquid ($9B valuation) | **Nothing — until now** |

---

# The Solution

**XPerp: perpetual futures built directly on the XRP Ledger.**

- **Orchestrator**
- **SGX Enclave**
- **XRPL**

```
XRPL Wallet ──► Orchestrator (Rust) ──► SGX Enclave ──► XRPL Mainnet
                  │ CLOB order book       │ Margin engine    │ XRP settlement
                  │ Price feed (5s)       │ Key custody      │ 2-of-3 multisig
                  │ Funding + liquidation │ DCAP attestation │ 3-5s finality
                  └ WebSocket feed        └ Hardware-isolated
```

---

# Why TEE, Not Smart Contracts

**XRPL has no smart contracts. We use hardware instead.**

|                | Smart Contract DEX               | XPerp (TEE)                  |
| -------------- | -------------------------------- | ---------------------------- |
| Custody        | Bridge multisig (people)         | **XRPL escrow (processors)** |
| Verification   | Public Solidity                  | **DCAP attestation (Intel)** |
| Attack surface | Logic exploits, MEV, flash loans | Hardware side-channels       |
| Settlement     | L2 → L1 (minutes to days)        | **3-5 sec on XRPL**          |
| Signers        | Humans (social-engineerable)     | **SGX enclaves (not)**       |

> Smart contracts are public but exploitable. **Our code is private but verifiable.**

---

# Liquidity Vaults

Revenue streams: spread earnings + fee rebates + funding rate payments.

| Vault             | Strategy                                | Status   |
| ----------------- | --------------------------------------- | -------- |
| **Market Making** | Two-sided orders around mid price       | **Live** |
| **Delta Neutral** | Hedged liquidity, funding rate capture  | Planned  |
| **Delta One**     | Interest rate vs funding rate arbitrage | Planned  |

**Protocol-level fee rebates**

---

<!-- _class: lead -->

# Try It Now

**<a href="https://xperp.fi" target="_blank">xperp.fi</a>**

<a href="https://xperp.fi/verify" target="_blank">Verify the Enclave</a> · <a href="https://api-perp.ph18.io" target="_blank">API</a> · <a href="https://github.com/LemonTreeTechnologies/perp-dex-ui" target="_blank">Frontend and UI</a> · <a href="https://github.com/LemonTreeTechnologies/xrpl-perp-dex" target="_blank">Orchestrator</a>

_XPerp Team · Hack the Block Paris · April 2026_
