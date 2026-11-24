<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { quotationService } from '#lib/services/index.ts';
	import type { Quotation } from '#lib/types/index.ts';

	const columns: Column<Quotation>[] = [
		{ key: 'quotationNo', label: 'Quotation ID' },
		{ key: 'customer', label: 'Customer Name' },
		{ key: 'business', label: 'Business' },
		{ key: 'date', label: 'Date' },
		{ key: 'validUntil', label: 'Valid Until' },
		{ key: 'total', label: 'Total', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Quotations · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.sales}
	name="quotations"
	rowHref={(r) => `/sales/quotations/${r.id}`}
	service={quotationService}
	{columns}
	addLabel="Add Quotation"
	formTitle="Add New Quotation"
	fields={FORMS.quotation}
/>
