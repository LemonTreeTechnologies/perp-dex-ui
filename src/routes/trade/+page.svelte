<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { marketDataStore, currentPrice } from '$lib/stores/marketData';
	import { walletStore } from '$lib/stores/wallet';
	import PriceChart from '$lib/components/trade/PriceChart.svelte';
	import OrderBook from '$lib/components/trade/OrderBook.svelte';
	import OrderForm from '$lib/components/trade/OrderForm.svelte';
	import PositionsTable from '$lib/components/trade/PositionsTable.svelte';
	import OrdersTable from '$lib/components/trade/OrdersTable.svelte';
	import TradesTable from '$lib/components/trade/TradesTable.svelte';

	let activeTab: 'positions' | 'orders' | 'trades' = $state('positions');

	onMount(() => {
		// Connect to WebSocket for real-time data
		marketDataStore.connect();
		// Fetch initial orderbook data
		marketDataStore.fetchInitialData();

		// Subscribe to user channel if wallet is connected
		if ($walletStore.isConnected && $walletStore.address) {
			marketDataStore.subscribeToUser($walletStore.address);
		}
	});

	onDestroy(() => {
		marketDataStore.disconnect();
	});

	// Subscribe to user channel when wallet connects
	$effect(() => {
		if ($walletStore.isConnected && $walletStore.address) {
			marketDataStore.subscribeToUser($walletStore.address);
		}
	});
</script>

<div class="space-y-4">
	<!-- Market Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<h1 class="text-2xl font-bold text-white">XRP-RLUSD-PERP</h1>
			{#if $currentPrice}
				<div class="text-3xl font-bold text-[#00AAE4]">
					${$currentPrice.toFixed(4)}
				</div>
			{/if}
			<div
				class="flex items-center space-x-2"
				class:text-green-400={$marketDataStore.connected}
				class:text-red-400={!$marketDataStore.connected}
			>
				<div
					class="h-2 w-2 rounded-full"
					class:bg-green-400={$marketDataStore.connected}
					class:bg-red-400={!$marketDataStore.connected}
				></div>
				<span class="text-sm">
					{$marketDataStore.connected ? 'Connected' : 'Disconnected'}
				</span>
			</div>
		</div>
	</div>

	<!-- Main Trading Interface -->
	<div class="grid grid-cols-12 gap-4">
		<!-- Chart -->
		<div class="col-span-5">
			<div class="flex h-[600px] flex-col rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
				<PriceChart />
			</div>
		</div>

		<!-- Order Book -->
		<div class="col-span-4">
			<div class="flex h-[600px] flex-col rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
				<OrderBook />
			</div>
		</div>

		<!-- Order Form -->
		<div class="col-span-3">
			<div class="flex h-[600px] flex-col rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
				<OrderForm />
			</div>
		</div>
	</div>

	<!-- Positions / Orders / Trades Tabs -->
	<div class="rounded-lg border border-[#2A2A2A] bg-[#121212]">
		<!-- Tabs -->
		<div class="flex border-b border-[#2A2A2A]">
			<button
				class="px-6 py-3 text-sm font-medium transition-colors"
				class:text-[#00AAE4]={activeTab === 'positions'}
				class:border-b-2={activeTab === 'positions'}
				class:border-[#00AAE4]={activeTab === 'positions'}
				class:text-[#B0B0B0]={activeTab !== 'positions'}
				onclick={() => (activeTab = 'positions')}
			>
				Positions
			</button>
			<button
				class="px-6 py-3 text-sm font-medium transition-colors"
				class:text-[#00AAE4]={activeTab === 'orders'}
				class:border-b-2={activeTab === 'orders'}
				class:border-[#00AAE4]={activeTab === 'orders'}
				class:text-[#B0B0B0]={activeTab !== 'orders'}
				onclick={() => (activeTab = 'orders')}
			>
				Open Orders
			</button>
			<button
				class="px-6 py-3 text-sm font-medium transition-colors"
				class:text-[#00AAE4]={activeTab === 'trades'}
				class:border-b-2={activeTab === 'trades'}
				class:border-[#00AAE4]={activeTab === 'trades'}
				class:text-[#B0B0B0]={activeTab !== 'trades'}
				onclick={() => (activeTab = 'trades')}
			>
				Trade History
			</button>
		</div>

		<!-- Tab Content -->
		<div class="p-4">
			{#if activeTab === 'positions'}
				<PositionsTable />
			{:else if activeTab === 'orders'}
				<OrdersTable />
			{:else}
				<TradesTable />
			{/if}
		</div>
	</div>
</div>
