<script lang="ts">
	import { page } from '$app/state';
	import SecurityForm from '#lib/components/settings/SecurityForm.svelte';
	import Avatar from '#lib/components/ui/avatar/Avatar.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Select from '#lib/components/ui/select/Select.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import SegmentTabs from '#lib/components/ui/tabs/SegmentTabs.svelte';
	import { createBusinessesQuery } from '#lib/queries/dashboard.ts';
	import {
		createPermissionsQuery,
		createRolesQuery,
		createSaveAccessMutation,
		createSaveSecurityMutation,
		createSecurityQuery,
		createUserDetailQuery
	} from '#lib/queries/modules.ts';
	import type { ModulePermission } from '#lib/types/index.ts';

	const id = $derived(page.params.id ?? '');
	const user = createUserDetailQuery(() => id);
	const roles = createRolesQuery();
	const businesses = createBusinessesQuery();
	const saveAccess = createSaveAccessMutation(() => id);
	const security = createSecurityQuery();
	const saveSecurity = createSaveSecurityMutation();

	let tab = $state<'access' | 'security'>('access');

	// Draft edits; null means "not edited, show the saved value".
	let draftRole = $state<string | null>(null);
	let draftBusinesses = $state<string[] | null>(null);
	let draftDefault = $state<string | null>(null);
	const roleId = $derived(draftRole ?? user.data?.roleId ?? '');
	const chosen = $derived(draftBusinesses ?? user.data?.businesses ?? []);
	// The default must be one of the chosen businesses; fall back to the first one.
	const defaultBusiness = $derived.by(() => {
		for (const candidate of [draftDefault, user.data?.defaultBusiness]) {
			if (candidate && chosen.includes(candidate)) return candidate;
		}
		return chosen[0] ?? '';
	});
	const dirty = $derived(draftRole !== null || draftBusinesses !== null || draftDefault !== null);

	// Access is decided by the role: show what the selected role's matrix grants per module.
	const rolePermissions = createPermissionsQuery(() => roleId || undefined);
	const addable = $derived((businesses.data ?? []).map((b) => b.name).filter((n) => !chosen.includes(n)));

	const GROUPS: { title: string; modules: string[] }[] = [
		{ title: 'CRM & Sales', modules: ['CRM & Contacts', 'Sales'] },
		{ title: 'Accounting', modules: ['Invoices', 'Finance'] },
		{ title: 'Services', modules: ['Project & Board'] },
		{ title: 'Human Resources', modules: ['HR & Payroll'] },
		{ title: 'Productivity', modules: ['Overview', 'Setting'] }
	];

	function level(p: ModulePermission | undefined) {
		const a = p?.actions;
		if (!a?.read) return 'No access';
		if (a.delete) return 'Administrator';
		if (a.approve) return 'Manager';
		if (a.create || a.update) return 'User';
		return 'Read only';
	}
	const levelOf = (module: string) => level(rolePermissions.data?.find((p) => p.module === module));

	function reset() {
		draftRole = draftBusinesses = draftDefault = null;
	}
	async function save() {
		await saveAccess.mutateAsync({ roleId, businesses: chosen, defaultBusiness });
		reset();
	}
</script>

<svelte:head><title>{user.data?.name ?? 'User'} · User Management · PURE Education ERP</title></svelte:head>

