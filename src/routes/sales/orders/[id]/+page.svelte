<script lang="ts">
	import { page } from '$app/state';
	import FormDrawer from '#lib/components/forms/FormDrawer.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import InfoSection from '#lib/components/sales/InfoSection.svelte';
	import DataTable from '#lib/components/tables/DataTable.svelte';
	import StatusBadge from '#lib/components/ui/badge/StatusBadge.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import { FORMS } from '#lib/constants/forms.ts';
	import { createOrderDetailQuery } from '#lib/queries/modules.ts';
	import { createUpdateMutation } from '#lib/queries/resource.ts';
	import { salesOrderService } from '#lib/services/index.ts';
	import { formatMoney } from '#lib/utils/format.ts';
	import type { FormValues } from '#lib/utils/validation.ts';

	const id = $derived(page.params.id ?? '');
	const order = createOrderDetailQuery(() => id);
	const update = createUpdateMutation('sales-orders', salesOrderService, { successMessage: 'Order updated' });
	let editOpen = $state(false);

	const lines = $derived(
		(order.data?.items ?? []).map((l, i) => ({ id: String(i), ...l }))
	);
	const initial: FormValues = $derived(
		order.data
			? {
					customer: order.data.customer.name,
					phone: order.data.customer.phone,
					email: order.data.customer.email,
					customerType: order.data.customer.type,
					business: order.data.business,
					product: order.data.items[0]?.product ?? '',
					quantity: String(order.data.items[0]?.quantity ?? ''),
					unitPrice: String(order.data.items[0]?.unitPrice ?? ''),
					paymentMethod: order.data.payment.method
				}
			: ({} as FormValues)
	);
</script>

<svelte:head><title>{order.data?.orderNo ?? 'Order'} · Order Details · PURE Education ERP</title></svelte:head>

<div class="flex flex-col gap-4">
	<div class="flex items-start gap-2">
		<a href="/sales/orders" class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md hover:bg-neutral-200" aria-label="Back to sales orders">
			<Icon name="chevronLeft" size={22} />
		</a>
		<div class="flex-1">
			<PageHeader
				title="Order Details"
				description="Manage and review order information, customer details, payment status, and order activity in one place."
			>
				{#snippet actions()}
					<Button size="lg" variant="outline-brand" icon="edit" disabled={!order.data} onclick={() => (editOpen = true)}>Edit Order</Button>
				{/snippet}
			</PageHeader>
		</div>
	</div>

	<div class="flex flex-col gap-8 rounded-xl bg-white p-4 sm:p-5">
		{#if order.isPending}
			{#each Array(3) as _, i (i)}
				<div class="flex flex-col gap-3" aria-hidden="true">
					<Skeleton width="180px" height="20px" />
					{#each Array(4) as _, j (j)}<div class="grid grid-cols-2 gap-3"><Skeleton width="40%" height="14px" /><Skeleton width="50%" height="14px" /></div>{/each}
				</div>
			{/each}
		{:else if order.isError}
			<ErrorState error={order.error} onretry={() => order.refetch()} />
		{:else}
			{@const o = order.data}
			<div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
				<InfoSection
					title="Order Information"
					rows={[
						{ label: 'Order ID', value: o.orderNo },
						{ label: 'Order Date', value: o.orderDate },
						{ label: 'Business', value: o.business },
						{ label: 'Created By', value: o.createdBy }
					]}
				/>
				<InfoSection
					title="Customer Information"
					rows={[
						{ label: 'Customer Name', value: o.customer.name },
						{ label: 'Phone Number', value: o.customer.phone },
						{ label: 'Email Address', value: o.customer.email },
						{ label: 'Customer Type', value: o.customer.type }
					]}
				/>
			</div>

			<InfoSection title="Order Item">
				<DataTable
					caption="Order items"
					rows={lines}
					columns={[
						{ key: 'product', label: 'Product' },
						{ key: 'quantity', label: 'Quality' },
						{ key: 'unitPrice', label: 'Unit Price', format: 'money' },
						{ key: 'amount', label: 'Amount', format: 'money' }
					]}
				/>
			</InfoSection>

			{#snippet paymentStatus()}<StatusBadge status={o.payment.status} />{/snippet}
			<InfoSection
				title="Payment Information"
				rows={[
					{ label: 'Payment Status', value: paymentStatus },
					{ label: 'Payment Method', value: o.payment.method },
					{ label: 'Paid Amount', value: formatMoney(o.payment.paidAmount) },
					{ label: 'Payment Date', value: o.payment.date },
					{ label: 'Transaction ID', value: o.payment.transactionId },
					{ label: 'Notes', value: o.payment.notes }
				]}
			/>
		{/if}
	</div>
</div>

{#key initial}
	<FormDrawer
		bind:open={editOpen}
		title="Edit Order"
		fields={FORMS.order}
		{initial}
		submitLabel="Update"
		pending={update.isPending}
		onsubmit={(body) => update.mutateAsync({ id, body })}
		onclose={() => (editOpen = false)}
	/>
{/key}
