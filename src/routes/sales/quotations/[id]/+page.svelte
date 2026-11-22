<script lang="ts">
	import { page } from '$app/state';
	import FormDrawer from '#lib/components/forms/FormDrawer.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import { FORMS } from '#lib/constants/forms.ts';
	import { STATUS_TONE } from '#lib/constants/status.ts';
	import { createQuotationDetailQuery } from '#lib/queries/modules.ts';
	import { createUpdateMutation } from '#lib/queries/resource.ts';
	import { quotationService } from '#lib/services/index.ts';
	import type { Status } from '#lib/types/index.ts';
	import type { FormValues } from '#lib/utils/validation.ts';

	const id = $derived(page.params.id ?? '');
	const quotation = createQuotationDetailQuery(() => id);
	const update = createUpdateMutation('quotations', quotationService, { successMessage: 'Quotation updated' });
	let editOpen = $state(false);

	// Figma shows the status as coloured text, not a badge.
	const STATUS_TEXT = { green: 'text-green-500', red: 'text-brand-500', blue: 'text-blue-500', amber: 'text-amber-500', neutral: 'text-neutral-600' };
	const statusClass = (s: Status) => STATUS_TEXT[STATUS_TONE[s] ?? 'neutral'];

	const initial: FormValues = $derived(
		quotation.data
			? {
					customer: quotation.data.customer.name,
					business: quotation.data.business,
					product: quotation.data.items[0]?.product ?? '',
					quantity: String(quotation.data.items[0]?.quantity ?? ''),
					unitPrice: String(quotation.data.items[0]?.unitPrice ?? ''),
					status: quotation.data.status,
					notes: quotation.data.notes
				}
			: ({} as FormValues)
	);
</script>

<svelte:head><title>{quotation.data?.quotationNo ?? 'Quotation'} · Quotation Details · PURE Education ERP</title></svelte:head>

{#snippet field(label: string, value: string, valueClass = 'text-neutral-800')}
	<div class="flex flex-col gap-1.5">
		<dt class="text-sm text-neutral-500">{label}</dt>
		<dd class="text-sm {valueClass}">{value || '—'}</dd>
	</div>
{/snippet}

<div class="flex flex-col gap-4">
	<div class="flex items-start gap-2">
		<a href="/sales/quotations" class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md hover:bg-neutral-200" aria-label="Back to quotations">
			<Icon name="chevronLeft" size={22} />
		</a>
		<div class="flex-1">
			<PageHeader title="Quotation Details" description="Manage and review quotations information and customer details in one place.">
				{#snippet actions()}
					<Button size="lg" icon="edit" disabled={!quotation.data} onclick={() => (editOpen = true)}>Edit quotation</Button>
				{/snippet}
			</PageHeader>
		</div>
	</div>

	<div class="flex flex-col gap-5 rounded-xl bg-white p-4 sm:p-5">
		{#if quotation.isPending}
			{#each Array(2) as _, i (i)}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden="true">
					{#each Array(4) as _, j (j)}<div class="flex flex-col gap-2"><Skeleton width="30%" height="14px" /><Skeleton width="45%" height="14px" /></div>{/each}
				</div>
			{/each}
		{:else if quotation.isError}
			<ErrorState error={quotation.error} onretry={() => quotation.refetch()} />
		{:else}
			{@const q = quotation.data}
			<section class="flex flex-col gap-4">
				<h2 class="text-md font-medium text-neutral-800">Quotation Information</h2>
				<dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
					{@render field('Quotation ID', q.quotationNo)}
					{@render field('Quotation Date', q.quotationDate)}
					{@render field('Quotation Status', q.status, statusClass(q.status))}
					{@render field('Expiry Date', q.expiryDate)}
					{@render field('Business', q.business)}
				</dl>
			</section>
			<hr class="border-neutral-200" />
			<section class="flex flex-col gap-4">
				<h2 class="text-md font-medium text-neutral-800">Customer Information</h2>
				<dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
					{@render field('Customer Name', q.customer.name)}
					{@render field('Phone Number', q.customer.phone)}
					{@render field('Email Address', q.customer.email)}
					{@render field('Customer Type', q.customer.type)}
				</dl>
			</section>
		{/if}
	</div>
</div>

{#key initial}
	<FormDrawer
		bind:open={editOpen}
		title="Edit Quotation"
		fields={FORMS.quotation.filter((f) => f.name !== 'date' && f.name !== 'validUntil')}
		{initial}
		submitLabel="Update"
		pending={update.isPending}
		onsubmit={(body) => update.mutateAsync({ id, body })}
		onclose={() => (editOpen = false)}
	/>
{/key}
