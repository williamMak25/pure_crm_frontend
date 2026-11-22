import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Swap for adapter-node / adapter-static / adapter-vercel to match your hosting.
			adapter: adapter()
		})
	],
	server: {
		// Dev only: forward /api to the backend so the session cookies are same-origin.
		proxy: {
			'/api': { target: loadEnv(mode, '.', '').API_PROXY_TARGET || 'http://localhost:8100', changeOrigin: true }
		}
	}
}));
