<script lang="ts">
	import { page } from '$app/stores';
	import { walletStore } from '$lib/stores/wallet';
	import { goto } from '$app/navigation';

	const vaultId = $derived($page.params.id as string);

	// Vault types and interfaces (matching the main vaults page)
	type VaultType = 'market-making' | 'delta-neutral' | 'delta-one';

	interface Vault {
		id: string;
		name: string;
		type: VaultType;
		description: string;
		apy: string;
		tvl: string;
		riskLevel: 'Low' | 'Medium' | 'High';
		minDeposit: string;
		lockupPeriod: string;
		features: string[];
		acceptedAssets: string[];
		revenueStreams: string[];
		status: 'active' | 'coming-soon';
	}

	interface Position {
		id: string;
		market: string;
		side: 'Long' | 'Short';
		size: string;
		entryPrice: string;
		currentPrice: string;
		pnl: string;
		pnlPercent: string;
		leverage: string;
	}

	interface UserPosition {
		deposited: string;
		currentValue: string;
		pnl: string;
		pnlPercent: string;
		shares: string;
		sharePrice: string;
		depositedAt: string;
	}

	// Mock vault data (same as main page)
	const vaults: Record<string, Vault> = {
		'mm-vault-1': {
			id: 'mm-vault-1',
			name: 'Market Making Vault',
			type: 'market-making',
			description:
				'Earn yield by providing liquidity to the order book. This vault places orders at a strategic spread from the mid price and earns both spread and fee rebates.',
			apy: '12-18%',
			tvl: '125,000 XRP',
			riskLevel: 'Low',
			minDeposit: '100 XRP',
			lockupPeriod: 'None',
			features: [
				'Automated market making',
				'Dynamic spread management',
				'Fee rebate optimization',
				'Risk-controlled delta exposure'
			],
			acceptedAssets: ['XRP'],
			revenueStreams: ['Spread earnings', 'Fee rebates', 'Order execution fees'],
			status: 'active'
		},
		'dn-vault-1': {
			id: 'dn-vault-1',
			name: 'Delta Neutral Vault',
			type: 'delta-neutral',
			description:
				'Maintain a delta neutral position while earning yield from spreads and funding rates. This vault minimizes exposure to price movements while maximizing fee income.',
			apy: '15-25%',
			tvl: '85,000 XRP',
			riskLevel: 'Medium',
			minDeposit: '250 XRP',
			lockupPeriod: '7 days',
			features: [
				'Delta neutral positioning',
				'Funding rate capture',
				'Automated rebalancing',
				'Spread optimization'
			],
			acceptedAssets: ['XRP'],
			revenueStreams: [
				'Spread earnings',
				'Fee rebates',
				'Funding rate payments',
				'Perpetual positions'
			],
			status: 'active'
		},
		'do-vault-1': {
			id: 'do-vault-1',
			name: 'Delta One Vault',
			type: 'delta-one',
			description:
				'Leverage interest rate discrepancies between borrowing USD and perpetual funding rates. This vault borrows RLUSD, buys spot XRP, and shorts perpetuals to earn the rate differential.',
			apy: '20-35%',
			tvl: 'Coming Soon',
			riskLevel: 'High',
			minDeposit: '500 XRP',
			lockupPeriod: '14 days',
			features: [
				'Leveraged yield strategy',
				'Interest rate arbitrage',
				'Automated position management',
				'Delta one exposure'
			],
			acceptedAssets: ['XRP'],
			revenueStreams: ['Funding rate differentials', 'Interest rate arbitrage', 'Spread earnings'],
			status: 'coming-soon'
		}
	};

	const vault = $derived(vaults[vaultId]);

	// Mock data for vault details
	const vaultBalances = $state({
		totalAssets: '125,000 XRP',
		availableBalance: '15,000 XRP',
		deployedCapital: '110,000 XRP',
		totalShares: '120,000',
		sharePrice: '1.0417 XRP'
	});

	const vaultReturns = $state({
		dailyReturn: '+0.12%',
		weeklyReturn: '+0.85%',
		monthlyReturn: '+3.42%',
		allTimeReturn: '+15.6%',
		totalFeesEarned: '8,450 XRP',
		totalSpreadEarned: '10,200 XRP',
		totalRebatesEarned: '1,850 XRP'
	});

	// Mock user position (would come from API)
	const userPosition = $state<UserPosition | null>({
		deposited: '1,000 XRP',
		currentValue: '1,156 XRP',
		pnl: '+156 XRP',
		pnlPercent: '+15.6%',
		shares: '960',
		sharePrice: '1.0417 XRP',
		depositedAt: '2026-03-15'
	});

	// Mock active positions (would come from API)
	const activePositions = $state<Position[]>([
		{
			id: '1',
			market: 'XRP-PERP',
			side: 'Long',
			size: '10,000 XRP',
			entryPrice: '2.45',
			currentPrice: '2.52',
			pnl: '+280 XRP',
			pnlPercent: '+2.86%',
			leverage: '5x'
		},
		{
			id: '2',
			market: 'XRP-PERP',
			side: 'Short',
			size: '8,500 XRP',
			entryPrice: '2.48',
			currentPrice: '2.52',
			pnl: '-136 XRP',
			pnlPercent: '-1.61%',
			leverage: '5x'
		},
		{
			id: '3',
			market: 'BTC-PERP',
			side: 'Long',
			size: '0.5 BTC',
			entryPrice: '98,500',
			currentPrice: '99,200',
			pnl: '+350 USD',
			pnlPercent: '+0.71%',
			leverage: '3x'
		}
	]);

	// State
	let depositAmount = $state('');
	let withdrawAmount = $state('');
	let activeTab: 'deposit' | 'withdraw' = $state('deposit');
	let processing = $state(false);

	function getRiskColor(risk: string) {
		switch (risk) {
			case 'Low':
				return 'text-green-400';
			case 'Medium':
				return 'text-yellow-400';
			case 'High':
				return 'text-red-400';
			default:
				return 'text-[#B0B0B0]';
		}
	}

	function getRiskBgColor(risk: string) {
		switch (risk) {
			case 'Low':
				return 'bg-green-500/10 border-green-500/20';
			case 'Medium':
				return 'bg-yellow-500/10 border-yellow-500/20';
			case 'High':
				return 'bg-red-500/10 border-red-500/20';
			default:
				return 'bg-[#2A2A2A] border-[#2A2A2A]';
		}
	}

	async function handleDeposit() {
		if (!$walletStore.isConnected) {
			alert('Please connect your wallet first');
			return;
		}

		if (!depositAmount || parseFloat(depositAmount) <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		processing = true;

		try {
			// TODO: Implement actual deposit logic
			await new Promise((resolve) => setTimeout(resolve, 2000));

			alert(`Successfully deposited ${depositAmount} XRP to ${vault.name}!`);
			depositAmount = '';
		} catch (err) {
			console.error('Deposit error:', err);
			alert('Deposit failed. Please try again.');
		} finally {
			processing = false;
		}
	}

	async function handleWithdraw() {
		if (!$walletStore.isConnected) {
			alert('Please connect your wallet first');
			return;
		}

		if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		processing = true;

		try {
			// TODO: Implement actual withdraw logic
			await new Promise((resolve) => setTimeout(resolve, 2000));

			alert(`Successfully withdrew ${withdrawAmount} XRP from ${vault.name}!`);
			withdrawAmount = '';
		} catch (err) {
			console.error('Withdraw error:', err);
			alert('Withdrawal failed. Please try again.');
		} finally {
			processing = false;
		}
	}

	// Redirect if vault not found
	$effect(() => {
		if (!vault) {
			goto('/vaults');
		}
	});
</script>

{#if vault}
	<div class="container mx-auto px-4 py-8">
		<!-- Back Button -->
		<div class="mb-6">
			<a
				href="/vaults"
				class="inline-flex items-center space-x-2 text-[#B0B0B0] transition-colors hover:text-[#00AAE4]"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span>Back to Vaults</span>
			</a>
		</div>

		<!-- Header -->
		<div class="mb-8">
			<div class="mb-3 flex items-start justify-between">
				<div>
					<h1 class="mb-2 text-4xl font-bold text-white">{vault.name}</h1>
					<p class="text-lg text-[#B0B0B0]">{vault.description}</p>
				</div>
				<div class="flex items-center space-x-3">
					<span
						class={`rounded border px-3 py-1 text-sm font-medium ${getRiskBgColor(vault.riskLevel)} ${getRiskColor(vault.riskLevel)}`}
					>
						{vault.riskLevel} Risk
					</span>
					{#if vault.status === 'coming-soon'}
						<span
							class="rounded border border-[#B0B0B0]/20 bg-[#2A2A2A] px-3 py-1 text-sm font-medium text-[#B0B0B0]"
						>
							Coming Soon
						</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Main Content (Left Side - 2 columns) -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Vault Balances -->
				<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
					<h2 class="mb-4 text-xl font-semibold text-white">Vault Balances</h2>
					<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Total Assets</div>
							<div class="text-xl font-bold text-white">{vaultBalances.totalAssets}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Available Balance</div>
							<div class="text-xl font-bold text-white">{vaultBalances.availableBalance}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Deployed Capital</div>
							<div class="text-xl font-bold text-white">{vaultBalances.deployedCapital}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Total Shares</div>
							<div class="text-xl font-bold text-white">{vaultBalances.totalShares}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Share Price</div>
							<div class="text-xl font-bold text-[#00AAE4]">{vaultBalances.sharePrice}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">APY</div>
							<div class="text-xl font-bold text-[#00AAE4]">{vault.apy}</div>
						</div>
					</div>
				</div>

				<!-- Returns Performance -->
				<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
					<h2 class="mb-4 text-xl font-semibold text-white">Returns & Performance</h2>
					<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Daily Return</div>
							<div class="text-lg font-bold text-green-400">{vaultReturns.dailyReturn}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Weekly Return</div>
							<div class="text-lg font-bold text-green-400">{vaultReturns.weeklyReturn}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">Monthly Return</div>
							<div class="text-lg font-bold text-green-400">{vaultReturns.monthlyReturn}</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-[#B0B0B0]">All-Time Return</div>
							<div class="text-lg font-bold text-green-400">{vaultReturns.allTimeReturn}</div>
						</div>
					</div>

					<div class="border-t border-[#2A2A2A] pt-4">
						<h3 class="mb-3 text-sm font-semibold text-[#B0B0B0] uppercase">Revenue Breakdown</h3>
						<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
							<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3">
								<div class="mb-1 text-xs text-[#B0B0B0]">Total Fees Earned</div>
								<div class="text-lg font-bold text-white">{vaultReturns.totalFeesEarned}</div>
							</div>
							<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3">
								<div class="mb-1 text-xs text-[#B0B0B0]">Total Spread Earned</div>
								<div class="text-lg font-bold text-white">{vaultReturns.totalSpreadEarned}</div>
							</div>
							<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3">
								<div class="mb-1 text-xs text-[#B0B0B0]">Total Rebates Earned</div>
								<div class="text-lg font-bold text-white">{vaultReturns.totalRebatesEarned}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Active Positions -->
				<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
					<h2 class="mb-4 text-xl font-semibold text-white">Active Positions</h2>
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="border-b border-[#2A2A2A]">
									<th class="pb-3 text-left text-sm font-semibold text-[#B0B0B0]">Market</th>
									<th class="pb-3 text-left text-sm font-semibold text-[#B0B0B0]">Side</th>
									<th class="pb-3 text-right text-sm font-semibold text-[#B0B0B0]">Size</th>
									<th class="pb-3 text-right text-sm font-semibold text-[#B0B0B0]">Entry Price</th>
									<th class="pb-3 text-right text-sm font-semibold text-[#B0B0B0]">Current Price</th
									>
									<th class="pb-3 text-right text-sm font-semibold text-[#B0B0B0]">PnL</th>
									<th class="pb-3 text-right text-sm font-semibold text-[#B0B0B0]">Leverage</th>
								</tr>
							</thead>
							<tbody>
								{#each activePositions as position (position.id)}
									<tr class="border-b border-[#2A2A2A]/50">
										<td class="py-3 text-left font-medium text-white">{position.market}</td>
										<td class="py-3 text-left">
											{#if position.side === 'Long'}
												<span
													class="rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400"
												>
													{position.side}
												</span>
											{:else}
												<span
													class="rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400"
												>
													{position.side}
												</span>
											{/if}
										</td>
										<td class="py-3 text-right font-mono text-white">{position.size}</td>
										<td class="py-3 text-right font-mono text-[#B0B0B0]">{position.entryPrice}</td>
										<td class="py-3 text-right font-mono text-white">{position.currentPrice}</td>
										<td class="py-3 text-right">
											<div
												class="font-mono font-medium"
												class:text-green-400={position.pnl.startsWith('+')}
												class:text-red-400={position.pnl.startsWith('-')}
											>
												{position.pnl}
											</div>
											<div
												class="text-xs"
												class:text-green-400={position.pnlPercent.startsWith('+')}
												class:text-red-400={position.pnlPercent.startsWith('-')}
											>
												{position.pnlPercent}
											</div>
										</td>
										<td class="py-3 text-right font-mono text-[#B0B0B0]">{position.leverage}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<!-- Sidebar (Right Side - 1 column) -->
			<div class="space-y-6">
				<!-- User Position -->
				{#if $walletStore.isConnected && userPosition}
					<div class="rounded-lg border border-[#00AAE4]/30 bg-[#121212] p-6">
						<h2 class="mb-4 text-xl font-semibold text-white">Your Position</h2>
						<div class="space-y-3">
							<div class="flex justify-between">
								<span class="text-sm text-[#B0B0B0]">Deposited</span>
								<span class="font-mono font-medium text-white">{userPosition.deposited}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-[#B0B0B0]">Current Value</span>
								<span class="font-mono font-medium text-white">{userPosition.currentValue}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-[#B0B0B0]">PnL</span>
								<div class="text-right">
									<div class="font-mono font-medium text-green-400">{userPosition.pnl}</div>
									<div class="text-xs text-green-400">{userPosition.pnlPercent}</div>
								</div>
							</div>
							<div class="border-t border-[#2A2A2A] pt-3"></div>
							<div class="flex justify-between">
								<span class="text-sm text-[#B0B0B0]">Your Shares</span>
								<span class="font-mono font-medium text-white">{userPosition.shares}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-[#B0B0B0]">Share Price</span>
								<span class="font-mono font-medium text-[#00AAE4]">{userPosition.sharePrice}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-sm text-[#B0B0B0]">Deposited At</span>
								<span class="text-sm text-[#B0B0B0]">{userPosition.depositedAt}</span>
							</div>
						</div>
					</div>
				{/if}

				<!-- Deposit/Withdraw Card -->
				<div class="rounded-lg border border-[#2A2A2A] bg-[#121212]">
					<!-- Tabs -->
					<div class="flex border-b border-[#2A2A2A]">
						<button
							class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
							class:text-[#00AAE4]={activeTab === 'deposit'}
							class:border-b-2={activeTab === 'deposit'}
							class:border-[#00AAE4]={activeTab === 'deposit'}
							class:text-[#B0B0B0]={activeTab !== 'deposit'}
							onclick={() => (activeTab = 'deposit')}
						>
							Deposit
						</button>
						<button
							class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
							class:text-[#00AAE4]={activeTab === 'withdraw'}
							class:border-b-2={activeTab === 'withdraw'}
							class:border-[#00AAE4]={activeTab === 'withdraw'}
							class:text-[#B0B0B0]={activeTab !== 'withdraw'}
							onclick={() => (activeTab = 'withdraw')}
							disabled={!userPosition}
						>
							Withdraw
						</button>
					</div>

					<div class="p-6">
						{#if activeTab === 'deposit'}
							<!-- Deposit Form -->
							<div class="space-y-4">
								<div>
									<label for="deposit-amount" class="mb-2 block text-sm font-medium text-white">
										Amount
									</label>
									<div class="relative">
										<input
											id="deposit-amount"
											type="number"
											bind:value={depositAmount}
											placeholder="0.00"
											min={vault.minDeposit.replace(/[^\d.]/g, '')}
											step="0.01"
											class="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 pr-16 text-white placeholder-[#808080] focus:border-[#00AAE4] focus:outline-none"
										/>
										<span
											class="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-[#B0B0B0]"
										>
											XRP
										</span>
									</div>
									<p class="mt-2 text-xs text-[#B0B0B0]">
										Minimum deposit: {vault.minDeposit}
									</p>
								</div>

								<button
									onclick={handleDeposit}
									disabled={processing ||
										!$walletStore.isConnected ||
										!depositAmount ||
										parseFloat(depositAmount) <= 0 ||
										vault.status === 'coming-soon'}
									class="w-full rounded-lg bg-[#00AAE4] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#0088B8] hover:shadow-[0_0_20px_rgba(0,170,228,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
								>
									{processing
										? 'Processing...'
										: !$walletStore.isConnected
											? 'Connect Wallet'
											: 'Deposit'}
								</button>
							</div>
						{:else}
							<!-- Withdraw Form -->
							<div class="space-y-4">
								<div>
									<label for="withdraw-amount" class="mb-2 block text-sm font-medium text-white">
										Amount
									</label>
									<div class="relative">
										<input
											id="withdraw-amount"
											type="number"
											bind:value={withdrawAmount}
											placeholder="0.00"
											max={userPosition?.deposited.replace(/[^\d.]/g, '')}
											step="0.01"
											class="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 pr-16 text-white placeholder-[#808080] focus:border-[#00AAE4] focus:outline-none"
										/>
										<span
											class="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-[#B0B0B0]"
										>
											XRP
										</span>
									</div>
									{#if userPosition}
										<p class="mt-2 text-xs text-[#B0B0B0]">
											Available: {userPosition.currentValue}
										</p>
									{/if}
								</div>

								<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
									<p class="text-xs text-yellow-400">
										Lockup period: {vault.lockupPeriod}
									</p>
								</div>

								<button
									onclick={handleWithdraw}
									disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
									class="w-full rounded-lg bg-[#00AAE4] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#0088B8] hover:shadow-[0_0_20px_rgba(0,170,228,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
								>
									{processing ? 'Processing...' : 'Withdraw'}
								</button>
							</div>
						{/if}
					</div>
				</div>

				<!-- Vault Info -->
				<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
					<h3 class="mb-3 text-lg font-semibold text-white">Vault Info</h3>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-[#B0B0B0]">Min Deposit:</span>
							<span class="font-medium text-white">{vault.minDeposit}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[#B0B0B0]">Lockup Period:</span>
							<span class="font-medium text-white">{vault.lockupPeriod}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[#B0B0B0]">Assets:</span>
							<span class="font-medium text-white">{vault.acceptedAssets.join(', ')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
