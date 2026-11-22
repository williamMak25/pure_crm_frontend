<script lang="ts">
	import type { Snippet } from 'svelte';

	// Figma "Main Title and Description" — 16px title + 14px Neutral/600 description.
	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
		divider?: boolean;
	}
	let { title, description, actions, divider = false }: Props = $props();
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between {divider ? 'border-b border-neutral-200 pb-4' : ''}">
	<div class="flex flex-col gap-1.5">
		<h1 class="text-md text-neutral-800">{title}</h1>
		{#if description}<p class="text-sm text-neutral-600">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex shrink-0 flex-wrap gap-3">{@render actions()}</div>{/if}
</div>
