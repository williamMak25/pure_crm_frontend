<script lang="ts" module>
	import type { IconName } from '#lib/constants/icons.ts';
	export type DropdownItem = { value: string; label: string; icon?: IconName; danger?: boolean; disabled?: boolean };
</script>

<script lang="ts">
	import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import Icon from '../icon/Icon.svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		items: DropdownItem[];
		onselect: (value: string) => void;
		/** Custom trigger content. The trigger is rendered as a <button>. */
		trigger: Snippet;
		triggerClass?: string;
		triggerLabel?: string;
		/** "list" = plain menu, "stacked" = Figma card-actions style (each item its own chip). */
		appearance?: 'list' | 'stacked';
		placement?: 'bottom-start' | 'bottom-end' | 'right-start';
		selected?: string;
	}

	let {
		items,
		onselect,
		trigger,
		triggerClass = '',
		triggerLabel,
		appearance = 'list',
		placement = 'bottom-end',
		selected
	}: Props = $props();
</script>

<Menu positioning={{ placement, gutter: 6 }} onSelect={(d) => onselect(d.value)}>
	<Menu.Trigger class={triggerClass} aria-label={triggerLabel}>
		{@render trigger()}
	</Menu.Trigger>
	<Portal>
		<Menu.Positioner class="z-50">
			<Menu.Content
				class={cn(
					'min-w-40 outline-none',
					appearance === 'list'
						? 'rounded-lg border border-neutral-200 bg-white p-1 shadow-pop'
						: 'flex flex-col items-start gap-2'
				)}
			>
				{#each items as item (item.value)}
					<Menu.Item
						value={item.value}
						disabled={item.disabled}
						class={cn(
							'flex cursor-pointer items-center gap-2 text-sm outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
							appearance === 'list'
								? 'rounded-md px-3 py-2 data-highlighted:bg-neutral-100'
								: 'rounded-lg border border-neutral-200 bg-white px-4 py-2.5 shadow-card data-highlighted:bg-neutral-50',
							item.danger ? 'text-brand-600' : 'text-neutral-700',
							selected === item.value && 'font-medium text-brand-600'
						)}
					>
						{#if item.icon}<Icon name={item.icon} size={18} />{/if}
						<Menu.ItemText>{item.label}</Menu.ItemText>
					</Menu.Item>
				{/each}
			</Menu.Content>
		</Menu.Positioner>
	</Portal>
</Menu>
