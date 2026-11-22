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
			description: 'Manage who can sign in, their roles and the businesses they work in.'
		},
		'/settings/company': {
			title: 'Company Management',
			description: 'Keep your company profile, business units and branches up to date.'
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
