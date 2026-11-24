import { useQueryClient } from '@tanstack/svelte-query';
import { ui } from '#lib/stores/ui.svelte.ts';
import type { Business } from '#lib/types/index.ts';
import { queryKeys } from './keys';

/**
 * Switch the whole app to another company. Every cached query except the company list is reset, so
 * pages, the current user's role and permissions all reload for the new company.
 */
export function useSwitchCompany() {
	const client = useQueryClient();
	return (company: Business) => {
		const changed = ui.companyId !== company.id;
		ui.companyId = company.id;
		ui.business = company.name;
		if (!changed) return;
		client.resetQueries({
			predicate: (q) => !(q.queryKey[0] === queryKeys.app.businesses[0] && q.queryKey[1] === queryKeys.app.businesses[1])
		});
	};
}
