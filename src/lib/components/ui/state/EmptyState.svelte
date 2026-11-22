<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconName } from '#lib/constants/icons.ts';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		title?: string;
		description?: string;
		icon?: IconName;
		compact?: boolean;
		action?: Snippet;
	}
	let { title = 'Nothing here yet', description, icon = 'inbox', compact = false, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-2 text-center {compact ? 'py-6' : 'py-14'}">
	<span class="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600"><Icon name={icon} size={24} /></span>
	<p class="text-md font-medium text-neutral-800">{title}</p>
	{#if description}<p class="max-w-sm text-sm text-neutral-500">{description}</p>{/if}
	{#if action}<div class="mt-2">{@render action()}</div>{/if}
</div>
