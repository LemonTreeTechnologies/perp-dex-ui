# XPerp — Product Pitch

## The Hook

XRP is a top-3 crypto asset with millions of active wallets. Zero of them can trade perpetual
futures on their own chain. We're the first to build it.

## The Problem

XRP holders who want leveraged trading have exactly two options — and both mean leaving XRPL.

**Option 1: Centralized exchanges.** Send your XRP to Binance, Bybit, or OKX. Hand over custody
of your assets to trade an instrument that should exist natively. Hope they're not the next FTX.

**Option 2: Bridge to another chain.** Pay gas fees, learn a new ecosystem, and hope the bridge
doesn't get hacked. Your XRP becomes wrapped tokens on someone else's ledger.

If you're bullish on XRP and want leverage — you leave XRPL. If you're bearish and want to
hedge — you leave XRPL. There is no way to express a leveraged view on XRP without abandoning
the ecosystem. The demand exists. Go look at the community discussions — people want leverage,
shorts, hedging tools. The volume leaks to centralized exchanges and other chains every single day.

## The Solution

XPerp is perpetual futures trading built directly on the XRP Ledger.

Connect your XRPL wallet. Deposit RLUSD. Open leveraged long or short positions — up to 20x.
Your assets stay on the ledger. Settlement in 3-5 seconds. Transaction costs under a cent.

- No bridge risk
- No CEX custody risk
- No smart contract exploits
- Just trading

## How It Works

```
Your XRPL wallet
      |
      v
XPerp Orchestrator (Rust)
  - CLOB order book with price-time priority matching
  - Real-time Binance price feed
  - WebSocket market data
      |
      v
Intel SGX Enclave (hardware-secured)
  - Margin engine — checks every position
  - Private keys never leave the CPU
  - DCAP attestation — anyone can verify the code
      |
      v
XRPL Testnet (mainnet planned)
  - RLUSD settlement
  - 2-of-3 multisig escrow — no single operator controls funds
```

**What makes this different from a CEX:**
Your funds are held in an XRPL escrow account protected by a 2-of-3 multisig across three
independent Intel SGX enclaves run by separate operators. No single party can move your money.
The master key is disabled. Private keys are generated and held inside hardware — they never
exist in software. Anyone can verify the enclave is running genuine code through Intel DCAP
remote attestation.

**What makes this different from other DEXs:**
We don't use smart contracts. XRPL doesn't have them. Instead, we use a Trusted Execution
Environment (TEE) — Intel SGX hardware that runs verified code in an isolated enclave. The
operator cannot see or tamper with the computation. This eliminates the entire class of smart
contract exploits that have cost DeFi billions (reentrancy, oracle manipulation, flash loan
attacks, governance takeovers).

## Why XRPL

We're not porting an EVM perps protocol to yet another chain. We're building for XRPL because:

- **Speed:** 3-5 second settlement, no block confirmation delays
- **Cost:** Transaction fees under $0.01 — viable for active trading
- **RLUSD:** Ripple's regulated stablecoin gives traders a stable margin asset without
  leaving the ecosystem
- **Community:** One of the most loyal and largest communities in crypto, underserved by DeFi
- **Native infrastructure:** XRPL has had a protocol-level DEX since 2012 — the ecosystem
  understands on-chain trading

## The Market

Perpetual futures are the single largest product in crypto.

| Metric                           | Value          | Source                                                                                                                                                   |
| -------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total perp futures volume (2025) | $92.9 trillion | [HHPTY](https://www.hhpty.com/xrpl-wants-a-hyperliquid-like-sidechain-for-the-40b-options-trading-market-but-one-design-choice-could-decide-everything/) |
| Decentralized perp volume (2025) | $6.7 trillion  | Same source                                                                                                                                              |
| Decentralized perp YoY growth    | 346%           | Same source                                                                                                                                              |
| XRPL's share of perp market      | 0%             | —                                                                                                                                                        |

XRPL — with its speed, cost, and community — has zero share of this market today. XPerp
captures it.

## The Moat

**First mover on XRPL derivatives.** There is no other perpetual futures protocol on the XRP
Ledger. The XRPL community has been waiting for DeFi on their own chain.

We're not competing with Hyperliquid for Ethereum traders or Jupiter for Solana traders. We're
serving an entirely underserved audience that already exists — millions of XRP holders with no
native derivatives access.

**Hardware-verified security.** Our SGX enclave architecture means the code running the margin
engine is verifiable by anyone through Intel DCAP attestation. No other perp DEX offers this
level of computational transparency.

**XRPL-native settlement.** No bridges, no wrapped tokens, no L2 withdrawal delays. Deposits
and withdrawals settle directly on XRPL L1 in seconds.

## The Close

Every major blockchain has its perps DEX.

| Chain     | Perps DEX               |
| --------- | ----------------------- |
| Ethereum  | dYdX                    |
| Solana    | Jupiter                 |
| Custom L1 | Hyperliquid             |
| **XRPL**  | **Nothing — until now** |

## What's Live Today

- Perpetual futures trading on XRPL Testnet (XRP-RLUSD-PERP)
- Up to 20x leverage, limit and market orders
- XRPL wallet integration (Crossmark, GemWallet)
- Real-time order book, price chart, WebSocket feed
- Intel SGX enclave with DCAP remote attestation
- 2-of-3 multisig escrow — no single operator controls funds
- Automated market making and delta-neutral vaults running
- Funding rate mechanism (8-hour intervals)
- Liquidation engine

**Live API:** `https://api-perp.ph18.io`
**Verify Enclave:** `https://perp.ph18.io/verify`

---

_Sources:_

- _Perp market statistics: [HHPTY — XRPL derivatives analysis](https://www.hhpty.com/xrpl-wants-a-hyperliquid-like-sidechain-for-the-40b-options-trading-market-but-one-design-choice-could-decide-everything/)_
- _XRP wallet count: [XRPScan](https://xrpscan.com/balances) (verify current number before publishing)_
