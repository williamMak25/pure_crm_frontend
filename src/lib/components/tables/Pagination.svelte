<script lang="ts">
	import Icon from '../ui/icon/Icon.svelte';

	interface Props {
		page: number;
		total: number;
		pageSize: number;
		onchange: (page: number) => void;
	}
	let { page, total, pageSize, onchange }: Props = $props();

	const pages = $derived(Math.max(1, Math.ceil(total / pageSize)));

	// 1 2 3 … 8 pattern from Figma, sliding around the current page.
	const items = $derived.by(() => {
		if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
		const set = new Set([1, page - 1, page, page + 1, pages].filter((p) => p >= 1 && p <= pages));
		if (page <= 2) [2, 3].forEach((p) => set.add(p));
		const sorted = [...set].sort((a, b) => a - b);
		const out: (number | '…')[] = [];
		sorted.forEach((p, i) => {
			if (i && p - sorted[i - 1] > 1) out.push('…');
			out.push(p);
		});
		return out;
	});
</script>

<nav aria-label="Pagination" class="flex items-center justify-between gap-2 text-sm text-neutral-700">
	<button
		type="button"
		class="inline-flex items-center gap-2 rounded px-1 py-1 disabled:opacity-40"
		disabled={page <= 1}
		onclick={() => onchange(page - 1)}
	>
		<Icon name="chevronLeft" size={20} /><span class="hidden sm:inline">Previous</span>
	</button>

	<ol class="flex items-center gap-1.5">
		{#each items as item, i (i)}
			<li>
				{#if item === '…'}
					<span class="px-1 text-neutral-500">…</span>
				{:else}
					<button
						type="button"
						aria-current={item === page ? 'page' : undefined}
						class="grid h-8 min-w-[31px] place-items-center rounded-md px-1.5 {item === page
							? 'bg-brand-500 text-white'
							: 'text-neutral-600 hover:bg-neutral-100'}"
						onclick={() => onchange(item)}
					>
						{item}
					</button>
				{/if}
			</li>
		{/each}
	</ol>

	<button
		type="button"
		class="inline-flex items-center gap-2 rounded px-1 py-1 disabled:opacity-40"
		disabled={page >= pages}
		onclick={() => onchange(page + 1)}
	>
		<span class="hidden sm:inline">Next</span><Icon name="chevronRight" size={20} />
	</button>
</nav>
