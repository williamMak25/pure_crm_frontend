<script lang="ts">
	import FormDrawer from '#lib/components/forms/FormDrawer.svelte';
	import ResourceTable from '#lib/components/tables/ResourceTable.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import Avatar from '#lib/components/ui/avatar/Avatar.svelte';
	import StatusBadge from '#lib/components/ui/badge/StatusBadge.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import TempPasswordModal from '#lib/components/settings/TempPasswordModal.svelte';
	import { FORMS } from '#lib/constants/forms.ts';
	import { toast } from 'svelte-sonner';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import { createAddUserMutation, createRolesQuery } from '#lib/queries/modules.ts';
	import { settingsService } from '#lib/services/index.ts';
	import type { AppUser, UserWithPassword } from '#lib/types/index.ts';
	import { formatRelative } from '#lib/utils/format.ts';

	const me = createMeQuery();
	const roles = createRolesQuery();
	// The temporary password dialog opens only after the Add User drawer has closed;
	// opening it while the drawer closes would dismiss it, and the password with it.
	let created = $state<UserWithPassword | null>(null);
	let justCreated: UserWithPassword | null = null;
	// An existing account just joins this company and keeps its password: no password dialog for that.
	const invite = createAddUserMutation((r) => {
		if (r.existingAccount) toast.info(`${r.user.name} already had an account and now belongs to this company too.`);
		else justCreated = r;
	});
	let inviteOpen = $state(false);
	// Role choices are this company's roles.
	const userFields = $derived(
		FORMS.user.map((f) => (f.name === 'role' ? { ...f, options: (roles.data ?? []).map((r) => r.name) } : f))
	);

	const columns: Column<AppUser>[] = [
		{ key: 'name', label: 'Name', align: 'left', minWidth: 200 },
		{ key: 'email', label: 'Email' },
		{ key: 'role', label: 'Role' },
		{ key: 'companies', label: 'Companies' },
		{ key: 'lastActive', label: 'Last Active' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Users · PURE ERP</title></svelte:head>

<div class="flex flex-col gap-4">
	<!-- Current user profile card (Figma "Setting" user frame). -->
	<section class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:flex-row sm:items-center sm:p-5" aria-label="Your profile">
		{#if me.isPending}
			<Skeleton width="72px" height="72px" rounded="full" />
			<div class="flex flex-1 flex-col gap-2"><Skeleton width="180px" height="20px" /><Skeleton width="240px" height="14px" /></div>
		{:else if me.data}
			<Avatar src={me.data.avatar} name={me.data.name} size={72} />
			<div class="flex flex-1 flex-col gap-1.5">
				<h2 class="text-md font-medium text-neutral-800">{me.data.name}</h2>
				{#if me.data.email}<p class="flex items-center gap-1.5 text-xs text-neutral-600"><Icon name="mail" size={16} />{me.data.email}</p>{/if}
				{#if me.data.phones?.length}
					<p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
						{#each me.data.phones as phone (phone)}<span class="flex items-center gap-1.5"><Icon name="phone" size={16} />{phone}</span>{/each}
					</p>
				{/if}
			</div>
			<StatusBadge status={me.data.role} tone="red" />
		{/if}
	</section>

	<section class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:p-5">
		<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<h2 class="text-md font-medium text-neutral-800">Users</h2>
			<Button size="lg" icon="plus" onclick={() => (inviteOpen = true)}>Add User</Button>
		</header>
		<ResourceTable name="users" service={settingsService.users as never} {columns} caption="Workspace users" rowHref={(u: AppUser) => `/settings/users/${u.id}`}>
			{#snippet cell(u, col)}
				{#if col.key === 'name'}
					<span class="flex items-center gap-2"><Avatar src={u.avatar} name={u.name} size={32} />{u.name}</span>
				{:else if col.format === 'status'}
					<StatusBadge status={u.status} />
				{:else if col.key === 'companies'}
					{u.companies.join(', ')}
				{:else if col.key === 'lastActive'}
					{formatRelative(u.lastActive)}
				{:else if col.format === 'view'}
					<a href="/settings/users/{u.id}" class="inline-flex items-center gap-1.5 hover:text-brand-600"><Icon name="eye" />View</a>
				{:else}
					{u[col.key]}
				{/if}
			{/snippet}
		</ResourceTable>
	</section>
</div>

<FormDrawer
	bind:open={inviteOpen}
	title="Add New User"
	fields={userFields}
	submitLabel="Add User"
	pending={invite.isPending}
	onsubmit={(p) => invite.mutateAsync(p)}
	onclose={() => {
		inviteOpen = false;
		if (justCreated) setTimeout(() => ((created = justCreated), (justCreated = null)), 0);
	}}
/>
<TempPasswordModal result={created} title="User added" onclose={() => (created = null)} />
