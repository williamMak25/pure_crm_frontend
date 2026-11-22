<script lang="ts">
	import type { Task } from '#lib/types/index.ts';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import LazyImage from '../ui/image/LazyImage.svelte';
	import { formatDate } from '#lib/utils/format.ts';
	import { CARD_ACTIONS } from './card-actions';

	// Figma "Trello Board Card": Neutral/100 card with cover, title, meta row, assignee + due date.
	interface Props {
		task: Task;
		canEdit: boolean;
		eagerCover?: boolean;
		onopen: () => void;
		onaction: (action: string) => void;
		/** Drag and drop (desktop). Off while the board is filtered or for viewers. */
		draggable?: boolean;
		dragging?: boolean;
		ondragstart?: () => void;
		ondragend?: () => void;
	}
	let { task, canEdit, eagerCover = false, onopen, onaction, draggable = false, dragging = false, ondragstart, ondragend }: Props = $props();
</script>

<article
	class="group relative flex flex-col gap-2.5 rounded-lg bg-neutral-100 p-2.5 transition-opacity {draggable ? 'cursor-grab active:cursor-grabbing' : ''} {dragging ? 'opacity-40' : ''}"
	data-task-id={task.id}
	{draggable}
	ondragstart={(e) => {
		e.dataTransfer?.setData('text/plain', task.id);
		if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
		ondragstart?.();
	}}
	{ondragend}
>
	{#if canEdit}
		<div class="absolute top-3.5 right-3.5 z-10 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
			<Dropdown
				items={CARD_ACTIONS}
				appearance="stacked"
				placement="right-start"
				onselect={onaction}
				triggerLabel="Card actions for {task.title}"
				triggerClass="grid size-7 place-items-center rounded-md bg-white/90 text-neutral-700 shadow-card hover:bg-white"
			>
				{#snippet trigger()}<Icon name="more" size={18} />{/snippet}
			</Dropdown>
		</div>
	{/if}

	<button type="button" class="flex flex-col gap-2.5 text-left" onclick={onopen} aria-label="Open card {task.title}">
		{#if task.cover}
			<LazyImage src={task.cover} alt="" aspect="208 / 138" width={208} height={138} eager={eagerCover} class="rounded-sm" />
		{/if}
		<h3 class="flex items-start gap-1.5 text-sm font-medium text-neutral-800 {task.cover ? 'border-b border-neutral-200 pb-2' : ''}">
			{#if task.completed}<Icon name="checkCircle" size={16} class="mt-0.5 shrink-0 text-green-500" label="Complete" />{/if}
			{task.title}
		</h3>
	</button>

	{#if task.assignee || task.checklistTotal || task.attachments || task.dueDate || task.hasDescription}
		<div class="flex items-center gap-3 text-xs text-neutral-600">
			{#if task.hasDescription}<Icon name="text" size={16} label="Has description" />{/if}
			<span class="inline-flex items-center gap-1"><Icon name="paperclip" size={16} />{task.attachments}</span>
			<span class="inline-flex items-center gap-1"><Icon name="checkSquare" size={16} />{task.checklistDone}/{task.checklistTotal}</span>
		</div>
		<div class="flex items-center justify-between gap-2 text-xs text-neutral-600">
			{#if task.assignee}
				<span class="inline-flex items-center gap-1.5"><Avatar src={task.assignee.avatar} name={task.assignee.name} size={24} />{task.assignee.name}</span>
			{/if}
			{#if task.dueDate}<span class="ml-auto inline-flex items-center gap-1"><Icon name="calendar" size={16} />{formatDate(task.dueDate)}</span>{/if}
		</div>
	{/if}
</article>
