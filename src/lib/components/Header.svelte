<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { authStore } from '$lib/stores/auth';
	import { authApi } from '$lib/api/client';
	import { generateAuthHeaders } from '$lib/utils/xrplAuth';

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

					// Auto-login after connection
					await performLogin();
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

					// Auto-login after connection
					await performLogin();
					return;
				} else if (signInResponse?.response?.data?.address) {
					// Alternative response format
					walletStore.set({
						address: signInResponse.response.data.address,
						publicKey: signInResponse.response.data.publicKey || '',
						isConnected: true
					});

					// Auto-login after connection
					await performLogin();
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

	async function performLogin() {
		try {
			console.log('Performing auto-login...');
			const headers = await generateAuthHeaders('POST', '');
			const { token } = await authApi.login(headers);
			authStore.setToken(token);
			console.log('Auto-login successful');
		} catch (error) {
			console.error('Auto-login failed:', error);
			// Don't show alert for auto-login failures
		}
	}

	function disconnectWallet() {
		walletStore.set({
			address: null,
			publicKey: null,
			isConnected: false
		});
		authStore.clearToken();
	}

	function formatAddress(address: string): string {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}
</script>

<header class="border-b border-[#2A2A2A] bg-[#121212]">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo/Brand -->
			<a href="/" class="flex items-center space-x-3">
				<img src="/logo.svg" alt="XRPL Perp DEX Logo" class="h-40 w-40" />
			</a>

			<!-- Navigation -->
			<nav class="hidden md:flex md:items-center md:space-x-8">
				<a
					href="/trade"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">Trade</a
				>
				<a
					href="/portfolio"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">Portfolio</a
				>
				<a
					href="/markets"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">Markets</a
				>
				<a
					href="/verify"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">Verify Enclave</a
				>
				<a
					href="/about"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">How It Works</a
				>
			</nav>
			<!-- Wallet Connection -->
			<div class="flex items-center">
				{#if $walletStore.isConnected && $walletStore.address}
					<div class="flex items-center space-x-4">
						<div
							class="flex items-center space-x-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2"
						>
							<img src="/avatar.svg" alt="Wallet Avatar" class="h-6 w-6" />
							<span class="font-mono text-sm text-[#00AAE4]">
								{formatAddress($walletStore.address)}
							</span>
						</div>
						<button
							onclick={disconnectWallet}
							class="rounded-lg border border-[#404040] bg-[#2A2A2A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#404040]"
						>
							Disconnect
						</button>
					</div>
				{:else}
					<button
						onclick={connectWallet}
						class="rounded-lg bg-[#00AAE4] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#0088B8] hover:shadow-[0_0_20px_rgba(0,170,228,0.4)]"
					>
						Connect Wallet
					</button>
				{/if}
			</div>
		</div>
	</div>
</header>
