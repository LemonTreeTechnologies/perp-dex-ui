import { writable } from 'svelte/store';

export interface WalletState {
	address: string | null;
	publicKey: string | null;
	isConnected: boolean;
}

const initialState: WalletState = {
	address: null,
	publicKey: null,
	isConnected: false
};

export const walletStore = writable<WalletState>(initialState);
