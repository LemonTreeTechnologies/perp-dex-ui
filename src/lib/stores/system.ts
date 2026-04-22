import { writable } from 'svelte/store';
import type { SystemStatus } from '$lib/api/client';

export interface SystemState {
	status: SystemStatus | null;
	loading: boolean;
	error: string | null;
	lastFetched: number | null;
}

const initialState: SystemState = {
	status: null,
	loading: false,
	error: null,
	lastFetched: null
};

function createSystemStore() {
	const { subscribe, set, update } = writable<SystemState>(initialState);

	return {
		subscribe,
		setStatus: (status: SystemStatus) =>
			update((state) => ({
				...state,
				status,
				loading: false,
				error: null,
				lastFetched: Date.now()
			})),
		setLoading: (loading: boolean) => update((state) => ({ ...state, loading })),
		setError: (error: string) => update((state) => ({ ...state, error, loading: false })),
		reset: () => set(initialState)
	};
}

export const systemStore = createSystemStore();
