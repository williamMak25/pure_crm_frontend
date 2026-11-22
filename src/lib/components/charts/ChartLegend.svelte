<script lang="ts">
	// Figma legend: 12px square swatch + 14px label, 16px gap.
	let { items }: { items: { label: string; color: string; value?: string }[] } = $props();
</script>

<ul class="flex flex-wrap items-center gap-x-4 gap-y-2">
	{#each items as item (item.label)}
		<li class="flex items-center gap-1 text-sm text-neutral-800">
			<span class="size-3 rounded-[2px]" style:background-color={item.color}></span>
			{item.label}
			{#if item.value}<span class="ml-1 text-neutral-500">{item.value}</span>{/if}
		</li>
	{/each}
</ul>
