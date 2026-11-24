<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { employeeService } from '#lib/services/index.ts';
	import type { Employee } from '#lib/types/index.ts';

	const columns: Column<Employee>[] = [
		{ key: 'employeeNo', label: 'Employee ID' },
		{ key: 'name', label: 'Name' },
		{ key: 'department', label: 'Department' },
		{ key: 'position', label: 'Position' },
		{ key: 'business', label: 'Business' },
		{ key: 'joinDate', label: 'Join Date' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Employees · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.hr}
	name="employees"
	service={employeeService}
	{columns}
	addLabel="Add Employee"
	formTitle="Add New Employee"
	fields={FORMS.employee}
/>
