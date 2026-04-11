<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
</script>

<div class="space-y-8">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-white">
			Trade Perpetual Futures on <span class="xrp-glow text-[#00AAE4]">XRP Ledger</span>
		</h1>
		<p class="mt-4 text-xl text-[#B0B0B0]">
			Decentralized perpetual swap trading with up to 20x leverage
		</p>
	</div>

	{#if !$walletStore.isConnected}
		<div
			class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-8 text-center transition-colors hover:border-[#00AAE4]"
		>
			<h2 class="text-2xl font-semibold text-white">Get Started</h2>
			<p class="mt-2 text-[#B0B0B0]">Connect your XRPL wallet to start trading perpetual futures</p>
		</div>
	{:else}
		<div
			class="rounded-lg border border-[#00AAE4] bg-[#121212] p-8 shadow-[0_0_20px_rgba(0,170,228,0.2)]"
		>
			<h2 class="text-2xl font-semibold text-white">Welcome!</h2>
			<p class="mt-2 text-[#B0B0B0]">Your wallet is connected. Trading interface coming soon...</p>
		</div>
	{/if}
</div>
