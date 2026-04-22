<script lang="ts">
	// Landing page - Coming Soon
</script>

<div class="min-h-screen bg-[#0A0A0A] text-white">
	<!-- Hero Section -->
	<div class="relative overflow-hidden">
		<!-- Background gradient -->
		<div
			class="absolute inset-0 bg-gradient-to-br from-[#00AAE4]/10 via-transparent to-transparent"
		></div>

		<div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
			<div class="text-center">
				<!-- Logo -->
				<div class="mb-8 flex justify-center">
					<img src="/logo.svg" alt="XPerp Logo" class="h-32 w-auto" />
				</div>

				<!-- Headline -->
				<h1 class="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
					Perpetual Futures on
					<span class="xrp-glow text-[#00AAE4]">XRPL</span>
				</h1>

				<!-- Subheadline -->
				<p class="mx-auto mb-12 max-w-3xl text-xl text-[#B0B0B0] sm:text-2xl">
					Trade XRP with up to 20x leverage. Native settlement. Hardware-secured custody.
					<br class="hidden sm:inline" />
					No bridges. No CEX. No compromise.
				</p>

				<!-- Coming Soon Badge -->
				<div class="mb-12 flex justify-center">
					<div class="rounded-full border-2 border-[#00AAE4] bg-[#00AAE4]/10 px-8 py-4">
						<p class="text-2xl font-bold text-[#00AAE4]">🚀 Launching Soon</p>
					</div>
				</div>

				<!-- Key Features -->
				<div class="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
					<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
						<div class="mb-3 text-4xl">⚡</div>
						<h3 class="mb-2 text-lg font-semibold">Native XRPL</h3>
						<p class="text-sm text-[#B0B0B0]">
							3-5 second settlement with &lt;$0.01 transaction costs
						</p>
					</div>

					<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
						<div class="mb-3 text-4xl">🔐</div>
						<h3 class="mb-2 text-lg font-semibold">Hardware Secured</h3>
						<p class="text-sm text-[#B0B0B0]">Intel SGX enclaves with 2-of-3 multisig protection</p>
					</div>

					<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
						<div class="mb-3 text-4xl">📊</div>
						<h3 class="mb-2 text-lg font-semibold">Full DEX Features</h3>
						<p class="text-sm text-[#B0B0B0]">Real-time order book, charts, and WebSocket feeds</p>
					</div>
				</div>

				<!-- CTA Section -->
				<div class="mb-12">
					<p class="mb-4 text-lg text-[#B0B0B0]">Be among the first to trade perpetuals on XRPL</p>
					<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<a
							href="https://github.com/LemonTreeTechnologies/perp-dex-ui"
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-lg border border-[#00AAE4] bg-[#00AAE4]/10 px-8 py-3 font-medium text-[#00AAE4] transition-all hover:bg-[#00AAE4]/20"
						>
							View on GitHub
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="border-t border-[#2A2A2A] bg-[#121212] py-20">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold sm:text-4xl">Why XPerp?</h2>
				<p class="text-lg text-[#B0B0B0]">
					The first perpetual futures exchange built natively on XRPL
				</p>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-6">
					<h3 class="mb-3 text-xl font-semibold">Non-Custodial</h3>
					<p class="text-[#B0B0B0]">
						Your funds stay in XRPL escrow protected by 2-of-3 multisig. No single operator can move
						your assets.
					</p>
				</div>

				<div class="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-6">
					<h3 class="mb-3 text-xl font-semibold">20x Leverage</h3>
					<p class="text-[#B0B0B0]">
						Open long or short positions with up to 20x leverage. Express any market view on XRP.
					</p>
				</div>

				<div class="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-6">
					<h3 class="mb-3 text-xl font-semibold">Instant Settlement</h3>
					<p class="text-[#B0B0B0]">
						XRPL's 3-5 second finality means your trades settle faster than any other blockchain.
					</p>
				</div>

				<div class="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-6">
					<h3 class="mb-3 text-xl font-semibold">Low Fees</h3>
					<p class="text-[#B0B0B0]">
						Transaction costs under $0.01 make active trading viable. No hidden fees or gas
						surprises.
					</p>
				</div>

				<div class="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-6">
					<h3 class="mb-3 text-xl font-semibold">Liquidity Vaults</h3>
					<p class="text-[#B0B0B0]">
						Built-in market making vaults provide day-one liquidity. Earn yield by providing
						liquidity.
					</p>
				</div>

				<div class="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-6">
					<h3 class="mb-3 text-xl font-semibold">Verifiable Security</h3>
					<p class="text-[#B0B0B0]">
						Intel DCAP attestation lets anyone verify the code running in our SGX enclaves.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Section -->
	<div class="border-t border-[#2A2A2A] py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-[#00AAE4]">3-5s</div>
					<div class="text-[#B0B0B0]">Settlement Time</div>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-[#00AAE4]">20x</div>
					<div class="text-[#B0B0B0]">Max Leverage</div>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-[#00AAE4]">&lt;$0.01</div>
					<div class="text-[#B0B0B0]">Transaction Cost</div>
				</div>
				<div class="text-center">
					<div class="mb-2 text-4xl font-bold text-[#00AAE4]">0</div>
					<div class="text-[#B0B0B0]">Bridges Required</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="border-t border-[#2A2A2A] py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<div class="text-sm text-[#B0B0B0]">
					© 2026 XPerp. Built on XRPL for Paris Blockchain Week 2026 Hackathon.
				</div>
				<div class="flex gap-6">
					<a
						href="https://github.com/LemonTreeTechnologies"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]"
					>
						GitHub
					</a>
					<a href="/about" class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]"> About </a>
					<a href="/verify" class="text-[#B0B0B0] transition-colors hover:text-[#00AAE4]">
						Verify
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	.xrp-glow {
		text-shadow: 0 0 30px rgba(0, 170, 228, 0.5);
	}
</style>
