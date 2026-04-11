# Frontend Developer API Guide

**Base URL:** `https://api-perp.ph18.io` (production) or `http://localhost:3000` (dev)
**Market:** `XRP-RLUSD-PERP`
**OpenAPI Spec:** `https://api-perp.ph18.io/v1/openapi.json`

---

## Quick Start

### 1. Public endpoints (no authentication)

```bash
# DCAP Remote Attestation (verify enclave integrity)
curl -X POST http://YOUR_SERVER:3000/v1/attestation/quote \
  -H "Content-Type: application/json" \
  -d '{"user_data": "0xdeadbeef"}'

# Order book
curl http://YOUR_SERVER:3000/v1/markets/XRP-RLUSD-PERP/orderbook

# Ticker (best bid/ask)
curl http://YOUR_SERVER:3000/v1/markets/XRP-RLUSD-PERP/ticker

# Recent trades
curl http://YOUR_SERVER:3000/v1/markets/XRP-RLUSD-PERP/trades
```

### 1b. WebSocket (real-time feed, no authentication)

```javascript
const ws = new WebSocket('wss://api-perp.ph18.io/ws');
ws.onmessage = (e) => console.log(JSON.parse(e.data));

// Default: trades, orderbook, ticker, liquidations (market-wide).
// Subscribe to your own fills + order updates:
ws.onopen = () =>
	ws.send(
		JSON.stringify({
			action: 'subscribe',
			channels: ['user:rYourXrplAddress...']
		})
	);
// Full event set: trade, orderbook, ticker, liquidation,
//                 fill, order_update, position_changed
```

### 2. Authenticated endpoints (require XRPL signature)

```bash
# Install dependencies
pip install xrpl-py ecdsa requests

# Generate a wallet
python3 tools/xrpl_auth.py --generate
# Output: {"seed": "spXXX...", "address": "rXXX...", ...}

# Submit an order
python3 tools/xrpl_auth.py --secret spXXX... \
  --request POST http://YOUR_SERVER:3000/v1/orders \
  '{"user_id":"X","side":"buy","type":"limit","price":"0.55000000","size":"100.00000000","leverage":5}'
```

---

## Authentication

All trading endpoints (orders, balance, cancel) require authentication. Two methods are supported:

### Method 1: Session token (recommended for browser wallets)

Sign once with your wallet, get a Bearer token valid for 30 minutes. Best for Crossmark/GemWallet where each signature requires user interaction.

**Step 1 — Login (sign once):**

```
POST /v1/auth/login
Headers: X-XRPL-Address, X-XRPL-PublicKey, X-XRPL-Signature, X-XRPL-Timestamp
```

Response:

```json
{
	"status": "success",
	"token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	"expires_in": 1800,
	"address": "rXXX..."
}
```

**Step 2 — Use the token for all requests:**

```javascript
// No more signing needed!
const headers = { 'Authorization': `Bearer ${token}` };

// GET balance
fetch(`/v1/account/balance?user_id=${address}`, { headers });

// POST order
fetch('/v1/orders', {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: address, side: 'buy', ... })
});
```

When the token expires, call `/v1/auth/login` again.

### Method 2: Per-request XRPL signature

Sign every request with four headers. Required for `/v1/auth/login` itself, optional elsewhere if you have a session token.

| Header             | Value                                             | Example                             |
| ------------------ | ------------------------------------------------- | ----------------------------------- |
| `X-XRPL-Address`   | Your XRPL r-address                               | `rBy1xSMqCesQ11Nh23KoddAfa5vBNHEK7` |
| `X-XRPL-PublicKey` | Compressed secp256k1 public key (hex, 66 chars)   | `03c768238bf134...`                 |
| `X-XRPL-Signature` | DER-encoded ECDSA signature (hex)                 | `3045022100a461...`                 |
| `X-XRPL-Timestamp` | Unix epoch seconds (**mandatory**, max 60s drift) | `1712500000`                        |

### Signing algorithm (step by step)

**For POST/DELETE (with body):**

```
1. timestamp = current Unix epoch seconds (e.g., "1712500000")
2. body_bytes = UTF-8 encode the JSON body string
3. hash = SHA-256(body_bytes + timestamp_bytes)  → 32 bytes
4. signature = ECDSA_sign(hash, private_key)     → DER encoded
5. Normalize S to low-S (if S > curve_order/2, S = order - S)
6. headers = {
     "X-XRPL-Address": your r-address,
     "X-XRPL-PublicKey": compressed pubkey hex,
     "X-XRPL-Signature": DER signature hex,
     "X-XRPL-Timestamp": timestamp string
   }
```

