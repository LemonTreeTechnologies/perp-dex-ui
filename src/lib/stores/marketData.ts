// WebSocket store for real-time market data
import { writable, derived } from 'svelte/store';
import { createWebSocket, api, type Trade, type Ticker, type OrderBook } from '$lib/api/client';

interface WebSocketMessage {
	type: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

interface MarketData {
	ticker: Ticker | null;
	trades: Trade[];
	orderbook: OrderBook | null;
	connected: boolean;
}

function createMarketDataStore() {
	const { subscribe, update } = writable<MarketData>({
		ticker: null,
		trades: [],
		orderbook: null,
		connected: false
	});

	let ws: WebSocket | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	const refreshCallbacks: (() => Promise<void>)[] = [];

	function connect() {
		if (ws?.readyState === WebSocket.OPEN) return;

		try {
			ws = createWebSocket();

			ws.onopen = () => {
				console.log('WebSocket connected');
				update((state) => ({ ...state, connected: true }));

				// Subscribe to default channels (already subscribed on connect)
				// trades, orderbook, ticker, liquidations
			};

			ws.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);

					switch (message.type) {
						case 'trade':
							update((state) => ({
								...state,
								trades: [message as unknown as Trade, ...state.trades].slice(0, 100) // Keep last 100 trades
							}));
							break;

						case 'orderbook':
							update((state) => ({
								...state,
								orderbook: {
									bids: message.bids,
									asks: message.asks
								}
							}));
							break;

						case 'ticker':
							update((state) => ({
								...state,
								ticker: {
									best_bid: state.ticker?.best_bid || null,
									best_ask: state.ticker?.best_ask || null,
									mid_price: state.ticker?.mid_price || null,
									mark_price: message.mark_price,
									index_price: message.index_price
								}
							}));
							break;

						case 'subscribed':
							console.log('Subscribed to channels:', message.channels);
							break;

						case 'error':
							console.error('WebSocket error:', message.message);
							break;
					}
				} catch (error) {
					console.error('Failed to parse WebSocket message:', error);
				}
			};

			ws.onerror = (error) => {
				console.error('WebSocket error:', error);
			};

			ws.onclose = () => {
				console.log('WebSocket disconnected');
				update((state) => ({ ...state, connected: false }));

				// Reconnect after 3 seconds
				reconnectTimeout = setTimeout(() => {
					console.log('Reconnecting...');
					connect();
				}, 3000);
			};
		} catch (error) {
			console.error('Failed to create WebSocket:', error);
			update((state) => ({ ...state, connected: false }));
		}
	}

	function disconnect() {
		if (reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		if (ws) {
			ws.close();
			ws = null;
		}
		update((state) => ({ ...state, connected: false }));
	}

	function subscribeToUser(address: string) {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					action: 'subscribe',
					channels: [`user:${address}`]
				})
			);
		}
	}

	async function fetchInitialData() {
		try {
			// Fetch initial orderbook via REST API
			const orderbook = await api.getOrderBook();
			update((state) => ({ ...state, orderbook }));
		} catch (error) {
			console.error('Failed to fetch initial orderbook:', error);
		}
	}

	async function fetchOrderbook() {
		try {
			console.log('Polling orderbook...');
			const orderbook = await api.getOrderBook();
			console.log('Fetched orderbook:', orderbook);
			update((state) => ({ ...state, orderbook }));

			// Call all registered refresh callbacks (positions, orders, etc.)
			await Promise.allSettled(refreshCallbacks.map((cb) => cb()));
		} catch (error) {
			console.error('Failed to fetch orderbook:', error);
		}
	}

	function startPolling() {
		console.log('Starting orderbook polling (every 1 second)');
		// Stop any existing polling
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}

		// Fetch immediately first
		fetchOrderbook();

		// Poll orderbook every 1 second
		pollingInterval = setInterval(() => {
			fetchOrderbook();
		}, 1000);
	}

	function stopPolling() {
		console.log('Stopping orderbook polling');
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}

	function registerRefreshCallback(callback: () => Promise<void>) {
		refreshCallbacks.push(callback);
	}

	function unregisterRefreshCallback(callback: () => Promise<void>) {
		const index = refreshCallbacks.indexOf(callback);
		if (index > -1) {
			refreshCallbacks.splice(index, 1);
		}
	}

	return {
		subscribe,
		connect,
		disconnect,
		subscribeToUser,
		fetchInitialData,
		startPolling,
		stopPolling,
		registerRefreshCallback,
		unregisterRefreshCallback
	};
}

export const marketDataStore = createMarketDataStore();

// Derived store for current price
export const currentPrice = derived(marketDataStore, ($market) => {
	if ($market.ticker?.mark_price) {
		return parseFloat($market.ticker.mark_price);
	}
	if ($market.ticker?.mid_price) {
		return parseFloat($market.ticker.mid_price);
	}
	if ($market.trades.length > 0) {
		return parseFloat($market.trades[0].price);
	}
	return null;
});
