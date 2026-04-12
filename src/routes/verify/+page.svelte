<script lang="ts">
	import { API_BASE_URL } from '$lib/config';

	interface AttestationResult {
		status: 'idle' | 'loading' | 'success' | 'error';
		nonce: string | null;
		mrenclave: string | null;
		mrsigner: string | null;
		quoteSize: number | null;
		errorMessage: string | null;
	}

	let result = $state<AttestationResult>({
		status: 'idle',
		nonce: null,
		mrenclave: null,
		mrsigner: null,
		quoteSize: null,
		errorMessage: null
	});

	function hexToBytes(hex: string): Uint8Array {
		const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
		const bytes = new Uint8Array(clean.length / 2);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
		}
		return bytes;
	}

	function bytesToHex(bytes: Uint8Array): string {
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	}

	function generateNonce(): string {
		const bytes = crypto.getRandomValues(new Uint8Array(32));
		return '0x' + bytesToHex(bytes);
	}

	async function verifyEnclave() {
		const nonce = generateNonce();
		result = {
			status: 'loading',
			nonce,
			mrenclave: null,
			mrsigner: null,
			quoteSize: null,
			errorMessage: null
		};

		try {
			const res = await fetch(`${API_BASE_URL}/v1/attestation/quote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_data: nonce })
			});

			if (res.status === 503) {
				result = {
					...result,
					status: 'error',
					errorMessage:
						'Attestation requires Intel SGX hardware (Azure DCsv3). This node does not support DCAP.'
				};
				return;
			}

			if (res.status === 502) {
				result = {
					...result,
					status: 'error',
					errorMessage: 'Enclave offline. Please try again later.'
				};
				return;
			}

			if (!res.ok) {
				const body = await res.json().catch(() => null);
				result = {
					...result,
					status: 'error',
					errorMessage: body?.message ?? `HTTP ${res.status}`
				};
				return;
			}

			const data = await res.json();

			if (data.status !== 'success') {
				result = {
					...result,
					status: 'error',
					errorMessage: data.message ?? 'Attestation failed'
				};
				return;
			}

			const quoteBytes = hexToBytes(data.quote_hex);

			// SGX Quote v3 layout:
			//   bytes [112..144] = MRENCLAVE (32 bytes)
			//   bytes [144..176] = MRSIGNER  (32 bytes)
			const mrenclave = bytesToHex(quoteBytes.slice(112, 144));
			const mrsigner = bytesToHex(quoteBytes.slice(144, 176));

			result = {
				status: 'success',
				nonce,
				mrenclave,
				mrsigner,
				quoteSize: data.quote_size ?? quoteBytes.length,
				errorMessage: null
			};
		} catch (err) {
			result = {
				...result,
				status: 'error',
				errorMessage: err instanceof Error ? err.message : 'Network error'
			};
		}
	}
</script>

<div class="mx-auto max-w-3xl space-y-8">
	<div class="text-center">
		<h1 class="text-3xl font-bold text-[#00AAE4]">Verify Enclave</h1>
		<p class="mt-2 text-[#B0B0B0]">
			Verify that the SGX enclave is running genuine, untampered code using Intel DCAP remote
			attestation.
		</p>
	</div>

	<div class="text-center">
		<button
			onclick={verifyEnclave}
			disabled={result.status === 'loading'}
			class="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if result.status === 'loading'}
				<svg class="mr-2 -ml-1 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					></path>
				</svg>
				Verifying...
			{:else}
				Verify Enclave
			{/if}
		</button>
	</div>

	{#if result.status === 'error'}
		<div class="rounded-lg border border-red-200 bg-red-50 p-6">
			<div class="flex items-start">
				<span class="mr-3 text-2xl">&#10060;</span>
				<div>
					<h2 class="text-lg font-semibold text-red-800">Verification Failed</h2>
					<p class="mt-1 text-red-700">{result.errorMessage}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if result.status === 'success'}
		<div class="rounded-lg border border-green-200 bg-green-50 p-6">
			<div class="flex items-start">
				<span class="mr-3 text-2xl">&#9989;</span>
				<div>
					<h2 class="text-lg font-semibold text-green-800">Intel SGX Verified</h2>
					<p class="mt-1 text-green-700">
						The enclave attestation quote was successfully retrieved. Compare the MRENCLAVE hash
						below against the published enclave binary hash to confirm code authenticity.
					</p>
				</div>
			</div>
		</div>

		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500">
							Field
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500">
							Value
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					<tr>
						<td class="px-6 py-4 text-sm font-medium text-gray-900">MRENCLAVE</td>
						<td class="px-6 py-4 font-mono text-sm break-all text-gray-700">
							{result.mrenclave}
						</td>
					</tr>
					<tr>
						<td class="px-6 py-4 text-sm font-medium text-gray-900">MRSIGNER</td>
						<td class="px-6 py-4 font-mono text-sm break-all text-gray-700">
							{result.mrsigner}
						</td>
					</tr>
					<tr>
						<td class="px-6 py-4 text-sm font-medium text-gray-900">Quote Size</td>
						<td class="px-6 py-4 font-mono text-sm text-gray-700">
							{result.quoteSize?.toLocaleString()} bytes
						</td>
					</tr>
					<tr>
						<td class="px-6 py-4 text-sm font-medium text-gray-900">Challenge Nonce</td>
						<td class="px-6 py-4 font-mono text-sm break-all text-gray-700">
							{result.nonce}
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
			<h3 class="text-sm font-semibold text-[#B0B0B0]">How to verify</h3>
			<p class="mt-2 text-sm text-[#808080]">
				The <strong class="text-white">MRENCLAVE</strong> is a SHA-256 hash of the exact code running
				inside the SGX enclave. Compare it against the hash printed during the
				<a
					href="https://github.com/LemonTreeTechnologies/xrpl-perp-dex/blob/master/docs/enclave_verification.md"
					target="_blank"
					rel="noopener noreferrer"
					class="text-[#00AAE4] hover:underline">published enclave build</a
				> to confirm the enclave is running authentic, unmodified code. The challenge nonce proves this
				quote is fresh and not replayed.
			</p>
		</div>
	{/if}
</div>
