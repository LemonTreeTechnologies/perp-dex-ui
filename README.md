# XPerp — Perpetual Futures DEX on XRPL

<div align="center">

**The first perpetual futures exchange built natively on the XRP Ledger**

[Live App](https://xperp.fi) • [Documentation](#documentation) • [Architecture](docs/ARCHITECTURE.md) • [API Reference](docs/BACKEND-API.md)

</div>

---

## 🎯 What is XPerp?

XPerp brings perpetual futures trading to the XRP Ledger. Trade XRP with up to **20x leverage** using your own wallet. Funds are secured by Intel SGX hardware enclaves with **2-of-3 multisig** and settled natively on-chain — no bridges, no wrapped tokens, no CEX custody.

**Live on XRPL Mainnet:** Connect your wallet, deposit XRP, and start trading in minutes.

### Key Features

- ⚡ **Native XRPL Settlement** — 3-5 second finality, < $0.01 transaction costs
- 🔐 **Hardware-Secured** — Intel SGX Trusted Execution Environment with DCAP attestation
- 🔑 **Non-Custodial** — 2-of-3 multisig across independent enclaves, master key disabled
- 📊 **Full DEX Features** — Real-time order book, price charts, WebSocket feeds, market data
- 🎨 **Seamless UX** — Wallet integration (Crossmark, GemWallet), instant order execution
- 🤖 **Automated Liquidity** — Built-in market making vaults bootstrap exchange from day one

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- XRPL wallet (Crossmark or GemWallet browser extension)

### Installation

```bash
# Clone the repository
git clone https://github.com/LemonTreeTechnologies/perp-dex-ui.git
cd perp-dex-ui

# Install dependencies
make install

# Start development server
make dev
```

The app will be running at `http://localhost:5173`

### Build for Production

```bash
# Build static site
make build
```

---

## 📁 Project Structure

```
src/
├── routes/              # SvelteKit pages
│   ├── +page.svelte     # Home / wallet connection
│   ├── trade/           # Trading interface
│   ├── portfolio/       # Balance, deposits, withdrawals
│   ├── vaults/          # Market making vaults
│   ├── verify/          # SGX attestation verification
│   └── about/           # How it works
├── lib/
│   ├── api/             # Typed API client + WebSocket
│   ├── components/      # Reusable Svelte components
│   ├── stores/          # State management (wallet, auth, market data)
│   └── utils/           # XRPL authentication helpers
└── app.html             # HTML template
```

---

## 🛠 Tech Stack

### Frontend

- **[SvelteKit](https://kit.svelte.dev/)** — SSG with static adapter
- **[Svelte 5](https://svelte.dev/)** — Runes API (`$state`, `$derived`, `$effect`)
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **TypeScript** — Strict mode with full type coverage

### Integrations

- **[@crossmarkio/sdk](https://www.npmjs.com/package/@crossmarkio/sdk)** — Crossmark wallet support
- **[@noble/hashes](https://www.npmjs.com/package/@noble/hashes)** — Cryptographic hashing for XRPL auth
- **WebSocket API** — Real-time market data (trades, orderbook, ticker)

### Testing & Tooling

- **Vitest** — Unit testing with browser mode
- **Playwright** — E2E testing
- **ESLint** + **Prettier** — Code quality and formatting
- **svelte-check** — TypeScript validation

---

## 📜 Available Commands

| Command        | Description                      |
| -------------- | -------------------------------- |
| `make install` | Install dependencies             |
| `make dev`     | Start development server         |
| `make build`   | Build static site for production |
| `make lint`    | Run ESLint + Prettier checks     |
| `make fmt`     | Auto-format code with Prettier   |
| `make all`     | Format, lint, and build          |
| `make docs`    | Generate presentation HTML       |

**Docker commands:**

```bash
make docker-dev   # Run development server with Docker
make docker-prod  # Build and deploy production with Docker
```

---

## 🐳 Docker Deployment

### Production (with automatic HTTPS)

```bash
# Build and run with Caddy (automatic Let's Encrypt)
make docker-prod
```

**Production features:**

- Serves at **xperp.fi** and **www.xperp.fi**
- Automatic HTTPS with Let's Encrypt SSL certificates
- Auto-renewing certificates
- Gzip compression and security headers

### Development

```bash
# Run with hot reload
make docker-dev
```

---

## 🏗 System Architecture

```
┌─────────────────────┐
│   perp-dex-ui       │  ← This repo
│   (SvelteKit SPA)   │
└──────────┬──────────┘
           │ HTTPS + WSS
           ▼
┌─────────────────────┐
│  xrpl-perp-dex      │  Rust orchestrator
│  (Orchestrator)     │  - CLOB order matching
│                     │  - Price feeds
└──────────┬──────────┘  - WebSocket server
           │
           ▼
┌─────────────────────┐
│   SGX Enclave       │  Hardware-secured
│   (TEE)             │  - Margin engine
│                     │  - Key custody
└──────────┬──────────┘  - DCAP attestation
           │
           ▼
┌─────────────────────┐
│   XRPL Mainnet      │  Native settlement
│                     │  - XRP collateral
└─────────────────────┘  - Multisig escrow
```

### How It Works

1. **Connect Wallet** — Sign in with Crossmark or GemWallet (XRPL secp256k1 signature auth)
2. **Deposit Funds** — Send XRP to the 2-of-3 multisig escrow account on XRPL
3. **Trade** — Submit limit/market orders; the orchestrator matches them in a CLOB
4. **Margin Engine** — SGX enclave validates every position in hardware isolation
5. **Settlement** — Withdrawals signed by 2-of-3 SGX enclaves, settled on XRPL in 3-5 seconds

**Security guarantees:**

- Private keys never exist in software — generated and stored inside Intel SGX CPU
- No single operator can move user funds (2-of-3 threshold, master key disabled)
- Anyone can verify enclave integrity via Intel DCAP remote attestation
- No smart contract exploits — computation runs in hardware TEE, not on-chain VM

---

## 📚 Documentation

| Document                                                      | Description                                      |
| ------------------------------------------------------------- | ------------------------------------------------ |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md)                   | System design, component interaction, data flow  |
| [**BACKEND-API.md**](docs/BACKEND-API.md)                     | REST endpoints, WebSocket events, authentication |
| [**PITCH.md**](docs/PITCH.md)                                 | Product vision, market opportunity, roadmap      |
| [**PRESENTATION.md**](docs/PRESENTATION.md)                   | Slide deck content and key messaging             |
| [**HACKATHON-APPLICATION.md**](docs/HACKATHON-APPLICATION.md) | Hackathon submission details                     |
| [**CLAUDE.md**](CLAUDE.md)                                    | Developer guidance for AI-assisted coding        |

---

## 🔗 Related Repositories

| Repository                                                                  | Description                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| [**xrpl-perp-dex**](https://github.com/LemonTreeTechnologies/xrpl-perp-dex) | Rust orchestrator — CLOB, price feeds, P2P replication |
| **SGX Enclave** (private)                                                   | Margin engine, ECDSA custody, DCAP attestation         |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Code quality standards:**

- TypeScript strict mode — no `any` types
- All components must be properly typed
- Run `make fmt` and `make lint` before committing
- Write tests for new features

---

## 📄 License

This project is private and proprietary to Lemon Tree Technologies.

---

## 🌐 Links

- **Live App:** [xperp.fi](https://xperp.fi)
- **API Endpoint:** [api-perp.ph18.io](https://api-perp.ph18.io)
- **Presentation:** [xperp.fi/presentation.html](https://xperp.fi/presentation.html)
- **GitHub:** [@LemonTreeTechnologies](https://github.com/LemonTreeTechnologies)

---

<div align="center">

**Built with ❤️ for the XRP Ledger community**

_Paris Blockchain Week XRPL Hackathon 2026_

</div>