**For GET (no body):**

```
1. timestamp = current Unix epoch seconds
2. path = full URI path with query string (e.g., "/v1/orders?user_id=rXXX")
3. hash = SHA-256(path_bytes + timestamp_bytes)
4. signature = ECDSA_sign(hash, private_key)
5. Same headers (including X-XRPL-Timestamp)
```

**Browser wallet note:** Crossmark and GemWallet apply SHA-512Half (first 32 bytes of SHA-512) before ECDSA internally. The server accepts both direct SHA-256 and SHA-512Half-wrapped signatures automatically.

**Important:** Timestamp must be within 60 seconds of server time. Requests with missing or expired timestamps are rejected.

**Important:** The `user_id` field in the request body (or query parameter) MUST match the authenticated address (from signature or session token). The server rejects mismatches.

---

## Implementation Examples

### JS Example

```javascript
import sdk from '@crossmarkio/sdk';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

// 1. Connect wallet (once)
const { response } = await sdk.async.signInAndWait();
const address = response.data.address;
const publicKey = response.data.publicKey;

// 2. For each request — build the message to sign
const timestamp = Math.floor(Date.now() / 1000).toString();
const bodyStr = JSON.stringify({ user_id: address, side: 'buy', ... });
const hash = bytesToHex(sha256(new TextEncoder().encode(bodyStr + timestamp)));

// 3. Sign with Crossmark (pass hash as hex — wallet applies SHA-512Half internally)
const { response: sigResp } = await sdk.async.signInAndWait(hash);

// 4. Send request
fetch('https://api-perp.ph18.io/v1/orders', {
  method: 'POST',
  headers: {
    'X-XRPL-Address': address,
    'X-XRPL-PublicKey': publicKey,
    'X-XRPL-Signature': sigResp.data.signature,
    'X-XRPL-Timestamp': timestamp,
    'Content-Type': 'application/json',
  },
  body: bodyStr,
});

For GET requests (e.g. fetching orders/balance): same flow but sign the URI path instead of body:
const path = `/v1/orders?user_id=${address}`;
const hash = bytesToHex(sha256(new TextEncoder().encode(path + timestamp)));
```

---

## API Reference

### Submit Order

```
POST /v1/orders
Auth: Required
```

**Request:**

