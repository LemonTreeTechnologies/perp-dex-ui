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
  em {
    color: #aaaacc;
    font-style: normal;
  }
---

<!-- _class: lead -->

# XPerp

**The First Perpetual Futures DEX on XRPL**

Native XRP settlement · 2-of-3 SGX multisig · Live on mainnet

_Hack the Block · Paris · April 2026_

---

# The Problem

**XRP is a top-3 crypto asset. Zero perpetual futures on its own chain.**

- Millions of XRP holders who want leverage → send assets to Binance, Bybit, OKX
- Want to hedge? → Same — leave XRPL, trust a CEX, hope it's not the next FTX
- Bridge to Ethereum? → Gas fees, MEV, bridge hacks, smart contract exploits

> Drift Protocol (Solana) drained for **$280M** — not a code bug, but social engineering of multisig signers. Smart contract custody has a people problem.

**The demand exists. The community is asking for it. The instrument doesn't exist.**

---

# Community Demand

**The XRPL ecosystem is actively asking for derivatives.**

Denis Angell (XRPL Labs engineer) shared a sidechain proposal for options trading — called it _"Something big."_ ChartNerdTA on X posted: **"HUGEEE!"**

That proposal targets **options** on a **new sidechain** with a bridge.

We target **perpetual futures** — a market **2,300x larger** ($92.9T vs $40B) — and we're **already live on XRPL mainnet**. No sidechain. No bridge.

> _"Almost entirely dominated by centralized exchanges and a handful of chains not built with derivatives in mind."_ — U.Today

---

# The Solution

**XPerp: perpetual futures built directly on the XRP Ledger.**

```
Your XRPL Wallet
      │
      ▼  (XRPL signature auth)
XPerp Orchestrator (Rust)
  ├── CLOB order book (price-time priority)
  ├── Binance price feed (5s)
  ├── Funding rates (8h) + liquidation scanner
  └── WebSocket real-time feed
      │
      ▼  (hardware-isolated)
Intel SGX Enclave
  ├── Margin engine (checks every position)
  ├── Private keys never leave the CPU
  └── DCAP attestation (anyone can verify)
      │
      ▼  (2-of-3 multisig)
XRPL Mainnet — native XRP settlement
```

---

# Why TEE, Not Smart Contracts

**XRPL has no smart contracts. We use hardware instead.**

|                   | Smart Contract DEX               | XPerp (XRPL + TEE)                         |
| ----------------- | -------------------------------- | ------------------------------------------ |
| Custody           | Bridge multisig (people)         | **XRPL escrow (processors)**               |
| Code verification | Public Solidity                  | **DCAP attestation (Intel)**               |
| Attack surface    | Logic exploits, MEV, flash loans | Hardware side-channels                     |
| Settlement        | L2 → L1 (minutes to days)        | **3-5 sec on XRPL**                        |
| Multisig signers  | Humans (social-engineerable)     | **SGX enclaves (not social-engineerable)** |

> Smart contracts are public but exploitable.
> **Our code is private but verifiable** — Intel DCAP attestation.

---

# Security Model

**2-of-3 SGX operator multisig protects your funds.**

- **No single operator** can move funds — requires 2 of 3 enclave signatures
- **Master key disabled** on the escrow account — only the SignerList can sign
- **Private keys generated inside SGX** — never exist in software, never leave the CPU
- **Operators geographically distributed** — Hetzner bare metal + 2x Azure DCsv3
- **DCAP remote attestation** — anyone can verify the enclave runs genuine code

Visit **[perp.ph18.io/verify](https://perp.ph18.io/verify)** to verify the enclave yourself.

---

# Liquidity Vaults

**A DEX is only as useful as its liquidity. We ship with it.**

| Vault             | Strategy                                | Risk   | Status   |
| ----------------- | --------------------------------------- | ------ | -------- |
| **Market Making** | Two-sided orders around mid price       | Low    | **Live** |
| **Delta Neutral** | Hedged liquidity, funding rate capture  | Medium | Planned  |
| **Delta One**     | Interest rate vs funding rate arbitrage | High   | Planned  |

**Protocol-level fee rebates:** Vaults receive rebates on filled orders that regular traders don't — making vault-provided liquidity structurally profitable.

Revenue streams: spread earnings + fee rebates + funding rate payments.

---

# Why XRPL

| Feature          | Value                                         |
| ---------------- | --------------------------------------------- |
| Settlement speed | **3-5 seconds**                               |
| Transaction cost | **< $0.01**                                   |
| Collateral       | **Native XRP** (RLUSD planned for production) |
| DEX heritage     | Protocol-level order book since 2012          |
| Community        | One of the largest and most loyal in crypto   |

> _"A project that uses XRPL escrow, multisig, RLUSD natively scores higher than one that just processes a payment."_ — XRPL Commons

**We use everything XRPL has, the way it was meant to be used.**

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

# Partnership: XPerp + My Neobank

**The missing piece for every DEX: fiat rails.**

| MYNB Brings                      | XPerp Gets                                            |
| -------------------------------- | ----------------------------------------------------- |
| SEPA / SEPA Instant / SWIFT      | Fiat on-ramp and off-ramp — no CEX middleman          |
| Sumsub KYC, Travel Rule, FINTRAC | Compliance-ready user base from day one               |
| Real IBAN accounts (EUR)         | Users park profits in a bank account, not an exchange |
| 4IRE (200+ engineers)            | Integration capacity for wallet linking + settlement  |

```
Fiat (EUR) → My Neobank → XRP → XPerp (trade) → XRP profits → My Neobank → EUR (bank)
```

**Complete user journey: bank to trade to bank. No centralized exchange involved.**

---

# What's Live Today

| Component                         | Tech                            | Status              |
| --------------------------------- | ------------------------------- | ------------------- |
| Perpetual futures (XRP-PERP, 20x) | Rust CLOB                       | **Live on mainnet** |
| XRPL wallet auth                  | secp256k1 + Crossmark/GemWallet | **Live**            |
| SGX margin engine                 | C/C++ in Intel SGX              | **Live**            |
| 2-of-3 multisig withdrawal        | XRPL SignerListSet              | **Live**            |
| DCAP attestation                  | Azure DCsv3                     | **Verified**        |
| Market Making vault               | Automated strategy              | **Live**            |
| Price feed                        | Binance XRP/USDT, 5s            | **Live**            |
| WebSocket                         | Trades, orderbook, ticker       | **Live**            |
| Funding rate + liquidation        | 8h intervals + 10s scan         | **Live**            |
| Full web UI                       | SvelteKit + Tailwind            | **Live**            |

**130 automated tests · 52 audit findings closed · Open source (BSL 1.1)**

---

# Why This Wins

**Innovation:** First perpetual DEX on XRPL. TEE instead of smart contracts — a new security paradigm.

**Execution:** Not a prototype. Live API, live trading, live vaults. Deployed on mainnet with real infrastructure across 4 servers.

**Impact:** Unlocks leveraged trading for millions of XRP holders without leaving their chain.

**Native XRPL:** SignerListSet, escrow, native XRP — used the way they were designed.

**Partnership:** Fiat on-ramp/off-ramp with My Neobank completes the user journey from bank account to leveraged trade and back.

---

<!-- _class: lead -->

# Try It Now

**[perp.ph18.io](https://perp.ph18.io)**

Verify the enclave: [perp.ph18.io/verify](https://perp.ph18.io/verify)
API: [api-perp.ph18.io](https://api-perp.ph18.io)
Source: [github.com/77ph/xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex)

_XPerp Team · Hack the Block Paris · April 2026_
