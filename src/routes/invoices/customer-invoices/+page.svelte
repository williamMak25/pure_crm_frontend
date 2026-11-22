<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { customerInvoiceService } from '#lib/services/index.ts';
	import type { CustomerInvoice } from '#lib/types/index.ts';

	const columns: Column<CustomerInvoice>[] = [
		{ key: 'invoiceNo', label: 'Invoice ID' },
		{ key: 'customer', label: 'Customer Name' },
		{ key: 'business', label: 'Business' },
		{ key: 'issueDate', label: 'Invoice Date' },
		{ key: 'dueDate', label: 'Due Date' },
		{ key: 'amount', label: 'Amount', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Customer Invoices · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.invoices}
	name="customer-invoices"
	service={customerInvoiceService}
	{columns}
	addLabel="Add Invoice"
	formTitle="Add New Customer Invoice"
	fields={FORMS.customerInvoice}
/>
