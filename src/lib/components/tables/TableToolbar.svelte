<script lang="ts">
	import type { Snippet } from 'svelte';
	import Input from '../ui/input/Input.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import { PAGE_SIZES } from '#lib/constants/status.ts';

	interface Props {
		search: string;
		pageSize: number;
		total: number;
		filters?: Snippet;
		searchLabel?: string;
	}
	let { search = $bindable(), pageSize = $bindable(), total, filters, searchLabel = 'Search' }: Props = $props();
</script>

<!-- Figma "Frame 22": subtle 252px search left, "Showing [10] of N results" right. -->
<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex flex-wrap items-center gap-3">
		<Input
			bind:value={search}
			size="sm"
			appearance="subtle"
			icon="search"
			placeholder="Search"
			aria-label={searchLabel}
			type="search"
			class="w-full sm:w-[252px]"
		/>
		{@render filters?.()}
	</div>
	<div class="flex items-center gap-3.5 text-sm text-neutral-700">
		<label class="flex items-center gap-1.5">
			<span>Showing</span>
			<span class="relative">
				<select
					bind:value={pageSize}
					class="h-7 appearance-none rounded border-0 bg-transparent py-0 pr-4 pl-1 text-sm text-neutral-800 focus:ring-2 focus:ring-brand-50"
					aria-label="Rows per page"
				>
					{#each PAGE_SIZES as s (s)}<option value={s}>{s}</option>{/each}
				</select>
				<Icon name="chevronDown" size={12} class="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2" />
			</span>
		</label>
		<span>of {total} results</span>
	</div>
</div>
