<script lang="ts">
	import { page } from '$app/state';
	import type { ModuleTab } from '#lib/constants/navigation.ts';
	import Button from '../button/Button.svelte';

	// Figma "CRM Tabs": pill buttons, active = Brand/600. Each tab is its own route.
	let { tabs }: { tabs: ModuleTab[] } = $props();
	const isActive = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');
</script>

<nav aria-label="Section" class="scrollbar-thin -mx-1 flex gap-3 overflow-x-auto px-1">
	{#each tabs as tab (tab.href)}
		<Button
			href={tab.href}
			size="md"
			variant={isActive(tab.href) ? 'tab-active' : 'tab'}
			aria-current={isActive(tab.href) ? 'page' : undefined}
			data-sveltekit-noscroll
		>
			{tab.label}
		</Button>
	{/each}
</nav>
