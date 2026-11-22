<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from 'svelte';
	import { createListQuery } from '#lib/queries/resource.ts';
	import type { ResourceService } from '#lib/services/resource.service.ts';
	import { debounced } from '#lib/utils/debounce.svelte.ts';
	import EmptyState from '../ui/state/EmptyState.svelte';
	import ErrorState from '../ui/state/ErrorState.svelte';
	import TableSkeleton from '../ui/skeleton/TableSkeleton.svelte';
	import DataTable from './DataTable.svelte';
	import Pagination from './Pagination.svelte';
	import TableToolbar from './TableToolbar.svelte';
	import type { Column } from './types';

	interface Props {
		/** Cache namespace, e.g. "contacts". */
		name: string;
		service: ResourceService<T, any>;
		columns: Column<T>[];
		caption: string;
		rowHref?: (row: T) => string;
		onview?: (row: T) => void;
		cell?: Snippet<[T, Column<T>]>;
		/** Extra filter params (status, type…) controlled by the page. */
		filters?: Record<string, string>;
		filterControls?: Snippet;
		emptyTitle?: string;
	}

	let { name, service, columns, caption, rowHref, onview, cell, filters = {}, filterControls, emptyTitle }: Props = $props();

	let pageSize = $state(10);
	let search = $state('');
	const searchTerm = debounced(() => search);

	// The selected page is tied to the current filter set, so changing search /
	// page size / filters falls back to page 1 without an $effect.
	const filterKey = $derived(JSON.stringify([searchTerm.current, pageSize, filters]));
	let pageState = $state({ key: '', page: 1 });
	const page = $derived(pageState.key === filterKey ? pageState.page : 1);
	const setPage = (p: number) => (pageState = { key: filterKey, page: p });

	const params = $derived({ page, pageSize, search: searchTerm.current, ...filters });

	const query = createListQuery<T>(() => ({ name, service, params }));
</script>

<div class="flex flex-col gap-3">
	<TableToolbar bind:search bind:pageSize total={query.data?.total ?? 0} filters={filterControls} />

	{#if query.isPending}
		<TableSkeleton columns={columns.length} rows={Math.min(pageSize, 10)} />
	{:else if query.isError}
		<div class="rounded-lg border border-neutral-200 bg-white"><ErrorState error={query.error} onretry={() => query.refetch()} /></div>
	{:else if query.data.items.length === 0}
		<div class="rounded-lg border border-neutral-200 bg-white">
			<EmptyState
				title={emptyTitle ?? 'No records found'}
				description={searchTerm.current ? `Nothing matches “${searchTerm.current}”. Try a different keyword.` : 'New records will appear here.'}
			/>
		</div>
	{:else}
		<DataTable {columns} rows={query.data.items} {rowHref} {onview} {cell} {caption} dimmed={query.isPlaceholderData} />
		<Pagination page={query.data.page} total={query.data.total} pageSize={query.data.pageSize} onchange={setPage} />
	{/if}
</div>
