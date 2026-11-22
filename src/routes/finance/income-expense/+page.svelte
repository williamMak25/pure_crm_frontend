<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { incomeExpenseService } from '#lib/services/index.ts';
	import type { IncomeExpense } from '#lib/types/index.ts';

	const columns: Column<IncomeExpense>[] = [
		{ key: 'refNo', label: 'Reference' },
		{ key: 'type', label: 'Type', format: 'status' },
		{ key: 'category', label: 'Category' },
		{ key: 'business', label: 'Business' },
		{ key: 'date', label: 'Date' },
		{ key: 'amount', label: 'Amount', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Income &amp; Expense · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.finance}
	name="income-expenses"
	service={incomeExpenseService}
	{columns}
	addLabel="Add Income &amp; Expense"
	formTitle="Add New Income &amp; Expense"
	fields={FORMS.incomeExpense}
/>