```json
{
	"user_id": "rBy1xSMqCesQ11Nh23KoddAfa5vBNHEK7",
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

**Fields:**

| Field             | Type    | Required  | Description                                        |
| ----------------- | ------- | --------- | -------------------------------------------------- |
| `user_id`         | string  | Yes       | Must match X-XRPL-Address                          |
| `side`            | string  | Yes       | `"buy"` or `"sell"` (aliases: `"long"`, `"short"`) |
| `type`            | string  | No        | `"limit"` (default) or `"market"`                  |
| `price`           | string  | For limit | FP8 format: `"0.55000000"`                         |
| `size`            | string  | Yes       | FP8 format, quantity in XRP                        |
| `leverage`        | integer | No        | 1-20, default 1                                    |
| `time_in_force`   | string  | No        | `"gtc"` (default), `"ioc"`, `"fok"`                |
| `reduce_only`     | boolean | No        | Default false                                      |
| `client_order_id` | string  | No        | Your custom ID                                     |

**Response:**

```json
{
	"status": "success",
	"order_id": 1,
	"order_status": "Open",
	"filled": "0.00000000",
	"remaining": "100.00000000",
	"trades": [],
	"failed_fills": 0
}
```

**Order status values:** `Open`, `PartiallyFilled`, `Filled`, `Cancelled`

**If order matches immediately:**

```json
{
	"status": "success",
	"order_id": 2,
	"order_status": "Filled",
	"filled": "100.00000000",
	"remaining": "0.00000000",
	"trades": [
		{
			"trade_id": 1,
			"price": "0.55000000",
			"size": "100.00000000",
			"maker_user_id": "rAlice...",
			"taker_user_id": "rBob...",
			"taker_side": "buy"
		}
	],
	"failed_fills": 0
}
```

---

### Cancel Order

```
DELETE /v1/orders/{order_id}
Auth: Required
```

**Response:**

```json
{
	"status": "success",
	"order_id": 1,
	"status": "Cancelled"
}
```

---

### Cancel All Orders

```
DELETE /v1/orders?user_id=rXXX
Auth: Required (user_id must match)
```

**Response:**

```json
{
	"status": "success",
	"cancelled": 3
}
```

---

### Get Open Orders

```
GET /v1/orders?user_id=rXXX
Auth: Required (user_id must match)
```

**Response:**

```json
{
	"status": "success",
	"orders": [
		{
			"order_id": 1,
			"side": "long",
			"type": "Limit",
			"price": "0.55000000",
			"size": "100.00000000",
			"filled": "0.00000000",
			"remaining": "100.00000000",
			"status": "Open"
		}
	]
}
```

---

### Get Balance & Positions

```
GET /v1/account/balance?user_id=rXXX
Auth: Required (user_id must match)
```

**Response:**

```json
{
	"status": "success",
	"data": {
		"margin_balance": "200.00000000",
		"unrealized_pnl": "5.50000000",
		"used_margin": "26.24400000",
		"available_margin": "179.25600000",
		"positions": [
			{
				"position_id": 0,
				"side": "long",
				"size": "100.00000000",
				"entry_price": "1.31220000",
				"margin": "26.24400000",
				"unrealized_pnl": "5.50000000"
			}
		]
	}
}
```

---

### Order Book

```
GET /v1/markets/XRP-RLUSD-PERP/orderbook?levels=20
Auth: Not required
```

**Response:**

```json
{
	"status": "success",
	"bids": [
		["0.55000000", "100.00000000"],
		["0.54000000", "200.00000000"]
	],
	"asks": [
		["0.56000000", "150.00000000"],
		["0.57000000", "50.00000000"]
	]
}
```

Format: `[price, total_size_at_price]`, bids descending, asks ascending.

---

### Ticker

```
GET /v1/markets/XRP-RLUSD-PERP/ticker
Auth: Not required
```

**Response:**

```json
{
	"status": "success",
	"best_bid": "0.55000000",
	"best_ask": "0.56000000",
	"mid_price": "0.55500000"
}
```

Values are `null` if no orders on that side.

---

### Recent Trades

```
GET /v1/markets/XRP-RLUSD-PERP/trades
Auth: Not required
```

**Response:**

```json
{
	"status": "success",
	"trades": [
		{
			"trade_id": 1,
			"price": "0.55000000",
			"size": "100.00000000",
			"taker_side": "long",
			"timestamp_ms": 1743500000000
		}
	]
}
```

Last 100 trades, most recent first.

---

### Funding Rate

```
GET /v1/markets/XRP-RLUSD-PERP/funding
Auth: Not required
```

**Response:**

```json
{
	"status": "success",
	"funding_rate": "0.00010000",
	"mark_price": "1.31000000",
	"next_funding_time": 1712528800,
	"interval_hours": 8
}
```

---

### List Markets

```
GET /v1/markets
Auth: Not required
```

**Response:**

```json
{
	"status": "success",
	"markets": [
		{
			"market": "XRP-RLUSD-PERP",
			"base": "XRP",
			"quote": "RLUSD",
			"mark_price": "1.31000000",
			"best_bid": "1.30500000",
			"best_ask": "1.31500000",
			"max_leverage": 20,
			"maintenance_margin": "0.00500000",
			"taker_fee": "0.00050000",
			"funding_interval_hours": 8,
			"status": "active"
		}
	]
}
```

---

### Withdraw

```
POST /v1/withdraw
Auth: Required
```

**Request:**

```json
{
	"user_id": "rBy1xSMqCesQ11Nh23KoddAfa5vBNHEK7",
	"amount": "100.00000000",
	"destination": "rMyXRPLAddress..."
}
```

**Response (success):**

```json
{
	"status": "success",
	"amount": "100.00000000",
	"destination": "rMyXRPLAddress...",
	"xrpl_tx_hash": "ABC123...",
	"message": "withdrawal submitted to XRPL"
}
```

**Response (insufficient margin):**

```json
{
	"status": "error",
	"message": "enclave rejected withdrawal"
}
```

---

### DCAP Remote Attestation

```
POST /v1/attestation/quote
Auth: Not required
```

Verifies that the SGX enclave is running genuine, untampered code on Intel hardware.
Returns an Intel-signed SGX Quote v3 with ECDSA certificate chain.

**Request:**

```json
{ "user_data": "0xdeadbeef" }
```

`user_data` is a challenge nonce (up to 64 bytes hex). Include a random value to prevent replay attacks.

**Response (Azure DCsv3 — DCAP available):**

```json
{
	"status": "success",
	"quote_hex": "0x030002000000000...",
	"quote_size": 4734
}
```

**Response (Hetzner / no DCAP hardware):**

```json
{
	"status": "error",
	"message": "DCAP attestation not available on this platform. Use Azure DCsv3 for hardware attestation."
}
```

HTTP status: 503

**Verification:** Use `dcap_verifier.py` from the enclave repo to independently verify the quote:

```bash
python3 dcap_verifier.py --url http://YOUR_SERVER:3000/v1 --expected-mrenclave <HASH>
```

---

## WebSocket (Real-Time Feed)

```
ws://YOUR_SERVER:3000/ws
wss://api-perp.ph18.io/ws   (production, via nginx)
Auth: Not required
```

Connect and receive JSON events pushed by the server. On connect, clients are
automatically subscribed to the default public channels
`{trades, orderbook, ticker, liquidations}`. Send control frames to adjust
the subscription set, including `user:rXXX` channels for per-user events.

### Channels

| Channel        | Events delivered                                                                           |
| -------------- | ------------------------------------------------------------------------------------------ |
| `trades`       | `trade`                                                                                    |
| `orderbook`    | `orderbook`                                                                                |
| `ticker`       | `ticker`                                                                                   |
| `liquidations` | `liquidation` (market-wide)                                                                |
| `user:rXXX`    | `fill`, `order_update`, `position_changed`, plus any `liquidation` where `user_id == rXXX` |

### Control frames (client → server)

Send a JSON text frame at any time to change your subscription. Each control
frame is acknowledged with a `subscribed` event listing the current channels.

```json
// Add channels (does not remove existing)
{"action": "subscribe",   "channels": ["trades", "user:rAlice..."]}

