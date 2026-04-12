# Hackathon Application — XPerp

**Presentation:** https://github.com/LemonTreeTechnologies/perp-dex-ui/blob/main/docs/presentation.html

## Short Description (200 chars max)

XPerp is the first perpetual futures DEX on XRPL. Trade XRP with up to 20x leverage using your own wallet. Funds secured by 2-of-3 SGX multisig, settled natively on-chain. No bridges, no CEX custody.

## Description (5000 chars max)

XPerp brings perpetual futures trading to the XRP Ledger for the first time. Millions of XRP holders today have no way to trade leveraged derivatives on their own chain — they must send assets to centralized exchanges or bridge to other blockchains. XPerp eliminates both of those compromises by building directly on XRPL with native XRP settlement.

### What we built

XPerp is a fully functional perpetual futures exchange running on XRPL Mainnet. Users connect their XRPL wallet (Crossmark or GemWallet), deposit funds to an on-chain escrow account, and trade the XRP-PERP market with up to 20x leverage. The system supports limit and market orders, long and short positions, and real-time order book, price charts, and WebSocket feeds.

The system consists of three layers working together:

A Rust orchestrator runs the central limit order book (CLOB) with price-time priority matching, processes authenticated orders signed by XRPL wallets, monitors the XRPL ledger for deposits, fetches live prices from Binance, applies funding rates every 8 hours, runs a liquidation scanner, and broadcasts real-time market data over WebSocket.

An Intel SGX enclave handles all security-critical computation inside a hardware-isolated trusted execution environment. The margin engine verifies every position. Private keys are generated and held inside the CPU — they never exist in software. XRPL withdrawal transactions are signed inside the enclave using 2-of-3 multisig across three independent enclaves operated on separate infrastructure (Hetzner bare metal + Azure DCsv3). No single operator can move user funds. The enclave's code integrity is verifiable by anyone through Intel DCAP remote attestation.

Settlement happens directly on the XRP Ledger. User deposits are standard XRPL Payment transactions to the escrow account, detected automatically by the orchestrator. Withdrawals are multisigned XRPL transactions constructed and signed inside the SGX enclaves, then submitted to the ledger. Everything settles in 3-5 seconds at negligible cost.

### What makes XPerp different

We do not use smart contracts — XRPL doesn't have them. Instead, we use a Trusted Execution Environment (TEE) as a "smart contract in hardware." This eliminates the entire class of smart contract exploits that have cost DeFi billions: reentrancy attacks, oracle manipulation, flash loan exploits, and governance takeovers. The Drift Protocol hack on Solana in April 2026 drained $280M not through a code bug but through social engineering of multisig signers. In XPerp's architecture, the signers are SGX enclaves — processors that cannot be social-engineered.

XRPL native settlement means no bridges, no wrapped tokens, and no L2 withdrawal delays. Funds stay on the ledger at all times. The 2-of-3 multisig with master key disabled means there is no admin key that can be compromised.

### Automated market making

An automated Market Making vault is running live on the platform, providing two-sided liquidity to the order book and earning spread plus fee rebates. A Delta Neutral vault (hedged positions, funding rate capture) and a Delta One vault (interest rate arbitrage) are planned. These vaults bootstrap exchange liquidity from day one.

### Partnership with My Neobank

During the hackathon, we formed a partnership with My Neobank (MYNB) to solve the fiat on-ramp/off-ramp problem that every DEX faces. MYNB provides SEPA, SEPA Instant, and SWIFT rails for EUR/USD/GBP, along with a KYC/AML-verified user base (Sumsub, Travel Rule compliant, FINTRAC-registered). XPerp users coming through MYNB get compliant fiat-to-crypto conversion and an IBAN account to park profits between trades. This gives XPerp a complete user journey: fiat deposit, crypto trading, fiat withdrawal — all without touching a centralized exchange.

### The market opportunity

Perpetual futures are the largest product category in crypto — $92.9 trillion in volume in 2025. Decentralized perp DEX volume reached $6.7 trillion, growing 346% year over year. Every major blockchain has its perps DEX: Ethereum has dYdX, Solana has Jupiter, Hyperliquid built its own chain. XRPL — with its speed, low cost, and one of crypto's largest communities — has zero share of this market. XPerp captures it.

### What's live today

The complete system is deployed and running on XRPL Mainnet:

- Perpetual futures trading (XRP-PERP, native XRP collateral, up to 20x leverage)
- XRPL wallet integration with signature authentication (Crossmark, GemWallet)
- Real-time order book, price chart, trade history, and WebSocket feed
- Portfolio management with balance display, deposits, and withdrawals
- Intel SGX enclave with DCAP remote attestation (verifiable by anyone)
- 2-of-3 multisig escrow across 3 independent SGX enclaves
- Market Making vault live (Delta Neutral and Delta One planned)
- Funding rate mechanism (8-hour intervals) and liquidation engine
- Full web UI at perp.ph18.io with "How It Works" and "Verify Enclave" pages

## Technical Description (1000 chars max)

Three-layer architecture: SvelteKit frontend, Rust orchestrator, Intel SGX enclave. The orchestrator runs a CLOB with price-time priority, processes XRPL secp256k1 signature-authenticated orders, monitors XRPL for deposits (1s), fetches Binance prices (5s), applies funding (8h), broadcasts via WebSocket. The SGX enclave (C/C++) runs 11 ecalls: margin checks, position management, ECDSA key custody, XRPL multisig signing, sealed state, DCAP attestation. Funds in XRPL escrow with 2-of-3 SignerListSet across 3 independent enclaves (Hetzner + 2x Azure DCsv3), master key disabled. Settlement on XRPL Mainnet in native XRP — deposits via Payment tx, withdrawals via enclave-signed multisig tx. Dual-mode auth: SHA-256 (CLI) and SHA-512Half (browser wallets). P2P order replication via libp2p gossipsub for multi-operator failover. Market making vault provides CLOB liquidity (delta neutral + delta one planned). Frontend: Svelte 5, Tailwind CSS, TypeScript. 14MB Rust binary, ~5ms per ecall.

---

_Note: Andrey has been contributing remotely due to personal circumstances._
