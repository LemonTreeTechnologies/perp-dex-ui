// API Client for XRPL Perp DEX
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-perp.ph18.io';
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://api-perp.ph18.io/ws';
const MARKET = 'XRP-RLUSD-PERP';

export interface OrderBookLevel {
	price: string;
	size: string;
}

export interface OrderBook {
	bids: [string, string][];
	asks: [string, string][];
}

export interface Ticker {
	best_bid: string | null;
	best_ask: string | null;
	mid_price: string | null;
	mark_price?: string;
	index_price?: string;
}

export interface FundingRate {
	funding_rate: string;
	mark_price: string;
	next_funding_time: number;
	interval_hours: number;
}

export interface Trade {
	trade_id: number;
	price: string;
	size: string;
	taker_side: 'long' | 'short';
	timestamp_ms: number;
	maker_user_id?: string;
	taker_user_id?: string;
}

export interface Position {
	position_id: number;
	side: 'long' | 'short';
	size: string;
	entry_price: string;
	margin: string;
	unrealized_pnl: string;
}

export interface Balance {
	margin_balance: string;
	unrealized_pnl: string;
	used_margin: string;
	available_margin: string;
	positions: Position[];
}

export interface Order {
	order_id: number;
	side: 'long' | 'short';
	type: 'Limit' | 'Market';
	price?: string;
	size: string;
	filled: string;
	remaining: string;
	status: 'Open' | 'PartiallyFilled' | 'Filled' | 'Cancelled';
	client_order_id?: string;
}

export interface OrderRequest {
	user_id: string;
	side: 'buy' | 'sell' | 'long' | 'short';
	type: 'limit' | 'market';
	price?: string;
	size: string;
	leverage?: number;
	time_in_force?: 'gtc' | 'ioc' | 'fok';
	reduce_only?: boolean;
	client_order_id?: string;
}

export interface Transaction {
	id: number;
	type: 'deposit' | 'withdrawal';
	amount: string;
	status: 'pending' | 'completed' | 'failed';
	txn_hash?: string;
	timestamp: number;
	destination?: string;
}

// Public API endpoints (no auth required)
export const api = {
	async getOrderBook(levels: number = 20): Promise<OrderBook> {
		const response = await fetch(`${BASE_URL}/v1/markets/${MARKET}/orderbook?levels=${levels}`);
		const data = await response.json();
		if (data.status === 'success') {
			return { bids: data.bids, asks: data.asks };
		}
		throw new Error(data.message || 'Failed to fetch orderbook');
	},

	async getTicker(): Promise<Ticker> {
		const response = await fetch(`${BASE_URL}/v1/markets/${MARKET}/ticker`);
		const data = await response.json();
		if (data.status === 'success') {
			return {
				best_bid: data.best_bid,
				best_ask: data.best_ask,
				mid_price: data.mid_price,
				mark_price: data.mark_price,
				index_price: data.index_price
			};
		}
		throw new Error(data.message || 'Failed to fetch ticker');
	},

	async getTrades(): Promise<Trade[]> {
		const response = await fetch(`${BASE_URL}/v1/markets/${MARKET}/trades`);
		const data = await response.json();
		if (data.status === 'success') {
			return data.trades;
		}
		throw new Error(data.message || 'Failed to fetch trades');
	},

	async getMarkets() {
		const response = await fetch(`${BASE_URL}/v1/markets`);
		const data = await response.json();
		if (data.status === 'success') {
			return data.markets;
		}
		throw new Error(data.message || 'Failed to fetch markets');
	},

	async getFundingRate(): Promise<FundingRate> {
		const response = await fetch(`${BASE_URL}/v1/markets/${MARKET}/funding`);
		const data = await response.json();
		if (data.status === 'success') {
			return {
				funding_rate: data.funding_rate,
				mark_price: data.mark_price,
				next_funding_time: data.next_funding_time,
				interval_hours: data.interval_hours
			};
		}
		throw new Error(data.message || 'Failed to fetch funding rate');
	}
};

// Authenticated API endpoints (require XRPL signature)
export const authApi = {
	async login(headers: Record<string, string>): Promise<{ token: string }> {
		const response = await fetch(`${BASE_URL}/v1/auth/login`, {
			method: 'POST',
			headers
		});
		const data = await response.json();
		if (data.status === 'success' && data.token) {
			return { token: data.token };
		}
		throw new Error(data.message || 'Failed to login');
	},

	async getBalance(userId: string, headers: Record<string, string>): Promise<Balance> {
		console.log('Fetching balance with headers:', headers);
		const url = `${BASE_URL}/v1/account/balance?user_id=${userId}`;
		const response = await fetch(url, {
			headers
		});
		console.log('Balance response status:', response.status);
		console.log('Balance response headers:', response.headers);
		console.log('Balance response body:', await response.clone().text());
		const data = await response.json();
		if (data.status === 'success') {
			return data.data;
		}
		throw new Error(data.message || 'Failed to fetch balance');
	},

	async getOrders(userId: string, headers: Record<string, string>): Promise<Order[]> {
		const response = await fetch(`${BASE_URL}/v1/orders?user_id=${userId}`, {
			headers
		});
		const data = await response.json();
		if (data.status === 'success') {
			return data.orders;
		}
		throw new Error(data.message || 'Failed to fetch orders');
	},

	async submitOrder(order: OrderRequest, headers: Record<string, string>) {
		const response = await fetch(`${BASE_URL}/v1/orders`, {
			method: 'POST',
			headers: {
				...headers,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(order)
		});
		const data = await response.json();
		if (data.status === 'success') {
			return data;
		}
		throw new Error(data.message || 'Failed to submit order');
	},

	async cancelOrder(orderId: number, headers: Record<string, string>) {
		const response = await fetch(`${BASE_URL}/v1/orders/${orderId}`, {
			method: 'DELETE',
			headers
		});
		const data = await response.json();
		if (data.status === 'success') {
			return data;
		}
		throw new Error(data.message || 'Failed to cancel order');
	},

	async cancelAllOrders(userId: string, headers: Record<string, string>) {
		const response = await fetch(`${BASE_URL}/v1/orders?user_id=${userId}`, {
			method: 'DELETE',
			headers
		});
		const data = await response.json();
		if (data.status === 'success') {
			return data;
		}
		throw new Error(data.message || 'Failed to cancel all orders');
	},

	async withdraw(
		userId: string,
		amount: string,
		destination: string,
		headers: Record<string, string>
	) {
		const response = await fetch(`${BASE_URL}/v1/withdraw`, {
			method: 'POST',
			headers: {
				...headers,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user_id: userId,
				amount,
				destination
			})
		});
		const data = await response.json();
		if (data.status === 'success') {
			return data;
		}
		throw new Error(data.message || 'Failed to withdraw');
	},

	async getTransactions(userId: string, headers: Record<string, string>): Promise<Transaction[]> {
		const response = await fetch(`${BASE_URL}/v1/account/transactions?user_id=${userId}`, {
			headers
		});
		const data = await response.json();
		if (data.status === 'success') {
			return data.transactions || [];
		}
		throw new Error(data.message || 'Failed to fetch transactions');
	}
};

// WebSocket connection factory
export function createWebSocket() {
	return new WebSocket(WS_URL);
}

// Helper to format FP8 numbers
export function toFP8(value: number | string): string {
	const num = typeof value === 'string' ? parseFloat(value) : value;
	return num.toFixed(8);
}

// Helper to parse FP8 to number
export function fromFP8(value: string): number {
	return parseFloat(value);
}
