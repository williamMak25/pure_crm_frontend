<script lang="ts">
	import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		placement?: 'top' | 'bottom' | 'left' | 'right';
		children: Snippet;
		disabled?: boolean;
	}

	let { text, placement = 'top', children, disabled = false }: Props = $props();
</script>

{#if disabled}
	{@render children()}
{:else}
	<Tooltip positioning={{ placement }} openDelay={250} closeDelay={50}>
		<Tooltip.Trigger>
			{#snippet element(attributes)}
				<span {...attributes as Record<string, unknown>} class="inline-flex">{@render children()}</span>
			{/snippet}
		</Tooltip.Trigger>
		<Portal>
			<Tooltip.Positioner class="z-[60]">
				<Tooltip.Content class="rounded-md bg-neutral-800 px-2 py-1 text-xs text-white shadow-pop">{text}</Tooltip.Content>
			</Tooltip.Positioner>
		</Portal>
	</Tooltip>
{/if}
