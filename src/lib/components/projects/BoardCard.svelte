<script lang="ts">
	import type { Board } from '#lib/types/index.ts';
	import StatusBadge from '../ui/badge/StatusBadge.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import { formatDate } from '#lib/utils/format.ts';

	// Figma "Project Card": business header, title + status, task count, due date footer.
	let { board }: { board: Board } = $props();
</script>

<a
	href="/projects/{board.id}"
	class="group flex flex-col rounded-lg border border-neutral-200 bg-white shadow-card transition-shadow hover:shadow-pop focus-visible:outline-2"
>
	<div class="flex items-center gap-2 rounded-t-lg border-b border-neutral-200 bg-neutral-50 px-3 py-3">
		<span class="size-2 rounded-full bg-brand-600"></span>
		<h2 class="text-md text-neutral-800">{board.business}</h2>
	</div>
	<div class="flex flex-col gap-2 border-b border-neutral-200 px-3 py-3">
		<div class="flex items-center justify-between gap-2">
			<p class="truncate text-sm text-neutral-700 group-hover:text-neutral-900">{board.title}</p>
			<StatusBadge status={board.status} />
		</div>
		<p class="text-sm text-brand-600">{board.taskCount} Tasks</p>
	</div>
	<p class="flex items-center gap-1.5 px-3 py-3 text-sm text-neutral-600">
		<Icon name="calendar" size={18} />Due Date: {board.dueDate ? formatDate(board.dueDate) : 'Not set'}
	</p>
</a>
