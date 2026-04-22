// Use dev API by default, can be overridden with VITE_API_URL
export const API_BASE_URL =
	import.meta.env.VITE_API_URL || 'https://api-dev.xperp.fi';

// Production API (currently also pointing to testnet until mainnet is re-provisioned)
export const API_BASE_URL_PROD = 'https://api.xperp.fi';
