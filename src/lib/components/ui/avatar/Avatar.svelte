<script lang="ts">
	import { initials } from '#lib/utils/format.ts';

	interface Props {
		src?: string | null;
		name: string;
		size?: number;
		/** Above-the-fold avatars (navbar) load eagerly. */
		eager?: boolean;
		class?: string;
	}

	let { src, name, size = 44, eager = false, class: className = '' }: Props = $props();
	let failed = $state(false);
	let loaded = $state(false);
</script>

<span
	class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-medium text-neutral-600 {className}"
	style:width="{size}px"
	style:height="{size}px"
>
	{#if src && !failed}
		{#if !loaded}<span class="absolute inset-0 animate-pulse bg-neutral-200"></span>{/if}
		<img
			{src}
			alt={name}
			width={size}
			height={size}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class="size-full object-cover"
			onload={() => (loaded = true)}
			onerror={() => (failed = true)}
		/>
	{:else}
		<span aria-label={name}>{initials(name)}</span>
	{/if}
</span>
