<script lang="ts">
	import { marketDataStore } from '$lib/stores/marketData';

	let orderbook = $derived($marketDataStore.orderbook);
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold text-white">Order Book</h3>

	{#if orderbook}
		<div class="space-y-2">
			<!-- Asks (Sell orders) - in reverse order (lowest ask at bottom) -->
			<div class="space-y-0.5">
				{#each orderbook.asks.slice(0, 10).reverse() as [price, size], i (i)}
					<div class="flex justify-between font-mono text-sm">
						<span class="text-red-400">{parseFloat(price).toFixed(4)}</span>
						<span class="text-[#B0B0B0]">{parseFloat(size).toFixed(2)}</span>
					</div>
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
			<div class="space-y-0.5">
				{#each orderbook.bids.slice(0, 10) as [price, size], i (i)}
					<div class="flex justify-between font-mono text-sm">
						<span class="text-green-400">{parseFloat(price).toFixed(4)}</span>
						<span class="text-[#B0B0B0]">{parseFloat(size).toFixed(2)}</span>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex h-64 items-center justify-center text-[#808080]">Loading order book...</div>
	{/if}
</div>