// Remove specific channels
{"action": "unsubscribe", "channels": ["ticker"]}

// Replace the entire subscription set
{"action": "set",         "channels": ["ticker", "user:rBob..."]}

// Keepalive (server replies with {"type":"pong"})
{"action": "ping"}
```

Unknown channels are ignored silently. Invalid JSON produces an
`{"type":"error","message":"..."}` frame but keeps the connection open.

### Event types

**Trade** — broadcast to `trades` channel on each matched order:

```json
{
	"type": "trade",
	"trade_id": 42,
	"price": "0.55000000",
	"size": "100.00000000",
	"taker_side": "long",
	"maker_user_id": "rAlice...",
	"taker_user_id": "rBob...",
	"timestamp_ms": 1743500000000
}
```

**Orderbook** — broadcast to `orderbook` after each trade (depth 20):

```json
{
	"type": "orderbook",
	"bids": [
		["0.55000000", "100.00000000"],
		["0.54000000", "200.00000000"]
	],
	"asks": [
		["0.56000000", "150.00000000"],
		["0.57000000", "50.00000000"]
	]
}
```

**Ticker** — broadcast to `ticker` periodically from the price feed loop:

```json
{
	"type": "ticker",
	"mark_price": "0.55120000",
	"index_price": "0.55120000",
	"timestamp": 1743500005
}
```

**Liquidation** — broadcast to `liquidations` AND to the victim's `user:rXXX`:

```json
{
	"type": "liquidation",
	"position_id": 7,
	"user_id": "rCharlie...",
	"price": "0.48000000"
}
```

**Fill** — per-user execution notification. Each trade emits TWO `fill` events
(one for the taker, one for the maker) delivered only to matching `user:rXXX`
channels:

```json
{
	"type": "fill",
	"user_id": "rBob...",
	"order_id": 199,
	"trade_id": 42,
	"side": "long",
	"role": "taker",
	"price": "0.55000000",
	"size": "100.00000000",
	"timestamp_ms": 1743500000000
}
```

**OrderUpdate** — order lifecycle. Delivered to the order owner's `user:rXXX`:

```json
{
	"type": "order_update",
	"user_id": "rBob...",
	"order_id": 199,
	"status": "partiallyfilled", // "open" | "partiallyfilled" | "filled" | "cancelled"
	"filled": "50.00000000",
	"remaining": "50.00000000",
	"client_order_id": "my-42" // null if not set by client
}
```

**PositionChanged** — nudge to re-fetch `GET /v1/account/positions`. The
orchestrator does not mirror positions (they live in the SGX enclave), so
this is the signal to ask the enclave for fresh state. Delivered to the
owner's `user:rXXX`:

```json
{
	"type": "position_changed",
	"user_id": "rBob...",
	"reason": "fill" // "fill" | "liquidation"
}
```

**subscribed** — ACK after a control frame (server → client):

```json
{
	"type": "subscribed",
	"channels": ["trades", "orderbook", "ticker", "liquidations", "user:rBob..."]
}
```

### JavaScript example

```javascript
const ws = new WebSocket('wss://api-perp.ph18.io/ws');
const myAddress = 'rBobXRPLAddress...';

