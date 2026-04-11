// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface CrossmarkSignInResponse {
		address?: string;
		publicKey?: string;
		response?: {
			data?: {
				address: string;
				publicKey?: string;
			};
		};
	}

	interface CrossmarkUser {
		address?: string;
		[key: string]: unknown;
	}

	interface Window {
		gemWallet?: {
			connect: () => Promise<{
				result?: {
					address: string;
					publicKey: string;
				};
			}>;
		};
		crossmark?: {
			methods?: {
				signInAndWait: (options?: Record<string, unknown>) => Promise<CrossmarkSignInResponse>;
				getAddress: () => string | undefined;
				getUser: () => CrossmarkUser;
				isConnected: () => boolean;
			};
			session?: {
				address?: string;
				user?: CrossmarkUser;
			};
		};
		xaman?: unknown;
	}
}

export {};
