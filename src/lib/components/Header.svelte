<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';

	async function connectWallet() {
		if (typeof window.xrpl === 'undefined') {
			alert('Please install an XRPL wallet extension (e.g., Crossmark, Xaman, or GemWallet)');
			return;
		}

		try {
			// Try GemWallet first
			if (window.gemWallet) {
				const response = await window.gemWallet.connect();
				if (response.result) {
					walletStore.set({
						address: response.result.address,
						publicKey: response.result.publicKey,
						isConnected: true
					});
				}
			}
			// Try Crossmark
			else if (window.crossmark) {
				const response = await window.crossmark.connect();
				if (response) {
					walletStore.set({
						address: response.address,
						publicKey: response.publicKey,
						isConnected: true
					});
				}
			} else {
				alert('No compatible XRPL wallet found. Please install GemWallet or Crossmark.');
			}
		} catch (error) {
			console.error('Failed to connect wallet:', error);
			alert('Failed to connect wallet. Please try again.');
		}
	}

	function disconnectWallet() {
		walletStore.set({
			address: null,
			publicKey: null,
			isConnected: false
		});
	}

	function formatAddress(address: string): string {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}
</script>

<header class="border-b border-gray-200 bg-white">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo/Brand -->
			<div class="flex items-center">
				<h1 class="text-2xl font-bold text-gray-900">
					<span class="text-blue-600">XRPL</span> Perp DEX
				</h1>
			</div>

			<!-- Navigation (placeholder for future menu items) -->
			<nav class="hidden md:flex md:items-center md:space-x-8">
				<a href="/" class="text-gray-700 hover:text-gray-900">Trade</a>
				<a href="/portfolio" class="text-gray-700 hover:text-gray-900">Portfolio</a>
				<a href="/markets" class="text-gray-700 hover:text-gray-900">Markets</a>
			</nav>

			<!-- Wallet Connection -->
			<div class="flex items-center">
				{#if $walletStore.isConnected && $walletStore.address}
					<div class="flex items-center space-x-4">
						<div
							class="rounded-lg bg-gray-100 px-4 py-2 font-mono text-sm text-gray-700"
						>
							{formatAddress($walletStore.address)}
						</div>
						<button
							onclick={disconnectWallet}
							class="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
						>
							Disconnect
						</button>
					</div>
				{:else}
					<button
						onclick={connectWallet}
						class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
					>
						Connect Wallet
					</button>
				{/if}
			</div>
		</div>
	</div>
</header>
