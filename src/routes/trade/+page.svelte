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
	let positionsTableRef: PositionsTable | null = $state(null);
	let ordersTableRef: OrdersTable | null = $state(null);
	let orderFormRef: OrderForm | null = $state(null);

	function handlePriceClick(price: string) {
		orderFormRef?.setPrice(price);
	}

	async function refreshUserData() {
		if (!$walletStore.isConnected || !$walletStore.address) {
			return;
		}

		// Refresh positions and orders silently (no loading flash)
		const promises = [];
		if (positionsTableRef) {
			promises.push(positionsTableRef.loadPositions(true).catch(console.error));
		}
		if (ordersTableRef) {
			promises.push(ordersTableRef.loadOrders(true).catch(console.error));
		}
		await Promise.allSettled(promises);
	}

	onMount(() => {
		// Connect to WebSocket for real-time data
		marketDataStore.connect();
		// Fetch initial orderbook data
		marketDataStore.fetchInitialData();

		// Subscribe to user channel if wallet is connected
		if ($walletStore.isConnected && $walletStore.address) {
			marketDataStore.subscribeToUser($walletStore.address);
		}

		// Register refresh callback for polling
		marketDataStore.registerRefreshCallback(refreshUserData);
	});

	onDestroy(() => {
		marketDataStore.unregisterRefreshCallback(refreshUserData);
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
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex flex-wrap items-center gap-2 sm:gap-4">
			<h1 class="text-xl font-bold text-white sm:text-2xl">XRP-USD-PERP</h1>
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
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
		<!-- Chart -->
		<div class="lg:col-span-5">
			<div
				class="flex h-[400px] flex-col rounded-lg border border-[#2A2A2A] bg-[#121212] p-4 lg:h-[600px]"
			>
				<PriceChart />
			</div>
		</div>

		<!-- Order Book -->
		<div class="lg:col-span-4">
			<div
				class="flex h-[400px] flex-col rounded-lg border border-[#2A2A2A] bg-[#121212] p-4 lg:h-[600px]"
			>
				<OrderBook onPriceClick={handlePriceClick} />
			</div>
		</div>

		<!-- Order Form -->
		<div class="lg:col-span-3">
			<div class="flex flex-col rounded-lg border border-[#2A2A2A] bg-[#121212] p-4 lg:h-[600px]">
				<OrderForm bind:this={orderFormRef} />
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
				<PositionsTable bind:this={positionsTableRef} />
			{:else if activeTab === 'orders'}
				<OrdersTable bind:this={ordersTableRef} />
			{:else}
				<TradesTable />
			{/if}
		</div>
	</div>
</div>
