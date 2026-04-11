<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { authStore } from '$lib/stores/auth';
	import { authApi } from '$lib/api/client';
	import { generatePostAuthHeaders } from '$lib/utils/xrplAuth';

	let isLoggingIn = $state(false);
	let mobileMenuOpen = $state(false);

	async function handleLogin() {
		isLoggingIn = true;

		try {
			// Generate auth headers for the login endpoint
			const headers = await generatePostAuthHeaders(null);

			// Call the login function to get the token
			const token = await authApi.login(headers);

			// Store the token in the auth store (expires in 1 hour by default)
			authStore.setToken(token, 3600);

			console.log('Login successful! Token stored.');
		} catch (error) {
			console.error('Login failed:', error);
		} finally {
			isLoggingIn = false;
		}
	}

	function handleLogout() {
		authStore.clearToken();
		console.log('Logged out. Token cleared.');
	}

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

<header class="border-b border-[#2A2A2A] bg-[#121212]">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo/Brand -->
			<a href="/" class="flex items-center space-x-3">
				<img src="/logo.svg" alt="XRPL Perp DEX Logo" class="h-40 w-40" />
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden lg:flex lg:items-center lg:space-x-6">
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
					href="/vaults"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">Vaults</a
				>
				<a
					href="/verify"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">Verify</a
				>
				<a
					href="/about"
					data-sveltekit-preload-data
					class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">About</a
				>
			</nav>

			<!-- Wallet + Mobile Menu -->
			<div class="flex items-center space-x-2">
				{#if $walletStore.isConnected && $walletStore.address}
					<div class="hidden items-center space-x-2 sm:flex">
						<div
							class="flex items-center space-x-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5"
						>
							<img src="/avatar.svg" alt="Wallet Avatar" class="h-5 w-5" />
							<span class="font-mono text-xs text-[#00AAE4]">
								{formatAddress($walletStore.address)}
							</span>
						</div>
						{#if $authStore.token}
							<button
								onclick={handleLogout}
								class="rounded-lg border border-[#404040] bg-[#2A2A2A] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#404040]"
							>
								Logout
							</button>
						{:else}
							<button
								onclick={handleLogin}
								disabled={isLoggingIn}
								class="rounded-lg bg-[#00AAE4] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0099CC] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isLoggingIn ? 'Logging in...' : 'Login'}
							</button>
						{/if}
						<button
							onclick={disconnectWallet}
							class="rounded-lg border border-[#404040] bg-[#2A2A2A] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#404040]"
						>
							Disconnect
						</button>
					</div>
					<!-- Mobile: compact wallet -->
					<div class="flex items-center space-x-2 sm:hidden">
						<span class="font-mono text-xs text-[#00AAE4]">
							{formatAddress($walletStore.address)}
						</span>
					</div>
				{:else}
					<button
						onclick={connectWallet}
						class="rounded-lg bg-[#00AAE4] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0088B8]"
					>
						Connect
					</button>
				{/if}

				<!-- Hamburger (mobile) -->
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="rounded-lg p-2 text-[#B0B0B0] transition-colors hover:text-white lg:hidden"
					aria-label="Toggle menu"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if mobileMenuOpen}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="border-t border-[#2A2A2A] bg-[#121212] lg:hidden">
			<nav class="mx-auto max-w-7xl space-y-1 px-4 py-3">
				<a
					href="/trade"
					onclick={() => (mobileMenuOpen = false)}
					class="block rounded-lg px-3 py-2 text-[#B0B0B0] transition-colors hover:bg-[#1A1A1A] hover:text-[#00AAE4]"
					>Trade</a
				>
				<a
					href="/portfolio"
					onclick={() => (mobileMenuOpen = false)}
					class="block rounded-lg px-3 py-2 text-[#B0B0B0] transition-colors hover:bg-[#1A1A1A] hover:text-[#00AAE4]"
					>Portfolio</a
				>
				<a
					href="/vaults"
					onclick={() => (mobileMenuOpen = false)}
					class="block rounded-lg px-3 py-2 text-[#B0B0B0] transition-colors hover:bg-[#1A1A1A] hover:text-[#00AAE4]"
					>Vaults</a
				>
				<a
					href="/verify"
					onclick={() => (mobileMenuOpen = false)}
					class="block rounded-lg px-3 py-2 text-[#B0B0B0] transition-colors hover:bg-[#1A1A1A] hover:text-[#00AAE4]"
					>Verify Enclave</a
				>
				<a
					href="/about"
					onclick={() => (mobileMenuOpen = false)}
					class="block rounded-lg px-3 py-2 text-[#B0B0B0] transition-colors hover:bg-[#1A1A1A] hover:text-[#00AAE4]"
					>How It Works</a
				>
			</nav>
			{#if $walletStore.isConnected && $walletStore.address}
				<div class="border-t border-[#2A2A2A] px-4 py-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-2">
							<img src="/avatar.svg" alt="Wallet Avatar" class="h-5 w-5" />
							<span class="font-mono text-xs text-[#00AAE4]"
								>{formatAddress($walletStore.address)}</span
							>
						</div>
						<div class="flex space-x-2">
							{#if $authStore.token}
								<button
									onclick={handleLogout}
									class="rounded-lg border border-[#404040] bg-[#2A2A2A] px-3 py-1.5 text-xs text-white"
									>Logout</button
								>
							{:else}
								<button
									onclick={handleLogin}
									disabled={isLoggingIn}
									class="rounded-lg bg-[#00AAE4] px-3 py-1.5 text-xs text-white disabled:opacity-50"
									>{isLoggingIn ? '...' : 'Login'}</button
								>
							{/if}
							<button
								onclick={disconnectWallet}
								class="rounded-lg border border-[#404040] bg-[#2A2A2A] px-3 py-1.5 text-xs text-white"
								>Disconnect</button
							>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</header>
