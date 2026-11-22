<script lang="ts">
	import Skeleton from './Skeleton.svelte';
	// Matches DataTable: 52px header + 52px rows.
	let { columns = 8, rows = 10 }: { columns?: number; rows?: number } = $props();
</script>

<div class="overflow-hidden rounded-lg border border-neutral-200" aria-busy="true" aria-label="Loading table">
	<div class="grid h-[52px] items-center gap-4 border-b border-neutral-200 bg-white px-4" style:grid-template-columns="repeat({columns}, minmax(0, 1fr))">
		{#each Array(columns) as _, i (i)}<Skeleton height="14px" width="70%" class="mx-auto" />{/each}
	</div>
	{#each Array(rows) as _, r (r)}
		<div
			class="grid h-[52px] items-center gap-4 px-4 {r % 2 ? 'bg-neutral-50' : 'bg-white'}"
			style:grid-template-columns="repeat({columns}, minmax(0, 1fr))"
		>
			{#each Array(columns) as _, i (i)}<Skeleton height="12px" width={i % 3 === 0 ? '60%' : '75%'} class="mx-auto" />{/each}
		</div>
	{/each}
</div>
