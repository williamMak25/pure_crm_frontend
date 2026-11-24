import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_BASE_URL: {
		public: true,
		static: true,
		description: 'Base URL of the PURE ERP REST API, e.g. https://api.example.com/v1',
		schema: (value) => value || '/api'
	},
	API_MOCK: {
		public: true,
		static: true,
		description:
			'Set to "true" to answer API calls from src/lib/mocks during local development. Never enable in production.',
		schema: (value) => value === 'true'
	}
});
