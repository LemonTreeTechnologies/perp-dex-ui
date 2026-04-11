<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { authApi, type Position } from '$lib/api/client';
	import { generateAuthHeaders } from '$lib/utils/xrplAuth';

	let positions: Position[] = $state([]);
	let loading = $state(false);
	let error = $state('');

	async function loadPositions() {
		if (!$walletStore.isConnected || !$walletStore.address) {
			error = 'Please connect your wallet first';
			return;
		}

		try {
			loading = true;
			error = '';

			const headers = await generateAuthHeaders(
				'GET',
				`/v1/account/balance?user_id=${$walletStore.address}`
			);
			const balance = await authApi.getBalance($walletStore.address, headers);
			positions = balance.positions || [];
		} catch (err) {
			console.error('Failed to load positions:', err);
			error = err instanceof Error ? err.message : 'Failed to load positions';
		} finally {
			loading = false;
		}
	}

	function calculatePnL(position: Position): number {
		return parseFloat(position.unrealized_pnl);
	}

	function calculateROI(position: Position): number {
		const pnl = parseFloat(position.unrealized_pnl);
		const margin = parseFloat(position.margin);
		return margin > 0 ? (pnl / margin) * 100 : 0;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-medium text-white">Open Positions</h3>
		{#if $walletStore.isConnected}
			<button
				onclick={loadPositions}
				disabled={loading}
				class="rounded bg-[#00AAE4] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#0088B8] disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Loading...' : 'Fetch Positions'}
			</button>
		{/if}
	</div>

	{#if !$walletStore.isConnected}
		<div class="text-center text-[#B0B0B0]">Connect your wallet to view positions</div>
	{:else if error}
		<div class="text-center text-red-400">{error}</div>
	{:else if positions.length === 0 && !loading}
		<div class="text-center text-[#B0B0B0]">
			No open positions. Click "Fetch Positions" to load.
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-[#2A2A2A] text-left text-sm text-[#808080]">
						<th class="pb-2">Side</th>
						<th class="pb-2 text-right">Size</th>
						<th class="pb-2 text-right">Entry Price</th>
						<th class="pb-2 text-right">Margin</th>
						<th class="pb-2 text-right">PnL</th>
						<th class="pb-2 text-right">ROI</th>
					</tr>
				</thead>
				<tbody>
					{#each positions as position (position.position_id)}
						{@const pnl = calculatePnL(position)}
						{@const roi = calculateROI(position)}
						<tr class="border-b border-[#2A2A2A] text-sm">
							<td class="py-3">
								<span
									class="rounded px-2 py-1 text-xs font-medium {position.side === 'long'
										? 'bg-green-500/20 text-green-400'
										: 'bg-red-500/20 text-red-400'}"
								>
									{position.side.toUpperCase()}
								</span>
							</td>
							<td class="py-3 text-right font-mono text-white">
								{parseFloat(position.size).toFixed(2)}
							</td>
							<td class="py-3 text-right font-mono text-white">
								${parseFloat(position.entry_price).toFixed(4)}
							</td>
							<td class="py-3 text-right font-mono text-white">
								${parseFloat(position.margin).toFixed(2)}
							</td>
							<td
								class="py-3 text-right font-mono"
								class:text-green-400={pnl >= 0}
								class:text-red-400={pnl < 0}
							>
								{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
							</td>
							<td
								class="py-3 text-right font-mono"
								class:text-green-400={roi >= 0}
								class:text-red-400={roi < 0}
							>
								{roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
