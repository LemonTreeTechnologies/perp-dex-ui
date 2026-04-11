<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { authApi, type Order } from '$lib/api/client';

	let orders: Order[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let initialLoadDone = $state(false);

	export async function loadOrders(silent = false) {
		if (!$walletStore.isConnected || !$walletStore.address) {
			error = 'Please connect your wallet first';
			return;
		}

		try {
			// Only show loading indicator on initial load, not on auto-refresh
			if (!silent && !initialLoadDone) {
				loading = true;
			}
			error = '';

			// Use token-based auth - authApi will use stored token when available
			orders = await authApi.getOrders($walletStore.address);
			initialLoadDone = true;
		} catch (err) {
			console.error('Failed to load orders:', err);
			error = err instanceof Error ? err.message : 'Failed to load orders';
		} finally {
			loading = false;
		}
	}

	async function cancelOrder(orderId: number) {
		if (!$walletStore.isConnected || !$walletStore.address) {
			return;
		}

		try {
			await authApi.cancelOrder(orderId);
			await loadOrders();
		} catch (err) {
			console.error('Failed to cancel order:', err);
			error = err instanceof Error ? err.message : 'Failed to cancel order';
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium text-white">Open Orders</h3>
	</div>

	{#if !$walletStore.isConnected}
		<div class="text-center text-[#B0B0B0]">Connect your wallet to view orders</div>
	{:else if error}
		<div class="text-center text-red-400">{error}</div>
	{:else if orders.length === 0 && !loading}
		<div class="text-center text-[#B0B0B0]">No open orders</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-[#2A2A2A] text-left text-sm text-[#808080]">
						<th class="pb-2">Side</th>
						<th class="pb-2">Type</th>
						<th class="pb-2 text-right">Price</th>
						<th class="pb-2 text-right">Size</th>
						<th class="pb-2 text-right">Filled</th>
						<th class="pb-2">Status</th>
						<th class="pb-2 text-right">Action</th>
					</tr>
				</thead>
				<tbody>
					{#each orders as order (order.order_id)}
						<tr class="border-b border-[#2A2A2A] text-sm">
							<td class="py-3">
								<span
									class="rounded px-2 py-1 text-xs font-medium {order.side === 'long'
										? 'bg-green-500/20 text-green-400'
										: 'bg-red-500/20 text-red-400'}"
								>
									{order.side.toUpperCase()}
								</span>
							</td>
							<td class="py-3 text-white">{order.type}</td>
							<td class="py-3 text-right font-mono text-white">
								{#if order.price}
									${parseFloat(order.price).toFixed(4)}
								{:else}
									Market
								{/if}
							</td>
							<td class="py-3 text-right font-mono text-white">
								{parseFloat(order.size).toFixed(2)}
							</td>
							<td class="py-3 text-right font-mono text-[#B0B0B0]">
								{parseFloat(order.filled).toFixed(2)}
							</td>
							<td class="py-3">
								<span
									class="rounded px-2 py-1 text-xs {order.status === 'Open'
										? 'bg-[#00AAE4]/20 text-[#00AAE4]'
										: order.status === 'PartiallyFilled'
											? 'bg-yellow-500/20 text-yellow-400'
											: ''}"
								>
									{order.status}
								</span>
							</td>
							<td class="py-3 text-right">
								<button
									onclick={() => cancelOrder(order.order_id)}
									class="text-xs text-red-400 transition-colors hover:text-red-300"
								>
									Cancel
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
