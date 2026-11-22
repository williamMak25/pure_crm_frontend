<script lang="ts">
	import type { Deal, PipelineStage } from '#lib/types/index.ts';
	import { formatNumber } from '#lib/utils/format.ts';
	import Icon from '../ui/icon/Icon.svelte';
	import PipelineCard from './PipelineCard.svelte';

	// Figma "Pipeline List Card": 252px white column, stage header + progress + total.
	// Also a drop zone: deals can be dragged here from any stage.
	interface Props {
		stage: PipelineStage;
		onadd: () => void;
		onopen: (dealId: string) => void;
		ondelete: (dealId: string) => void;
		onrate?: (dealId: string, rating: number) => void;
		/** Every stage of the board, for the card's "Move to …" menu. */
		allStages: { id: string; name: string }[];
		onmovedeal: (dealId: string, stageId: string) => void;
		/** The deal being dragged anywhere on the board, if any. */
		dragDealId: string | null;
		dragEnabled: boolean;
		ondragdeal: (deal: Deal | null) => void;
		/** `index` counts the stage's deals without the dragged one. */
		ondropdeal: (index: number) => void;
	}
	let { stage, onadd, onopen, ondelete, onrate, allStages, onmovedeal, dragDealId, dragEnabled, ondragdeal, ondropdeal }: Props = $props();
	const moveTargets = $derived(dragEnabled ? allStages.filter((s) => s.id !== stage.id) : []);

	let hoverIndex = $state<number | null>(null);
	const dropIndex = $derived(dragDealId ? hoverIndex : null);
	const others = $derived(stage.deals.filter((d) => d.id !== dragDealId));
	const indexOf = $derived(new Map(others.map((d, i) => [d.id, i])));

	function indexAt(section: HTMLElement, y: number) {
		let index = 0;
		for (const el of section.querySelectorAll<HTMLElement>('[data-deal-id]')) {
			if (el.dataset.dealId === dragDealId) continue;
			const r = el.getBoundingClientRect();
			if (y > r.top + r.height / 2) index++;
			else break;
		}
		return index;
	}
</script>

{#snippet placeholder()}
	<div class="h-20 shrink-0 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/60" aria-hidden="true"></div>
{/snippet}

<section
	class="flex w-[252px] shrink-0 flex-col gap-3 self-start rounded-xl border bg-white p-3 transition-colors {dropIndex !== null ? 'border-brand-300' : 'border-neutral-200'}"
	aria-label="{stage.name} stage"
	ondragover={(e) => {
		if (!dragDealId) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		hoverIndex = indexAt(e.currentTarget, e.clientY);
	}}
	ondragleave={(e) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hoverIndex = null;
	}}
	ondrop={(e) => {
		if (!dragDealId) return;
		e.preventDefault();
		ondropdeal(hoverIndex ?? others.length);
		hoverIndex = null;
	}}
>
	<header class="flex flex-col gap-1">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-medium text-neutral-800">{stage.name}</h2>
			<button type="button" class="grid size-6 place-items-center rounded text-neutral-700 hover:bg-neutral-100" aria-label="Add deal to {stage.name}" onclick={onadd}>
				<Icon name="plus" size={18} />
			</button>
		</div>
		<div class="flex items-center gap-3">
			<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200" role="progressbar" aria-valuenow={Math.round(stage.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
				<div class="h-full rounded-full" style:width="{stage.progress * 100}%" style:background-color={stage.color}></div>
			</div>
			<span class="text-sm whitespace-nowrap text-brand-600">{formatNumber(stage.total)} K</span>
		</div>
	</header>
	{#if stage.deals.length || dropIndex !== null}
		<div class="flex flex-col gap-3">
			{#each stage.deals as deal (deal.id)}
				{#if dropIndex !== null && indexOf.get(deal.id) === dropIndex}{@render placeholder()}{/if}
				<PipelineCard
					{deal}
					onopen={() => onopen(deal.id)}
					ondelete={() => ondelete(deal.id)}
					onrate={(r) => onrate?.(deal.id, r)}
					{moveTargets}
					onmove={(stageId) => onmovedeal(deal.id, stageId)}
					draggable={dragEnabled}
					dragging={dragDealId === deal.id}
					ondragstart={() => ondragdeal(deal)}
					ondragend={() => {
						hoverIndex = null;
						ondragdeal(null);
					}}
				/>
			{/each}
			{#if dropIndex !== null && dropIndex >= others.length}{@render placeholder()}{/if}
		</div>
	{/if}
</section>