<div class="flex flex-col gap-4">
	<a href="/settings/users" class="grid size-7 place-items-center rounded-md hover:bg-neutral-200" aria-label="Back to users">
		<Icon name="chevronLeft" size={22} />
	</a>

	<!-- Profile card -->
	<section class="flex items-center gap-4 rounded-xl bg-white p-4 sm:p-5" aria-label="User profile">
		{#if user.isPending}
			<Skeleton width="96px" height="96px" rounded="lg" />
			<div class="flex flex-col gap-2"><Skeleton width="160px" height="18px" /><Skeleton width="200px" height="14px" /></div>
		{:else if user.isError}
			<ErrorState compact error={user.error} onretry={() => user.refetch()} />
		{:else}
			{@const u = user.data}
			<Avatar src={u.avatar} name={u.name} size={96} class="rounded-lg" />
			<div class="flex min-w-0 flex-col gap-1.5">
				<h2 class="text-md font-medium text-neutral-800">{u.name}</h2>
				<p class="flex items-center gap-1.5 text-xs text-neutral-600"><Icon name="mail" size={16} />{u.email}</p>
				{#each u.phones as phone (phone)}<p class="flex items-center gap-1.5 text-xs text-neutral-600"><Icon name="phone" size={16} />{phone}</p>{/each}
			</div>
		{/if}
	</section>

	<div class="rounded-xl bg-white p-2.5">
		<SegmentTabs
			tabs={[{ label: 'Access Rights', value: 'access' }, { label: 'Security', value: 'security' }]}
			value={tab}
			onchange={(v) => (tab = v as 'access' | 'security')}
		/>
	</div>

	{#if tab === 'access'}
		{#if user.data}
			<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<section class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:p-5">
					<h2 class="border-b border-neutral-200 pb-3 text-md font-medium text-neutral-800">Roles</h2>
					<Select
						label="Role"
						value={roleId}
						options={(roles.data ?? []).map((r) => ({ label: r.name, value: r.id }))}
						onchange={(e) => (draftRole = e.currentTarget.value)}
					/>
					<div class="flex flex-col gap-1.5">
						<span class="text-sm text-neutral-800">Businesses</span>
						<div class="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5">
							{#each chosen as name (name)}
								<span class="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-700">
									{name}
									<button type="button" class="text-neutral-500 hover:text-brand-600" aria-label="Remove {name}" onclick={() => (draftBusinesses = chosen.filter((b) => b !== name))}>
										<Icon name="close" size={12} />
									</button>
								</span>
							{/each}
							{#if addable.length}
								<select
									class="h-7 border-0 bg-transparent py-0 pr-7 pl-1 text-xs text-neutral-500 focus:ring-0"
									aria-label="Add business"
									value=""
									onchange={(e) => {
										const v = e.currentTarget.value;
										if (v) draftBusinesses = [...chosen, v];
										e.currentTarget.value = '';
									}}
								>
									<option value="">+ Add business</option>
									{#each addable as name (name)}<option value={name}>{name}</option>{/each}
								</select>
							{/if}
						</div>
					</div>
					<Select label="Default Business" value={defaultBusiness} options={chosen} onchange={(e) => (draftDefault = e.currentTarget.value)} />
					<div class="flex justify-end gap-3 border-t border-neutral-100 pt-4">
						<Button variant="outline" size="md" disabled={!dirty} onclick={reset}>Cancel</Button>
						<Button size="md" disabled={!dirty || !chosen.length} loading={saveAccess.isPending} onclick={save}>Save Changes</Button>
					</div>
				</section>

				{#each GROUPS as group (group.title)}
					<section class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:p-5">
						<h2 class="border-b border-neutral-200 pb-3 text-md font-medium text-neutral-800">{group.title}</h2>
						{#each group.modules as module (module)}
							{#if rolePermissions.isPending}
								<Skeleton height="42px" rounded="lg" />
							{:else}
								<!-- Read-only: change the role, or edit the role in Roles & Permissions. -->
								<Select label={module} value={levelOf(module)} options={[levelOf(module)]} disabled title="Set by the user's role" />
							{/if}
						{/each}
					</section>
				{/each}
			</div>
			<p class="text-xs text-neutral-500">Module access comes from the role. To change it, pick another role or edit the role in Roles &amp; Permissions.</p>
		{/if}
	{:else if security.isPending}
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-busy="true">
			{#each Array(2) as _, i (i)}
				<div class="flex flex-col gap-4 rounded-xl bg-white p-5"><Skeleton width="160px" height="20px" />{#each Array(4) as _, j (j)}<Skeleton height="42px" rounded="lg" />{/each}</div>
			{/each}
		</div>
	{:else if security.isError}
		<div class="rounded-xl bg-white"><ErrorState error={security.error} onretry={() => security.refetch()} /></div>
	{:else}
		{#key security.dataUpdatedAt}
			<SecurityForm initial={security.data} saving={saveSecurity.isPending} onsave={(s) => saveSecurity.mutate(s)} />
		{/key}
	{/if}
</div>
