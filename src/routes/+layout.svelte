<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import Header from '$lib/components/Header.svelte';
	import { systemStore } from '$lib/stores/system';
	import { api } from '$lib/api/client';

	let { children } = $props();

	// Fetch system status on app boot
	onMount(async () => {
		try {
			systemStore.setLoading(true);
			const status = await api.getSystemStatus();
			systemStore.setStatus(status);
			console.log('System status loaded:', status);
		} catch (err) {
			console.error('Failed to fetch system status:', err);
			systemStore.setError(err instanceof Error ? err.message : 'Failed to fetch system status');
		}
	});
</script>

<div class="min-h-screen bg-[#0A0A0A]">
	<Header />
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
