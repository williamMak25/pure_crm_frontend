import { createMutation, createQuery, keepPreviousData, useQueryClient } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import { cashFlowService, leadService, pipelineService, quotationService, salesOrderService, settingsService } from '#lib/services/index.ts';
import type { Company, DealInput, DealMessageKind, DealUpdate, ID, LeadStatus, ModulePermission, PipelineStage, UserUpdate, UserWithPassword, SecuritySettings, TrendRange } from '#lib/types/index.ts';
import { useSwitchCompany } from './company';
import { STALE } from './client';
import { queryKeys } from './keys';

/* ---------- CRM ---------- */
/** `company` (the switcher's company id) only keys the cache; the API scopes by the X-Company header. */
export const createPipelineQuery = (company: () => string) =>
	createQuery(() => {
		const id = company();
		return {
			queryKey: queryKeys.crm.pipeline(id),
			queryFn: ({ signal }: { signal: AbortSignal }) => pipelineService.stages(signal),
			enabled: !!id,
			// Leads can join the board from the Leads tab at any time: always refetch when the board opens.
			staleTime: 0
		};
	});

/** Every pipeline change refetches the board and the Leads table (deals and leads move together). */
function createPipelineMutation<TVars, TData>(
	mutationFn: (vars: TVars) => Promise<TData>,
	opts: { success?: string; onDone?: () => void } = {}
) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn,
		onSuccess: () => {
			client.invalidateQueries({ queryKey: queryKeys.crm.all });
			client.invalidateQueries({ queryKey: queryKeys.resource.all('leads') });
			if (opts.success) toast.success(opts.success);
			opts.onDone?.();
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createAddStageMutation = (onDone?: () => void) =>
	createPipelineMutation(pipelineService.createStage, { success: 'Pipeline stage added', onDone });

export const createAddDealMutation = (onDone?: () => void) =>
	createPipelineMutation(
		({ stageId, body }: { stageId: ID; body: DealInput }) => pipelineService.createDeal(stageId, body),
		{ success: 'Deal added to pipeline', onDone }
	);

export const createUpdateDealMutation = (opts: { success?: string; onDone?: () => void } = {}) =>
	createPipelineMutation(
		({ id, body }: { id: ID; body: DealUpdate }) => pipelineService.updateDeal(id, body),
		opts
	);

/** Drag and drop on the pipeline: optimistic, so the card lands where it was dropped right away. */
export function createMoveDealMutation(business: () => string) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, stageId, position }: { id: ID; stageId: ID; position: number }) =>
			pipelineService.updateDeal(id, { stageId, position }),
		onMutate: async ({ id, stageId, position }) => {
			const key = queryKeys.crm.pipeline(business());
			await client.cancelQueries({ queryKey: key });
			const prev = client.getQueryData<PipelineStage[]>(key);
			const deal = prev?.flatMap((s) => s.deals).find((d) => d.id === id);
			if (prev && deal) {
				client.setQueryData<PipelineStage[]>(
					key,
					prev.map((s) => {
						const rest = s.deals.filter((d) => d.id !== id);
						if (s.id !== stageId) return { ...s, deals: rest };
						const at = Math.min(position, rest.length);
						return { ...s, deals: [...rest.slice(0, at), { ...deal, stageId }, ...rest.slice(at)] };
					})
				);
			}
			return { prev, key };
		},
		onError: (e: Error, _v, ctx) => {
			if (ctx?.prev) client.setQueryData(ctx.key, ctx.prev);
			toast.error(e.message);
		},
		// Totals, progress and the stage-change note come from the server.
		onSettled: () => client.invalidateQueries({ queryKey: queryKeys.crm.all })
	}));
}

/**
 * Change a lead's status from the Leads table. "New" moves it into the pipeline; the toast links to the card.
 */
