<script lang="ts">
	import type { Snippet } from 'svelte';

	// Figma order-detail block: section title, then label / value rows in two columns.
	interface Props {
		title: string;
		rows?: { label: string; value: string | Snippet }[];
		children?: Snippet;
	}
	let { title, rows = [], children }: Props = $props();
</script>

<section class="flex flex-col gap-3">
	<h2 class="border-b border-neutral-200 pb-3 text-md font-medium text-neutral-800">{title}</h2>
	{#if rows.length}
		<dl class="flex flex-col gap-3">
			{#each rows as r (r.label)}
				<div class="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-3">
					<dt class="text-sm text-neutral-500">{r.label}</dt>
					<dd class="text-sm text-neutral-800">
						{#if typeof r.value === 'string'}{r.value}{:else}{@render r.value()}{/if}
					</dd>
				</div>
			{/each}
		</dl>
	{/if}
	{@render children?.()}
</section>
