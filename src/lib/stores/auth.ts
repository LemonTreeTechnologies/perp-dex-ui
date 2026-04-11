import { writable } from 'svelte/store';

interface AuthState {
	token: string | null;
	tokenExpiry: number | null; // timestamp when token expires
}

function createAuthStore() {
	const { subscribe, set } = writable<AuthState>({
		token: null,
		tokenExpiry: null
	});

	return {
		subscribe,
		setToken: (token: string) => {
			const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes from now
			set({ token, tokenExpiry: expiry });
		},
		clearToken: () => {
			set({ token: null, tokenExpiry: null });
		},
		isTokenValid: (state: AuthState) => {
			if (!state.token || !state.tokenExpiry) return false;
			return Date.now() < state.tokenExpiry;
		}
	};
}

export const authStore = createAuthStore();
