// Feature Flags Configuration
// Change APP_MODE to 'full' to enable the complete trading application
export const APP_MODE: 'landing' | 'full' = 'landing' as const;

export const FEATURES = {
	// When true, shows full navigation and trading features
	ENABLE_TRADING: APP_MODE === 'full',

	// When true, shows the landing page instead
	SHOW_LANDING_PAGE: APP_MODE === 'landing'
};
