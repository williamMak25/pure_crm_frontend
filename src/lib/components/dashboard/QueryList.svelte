<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import ListItemSkeleton from '../ui/skeleton/ListItemSkeleton.svelte';
	import EmptyState from '../ui/state/EmptyState.svelte';
	import ErrorState from '../ui/state/ErrorState.svelte';

	// Renders loading / error / empty / success for any list-shaped query.
	interface Props {
		query: { isPending: boolean; isError: boolean; error: Error | null; data: T[] | undefined; refetch: () => unknown };
		item: Snippet<[T]>;
		skeletonCount?: number;
		skeletonHeight?: number;
		emptyTitle?: string;
	}
	let { query, item, skeletonCount = 5, skeletonHeight = 78, emptyTitle = 'All caught up' }: Props = $props();
</script>

{#if query.isPending}
	<ListItemSkeleton count={skeletonCount} height={skeletonHeight} />
{:else if query.isError}
	<ErrorState compact error={query.error} onretry={() => query.refetch()} />
{:else if !query.data?.length}
	<EmptyState compact title={emptyTitle} />
{:else}
	<ul class="flex flex-col gap-2">
		{#each query.data as row, i (i)}{@render item(row)}{/each}
	</ul>
{/if}
