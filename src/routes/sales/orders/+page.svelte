<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { salesOrderService } from '#lib/services/index.ts';
	import type { SalesOrder } from '#lib/types/index.ts';

	const columns: Column<SalesOrder>[] = [
		{ key: 'orderNo', label: 'Order ID' },
		{ key: 'customer', label: 'Customer Name' },
		{ key: 'business', label: 'Business' },
		{ key: 'date', label: 'Order Date' },
		{ key: 'paymentMethod', label: 'Payment Method' },
		{ key: 'total', label: 'Total', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Sales Orders · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.sales}
	name="sales-orders"
	service={salesOrderService}
	{columns}
	addLabel="Add New Order"
	formTitle="Add New Order"
	fields={FORMS.order}
	rowHref={(r) => `/sales/orders/${r.id}`}
/>
