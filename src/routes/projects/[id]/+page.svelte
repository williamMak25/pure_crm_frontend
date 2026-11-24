<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import FilterDrawer from '#lib/components/projects/FilterDrawer.svelte';
	import MoveCardModal from '#lib/components/projects/MoveCardModal.svelte';
	import ShareBoardModal from '#lib/components/projects/ShareBoardModal.svelte';
	import TaskColumn from '#lib/components/projects/TaskColumn.svelte';
	import TaskDetailModal, { type CardPanel } from '#lib/components/projects/TaskDetailModal.svelte';
	import VisibilityMenu from '#lib/components/projects/VisibilityMenu.svelte';
	import { activeFilterCount, emptyFilters, filterSections, matchesFilters } from '#lib/components/projects/board-filter.ts';
	import Avatar from '#lib/components/ui/avatar/Avatar.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Input from '#lib/components/ui/input/Input.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import Tooltip from '#lib/components/ui/tooltip/Tooltip.svelte';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import { createBoardDetailQuery, createBoardMutations } from '#lib/queries/projects.ts';
	import type { Task } from '#lib/types/index.ts';

	const id = $derived(page.params.id ?? '');
	const board = createBoardDetailQuery(() => id);
	const m = createBoardMutations(() => id);

	let search = $state('');
	let filters = $state(emptyFilters());
	let filterOpen = $state(false);
	let shareOpen = $state(false);
	let addingListId = $state<string | null>(null);
	let newListOpen = $state(false);
	let newListTitle = $state('');
	// "Copy link" on a card points here with ?card=<id>.
	let openTaskId = $state<string | null>(page.url.searchParams.get('card'));
	let openPanel = $state<CardPanel>(null);
	let moving = $state<{ taskId: string; listId: string } | null>(null);
	const me = createMeQuery();

	const canEdit = $derived(board.data?.canEdit ?? false);
	const canManage = $derived(board.data?.canManage ?? false);
	const lists = $derived(
		(board.data?.lists ?? []).map((l) => ({ ...l, tasks: l.tasks.filter((t) => matchesFilters(t, filters, search)) }))
	);
	const boardLabels = $derived([...new Set((board.data?.lists ?? []).flatMap((l) => l.tasks.flatMap((t) => t.labels)))].sort());
	const sections = $derived(filterSections(board.data?.members ?? [], boardLabels, me.data?.id));
	const filterCount = $derived(activeFilterCount(filters));

	// Drag and drop (desktop). Off while searching or filtering, since drop positions
	// are counted against the full lists; touch and keyboard users have the Move menu.
	let dragTask = $state<Task | null>(null);
	const dragEnabled = $derived(canEdit && !search.trim() && filterCount === 0);

	function dropCard(listId: string, index: number) {
		const task = dragTask;
		dragTask = null;
		if (!task) return;
		const from = board.data?.lists.find((l) => l.id === task.listId);
		const currentIndex = from?.tasks.findIndex((t) => t.id === task.id) ?? -1;
		if (listId === task.listId && index === currentIndex) return;
		m.moveTask.mutate({ taskId: task.id, toListId: listId, position: index });
	}

	function openCard(task: Task, panel: CardPanel = null) {
		openPanel = panel;
		openTaskId = task.id;
	}

	const PANEL_FOR: Record<string, CardPanel> = { labels: 'labels', members: 'members', cover: 'cover', dates: 'dates' };
	function onaction(task: Task, action: string) {
		switch (action) {
			case 'move':
				moving = { taskId: task.id, listId: task.listId };
				break;
			case 'copy':
				m.copyTask.mutate(task.id);
				break;
			case 'archive':
				m.archiveTask.mutate(task.id);
				break;
			case 'link':
				navigator.clipboard?.writeText(`${location.origin}/projects/${id}?card=${task.id}`);
				toast.success('Card link copied');
				break;
			default:
				openCard(task, PANEL_FOR[action] ?? null);
		}
	}

	function addList(e: SubmitEvent) {
		e.preventDefault();
		if (!newListTitle.trim()) return;
		m.addList.mutate(newListTitle.trim(), {
			onSuccess: () => {
				newListTitle = '';
				newListOpen = false;
			}
		});
	}
</script>

<svelte:head><title>{board.data?.title ?? 'Board'} · PURE ERP</title></svelte:head>