ws.onopen = () => {
	// Add our own user channel on top of the default public set.
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
			console.log(`Trade: ${msg.size} XRP @ ${msg.price}`);
			break;
		case 'orderbook':
			console.log(`Orderbook: ${msg.bids.length} bids, ${msg.asks.length} asks`);
			break;
		case 'ticker':
			console.log(`Mark: ${msg.mark_price}`);
			break;
		case 'liquidation':
			console.log(`Liquidation: position ${msg.position_id}`);
			break;
		case 'fill':
			console.log(`Fill ${msg.role}: ${msg.size} @ ${msg.price}`);
			break;
		case 'order_update':
			console.log(`Order ${msg.order_id}: ${msg.status}`);
			break;
		case 'position_changed':
			// Re-fetch /v1/account/positions here.
			fetchPositions();
			break;
		case 'subscribed':
			console.log(`Subscribed: ${msg.channels}`);
			break;
	}
};

ws.onclose = () => console.log('Disconnected, reconnecting...');
```

### Python example

```python
import asyncio
import json
import websockets

MY_ADDR = "rBobXRPLAddress..."

async def listen():
    async with websockets.connect("wss://api-perp.ph18.io/ws") as ws:
        await ws.send(json.dumps({
            "action": "subscribe",
            "channels": [f"user:{MY_ADDR}"],
        }))
        async for message in ws:
            event = json.loads(message)
            print(f"[{event['type']}] {event}")

asyncio.run(listen())
```

### Notes

- No authentication on `/ws`. Data is either public (market data) or
  references xrpl_addresses that are already public. If you want to gate
  `user:rXXX` channels, add a signed X-XRPL-Signature check on upgrade.
- Slow clients skip events (no backpressure, no blocking of producers).
- Reconnect on disconnect — the server keeps no per-client state across
  connections, so always re-send your `subscribe` on reconnect.
- All prices/sizes in FP8 string format.

---

## Number Format (FP8)

All prices and sizes use **FP8 format**: strings with exactly 8 decimal places.

```
"0.55000000"    = 0.55
"100.00000000"  = 100
"1.31220000"    = 1.3122
```

Always send as strings, not numbers. The server rejects numeric values.

---

## Error Responses

```json
{"status": "error", "message": "missing X-XRPL-Address header"}
{"status": "error", "message": "signature verification failed"}
{"status": "error", "message": "user_id 'rAttacker' does not match authenticated address 'rBy1x...'"}
{"status": "error", "message": "leverage must be 1-20"}
{"status": "error", "message": "invalid or non-positive size"}
```

HTTP status codes: `200` success, `400` bad request, `401` unauthorized, `403` forbidden, `500` server error.

---

## Testing

```bash
# Generate wallet
python3 tools/xrpl_auth.py --generate

# Use the generated secret for all subsequent requests
export SECRET="spXXX..."

# Place a limit buy
python3 tools/xrpl_auth.py --secret $SECRET \
  --request POST http://YOUR_SERVER:3000/v1/orders \
  '{"user_id":"X","side":"buy","type":"limit","price":"0.55","size":"100","leverage":5}'

# Check orderbook (no auth needed)
curl http://YOUR_SERVER:3000/v1/markets/XRP-RLUSD-PERP/orderbook

# Get your orders
python3 tools/xrpl_auth.py --secret $SECRET \
  --request GET "http://YOUR_SERVER:3000/v1/orders?user_id=YOUR_ADDRESS"
```

Note: For `--request GET`, the tool signs the URI path. For `--request POST`, it signs the body.
The `user_id` field is auto-replaced with your authenticated address.
