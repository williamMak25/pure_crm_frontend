import {
	createMutation,
	createQuery,
	keepPreviousData,
	useQueryClient
} from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import type { ResourceService } from '#lib/services/resource.service.ts';
import type { ID, ListParams } from '#lib/types/index.ts';
import { queryKeys } from './keys';

/**
 * Paginated + filtered list for any REST collection.
 * `params` is an accessor so the query re-runs when page/search/filter change.
 */
export function createListQuery<T>(
	opts: () => { name: string; service: ResourceService<T, any>; params: ListParams }
) {
	return createQuery(() => {
		const { name, service, params: p } = opts();
		return {
			queryKey: queryKeys.resource.list(name, p),
			queryFn: ({ signal }: { signal: AbortSignal }) => service.list(p, signal),
			placeholderData: keepPreviousData
		};
	});
}

export function createDetailQuery<T>(name: string, fetcher: (id: ID) => Promise<T>, id: () => ID) {
	return createQuery(() => ({
		queryKey: queryKeys.resource.detail(name, id()),
		queryFn: () => fetcher(id()),
		enabled: !!id()
	}));
}

/** Create mutation that invalidates the collection and toasts on success / error. */
export function createCreateMutation<T, TInput>(
	name: string,
	service: ResourceService<T, TInput>,
	opts: { successMessage?: string; onSuccess?: (data: T) => void } = {}
) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: (body: TInput) => service.create(body),
		onSuccess: (data) => {
			client.invalidateQueries({ queryKey: queryKeys.resource.all(name) });
			toast.success(opts.successMessage ?? 'Saved successfully');
			opts.onSuccess?.(data);
		},
		onError: (err: Error) => toast.error(err.message || 'Something went wrong')
	}));
}

export function createUpdateMutation<T, TInput>(
	name: string,
	service: ResourceService<T, TInput>,
	opts: { successMessage?: string; onSuccess?: (data: T) => void } = {}
) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: ({ id, body }: { id: ID; body: Partial<TInput> }) => service.update(id, body),
		onSuccess: (data) => {
			client.invalidateQueries({ queryKey: queryKeys.resource.all(name) });
			toast.success(opts.successMessage ?? 'Changes saved');
			opts.onSuccess?.(data);
		},
		onError: (err: Error) => toast.error(err.message || 'Something went wrong')
	}));
}
