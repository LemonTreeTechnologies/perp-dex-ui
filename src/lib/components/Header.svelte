<script lang="ts">
	import { resolve } from '$app/paths';
	import { walletStore } from '$lib/stores/wallet';

	async function connectWallet() {
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
					return;
				}
			}
			// Try Crossmark
			else if (window.crossmark?.methods) {
				console.log('Connecting with Crossmark...');
				const signInResponse = await window.crossmark.methods.signInAndWait();
				console.log('Crossmark response:', signInResponse);

				// Crossmark returns the user data directly
				if (signInResponse?.address) {
					walletStore.set({
						address: signInResponse.address,
						publicKey: signInResponse.publicKey || '',
						isConnected: true
					});
					return;
				} else if (signInResponse?.response?.data?.address) {
					// Alternative response format
					walletStore.set({
						address: signInResponse.response.data.address,
						publicKey: signInResponse.response.data.publicKey || '',
						isConnected: true
					});
					return;
				}
			}
			// Try Xaman (formerly Xumm)
			else if (window.xaman) {
				// Xaman uses a different flow - typically redirects
				alert('Xaman wallet detected. Please use the Xaman app to connect.');
				return;
			} else {
				alert('No compatible XRPL wallet found. Please install GemWallet or Crossmark extension.');
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

			<!-- Navigation -->
			<nav class="hidden md:flex md:items-center md:space-x-8">
				<a href={resolve('/')} class="text-gray-700 hover:text-gray-900">Trade</a>
				<a href={resolve('/')} class="text-gray-700 hover:text-gray-900">Portfolio</a>
				<a href={resolve('/')} class="text-gray-700 hover:text-gray-900">Markets</a>
				<a href={resolve('/verify')} class="text-gray-700 hover:text-gray-900"
					>Verify Enclave</a
				>
			</nav>

			<!-- Wallet Connection -->
			<div class="flex items-center">
				{#if $walletStore.isConnected && $walletStore.address}
					<div class="flex items-center space-x-4">
						<div class="rounded-lg bg-gray-100 px-4 py-2 font-mono text-sm text-gray-700">
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
