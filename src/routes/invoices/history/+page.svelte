<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { invoiceHistoryService } from '#lib/services/index.ts';
	import type { InvoiceHistory } from '#lib/types/index.ts';

	const columns: Column<InvoiceHistory>[] = [
		{ key: 'invoiceNo', label: 'Invoice ID' },
		{ key: 'customer', label: 'Customer Name' },
		{ key: 'action', label: 'Action Taken' },
		{ key: 'performedBy', label: 'Performed By' },
		{ key: 'date', label: 'Date' },
		{ key: 'amount', label: 'Amount', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Invoice History · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.invoices}
	name="invoice-history"
	service={invoiceHistoryService}
	{columns}
	addLabel="Add History"
	formTitle="Add New Invoice History"
	fields={FORMS.invoiceHistory}
/>
