import { createMutation, createQuery, keepPreviousData, useQueryClient } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import { cashFlowService, pipelineService, quotationService, salesOrderService, settingsService } from '#lib/services/index.ts';
import type { Company, DealInput, DealMessageKind, DealUpdate, ID, ModulePermission, PipelineStage, SecuritySettings, TrendRange } from '#lib/types/index.ts';
import { STALE } from './client';
import { queryKeys } from './keys';

/* ---------- CRM ---------- */
export const createPipelineQuery = (business: () => string) =>
	createQuery(() => {
		const name = business();
		return {
			queryKey: queryKeys.crm.pipeline(name),
			queryFn: ({ signal }: { signal: AbortSignal }) => pipelineService.stages(name, signal),
			enabled: !!name
		};
	});

/** Every pipeline change refetches the board and the Contacts table (new deals create Lead contacts). */
function createPipelineMutation<TVars, TData>(
	mutationFn: (vars: TVars) => Promise<TData>,
	opts: { success?: string; onDone?: () => void } = {}
) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn,
		onSuccess: () => {
			client.invalidateQueries({ queryKey: queryKeys.crm.all });
			client.invalidateQueries({ queryKey: queryKeys.resource.all('contacts') });
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

export const createCrmPeopleQuery = (business: () => string) =>
	createQuery(() => {
		const name = business();
		return {
			queryKey: queryKeys.crm.people(name),
			queryFn: () => pipelineService.people(name),
			enabled: !!name,
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
			toast.success('Company details saved');
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

export const createUserDetailQuery = (id: () => ID) =>
	createQuery(() => ({
		queryKey: queryKeys.resource.detail('users', id()),
		queryFn: () => settingsService.user(id())
	}));

export function createSaveAccessMutation(id: () => ID) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: Parameters<typeof settingsService.saveAccess>[1]) => settingsService.saveAccess(id(), body),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: queryKeys.resource.all('users') });
			toast.success('Access rights saved');
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
