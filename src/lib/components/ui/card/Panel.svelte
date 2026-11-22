<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../button/Button.svelte';

	// White 12px-radius section container used for every dashboard block.
	interface Props {
		title?: string;
		viewAllHref?: string;
		actions?: Snippet;
		children: Snippet;
		class?: string;
		bodyClass?: string;
	}
	let { title, viewAllHref, actions, children, class: className = '', bodyClass = '' }: Props = $props();
</script>

<section class="flex min-w-0 flex-col gap-4 rounded-xl bg-white p-4 sm:p-5 {className}">
	{#if title || actions || viewAllHref}
		<header class="flex items-center gap-2.5">
			<h2 class="flex-1 text-md font-medium text-neutral-800">{title}</h2>
			{@render actions?.()}
			{#if viewAllHref}
				<Button href={viewAllHref} variant="outline" size="sm" iconRight="chevronRight">View All</Button>
			{/if}
		</header>
	{/if}
	<div class="min-w-0 {bodyClass}">{@render children()}</div>
</section>
