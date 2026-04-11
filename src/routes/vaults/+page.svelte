<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';

	// Vault types based on spec
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

	// Mock data for vaults - based on spec
	const vaults: Vault[] = [
		{
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
		{
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
			revenueStreams: ['Spread earnings', 'Fee rebates', 'Funding rate payments', 'Perpetual positions'],
			status: 'active'
		},
		{
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
	];

	// State
	let selectedVault: Vault | null = $state(null);
	let depositAmount = $state('');
	let activeTab: 'all' | 'my-positions' = $state('all');
	let depositing = $state(false);

	// Mock user positions - in production, fetch from API
	let userPositions = $state([
		{
			vaultId: 'mm-vault-1',
			vaultName: 'Market Making Vault',
			deposited: '1,000 XRP',
			currentValue: '1,156 XRP',
			pnl: '+156 XRP',
			pnlPercent: '+15.6%',
			apy: '15.2%'
		}
	]);

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

		if (!selectedVault) {
			return;
		}

		depositing = true;

		try {
			// TODO: Implement actual deposit logic
			await new Promise((resolve) => setTimeout(resolve, 2000));
			
			alert(`Successfully deposited ${depositAmount} XRP to ${selectedVault.name}!`);
			depositAmount = '';
			selectedVault = null;
		} catch (err) {
			console.error('Deposit error:', err);
			alert('Deposit failed. Please try again.');
		} finally {
			depositing = false;
		}
	}

	function openDepositModal(vault: Vault) {
		if (vault.status === 'coming-soon') {
			alert('This vault is coming soon. Stay tuned!');
			return;
		}
		selectedVault = vault;
		depositAmount = '';
	}

	function closeDepositModal() {
		selectedVault = null;
		depositAmount = '';
	}
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-3 text-4xl font-bold text-white">
			Liquidity <span class="xrp-glow text-[#00AAE4]">Vaults</span>
		</h1>
		<p class="text-lg text-[#B0B0B0]">
			Deposit your assets and earn yield through automated market making and trading strategies
		</p>
	</div>

	<!-- Info Banner -->
	<div class="mb-6 rounded-lg border border-[#00AAE4]/30 bg-[#00AAE4]/5 p-6">
		<div class="flex items-start space-x-3">
			<svg
				class="mt-0.5 h-6 w-6 flex-shrink-0 text-[#00AAE4]"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<div>
				<h3 class="mb-1 font-semibold text-white">About Protocol Vaults</h3>
				<p class="text-sm text-[#B0B0B0]">
					Protocol vaults are special participants that receive fee rebates on executed orders,
					enabling them to earn spreads plus additional yield. Revenue comes from spread earnings,
					fee rebates, funding rates, and optimized trading strategies.
				</p>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6 flex space-x-2 border-b border-[#2A2A2A]">
		<button
			class="px-6 py-3 text-sm font-medium transition-colors"
			class:text-[#00AAE4]={activeTab === 'all'}
			class:border-b-2={activeTab === 'all'}
			class:border-[#00AAE4]={activeTab === 'all'}
			class:text-[#B0B0B0]={activeTab !== 'all'}
			onclick={() => (activeTab = 'all')}
		>
			All Vaults
		</button>
		<button
			class="px-6 py-3 text-sm font-medium transition-colors"
			class:text-[#00AAE4]={activeTab === 'my-positions'}
			class:border-b-2={activeTab === 'my-positions'}
			class:border-[#00AAE4]={activeTab === 'my-positions'}
			class:text-[#B0B0B0]={activeTab !== 'my-positions'}
			onclick={() => (activeTab = 'my-positions')}
		>
			My Positions
		</button>
	</div>

	{#if activeTab === 'all'}
		<!-- Vaults Grid -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
			{#each vaults as vault (vault.id)}
				<div
					class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6 transition-all hover:border-[#00AAE4]/50"
					class:opacity-60={vault.status === 'coming-soon'}
				>
					<!-- Vault Header -->
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h3 class="mb-1 text-xl font-semibold text-white">{vault.name}</h3>
							<div class="flex items-center space-x-2">
								<span class={`rounded px-2 py-1 text-xs font-medium border ${getRiskBgColor(vault.riskLevel)} ${getRiskColor(vault.riskLevel)}`}>
									{vault.riskLevel} Risk
								</span>
								{#if vault.status === 'coming-soon'}
									<span class="rounded border border-[#B0B0B0]/20 bg-[#2A2A2A] px-2 py-1 text-xs font-medium text-[#B0B0B0]">
										Coming Soon
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Description -->
					<p class="mb-4 text-sm text-[#B0B0B0]">
						{vault.description}
					</p>

					<!-- Stats -->
					<div class="mb-4 grid grid-cols-2 gap-4">
						<div>
							<div class="text-xs text-[#B0B0B0]">APY</div>
							<div class="text-xl font-bold text-[#00AAE4]">{vault.apy}</div>
						</div>
						<div>
							<div class="text-xs text-[#B0B0B0]">TVL</div>
							<div class="text-xl font-bold text-white">{vault.tvl}</div>
						</div>
					</div>

					<!-- Details -->
					<div class="mb-4 space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-[#B0B0B0]">Min Deposit:</span>
							<span class="font-medium text-white">{vault.minDeposit}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[#B0B0B0]">Lockup Period:</span>
							<span class="font-medium text-white">{vault.lockupPeriod}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-[#B0B0B0]">Accepted Assets:</span>
							<span class="font-medium text-white">{vault.acceptedAssets.join(', ')}</span>
						</div>
					</div>

					<!-- Features -->
					<div class="mb-4">
						<div class="mb-2 text-xs font-semibold uppercase text-[#B0B0B0]">Key Features</div>
						<div class="space-y-1">
							{#each vault.features.slice(0, 3) as feature, i (i)}
								<div class="flex items-start space-x-2">
									<svg
										class="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00AAE4]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									<span class="text-xs text-[#B0B0B0]">{feature}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex space-x-2">
						<button
							onclick={() => openDepositModal(vault)}
							disabled={vault.status === 'coming-soon'}
							class="flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
							class:bg-[#00AAE4]={vault.status === 'active'}
							class:hover:bg-[#0088B8]={vault.status === 'active'}
							class:hover:shadow-[0_0_20px_rgba(0,170,228,0.4)]={vault.status === 'active'}
							class:bg-[#2A2A2A]={vault.status === 'coming-soon'}
							class:text-white={true}
						>
							{vault.status === 'active' ? 'Deposit' : 'Coming Soon'}
						</button>
						<a
							href="/vaults/{vault.id}"
							class="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:border-[#00AAE4] hover:bg-[#2A2A2A]"
						>
							View Details
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- My Positions Tab -->
		{#if !$walletStore.isConnected}
			<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
				<p class="mb-4 text-[#B0B0B0]">Please connect your wallet to view your vault positions</p>
			</div>
		{:else if userPositions.length === 0}
			<div class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-8 text-center">
				<p class="mb-4 text-[#B0B0B0]">You don't have any active vault positions yet</p>
				<button
					onclick={() => (activeTab = 'all')}
					class="rounded-lg bg-[#00AAE4] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#0088B8]"
				>
					Browse Vaults
				</button>
			</div>
		{:else}
			<!-- Positions Table -->
			<div class="overflow-x-auto rounded-lg border border-[#2A2A2A] bg-[#121212]">
				<table class="w-full">
					<thead>
						<tr class="border-b border-[#2A2A2A] bg-[#1A1A1A]">
							<th class="px-6 py-4 text-left text-sm font-semibold text-[#B0B0B0]">Vault</th>
							<th class="px-6 py-4 text-right text-sm font-semibold text-[#B0B0B0]">Deposited</th>
							<th class="px-6 py-4 text-right text-sm font-semibold text-[#B0B0B0]">Current Value</th>
							<th class="px-6 py-4 text-right text-sm font-semibold text-[#B0B0B0]">PnL</th>
							<th class="px-6 py-4 text-right text-sm font-semibold text-[#B0B0B0]">APY</th>
							<th class="px-6 py-4 text-right text-sm font-semibold text-[#B0B0B0]">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each userPositions as position (position.vaultId)}
							<tr class="border-b border-[#2A2A2A]/50 transition-colors hover:bg-[#1A1A1A]">
								<td class="px-6 py-4">
									<div class="font-medium text-white">{position.vaultName}</div>
								</td>
								<td class="px-6 py-4 text-right font-mono text-white">{position.deposited}</td>
								<td class="px-6 py-4 text-right font-mono text-white">{position.currentValue}</td>
								<td class="px-6 py-4 text-right">
									<div class="font-mono font-medium text-green-400">{position.pnl}</div>
									<div class="text-xs text-green-400">{position.pnlPercent}</div>
								</td>
								<td class="px-6 py-4 text-right font-mono text-[#00AAE4]">{position.apy}</td>
								<td class="px-6 py-4 text-right">
									<button
										class="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#00AAE4] hover:bg-[#2A2A2A]"
									>
										Withdraw
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>

<!-- Deposit Modal -->
{#if selectedVault}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) closeDepositModal();
		}}
	>
		<div class="w-full max-w-lg rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
			<!-- Modal Header -->
			<div class="mb-4 flex items-start justify-between">
				<div>
					<h2 class="text-2xl font-bold text-white">Deposit to {selectedVault.name}</h2>
					<p class="mt-1 text-sm text-[#B0B0B0]">{selectedVault.description}</p>
				</div>
				<button
					onclick={closeDepositModal}
					aria-label="Close modal"
					class="text-[#B0B0B0] transition-colors hover:text-white"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Vault Info -->
			<div class="mb-6 space-y-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<div class="text-xs text-[#B0B0B0]">Expected APY</div>
						<div class="text-lg font-bold text-[#00AAE4]">{selectedVault.apy}</div>
					</div>
					<div>
						<div class="text-xs text-[#B0B0B0]">Risk Level</div>
						<div class={`text-lg font-bold ${getRiskColor(selectedVault.riskLevel)}`}>
							{selectedVault.riskLevel}
						</div>
					</div>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-[#B0B0B0]">Min Deposit:</span>
					<span class="font-medium text-white">{selectedVault.minDeposit}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-[#B0B0B0]">Lockup Period:</span>
					<span class="font-medium text-white">{selectedVault.lockupPeriod}</span>
				</div>
			</div>

			<!-- Revenue Streams -->
			<div class="mb-6">
				<div class="mb-2 text-sm font-semibold text-white">Revenue Streams</div>
				<div class="space-y-1">
					{#each selectedVault.revenueStreams as stream, i (i)}
						<div class="flex items-center space-x-2">
							<svg
								class="h-4 w-4 text-[#00AAE4]"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-sm text-[#B0B0B0]">{stream}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Deposit Form -->
			<div class="mb-6">
				<label for="deposit-amount" class="mb-2 block text-sm font-medium text-white">
					Deposit Amount
				</label>
				<div class="relative">
					<input
						id="deposit-amount"
						type="number"
						bind:value={depositAmount}
						placeholder="0.00"
						min={selectedVault.minDeposit.replace(/[^\d.]/g, '')}
						step="0.01"
						class="w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 pr-16 text-white placeholder-[#808080] focus:border-[#00AAE4] focus:outline-none"
					/>
					<span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#B0B0B0]">
						XRP
					</span>
				</div>
				<p class="mt-2 text-xs text-[#B0B0B0]">
					Minimum deposit: {selectedVault.minDeposit}
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="flex space-x-3">
				<button
					onclick={closeDepositModal}
					class="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2A2A2A]"
				>
					Cancel
				</button>
				<button
					onclick={handleDeposit}
					disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
					class="flex-1 rounded-lg bg-[#00AAE4] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#0088B8] hover:shadow-[0_0_20px_rgba(0,170,228,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{depositing ? 'Depositing...' : 'Confirm Deposit'}
				</button>
			</div>
		</div>
	</div>
{/if}