<div class="flex flex-col gap-4">
	<!-- Board toolbar -->
	<div class="flex flex-wrap items-center gap-3 border-b border-neutral-200 pb-4">
		<a href="/projects" class="grid size-8 place-items-center rounded-md text-neutral-800 hover:bg-neutral-200" aria-label="Back to boards">
			<Icon name="chevronLeft" size={22} />
		</a>
		<Input bind:value={search} icon="search" placeholder="Search task ..." aria-label="Search task" type="search" class="min-w-0 flex-1 sm:max-w-[480px]" inputClass="h-[38px]!" />

		<div class="ml-auto flex items-center gap-3">
			{#if board.data}
				<div class="flex -space-x-2" aria-label="Board members">
					{#each board.data.members as mem (mem.id)}
						<Tooltip text={mem.name}><Avatar src={mem.avatar} name={mem.name} size={34} class="ring-2 ring-neutral-100" /></Tooltip>
					{/each}
				</div>
			{/if}
			<Tooltip text="Share board">
				<Button size="icon" icon="share" aria-label="Share board" onclick={() => (shareOpen = true)} />
			</Tooltip>
			<Tooltip text="Filter cards">
				<span class="relative">
					<Button size="icon" icon="filter" aria-label="Filter cards" onclick={() => (filterOpen = true)} />
					{#if filterCount}<span class="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-brand-600 text-[10px] text-white">{filterCount}</span>{/if}
				</span>
			</Tooltip>
			<VisibilityMenu value={board.data?.visibility ?? 'workspace'} disabled={!canManage} onchange={(v) => m.setVisibility.mutate(v)} />
			{#if canEdit}
				<Button size="lg" icon="plus" onclick={() => (newListOpen = true)}>Add task list</Button>
			{/if}
		</div>
	</div>

	{#if board.isPending}
		<div class="flex gap-3 overflow-hidden" aria-busy="true">
			{#each [3, 1, 1, 0] as n, i (i)}
				<div class="flex w-[252px] shrink-0 flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3">
					<Skeleton width="50%" height="16px" />
					{#each Array(n) as _, j (j)}<Skeleton height="230px" rounded="lg" />{/each}
					<Skeleton height="34px" />
				</div>
			{/each}
		</div>
	{:else if board.isError}
		<div class="rounded-xl bg-white"><ErrorState error={board.error} onretry={() => board.refetch()} /></div>
	{:else}
		<div class="scrollbar-thin -mx-4 flex items-start gap-3 overflow-x-auto px-4 pb-4 sm:-mx-5 sm:px-5">
			{#each lists as list, i (list.id)}
				<TaskColumn
					{list}
					{canEdit}
					eager={i < 2}
					adding={addingListId === list.id}
					addPending={m.addTask.isPending}
					onstartadd={() => (addingListId = list.id)}
					oncanceladd={() => (addingListId = null)}
					onadd={(title) => m.addTask.mutate({ listId: list.id, title }, { onSuccess: () => (addingListId = null) })}
					onopen={(t) => openCard(t)}
					{onaction}
					dragTaskId={dragTask?.id ?? null}
					{dragEnabled}
					ondragcard={(t) => (dragTask = t)}
					ondropcard={(index) => dropCard(list.id, index)}
					onrename={(title) => m.renameList.mutate({ listId: list.id, title })}
					ondelete={() => m.deleteList.mutate(list.id)}
				/>
			{/each}

			{#if canEdit && newListOpen}
				<form class="flex w-[252px] shrink-0 flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3" onsubmit={addList}>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						bind:value={newListTitle}
						autofocus
						placeholder="Enter list title ..."
						aria-label="List title"
						class="h-[42px] rounded-lg bg-neutral-100 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-50"
					/>
					<div class="flex gap-2">
						<Button type="submit" size="md" icon="plus" class="flex-1 px-2" loading={m.addList.isPending}>Add list</Button>
						<Button variant="outline-brand" size="md" class="flex-1" onclick={() => (newListOpen = false)}>Cancel</Button>
					</div>
				</form>
			{/if}
		</div>
	{/if}
</div>

{#if board.data}
	<ShareBoardModal open={shareOpen} boardId={id} members={board.data.members} {canManage} mutations={m} onclose={() => (shareOpen = false)} />
	<MoveCardModal
		open={!!moving}
		boardId={id}
		currentListId={moving?.listId}
		pending={m.moveTask.isPending}
		onmove={(toListId, position) => {
			if (moving) m.moveTask.mutate({ taskId: moving.taskId, toListId, position });
			if (moving?.taskId === openTaskId) openTaskId = null;
		}}
		onclose={() => (moving = null)}
	/>
	<TaskDetailModal
		taskId={openTaskId}
		lists={board.data.lists}
		members={board.data.members}
		{boardLabels}
		mutations={m}
		initialPanel={openPanel}
		onmoveboard={() => {
			const task = board.data?.lists.flatMap((l) => l.tasks).find((t) => t.id === openTaskId);
			if (task) moving = { taskId: task.id, listId: task.listId };
		}}
		onclose={() => {
			openTaskId = null;
			openPanel = null;
		}}
	/>
{/if}
<FilterDrawer open={filterOpen} bind:filters {sections} onclose={() => (filterOpen = false)} />
