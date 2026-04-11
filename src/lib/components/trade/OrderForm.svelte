<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { currentPrice } from '$lib/stores/marketData';
	import { authApi, toFP8, type OrderRequest } from '$lib/api/client';

	let orderType: 'market' | 'limit' = $state('limit');
	let side: 'long' | 'short' = $state('long');
	let price = $state('');
	let size = $state('');
	let leverage = $state(1);
	let isSubmitting = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Expose method to set price from outside
	export function setPrice(newPrice: string) {
		// Switch to limit order if not already
		if (orderType !== 'limit') {
			orderType = 'limit';
		}
		price = parseFloat(newPrice).toFixed(4);
	}

	// Auto-fill price with current market price for limit orders
	$effect(() => {
		if (orderType === 'limit' && !price && $currentPrice) {
			price = $currentPrice.toFixed(4);
		}
	});

	async function submitOrder() {
		if (!$walletStore.isConnected || !$walletStore.address) {
			error = 'Please connect your wallet first';
			return;
		}

		if (!size || parseFloat(size) <= 0) {
			error = 'Please enter a valid size';
			return;
		}

		if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
			error = 'Please enter a valid price';
			return;
		}

		isSubmitting = true;
		error = '';
		successMessage = '';

		try {
			const orderRequest: OrderRequest = {
				user_id: $walletStore.address,
				side: side,
				type: orderType,
				size: toFP8(size),
				leverage: leverage,
				time_in_force: 'gtc',
				reduce_only: false
			};

			// Add price for limit orders
			if (orderType === 'limit') {
				orderRequest.price = toFP8(price);
			}

			// Use token-based auth - authApi will attach the token if available
			const response = await authApi.submitOrder(orderRequest);

			successMessage = `Order submitted successfully! Order ID: ${response.order_id || 'N/A'}`;

			// Clear form on success
			price = orderType === 'limit' && $currentPrice ? $currentPrice.toFixed(4) : '';
			size = '';

			// Clear success message after 5 seconds
			setTimeout(() => {
				successMessage = '';
			}, 5000);
		} catch (err) {
			console.error('Order submission error:', err);
			error = err instanceof Error ? err.message : 'Failed to submit order';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex h-full flex-col space-y-4">
	<h3 class="text-lg font-semibold text-white">Place Order</h3>

	{#if !$walletStore.isConnected}
		<div
			class="flex flex-1 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-center text-[#B0B0B0]"
		>
			Connect your wallet to start trading
		</div>
	{:else}
		<div class="flex flex-1 flex-col space-y-4 overflow-y-auto">
			<!-- Order Type Tabs -->
			<div class="flex space-x-2">
				<button
					class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					class:bg-[#00AAE4]={orderType === 'limit'}
					class:text-white={orderType === 'limit'}
					class:bg-[#1A1A1A]={orderType !== 'limit'}
					class:text-[#B0B0B0]={orderType !== 'limit'}
					onclick={() => (orderType = 'limit')}
				>
					Limit
				</button>
				<button
					class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					class:bg-[#00AAE4]={orderType === 'market'}
					class:text-white={orderType === 'market'}
					class:bg-[#1A1A1A]={orderType !== 'market'}
					class:text-[#B0B0B0]={orderType !== 'market'}
					onclick={() => (orderType = 'market')}
				>
					Market
				</button>
			</div>

			<!-- Side Tabs -->
			<div class="flex space-x-2">
				<button
					class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					class:bg-green-500={side === 'long'}
					class:text-white={side === 'long'}
					class:bg-[#1A1A1A]={side !== 'long'}
					class:text-[#B0B0B0]={side !== 'long'}
					onclick={() => (side = 'long')}
				>
					Long
				</button>
				<button
					class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					class:bg-red-500={side === 'short'}
					class:text-white={side === 'short'}
					class:bg-[#1A1A1A]={side !== 'short'}
					class:text-[#B0B0B0]={side !== 'short'}
					onclick={() => (side = 'short')}
				>
					Short
				</button>
			</div>

			<!-- Price Input (only for limit orders) -->
			{#if orderType === 'limit'}
				<div>
					<label class="mb-2 block text-sm font-medium text-[#B0B0B0]">Price (USD)</label>
					<input
						type="number"
						step="0.0001"
						bind:value={price}
						placeholder="0.0000"
						class="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-white placeholder-[#808080] focus:border-[#00AAE4] focus:outline-none"
					/>
				</div>
			{/if}

			<!-- Size Input -->
			<div>
				<label class="mb-2 block text-sm font-medium text-[#B0B0B0]">Size (XRP)</label>
				<input
					type="number"
					step="0.01"
					bind:value={size}
					placeholder="0.00"
					class="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-white placeholder-[#808080] focus:border-[#00AAE4] focus:outline-none"
				/>
			</div>

			<!-- Leverage Slider -->
			<div>
				<label class="mb-2 block text-sm font-medium text-[#B0B0B0]">
					Leverage: {leverage}x
				</label>
				<input
					type="range"
					min="1"
					max="20"
					bind:value={leverage}
					class="w-full accent-[#00AAE4]"
				/>
				<div class="mt-1 flex justify-between text-xs text-[#808080]">
					<span>1x</span>
					<span>20x</span>
				</div>
			</div>

			<!-- Order Info -->
			{#if size && (orderType === 'market' || price)}
				{@const orderSize = parseFloat(size)}
				{@const orderPrice = orderType === 'market' ? $currentPrice || 0 : parseFloat(price)}
				{@const totalValue = orderSize * orderPrice}
				{@const marginRequired = totalValue / leverage}

				<div class="space-y-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3 text-sm">
					<div class="flex justify-between text-[#B0B0B0]">
						<span>Total Value:</span>
						<span class="font-mono text-white">${totalValue.toFixed(2)}</span>
					</div>
					<div class="flex justify-between text-[#B0B0B0]">
						<span>Margin Required:</span>
						<span class="font-mono text-white">${marginRequired.toFixed(2)}</span>
					</div>
				</div>
			{/if}

			<!-- Error Message -->
			{#if error}
				<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
					{error}
				</div>
			{/if}

			<!-- Success Message -->
			{#if successMessage}
				<div
					class="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-400"
				>
					{successMessage}
				</div>
			{/if}

			<!-- Submit Button -->
			<button
				onclick={submitOrder}
				disabled={isSubmitting}
				class="w-full rounded-lg px-6 py-3 font-medium text-white transition-all disabled:opacity-50"
				class:bg-green-500={side === 'long'}
				class:hover:bg-green-600={side === 'long' && !isSubmitting}
				class:bg-red-500={side === 'short'}
				class:hover:bg-red-600={side === 'short' && !isSubmitting}
			>
				{isSubmitting
					? 'Submitting...'
					: `${side === 'long' ? 'Buy' : 'Sell'} / ${side.toUpperCase()}`}
			</button>
		</div>
	{/if}
</div>
