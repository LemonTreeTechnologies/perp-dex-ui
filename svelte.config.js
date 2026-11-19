import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		// Absolute asset paths: the web server answers unknown paths at any depth with index.html,
		// and relative paths would then point to assets that do not exist.
		paths: { relative: false }
	}
};

export default config;
