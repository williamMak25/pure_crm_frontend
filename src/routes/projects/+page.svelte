<script lang="ts">
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import BoardCard from '#lib/components/projects/BoardCard.svelte';
	import BoardCardSkeleton from '#lib/components/projects/BoardCardSkeleton.svelte';
	import CreateBoardModal from '#lib/components/projects/CreateBoardModal.svelte';
	import Pagination from '#lib/components/tables/Pagination.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Dropdown from '#lib/components/ui/dropdown/Dropdown.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Input from '#lib/components/ui/input/Input.svelte';
	import EmptyState from '#lib/components/ui/state/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import { createBoardsQuery } from '#lib/queries/projects.ts';
	import { debounced } from '#lib/utils/debounce.svelte.ts';

	let search = $state('');
	let status = $state('');
	let createOpen = $state(false);
	const term = debounced(() => search);

	const filterKey = $derived(JSON.stringify([term.current, status]));
	let pageState = $state({ key: '', page: 1 });
	const page = $derived(pageState.key === filterKey ? pageState.page : 1);

	const boards = createBoardsQuery(() => ({ page, pageSize: 9, search: term.current, status }));

	const statusItems = [{ value: '', label: 'All Status' }, ...['Planning', 'In Progress', 'Completed'].map((v) => ({ value: v, label: v }))];
	const filterBtn = 'inline-flex h-[38px] items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50';
</script>

<svelte:head><title>Project &amp; Board · PURE ERP</title></svelte:head>

<div class="flex flex-col gap-4">
	<PageHeader title="Project & Board" description="Manage projects and track team progress in this company." divider>
		{#snippet actions()}
			<Button size="lg" icon="plus" onclick={() => (createOpen = true)}>Create Board</Button>
		{/snippet}
	</PageHeader>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<Input bind:value={search} icon="search" placeholder="Search board ..." aria-label="Search board" type="search" class="w-full sm:w-[330px]" inputClass="h-[38px]!" />
		<div class="flex gap-3">
			<Dropdown items={statusItems} selected={status} onselect={(v) => (status = v)} triggerClass={filterBtn} triggerLabel="Filter by status">
				{#snippet trigger()}{status || 'Status'}<Icon name="chevronDown" size={18} />{/snippet}
			</Dropdown>
		</div>
	</div>

	{#if boards.isPending}
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
			{#each Array(9) as _, i (i)}<BoardCardSkeleton />{/each}
		</div>
	{:else if boards.isError}
		<div class="rounded-xl bg-white"><ErrorState error={boards.error} onretry={() => boards.refetch()} /></div>
	{:else if !boards.data.items.length}
		<div class="rounded-xl bg-white">
			<EmptyState title="No boards found" description="Try another search or create a new board.">
				{#snippet action()}<Button size="lg" icon="plus" onclick={() => (createOpen = true)}>Create Board</Button>{/snippet}
			</EmptyState>
		</div>
	{:else}
		<ul class="grid grid-cols-1 gap-3 transition-opacity md:grid-cols-2 xl:grid-cols-3 {boards.isPlaceholderData ? 'opacity-60' : ''}">
			{#each boards.data.items as board (board.id)}<li><BoardCard {board} /></li>{/each}
		</ul>
		{#if boards.data.total > boards.data.pageSize}
			<Pagination page={boards.data.page} total={boards.data.total} pageSize={boards.data.pageSize} onchange={(p) => (pageState = { key: filterKey, page: p })} />
		{/if}
	{/if}
</div>

<CreateBoardModal open={createOpen} onclose={() => (createOpen = false)} />
