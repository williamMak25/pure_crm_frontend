<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { productService } from '#lib/services/index.ts';
	import type { Product } from '#lib/types/index.ts';

	const columns: Column<Product>[] = [
		{ key: 'code', label: 'Item Code' },
		{ key: 'name', label: 'Item Name' },
		{ key: 'category', label: 'Category' },
		{ key: 'business', label: 'Business' },
		{ key: 'unitPrice', label: 'Unit Price', format: 'money', minWidth: 150 },
		{ key: 'stock', label: 'Stock', format: 'number' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Items · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.sales}
	name="products"
	service={productService}
	{columns}
	addLabel="Add Item"
	formTitle="Add New Item"
	fields={FORMS.item}
/>
