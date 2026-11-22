<script lang="ts">
	import { untrack } from 'svelte';
	import type { Deal } from '#lib/types/index.ts';
	import { formatDate, formatNumber } from '#lib/utils/format.ts';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Tag from '../ui/badge/Tag.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import StarRating from './StarRating.svelte';

	// Figma "Odoo Pipeline Card": Neutral/100 card, name, company + amount, tags, stars, footer.
	// Hover variant adds delete + "more" icons; clicking the card opens "Edit Pipeline".
	interface Props {
		deal: Deal;
		onopen: () => void;
		ondelete: () => void;
		onrate?: (rating: number) => void;
		/** Other stages for the "Move to …" menu (touch / keyboard alternative to dragging). */
		moveTargets?: { id: string; name: string }[];
		onmove?: (stageId: string) => void;
		/** Drag and drop between stages (desktop). */
		draggable?: boolean;
		dragging?: boolean;
		ondragstart?: () => void;
		ondragend?: () => void;
	}
	let { deal, onopen, ondelete, onrate, moveTargets = [], onmove, draggable = false, dragging = false, ondragstart, ondragend }: Props =
		$props();
	const moreItems = $derived([
		{ value: 'open', label: 'Open', icon: 'card' as const },
		...moveTargets.map((s) => ({ value: s.id, label: `Move to ${s.name}`, icon: 'arrowRight' as const }))
	]);
	// Local UI state seeded from the deal.
	let rating = $state(untrack(() => deal.rating));
</script>

<article
	class="group relative flex flex-col gap-2.5 rounded-lg bg-neutral-100 p-3 transition-opacity hover:ring-1 hover:ring-neutral-200 {draggable ? 'cursor-grab active:cursor-grabbing' : ''} {dragging ? 'opacity-40' : ''}"
	data-deal-id={deal.id}
	{draggable}
	ondragstart={(e) => {
		e.dataTransfer?.setData('text/plain', deal.id);
		if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
		ondragstart?.();
	}}
	{ondragend}
>
	<!-- Whole-card click target; the stars and icon buttons sit above it. -->
	<button type="button" class="absolute inset-0 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Open {deal.name}" onclick={onopen}></button>

	<div class="pointer-events-none relative flex flex-col gap-1.5 border-b border-neutral-200 pb-2">
		<div class="flex items-center justify-between gap-2">
			<h3 class="truncate text-sm font-medium text-neutral-800">{deal.name}</h3>
			<div class="pointer-events-auto flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
				<button type="button" class="grid size-6 place-items-center rounded text-brand-600 hover:bg-brand-50" aria-label="Delete {deal.name}" onclick={ondelete}>
					<Icon name="trash" size={18} />
				</button>
				<Dropdown
					items={moreItems}
					onselect={(v) => (v === 'open' ? onopen() : onmove?.(v))}
					triggerLabel="More for {deal.name}"
					triggerClass="grid size-6 place-items-center rounded text-brand-600 hover:bg-brand-50"
				>
					{#snippet trigger()}<Icon name="moreVertical" size={18} />{/snippet}
				</Dropdown>
			</div>
		</div>
		<div class="flex items-center justify-between text-xs text-neutral-700">
			<span>{deal.company ?? ''}</span>
			{#if deal.amount}<span class="text-neutral-500">{formatNumber(deal.amount)}.000 K</span>{/if}
		</div>
	</div>
	{#if deal.tags.length}
		<div class="pointer-events-none relative flex flex-wrap gap-1">
			{#each deal.tags as tag, i (tag)}<Tag label={tag} tone={i % 2 ? 'pink' : 'green'} />{/each}
		</div>
	{/if}
	<div class="relative self-start">
		<StarRating bind:value={rating} label="Priority for {deal.name}" onchange={onrate} />
	</div>
	<div class="pointer-events-none relative flex items-center justify-between gap-1 text-xs text-neutral-700">
		{#if deal.date && !deal.scheduled}
			<span class="inline-flex items-center gap-1 whitespace-nowrap"><Icon name="check" size={16} class="text-brand-600" />{formatDate(deal.date)}</span>
		{:else}
			<span class="inline-flex items-center gap-1 whitespace-nowrap"><Icon name="clock" size={16} class="text-brand-600" />Schedule activity</span>
		{/if}
		{#if deal.owner}
			<span class="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
				<Avatar src={deal.owner.avatar} name={deal.owner.name} size={24} />{deal.owner.name}
			</span>
		{/if}
	</div>
</article>
