<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import type { UserSummary } from '#lib/types/index.ts';

	// Figma "Student Acc Popup" — opened from the sidebar account row.
	interface Props {
		user?: UserSummary;
		collapsed?: boolean;
	}
	let { user, collapsed = false }: Props = $props();

	const items = [
		{ value: 'profile', label: 'My Profile', icon: 'user' as const },
		{ value: 'settings', label: 'Settings', icon: 'settings' as const },
		{ value: 'logout', label: 'Log out', icon: 'logout' as const, danger: true }
	];

	function onselect(v: string) {
		if (v === 'profile') goto('/settings/users');
		else if (v === 'settings') goto('/settings/roles');
		else toast('Signed out', { description: 'Connect this action to your auth provider.' });
	}
</script>

<Dropdown {items} {onselect} placement="right-start" triggerClass="flex w-full items-center gap-2 rounded-lg py-1 text-left hover:bg-neutral-50" triggerLabel="Account menu">
	{#snippet trigger()}
		<Avatar src={user?.avatar} name={user?.name ?? 'User'} size={44} />
		{#if !collapsed}
			<span class="flex min-w-0 flex-1 flex-col gap-[3px]">
				<span class="truncate text-sm font-medium text-neutral-800">{user?.name ?? '—'}</span>
				<span class="truncate text-xs text-neutral-500">{user?.role ?? ''} Account</span>
			</span>
			<Icon name="chevronRight" class="text-neutral-800" />
		{/if}
	{/snippet}
</Dropdown>
