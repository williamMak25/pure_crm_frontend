<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ModuleTab } from '#lib/constants/navigation.ts';
	import LinkTabs from '../ui/tabs/LinkTabs.svelte';
	import PageHeader from './PageHeader.svelte';

	// Shared frame for tabbed modules (CRM, Sales, Invoices, Finance, HR):
	// title + description, divider, tab bar with a primary action, then content.
	interface Props {
		title: string;
		description: string;
		tabs: ModuleTab[];
		action?: Snippet;
		children: Snippet;
	}
	let { title, description, tabs, action, children }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<PageHeader {title} {description} divider />
	<div class="flex flex-col gap-3 rounded-lg bg-neutral-50 p-2.5 sm:flex-row sm:items-center sm:justify-between">
		<LinkTabs {tabs} />
		{#if action}<div class="shrink-0">{@render action()}</div>{/if}
	</div>
	{@render children()}
</div>
