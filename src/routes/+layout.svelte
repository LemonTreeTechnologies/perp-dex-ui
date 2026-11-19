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

<!-- One shell for every page. When the landing page is inside it, layout.css hides the app
     header and lets the page run full width (see ".app-shell:has(.xp)"). The test is on the
     content, not the address: the server answers unknown paths such as /verify with the landing
     page, and the client then reports that path as the current route. -->
<div class="app-shell min-h-screen bg-[#0A0A0A]">
	<div class="app-header"><Header /></div>
	<main class="app-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
