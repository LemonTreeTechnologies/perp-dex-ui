<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onAccept: () => void;
	}

	let { isOpen = $bindable(), onClose, onAccept }: Props = $props();

	function handleAccept() {
		onAccept();
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<!-- Modal Content -->
		<div class="relative mx-4 w-full max-w-2xl rounded-xl border border-[#2A2A2A] bg-[#121212] p-8">
			<!-- Warning Icon -->
			<div class="mb-6 flex justify-center">
				<div class="rounded-full bg-yellow-500/20 p-4">
					<svg class="h-16 w-16 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>

			<!-- Title -->
			<h2 class="mb-4 text-center text-3xl font-bold text-white">⚠️ HACKATHON ALERT! ⚠️</h2>

			<!-- Warning Message -->
			<div class="mb-6 space-y-4 text-center">
				<p class="text-lg font-semibold text-yellow-400">
					Please Read This Before You YOLO Your Life Savings!
				</p>

				<div class="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6 text-left">
					<p class="mb-4 text-white">
						Listen, we know you're probably thinking: <span class="italic"
							>"What could possibly go wrong?"</span
						>
					</p>

					<p class="mb-4 text-white">
						Well... <span class="font-bold text-yellow-400">LITERALLY EVERYTHING.</span>
					</p>

					<ul class="mb-4 ml-6 list-disc space-y-2 text-white">
						<li>
							This code was written on <span class="font-semibold">energy drinks and hope</span>
						</li>
						<li>
							We tested it exactly <span class="font-semibold">twice</span> (maybe three times)
						</li>
						<li>There's a non-zero chance we forgot a minus sign somewhere</li>
						<li>
							Our "extensive security audit" consisted of one person saying "looks good to me 👍"
						</li>
						<li>We're pretty sure it works, but also, we're running on 2 hours of sleep</li>
					</ul>

					<p class="mb-4 text-center text-xl font-bold text-red-400">
						🚨 DO NOT DEPOSIT MORE THAN 10 XRP 🚨
					</p>

					<p class="text-center text-sm text-[#B0B0B0]">
						Seriously. We mean it. Your funds are at risk. This is a hackathon project. <br />
						We're innovating, not auditing. Capisce?
					</p>
				</div>

				<div class="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
					<p class="text-sm font-medium text-red-300">
						<span class="font-bold">Pro Tip:</span> If you ignore this warning and deposit your entire
						net worth, we will judge you. The blockchain never forgets, and neither will we. 📸
					</p>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex gap-4">
				<button
					onclick={onClose}
					class="flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#2A2A2A]"
				>
					Nope, I'm Out 🏃‍♂️
				</button>
				<button
					onclick={handleAccept}
					class="flex-1 rounded-lg bg-[#00AAE4] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#0088B8]"
				>
					I Accept The Risks 🎲
				</button>
			</div>

			<p class="mt-4 text-center text-xs text-[#666666]">
				By clicking "I Accept The Risks", you acknowledge that you have been warned <br />
				and that we told you so when things inevitably go sideways. 🤷‍♂️
			</p>
		</div>
	</div>
{/if}

<style>
	/* Prevent body scroll when modal is open */
	:global(body:has(.fixed.inset-0)) {
		overflow: hidden;
	}
</style>
