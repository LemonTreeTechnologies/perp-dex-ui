<script lang="ts">
	const ESCROW_ADDRESS = 'r33cKcGyCZH6x2RRxmSkVfcjKHX3Z3pPEh';
	const EXPLORER_URL = `https://livenet.xrpl.org/accounts/${ESCROW_ADDRESS}`;
</script>

<div class="mx-auto max-w-4xl space-y-12 py-4">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-white">How It Works</h1>
		<p class="mt-4 text-lg text-[#B0B0B0]">
			A perpetual futures DEX on XRPL mainnet — no bridges, no sidechains, no smart contracts.
		</p>
	</div>

	<!-- Architecture Diagram -->
	<section class="space-y-6">
		<h2 class="text-2xl font-semibold text-white">Architecture</h2>
		<div class="overflow-x-auto rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
			<div class="flex min-w-[600px] items-center justify-between gap-2">
				<!-- User -->
				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#128100;</div>
							<div class="mt-1 text-xs font-medium text-white">User</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">XRPL wallet</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">HTTPS</div>
				</div>

				<!-- API / Nginx -->
				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#127760;</div>
							<div class="mt-1 text-xs font-medium text-white">API Gateway</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">Gateway</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">localhost</div>
				</div>

				<!-- Orchestrator -->
				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#00AAE4]/30 bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#9881;&#65039;</div>
							<div class="mt-1 text-xs font-medium text-[#00AAE4]">Orchestrator</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">Rust, order book</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">localhost</div>
				</div>

				<!-- SGX Enclave -->
				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-green-500/30 bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-2xl">&#128274;</div>
							<div class="mt-1 text-xs font-medium text-green-400">SGX Enclave</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">Margin, signing</div>
				</div>

				<div class="flex flex-col items-center">
					<div class="h-0.5 w-12 bg-[#00AAE4]"></div>
					<div class="mt-1 text-xs text-[#808080]">multisig</div>
				</div>

				<!-- XRPL -->
				<div class="flex flex-col items-center">
					<div
						class="flex h-20 w-28 items-center justify-center rounded-lg border border-[#00AAE4]/50 bg-[#1A1A1A]"
					>
						<div class="text-center">
							<div class="text-sm font-bold text-[#00AAE4]">XRPL</div>
							<div class="mt-1 text-xs font-medium text-white">Mainnet</div>
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-[#808080]">RLUSD settlement</div>
				</div>
			</div>
		</div>

		<p class="text-[#B0B0B0]">
			Orders flow from your wallet through the API to the Rust orchestrator, which runs a price-time
			priority order book (CLOB). Every matched trade is sent to the Intel SGX enclave for margin
			verification. Settlement happens directly on the XRP Ledger in RLUSD — no bridges, no
			sidechains.
		</p>
	</section>

	<!-- Multisig Security -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-white">2-of-3 SGX Operator Multisig</h2>
		<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
			<div class="flex items-start space-x-4">
				<div class="mt-1 text-3xl">&#128737;&#65039;</div>
				<div class="space-y-3">
					<p class="text-[#B0B0B0]">
						Your funds are protected by XRPL's native
						<span class="font-medium text-white">SignerListSet</span> — a 2-of-3 multisig across three
						independent SGX enclaves run by separate operators.
					</p>
					<ul class="list-inside space-y-2 text-[#B0B0B0]">
						<li class="flex items-start space-x-2">
							<span class="mt-0.5 text-green-400">&#10003;</span>
							<span>No single operator can move funds — requires 2 of 3 enclave signatures</span>
						</li>
						<li class="flex items-start space-x-2">
							<span class="mt-0.5 text-green-400">&#10003;</span>
							<span>Master key disabled on the escrow account — only the SignerList can sign</span>
						</li>
						<li class="flex items-start space-x-2">
							<span class="mt-0.5 text-green-400">&#10003;</span>
							<span
								>Private keys never leave the CPU — generated and held inside SGX sealed storage</span
							>
						</li>
						<li class="flex items-start space-x-2">
							<span class="mt-0.5 text-green-400">&#10003;</span>
							<span>Operators are geographically distributed (Hetzner + Azure DCsv3)</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- DCAP Attestation -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-white">DCAP Remote Attestation</h2>
		<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
			<div class="flex items-start space-x-4">
				<div class="mt-1 text-3xl">&#128269;</div>
				<div class="space-y-3">
					<p class="text-[#B0B0B0]">
						Anyone can verify the SGX enclave is running genuine, untampered code — no trust
						required.
					</p>
					<p class="text-[#B0B0B0]">
						Intel's <span class="font-medium text-white">DCAP</span> (Data Center Attestation
						Primitives) provides a hardware-signed proof that the enclave binary matches the
						published source code. The attestation quote includes the
						<span class="font-mono text-[#00AAE4]">MRENCLAVE</span> hash — a SHA-256 fingerprint of the
						exact code running inside the enclave.
					</p>
					<a
						href="/verify"
						class="inline-flex items-center justify-center rounded-lg bg-[#00AAE4] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#0088B8] hover:shadow-[0_0_20px_rgba(0,170,228,0.4)]"
					>
						Verify Enclave Now
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Escrow Account -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-white">On-Chain Escrow</h2>
		<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-6">
			<div class="flex items-start space-x-4">
				<div class="mt-1 text-3xl">&#128279;</div>
				<div class="space-y-3">
					<p class="text-[#B0B0B0]">
						All collateral is held in an XRPL escrow account protected by the 2-of-3 SGX multisig.
						Deposits, withdrawals, and P&L settlement happen directly on-chain — fully auditable.
					</p>
					<a
						href={EXPLORER_URL}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center space-x-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-5 py-2.5 text-sm font-medium text-[#00AAE4] transition-colors hover:border-[#00AAE4]"
					>
						<span>View Escrow on XRPL Explorer</span>
						<span>&#8599;</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Links -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold text-white">Learn More</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<a
				href="https://github.com/77ph/xrpl-perp-dex"
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-5 transition-colors hover:border-[#00AAE4]"
			>
				<h3 class="font-semibold text-white">Orchestrator Repo</h3>
				<p class="mt-1 text-sm text-[#808080]">
					Rust trading engine — order book, price feed, P2P replication
				</p>
			</a>
			<div class="rounded-lg border border-[#2A2A2A] bg-[#121212] p-5">
				<h3 class="font-semibold text-white">
					SGX Enclave <span class="text-sm font-normal text-[#808080]">(private for now)</span>
				</h3>
				<p class="mt-1 text-sm text-[#808080]">
					Runs inside an Intel SGX
					<a
						href="https://en.wikipedia.org/wiki/Trusted_execution_environment"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[#00AAE4] hover:underline">trusted execution environment (TEE)</a
					>
					— margin engine, ECDSA key custody, DCAP attestation. Code will be open-sourced; in the meantime,
					integrity is verifiable via the
					<a href="/verify" class="text-[#00AAE4] hover:underline">Verify Enclave</a> page.
				</p>
			</div>
		</div>
	</section>
</div>
