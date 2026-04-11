<script lang="ts">
	import { onMount } from 'svelte';

	interface Candle {
		time: number;
		open: number;
		high: number;
		low: number;
		close: number;
		volume: number;
	}

	let chartData: Candle[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	// Fetch price data from Binance
	async function fetchPriceData() {
		try {
			loading = true;
			error = '';
			const response = await fetch(
				'https://api.binance.com/api/v3/klines?symbol=XRPUSDT&interval=1m&limit=500'
			);

			if (!response.ok) {
				throw new Error('Failed to fetch price data');
			}

			const data = await response.json();

			// Binance klines format:
			// [
			//   [openTime, open, high, low, close, volume, closeTime, ...]
			// ]
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			chartData = data.map((candle: any[]) => ({
				time: candle[0], // openTime
				open: parseFloat(candle[1]),
				high: parseFloat(candle[2]),
				low: parseFloat(candle[3]),
				close: parseFloat(candle[4]),
				volume: parseFloat(candle[5])
			}));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load chart data';
			console.error('Failed to fetch price data:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchPriceData();
		// Refresh every 30 seconds
		const interval = setInterval(fetchPriceData, 30000);
		return () => clearInterval(interval);
	});

	// Compute price change
	let priceChange = $derived.by(() => {
		if (chartData.length < 2) return { value: 0, percentage: 0 };
		const first = chartData[0].close;
		const last = chartData[chartData.length - 1].close;
		const change = last - first;
		const percentage = (change / first) * 100;
		return { value: change, percentage };
	});

	// Get current price (last close)
	let currentPrice = $derived(chartData.length > 0 ? chartData[chartData.length - 1].close : null);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">Price Chart</h3>
		<div class="flex items-center space-x-4">
			{#if currentPrice}
				<div class="text-lg font-bold text-[#00AAE4]">
					${currentPrice.toFixed(4)}
				</div>
			{/if}
			{#if priceChange}
				<div
					class="text-sm"
					class:text-green-400={priceChange.value >= 0}
					class:text-red-400={priceChange.value < 0}
				>
					{priceChange.value >= 0 ? '+' : ''}{priceChange.value.toFixed(4)} ({priceChange.percentage.toFixed(
						2
					)}%)
				</div>
			{/if}
		</div>
	</div>

	{#if loading}
		<div class="flex h-64 items-center justify-center text-[#808080]">Loading chart data...</div>
	{:else if error}
		<div class="flex h-64 items-center justify-center text-red-400">
			{error}
		</div>
	{:else if chartData.length > 0}
		<div class="h-64 w-full">
			<svg class="h-full w-full" viewBox="0 0 800 256" preserveAspectRatio="none">
				<!-- Grid lines -->
				<defs>
					<pattern id="grid" width="80" height="51.2" patternUnits="userSpaceOnUse">
						<path d="M 80 0 L 0 0 0 51.2" fill="none" stroke="#2A2A2A" stroke-width="0.5" />
					</pattern>
				</defs>
				<rect width="800" height="256" fill="url(#grid)" />

				<!-- Price line -->
				{#if chartData.length > 1}
					{@const minPrice = Math.min(...chartData.map((d) => d.close))}
					{@const maxPrice = Math.max(...chartData.map((d) => d.close))}
					{@const priceRange = maxPrice - minPrice || 1}
					{@const points = chartData
						.map((d, i) => {
							const x = (i / (chartData.length - 1)) * 800;
							const y = 256 - ((d.close - minPrice) / priceRange) * 236 - 10;
							return `${x},${y}`;
						})
						.join(' ')}

					<!-- Area fill -->
					<linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style="stop-color:#00AAE4;stop-opacity:0.3" />
						<stop offset="100%" style="stop-color:#00AAE4;stop-opacity:0" />
					</linearGradient>
					<polygon points="{points} 800,256 0,256" fill="url(#priceGradient)" />

					<!-- Line -->
					<polyline
						{points}
						fill="none"
						stroke="#00AAE4"
						stroke-width="2"
						class="drop-shadow-[0_0_8px_rgba(0,170,228,0.6)]"
					/>
				{/if}
			</svg>
		</div>

		<!-- Price labels -->
		<div class="flex justify-between text-xs text-[#808080]">
			<span>{new Date(chartData[0].time).toLocaleTimeString()}</span>
			<span>Last 500 minutes</span>
			<span>{new Date(chartData[chartData.length - 1].time).toLocaleTimeString()}</span>
		</div>
	{:else}
		<div class="flex h-64 items-center justify-center text-[#808080]">
			Waiting for trade data...
		</div>
	{/if}
</div>
