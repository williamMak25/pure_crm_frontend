<script lang="ts">
	import Skeleton from './Skeleton.svelte';
	// Mirrors the bordered "Box" list rows on the dashboard.
	let { count = 4, height = 78, withIcon = true }: { count?: number; height?: number; withIcon?: boolean } = $props();
</script>

<div class="flex flex-col gap-2" aria-busy="true">
	{#each Array(count) as _, i (i)}
		<div class="flex items-center gap-3 rounded-xl border border-neutral-200 p-3" style:height="{height}px">
			{#if withIcon}<Skeleton width="32px" height="32px" rounded="md" />{/if}
			<div class="flex flex-1 flex-col gap-2">
				<Skeleton width="55%" height="14px" />
				<Skeleton width="30%" height="12px" />
			</div>
			<Skeleton width="72px" height="12px" class="self-end" />
		</div>
	{/each}
</div>
