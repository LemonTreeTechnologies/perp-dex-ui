# perp-dex-ui

Frontend for [xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex) — a perpetual futures DEX on XRPL mainnet with TEE (Intel SGX) computation and RLUSD settlement.

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

## Related Repositories

| Repo                                                                   | Description                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex)                 | Rust orchestrator — trading API, order book, price feed, P2P replication |
| [xrpl-perp-dex-enclave](https://github.com/77ph/xrpl-perp-dex-enclave) | SGX enclave — margin engine, key custody, DCAP attestation               |