export function createLeadStatusMutation(onopen: (dealId: string) => void) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, status }: { id: ID; status: LeadStatus }) => leadService.update(id, { status }),
		onSuccess: (lead, { status }) => {
			client.invalidateQueries({ queryKey: queryKeys.resource.all('leads') });
			client.invalidateQueries({ queryKey: queryKeys.crm.all });
			if (status === 'New' && lead.dealId) {
				const dealId = lead.dealId;
				toast.success(`${lead.name} moved to the pipeline (${lead.stage ?? 'New'} stage)`, {
					action: { label: 'Open', onClick: () => onopen(dealId) }
				});
			} else {
				toast.success(`${lead.name} is now ${lead.status}`);
			}
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createDeleteDealMutation = () =>
	createPipelineMutation((id: ID) => pipelineService.removeDeal(id), { success: 'Deal deleted' });

// Options functions read their inputs once so a shared query key never fetches with a stale id.
export const createDealQuery = (id: () => ID | null) =>
	createQuery(() => {
		const dealId = id();
		return {
			queryKey: queryKeys.crm.deal(dealId ?? ''),
			queryFn: ({ signal }: { signal: AbortSignal }) => pipelineService.deal(dealId!, signal),
			enabled: !!dealId
		};
	});

export const createCrmPeopleQuery = (company: () => string) =>
	createQuery(() => {
		const id = company();
		return {
			queryKey: queryKeys.crm.people(id),
			queryFn: () => pipelineService.people(),
			enabled: !!id,
			staleTime: STALE.reference
		};
	});

export const createDealMessagesQuery = (id: () => ID | null, kind: () => DealMessageKind | undefined, search: () => string) =>
	createQuery(() => {
		const [dealId, k, q] = [id(), kind(), search()];
		return {
			queryKey: queryKeys.crm.messages(dealId ?? '', k, q),
			queryFn: ({ signal }: { signal: AbortSignal }) => pipelineService.messages(dealId!, { kind: k, search: q || undefined }, signal),
			enabled: !!dealId,
			placeholderData: keepPreviousData
		};
	});

export const createDealActivitiesQuery = (id: () => ID | null) =>
	createQuery(() => {
		const dealId = id();
		return {
			queryKey: queryKeys.crm.activities(dealId ?? ''),
			queryFn: ({ signal }: { signal: AbortSignal }) => pipelineService.activities(dealId!, signal),
			enabled: !!dealId
		};
	});

export const createSendMessageMutation = (dealId: () => ID, onDone?: () => void) =>
	createPipelineMutation(
		(body: Parameters<typeof pipelineService.createMessage>[1]) => pipelineService.createMessage(dealId(), body),
		{ onDone }
	);

export const createAddActivityMutation = (dealId: () => ID, onDone?: () => void) =>
	createPipelineMutation(
		(body: Parameters<typeof pipelineService.createActivity>[1]) => pipelineService.createActivity(dealId(), body),
		{ success: 'Activity scheduled', onDone }
	);

export const createToggleActivityMutation = () =>
	createPipelineMutation(({ id, done }: { id: ID; done: boolean }) => pipelineService.updateActivity(id, { done }));

export const createDeleteActivityMutation = () =>
	createPipelineMutation((id: ID) => pipelineService.removeActivity(id), { success: 'Activity removed' });

/* ---------- Sales ---------- */
export const createOrderDetailQuery = (id: () => ID) =>
	createQuery(() => ({
		queryKey: queryKeys.resource.detail('sales-orders', id()),
		queryFn: () => salesOrderService.detail(id())
	}));

export const createQuotationDetailQuery = (id: () => ID) =>
	createQuery(() => ({
		queryKey: queryKeys.resource.detail('quotations', id()),
		queryFn: () => quotationService.detail(id())
	}));

/* ---------- Finance ---------- */
export const createCashFlowQuery = (range: () => TrendRange) =>
	createQuery(() => ({
		queryKey: queryKeys.finance.cashFlow(range()),
		queryFn: () => cashFlowService.get(range()),
		placeholderData: keepPreviousData
	}));

/* ---------- Settings ---------- */
export const createRolesQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.settings.roles, queryFn: settingsService.roles, staleTime: STALE.reference }));

