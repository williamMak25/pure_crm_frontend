import { QueryClient } from '@tanstack/svelte-query';
import { browser } from '$app/env';

export const STALE = {
	/** Lists & dashboards: fresh for 1 minute, so tab switches don't refetch. */
	list: 60_000,
	/** Reference data that rarely changes (businesses, roles, company profile). */
	reference: 10 * 60_000
} as const;

export function createAppQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: STALE.list,
				gcTime: 5 * 60_000,
				retry: 1,
				refetchOnWindowFocus: false
			},
			mutations: { retry: 0 }
		}
	});
}
