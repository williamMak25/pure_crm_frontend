<script lang="ts">
	import type { NavItem } from '#lib/constants/navigation.ts';
	import Icon from '../ui/icon/Icon.svelte';
	import Tooltip from '../ui/tooltip/Tooltip.svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		item: NavItem;
		active: boolean;
		collapsed?: boolean;
		expanded?: boolean;
		currentPath: string;
		ontoggle?: () => void;
		onnavigate?: () => void;
	}

	let { item, active, collapsed = false, expanded = false, currentPath, ontoggle, onnavigate }: Props = $props();

	const base = 'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors';
	const state = $derived(active ? 'bg-brand-50 font-medium text-brand-600' : 'text-neutral-800 hover:bg-neutral-50');
</script>

{#if item.children && !collapsed}
	<div>
		<button type="button" class={cn(base, state, 'justify-between')} aria-expanded={expanded} onclick={ontoggle}>
			<span class="flex items-center gap-2"><Icon name={item.icon} />{item.label}</span>
			<Icon name="chevronDown" class="transition-transform {expanded ? 'rotate-180' : ''}" />
		</button>
		{#if expanded}
			<ul class="mt-1 ml-[22px] flex flex-col gap-1 border-l border-neutral-200 pl-3">
				{#each item.children as child (child.href)}
					<li>
						<a
							href={child.href}
							onclick={onnavigate}
							aria-current={currentPath.startsWith(child.href) ? 'page' : undefined}
							class="block rounded-md px-3 py-2 text-sm {currentPath.startsWith(child.href)
								? 'font-medium text-brand-600'
								: 'text-neutral-600 hover:bg-neutral-50'}"
						>
							{child.label}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{:else}
	<Tooltip text={item.label} placement="right" disabled={!collapsed}>
		<a
			href={item.href}
			onclick={onnavigate}
			aria-current={active ? 'page' : undefined}
			aria-label={collapsed ? item.label : undefined}
			class={cn(base, state, collapsed && 'size-11 justify-center px-0')}
		>
			<Icon name={item.icon} />
			{#if !collapsed}<span>{item.label}</span>{/if}
		</a>
	</Tooltip>
{/if}
