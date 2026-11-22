<script lang="ts">
	import type { TaskList } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import TaskCard from './TaskCard.svelte';
	import type { Task } from '#lib/types/index.ts';

	// Figma "Task List Card": 252px white column, title + red count + more, cards, "Add a task".
	interface Props {
		list: TaskList;
		canEdit: boolean;
		eager?: boolean;
		adding: boolean;
		addPending: boolean;
		onstartadd: () => void;
		oncanceladd: () => void;
		onadd: (title: string) => void;
		onopen: (task: Task) => void;
		onaction: (task: Task, action: string) => void;
		onrename: (title: string) => void;
		ondelete: () => void;
		/** Drag and drop: the card being dragged anywhere on the board, if any. */
		dragTaskId: string | null;
		dragEnabled: boolean;
		ondragcard: (task: Task | null) => void;
		/** `index` counts the list's cards without the dragged one. */
		ondropcard: (index: number) => void;
	}
	let {
		list,
		canEdit,
		eager = false,
		adding,
		addPending,
		onstartadd,
		oncanceladd,
		onadd,
		onopen,
		onaction,
		onrename,
		ondelete,
		dragTaskId,
		dragEnabled,
		ondragcard,
		ondropcard
	}: Props = $props();

	// Where the dragged card would land in this list (null = not over this list).
	let hoverIndex = $state<number | null>(null);
	const dropIndex = $derived(dragTaskId ? hoverIndex : null);
	const others = $derived(list.tasks.filter((t) => t.id !== dragTaskId));
	const indexOf = $derived(new Map(others.map((t, i) => [t.id, i])));

	function indexAt(section: HTMLElement, y: number) {
		let index = 0;
		for (const el of section.querySelectorAll<HTMLElement>('[data-task-id]')) {
			if (el.dataset.taskId === dragTaskId) continue;
			const r = el.getBoundingClientRect();
			if (y > r.top + r.height / 2) index++;
			else break;
		}
		return index;
	}

	let title = $state('');
	let collapsed = $state(false);
	let renaming = $state(false);
	let newTitle = $state('');
	const listActions = $derived([
		...(canEdit
			? [
					{ value: 'add', label: 'Add a task', icon: 'plus' as const },
					{ value: 'rename', label: 'Rename list', icon: 'edit' as const }
				]
			: []),
		{ value: 'collapse', label: collapsed ? 'Expand list' : 'Collapse list', icon: 'chevronLeft' as const },
		...(canEdit ? [{ value: 'delete', label: 'Delete list', icon: 'trash' as const, danger: true }] : [])
	]);

	function onlistaction(v: string) {
		if (v === 'add') onstartadd();
		else if (v === 'collapse') collapsed = !collapsed;
		else if (v === 'rename') {
			newTitle = list.title;
			renaming = true;
		} else if (v === 'delete') {
			const cards = list.tasks.length ? ` and its ${list.tasks.length} card(s)` : '';
			if (confirm(`Delete the list "${list.title}"${cards}?`)) ondelete();
		}
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		onadd(title.trim());
		title = '';
	}
</script>

{#snippet placeholder()}
	<div class="h-16 shrink-0 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/60" aria-hidden="true"></div>
{/snippet}

<section
	class="flex w-[252px] shrink-0 flex-col gap-3 self-start rounded-xl border bg-white p-3 transition-colors {dropIndex !== null ? 'border-brand-300' : 'border-neutral-200'}"
	aria-label="{list.title} list"
	ondragover={(e) => {
		if (!dragTaskId || collapsed) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		hoverIndex = indexAt(e.currentTarget, e.clientY);
	}}
	ondragleave={(e) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hoverIndex = null;
	}}
	ondrop={(e) => {
		if (!dragTaskId || collapsed) return;
		e.preventDefault();
		ondropcard(hoverIndex ?? others.length);
		hoverIndex = null;
	}}
>
	<header class="flex items-center gap-2">
		{#if renaming}
			<form
				class="flex-1"
				onsubmit={(e) => {
					e.preventDefault();
					if (newTitle.trim() && newTitle.trim() !== list.title) onrename(newTitle.trim());
					renaming = false;
				}}
			>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					bind:value={newTitle}
					autofocus
					aria-label="List title"
					class="h-7 w-full rounded border border-brand-500 px-2 text-sm outline-none"
					onblur={(e) => e.currentTarget.form?.requestSubmit()}
					onkeydown={(e) => e.key === 'Escape' && (renaming = false)}
				/>
			</form>
		{:else}
			<h2 class="flex-1 truncate text-sm font-medium text-neutral-800">{list.title}</h2>
		{/if}
		<span class="text-sm text-brand-600">{list.tasks.length}</span>
		<Dropdown
			items={listActions}
			onselect={onlistaction}
			triggerLabel="List actions for {list.title}"
			triggerClass="grid size-6 place-items-center rounded text-neutral-700 hover:bg-neutral-100"
		>
			{#snippet trigger()}<Icon name="more" size={18} />{/snippet}
		</Dropdown>
	</header>

	{#if !collapsed}
		{#each list.tasks as task, i (task.id)}
			{#if dropIndex !== null && indexOf.get(task.id) === dropIndex}{@render placeholder()}{/if}
			<TaskCard
				{task}
				{canEdit}
				eagerCover={eager && i === 0}
				onopen={() => onopen(task)}
				onaction={(a) => onaction(task, a)}
				draggable={dragEnabled}
				dragging={dragTaskId === task.id}
				ondragstart={() => ondragcard(task)}
				ondragend={() => {
					hoverIndex = null;
					ondragcard(null);
				}}
			/>
		{/each}
		{#if dropIndex !== null && dropIndex >= others.length}{@render placeholder()}{/if}

		{#if canEdit}
			{#if adding}
				<form class="flex flex-col gap-2" onsubmit={submit}>
					<!-- svelte-ignore a11y_autofocus -->
					<textarea
						bind:value={title}
						rows="2"
						autofocus
						placeholder="Enter your task title ..."
						aria-label="Task title"
						class="w-full resize-none rounded-lg bg-neutral-100 px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-brand-50"
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								e.currentTarget.form?.requestSubmit();
							}
							if (e.key === 'Escape') oncanceladd();
						}}
					></textarea>
					<div class="flex gap-2">
						<Button type="submit" size="md" icon="plus" class="flex-1 px-2" loading={addPending}>Add a task</Button>
						<Button variant="outline-brand" size="md" class="flex-1" onclick={oncanceladd}>Cancel</Button>
					</div>
				</form>
			{:else}
				<Button size="md" icon="plus" fullWidth onclick={onstartadd}>Add a task</Button>
			{/if}
		{/if}
	{/if}
</section>
