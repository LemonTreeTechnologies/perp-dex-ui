<script lang="ts">
	import { marketDataStore } from '$lib/stores/marketData';

	let trades = $derived($marketDataStore.trades.slice(0, 20));
</script>

<div class="space-y-4">
	{#if trades.length === 0}
		<div class="text-center text-[#B0B0B0]">No recent trades</div>
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
