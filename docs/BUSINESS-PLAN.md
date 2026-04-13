# XPerp — 6-Month Business Plan

**Funding ask:** $250,000 · **Runway:** 6 months · **Goal:** bootstrap a perpetual futures DEX on XRPL with minimal seed liquidity, prove product-market fit, and reach month 6 with self-sustaining trading volume.

## Budget allocation

| Line item                  | Amount       | % of raise | Recoverable?                        |
| -------------------------- | ------------ | ---------- | ----------------------------------- |
| Salaries (3 founders)      | $75,000      | 30%        | No                                  |
| Company setup & legal      | $25,000      | 10%        | No                                  |
| Infrastructure (SGX hosts) | $25,000      | 10%        | No                                  |
| **Vault seed liquidity**   | $100,000     | 40%        | **Yes** — withdrawable anytime      |
| Marketing & growth         | $25,000      | 10%        | No                                  |
| **Total**                  | **$250,000** | 100%       | $150k true burn / $100k recoverable |

**Effective cash burn over 6 months: ~$25k/month.** The $100k vault deposit remains the team's capital, redeployed as protocol-owned liquidity (POL) — it earns spread + funding + fee rebates rather than being spent.

## Spending detail

**Salaries — $75k (≈ $12.5k/mo).** Three co-founders at below-market stipends ($4–5k/mo each) for 6 months. Post-month-6 compensation contingent on revenue or a follow-on round.

**Company setup & legal — $25k.** Entity formation in a crypto-friendly jurisdiction (Cayman / BVI / Switzerland), counsel review of the non-custodial DEX model, ToS / privacy / risk-disclosure drafting, sanctions-screening provider integration, MYNB partnership agreement.

**Infrastructure — $25k (≈ $4k/mo).** Three SGX-capable hosts (1× Hetzner bare metal + 2× Azure DCsv3), domains, CDN, monitoring (Grafana + uptime), backup nodes, a staging environment.

**Vault seed liquidity — $100k.** Deposited to the live Market Making vault as protocol-owned liquidity. Provides two-sided depth on the XRP-USD-PERP order book from day one, earning spread + fee rebates + funding. Withdrawable at any time — this is balance sheet, not burn.

**Marketing — $25k.** Targeted at the existing XRPL community (where derivatives demand is already evidenced — see U.Today coverage). Channels: XRPL-native influencers, Twitter/X campaigns, Discord/Telegram seeding, hackathon sponsorships, content (technical deep-dives on TEE security and the Drift hack post-mortem).

## Milestones

| Month | Milestone                                                                                        | Funded by             |
| ----- | ------------------------------------------------------------------------------------------------ | --------------------- |
| 1     | Entity formed, ToS published, publish reproducible-build pipeline MM vault seeded with $100k POL | Legal + vault         |
| 2     | Delta Neutral vault live, Public launch on XRPL Mainnet (already live in beta),                  | Marketing wave 1      |
| 3     | Reach $1M cumulative trading volume;                                                             | Infra + dev           |
| 4     | Second market listed (e.g. BTC-USD-PERP via oracle)                                              | Dev + MM expansion    |
| 5     | $20M cumulative volume; pursue follow-on funding                                                 | Marketing wave 2 + BD |
| 6     | $50M cumulative volume; revenue covers infra + half of salary; raise Seed                        | Sustained operations  |

## Revenue model

- **Taker fee:** 0.05% on every trade. At $25M/mo volume → $12.5k/mo fee revenue.
- **Vault P&L:** spread capture + funding rate carry + fee rebates. Target: 10–25% APR on the $100k POL → $5–12.5k over 6 months.
- **Withdrawal/deposit fees:** XRPL network fees only (negligible).
- **Future:** vault management fee (10–20% of vault profit) once external LPs deposit.

## Path to break-even

At ~$25k/month true burn (excluding the recoverable vault), full break-even requires ~$50M of _monthly_ trading volume at 0.05% taker fee. Month 6 targets $50M _cumulative_ — meaning revenue at end-of-runway covers roughly half of monthly burn (infra + half of salary), with full break-even projected during the follow-on round window. Comparable benchmarks: Hyperliquid hit this in <3 months; Jupiter Perps in <6. Our advantage on XRPL is zero competition and an underserved community already vocal about wanting derivatives.

## Risk-adjusted downside

If month-6 volume is ≤$10M/mo:

- True cash spent: $150k
- Vault recoverable: $100k (potentially +small P&L, potentially −small drawdown depending on market)
- **Maximum loss to investors: $150k**
- Code, infra, legal entity, brand, and operator-trust setup remain as assets for a follow-on raise and continued operation.

## Why this works on $250k

Three things make a quarter-million sufficient where comparable launches have raised $5M+:

1. **No smart-contract audit bill.** TEE-based architecture means no Solidity audit at $200k/scope.
2. **No bridge or sidechain.** Native XRPL settlement — no custom L2 ops, no validator set, no bridge insurance.
3. **Co-founders take below-market salaries** in exchange for equity / token allocation — the protocol carries the founders, not the other way around.

The $100k POL is the lever: it converts roughly half the raise from "spent" to "deployed." If the protocol reaches even modest fee volume, that $100k can be topped up from earnings rather than from a follow-on round.
