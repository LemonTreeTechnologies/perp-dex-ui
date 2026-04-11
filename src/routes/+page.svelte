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
		<!-- Architecture overview -->
		<div class="overflow-x-auto rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
			<div class="flex min-w-[600px] items-center justify-between gap-2">
				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#128100;</div>
							<div class="mt-1 text-xs font-medium text-white">Your Wallet</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">Crossmark / GemWallet</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">sign & trade</div>
				</div>

				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#00AAE4]/30 bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#9881;&#65039;</div>
							<div class="mt-1 text-xs font-medium text-[#00AAE4]">XPerp Engine</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">Order book + matching</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">verified</div>
				</div>

				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-green-500/30 bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#128274;</div>
							<div class="mt-1 text-xs font-medium text-green-400">SGX Enclave</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">Margin + keys in hardware</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">2-of-3 multisig</div>
				</div>

				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#00AAE4]/50 bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-sm font-bold text-[#00AAE4]">XRPL</div>
							<div class="mt-1 text-xs font-medium text-white">Mainnet</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">XRP settlement</div>
				</div>
			</div>
		</div>

		<!-- Key features -->
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-5 text-center">
				<div class="mb-2 text-2xl">&#128274;</div>
				<h3 class="font-semibold text-white">No CEX Custody</h3>
				<p class="mt-1 text-sm text-[#808080]">
					Funds secured by 2-of-3 SGX multisig. No single operator controls your assets.
				</p>
			</div>
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-5 text-center">
				<div class="mb-2 text-2xl">&#9889;</div>
				<h3 class="font-semibold text-white">3-5s Settlement</h3>
				<p class="mt-1 text-sm text-[#808080]">
					Trades settle directly on XRPL. No bridges, no wrapped tokens, no L2 delays.
				</p>
			</div>
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-5 text-center">
				<div class="mb-2 text-2xl">&#128269;</div>
				<h3 class="font-semibold text-white">Verifiable Code</h3>
				<p class="mt-1 text-sm text-[#808080]">
					Intel DCAP attestation lets anyone verify the enclave runs genuine code.
				</p>
			</div>
		</div>

		<!-- Get Started -->
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
			<p class="mt-2 text-[#B0B0B0]">
				Your wallet is connected. Use the header to login and start trading.
			</p>
		</div>
	{/if}
</div>
