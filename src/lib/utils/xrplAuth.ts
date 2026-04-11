import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { get } from 'svelte/store';
import { walletStore } from '$lib/stores/wallet';

/**
 * Generate XRPL authentication headers for API requests
 * @param method - HTTP method (GET, POST, DELETE)
 * @param pathOrBody - For GET/DELETE: URI path with query params. For POST: JSON body string
 * @returns Headers object with X-XRPL-* headers
 */
export async function generateAuthHeaders(
	method: 'GET' | 'POST' | 'DELETE',
	pathOrBody: string
): Promise<Record<string, string>> {
	const wallet = get(walletStore);

	if (!wallet.address || !wallet.publicKey) {
		throw new Error('Wallet not connected');
	}

	const timestamp = Math.floor(Date.now() / 1000).toString();

	// Create message to sign: body/path + timestamp
	const messageBytes = new TextEncoder().encode(pathOrBody + timestamp);
	const hash = bytesToHex(sha256(messageBytes));

	// Sign with wallet
	const signature = await signMessage(hash);

	return {
		'X-XRPL-Address': wallet.address,
		'X-XRPL-PublicKey': wallet.publicKey,
		'X-XRPL-Signature': signature,
		'X-XRPL-Timestamp': timestamp
	};
}

/**
 * Sign a message hash with the connected wallet
 * @param hash - Hex-encoded message hash to sign
 * @returns DER-encoded ECDSA signature (hex)
 */
async function signMessage(hash: string): Promise<string> {
	// Try Crossmark first since it's required
	if (window.crossmark?.session?.sdk?.methods) {
		try {
			const methods = window.crossmark.session.sdk.methods;

			// signInAndWait is actually for signing a message/hash for authentication
			// It takes a hex string and returns a signature
			const result = await methods.signInAndWait(hash);

			// The response structure from the browser console shows it returns an object
			// Log the result to see what we get
			console.log('Crossmark signInAndWait result:', result);

			// Try different possible response structures
			if (result?.response?.data?.signature) {
				return result.response.data.signature;
			}
			if (result?.data?.signature) {
				return result.data.signature;
			}
			if (result?.signature) {
				return result.signature;
			}

			// If we got a result but couldn't find the signature, log it
			console.error('Unexpected Crossmark response structure:', result);
			throw new Error('Failed to get signature from Crossmark - unexpected response structure');
		} catch (err) {
			console.error('Crossmark signing failed:', err);
			throw new Error(
				'Crossmark signing failed: ' + (err instanceof Error ? err.message : 'Unknown error'),
				{ cause: err }
			);
		}
	}

	// Try GemWallet as fallback
	if (window.gemWallet) {
		try {
			const signResponse = await window.gemWallet.signMessage({ message: hash });
			if (signResponse.result?.signature) {
				return signResponse.result.signature;
			}
		} catch (err) {
			console.error('GemWallet signing failed:', err);
		}
	}

	throw new Error('No compatible wallet found for signing. Please install Crossmark.');
}

/**
 * Generate auth headers for GET requests
 * @param path - URI path with query parameters (e.g., "/v1/orders?user_id=rXXX")
 */
export async function generateGetAuthHeaders(path: string): Promise<Record<string, string>> {
	return generateAuthHeaders('GET', path);
}

/**
 * Generate auth headers for POST/DELETE requests with a body
 * @param body - JSON request body as object
 */
export async function generatePostAuthHeaders(body: object): Promise<Record<string, string>> {
	const bodyString = JSON.stringify(body);
	return generateAuthHeaders('POST', bodyString);
}
