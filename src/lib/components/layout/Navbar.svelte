<script lang="ts">
	import { createBusinessesQuery, createMeQuery } from '#lib/queries/dashboard.ts';
	import { authService } from '#lib/services/index.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Skeleton from '../ui/skeleton/Skeleton.svelte';

	const businesses = createBusinessesQuery();
	const me = createMeQuery();
	let q = $state('');

	const items = $derived((businesses.data ?? []).map((b) => ({ value: b.name, label: b.name })));

	// Users only get the businesses they belong to; don't leave the switcher on one they can't open.
	$effect(() => {
		const list = businesses.data;
		if (list?.length && !list.some((b) => b.name === ui.business)) ui.business = list[0].name;
	});

	let signingOut = $state(false);
	async function signOut() {
		signingOut = true;
		try {
			await authService.logout();
		} finally {
			// Full reload: drops every cached query from this session.
			window.location.assign('/login');
		}
	}
</script>

<!-- Figma "Navbar": 84px, company switcher · 540px search · bell + account. -->
<header class="sticky top-0 z-20 flex h-[72px] items-center gap-3 bg-white px-4 sm:px-5 lg:h-[84px] lg:pr-6">
	<button
		type="button"
		class="grid size-10 place-items-center rounded-lg text-neutral-800 hover:bg-neutral-100 lg:hidden"
		aria-label="Open menu"
		onclick={() => (ui.mobileNavOpen = true)}
	>
		<Icon name="menu" size={22} />
	</button>

	{#if businesses.isPending}
		<Skeleton width="174px" height="42px" rounded="lg" />
	{:else}
		<Dropdown
			{items}
			selected={ui.business}
			placement="bottom-start"
			onselect={(v) => (ui.business = v)}
			triggerLabel="Switch business"
			triggerClass="flex h-[42px] w-[150px] items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 text-md text-neutral-800 hover:bg-neutral-50 sm:w-[174px]"
		>
			{#snippet trigger()}
				<span class="truncate">{ui.business}</span>
				<Icon name="chevronDown" class="text-brand-600" />
			{/snippet}
		</Dropdown>
	{/if}

	<form role="search" class="mx-auto hidden w-full max-w-[540px] md:block" onsubmit={(e) => e.preventDefault()}>
		<label class="flex h-[42px] items-center gap-2 rounded-lg border border-neutral-200 px-3 focus-within:border-brand-500">
			<Icon name="search" class="text-neutral-400" />
			<span class="sr-only">Search</span>
			<input bind:value={q} type="search" placeholder="Search ..." class="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-neutral-400 focus:ring-0" />
		</label>
	</form>

	<div class="ml-auto flex items-center gap-4 md:ml-0 lg:gap-6">
		<button type="button" class="relative grid size-10 place-items-center rounded-lg text-neutral-800 hover:bg-neutral-100" aria-label="Notifications, 1 unread">
			<Icon name="bell" />
			<span class="absolute top-2 right-2.5 size-2 rounded-full border border-white bg-brand-600"></span>
		</button>
		{#if me.isPending}
			<Skeleton width="44px" height="44px" rounded="full" />
		{:else if me.data}
			<div class="flex items-center gap-2">
				<Avatar src={me.data.avatar} name={me.data.name} eager />
				<div class="hidden flex-col gap-[3px] whitespace-nowrap sm:flex">
					<span class="text-sm font-medium text-neutral-800">{me.data.name}</span>
					<span class="text-xs text-neutral-500">{me.data.role}</span>
				</div>
			</div>
		{/if}
		<button
			type="button"
			class="grid size-10 place-items-center rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
			aria-label="Sign out"
			title="Sign out"
			disabled={signingOut}
			onclick={signOut}
		>
			<Icon name="logout" />
		</button>
	</div>
</header>
