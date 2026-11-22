<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconName } from '#lib/constants/icons.ts';
	import Icon from '../ui/icon/Icon.svelte';

	// Figma "Box": bordered 12px-radius row with optional leading icon tile,
	// title + subtitle, and a trailing meta (status / time / amount).
	interface Props {
		title: string;
		subtitle?: string;
		icon?: IconName;
		/** "tile" = 32px Neutral/100 square, "ring" = circled icon (Need your attention). */
		iconStyle?: 'tile' | 'ring';
		meta?: Snippet;
		children?: Snippet;
		size?: 'md' | 'sm';
	}
	let { title, subtitle, icon, iconStyle = 'tile', meta, children, size = 'md' }: Props = $props();
</script>

<li class="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
	{#if icon}
		<span
			class="grid size-8 shrink-0 place-items-center text-brand-600 {iconStyle === 'tile'
				? 'rounded-md bg-neutral-100'
				: 'rounded-full border border-neutral-200 bg-white'}"
		>
			<Icon name={icon} size={18} />
		</span>
	{/if}
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<p class="truncate {size === 'md' ? 'text-md' : 'text-sm'} text-neutral-800">{title}</p>
		{#if children}
			{@render children()}
		{:else}
			<div class="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
				{#if subtitle}<p class="truncate text-sm text-neutral-600">{subtitle}</p>{/if}
				{@render meta?.()}
			</div>
		{/if}
	</div>
</li>
