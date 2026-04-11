<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { marketDataStore } from '$lib/stores/marketData';
	import { api } from '$lib/api/client';

	interface Props {
		onPriceClick?: (price: string) => void;
	}

	let { onPriceClick }: Props = $props();

	let orderbook = $derived($marketDataStore.orderbook);
	let displayMode = $state<'size' | 'value'>('size');

	// Calculate max values for bar visualization
	let maxBidValue = $derived.by(() => {
		if (!orderbook || !orderbook.bids.length) return 0;
		const values = orderbook.bids.slice(0, 10).map(([price, size]) => {
			return displayMode === 'size' ? parseFloat(size) : parseFloat(price) * parseFloat(size);
		});
		return Math.max(...values);
	});

	let maxAskValue = $derived.by(() => {
		if (!orderbook || !orderbook.asks.length) return 0;
		const values = orderbook.asks.slice(0, 10).map(([price, size]) => {
			return displayMode === 'size' ? parseFloat(size) : parseFloat(price) * parseFloat(size);
		});
		return Math.max(...values);
	});

	// Fetch orderbook on mount as fallback if WebSocket hasn't populated it yet
	onMount(async () => {
		console.log('OrderBook component mounted, starting polling');
		// Start polling orderbook every 1 second
		marketDataStore.startPolling();

		if (!orderbook) {
			try {
				const data = await api.getOrderBook();
				// Manually update the store if needed
				console.log('Fetched orderbook via API:', data);
			} catch (err) {
				console.error('Failed to fetch orderbook:', err);
			}
		}
	});

	onDestroy(() => {
		console.log('OrderBook component destroyed, stopping polling');
		// Stop polling when component is destroyed
		marketDataStore.stopPolling();
	});
</script>

<div class="flex h-full flex-col space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">Order Book</h3>
		<div class="flex space-x-1 rounded-lg bg-[#1A1A1A] p-1">
			<button
				onclick={() => (displayMode = 'size')}
				class="rounded px-3 py-1 text-xs font-medium transition-colors"
				class:bg-[#00AAE4]={displayMode === 'size'}
				class:text-white={displayMode === 'size'}
				class:text-[#808080]={displayMode !== 'size'}
			>
				Size
			</button>
			<button
				onclick={() => (displayMode = 'value')}
				class="rounded px-3 py-1 text-xs font-medium transition-colors"
				class:bg-[#00AAE4]={displayMode === 'value'}
				class:text-white={displayMode === 'value'}
				class:text-[#808080]={displayMode !== 'value'}
			>
				Value
			</button>
		</div>
	</div>

	{#if orderbook}
		<div class="flex flex-1 flex-col space-y-2 overflow-hidden">
			<!-- Asks (Sell orders) - in reverse order (lowest ask at bottom) -->
			<div class="flex-1 space-y-0.5 overflow-y-auto">
				{#each orderbook.asks.slice(0, 10).reverse() as [price, size], i (i)}
					{@const amount =
						displayMode === 'size' ? parseFloat(size) : parseFloat(price) * parseFloat(size)}
					{@const barWidth = (amount / maxAskValue) * 100}
					<button
						class="relative flex w-full justify-between font-mono text-sm transition-opacity hover:opacity-70"
						onclick={() => onPriceClick?.(price)}
					>
						<div class="absolute inset-y-0 right-0 bg-red-500/10" style="width: {barWidth}%"></div>
						<span class="relative z-10 text-red-400">{parseFloat(price).toFixed(4)}</span>
						<span class="relative z-10 text-[#B0B0B0]">
							{displayMode === 'size' ? parseFloat(size).toFixed(2) : amount.toFixed(2)}
						</span>
					</button>
				{/each}
			</div>

			<!-- Spread -->
			{#if orderbook.asks.length > 0 && orderbook.bids.length > 0}
				{@const spread = parseFloat(orderbook.asks[0][0]) - parseFloat(orderbook.bids[0][0])}
				<div class="border-y border-[#2A2A2A] py-2 text-center text-xs text-[#808080]">
					Spread: ${spread.toFixed(4)}
				</div>
			{/if}

			<!-- Bids (Buy orders) -->
			<div class="flex-1 space-y-0.5 overflow-y-auto">
				{#each orderbook.bids.slice(0, 10) as [price, size], i (i)}
					{@const amount =
						displayMode === 'size' ? parseFloat(size) : parseFloat(price) * parseFloat(size)}
					{@const barWidth = (amount / maxBidValue) * 100}
					<button
						class="relative flex w-full justify-between font-mono text-sm transition-opacity hover:opacity-70"
						onclick={() => onPriceClick?.(price)}
					>
						<div
							class="absolute inset-y-0 right-0 bg-green-500/10"
							style="width: {barWidth}%"
						></div>
						<span class="relative z-10 text-green-400">{parseFloat(price).toFixed(4)}</span>
						<span class="relative z-10 text-[#B0B0B0]">
							{displayMode === 'size' ? parseFloat(size).toFixed(2) : amount.toFixed(2)}
						</span>
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex h-full items-center justify-center text-[#808080]">Loading order book...</div>
	{/if}
</div>
