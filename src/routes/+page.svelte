<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { authStore } from '$lib/stores/auth';
	import { authApi } from '$lib/api/client';
	import { generatePostAuthHeaders } from '$lib/utils/xrplAuth';

	let isLoggingIn = $state(false);
	let loginError = $state('');
	let loginSuccess = $state(false);

	async function handleLogin() {
		isLoggingIn = true;
		loginError = '';
		loginSuccess = false;

		try {
			// Generate auth headers for the login endpoint
			const headers = await generatePostAuthHeaders(null);

			// Call the login function to get the token
			const token = await authApi.login(headers);

			// Store the token in the auth store (expires in 1 hour by default)
			authStore.setToken(token, 3600);

			loginSuccess = true;
			console.log('Login successful! Token stored.');
		} catch (error) {
			console.error('Login failed:', error);
			loginError = error instanceof Error ? error.message : 'Login failed';
		} finally {
			isLoggingIn = false;
		}
	}

	function handleLogout() {
		authStore.clearToken();
		loginSuccess = false;
		console.log('Logged out. Token cleared.');
	}
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
			<p class="mt-2 text-[#B0B0B0]">Your wallet is connected.</p>

			<div class="mt-6 flex flex-col items-center gap-4">
				{#if !loginSuccess}
					<button
						onclick={handleLogin}
						disabled={isLoggingIn}
						class="rounded-md bg-[#00AAE4] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0099CC] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoggingIn ? 'Logging in...' : 'Login'}
					</button>
				{:else}
					<div class="flex flex-col items-center gap-3">
						<p class="text-green-400">✓ Login successful!</p>
						<button
							onclick={handleLogout}
							class="rounded-md bg-red-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
						>
							Logout
						</button>
					</div>
				{/if}

				{#if loginError}
					<p class="text-red-400">{loginError}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
