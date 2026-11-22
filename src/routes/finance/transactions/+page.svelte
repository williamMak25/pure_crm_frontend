<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { transactionService } from '#lib/services/index.ts';
	import type { Transaction } from '#lib/types/index.ts';

	const columns: Column<Transaction>[] = [
		{ key: 'transactionNo', label: 'Transaction ID' },
		{ key: 'account', label: 'Account' },
		{ key: 'type', label: 'Type', format: 'status' },
		{ key: 'method', label: 'Method' },
		{ key: 'date', label: 'Date' },
		{ key: 'amount', label: 'Amount', format: 'money', minWidth: 150 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Transactions · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.finance}
	name="transactions"
	service={transactionService}
	{columns}
	addLabel="Add Transaction"
	formTitle="Add New Transaction"
	fields={FORMS.transaction}
/>
