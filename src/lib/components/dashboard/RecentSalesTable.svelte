<script lang="ts">
	import { dashboardService } from '#lib/services/index.ts';
	import type { SaleInvoiceRow } from '#lib/types/index.ts';
	import ResourceTable from '../tables/ResourceTable.svelte';
	import type { Column } from '../tables/types';
	import Panel from '../ui/card/Panel.svelte';

	const columns: Column<SaleInvoiceRow>[] = [
		{ key: 'orderId', label: 'Order ID' },
		{ key: 'invoiceId', label: 'Invoice ID' },
		{ key: 'customer', label: 'Customer Name' },
		{ key: 'business', label: 'Business' },
		{ key: 'date', label: 'Date' },
		{ key: 'total', label: 'Total', format: 'money', minWidth: 140 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<Panel title="Recent Sales & Invoices">
	<ResourceTable
		name="recent-sales"
		caption="Recent sales and invoices"
		service={dashboardService.recentSales}
		{columns}
		rowHref={(r) => `/sales/orders/so${r.id.replace('rs', '')}`}
	/>
</Panel>
