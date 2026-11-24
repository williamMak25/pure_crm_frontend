<script lang="ts">
	import { page } from '$app/state';
	import DealDialog from '#lib/components/crm/DealDialog.svelte';
	import PipelineColumn from '#lib/components/crm/PipelineColumn.svelte';
	import FormDrawer from '#lib/components/forms/FormDrawer.svelte';
	import ModuleLayout from '#lib/components/layout/ModuleLayout.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import EmptyState from '#lib/components/ui/state/EmptyState.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import {
		createAddStageMutation,
		createDeleteDealMutation,
		createMoveDealMutation,
		createPipelineQuery,
		createUpdateDealMutation
	} from '#lib/queries/modules.ts';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { Deal, PipelineStage } from '#lib/types/index.ts';

	// Each business has its own pipeline; follow the navbar switcher.
	const pipeline = createPipelineQuery(() => ui.companyId);
	let stageOpen = $state(false);
	const addStage = createAddStageMutation();
	let dealStage = $state<PipelineStage | null>(null);
	// "Copy link" in the deal dialog points here with ?deal=<id>.
	let openDeal = $state<string | null>(page.url.searchParams.get('deal'));
	const updateDeal = createUpdateDealMutation();
	const deleteDeal = createDeleteDealMutation();
	const moveDeal = createMoveDealMutation(() => ui.companyId);

	// Drag and drop between stages (desktop); the card's ⋮ menu has "Move to …" for touch and keyboard.
	// Only for roles that can update CRM, so a drop never bounces back with a 403.
	const me = createMeQuery();
	const canMove = $derived(!!me.data && (me.data.isSuperuser || !!me.data.permissions?.crm?.includes('update')));
	const stageRefs = $derived((pipeline.data ?? []).map((s) => ({ id: s.id, name: s.name })));
	let dragDeal = $state<Deal | null>(null);
	function moveToStage(dealId: string, stageId: string) {
		const target = pipeline.data?.find((s) => s.id === stageId);
		moveDeal.mutate({ id: dealId, stageId, position: target?.deals.length ?? 0 });
	}
	function dropDeal(stageId: string, index: number) {
		const deal = dragDeal;
		dragDeal = null;
		if (!deal) return;
		const from = pipeline.data?.find((s) => s.id === deal.stageId);
		if (stageId === deal.stageId && index === from?.deals.findIndex((d) => d.id === deal.id)) return;
		moveDeal.mutate({ id: deal.id, stageId, position: index });
	}

	function confirmDelete(dealId: string) {
		const name = pipeline.data?.flatMap((s) => s.deals).find((d) => d.id === dealId)?.name ?? 'this deal';
		if (confirm(`Delete ${name}? The contact stays in Contacts.`)) deleteDeal.mutate(dealId);
	}
</script>

<svelte:head><title>Pipeline · PURE ERP</title></svelte:head>

<ModuleLayout {...MODULES.crm}>
	{#snippet action()}
		<Button size="lg" icon="plus" onclick={() => (stageOpen = true)}>Add Pipeline</Button>
	{/snippet}

	{#if !ui.companyId}
		<div class="rounded-xl bg-white"><EmptyState title="Pick a company" description="Each company has its own pipeline. Choose one in the switcher above." /></div>
	{:else if pipeline.isPending}
		<div class="flex gap-3 overflow-hidden" aria-busy="true">
			{#each [4, 2, 1, 0] as n, i (i)}
				<div class="flex w-[252px] shrink-0 flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3">
					<Skeleton height="16px" width="40%" /><Skeleton height="6px" />
					{#each Array(n) as _, j (j)}<Skeleton height="120px" rounded="lg" />{/each}
				</div>
			{/each}
		</div>
	{:else if pipeline.isError}
		<div class="rounded-xl bg-white"><ErrorState error={pipeline.error} onretry={() => pipeline.refetch()} /></div>
	{:else if !pipeline.data.length}
		<div class="rounded-xl bg-white"><EmptyState title="No pipeline stages yet" description="Add a stage to start tracking opportunities." /></div>
	{:else}
		<div class="scrollbar-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:-mx-5 sm:px-5">
			{#each pipeline.data as stage (stage.id)}
				<PipelineColumn
					{stage}
					onadd={() => (dealStage = stage)}
					onopen={(id) => (openDeal = id)}
					allStages={stageRefs}
					onmovedeal={moveToStage}
					dragDealId={dragDeal?.id ?? null}
					dragEnabled={canMove}
					ondragdeal={(d) => (dragDeal = d)}
					ondropdeal={(index) => dropDeal(stage.id, index)}
					ondelete={confirmDelete}
					onrate={(id, rating) => updateDeal.mutate({ id, body: { rating } })}
				/>
			{/each}
		</div>
	{/if}
</ModuleLayout>

<FormDrawer
	bind:open={stageOpen}
	title="Add Pipeline Stage"
	fields={FORMS.pipeline}
	placement="center"
	width={426}
	pending={addStage.isPending}
	onsubmit={(p) => addStage.mutateAsync({ name: String(p.name) })}
	onclose={() => (stageOpen = false)}
/>

<DealDialog
	dealId={openDeal}
	stage={dealStage}
	onclose={() => {
		openDeal = null;
		dealStage = null;
	}}
/>
