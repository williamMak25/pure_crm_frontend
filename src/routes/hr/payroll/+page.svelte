<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { payrollService } from '#lib/services/index.ts';
	import type { PayrollRecord } from '#lib/types/index.ts';

	const columns: Column<PayrollRecord>[] = [
		{ key: 'employeeNo', label: 'Employee ID' },
		{ key: 'business', label: 'Business' },
		{ key: 'department', label: 'Department' },
		{ key: 'basic', label: 'Basic Salary', format: 'money', minWidth: 130 },
		{ key: 'allowance', label: 'Allowances', format: 'money', minWidth: 130 },
		{ key: 'overtime', label: 'Overtime', format: 'money', minWidth: 130 },
		{ key: 'bonus', label: 'Bonus', format: 'money', minWidth: 130 },
		{ key: 'deduction', label: 'Deductions', format: 'money', minWidth: 130 },
		{ key: 'netPay', label: 'Net Salary', format: 'money', minWidth: 130 },
		{ key: 'paymentDate', label: 'Payment Date', format: 'date', minWidth: 130 },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Payroll · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.hr}
	name="payroll"
	service={payrollService}
	{columns}
	addLabel="Run Payroll"
	formTitle="Add New Payroll"
	fields={FORMS.payroll}
/>
