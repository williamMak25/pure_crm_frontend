<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { paymentService } from '#lib/services/index.ts';
	import type { Payment } from '#lib/types/index.ts';

	const columns: Column<Payment>[] = [
		{ key: 'paymentNo', label: 'Payment ID' },
		{ key: 'invoiceNo', label: 'Invoice ID' },
		{ key: 'customer', label: 'Customer Name' },
		{ key: 'method', label: 'Payment Method' },
		{ key: 'date', label: 'Payment Date' },
		{ key: 'amount', label: 'Amount', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Payments · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.invoices}
	name="payments"
	service={paymentService}
	{columns}
	addLabel="Add Payment"
	formTitle="Add New Payments"
	fields={FORMS.payment}
/>
