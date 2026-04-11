import { writable } from 'svelte/store';

export interface AuthState {
	token: string | null;
	tokenExpiry: number | null;
}

const initialState: AuthState = {
	token: null,
	tokenExpiry: null
};

// Load token from localStorage if available
function loadFromStorage(): AuthState {
	if (typeof window === 'undefined') return initialState;

	try {
		const token = localStorage.getItem('auth_token');
		const expiry = localStorage.getItem('auth_token_expiry');

		if (token && expiry) {
			const expiryTime = parseInt(expiry);
			// Check if token is still valid (not expired)
			if (expiryTime > Date.now()) {
				return {
					token,
					tokenExpiry: expiryTime
				};
			}
			// Token expired, clear it
			localStorage.removeItem('auth_token');
			localStorage.removeItem('auth_token_expiry');
		}
	} catch (error) {
		console.error('Error loading auth from localStorage:', error);
	}

	return initialState;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(loadFromStorage());

	return {
		subscribe,

		setToken: (token: string, expiresInSeconds: number = 3600) => {
			const tokenExpiry = Date.now() + expiresInSeconds * 1000;

			// Save to localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth_token', token);
				localStorage.setItem('auth_token_expiry', tokenExpiry.toString());
			}

			update((state) => ({
				...state,
				token,
				tokenExpiry
			}));
		},

		clearToken: () => {
			// Clear from localStorage
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth_token');
				localStorage.removeItem('auth_token_expiry');
			}

			set(initialState);
		},

		isTokenValid: (): boolean => {
			const state = loadFromStorage();
			return state.token !== null && state.tokenExpiry !== null && state.tokenExpiry > Date.now();
		}
	};
}

export const authStore = createAuthStore();
