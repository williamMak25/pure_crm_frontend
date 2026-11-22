<script lang="ts">
	import { createAddDealMutation, createDealQuery, createUpdateDealMutation } from '#lib/queries/modules.ts';
	import type { PipelineStage } from '#lib/types/index.ts';
	import Modal from '../ui/modal/Modal.svelte';
	import Skeleton from '../ui/skeleton/Skeleton.svelte';
	import ErrorState from '../ui/state/ErrorState.svelte';
	import DealForm from './DealForm.svelte';
	import DealTimeline from './DealTimeline.svelte';

	// Figma "Edit Pipeline" (opened from a pipeline card) and the "+" on a stage (add mode).
	interface Props {
		business: string;
		/** Edit an existing deal. */
		dealId?: string | null;
		/** Add a deal to this stage. */
		stage?: PipelineStage | null;
		onclose: () => void;
	}
	let { business, dealId = null, stage = null, onclose }: Props = $props();

	const deal = createDealQuery(() => dealId);
	const update = createUpdateDealMutation({ success: 'Deal saved' });
	const add = createAddDealMutation(() => onclose());
	let locked = $state(false);
</script>

<Modal
	open={!!dealId || !!stage}
	title={dealId ? 'Edit Pipeline' : `Add Deal to ${stage?.name ?? ''}`}
	width={dealId ? 1122 : 600}
	{onclose}
>
	<div class="-mx-3 -my-4 bg-neutral-50 p-3 sm:-mx-5 sm:p-5">
		{#if stage}
			<section class="rounded-xl bg-white p-4">
				<DealForm
					{business}
					saving={add.isPending}
					oncreate={(body) => add.mutateAsync({ stageId: stage.id, body })}
					oncancel={onclose}
				/>
			</section>
		{:else if deal.isPending}
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2" aria-busy="true">
				{#each Array(2) as _, i (i)}
					<div class="flex flex-col gap-4 rounded-xl bg-white p-4">{#each Array(5) as _, j (j)}<Skeleton height="42px" rounded="lg" />{/each}</div>
				{/each}
			</div>
		{:else if deal.isError}
			<div class="rounded-xl bg-white"><ErrorState error={deal.error} onretry={() => deal.refetch()} /></div>
		{:else}
			<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
				<section class="rounded-xl bg-white p-4" aria-label="Deal details">
					{#key deal.dataUpdatedAt}
						<DealForm
							business={deal.data.business}
							deal={deal.data}
							{locked}
							saving={update.isPending}
							onupdate={(body) => update.mutateAsync({ id: deal.data.id, body })}
						/>
					{/key}
				</section>
				<DealTimeline deal={deal.data} bind:locked />
			</div>
		{/if}
	</div>
</Modal>