export const createPermissionsQuery = (roleId: () => ID | undefined) =>
	createQuery(() => ({
		queryKey: queryKeys.settings.permissions(roleId() ?? ''),
		queryFn: () => settingsService.permissions(roleId()!),
		enabled: !!roleId()
	}));

export function createSavePermissionsMutation(roleId: () => ID | undefined) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: ModulePermission[]) => settingsService.savePermissions(roleId()!, body),
		onSuccess: (data) => {
			client.setQueryData(queryKeys.settings.permissions(roleId()!), data);
			toast.success('Permissions saved');
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createCompanyQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.settings.company, queryFn: settingsService.company, staleTime: STALE.reference }));

export function createSaveCompanyMutation() {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: Partial<Company>) => settingsService.saveCompany(body),
		onSuccess: (data) => {
			client.setQueryData(queryKeys.settings.company, data);
			// The switcher follows a rename (it matches the company by id).
			client.invalidateQueries({ queryKey: queryKeys.app.businesses });
			toast.success('Company details saved');
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

/** Super admins: add a company and switch to it. */
export function createAddCompanyMutation(onDone?: () => void) {
	const client = useQueryClient();
	const switchCompany = useSwitchCompany();
	return createMutation(() => ({
		mutationFn: (name: string) => settingsService.createCompany(name),
		onSuccess: async (created) => {
			await client.invalidateQueries({ queryKey: queryKeys.app.businesses });
			switchCompany({ id: created.id, name: created.name });
			toast.success(`${created.name} created. You're now working in it.`);
			onDone?.();
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

/** Super admins: delete the selected company (refused while it has records). The switcher moves on. */
export function createDeleteCompanyMutation() {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: (id: ID) => settingsService.deleteCompany(id),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: queryKeys.app.businesses });
			toast.success('Company deleted');
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createRemoveFromCompanyMutation = (onDone?: () => void) =>
	createUserMutation((id: ID) => settingsService.removeFromCompany(id), 'Removed from this company', () => onDone?.());

export const createUserDetailQuery = (id: () => ID) =>
	createQuery(() => {
		const userId = id();
		return {
			queryKey: queryKeys.resource.detail('users', userId),
			queryFn: ({ signal }: { signal: AbortSignal }) => settingsService.user(userId, signal),
			enabled: !!userId
		};
	});

/** Any change to a user: refreshes the users table, the detail page and role user counts. */
function createUserMutation<V, R>(fn: (v: V) => Promise<R>, success?: string, onDone?: (r: R) => void) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: fn,
		onSuccess: (r: R) => {
			client.invalidateQueries({ queryKey: queryKeys.resource.all('users') });
			client.invalidateQueries({ queryKey: queryKeys.settings.roles });
			if (success) toast.success(success);
			onDone?.(r);
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createSaveAccessMutation = (id: () => ID) =>
	createUserMutation((body: UserUpdate) => settingsService.updateUser(id(), body), 'Access rights saved');

export const createUpdateUserMutation = (id: () => ID, success = 'User updated') =>
	createUserMutation((body: UserUpdate) => settingsService.updateUser(id(), body), success);

export const createAddUserMutation = (onDone: (r: UserWithPassword) => void) =>
	createUserMutation((body: Record<string, unknown>) => settingsService.users.create(body), 'User added', onDone);

export const createResetPasswordMutation = (onDone: (r: UserWithPassword) => void) =>
	createUserMutation((id: ID) => settingsService.resetPassword(id), undefined, onDone);

export function createChangePasswordMutation(onDone?: () => void) {
	return createMutation(() => ({
		mutationFn: settingsService.changePassword,
		onSuccess: () => {
			toast.success('Password updated. Other devices were signed out.');
			onDone?.();
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createSecurityQuery = () =>
	createQuery(() => ({ queryKey: queryKeys.settings.security, queryFn: settingsService.security }));

export function createSaveSecurityMutation() {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: SecuritySettings) => settingsService.saveSecurity(body),
		onSuccess: (data) => {
			client.setQueryData(queryKeys.settings.security, data);
			toast.success('Security settings saved');
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}
