<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { authApi, type Trade } from '$lib/api/client';

	let trades: Trade[] = $state([]);
	let loading = $state(false);
	let error = $state('');
	let initialLoadDone = $state(false);

	export async function loadTrades(silent = false) {
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
			trades = await authApi.getUserTrades($walletStore.address);
			initialLoadDone = true;
		} catch (err) {
			console.error('Failed to load trades:', err);
			error = err instanceof Error ? err.message : 'Failed to load trades';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium text-white">Trade History</h3>
	</div>

	{#if error}
		<div class="rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
	{:else if !$walletStore.isConnected}
		<div class="text-center text-[#B0B0B0]">
			Please connect your wallet to view your trade history
		</div>
	{:else if loading && !initialLoadDone}
		<div class="text-center text-[#B0B0B0]">Loading trades...</div>
	{:else if trades.length === 0}
		<div class="text-center text-[#B0B0B0]">No trade history</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-[#2A2A2A] text-left text-sm text-[#808080]">
						<th class="pb-2">Time</th>
						<th class="pb-2 text-right">Price</th>
						<th class="pb-2 text-right">Size</th>
						<th class="pb-2">Side</th>
					</tr>
				</thead>
				<tbody>
					{#each trades as trade (trade.trade_id)}
						<tr class="border-b border-[#2A2A2A] text-sm">
							<td class="py-2 text-[#B0B0B0]">
								{new Date(trade.timestamp_ms).toLocaleTimeString()}
							</td>
							<td
								class="py-2 text-right font-mono {trade.taker_side === 'long'
									? 'text-green-400'
									: 'text-red-400'}"
							>
								${parseFloat(trade.price).toFixed(4)}
							</td>
							<td class="py-2 text-right font-mono text-white">
								{parseFloat(trade.size).toFixed(2)}
							</td>
							<td class="py-2">
								<span
									class="rounded px-2 py-1 text-xs font-medium {trade.taker_side === 'long'
										? 'bg-green-500/20 text-green-400'
										: 'bg-red-500/20 text-red-400'}"
								>
									{trade.taker_side.toUpperCase()}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
