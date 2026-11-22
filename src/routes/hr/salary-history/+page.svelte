<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { salaryHistoryService } from '#lib/services/index.ts';
	import type { SalaryChange } from '#lib/types/index.ts';

	const columns: Column<SalaryChange>[] = [
		{ key: 'employeeNo', label: 'Employee ID' },
		{ key: 'employee', label: 'Employee Name' },
		{ key: 'business', label: 'Business' },
		{ key: 'department', label: 'Department' },
		{ key: 'previousSalary', label: 'Previous Salary', format: 'money', minWidth: 140 },
		{ key: 'newSalary', label: 'New Salary', format: 'money', minWidth: 140 },
		{ key: 'effectiveDate', label: 'Effective Date', format: 'date', minWidth: 130 },
		{ key: 'reason', label: 'Reason', minWidth: 140 },
		{ key: 'approvedBy', label: 'Approved By' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Salary History · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.hr}
	name="salary-history"
	service={salaryHistoryService}
	{columns}
	addLabel="Add Salary Change"
	formTitle="Add New Salary Change"
	fields={FORMS.salaryChange}
/>
