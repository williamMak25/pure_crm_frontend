<script lang="ts">
	import Skeleton from './Skeleton.svelte';
	let { height = 328 }: { height?: number } = $props();
	const bars = [55, 70, 40, 85, 60, 75, 45];
</script>

<div class="flex items-end gap-[6%] px-[6%] pb-6" style:height="{height}px" aria-busy="true" aria-label="Loading chart">
	{#each bars as h, i (i)}
		<Skeleton height="{h}%" class="flex-1" rounded="md" />
	{/each}
</div>
