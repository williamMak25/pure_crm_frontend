import type { ID, ListParams, TrendRange } from '#lib/types/index.ts';

/**
 * Centralised query keys. Every key starts with its domain so a whole domain
 * can be invalidated with e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.crm.all })`.
 */
export const queryKeys = {
	app: {
		businesses: ['app', 'businesses'] as const,
		me: ['app', 'me'] as const
	},
	dashboard: {
		all: ['dashboard'] as const,
		summary: (business?: string) => ['dashboard', 'summary', { business }] as const,
		trend: (range: TrendRange, business?: string) => ['dashboard', 'trend', { range, business }] as const,
		activities: ['dashboard', 'activities'] as const,
		outstanding: ['dashboard', 'outstanding'] as const,
		upcoming: ['dashboard', 'upcoming'] as const,
		attention: ['dashboard', 'attention'] as const
	},
	/** Generic paginated collections (contacts, orders, invoices, employees, …). */
	resource: {
		all: (resource: string) => ['resource', resource] as const,
		list: (resource: string, params: ListParams) => ['resource', resource, 'list', params] as const,
		detail: (resource: string, id: ID) => ['resource', resource, 'detail', id] as const
	},
	crm: {
		all: ['crm'] as const,
		pipeline: (business: string) => ['crm', 'pipeline', { business }] as const,
		deal: (id: ID) => ['crm', 'deal', id] as const,
		messages: (id: ID, kind?: string, search?: string) => ['crm', 'deal', id, 'messages', { kind, search }] as const,
		activities: (id: ID) => ['crm', 'deal', id, 'activities'] as const,
		people: (business: string) => ['crm', 'people', business] as const
	},
	boards: {
		all: ['boards'] as const,
		detail: (id: ID) => ['boards', 'detail', id] as const,
		task: (id: ID) => ['boards', 'task', id] as const,
		comments: (id: ID) => ['boards', 'task', id, 'comments'] as const,
		candidates: (id: ID) => ['boards', 'candidates', id] as const
	},
	finance: {
		cashFlow: (range: TrendRange) => ['finance', 'cash-flow', range] as const
	},
	settings: {
		roles: ['settings', 'roles'] as const,
		permissions: (roleId: ID) => ['settings', 'permissions', roleId] as const,
		company: ['settings', 'company'] as const,
		security: ['settings', 'security'] as const
	}
};
