# Backend API Reference

This document describes the backend API that the UI consumes. The backend is a Rust orchestrator
([xrpl-perp-dex](https://github.com/77ph/xrpl-perp-dex)) with an SGX enclave for margin
computation and key custody.

**Production base URL:** `https://api-perp.ph18.io`
**OpenAPI spec:** `GET /v1/openapi.json`
**Market:** `XRP-RLUSD-PERP`

---

## Authentication

Trading endpoints require XRPL secp256k1 signature auth via four headers:

| Header             | Description                                     |
| ------------------ | ----------------------------------------------- |
| `X-XRPL-Address`   | User's XRPL r-address                           |
| `X-XRPL-PublicKey` | Compressed secp256k1 public key (hex, 66 chars) |
| `X-XRPL-Signature` | DER-encoded ECDSA signature (hex)               |
| `X-XRPL-Timestamp` | Unix epoch seconds (max 30s drift from server)  |

### Signing algorithm

**POST/DELETE (with body):**

1. `timestamp = current Unix epoch seconds` (string)
2. `hash = SHA-256(body_utf8_bytes + timestamp_utf8_bytes)`
3. `signature = ECDSA_sign(hash, private_key)` — DER encoded
4. Normalize S to low-S: if `S > curve_order / 2`, set `S = order - S`

**GET (no body):**

1. `timestamp = current Unix epoch seconds` (string)
2. `hash = SHA-256(path_with_query_utf8_bytes + timestamp_utf8_bytes)`
3. Same signing + normalization as above

The `user_id` field in body/query **must** match `X-XRPL-Address`.

### JavaScript browser signing example

```javascript
import { SigningKey, sha256 } from 'ethers';

const PRIVATE_KEY = '0x...'; // secp256k1 private key
const signingKey = new SigningKey(PRIVATE_KEY);
const ADDRESS = 'rXXX...'; // XRPL r-address

function signRequest(bodyStr) {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const data = new TextEncoder().encode(bodyStr + timestamp);
	const hash = sha256(data);
	const sig = signingKey.sign(hash);
	// Need DER encoding of (r, s) — use a DER encoding library
	return {
		'X-XRPL-Address': ADDRESS,
		'X-XRPL-PublicKey': signingKey.compressedPublicKey.slice(2),
		'X-XRPL-Signature': derEncode(sig.r, sig.s),
		'X-XRPL-Timestamp': timestamp,
		'Content-Type': 'application/json'
	};
}
```

### Node.js signing example

```javascript
const crypto = require('crypto');
const secp256k1 = require('secp256k1');

function signRequest(bodyStr) {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const hash = crypto
		.createHash('sha256')
		.update(bodyStr + timestamp, 'utf8')
		.digest();
	const sigObj = secp256k1.ecdsaSign(hash, PRIVATE_KEY);
	const derSig = secp256k1.signatureExport(sigObj.signature);
	return {
		'X-XRPL-Address': ADDRESS,
		'X-XRPL-PublicKey': PUBLIC_KEY.toString('hex'),
		'X-XRPL-Signature': Buffer.from(derSig).toString('hex'),
		'X-XRPL-Timestamp': timestamp,
		'Content-Type': 'application/json'
	};
}
```

---

## Number Format (FP8)

All prices and sizes are **strings with exactly 8 decimal places**: `"0.55000000"`, `"100.00000000"`.
Always send as strings — the server rejects numeric values.

---

## Public Endpoints (no auth)

### Order Book

```
GET /v1/markets/XRP-RLUSD-PERP/orderbook?levels=20
```

Response: `{ bids: [["price", "size"], ...], asks: [...] }` — bids descending, asks ascending.

### Ticker

```
GET /v1/markets/XRP-RLUSD-PERP/ticker
```

Response: `{ best_bid, best_ask, mid_price }` — values are `null` if no orders on that side.

### Recent Trades

```
GET /v1/markets/XRP-RLUSD-PERP/trades
```

Last 100 trades, most recent first. Each: `{ trade_id, price, size, taker_side, timestamp_ms }`.

### Funding Rate

```
GET /v1/markets/XRP-RLUSD-PERP/funding
```

Response: `{ funding_rate, mark_price, next_funding_time, interval_hours }`.

### List Markets

```
GET /v1/markets
```

Response: `{ markets: [{ market, base, quote, mark_price, best_bid, best_ask, max_leverage, maintenance_margin, taker_fee, funding_interval_hours, status }] }`.

### DCAP Attestation

```
POST /v1/attestation/quote
Body: { "user_data": "0xdeadbeef" }
```

Returns Intel-signed SGX Quote v3 proving enclave integrity. `user_data` is a challenge nonce (up to 64 bytes hex) — include a random value to prevent replay. Returns 503 on hardware without DCAP support.

### Attestation Commitment

```
GET /v1/attestation/commitment
```

Returns Sepolia on-chain state proof info.

---

## Trading Endpoints (auth required)

### Submit Order

```
POST /v1/orders
```

```json
{
	"user_id": "rXXX...",
	"side": "buy",
	"type": "limit",
	"price": "0.55000000",
	"size": "100.00000000",
	"leverage": 5,
	"time_in_force": "gtc",
	"reduce_only": false,
	"client_order_id": "my-order-123"
}
```

| Field             | Type    | Required  | Notes                                              |
| ----------------- | ------- | --------- | -------------------------------------------------- |
| `side`            | string  | yes       | `"buy"` / `"sell"` (aliases: `"long"` / `"short"`) |
| `type`            | string  | no        | `"limit"` (default) or `"market"`                  |
| `price`           | string  | for limit | FP8 format                                         |
| `size`            | string  | yes       | FP8 format, quantity in XRP                        |
| `leverage`        | integer | no        | 1–20, default 1                                    |
| `time_in_force`   | string  | no        | `"gtc"` (default), `"ioc"`, `"fok"`                |
| `reduce_only`     | boolean | no        | default false                                      |
| `client_order_id` | string  | no        | custom ID                                          |

Response includes `order_id`, `order_status` (`Open`/`PartiallyFilled`/`Filled`/`Cancelled`), `filled`, `remaining`, `trades[]`.

### Cancel Order

```
DELETE /v1/orders/{order_id}
```

### Cancel All Orders

```
DELETE /v1/orders?user_id=rXXX
```

### Get Open Orders

```
GET /v1/orders?user_id=rXXX
```

### Get Balance & Positions

```
GET /v1/account/balance?user_id=rXXX
```

Response: `{ margin_balance, unrealized_pnl, used_margin, available_margin, positions[] }`.
Each position: `{ position_id, side, size, entry_price, margin, unrealized_pnl }`.

### Withdraw

```
POST /v1/withdraw
Body: { "user_id": "rXXX", "amount": "100.00000000", "destination": "rYYY" }
```

---

## WebSocket

```
wss://api-perp.ph18.io/ws
```

No auth required. On connect, client is auto-subscribed to public channels: `trades`, `orderbook`, `ticker`, `liquidations`.

### Control frames (client → server)

```json
{"action": "subscribe",   "channels": ["user:rXXX"]}
{"action": "unsubscribe", "channels": ["ticker"]}
{"action": "set",         "channels": ["ticker", "user:rXXX"]}
{"action": "ping"}
```

### Event types

| Type               | Channel                               | Description                                                                                        |
| ------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `trade`            | `trades`                              | Matched order: `{ trade_id, price, size, taker_side, maker_user_id, taker_user_id, timestamp_ms }` |
| `orderbook`        | `orderbook`                           | Depth snapshot after each trade: `{ bids, asks }` (depth 20)                                       |
| `ticker`           | `ticker`                              | Price feed: `{ mark_price, index_price, timestamp }`                                               |
| `liquidation`      | `liquidations` + victim's `user:rXXX` | `{ position_id, user_id, price }`                                                                  |
| `fill`             | `user:rXXX`                           | Per-user execution: `{ user_id, order_id, trade_id, side, role, price, size, timestamp_ms }`       |
| `order_update`     | `user:rXXX`                           | Order lifecycle: `{ user_id, order_id, status, filled, remaining, client_order_id }`               |
| `position_changed` | `user:rXXX`                           | Signal to re-fetch positions: `{ user_id, reason }` (reason: `"fill"` or `"liquidation"`)          |
| `subscribed`       | —                                     | ACK: `{ channels[] }`                                                                              |

### JavaScript usage example

```javascript
const ws = new WebSocket('wss://api-perp.ph18.io/ws');
const myAddress = 'rXXX...';

ws.onopen = () => {
	// Add user channel on top of default public channels
	ws.send(
		JSON.stringify({
			action: 'subscribe',
			channels: [`user:${myAddress}`]
		})
	);
};

ws.onmessage = (event) => {
	const msg = JSON.parse(event.data);
	switch (msg.type) {
		case 'trade':
			/* update trade feed */ break;
		case 'orderbook':
			/* update depth display */ break;
		case 'ticker':
			/* update price display */ break;
		case 'liquidation':
			/* show liquidation alert */ break;
		case 'fill':
			/* update user's fill history */ break;
		case 'order_update':
			/* update user's order status */ break;
		case 'position_changed':
			// Re-fetch GET /v1/account/balance for fresh positions
			break;
		case 'subscribed':
			/* confirm channel subscription */ break;
	}
};

// Reconnect logic — server is stateless, always re-subscribe
ws.onclose = () => setTimeout(reconnect, 1000);
```

### Notes

- Reconnect on disconnect — server keeps no per-client state across connections
- Always re-send `subscribe` after reconnect
- Slow clients skip events (no backpressure)
- No authentication on `/ws` — data is either public or references already-public XRPL addresses

---

## Vault API (planned)

### User endpoints

| Method | Endpoint                                     | Description                                                                                                      |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/vaults`                                    | List available vaults (name, description, current price per share)                                               |
| `POST` | `/vaults/{vault_id}/deposits`                | Deposit to vault (`amount`, `xrpl_tx_hash`). Vault verifies on-chain and credits user balance.                   |
| `POST` | `/vaults/{vault_id}/withdrawals`             | Withdraw from vault (`amount`, `destination_xrpl_address`). Checks balance, creates XRPL tx via 2-of-3 multisig. |
| `GET`  | `/vaults/{vault_id}/balance`                 | User's current vault balance                                                                                     |
| `GET`  | `/vaults/{vault_id}/transactions`            | Deposit/withdrawal history with status (`pending`, `confirmed`, `failed`)                                        |
| `GET`  | `/vaults/{vault_id}/price-per-share`         | Current share price                                                                                              |
| `GET`  | `/vaults/{vault_id}/price-per-share-history` | Historical share prices (for charting)                                                                           |

### Operator endpoints

| Method | Endpoint                          | Description                                                |
| ------ | --------------------------------- | ---------------------------------------------------------- |
| `GET`  | `/vaults/{vault_id}/status`       | AUM, user count, recent activity                           |
| `GET`  | `/vaults/{vault_id}/positions`    | Vault's open positions (size, entry price, unrealized PnL) |
| `GET`  | `/vaults/{vault_id}/orders`       | Vault's recent orders (status, size, price, side)          |
| `GET`  | `/vaults/{vault_id}/trades`       | Vault's recent trades                                      |
| `POST` | `/vaults/{vault_id}/create-order` | Place order on behalf of vault                             |
| `POST` | `/vaults/{vault_id}/session-key`  | Update session key                                         |

### Admin endpoints

| Method   | Endpoint                   | Description                                               |
| -------- | -------------------------- | --------------------------------------------------------- |
| `POST`   | `/admin/vaults`            | Create new vault (name, description, initial session key) |
| `DELETE` | `/admin/vaults/{vault_id}` | Delete vault (only if no users + zero balance)            |
| `POST`   | `/admin/vaults/freeze`     | Freeze vault (block deposits/withdrawals)                 |
| `POST`   | `/admin/vaults/unfreeze`   | Unfreeze vault                                            |

### Accepted liquidity

Vaults currently accept **XRP** only. More assets planned as vault offerings expand.

### Revenue streams

Vaults earn yield from multiple sources:

- **Spread** — difference between buy and sell prices of orders placed by the vault
- **Fee rebate** — percentage of taker fees rebated to protocol vaults (incentivizes liquidity provision)
- **Funding rate** — payments from one side of perp contracts to the other, based on mark/index price divergence
- **Other strategies** — lending, staking (vault-dependent)

### Vault types

#### 1. Market Making Vault (low risk)

Deposits XRP, earns yield by providing CLOB liquidity. Places bid/ask orders around mid price, earns spread + fee rebates.

**Strategy parameters:**
| Parameter | Description |
|---|---|
| Min Spread | Minimum bid-ask spread maintained |
| Max Spread | Maximum bid-ask spread maintained |
| Order Size (% of AUM) | Size of orders as percentage of vault's total assets |
| Rebalance Frequency | How often vault refreshes orders on the book |
| Max Delta | Maximum directional exposure from filled orders |
| Min Delta | Minimum directional exposure threshold |

#### 2. Delta Neutral Vault (medium risk)

Deposits XRP, provides liquidity while maintaining delta-neutral position. Earns spread + funding rates with minimized exposure to XRP price movements.

Same parameters as Market Making Vault, plus active hedging to keep net delta near zero.

#### 3. Delta One Vault (higher risk, not yet live)

Exploits interest rate discrepancy between borrowing USD and perpetual funding rates.

**Flow:**

1. User deposits XRP
2. Vault uses XRP as collateral to borrow USD from lending protocol
3. Vault buys spot XRP with borrowed USD
4. Vault shorts the perpetual contract → earns funding rate while maintaining delta-one position

**Missing prerequisites:**

- Spot RLUSD/XRP market on the exchange
- Lending protocol integration (borrow USD against XRP collateral)

### Open design questions (for UI planning)

- **Share accounting:** How NAV is computed — cash only vs mark-to-market vs full accrual including funding
- **Withdrawal timing:** Immediate at current NAV vs queued/epoch-based (to prevent NAV-spike front-running)
- **Liquidation losses:** Pro-rata to share price vs absorbed by insurance fund first
- See [vault-design-followup.md](https://github.com/77ph/xrpl-perp-dex/blob/master/docs/vault-design-followup.md) in the backend repo for full discussion

---

## Market Parameters (XRP-RLUSD-PERP)

| Parameter           | Value                            |
| ------------------- | -------------------------------- |
| Settlement          | RLUSD                            |
| Collateral          | RLUSD (100% LTV) + XRP (90% LTV) |
| Max leverage        | 20x                              |
| Taker fee           | 0.05%                            |
| Maker fee           | 0%                               |
| Maintenance margin  | 0.5%                             |
| Liquidation penalty | 0.5%                             |
| Funding interval    | 8 hours                          |
| Funding rate cap    | ±0.05% per period                |

### Formulas (for UI display)

**Margin:**

```
notional        = size × price
required_margin = notional / leverage
fee             = notional × 0.0005
```

**PnL:**

```
Long:  unrealized_pnl = size × (mark_price - entry_price)
Short: unrealized_pnl = size × (entry_price - mark_price)
```

**Liquidation threshold:**

```
margin_ratio = (margin + unrealized_pnl) / notional
Liquidation when margin_ratio ≤ 0.005 (0.5%)
```

**Funding rate:**

```
funding_rate = clamp((mark_price - index_price) / index_price, -0.0005, 0.0005)
payment = size × mark_price × funding_rate
```

Applied every 8 hours. When mark > index, longs pay shorts. When mark < index, shorts pay longs.

---

## Error Responses

All errors: `{ "status": "error", "message": "..." }`.
HTTP codes: `200` success, `400` bad request, `401` unauthorized, `403` forbidden, `500` server error.

Common error messages:

- `"missing X-XRPL-Address header"`
- `"signature verification failed"`
- `"user_id 'rAttacker' does not match authenticated address 'rBy1x...'"`
- `"leverage must be 1-20"`
- `"invalid or non-positive size"`

---

## Deposits (user flow)

Users deposit by sending an XRPL Payment to the escrow address. The orchestrator monitors the
XRPL ledger (1s interval) and automatically credits the user's balance in the enclave. There is
no deposit API endpoint for frontend to call — just initiate the XRPL Payment and the balance
appears. Poll `GET /v1/account/balance` or listen for `position_changed` WS events to detect
when the deposit is credited.
