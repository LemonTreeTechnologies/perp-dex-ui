<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
</script>

<div class="space-y-8">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-gray-900">
			Trade Perpetual Futures on <span class="text-blue-600">XRP Ledger</span>
		</h1>
		<p class="mt-4 text-xl text-gray-600">
			Decentralized perpetual swap trading with up to 20x leverage
		</p>
	</div>

	{#if !$walletStore.isConnected}
		<div class="rounded-lg bg-blue-50 p-8 text-center">
			<h2 class="text-2xl font-semibold text-gray-900">Get Started</h2>
			<p class="mt-2 text-gray-600">
				Connect your XRPL wallet to start trading perpetual futures
			</p>
		</div>
	{:else}
		<div class="rounded-lg bg-white p-8 shadow">
			<h2 class="text-2xl font-semibold text-gray-900">Welcome!</h2>
			<p class="mt-2 text-gray-600">
				Your wallet is connected. Trading interface coming soon...
			</p>
		</div>
	{/if}
</div>
