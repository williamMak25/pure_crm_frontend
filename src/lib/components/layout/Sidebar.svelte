<script lang="ts">
	import { page } from '$app/state';
	import { NAV_ITEMS } from '#lib/constants/navigation.ts';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import AccountMenu from '../navigation/AccountMenu.svelte';
	import NavLink from '../navigation/NavLink.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Skeleton from '../ui/skeleton/Skeleton.svelte';
	import { cn } from '#lib/utils/cn.ts';

	const me = createMeQuery();
	const path = $derived(page.url.pathname);
	const isActive = (match: string) => (match === '/' ? path === '/' : path.startsWith(match));

	// Settings group opens automatically when a settings page is active.
	let settingsToggled = $state<boolean | null>(null);
	const settingsOpen = $derived(settingsToggled ?? path.startsWith('/settings'));

	const collapsed = $derived(ui.sidebarCollapsed && !ui.mobileNavOpen);
	const closeMobile = () => (ui.mobileNavOpen = false);
</script>

{#if ui.mobileNavOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
		aria-label="Close menu"
		onclick={closeMobile}
	></button>
{/if}

<!-- Figma "Admin Nav Side Links": 266px open / 92px closed rail. -->
<aside
	class={cn(
		'fixed inset-y-0 left-0 z-50 flex h-dvh flex-col justify-between bg-white py-2 transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0',
		collapsed ? 'w-[92px] px-6' : 'w-[266px] px-6',
		ui.mobileNavOpen ? 'translate-x-0 shadow-pop' : '-translate-x-full'
	)}
	aria-label="Main navigation"
>
	<div class="flex min-h-0 flex-col gap-4">
		<div class={cn('flex items-center border-b border-neutral-200 pt-1 pb-4', collapsed ? 'flex-col gap-3' : 'justify-between px-5')}>
			<a href="/" class="flex items-center justify-center overflow-hidden rounded-md border border-neutral-100 p-1.5" aria-label="PURE Education home">
				<img
					src="/images/logo.png"
					alt="PURE Education"
					width="80"
					height="40"
					class={cn('object-contain', collapsed ? 'h-6 w-8 object-left' : 'h-10 w-20')}
					loading="eager"
					fetchpriority="high"
				/>
			</a>
			<button
				type="button"
				class="hidden size-8 place-items-center rounded-md text-neutral-800 hover:bg-neutral-100 lg:grid"
				aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				aria-expanded={!collapsed}
				onclick={() => ui.toggleSidebar()}
			>
				<Icon name="menu" />
			</button>
			<button type="button" class="grid size-8 place-items-center rounded-md hover:bg-neutral-100 lg:hidden" aria-label="Close menu" onclick={closeMobile}>
				<Icon name="close" />
			</button>
		</div>

		<nav class="scrollbar-thin -mx-1 overflow-y-auto px-1">
			<ul class="flex flex-col gap-2">
				{#each NAV_ITEMS as item (item.href)}
					<li>
						<NavLink
							{item}
							{collapsed}
							currentPath={path}
							active={isActive(item.match)}
							expanded={settingsOpen}
							ontoggle={() => (settingsToggled = !settingsOpen)}
							onnavigate={closeMobile}
						/>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<div class="border-t border-neutral-300 py-4">
		{#if me.isPending}
			<div class="flex items-center gap-2"><Skeleton width="44px" height="44px" rounded="full" />{#if !collapsed}<Skeleton width="60%" height="14px" />{/if}</div>
		{:else}
			<AccountMenu user={me.data} {collapsed} />
		{/if}
	</div>
</aside>
