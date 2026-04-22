<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { walletStore } from '$lib/stores/wallet';
	import { systemStore } from '$lib/stores/system';
	import { authApi, toFP8, fromFP8 } from '$lib/api/client';
	import type { Balance } from '$lib/api/client';
	import DepositWarningModal from '$lib/components/DepositWarningModal.svelte';

	// State
	let balance: Balance | null = $state(null);
	// let transactions: Transaction[] = $state([]);
	let loading = $state(false);
	// let loadingTransactions = $state(false);
	let error = $state<string | null>(null);
	let withdrawAmount = $state('');
	let withdrawDestination = $state('');
	let withdrawing = $state(false);
	let activeTab: 'deposit' | 'withdraw' = $state('deposit');
	let activeCurrency: 'xrp' | 'rlusd' = $state('xrp');
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let showWarningModal = $state(false);

	// Load warning acceptance from localStorage
	const WARNING_STORAGE_KEY = 'deposit-warning-accepted';
	let hasAcceptedWarning = $state(
		typeof window !== 'undefined' ? localStorage.getItem(WARNING_STORAGE_KEY) === 'true' : false
	);

	// Get system status from store
	const system = $derived($systemStore);

	// Get deposit address from system status (fallback to empty string if not loaded)
	const depositAddress = $derived(system.status?.deposit_address || '');
	const isTestnet = $derived(system.status?.network === 'testnet');
	const isInMaintenance = $derived(system.status?.is_in_maintenance || false);

	// Constants
	const depositMemo = '2026040021';

	// Computed values
	const totalBalance = $derived(() => {
		if (!balance) return '0.00';
		const margin = fromFP8(balance.margin_balance);
		const pnl = fromFP8(balance.unrealized_pnl);
		return (margin + pnl).toFixed(2);
	});

	const balanceChangePercent = $derived(() => {
		if (!balance) return '0.00';
		const margin = fromFP8(balance.margin_balance);
		if (margin === 0) return '0.00';
		const pnl = fromFP8(balance.unrealized_pnl);
		return ((pnl / margin) * 100).toFixed(2);
	});

	// Fetch balance data
	async function fetchBalance() {
		if (!$walletStore.isConnected || !$walletStore.address) {
			return;
		}

		loading = true;
		error = null;

		try {
			// Use token-based authentication (authApi will attach the token if present)
			balance = await authApi.getBalance($walletStore.address);
		} catch (err) {
			console.error('Failed to fetch balance:', err);
			error = err instanceof Error ? err.message : 'Failed to fetch balance';
		} finally {
			loading = false;
		}
	}

	// Fetch transactions
	// async function fetchTransactions() {
	// 	if (!$walletStore.isConnected || !$walletStore.address) {
	// 		return;
	// 	}

	// 	loadingTransactions = true;

	// 	try {
	// 		// Use token-based authentication (authApi will attach the token if present)
	// 		transactions = await authApi.getTransactions($walletStore.address);
	// 	} catch (err) {
	// 		console.error('Failed to fetch transactions:', err);
	// 		// Don't show error for transactions, it's not critical
	// 	} finally {
	// 		loadingTransactions = false;
	// 	}
	// }

	// Handle withdrawal
	async function handleWithdraw() {
		if (!$walletStore.address) {
			alert('Please connect your wallet first');
			return;
		}

		if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		if (!withdrawDestination || !withdrawDestination.startsWith('r')) {
			alert('Please enter a valid XRPL address');
			return;
		}

		withdrawing = true;
		error = null;

		try {
			const amount = toFP8(withdrawAmount);
			const data = await authApi.withdraw($walletStore.address, amount, withdrawDestination);

			alert(`Withdrawal successful! TX Hash: ${data.xrpl_tx_hash}`);
			withdrawAmount = '';
			withdrawDestination = '';
			// Refresh balance and transactions
			await fetchBalance();
			// await fetchTransactions();
		} catch (err) {
			console.error('Withdrawal error:', err);
			error = err instanceof Error ? err.message : 'Withdrawal failed';
			alert(`Withdrawal failed: ${error}`);
		} finally {
			withdrawing = false;
		}
	}

	// Lifecycle
	onMount(() => {
		// Fetch initial data
		fetchBalance();
		// fetchTransactions();

		// Set up polling every 5 seconds
		if ($walletStore.isConnected) {
			pollingInterval = setInterval(() => {
				fetchBalance();
				// fetchTransactions();
			}, 5000);
		}
	});

	onDestroy(() => {
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}
	});

	// Watch for wallet connection changes
	$effect(() => {
		if (!$walletStore.isConnected) {
			// Stop polling when wallet disconnects
			if (pollingInterval) {
				clearInterval(pollingInterval);
				pollingInterval = null;
			}
			balance = null;
		} else if ($walletStore.isConnected && !pollingInterval) {
			// Start polling when wallet connects
			fetchBalance();
			// fetchTransactions();
			pollingInterval = setInterval(() => {
				fetchBalance();
				// fetchTransactions();
			}, 5000);
		}
	});

	// Watch for deposit tab activation
	$effect(() => {
		if (activeTab === 'deposit' && activeCurrency === 'xrp' && !hasAcceptedWarning) {
			showWarningModal = true;
		}
	});

	// Set withdrawal destination to connected wallet address
	$effect(() => {
		if ($walletStore.isConnected && $walletStore.address && !withdrawDestination) {
			withdrawDestination = $walletStore.address;
		}
	});

	function handleAcceptWarning() {
		hasAcceptedWarning = true;
		showWarningModal = false;
		// Store acceptance in localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem(WARNING_STORAGE_KEY, 'true');
		}
	}

	function handleCloseWarning() {
		showWarningModal = false;
		// Switch to withdraw tab if they don't accept
		activeTab = 'withdraw';
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-white">Portfolio</h1>
		{#if isTestnet}
			<span class="rounded bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-400">
				Testnet Mode
			</span>
		{/if}
	</div>

	<!-- Maintenance Banner -->
	{#if isInMaintenance}
		<div class="mb-6 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
			<div class="flex items-center space-x-2">
				<svg class="h-6 w-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<div>
					<h3 class="text-sm font-medium text-orange-400">System Maintenance</h3>
					<p class="text-sm text-orange-200/80">
						The platform is currently under maintenance. Deposits and trading are temporarily disabled.
					</p>
				</div>
			</div>
		</div>
	{/if}

	{#if error}
		<div class="mb-4 rounded-lg border border-red-900 bg-red-900/20 p-4">
			<p class="text-red-400">{error}</p>
		</div>
	{/if}

	{#if !$walletStore.isConnected}
		<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
			<p class="mb-4 text-[#B0B0B0]">Please connect your wallet to view your portfolio</p>
			<button
				class="rounded-lg bg-[#00AAE4] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#0088B8]"
				onclick={() => (window.location.href = '/')}
			>
				Go to Home
			</button>
		</div>
	{:else}
		<!-- Balance Overview -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
			<!-- Total Balance -->
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
				<div class="mb-2 text-sm text-[#B0B0B0]">Total Balance</div>
				<div class="flex items-baseline space-x-2">
					<div class="text-3xl font-bold text-white">
						{loading ? '...' : totalBalance()}
					</div>
					<div class="text-lg text-[#B0B0B0]">XRP</div>
				</div>
				{#if balance}
					<div class="mt-2 flex items-center space-x-1">
						<span
							class="text-sm font-medium"
							class:text-green-400={fromFP8(balance.unrealized_pnl) >= 0}
							class:text-red-400={fromFP8(balance.unrealized_pnl) < 0}
						>
							{fromFP8(balance.unrealized_pnl) >= 0 ? '+' : ''}{balanceChangePercent()}%
						</span>
					</div>
				{/if}
			</div>

			<!-- Margin Balance -->
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
				<div class="mb-2 text-sm text-[#B0B0B0]">Margin Balance</div>
				<div class="text-2xl font-bold text-white">
					{balance ? fromFP8(balance.margin_balance).toFixed(2) : '0.00'}
				</div>
				<div class="mt-1 text-xs text-[#B0B0B0]">XRP</div>
			</div>

			<!-- Available Margin -->
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
				<div class="mb-2 text-sm text-[#B0B0B0]">Available Margin</div>
				<div class="text-2xl font-bold text-white">
					{balance ? fromFP8(balance.available_margin).toFixed(2) : '0.00'}
				</div>
				<div class="mt-1 text-xs text-[#B0B0B0]">XRP</div>
			</div>

			<!-- Unrealized PnL -->
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
				<div class="mb-2 text-sm text-[#B0B0B0]">Unrealized PnL</div>
				<div
					class="text-2xl font-bold"
					class:text-green-400={balance && fromFP8(balance.unrealized_pnl) >= 0}
					class:text-red-400={balance && fromFP8(balance.unrealized_pnl) < 0}
				>
					{balance
						? (fromFP8(balance.unrealized_pnl) >= 0 ? '+' : '') +
							fromFP8(balance.unrealized_pnl).toFixed(2)
						: '0.00'}
				</div>
				<div class="mt-1 text-xs text-[#B0B0B0]">XRP</div>
			</div>
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
				<p class="text-sm text-red-400">{error}</p>
			</div>
		{/if}

		<!-- Deposit / Withdraw Tabs -->
		<div class="rounded-lg border border-[#2A2A2A] bg-[#121212]">
			<!-- Currency Selector -->
			<div class="border-b border-[#2A2A2A] bg-[#1A1A1A] px-6 py-4">
				<div class="flex items-center space-x-4">
					<span class="text-sm font-medium text-[#B0B0B0]">Currency:</span>
					<div class="flex space-x-2">
						<button
							class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
							class:bg-[#00AAE4]={activeCurrency === 'xrp'}
							class:text-white={activeCurrency === 'xrp'}
							class:bg-[#2A2A2A]={activeCurrency !== 'xrp'}
							class:text-[#B0B0B0]={activeCurrency !== 'xrp'}
							onclick={() => (activeCurrency = 'xrp')}
						>
							XRP
						</button>
						<button
							class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
							class:bg-[#00AAE4]={activeCurrency === 'rlusd'}
							class:text-white={activeCurrency === 'rlusd'}
							class:bg-[#2A2A2A]={activeCurrency !== 'rlusd'}
							class:text-[#B0B0B0]={activeCurrency !== 'rlusd'}
							onclick={() => (activeCurrency = 'rlusd')}
						>
							RLUSD
						</button>
					</div>
				</div>
			</div>

			<!-- Tab Headers -->
			<div class="flex border-b border-[#2A2A2A]">
				<button
					class="flex-1 px-6 py-4 text-sm font-medium transition-colors"
					class:text-[#00AAE4]={activeTab === 'deposit'}
					class:border-b-2={activeTab === 'deposit'}
					class:border-[#00AAE4]={activeTab === 'deposit'}
					class:text-[#B0B0B0]={activeTab !== 'deposit'}
					onclick={() => (activeTab = 'deposit')}
				>
					Deposit
				</button>
				<button
					class="flex-1 px-6 py-4 text-sm font-medium transition-colors"
					class:text-[#00AAE4]={activeTab === 'withdraw'}
					class:border-b-2={activeTab === 'withdraw'}
					class:border-[#00AAE4]={activeTab === 'withdraw'}
					class:text-[#B0B0B0]={activeTab !== 'withdraw'}
					onclick={() => (activeTab = 'withdraw')}
				>
					Withdraw
				</button>
			</div>

			<!-- Tab Content -->
			<div class="p-6">
				{#if activeCurrency === 'rlusd'}
					<!-- RLUSD Coming Soon -->
					<div class="py-12 text-center">
						<div class="mb-4 text-6xl">🚧</div>
						<h3 class="mb-3 text-2xl font-bold text-white">RLUSD Support Coming Soon</h3>
						<p class="text-[#B0B0B0]">
							We're working on adding RLUSD deposit and withdrawal support. <br />
							For now, please use XRP for all transactions.
						</p>
					</div>
				{:else if activeTab === 'deposit'}
					<!-- XRP Deposit Instructions -->
					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg font-semibold text-white">Deposit XRP</h3>
							<p class="mb-4 text-sm text-[#B0B0B0]">
								Send XRP to the escrow address below. Your balance will be credited automatically
								within 1-2 minutes.
							</p>
						</div>

						{#if !depositAddress}
							<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
								<p class="text-sm text-yellow-400">Loading deposit address...</p>
							</div>
						{:else}
							<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-6">
								<div class="mb-3 text-sm font-medium text-[#B0B0B0]">Escrow Address</div>
								<div class="flex items-center space-x-3">
									<code
										class="flex-1 rounded bg-[#0A0A0A] px-4 py-3 font-mono text-sm text-[#00AAE4]"
									>
										{depositAddress}
									</code>
									<button
										class="rounded-lg bg-[#2A2A2A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#404040] disabled:opacity-50 disabled:cursor-not-allowed"
										onclick={() => {
											navigator.clipboard.writeText(depositAddress);
											alert('Address copied to clipboard!');
										}}
										disabled={isInMaintenance}
									>
										Copy
									</button>
								</div>
								<div class="mb-3 text-sm font-medium text-[#B0B0B0]">Deposit Memo</div>
								<div class="flex items-center space-x-3">
									<code
										class="flex-1 rounded bg-[#0A0A0A] px-4 py-3 font-mono text-sm text-[#00AAE4]"
									>
										{depositMemo}
									</code>
									<button
										class="rounded-lg bg-[#2A2A2A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#404040]"
										onclick={() => {
											navigator.clipboard.writeText(depositMemo);
											alert('Memo copied to clipboard!');
										}}
									>
										Copy
									</button>
								</div>
							</div>
						{/if}
						<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
							<div class="mb-2 flex items-center space-x-2">
								<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="text-sm font-medium text-yellow-400">Important</span>
							</div>
							<ul class="ml-7 list-disc space-y-1 text-sm text-yellow-200/80">
								<li>Only send XRP to this address</li>
								<li>Sending other tokens may result in permanent loss</li>
								<li>Minimum deposit: 10 XRP</li>
								<li>Your balance updates automatically after network confirmation</li>
							</ul>
						</div>

						<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4">
							<div class="mb-3 text-sm font-medium text-white">How to deposit:</div>
							<ol class="ml-5 list-decimal space-y-2 text-sm text-[#B0B0B0]">
								<li>Copy the escrow address above</li>
								<li>Open your XRPL wallet (GemWallet, Crossmark, or Xaman)</li>
								<li>
									{#if isTestnet}
										Make sure your wallet is set to <strong>testnet</strong> mode
									{:else}
										Send XRP from your mainnet wallet
									{/if}
								</li>
								<li>Send XRP to the escrow address</li>
								<li>Wait for confirmation (usually 4-5 seconds)</li>
								<li>Your balance will update automatically</li>
							</ol>
						</div>
					</div>
				{:else}
					<!-- XRP Withdraw Form -->
					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg font-semibold text-white">Withdraw XRP</h3>
							<p class="mb-4 text-sm text-[#B0B0B0]">
								Withdraw XRP from your margin balance to your XRPL wallet.
							</p>
						</div>

						<form
							onsubmit={(e) => {
								e.preventDefault();
								handleWithdraw();
							}}
							class="space-y-4"
						>
							<!-- Amount Input -->
							<div>
								<label for="amount" class="mb-2 block text-sm font-medium text-white">
									Amount (XRP)
								</label>
								<div class="flex items-center space-x-2">
									<input
										id="amount"
										type="number"
										step="0.01"
										min="0"
										bind:value={withdrawAmount}
										placeholder="0.00"
										class="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-white placeholder-[#666666] focus:border-[#00AAE4] focus:outline-none"
										disabled={withdrawing}
									/>
									<button
										type="button"
										class="rounded-lg bg-[#2A2A2A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#404040] disabled:opacity-50"
										onclick={() => {
											if (balance) {
												withdrawAmount = fromFP8(balance.available_margin).toString();
											}
										}}
										disabled={withdrawing || !balance}
									>
										Max
									</button>
								</div>
								{#if balance}
									<p class="mt-2 text-xs text-[#B0B0B0]">
										Available: {fromFP8(balance.available_margin).toFixed(2)} XRP
									</p>
								{/if}
							</div>

							<!-- Destination Address Input -->
							<div>
								<label for="destination" class="mb-2 block text-sm font-medium text-white">
									Destination Address
								</label>
								<input
									id="destination"
									type="text"
									bind:value={withdrawDestination}
									placeholder="rYourXRPLAddress..."
									class="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 font-mono text-sm text-white placeholder-[#666666] focus:border-[#00AAE4] focus:outline-none"
									disabled={withdrawing}
								/>
								<p class="mt-2 text-xs text-[#B0B0B0]">
									Enter a valid XRPL address starting with 'r'
								</p>
							</div>

							<!-- Submit Button -->
							<button
								type="submit"
								class="w-full rounded-lg bg-[#00AAE4] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#0088B8] disabled:cursor-not-allowed disabled:opacity-50"
								disabled={withdrawing || !withdrawAmount || !withdrawDestination || isInMaintenance}
							>
								{#if isInMaintenance}
									Maintenance Mode
								{:else if withdrawing}
									Processing...
								{:else}
									Withdraw
								{/if}
							</button>
						</form>

						<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4">
							<div class="mb-3 text-sm font-medium text-white">Withdrawal Information:</div>
							<ul class="ml-5 list-disc space-y-2 text-sm text-[#B0B0B0]">
								<li>Withdrawals require XRPL signature authentication</li>
								<li>You can only withdraw from available margin (not used in positions)</li>
								<li>
									Withdrawals are processed on XRPL {isTestnet ? 'testnet' : 'mainnet'} within seconds
								</li>
								<li>Network fees apply (typically ~0.00001 XRP)</li>
							</ul>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Positions Summary (if any) -->
		{#if balance && balance.positions.length > 0}
			<div class="mt-6">
				<h2 class="mb-4 text-xl font-semibold text-white">Open Positions</h2>
				<div class="overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#121212]">
					<table class="w-full">
						<thead class="border-b border-[#2A2A2A] bg-[#1A1A1A]">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-[#B0B0B0] uppercase"
									>Side</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-[#B0B0B0] uppercase"
									>Size</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-[#B0B0B0] uppercase"
									>Entry Price</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-[#B0B0B0] uppercase"
									>Margin</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-[#B0B0B0] uppercase"
									>Unrealized PnL</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-[#2A2A2A]">
							{#each balance.positions as position (position.position_id)}
								<tr>
									<td class="px-6 py-4">
										<span
											class="inline-flex rounded px-2 py-1 text-xs font-medium"
											class:bg-green-900={position.side === 'long'}
											class:text-green-400={position.side === 'long'}
											class:bg-red-900={position.side === 'short'}
											class:text-red-400={position.side === 'short'}
										>
											{position.side.toUpperCase()}
										</span>
									</td>
									<td class="px-6 py-4 font-mono text-sm text-white">
										{fromFP8(position.size).toFixed(2)} XRP
									</td>
									<td class="px-6 py-4 font-mono text-sm text-white">
										${fromFP8(position.entry_price).toFixed(4)}
									</td>
									<td class="px-6 py-4 font-mono text-sm text-white">
										{fromFP8(position.margin).toFixed(2)} XRP
									</td>
									<td
										class="px-6 py-4 font-mono text-sm"
										class:text-green-400={fromFP8(position.unrealized_pnl) >= 0}
										class:text-red-400={fromFP8(position.unrealized_pnl) < 0}
									>
										{fromFP8(position.unrealized_pnl) >= 0 ? '+' : ''}{fromFP8(
											position.unrealized_pnl
										).toFixed(2)} XRP
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Warning Modal -->
<DepositWarningModal
	bind:isOpen={showWarningModal}
	onClose={handleCloseWarning}
	onAccept={handleAcceptWarning}
/>
