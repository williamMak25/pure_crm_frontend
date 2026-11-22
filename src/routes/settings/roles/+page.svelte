<script lang="ts">
	import PermissionEditor from '#lib/components/settings/PermissionEditor.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import {
		createPermissionsQuery,
		createRolesQuery,
		createSavePermissionsMutation
	} from '#lib/queries/modules.ts';

	const roles = createRolesQuery();
	let picked = $state<string | undefined>();
	const roleId = $derived(picked ?? roles.data?.[0]?.id);
	const role = $derived(roles.data?.find((r) => r.id === roleId));

	const permissions = createPermissionsQuery(() => roleId);
	const save = createSavePermissionsMutation(() => roleId);

	const isAdmin = $derived(role?.name === 'Super Admin');
</script>

<svelte:head><title>Roles &amp; Permissions · PURE Education ERP</title></svelte:head>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
	<!-- "User Role" items: name with the user count underneath (Default / Hover / Active states). -->
	<nav aria-label="Roles" class="flex flex-col self-start overflow-hidden rounded-xl bg-white">
		{#if roles.isPending}
			{#each Array(6) as _, i (i)}<Skeleton height="45px" rounded="lg" />{/each}
		{:else if roles.isError}
			<ErrorState compact error={roles.error} onretry={() => roles.refetch()} />
		{:else}
			<ul class="flex flex-row overflow-x-auto lg:flex-col">
				{#each roles.data as r (r.id)}
					<li class="shrink-0">
						<button
							type="button"
							aria-current={r.id === roleId ? 'true' : undefined}
							class="flex w-full flex-col gap-1 border-b border-neutral-100 px-3 py-3 text-left text-sm transition-colors {r.id === roleId
								? 'bg-brand-50 text-brand-600'
								: 'text-neutral-800 hover:bg-neutral-50'}"
							onclick={() => (picked = r.id)}
						>
							{r.name}
							<span class="flex items-center gap-1 text-xs text-neutral-500"><Icon name="contacts" size={14} />{r.users} users</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>

	<section class="flex min-w-0 flex-col gap-3 rounded-xl bg-white p-4 sm:p-5" aria-labelledby="perm-title">
		<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 id="perm-title" class="text-md font-medium text-neutral-800">{role?.name ?? 'Role'}</h2>
				<p class="text-sm text-neutral-500">{role?.description ?? ''}</p>
			</div>
		</header>

		{#if permissions.isPending}
			<div class="flex flex-col gap-2">{#each Array(9) as _, i (i)}<Skeleton height="36px" />{/each}</div>
		{:else if permissions.isError}
			<ErrorState error={permissions.error} onretry={() => permissions.refetch()} />
		{:else}
			{#if isAdmin}<p class="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-500">The Super Admin role always has full access and can’t be edited.</p>{/if}
			{#key `${roleId}:${permissions.dataUpdatedAt}`}
				<PermissionEditor initial={permissions.data} readonly={isAdmin} saving={save.isPending} onsave={(rows) => save.mutate(rows)} />
			{/key}
		{/if}
	</section>
</div>
