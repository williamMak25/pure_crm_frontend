<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Figma: each settings page has its own title (the sidebar submenu replaces the old tab bar).
	// The user detail page has a back button instead of a title.
	const HEADERS: Record<string, { title: string; description: string }> = {
		'/settings/users': {
			title: 'User Management',
			description: 'Members of this company and their roles here.'
		},
		'/settings/company': {
			title: 'Company Management',
			description: 'Details and branches of the company selected at the top. Each company stands on its own.'
		},
		'/settings/roles': {
			title: 'Roles & Permissions',
			description: 'Create user roles and control access to ERP modules and actions.'
		}
	};
	const header = $derived(HEADERS[page.url.pathname]);
</script>

<div class="flex flex-col gap-4">
	{#if header}<PageHeader title={header.title} description={header.description} divider />{/if}
	{@render children()}
</div>
